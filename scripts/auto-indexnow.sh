#!/bin/bash
# Auto IndexNow: Submits new blog posts to Bing/Yandex/Naver when they become visible
# Runs daily via cron — checks if any new posts published today

KEY="dcfb9d8fec340f7ea5f85fdf5924ba8f"
HOST="utilsnow.com"
DB_PASS="megautils_36ed23db45f9cc50"
LOG="/var/log/utilsnow-indexnow.log"

TODAY=$(date +%Y-%m-%d)

# Get slugs of posts published today
NEW_SLUGS=$(PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -p 5433 -U megautils -d megautils -t -A -c \
  "SELECT slug FROM blog_posts WHERE publish_date = '$TODAY' AND is_published = true;")

if [ -z "$NEW_SLUGS" ]; then
  echo "[$TODAY] No new posts today." >> $LOG
  exit 0
fi

# Build URL list
URLS=""
while IFS= read -r slug; do
  [ -z "$slug" ] && continue
  URLS="$URLS\"https://$HOST/blog/$slug\","
done <<< "$NEW_SLUGS"

# Remove trailing comma, wrap in array
URL_JSON="[${URLS%,}]"
COUNT=$(echo "$NEW_SLUGS" | grep -c .)

echo "[$TODAY] Submitting $COUNT new blog URL(s) to IndexNow..." >> $LOG

RESPONSE=$(curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://$HOST/$KEY.txt\",
    \"urlList\": $URL_JSON
  }")

echo "[$TODAY] Response: $RESPONSE" >> $LOG
echo "[$TODAY] Done." >> $LOG
