# UtilsNow Social Media Setup Guide — Step by Step

> **Last updated:** September 5, 2026
> **Status:** 7 of 12 platforms automated. Follow these steps to add the remaining 5.

---

## CURRENTLY ACTIVE (7 platforms — ZERO action needed)

| Platform | Frequency | Status |
|----------|-----------|--------|
| Bluesky | 6x/week | Running via cron |
| Mastodon | 6x/week | Running via cron |
| Telegram | 6x/week | Running via cron |
| Discord | 6x/week | Running via cron |
| Dev.to | 2x/week articles | Running via cron |
| YouTube | Daily video + upload | Running via cron |
| LinkedIn | 2x/day engagement | Running via n8n bot |

---

## STEP 1: Fix Impact.com Language (5 minutes)

1. Open: **https://app.impact.com/login.user**
2. Log in with your account
3. Click your **profile icon** (top-right) → **Edit Profile**
4. Find **"Language Locale"** setting
5. Change to **English (US)**
6. Click **Save**
7. **Log out and log back in** (required for change to take effect)

### After language is fixed, apply to affiliates:

1. Go to **Discover → Find Brands** (top menu)
2. Search for each program and click **Apply**:

| Program | Commission | Search For |
|---------|-----------|------------|
| Semrush | **$200/sale** (up to $450!) | "Semrush" |
| Grammarly | **$20/upgrade** + $0.20/signup | "Grammarly" |
| NordVPN | **100% first month** + 40% yearly | "NordVPN" |

3. Share the tracking URLs with me → I'll add them to all 235 tool pages + 50 comparison pages

---

## STEP 2: Facebook Page + API (30 minutes setup + 20 day wait)

### 2A: Create Facebook Page
1. Open: **https://www.facebook.com/pages/creation/**
2. Page Name: **"UtilsNow — Free Online Tools"**
3. Category: **"Software"** or **"Website"**
4. Bio: "230+ free browser tools. JSON formatter, PDF tools, image tools & more. No signup."
5. Upload logo as profile pic
6. Add CTA button: "Visit Website" → `https://utilsnow.com`

### 2B: Create Meta Developer App
1. Open: **https://developers.facebook.com/apps/creation/**
2. Click **"Create App"**
3. App name: **"UtilsNow Publisher"**
4. Select type: **"Other"** → **"Business"**
5. Go to **Settings > Basic**, fill in:
   - Privacy Policy: `https://utilsnow.com/privacy`
   - Terms: `https://utilsnow.com/terms`
6. Add Product: **"Facebook Login for Business"**
7. Request permissions: `pages_manage_posts`, `pages_read_engagement`
8. **Submit for App Review** (takes ~20 days)

### 2C: After Approval — Share these with me:
- **App ID** (from Settings > Basic)
- **App Secret** (click Show)
- **Page Access Token** (from Graph API Explorer)

I'll create the automation script and add it to cron.

**Posting rules (to avoid spam):**
- Max 1-2 posts per day
- Space at least 20 minutes between posts
- 3-5 hashtags max
- Unique content each post (no copy-paste)

---

## STEP 3: Instagram Business Account + API (30 minutes + same app review)

### 3A: Create Instagram Business Account
1. Open Instagram app → Create account (or use existing)
2. Go to **Settings → Account type → Switch to Professional → Business**
3. Category: "Software" or "Website"
4. **Link to Facebook Page:** Settings → Edit Profile → Page → Connect to your UtilsNow Facebook Page

### 3B: Instagram API (same Meta app)
- Uses the same Meta Developer App from Step 2
- Add **Instagram Graph API** product to the app
- Request `instagram_content_publish` permission in App Review
- Same 20-day wait applies

### After approval, share:
- **Instagram Business Account ID** (I'll fetch via API)
- I'll set up automated posting (Reels + Carousels + Feed images)

**Posting rules:**
- 3-5 feed posts per week
- 2-3 Reels per week (get 2.25x more reach)
- 3-5 hashtags (rotate sets, don't use same ones)
- JPEG images only

---

## STEP 4: Reddit Account (5 minutes now + 2 weeks karma building)

### 4A: Create Account
1. Open: **https://www.reddit.com/register**
2. Username: something neutral (not "utilsnow_bot")
3. Verify email

### 4B: Build Karma (2 weeks — BEFORE any promotion)
- Join these subreddits: r/webdev, r/SideProject, r/programming, r/productivity
- Leave 5-10 **genuinely helpful** comments per day
- Answer questions, share knowledge
- DO NOT mention UtilsNow yet

### 4C: Create API App (for future automation)
1. Open: **https://www.reddit.com/prefs/apps**
2. Click **"create another app..."**
3. Name: "UtilsNow"
4. Type: **script**
5. Redirect URI: `http://localhost:8080`
6. Save the **Client ID** and **Secret** — share with me

### 4D: After 2 weeks — Start posting
- Post to r/SideProject first: "I built 230+ free browser tools..."
- Then r/InternetIsBeautiful, r/alphaandbetausers
- Max 1 post per subreddit per 24 hours
- Follow 90/10 rule: 9 helpful posts for every 1 promotional

**CRITICAL spam rules:**
- Never post same link to more than 3-5 subreddits in 24 hours
- Never use multiple accounts
- Always disclose "I built this"
- Respond to every comment on your posts

---

## STEP 5: Pinterest Business Account (15 minutes)

### 5A: Create Business Account
1. Open: **https://business.pinterest.com/**
2. Create account (or convert personal to business)
3. Verify email
4. Claim website: add the Pinterest meta tag (already added to utilsnow.com) → click Verify

### 5B: Create Developer App
1. Open: **https://developers.pinterest.com/apps/**
2. Accept Developer Terms
3. Click **"Connect app"**
4. Submit for **Trial access** (approval required)
5. After approval: Save **App ID** and **App Secret** — share with me

### 5C: Create Boards
Create these boards:
- "Free Online Tools"
- "Developer Resources"
- "PDF Tools"
- "Image Editing Tools"
- "Web Design Resources"

**Posting rules:**
- Pinterest allows 15-25 pins per day (highest of any platform!)
- Use vertical images (1000x1500px)
- Keyword-rich descriptions (Pinterest is a search engine)
- Every pin links to utilsnow.com
- Pinterest has the **highest conversion rate** (2.31%) of any social platform

---

## STEP 6: Threads Account (10 minutes)

### 6A: Create Threads Account
1. Open: **https://www.threads.net/**
2. Sign in with your Instagram account (same credentials)
3. Set up profile with UtilsNow branding

### 6B: API Access
- Uses the same Meta Developer App from Step 2
- Add **Threads** product to your app
- Request `threads_content_publish` scope
- Submit for App Review (same process)

**Posting rules:**
- 1-2 posts per day
- Text-first platform (500 char max)
- Replies get more algorithmic boost than likes
- Link posts get lowest engagement — lead with value, link in follow-up

---

## PLATFORMS TO SKIP (for now)

| Platform | Why Skip |
|----------|----------|
| **X/Twitter** | API costs $0.20 per URL post — too expensive for our budget |
| **TikTok** | 2-6 week audit, video-only, tokens expire daily — too complex |
| **Medium** | No API (shut down 2023) — manual import from Dev.to only |
| **Quora** | No write API — manual answers only |
| **WhatsApp** | Not a social posting platform |

---

## WHAT I'LL BUILD ONCE YOU GIVE ME THE TOKENS

For each platform you set up, I'll create:
1. **Python posting script** with content rotation
2. **Cron job** (optimal posting time per platform algorithm)
3. **AI content generation** using Gemini API (unique per platform)
4. **Rate limit protection** (never exceed platform limits)
5. **Spam prevention** (varied content, proper spacing, hashtag rotation)
6. **Add to watchdog** (auto-restart if script fails)

**Target: 12 platforms fully automated, zero human intervention needed.**

---

## POSTING FREQUENCY SUMMARY (After Full Setup)

| Platform | Frequency | Best Time (UTC) | Content Type |
|----------|-----------|----------------|-------------|
| Facebook | 1x/day weekdays | 9 AM | Image + link |
| Instagram | 3-5x/week | 9 AM + 6 PM | Reels + Carousels |
| Reddit | 1-2x/week | 12 PM | Text posts (manual review) |
| Pinterest | 5-10x/day | 10 AM - 1 PM | Infographic pins |
| Threads | 1x/day | 9 AM | Text-first |
| Bluesky | 6x/week | Already running | Text + images |
| Mastodon | 6x/week | Already running | Text |
| Telegram | 6x/week | Already running | Messages |
| Discord | 6x/week | Already running | Messages |
| Dev.to | 2x/week | Already running | Articles |
| YouTube | Daily | Already running | Videos + Shorts |
| LinkedIn | 2x/day | Already running | Engagement |

**Total: 30-40 posts per day across all platforms — fully automated.**
