#!/bin/bash

# Deploy script for /var/www/html/down

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOY_DIR="/var/www/html/down"
PROJECT_DIR="/home/app_gui/Documents/VSCode/my_download_page"

echo -e "${YELLOW}=== Download Page Deployment ===${NC}"

# 1. Build
echo -e "${YELLOW}[1] Building project...${NC}"
cd "$PROJECT_DIR"
npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }

# 2. Create deploy directory
echo -e "${YELLOW}[2] Creating deploy directory...${NC}"
sudo mkdir -p "$DEPLOY_DIR"

# 3. Copy files
echo -e "${YELLOW}[3] Copying files...${NC}"
sudo cp -r "$PROJECT_DIR"/{.next,public,node_modules,package.json,package-lock.json,data} "$DEPLOY_DIR/" 2>/dev/null || true

# 4. Fix permissions
echo -e "${YELLOW}[4] Setting permissions...${NC}"
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

# 5. Start PM2
echo -e "${YELLOW}[5] Starting PM2...${NC}"
cd "$DEPLOY_DIR"
sudo npm install -g pm2
sudo pm2 delete download-app 2>/dev/null || true
sudo pm2 start npm --name "download-app" -- start
sudo pm2 startup
sudo pm2 save

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "Application running at: ${YELLOW}http://localhost:3000${NC}"
