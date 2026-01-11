# Production Deployment Guide

## Deployment to /var/www/html/down

### Prerequisites
- Node.js 18+
- npm
- Nginx or Apache
- PM2 (for process management)
- sudo access

### Automatic Deployment

```bash
cd /home/app_gui/Documents/VSCode/my_download_page
chmod +x deploy.sh
sudo ./deploy.sh
```

### Manual Deployment

#### 1. Build Production
```bash
cd /home/app_gui/Documents/VSCode/my_download_page
npm run build
```

#### 2. Create Directory
```bash
sudo mkdir -p /var/www/html/down
sudo chown -R www-data:www-data /var/www/html/down
```

#### 3. Copy Build
```bash
sudo cp -r .next /var/www/html/down/
sudo cp -r public /var/www/html/down/
sudo cp package.json package-lock.json /var/www/html/down/
sudo cp -r node_modules /var/www/html/down/ 2>/dev/null || (cd /var/www/html/down && npm install --production)
```

#### 4. Setup PM2
```bash
cd /var/www/html/down
sudo npm install -g pm2
sudo pm2 start npm --name "download-app" -- start
sudo pm2 startup
sudo pm2 save
```

#### 5. Configure Nginx
Add to `/etc/nginx/sites-available/default` or create new site:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location /down/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /down/_next/static/ {
        proxy_pass http://localhost:3000/_next/static/;
        proxy_cache_valid 30d;
        access_log off;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Access Points

- **Production**: http://your_domain.com/down/
- **Direct PM2**: http://localhost:3000/
- **Admin Panel**: http://your_domain.com/down/ → Settings (⚙️)
- **Admin Password**: `admin123` (CHANGE IN PRODUCTION!)

### Monitoring

```bash
# Watch PM2 logs
pm2 logs download-app

# Monitor status
pm2 monitor

# View all processes
pm2 list
```

### Troubleshooting

#### Port already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

#### Permission denied
```bash
sudo chown -R www-data:www-data /var/www/html/down
sudo chmod -R 755 /var/www/html/down
```

#### Nginx not proxying
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
curl http://localhost:3000  # Test direct access
```

### Backup

```bash
# Backup database
cp /var/www/html/down/data/app.db /var/www/html/down/data/app.db.backup

# Backup logs
tar -czf /var/backups/download-app-backup.tar.gz /var/www/html/down/
```

### Updates

```bash
cd /var/www/html/down
git pull origin main
npm install
npm run build
pm2 restart download-app
```

### Security Recommendations

1. **Change Admin Password** in `src/components/AdminPanel.tsx`
2. **Use HTTPS** in production
3. **Setup Firewall** rules
4. **Enable CORS** if needed
5. **Rate Limiting** for downloads
6. **Database Backups** scheduled

### SSL/TLS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your_domain.com
# Update nginx.conf with SSL certificates
```

### Environment Variables

Create `.env.production.local` if needed:
```
# Future environment variables
```

## Support

For issues or questions, refer to the main README.md or GitHub issues.
