#!/usr/bin/env bash
# =============================================================================
# auto-social-post.sh — Automated social media posting via Postiz API
# Posts to X/Twitter, LinkedIn, and Bluesky about UtilsNow tools
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
POSTIZ_URL="http://localhost:5200"
POSTIZ_EMAIL="co.bharaths@gmail.com"
POSTIZ_PASSWORD="MegaUtils2026!"
TOOLS_DATA="/opt/automation/tools-data.json"
LOG_FILE="/var/log/utilsnow-social.log"
LOCK_FILE="/tmp/utilsnow-social.lock"

# Integration IDs
TWITTER_ID="cmsk6mmon0001mi6ol2a2wddi"
LINKEDIN_ID="cmsk5n6rg0001oe73pzt5jdm2"
BLUESKY_ID="cmsll1nvj0001pc6z459i7dih"

# ---------------------------------------------------------------------------
# Logging helper
# ---------------------------------------------------------------------------
log() {
  local ts
  ts=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Lock guard — prevent stacking if previous run is still going
# ---------------------------------------------------------------------------
if [ -f "$LOCK_FILE" ]; then
  lock_age=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
  if [ "$lock_age" -lt 1800 ]; then
    log "SKIP: Previous run still active (lock age: ${lock_age}s). Exiting."
    exit 0
  else
    log "WARN: Stale lock found (age: ${lock_age}s). Removing."
    rm -f "$LOCK_FILE"
  fi
fi
trap 'rm -f "$LOCK_FILE"' EXIT
touch "$LOCK_FILE"

# ---------------------------------------------------------------------------
# Ensure dependencies
# ---------------------------------------------------------------------------
for cmd in curl jq; do
  if ! command -v "$cmd" &>/dev/null; then
    log "ERROR: '$cmd' not found. Install it first."
    exit 1
  fi
done

# ---------------------------------------------------------------------------
# Step 1: Login to Postiz and get auth token
# ---------------------------------------------------------------------------
log "Logging into Postiz..."

# Use -D to dump headers; Postiz returns the JWT in both Set-Cookie and 'auth' header
LOGIN_HEADERS=$(mktemp)
LOGIN_BODY=$(curl -s -D "$LOGIN_HEADERS" "$POSTIZ_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$POSTIZ_EMAIL\",\"password\":\"$POSTIZ_PASSWORD\",\"provider\":\"LOCAL\"}")

# Primary: extract from the 'auth:' response header (Postiz always sends this)
AUTH_TOKEN=$(grep -i '^auth:' "$LOGIN_HEADERS" | sed 's/^auth: *//i' | tr -d '\r\n' || true)

# Fallback: extract from Set-Cookie header
if [ -z "$AUTH_TOKEN" ]; then
  AUTH_TOKEN=$(grep -oP 'Set-Cookie:\s*auth=\K[^;]+' "$LOGIN_HEADERS" | head -1 || true)
fi

rm -f "$LOGIN_HEADERS"

if [ -z "$AUTH_TOKEN" ]; then
  log "ERROR: Failed to get auth token. Body: $LOGIN_BODY"
  exit 1
fi

log "Login successful. Auth token obtained (${#AUTH_TOKEN} chars)."

# ---------------------------------------------------------------------------
# Step 2: Pick a random tool from the JSON data
# ---------------------------------------------------------------------------
TOOL_COUNT=$(jq length "$TOOLS_DATA")
RANDOM_INDEX=$(( RANDOM % TOOL_COUNT ))

TOOL_ID=$(jq -r ".[$RANDOM_INDEX].id" "$TOOLS_DATA")
TOOL_NAME=$(jq -r ".[$RANDOM_INDEX].name" "$TOOLS_DATA")
TOOL_DESC=$(jq -r ".[$RANDOM_INDEX].description" "$TOOLS_DATA")
TOOL_CATEGORY=$(jq -r ".[$RANDOM_INDEX].category" "$TOOLS_DATA")
TOOL_IS_AI=$(jq -r ".[$RANDOM_INDEX].isAI" "$TOOLS_DATA")
TOOL_URL="https://utilsnow.com/tools/$TOOL_ID"

log "Selected tool: $TOOL_NAME (id=$TOOL_ID, category=$TOOL_CATEGORY, isAI=$TOOL_IS_AI)"

# ---------------------------------------------------------------------------
# Category labels for template 4
# ---------------------------------------------------------------------------
declare -A CATEGORY_LABELS=(
  [developer]="developer tools"
  [encoders]="encoding tools"
  [crypto]="security tools"
  [seo]="SEO tools"
  [text]="text tools"
  [string]="string utilities"
  [content]="writing tools"
  [markdown]="markdown tools"
  [color]="color tools"
  [css]="CSS generators"
  [financial]="financial calculators"
  [converters]="unit converters"
  [math]="math tools"
  [image]="image tools"
  [datetime]="date/time tools"
  [network]="network tools"
  [generators]="generator tools"
)

CATEGORY_LABEL="${CATEGORY_LABELS[$TOOL_CATEGORY]:-online tools}"

# ---------------------------------------------------------------------------
# Step 3: Generate post content from templates
# ---------------------------------------------------------------------------

# Build list of eligible template numbers
TEMPLATES=(1 2 3 4)
if [ "$TOOL_IS_AI" = "true" ]; then
  TEMPLATES+=(5)
fi

# Pick a random template
TEMPLATE_INDEX=$(( RANDOM % ${#TEMPLATES[@]} ))
TEMPLATE_NUM="${TEMPLATES[$TEMPLATE_INDEX]}"

case "$TEMPLATE_NUM" in
  1)
    POST_CONTENT="Did you know? $TOOL_NAME on UtilsNow lets you ${TOOL_DESC,,}. Free, no signup. $TOOL_URL"
    ;;
  2)
    # Build a short action phrase from description
    ACTION="${TOOL_DESC,,}"
    POST_CONTENT="Need to ${ACTION}? Try $TOOL_NAME — runs entirely in your browser. $TOOL_URL #freetools"
    ;;
  3)
    POST_CONTENT="$TOOL_NAME — one of 194 free tools on UtilsNow. No signup, no uploads, 100% private. $TOOL_URL"
    ;;
  4)
    POST_CONTENT="Stop paying for $CATEGORY_LABEL. $TOOL_NAME does it free, in your browser. $TOOL_URL"
    ;;
  5)
    POST_CONTENT="AI-powered $TOOL_NAME runs 100% in your browser — no data uploaded to any server. Try it free: $TOOL_URL #AI"
    ;;
esac

log "Template $TEMPLATE_NUM selected. Post content:"
log "  $POST_CONTENT"

# ---------------------------------------------------------------------------
# Step 4: Schedule the post 30 minutes from now
# ---------------------------------------------------------------------------
SCHEDULE_DATE=$(date -u -d '+30 minutes' '+%Y-%m-%dT%H:%M:%S.000Z')
log "Scheduled for: $SCHEDULE_DATE"

# ---------------------------------------------------------------------------
# Step 5: Build and send the API request for ALL 3 platforms
# ---------------------------------------------------------------------------

# Build the posts array with all 3 integrations
POSTS_JSON=$(jq -n \
  --arg content "$POST_CONTENT" \
  --arg twitter_id "$TWITTER_ID" \
  --arg linkedin_id "$LINKEDIN_ID" \
  --arg bluesky_id "$BLUESKY_ID" \
  '[
    {
      "content": $content,
      "integration": {"id": $twitter_id},
      "settings": {"who_can_reply_post": "everyone"},
      "value": [{"content": $content, "type": "text", "image": []}]
    },
    {
      "content": $content,
      "integration": {"id": $linkedin_id},
      "settings": {},
      "value": [{"content": $content, "type": "text", "image": []}]
    },
    {
      "content": $content,
      "integration": {"id": $bluesky_id},
      "settings": {},
      "value": [{"content": $content, "type": "text", "image": []}]
    }
  ]')

REQUEST_BODY=$(jq -n \
  --arg date "$SCHEDULE_DATE" \
  --argjson posts "$POSTS_JSON" \
  '{
    "type": "schedule",
    "shortLink": false,
    "date": $date,
    "tags": [],
    "posts": $posts
  }')

log "Sending post to Postiz API..."

RESPONSE=$(curl -s -w "\n%{http_code}" \
  "$POSTIZ_URL/api/posts" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth=$AUTH_TOKEN" \
  -d "$REQUEST_BODY")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  POST_ID=$(echo "$RESPONSE_BODY" | jq -r '.[0].postId // .id // "unknown"' 2>/dev/null || echo "unknown")
  log "SUCCESS: Post scheduled (HTTP $HTTP_CODE, post_id=$POST_ID)"
  log "  Tool: $TOOL_NAME"
  log "  Platforms: X/Twitter, LinkedIn, Bluesky"
  log "  Scheduled: $SCHEDULE_DATE"
else
  log "ERROR: Failed to schedule post (HTTP $HTTP_CODE)"
  log "  Response: $RESPONSE_BODY"
  exit 1
fi

log "--- Run complete ---"
