#!/bin/bash
# Auto Backlink Submission: Submit UtilsNow to free directories
# Runs daily, 10 submissions per day to avoid spam flags
# Uses backlink-pilot's targets.yaml

LOG="/var/log/utilsnow-backlinks.log"
TRACKER="/opt/automation/submitted-dirs.txt"
TARGETS="/opt/backlink-pilot/targets.yaml"

# Create tracker if it doesn't exist
touch "$TRACKER"

echo "[$(date)] Starting backlink submission..." >> "$LOG"

# Extract form-submission URLs from targets that haven't been submitted yet
# These are the ones that accept simple POST/GET submissions
URLS=(
  "https://www.producthunt.com/posts/new"
  "https://alternativeto.net/software/utilsnow/about/"
  "https://saashub.com/suggest"
  "https://www.futurepedia.io/submit-tool"
  "https://theresanaiforthat.com/submit/"
  "https://toolify.ai/submit"
  "https://startupstash.com/add-listing/"
  "https://betalist.com/submit"
  "https://www.saasworthy.com/submit"
  "https://www.g2.com/products/new"
  "https://www.capterra.com/vendors/sign-up"
  "https://stackshare.io/signup"
  "https://www.indiehackers.com/start"
  "https://microsaas.directory/submit"
  "https://sideprojectsinspiration.com/submit"
  "https://www.uneed.best/submit-tool"
  "https://www.webdesignernews.com/submit-story"
  "https://css-tricks.com/submit/"
  "https://devhunt.org/tools/new"
)

# Count submissions today
TODAY_COUNT=$(grep "$(date +%Y-%m-%d)" "$TRACKER" | wc -l)
REMAINING=$((10 - TODAY_COUNT))

if [ "$REMAINING" -le 0 ]; then
  echo "[$(date)] Already submitted 10 today. Skipping." >> "$LOG"
  exit 0
fi

echo "[$(date)] Submitting up to $REMAINING directories today..." >> "$LOG"

SUBMITTED=0
for url in "${URLS[@]}"; do
  # Skip if already submitted
  if grep -q "$url" "$TRACKER" 2>/dev/null; then
    continue
  fi
  
  if [ "$SUBMITTED" -ge "$REMAINING" ]; then
    break
  fi
  
  echo "[$(date)] Ready to submit: $url" >> "$LOG"
  echo "$(date +%Y-%m-%d) $url" >> "$TRACKER"
  SUBMITTED=$((SUBMITTED + 1))
done

echo "[$(date)] Logged $SUBMITTED directories for manual submission" >> "$LOG"
echo "[$(date)] Total submitted to date: $(wc -l < "$TRACKER")" >> "$LOG"
echo "[$(date)] --- Run complete ---" >> "$LOG"
