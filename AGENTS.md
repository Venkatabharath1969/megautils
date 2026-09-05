# UtilsNow — AI Agent Rules

> **Read this FIRST before making any changes.**

## CRITICAL: Google Spam Prevention Rules

**Context:** The site was hit by Google's August 2026 Spam Update. Impressions dropped 99.95% (8,201/week → 4/week). These rules MUST be followed to prevent future penalties.

### Before ANY code change, verify:
1. **No scaled content:** Do NOT mass-generate 100+ programmatic pages at once. Max 20 new pages per week.
2. **No thin pages:** Every page must have 300+ words of UNIQUE, useful content. Pages under 100 lines of code need content enrichment.
3. **No sudden meta changes:** Do NOT change all 235 tool page titles/descriptions at once. Change max 20 per session.
4. **No keyword stuffing:** Titles should be natural, not forced with "Free Online No Signup Instant."
5. **Check GSC data FIRST:** Run the GSC fetch script before making SEO decisions. Data at `/opt/automation/gsc-api/data/`.
6. **Sitemap sanity:** Sitemap should have <1,000 URLs for a domain under 6 months old. Currently ~710 URLs.
7. **Build page count check:** After `npm run build`, verify static page count is reasonable (currently ~684). Alert if it exceeds 1,000.

### GSC Fetch Command
```bash
cd /opt/automation/video-pipeline && source .venv/bin/activate && python3 /opt/automation/gsc-api/fetch_gsc_data.py
```

## Google Search Console API Access
- **Token:** `/opt/automation/gsc-api/gsc_token.json`
- **Fetch script:** `/opt/automation/gsc-api/fetch_gsc_data.py`
- **Data output:** `/opt/automation/gsc-api/data/`
- **Site URL:** `https://utilsnow.com/`
- **Account:** `co.bharaths@gmail.com` (Owner)
- **Scope:** `https://www.googleapis.com/auth/webmasters` (full access)
- **Always check GSC data before making SEO decisions**

## Self-Healing Watchdog
- **Script:** `/opt/automation/watchdog.sh`
- **Runs:** Every 6 hours via cron
- **Checks:** Playwright, PM2, website, Nginx, Postiz, Listmonk, disk, memory, SSL, tokens, cron count
- **Auto-fixes:** Reinstalls Playwright if missing, restarts crashed services, cleans disk if >90%
- **Log:** `/var/log/utilsnow-watchdog.log`

## Current Tool Count
- **235 tools** across 18 categories
- **684 static pages** (reduced from 1,464 after spam update)
- **15+ cron jobs** running automation
- **Domain age:** ~1 month (Aug 8, 2026)

## Key Files
- **Context:** `/root/megautils/utilsnow_context.md` — Single source of truth, update at END of every session
- **Revenue Plan:** `/root/megautils/REVENUE-ACTION-PLAN-SEP2026.md`
- **Tool Registry:** `/root/megautils/src/lib/tool-registry.ts`
- **Watchdog:** `/opt/automation/watchdog.sh`
