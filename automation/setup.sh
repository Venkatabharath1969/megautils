#!/usr/bin/env bash
# Setup script: copies automation files to /opt/automation/ and configures cron
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Create target directory
mkdir -p /opt/automation /var/log

# Copy files
cp "$SCRIPT_DIR/tools-data.json" /opt/automation/tools-data.json
cp "$SCRIPT_DIR/auto-social-post.sh" /opt/automation/auto-social-post.sh
chmod +x /opt/automation/auto-social-post.sh

# Verify
echo "Files installed:"
ls -la /opt/automation/

# Validate JSON
python3 -c "import json; d=json.load(open('/opt/automation/tools-data.json')); print(f'Valid JSON: {len(d)} tools')" 2>/dev/null || \
  jq length /opt/automation/tools-data.json

# Set up cron (3 times daily: 9 AM, 1 PM, 6 PM IST = 3:30, 7:30, 12:30 UTC)
CRON_LINE="30 3,7,12 * * * /opt/automation/auto-social-post.sh >> /var/log/utilsnow-social.log 2>&1"

# Remove any existing utilsnow-social cron entries, then add new one
(crontab -l 2>/dev/null | grep -v 'auto-social-post' || true; echo "$CRON_LINE") | crontab -

echo ""
echo "Cron job installed:"
crontab -l | grep auto-social-post

echo ""
echo "Setup complete! Test with: /opt/automation/auto-social-post.sh"
