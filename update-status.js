#!/usr/bin/env node
// Simple Node.js script to update status.json and auto-deploy

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const STATUS_FILE = path.join(__dirname, 'status.json');

// Read current status
function readStatus() {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
}

// Write status and deploy
function writeAndDeploy(status, message) {
    status.lastUpdate = new Date().toISOString().replace('Z', '-05:00');
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    
    try {
        execSync('git add status.json', { cwd: __dirname });
        execSync(`git commit -m "${message}"`, { cwd: __dirname });
        execSync('git push', { cwd: __dirname });
        console.log(`✅ ${message}`);
    } catch (error) {
        console.error('❌ Git push failed:', error.message);
    }
}

// Get EST timestamp
function getTimestamp() {
    return new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(',', '') + ' EST';
}

// Commands
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
    case 'activity': {
        const description = args.join(' ');
        if (!description) {
            console.error('Usage: node update-status.js activity "Description"');
            process.exit(1);
        }
        
        const status = readStatus();
        status.activities.unshift({
            time: getTimestamp(),
            description: description
        });
        status.activities = status.activities.slice(0, 10); // Keep last 10
        
        writeAndDeploy(status, `Update: ${description}`);
        break;
    }
    
    case 'stats': {
        const [sites, repos, cron, health] = args.map(Number);
        const status = readStatus();
        
        if (sites !== undefined) status.stats.sitesDeployed = sites;
        if (repos !== undefined) status.stats.githubRepos = repos;
        if (cron !== undefined) status.stats.cronJobs = cron;
        if (health !== undefined) status.stats.systemHealth = health;
        
        writeAndDeploy(status, `Update stats: ${sites} sites, ${repos} repos`);
        break;
    }
    
    case 'project': {
        const projectName = args[0];
        const newStatus = args[1]; // live, building, planned
        
        if (!projectName || !newStatus) {
            console.error('Usage: node update-status.js project "Project Name" [live|building|planned]');
            process.exit(1);
        }
        
        const status = readStatus();
        const project = status.projects.find(p => p.name === projectName);
        
        if (project) {
            project.status = newStatus;
            writeAndDeploy(status, `Update: ${projectName} -> ${newStatus}`);
        } else {
            console.error(`❌ Project not found: ${projectName}`);
            process.exit(1);
        }
        break;
    }
    
    case 'health': {
        const serviceName = args[0];
        const newStatus = args[1]; // ok, warning, error
        
        if (!serviceName || !newStatus) {
            console.error('Usage: node update-status.js health "Service Name" [ok|warning|error]');
            process.exit(1);
        }
        
        const status = readStatus();
        const service = status.systemHealth.find(s => s.label === serviceName);
        
        if (service) {
            service.status = newStatus;
            writeAndDeploy(status, `Health update: ${serviceName} -> ${newStatus}`);
        } else {
            console.error(`❌ Service not found: ${serviceName}`);
            process.exit(1);
        }
        break;
    }
    
    default:
        console.log('Usage:');
        console.log('  node update-status.js activity "Description of what I did"');
        console.log('  node update-status.js stats [sites] [repos] [cron] [health%]');
        console.log('  node update-status.js project "Project Name" [live|building|planned]');
        console.log('  node update-status.js health "Service Name" [ok|warning|error]');
        console.log('');
        console.log('Examples:');
        console.log('  node update-status.js activity "✅ Deployed new feature to kylekilroy.com"');
        console.log('  node update-status.js stats 5 4 2 100');
        console.log('  node update-status.js project "Kilroy Electric" live');
        console.log('  node update-status.js health "Daily Briefing" warning');
        process.exit(1);
}
