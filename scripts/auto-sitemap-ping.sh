#!/bin/bash
# Auto Sitemap Ping: Notifies Google and Bing when new content is available
# Runs daily via cron

LOG="/var/log/utilsnow-sitemap-ping.log"
TODAY=$(date +%Y-%m-%d)
SITEMAP="https://utilsnow.com/sitemap.xml"

# Ping Google
GOOGLE_RESP=$(curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/ping?sitemap=$SITEMAP")

# Ping Bing (via IndexNow protocol, sitemap submission)
BING_RESP=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bing.com/ping?sitemap=$SITEMAP")

echo "[$TODAY] Google ping: HTTP $GOOGLE_RESP | Bing ping: HTTP $BING_RESP" >> $LOG
