// Generate dynamic data for Rocket Dashboard
const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..', '..');
const todayFile = path.join(workspaceRoot, 'memory', `${new Date().toISOString().split('T')[0]}.md`);

// Count files in workspace (excluding node_modules)
function countFiles(dir, exts = ['.md', '.js', '.json', '.html', '.css']) {
    let count = 0;
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'node_modules' || item === '.git') continue;
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                count += countFiles(fullPath, exts);
            } else if (exts.some(ext => item.endsWith(ext))) {
                count++;
            }
        }
    } catch (e) {
        // Skip inaccessible directories
    }
    return count;
}

// Count today's activities from memory file
function getTodayStats() {
    let filesUpdated = 0;
    let researchDocs = 0;
    let alphaSignals = 0;
    let tweets = 0;

    try {
        if (fs.existsSync(todayFile)) {
            const content = fs.readFileSync(todayFile, 'utf8');
            // Count file mentions
            filesUpdated = (content.match(/\.(md|js|json|html)/gi) || []).length;
            // Count research docs
            researchDocs = (content.match(/research\//gi) || []).length;
            // Count alpha signals
            alphaSignals = (content.match(/alpha|signal|opportunity/gi) || []).length;
            // Count tweets
            tweets = (content.match(/tweet|posted|twitter/gi) || []).length;
        }
    } catch (e) {
        console.error('Error reading today file:', e);
    }

    return { filesUpdated, researchDocs, alphaSignals, tweets };
}

// Get recent activity from today's memory
function getRecentActivity() {
    const activities = [];
    try {
        if (fs.existsSync(todayFile)) {
            const content = fs.readFileSync(todayFile, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            
            // Extract timestamped entries
            for (const line of lines) {
                if (line.includes('|') && !line.startsWith('#')) {
                    const parts = line.split('|').map(p => p.trim());
                    if (parts.length >= 3) {
                        activities.push({
                            timestamp: parts[0],
                            action: parts.slice(1).join(' - ')
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error parsing activity:', e);
    }

    return activities.slice(-10); // Last 10 activities
}

// Get current project from HEARTBEAT.md
function getCurrentProject() {
    try {
        const heartbeatFile = path.join(workspaceRoot, 'HEARTBEAT.md');
        if (fs.existsSync(heartbeatFile)) {
            const content = fs.readFileSync(heartbeatFile, 'utf8');
            const match = content.match(/\*\*Current Cycle:\*\*\s*(.+)/);
            if (match) return match[1].trim();
        }
    } catch (e) {
        console.error('Error reading heartbeat:', e);
    }
    return 'Autonomous Operation';
}

// Generate data.json
const data = {
    lastUpdate: new Date().toISOString(),
    status: {
        online: true,
        currentProject: getCurrentProject(),
        heartbeatCycle: '10min rotation',
        uptime: '24/7',
        mode: 'Autonomous'
    },
    today: getTodayStats(),
    mission: {
        netWorthCurrent: 92000,
        netWorthGoal: 100000,
        progress: 92,
        activeProjects: 10,
        workspaceFiles: countFiles(workspaceRoot)
    },
    bots: {
        telegramBots: 5,
        alphaAccounts: 36,
        categorySlots: 60,
        deployment: 'Cloudflare Pages'
    },
    recentActivity: getRecentActivity()
};

// Write data.json
const outputPath = path.join(__dirname, 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✅ Dashboard data updated!');
console.log(`📊 Files tracked: ${data.mission.workspaceFiles}`);
console.log(`📝 Today's updates: ${data.today.filesUpdated}`);
console.log(`🎯 Current project: ${data.status.currentProject}`);
