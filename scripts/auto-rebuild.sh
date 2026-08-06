#!/bin/bash
# Auto Rebuild: Rebuilds and redeploys the app weekly to pick up new blog posts in sitemap
# Runs every Sunday at 3 AM via cron

LOG="/var/log/megautils-rebuild.log"
TODAY=$(date +%Y-%m-%d)
DIR="/root/megautils"

echo "[$TODAY] Starting weekly rebuild..." >> $LOG

cd $DIR

# Build
npm run build >> $LOG 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  echo "[$TODAY] Build successful. Restarting PM2..." >> $LOG
  pm2 restart megautils >> $LOG 2>&1
  sleep 5
  
  # Verify site is up
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://megautils.xyz)
  echo "[$TODAY] Site status after restart: HTTP $STATUS" >> $LOG
  
  # Submit new URLs to IndexNow
  bash $DIR/scripts/auto-indexnow.sh
  
  # Ping search engines
  bash $DIR/scripts/auto-sitemap-ping.sh
else
  echo "[$TODAY] BUILD FAILED (exit $BUILD_EXIT). NOT restarting." >> $LOG
fi

echo "[$TODAY] Weekly rebuild complete." >> $LOG
