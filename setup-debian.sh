#!/bin/bash

# Setup script for /var/www/html/download_page on Debian 13 with Apache

set -e

DEPLOY_DIR="/var/www/html/download_page"
INTERNAL_PORT="2314"
WEB_PATH="/down"

echo "=========================================="
echo "Download Page Setup - Debian 13 + Apache"
echo "=========================================="
echo "Directory: $DEPLOY_DIR"
echo "Internal Port: $INTERNAL_PORT"
echo "Web Path: http://your-domain.com${WEB_PATH}/"
echo ""

# 1. Update and install dependencies
echo "[1/8] Installing dependencies..."
sudo apt update
sudo apt install -y nodejs npm git apache2 curl

# 2. Enable Apache modules
echo "[2/8] Enabling Apache modules..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate

# 3. Create directory if not exists
echo "[3/8] Setting up directory..."
if [ ! -d "$DEPLOY_DIR" ]; then
    sudo mkdir -p "$DEPLOY_DIR"
fi
sudo chown -R $USER:$USER "$DEPLOY_DIR"

# 4. Clone or pull repository
echo "[4/8] Cloning repository..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
else
    git clone https://github.com/pato3691/download_page.git "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 5. Install dependencies
echo "[5/8] Installing npm packages..."
npm install

# 6. Build application
echo "[6/8] Building application..."
npm run build

# 7. Create PM2 ecosystem file
echo "[7/8] Setting up PM2..."
cat > "$DEPLOY_DIR/ecosystem.config.js" << EOFPM2
module.exports = {
  apps: [{
    name: 'download-app',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: ${INTERNAL_PORT},
      HOSTNAME: '127.0.0.1'
    }
  }]
};
EOFPM2

# Start with PM2
sudo npm install -g pm2
pm2 delete download-app 2>/dev/null || true
pm2 start "$DEPLOY_DIR/ecosystem.config.js"
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

# 8. Configure Apache
echo "[8/8] Configuring Apache..."

# Create Apache config
sudo tee /etc/apache2/sites-available/download.conf > /dev/null << EOFAPACHE
<VirtualHost *:80>
    ServerName _
    DocumentRoot /var/www/html

    # Proxy settings
    <Location ${WEB_PATH}/>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:${INTERNAL_PORT}/
        ProxyPassReverse http://127.0.0.1:${INTERNAL_PORT}/
        
        # Headers
        Header set X-Real-IP %{REMOTE_ADDR}s
        Header set X-Forwarded-For %{HTTP:X-Forwarded-For}e
        Header set X-Forwarded-Proto "http"
    </Location>

    # Cache for static files
    <LocationMatch "^${WEB_PATH}/_next/static/">
        Header set Cache-Control "public, max-age=31536000, immutable"
        ProxyPass http://127.0.0.1:${INTERNAL_PORT}/_next/static/
    </LocationMatch>

    # Logs
    ErrorLog \${APACHE_LOG_DIR}/download_error.log
    CustomLog \${APACHE_LOG_DIR}/download_access.log combined
</VirtualHost>
EOFAPACHE

# Enable site
sudo a2ensite download.conf 2>/dev/null || true
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Initialize database
echo ""
echo "=========================================="
echo "Initializing database..."
curl http://127.0.0.1:${INTERNAL_PORT}/api/init-db

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Access your application at:"
echo "  🌐 http://your-domain.com${WEB_PATH}/"
echo ""
echo "Admin Panel:"
echo "  ⚙️  Click Settings (⚙️) icon"
echo "  🔑 Password: admin123"
echo ""
echo "Logs:"
echo "  pm2 logs download-app"
echo "  tail -f /var/log/apache2/download_error.log"
echo ""
echo "Management:"
echo "  pm2 restart download-app"
echo "  pm2 stop download-app"
echo "  sudo systemctl reload apache2"
echo ""
echo "Update:"
echo "  cd $DEPLOY_DIR && git pull && npm install && npm run build && pm2 restart download-app"
echo ""
echo "=========================================="
