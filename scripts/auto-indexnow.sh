#!/bin/bash
# Auto IndexNow: Submits ALL new/updated URLs from sitemap to IndexNow
# Uses IndexNow batch API (up to 10,000 URLs per request)
# Covers: Bing, Yandex, DuckDuckGo, Naver, Seznam, etc.
# Runs daily via cron
# Also pings Google & Bing sitemaps
#
# Superseded by /opt/automation/auto-index-all.sh (consolidated script)
# Kept for backward compatibility — both can run safely

KEY="dcfb9d8fec340f7ea5f85fdf5924ba8f"
HOST="utilsnow.com"
DB_PASS="megautils_36ed23db45f9cc50"
LOG="/var/log/utilsnow-indexnow.log"
SITEMAP="https://utilsnow.com/sitemap.xml"

TODAY=$(date +%Y-%m-%d)
NOW=$(date '+%Y-%m-%d %H:%M:%S')

echo "" >> $LOG
echo "============================================" >> $LOG
echo "[$NOW] Starting IndexNow submission..." >> $LOG

# -----------------------------------------------------------
# 1. Fetch ALL URLs from sitemap
# -----------------------------------------------------------
ALL_URLS=$(curl -s "$SITEMAP" | grep -oP '(?<=<loc>).*?(?=</loc>)')
TOTAL_COUNT=$(echo "$ALL_URLS" | grep -c .)

if [ -z "$ALL_URLS" ] || [ "$TOTAL_COUNT" -eq 0 ]; then
  echo "[$NOW] ERROR: Could not fetch URLs from sitemap" >> $LOG
  exit 1
fi

echo "[$NOW] Found $TOTAL_COUNT URLs in sitemap" >> $LOG

# -----------------------------------------------------------
# 2. Also get any new blog posts published today from DB
# -----------------------------------------------------------
NEW_BLOG_SLUGS=$(PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -p 5433 -U megautils -d megautils -t -A -c \
  "SELECT slug FROM blog_posts WHERE publish_date = '$TODAY' AND is_published = true;" 2>/dev/null)

if [ -n "$NEW_BLOG_SLUGS" ]; then
  NEW_BLOG_COUNT=$(echo "$NEW_BLOG_SLUGS" | grep -c .)
  echo "[$NOW] Found $NEW_BLOG_COUNT new blog post(s) published today" >> $LOG

  # Add any blog URLs not already in sitemap
  while IFS= read -r slug; do
    [ -z "$slug" ] && continue
    BLOG_URL="https://$HOST/blog/$slug"
    if ! echo "$ALL_URLS" | grep -qF "$BLOG_URL"; then
      ALL_URLS="$ALL_URLS
$BLOG_URL"
      echo "[$NOW] Added new blog URL not yet in sitemap: $BLOG_URL" >> $LOG
    fi
  done <<< "$NEW_BLOG_SLUGS"
else
  echo "[$NOW] No new blog posts published today" >> $LOG
fi

# Refresh count after adding blog URLs
TOTAL_COUNT=$(echo "$ALL_URLS" | grep -c .)
echo "[$NOW] Total URLs to submit: $TOTAL_COUNT" >> $LOG

# -----------------------------------------------------------
# 3. Submit to IndexNow batch API (max 10,000 per request)
# -----------------------------------------------------------
# Build JSON array of URLs
URL_JSON=$(echo "$ALL_URLS" | grep -v '^$' | sed 's/.*/"&"/' | paste -sd,)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://$HOST/$KEY.txt\",
    \"urlList\": [$URL_JSON]
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

case $HTTP_CODE in
  200) echo "[$NOW] SUCCESS: IndexNow accepted $TOTAL_COUNT URLs (HTTP $HTTP_CODE)" >> $LOG ;;
  202) echo "[$NOW] SUCCESS: IndexNow accepted $TOTAL_COUNT URLs for processing (HTTP $HTTP_CODE)" >> $LOG ;;
  400) echo "[$NOW] FAIL: Bad request (HTTP $HTTP_CODE) — Body: $BODY" >> $LOG ;;
  403) echo "[$NOW] FAIL: Key not valid (HTTP $HTTP_CODE) — Body: $BODY" >> $LOG ;;
  422) echo "[$NOW] FAIL: Invalid URLs (HTTP $HTTP_CODE) — Body: $BODY" >> $LOG ;;
  429) echo "[$NOW] FAIL: Rate limited (HTTP $HTTP_CODE) — Body: $BODY" >> $LOG ;;
  *)   echo "[$NOW] WARN: Unexpected response (HTTP $HTTP_CODE) — Body: $BODY" >> $LOG ;;
esac

echo "[$NOW] IndexNow submission complete." >> $LOG
echo "============================================" >> $LOG
