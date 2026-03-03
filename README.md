# 🚀 Rocket Status Dashboard

Real-time status dashboard for Rocket AI agent - displays ongoing projects, automation systems, metrics, and activity.

**Live URL (when deployed):** https://rocket.kylekilroy.com

---

## Features

- **Real-time status** - Current activity, agent status indicator
- **Project tracking** - All automation systems and client work with progress bars
- **Metrics visualization** - Twitter monitoring, quality scores, client leads, net worth progress
- **Automated tasks** - Cron job schedule with last/next run times
- **Activity feed** - Recent completions, milestones, system events
- **Deadline tracking** - Upcoming deadlines with urgency indicators
- **Auto-refresh** - Updates every 60 seconds without page reload

---

## Tech Stack

- **Pure static** - HTML + Tailwind CSS + Vanilla JavaScript
- **No build step** - Commit → Deploy (via Cloudflare Pages)
- **Data source** - Single JSON file (`dashboard-state.json`)
- **Hosting** - Cloudflare Pages (GitHub auto-deploy)

---

## File Structure

```
rocket.kylekilroy.com/
├── index.html              # Dashboard UI
├── dashboard.js            # Fetch & render logic
├── dashboard-state.json    # Current state data (agent-generated)
├── update-dashboard.js     # Agent update script (Node.js)
├── deploy.sh               # Git commit & push helper
└── README.md               # This file
```

---

## Deployment Setup

### 1. Create GitHub Repository

```bash
cd /home/kilroy/.openclaw/workspace
git add rocket.kylekilroy.com/
git commit -m "Add Rocket status dashboard"
git push origin main
```

### 2. Configure Cloudflare Pages

1. Log into Cloudflare dashboard
2. Go to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command:** (leave empty - no build needed)
   - **Build output directory:** `/rocket.kylekilroy.com`
   - **Root directory:** `/rocket.kylekilroy.com`
5. Deploy!

### 3. Set Custom Domain

1. In Cloudflare Pages project settings
2. **Custom domains** → **Set up a custom domain**
3. Add `rocket.kylekilroy.com`
4. Cloudflare will auto-configure DNS (if domain managed by Cloudflare)

---

## Agent Update Workflow

### Manual Update (for testing)

```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
node update-dashboard.js
# Review changes in dashboard-state.json
git add dashboard-state.json
git commit -m "Update dashboard state"
git push
```

### Automated Update (from agent)

The agent can run this from any heartbeat cycle:

```javascript
// In agent code
const { exec } = require('child_process');
const dashboardScript = '/home/kilroy/.openclaw/workspace/rocket.kylekilroy.com/update-dashboard.js';

exec(`node ${dashboardScript}`, (error, stdout) => {
    if (error) {
        console.error('Dashboard update failed:', error);
        return;
    }
    console.log(stdout);
    
    // Commit & push
    exec('cd /home/kilroy/.openclaw/workspace && git add rocket.kylekilroy.com/dashboard-state.json && git commit -m "Auto-update dashboard" && git push', 
        (err) => {
            if (err) console.error('Git push failed:', err);
            else console.log('✅ Dashboard deployed');
        }
    );
});
```

Or use the provided helper script:

```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
./deploy.sh "Update message here"
```

---

## Customization

### Update Frequency

Default: Every 60 seconds  
Change in `dashboard.js`:

```javascript
setInterval(fetchDashboard, 60000); // Change 60000 to desired ms
```

### Add New Sections

1. Update `dashboard-state.json` schema (add new data)
2. Add HTML container in `index.html`
3. Create render function in `dashboard.js`
4. Call render function in `fetchDashboard()`

### Modify Colors/Theme

Colors defined in `index.html` Tailwind config:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',      // Change these
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                background: '#0F172A',
                surface: '#1E293B'
            }
        }
    }
}
```

---

## Data Schema

See `dashboard-state.json` for full schema. Key sections:

- **meta** - Agent status, last updated timestamp
- **currentActivity** - What the agent is working on now
- **projects[]** - All tracked projects with status, progress, blockers
- **metrics** - Twitter, quality scores, client leads, net worth, automation coverage
- **cronJobs[]** - Scheduled tasks with last/next run times
- **recentActivity[]** - Recent completions and milestones
- **upcomingDeadlines[]** - Deadlines with days remaining

---

## Troubleshooting

**Dashboard shows stale data:**
- Check `dashboard-state.json` last updated timestamp
- Ensure agent update script is running
- Verify Cloudflare Pages auto-deploy is enabled

**"Failed to fetch" error:**
- Check browser console for CORS errors
- Ensure `dashboard-state.json` exists and is valid JSON
- Verify Cloudflare Pages deployment succeeded

**Progress bars not animating:**
- Ensure CSS animations are enabled
- Check browser compatibility (modern browsers only)

**Agent update script fails:**
- Verify Node.js is installed (`node --version`)
- Check file paths in `update-dashboard.js`
- Ensure `memory/heartbeat-state.json` exists

---

## Future Enhancements

**Phase 2 ideas:**
- [ ] Real-time updates via WebSocket (if Cloudflare Workers added)
- [ ] Historical charts (quality scores over time, net worth progress)
- [ ] Alert notification system (browser notifications for critical events)
- [ ] Dark/light mode toggle
- [ ] Mobile app view (PWA)
- [ ] Integration with calendar (show upcoming appointments)
- [ ] GitHub activity feed (commits, PRs, deployments)

---

## License

Private - Kyle Kilroy / Rocket AI Agent

---

**Questions?** Check the code comments or ask Rocket directly.
