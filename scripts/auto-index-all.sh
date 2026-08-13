#!/bin/bash
# =============================================================================
# Auto-Index All: Comprehensive URL submission for utilsnow.com
# =============================================================================
# Submits ALL sitemap URLs to:
#   - IndexNow (Bing, Yandex, DuckDuckGo, Naver, Seznam, etc.)
#   - Google sitemap ping
#   - Bing sitemap ping
#
# Uses IndexNow batch API (up to 10,000 URLs per request)
# Logs successes and failures with timestamps
#
# Schedule: Daily at 3 AM IST (21:30 UTC previous day) via cron
# Canonical location: /opt/automation/auto-index-all.sh
# =============================================================================

set -euo pipefail

# --- Configuration ---
LOG="/var/log/utilsnow-autoindex.log"
SITEMAP="https://utilsnow.com/sitemap.xml"
INDEXNOW_KEY="dcfb9d8fec340f7ea5f85fdf5924ba8f"
HOST="utilsnow.com"
KEY_LOCATION="https://$HOST/$INDEXNOW_KEY.txt"
DB_PASS="megautils_36ed23db45f9cc50"
MAX_URLS_PER_BATCH=10000

# --- Helper ---
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

# --- Start ---
echo "" >> "$LOG"
echo "================================================================" >> "$LOG"
log "AUTO-INDEX STARTING"
echo "================================================================" >> "$LOG"

# =============================================================================
# 1. Fetch all URLs from sitemap
# =============================================================================
log "Fetching sitemap from $SITEMAP..."
SITEMAP_XML=$(curl -s --max-time 30 "$SITEMAP" 2>/dev/null)

if [ -z "$SITEMAP_XML" ]; then
  log "FATAL: Could not fetch sitemap. Aborting."
  exit 1
fi

URLS=$(echo "$SITEMAP_XML" | grep -oP '(?<=<loc>).*?(?=</loc>)')
URL_COUNT=$(echo "$URLS" | grep -c . || echo 0)

if [ "$URL_COUNT" -eq 0 ]; then
  log "FATAL: No URLs found in sitemap. Aborting."
  exit 1
fi

log "Found $URL_COUNT URLs in sitemap"

# =============================================================================
# 2. Check for new blog posts published today (not yet in sitemap)
# =============================================================================
TODAY=$(date +%Y-%m-%d)
NEW_BLOG_SLUGS=$(PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -p 5433 -U megautils -d megautils -t -A -c \
  "SELECT slug FROM blog_posts WHERE publish_date = '$TODAY' AND is_published = true;" 2>/dev/null || echo "")

if [ -n "$NEW_BLOG_SLUGS" ]; then
  NEW_COUNT=$(echo "$NEW_BLOG_SLUGS" | grep -c . || echo 0)
  log "Found $NEW_COUNT new blog post(s) published today"

  while IFS= read -r slug; do
    [ -z "$slug" ] && continue
    BLOG_URL="https://$HOST/blog/$slug"
    if ! echo "$URLS" | grep -qF "$BLOG_URL"; then
      URLS=$(printf '%s\n%s' "$URLS" "$BLOG_URL")
      log "  Added: $BLOG_URL (not yet in sitemap)"
    fi
  done <<< "$NEW_BLOG_SLUGS"

  # Refresh count
  URL_COUNT=$(echo "$URLS" | grep -c . || echo 0)
  log "Total URLs after adding new posts: $URL_COUNT"
else
  log "No new blog posts published today"
fi

# =============================================================================
# 3. Submit to IndexNow batch API
# =============================================================================
log "Submitting $URL_COUNT URLs to IndexNow (batch API)..."

# Build JSON array — take up to MAX_URLS_PER_BATCH
URL_JSON=$(echo "$URLS" | grep -v '^$' | head -"$MAX_URLS_PER_BATCH" | sed 's/"/\\"/g; s/.*/"&"/' | paste -sd,)

RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 60 -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$INDEXNOW_KEY\",
    \"keyLocation\": \"$KEY_LOCATION\",
    \"urlList\": [$URL_JSON]
  }" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

case $HTTP_CODE in
  200)
    log "IndexNow SUCCESS: $URL_COUNT URLs accepted (HTTP 200 OK)"
    ;;
  202)
    log "IndexNow SUCCESS: $URL_COUNT URLs accepted for processing (HTTP 202 Accepted)"
    ;;
  400)
    log "IndexNow FAIL: Bad request (HTTP 400) - $BODY"
    ;;
  403)
    log "IndexNow FAIL: Key not valid or not matching (HTTP 403) - $BODY"
    ;;
  422)
    log "IndexNow FAIL: Invalid URL(s) in batch (HTTP 422) - $BODY"
    ;;
  429)
    log "IndexNow FAIL: Too many requests, rate limited (HTTP 429) - $BODY"
    ;;
  *)
    log "IndexNow WARN: Unexpected response (HTTP $HTTP_CODE) - $BODY"
    ;;
esac

# =============================================================================
# 4. Ping Google sitemap (deprecated but kept as fallback)
# Note: Google deprecated /ping endpoint in 2023. Discovery via sitemap in
# robots.txt and Search Console is now the primary method. Kept for best effort.
# =============================================================================
log "Pinging Google sitemap..."
GOOGLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
  "https://www.google.com/ping?sitemap=$SITEMAP" 2>/dev/null)

if [ "$GOOGLE_CODE" = "200" ]; then
  log "Google ping SUCCESS (HTTP $GOOGLE_CODE)"
elif [ "$GOOGLE_CODE" = "404" ] || [ "$GOOGLE_CODE" = "410" ]; then
  log "Google ping: endpoint deprecated (HTTP $GOOGLE_CODE) — Google uses sitemap from robots.txt"
else
  log "Google ping returned HTTP $GOOGLE_CODE"
fi

# =============================================================================
# 5. Ping Bing sitemap (deprecated — Bing now uses IndexNow)
# Note: Bing deprecated /ping in favor of IndexNow (already submitted above).
# Kept for best effort.
# =============================================================================
log "Pinging Bing sitemap..."
BING_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
  "https://www.bing.com/ping?sitemap=$SITEMAP" 2>/dev/null)

if [ "$BING_CODE" = "200" ]; then
  log "Bing ping SUCCESS (HTTP $BING_CODE)"
elif [ "$BING_CODE" = "410" ] || [ "$BING_CODE" = "404" ]; then
  log "Bing ping: endpoint deprecated (HTTP $BING_CODE) — Bing uses IndexNow"
else
  log "Bing ping returned HTTP $BING_CODE"
fi

# =============================================================================
# 6. Summary
# =============================================================================
echo "----------------------------------------------------------------" >> "$LOG"
log "AUTO-INDEX COMPLETE | URLs: $URL_COUNT | IndexNow: HTTP $HTTP_CODE | Google: HTTP $GOOGLE_CODE | Bing: HTTP $BING_CODE"
echo "================================================================" >> "$LOG"
