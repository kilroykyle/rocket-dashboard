# Dashboard Integration Guide

How to integrate automatic dashboard updates into Rocket's workflow.

---

## Option 1: Heartbeat Integration (Recommended)

Add dashboard update to the heartbeat cycle so it runs automatically.

### Add to HEARTBEAT.md

```markdown
## 10. Dashboard Maintenance (NEW)

### Auto-Update Dashboard
- [ ] Run dashboard update script
- [ ] Commit changes if state changed
- [ ] Push to GitHub (auto-deploys)

**When to run:** Once per heartbeat cycle (every 30-60 min)

**File:** `rocket.kylekilroy.com/update-dashboard.js`

### When to Alert Kyle:
- Dashboard deployment failed
- State file corruption detected
```

### Add to heartbeat-state.json tracking

```json
{
  "last_checks": {
    "dashboard_update": "2026-03-03T04:15:00Z"
  },
  "progress": {
    "dashboard_updates_count": 42,
    "dashboard_last_deployed": "2026-03-03T04:15:00Z"
  }
}
```

---

## Option 2: Cron Job (Set-It-And-Forget-It)

Create a dedicated cron job for dashboard updates.

### Create Cron Job

```javascript
// In agent code or via cron tool
{
  "name": "Dashboard Update",
  "schedule": {
    "kind": "cron",
    "expr": "*/30 * * * *",  // Every 30 minutes
    "tz": "America/New_York"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Update the dashboard: run /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com/deploy.sh and report any errors.",
    "timeoutSeconds": 120
  },
  "delivery": {
    "mode": "none"  // Silent unless errors
  }
}
```

---

## Option 3: On-Demand (Manual/Triggered)

Update dashboard only when significant events occur.

### Trigger Events

Update dashboard after:
- Project status changes (designed → deployed)
- Major milestones achieved
- Metrics significantly change (quality score +5, new leads, etc.)
- Client work completed

### Example Integration

```javascript
// After completing a task
async function updateDashboardAfterMilestone(milestone) {
    const { exec } = require('child_process');
    
    exec('cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com && ./deploy.sh "Milestone: ' + milestone + '"',
        (error, stdout) => {
            if (error) {
                console.error('Dashboard update failed:', error);
                return;
            }
            console.log('✅ Dashboard updated:', milestone);
        }
    );
}
```

---

## Option 4: Hybrid Approach (Best of Both)

- **Scheduled updates:** Every 30-60 min (keep dashboard fresh)
- **Event-triggered updates:** On major milestones (immediate visibility)
- **Manual updates:** Via command when Kyle requests

---

## Testing

### Test Update Script

```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
node update-dashboard.js
# Check dashboard-state.json for changes
```

### Test Full Deployment

```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
./deploy.sh "Test deployment"
# Wait 60 seconds, check https://rocket.kylekilroy.com
```

### Local Preview (Before Deployment)

```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

---

## Error Handling

### Common Issues

**Update script fails:**
```javascript
try {
    exec('node update-dashboard.js', (error, stdout) => {
        if (error) throw error;
        // Success - commit & push
    });
} catch (error) {
    console.error('Dashboard update failed:', error);
    // Log to memory/YYYY-MM-DD.md
    // Don't block other work
}
```

**Git push fails:**
- Check git credentials configured
- Verify remote URL: `git remote -v`
- Ensure no merge conflicts

**Stale data:**
- Verify heartbeat is running
- Check last_updated timestamp in dashboard-state.json
- Confirm Cloudflare Pages auto-deploy enabled

---

## Monitoring

### Health Check

Add to weekly briefing:

```markdown
## Dashboard Health
- Last updated: [timestamp]
- Updates this week: [count]
- Failed deployments: [count]
- Staleness: [minutes since last update]
```

### Alerts

Alert Kyle if:
- Dashboard hasn't updated in >2 hours
- Deployment failures >3 in a row
- State file corruption detected

---

## Customization for Different Events

### Project Status Change

```javascript
function onProjectStatusChange(projectId, newStatus) {
    // Update state
    // Trigger dashboard update
    exec('./deploy.sh "Project update: ' + projectId + ' -> ' + newStatus + '"');
}
```

### Metric Milestone

```javascript
function onMetricMilestone(metric, value) {
    // E.g., quality score hits 90, net worth hits $95k
    exec('./deploy.sh "Milestone: ' + metric + ' reached ' + value + '"');
}
```

### Client Lead Acquired

```javascript
function onNewClientLead(leadName) {
    // Update metrics.clientLeadsReady
    exec('./deploy.sh "New lead: ' + leadName + '"');
}
```

---

## Performance Considerations

- **Update frequency:** 30-60 min is optimal (balance freshness vs. API costs)
- **Git commits:** Small, frequent commits are fine (GitHub handles it)
- **Build time:** None (pure static, deploys in ~30 seconds)
- **Bandwidth:** Minimal (JSON file is <10KB)

---

## Security

- **Public data only:** Dashboard is public - don't expose sensitive info
- **Sanitize inputs:** If user data is displayed, sanitize it
- **API keys:** Never commit API keys to git
- **Private repos:** Consider making repo private if dashboard shows internal metrics

---

## Recommended: Start with Option 1 (Heartbeat)

**Why:**
- Automatic, no manual intervention
- Runs during regular work cycles
- Easy to disable/enable
- Logs errors to memory files

**Setup:**
1. Add to HEARTBEAT.md (see above)
2. Agent picks up task naturally
3. Dashboard stays fresh automatically

**Try it:**
1. Add task to HEARTBEAT.md
2. Wait for next heartbeat cycle
3. Check dashboard updates automatically

---

**Next steps:** Choose integration method, test locally, deploy to production.
