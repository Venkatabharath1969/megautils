#!/bin/bash
# IndexNow bulk URL submission - submits all URLs to Bing, Yandex, Naver, etc.
# Run after deployment: bash scripts/indexnow-submit.sh

KEY="dcfb9d8fec340f7ea5f85fdf5924ba8f"
HOST="utilsnow.com"

# Build URL list from sitemap
URLS=$(curl -s "https://${HOST}/sitemap.xml" | grep -oP '<loc>\K[^<]+')
URL_JSON=$(echo "$URLS" | jq -R -s 'split("\n") | map(select(. != ""))')

echo "Submitting $(echo "$URLS" | wc -l) URLs to IndexNow..."

curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"${HOST}\",
    \"key\": \"${KEY}\",
    \"keyLocation\": \"https://${HOST}/${KEY}.txt\",
    \"urlList\": ${URL_JSON}
  }" && echo "" && echo "Submitted successfully!"
