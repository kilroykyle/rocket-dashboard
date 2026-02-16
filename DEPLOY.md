# Deploy Rocket Dashboard & Tamagotchi

Code pushed to: https://github.com/kilroykyle/rocket-dashboard

## Deploy to Cloudflare Pages (5 minutes)

### Step 1: Create Pages Project
1. Go to https://dash.cloudflare.com/ → **Workers & Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Select repository: `kilroykyle/rocket-dashboard`
4. Configure:
   - **Project name**: `rocket-dashboard`
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
5. Click **Save and Deploy**
6. Wait for deployment to finish (~30 seconds)

### Step 2: Add Custom Domains

**For rocket.kylekilroy.com:**
1. In the Pages project, click **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `rocket.kylekilroy.com`
4. Click **Continue** (Cloudflare auto-creates DNS)

**For tamagotchi.kylekilroy.com:**
1. Click **Set up a custom domain** again
2. Enter: `tamagotchi.kylekilroy.com`
3. Click **Continue**

**Note:** Both domains will serve the same Pages deployment. You'll need to configure routing:

### Step 3: Configure Routing (Optional)

Since both files are in the same repo:
- `rocket.kylekilroy.com` → serves `index.html` (dashboard)
- `tamagotchi.kylekilroy.com` → needs redirect to `tamagotchi.html`

**Add a Pages Function for routing:**

Create a file `functions/_middleware.js`:
```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // If accessing tamagotchi subdomain, serve tamagotchi.html
  if (url.hostname === 'tamagotchi.kylekilroy.com') {
    return context.env.ASSETS.fetch(new Request(url.origin + '/tamagotchi.html'));
  }
  
  // Default: serve index.html
  return context.next();
}
```

Then push:
```bash
cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
git add functions/_middleware.js
git commit -m "Add routing for tamagotchi subdomain"
git push
```

Cloudflare will auto-deploy in ~30 seconds.

---

## Alternative: Quick Deploy Without Routing

If you want to skip the routing setup for now:
- `rocket.kylekilroy.com` → dashboard (index.html)
- `tamagotchi.kylekilroy.com/tamagotchi.html` → tamagotchi (manually add /tamagotchi.html)

You can add routing later when you have time.

---

## What You Get

**Rocket Dashboard** (`rocket.kylekilroy.com`):
- Retro Game Boy-styled interface
- Activity tracking
- Project status
- Stats and metrics

**Tamagotchi** (`tamagotchi.kylekilroy.com`):
- Virtual pet version of Rocket
- Feed, play, train
- Mood and hunger meters
- Retro handheld device UI

Both deploy from the same GitHub repo, auto-update on push.
