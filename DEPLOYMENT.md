# Production Deployment - Debian 13 + Apache (No Exposed Port)

**Port Used**: 2314 (internal, not exposed to public)  
**Web Access**: http://your-domain.com/down/

## Quick Start (Automated)

```bash
# 1. On your Debian 13 server
cd /var/www/html
sudo git clone https://github.com/pato3691/download_page.git download_page
cd download_page

# 2. Run setup script
sudo chmod +x setup-debian.sh
sudo ./setup-debian.sh
```

✅ **Done!** Access at: **http://your-domain.com/down/**

---

## Manual Setup

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs npm git apache2
```

### 2. Enable Apache Modules

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl restart apache2
```

### 3. Clone Repository

```bash
cd /var/www/html
git clone https://github.com/pato3691/download_page.git download_page
cd download_page
sudo chown -R $USER:$USER .
```

### 4. Install & Build

```bash
npm install
npm run build
```

### 5. Start with PM2

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER
```

### 6. Configure Apache

```bash
sudo nano /etc/apache2/sites-available/download.conf
```

Paste:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/html

    # Proxy to port 2314 (internal)
    <Location /down/>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:2314/
        ProxyPassReverse http://127.0.0.1:2314/
        Header set X-Real-IP %{REMOTE_ADDR}s
        Header set X-Forwarded-For %{HTTP:X-Forwarded-For}e
        Header set X-Forwarded-Proto "http"
    </Location>

    # Cache static files
    <LocationMatch "^/down/_next/static/">
        Header set Cache-Control "public, max-age=31536000, immutable"
        ProxyPass http://127.0.0.1:2314/_next/static/
    </LocationMatch>

    ErrorLog ${APACHE_LOG_DIR}/download_error.log
    CustomLog ${APACHE_LOG_DIR}/download_access.log combined
</VirtualHost>
```

Enable:

```bash
sudo a2ensite download.conf
sudo a2dissite 000-default.conf 2>/dev/null || true
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 7. Initialize Database

```bash
curl http://127.0.0.1:2314/api/init-db
```

---

## Access

- **User Access**: http://your-domain.com/down/
- **Admin**: Click Settings (⚙️) → Password: `admin123`
- **Internal**: http://127.0.0.1:2314/

---

## Configuration

### Change Admin Password ⚠️

```bash
nano src/components/AdminPanel.tsx
```

Find and change:
```typescript
if (password === 'admin123') {
```

Rebuild:
```bash
npm run build
pm2 restart download-app
```

### SMTP Setup

1. Go to http://your-domain.com/down/
2. Click Settings (⚙️)
3. SMTP tab → Fill in details
4. Save

---

## Management

### Logs

```bash
pm2 logs download-app
tail -f /var/log/apache2/download_error.log
```

### Restart

```bash
pm2 restart download-app
sudo systemctl reload apache2
```

### Stop/Start

```bash
pm2 stop download-app
pm2 start ecosystem.config.js
```

### Update Code

```bash
cd /var/www/html/download_page
git pull
npm install
npm run build
pm2 restart download-app
```

---

## Troubleshooting

### Port 2314 in Use

```bash
sudo lsof -i :2314
sudo kill -9 <PID>
pm2 restart download-app
```

### Apache Not Working

```bash
sudo apache2ctl configtest
sudo a2enmod proxy proxy_http
sudo systemctl reload apache2
```

### Database Error

```bash
curl http://127.0.0.1:2314/api/init-db
```

### Database Backup

```bash
cp /var/www/html/download_page/data/app.db /var/www/html/download_page/data/app.db.backup
```

---

## SSL/TLS (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

---

## Quick Commands

```bash
# Status
pm2 list

# Logs
pm2 logs download-app

# Restart all
pm2 restart download-app && sudo systemctl reload apache2

# Update & rebuild
cd /var/www/html/download_page && git pull && npm install && npm run build && pm2 restart download-app

# Port check
sudo lsof -i :2314

# Backup
cp /var/www/html/download_page/data/app.db /var/www/html/download_page/data/app.db.backup.$(date +%Y%m%d)
```

---

## Security Checklist

- [ ] Changed admin password
- [ ] Configured SMTP
- [ ] SSL/HTTPS enabled
- [ ] Firewall enabled
- [ ] Database backups scheduled
- [ ] Logs monitored

---

**Tested**: Debian 13 + Apache 2.4 + Node.js 20  
**Internal Port**: 2314  
**Web Path**: /down/
