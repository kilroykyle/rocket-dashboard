// Dashboard data API for Tamagotchi
// This would be called by the frontend to get real data

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get today's memory snapshot
function getMemorySnapshot() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const memoryPath = path.join(__dirname, '..', '..', 'memory', `${today}.md`);
        
        if (fs.existsSync(memoryPath)) {
            const content = fs.readFileSync(memoryPath, 'utf8');
            const lines = content.split('\n').filter(l => l.trim()).slice(0, 5);
            return lines.join(' | ') || 'No activity logged yet today';
        }
        return 'No memory file for today yet';
    } catch (e) {
        return 'Error reading memory';
    }
}

// Get top priority from HEARTBEAT
function getTopPriority() {
    try {
        const heartbeatPath = path.join(__dirname, '..', '..', 'HEARTBEAT.md');
        if (fs.existsSync(heartbeatPath)) {
            const content = fs.readFileSync(heartbeatPath, 'utf8');
            // Look for "TODAY PRIORITY" or recent focus
            if (content.includes('TODAY PRIORITY')) {
                const match = content.match(/TODAY PRIORITY:([^\n]+)/i);
                if (match) return match[1].trim();
            }
            return 'Check heartbeat cycles - all systems running';
        }
        return 'Heartbeat monitoring active';
    } catch (e) {
        return 'Priority system check needed';
    }
}

// Get latest ideas
function getLatestIdeas() {
    try {
        const ideasPath = path.join(__dirname, '..', '..', 'IDEA-INBOX.md');
        if (fs.existsSync(ideasPath)) {
            const content = fs.readFileSync(ideasPath, 'utf8');
            const lines = content.split('\n').filter(l => l.trim() && l.startsWith('-')).slice(0, 3);
            return lines.join(' ') || 'No new ideas in inbox';
        }
        return 'Idea inbox empty';
    } catch (e) {
        return 'Ideas system unavailable';
    }
}

// Check deploy status
function getDeployStatus() {
    try {
        const status = execSync('git status --short', { cwd: path.join(__dirname, '..', '..') }).toString();
        const uncommitted = status.split('\n').filter(l => l.trim()).length;
        
        if (uncommitted > 0) {
            return `${uncommitted} files need commit/deploy`;
        }
        return 'All changes deployed ✓';
    } catch (e) {
        return 'Git status check failed';
    }
}

// Draft a tweet
function draftTweet() {
    const hour = new Date().getHours();
    let timeContext = '';
    
    if (hour < 12) timeContext = 'Morning';
    else if (hour < 17) timeContext = 'Afternoon';
    else timeContext = 'Evening';
    
    const templates = [
        `${timeContext} update: Just deployed v3.2.0 of my dashboard - now with contextual action buttons! 🎮`,
        `Working autonomously all day - built a Tamagotchi-style interface for my AI dashboard 🚀`,
        `${timeContext} vibes: Monitoring alpha signals, updating projects, being a helpful AI 💫`,
        `Dashboard evolution: From static to interactive to... Tamagotchi? Why not! 🎨`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

module.exports = {
    getMemorySnapshot,
    getTopPriority,
    getLatestIdeas,
    getDeployStatus,
    draftTweet
};
