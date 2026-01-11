# Production Deployment Guide - Debian 13 + Apache

## Deployment to /var/www/html/down

### Prerequisites
- Debian 13
- Node.js 18+ (via NodeSource or nvm)
- npm
- Apache 2.4+
- PM2 (process manager)
- sudo access

### Installation Steps

#### 1. Update System
```bash
sudo apt update
sudo apt upgrade -y
```

#### 2. Install Node.js (Debian 13)
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Install Apache and Required Modules
```bash
sudo apt install -y apache2
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo systemctl enable apache2
```

#### 4. Clone Repository
```bash
cd /var/www/html
sudo git clone https://github.com/pato3691/download_page.git down
sudo chown -R $USER:$USER down
cd down
```

#### 5. Install Dependencies and Build
```bash
cd /var/www/html/down
npm install
npm run build
```

#### 6. Install PM2 Globally
```bash
sudo npm install -g pm2
```

#### 7. Start Application with PM2
```bash
cd /var/www/html/down
pm2 start npm --name "download-app" -- start
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

Verify PM2:
```bash
pm2 list
pm2 logs download-app
```

#### 8. Configure Apache VirtualHost

Copy the configuration:
```bash
sudo cp /var/www/html/down/apache-vhost.conf /etc/apache2/sites-available/download.conf
```

Edit `/etc/apache2/sites-available/download.conf`:
```bash
sudo nano /etc/apache2/sites-available/download.conf
```

Update:
- `ServerName your_domain.com` - your actual domain
- `ServerAlias www.your_domain.com` - if needed

Enable the site:
```bash
sudo a2ensite download.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
```

Should output: `Syntax OK`

Reload Apache:
```bash
sudo systemctl reload apache2
```

#### 9. Initialize Database
```bash
curl http://localhost:3000/api/init-db
```

### Access Application

- **Via Apache**: `http://your_domain.com/down/`
- **Direct PM2**: `http://localhost:3000/`
- **Admin Panel**: Click Settings (⚙️) icon
- **Admin Password**: `admin123`

### Configuration

#### Change Admin Password
Edit `/var/www/html/down/src/components/AdminPanel.tsx`:

Find line with `if (password === 'admin123')` and change to your secure password.

Then rebuild:
```bash
cd /var/www/html/down
npm run build
pm2 restart download-app
```

#### SMTP Configuration
1. Open admin panel at `http://your_domain.com/down/`
2. Click Settings (⚙️)
3. Enter admin password
4. Go to SMTP tab
5. Fill in:
   - **Host**: `smtp.gmail.com` (for Gmail)
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Email**: your email address
   - **Password**: your email password or app password
   - **From Email**: sender email

### Monitoring and Management

#### Check Application Status
```bash
pm2 list
pm2 status
```

#### View Logs
```bash
pm2 logs download-app
pm2 logs download-app --err
```

#### Restart Application
```bash
pm2 restart download-app
pm2 restart download-app --wait-ready --listen-timeout 3000
```

#### Stop/Start
```bash
pm2 stop download-app
pm2 start download-app
```

#### Check Apache Status
```bash
sudo systemctl status apache2
sudo apache2ctl configtest
```

#### View Apache Logs
```bash
sudo tail -f /var/log/apache2/download_page_access.log
sudo tail -f /var/log/apache2/download_page_error.log
```

### SSL/TLS with Certbot

#### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-apache
```

#### Get Certificate
```bash
sudo certbot --apache -d your_domain.com -d www.your_domain.com
```

Certbot will automatically update your Apache configuration.

#### Auto-renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Check renewal:
```bash
sudo certbot renew --dry-run
```

### Updating Application

```bash
cd /var/www/html/down
git pull origin main
npm install
npm run build
pm2 restart download-app
```

### Database Backup

```bash
# Backup database
cp /var/www/html/down/data/app.db /var/www/html/down/data/app.db.backup.$(date +%Y%m%d)

# Scheduled backup (cron)
0 2 * * * cp /var/www/html/down/data/app.db /var/www/html/down/data/backups/app.db.$(date +\%Y\%m\%d)
```

### Troubleshooting

#### Port 3000 Already in Use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart download-app
```

#### Apache Not Proxying
```bash
# Test Apache config
sudo apache2ctl configtest

# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http

# Reload
sudo systemctl reload apache2
```

#### Database Not Found
```bash
curl http://localhost:3000/api/init-db
# or
pm2 stop download-app
rm -rf /var/www/html/down/data/app.db
pm2 start download-app
curl http://localhost:3000/api/init-db
```

#### Permissions Issues
```bash
sudo chown -R www-data:www-data /var/www/html/down
sudo chmod -R 755 /var/www/html/down
sudo chmod -R 775 /var/www/html/down/data
sudo chmod -R 775 /var/www/html/down/public/uploads
```

#### Node Version Issues
```bash
node --version  # Should be 18+
npm --version
which node
which npm
```

### Performance Optimization

#### Enable Apache Modules
```bash
sudo a2enmod cache
sudo a2enmod cache_disk
sudo a2enmod expires
```

#### Increase Max Connections
Edit `/etc/apache2/mods-enabled/mpm_prefork.conf`:
```apache
<IfModule mpm_prefork_module>
    StartServers             10
    MinSpareServers          10
    MaxSpareServers          20
    MaxRequestWorkers        256
    MaxConnectionsPerChild   0
</IfModule>
```

Reload:
```bash
sudo systemctl reload apache2
```

### Security Recommendations

1. **Change Admin Password** ⚠️ IMPORTANT
2. **Enable HTTPS** with Certbot
3. **Setup Firewall**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular Backups**
5. **Monitor Logs**
6. **Update Dependencies**:
   ```bash
   npm outdated
   npm update
   ```

### Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### Final Checklist

- [ ] Node.js installed (v18+)
- [ ] Apache with proxy modules enabled
- [ ] Git repository cloned to /var/www/html/down
- [ ] Dependencies installed (`npm install`)
- [ ] Build created (`npm run build`)
- [ ] PM2 started and running
- [ ] Apache VirtualHost configured
- [ ] Database initialized
- [ ] SMTP configured in admin panel
- [ ] Admin password changed
- [ ] SSL certificate installed (optional but recommended)
- [ ] Firewall configured
- [ ] Backups scheduled

### Support

For issues:
1. Check PM2 logs: `pm2 logs`
2. Check Apache logs: `/var/log/apache2/`
3. Check application log: `pm2 logs download-app`
4. Refer to GitHub: https://github.com/pato3691/download_page

### Quick Commands Reference

```bash
# Start/Stop/Restart
pm2 restart download-app
pm2 stop download-app
pm2 start download-app

# Logs
pm2 logs download-app
tail -f /var/log/apache2/download_page_error.log

# Update
cd /var/www/html/down && git pull && npm install && npm run build && pm2 restart download-app

# Backup
cp /var/www/html/down/data/app.db /var/www/html/down/data/app.db.backup

# Status
pm2 list
apache2ctl status
```
