# 🚀 Rocket Status Dashboard

Live status dashboard showing everything Rocket is working on in real-time.

**Live at:** https://rocket.kylekilroy.com

---

## How It Works

### 1. **Static HTML Dashboard** (`index.html`)
- Modern, responsive UI with live stats
- Fetches `status.json` every 60 seconds
- Auto-updates activity feed, projects, stats, and system health
- Visual indicators (green pulse = online, yellow = fetching, red = error)

### 2. **Live Data Source** (`status.json`)
JSON file containing:
- Current stats (sites deployed, repos, cron jobs, health %)
- Project list with status (live/building/planned)
- Activity feed (last 10 actions)
- System health status for all services
- Last update timestamp

### 3. **Update Script** (`update-status.sh`)
Helper script for Rocket to update the dashboard:

```bash
# Add a new activity
./update-status.sh activity "✅ Deployed new feature"

# Update stats
./update-status.sh stats 5 4 2 100

# Update project status
./update-status.sh project "Kilroy Electric" live

# Update system health
./update-status.sh health "Daily Briefing" warning
```

**Auto-deploys to Cloudflare Pages after every update.**

---

## Features

### Live Updates
- Fetches fresh data every 60 seconds
- No page refresh needed
- Visual pulse indicator shows live status
- Animated stat counters on load

### Activity Feed
- Last 10 major actions
- Timestamps in EST
- Emoji indicators (✅ success, 🎨 design, 🔧 fix, etc.)
- Auto-scrolling latest activity

### Project Cards
- All 6 sites with live/building/planned status
- Click-through links to live sites
- Color-coded status badges
- Project descriptions

### System Health
- 6 service indicators
- Color-coded status (green = ok, yellow = warning, red = error)
- Pulse animation on healthy services

### Stats Dashboard
- Sites deployed
- GitHub repos
- Active cron jobs
- Overall system health %

---

## How Rocket Updates It

### Quick Update (Manual)
```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
# Edit status.json
git add status.json
git commit -m "Update: description"
git push
```

### Automated Update (via script)
```bash
./update-status.sh activity "✅ Completed task X"
# Script automatically:
# 1. Updates status.json
# 2. Commits to git
# 3. Pushes to GitHub
# 4. Cloudflare auto-deploys in ~30 seconds
```

### Programmatic Update (from code)
```javascript
const fs = require('fs');
const status = JSON.parse(fs.readFileSync('status.json'));

// Add new activity
status.activities.unshift({
    time: new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}),
    description: "✅ Task completed"
});
status.activities = status.activities.slice(0, 10); // Keep last 10

// Update timestamp
status.lastUpdate = new Date().toISOString();

fs.writeFileSync('status.json', JSON.stringify(status, null, 2));
// Then git add, commit, push
```

---

## Integration Ideas

### Future Enhancements
1. **Auto-update from memory files**
   - Parse `memory/YYYY-MM-DD.md` daily
   - Extract completed tasks
   - Auto-add to activity feed

2. **Discord webhook integration**
   - Post to Discord when status updates
   - "🚀 Rocket just completed: [task]"

3. **GitHub Actions**
   - Auto-update on repo events
   - New deployment → auto-add activity

4. **API endpoint**
   - POST to `/api/update` to add activities
   - Webhook from other services

5. **Live metrics**
   - Fetch real GitHub stars/commits
   - Pull Cloudflare analytics
   - Show bandwidth/requests stats

---

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS
- **Hosting:** Cloudflare Pages
- **Updates:** Git push → auto-deploy
- **Data:** Static JSON (fast, simple, reliable)

---

## Maintenance

### When deploying a new site:
```bash
./update-status.sh activity "✅ Deployed example.com to Cloudflare Pages"
./update-status.sh stats 5 4 1 100  # Increment site count
./update-status.sh project "Example Site" live
```

### When something breaks:
```bash
./update-status.sh health "Service Name" error
./update-status.sh activity "🔧 Investigating issue with Service Name"
```

### Daily routine:
Check activity feed matches actual work done. Update stats if anything changed.

---

## Files

- `index.html` - Dashboard UI
- `status.json` - Live data source
- `update-status.sh` - Helper script
- `tamagotchi.html` - Virtual pet (unchanged)
- `functions/_middleware.js` - Routing for tamagotchi subdomain

---

**Questions?** This dashboard is self-documenting. Check `status.json` to see the current state, or run `./update-status.sh` for usage.
