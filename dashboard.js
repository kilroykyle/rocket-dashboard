// Dashboard state and rendering
let dashboardState = null;

// Utility functions
function timeAgo(isoDate) {
    const seconds = Math.floor((new Date() - new Date(isoDate)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function statusIcon(status) {
    const icons = {
        'deployed': '✅',
        'in-progress': '🚧',
        'blocked': '🚫',
        'designed': '📐'
    };
    return icons[status] || '•';
}

function statusColor(status) {
    const colors = {
        'deployed': 'text-success',
        'in-progress': 'text-primary',
        'blocked': 'text-error',
        'designed': 'text-warning'
    };
    return colors[status] || 'text-gray-400';
}

function categoryBadge(category) {
    const badges = {
        'automation': 'bg-purple-500/20 text-purple-300',
        'client-work': 'bg-blue-500/20 text-blue-300',
        'research': 'bg-green-500/20 text-green-300',
        'maintenance': 'bg-gray-500/20 text-gray-300'
    };
    return badges[category] || 'bg-gray-500/20 text-gray-300';
}

// Render functions
function renderCurrentActivity(data) {
    const task = data.currentActivity;
    const startTime = new Date(task.startedAt);
    const estimatedEnd = new Date(task.estimatedCompletion);
    const elapsed = Date.now() - startTime;
    const total = estimatedEnd - startTime;
    const remaining = Math.max(0, Math.floor((estimatedEnd - Date.now()) / 60000));

    document.getElementById('current-task').textContent = task.task;
    document.getElementById('current-time').textContent = 
        `Started ${timeAgo(task.startedAt)} • Est. ${remaining} min remaining`;
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    container.innerHTML = projects.map(project => `
        <div class="bg-surface-light rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all">
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">${statusIcon(project.status)}</span>
                        <h3 class="font-semibold text-gray-100">${project.name}</h3>
                        ${project.score ? `<span class="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">${project.score}/100</span>` : ''}
                    </div>
                    <p class="text-xs ${statusColor(project.status)} font-medium uppercase">${project.status.replace('-', ' ')}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${categoryBadge(project.category)}">${project.category}</span>
            </div>
            
            <!-- Progress bar -->
            <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div class="progress-bar bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                     style="width: ${project.progress}%"></div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-400">
                <span>${project.progress}% complete</span>
                <span>${timeAgo(project.lastUpdated)}</span>
            </div>
            
            ${project.blocker ? `
                <div class="mt-2 text-xs bg-error/10 border border-error/30 text-error px-2 py-1 rounded">
                    ⚠️ ${project.blocker}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderMetrics(metrics) {
    const container = document.getElementById('metrics-grid');
    
    const metricCards = [
        { label: 'Twitter Accounts', value: metrics.twitterAccounts, icon: '🐦' },
        { label: 'Signals Today', value: metrics.signalsToday, icon: '📊' },
        { label: 'Quality Score', value: `${metrics.qualityScoreAvg}/100`, icon: '⭐' },
        { label: 'Client Leads', value: metrics.clientLeadsReady, icon: '💼' },
        { label: 'Net Worth Progress', value: `$${metrics.netWorthCurrent}k / $${metrics.netWorthGoal}k`, icon: '💰', progress: (metrics.netWorthCurrent / metrics.netWorthGoal) * 100 },
        { label: 'Automation Systems', value: `${metrics.automationSystemsDeployed}/${metrics.automationSystemsTotal}`, icon: '🤖', progress: (metrics.automationSystemsDeployed / metrics.automationSystemsTotal) * 100 }
    ];

    container.innerHTML = metricCards.map(metric => `
        <div class="bg-surface-light rounded-lg p-3 border border-gray-700">
            <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">${metric.icon}</span>
                <span class="text-xl font-bold text-gray-100">${metric.value}</span>
            </div>
            <p class="text-xs text-gray-400">${metric.label}</p>
            ${metric.progress !== undefined ? `
                <div class="w-full bg-gray-700 rounded-full h-1 mt-2">
                    <div class="progress-bar bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full" 
                         style="width: ${metric.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderCronJobs(jobs) {
    const container = document.getElementById('cron-jobs');
    container.innerHTML = jobs.map(job => `
        <div class="flex items-center justify-between bg-surface-light rounded-lg p-3 border border-gray-700">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="${job.status === 'ok' ? 'text-success' : 'text-error'}">${job.status === 'ok' ? '✅' : '❌'}</span>
                    <span class="text-sm font-medium text-gray-100">${job.name}</span>
                </div>
                <p class="text-xs text-gray-400">${job.schedule}</p>
                <p class="text-xs text-gray-500 mt-1">Last: ${timeAgo(job.lastRun)} (${formatDuration(job.durationMs)})</p>
            </div>
            <div class="text-right text-xs text-gray-500">
                Next: ${timeAgo(job.nextRun).replace('ago', '').trim()}
            </div>
        </div>
    `).join('');
}

function renderActivity(activities) {
    const container = document.getElementById('activity-feed');
    const typeIcons = {
        'completion': '✅',
        'milestone': '🎯',
        'alert': '🚨',
        'system': '⚙️'
    };

    container.innerHTML = activities.slice(0, 6).map(activity => `
        <div class="border-l-2 ${activity.type === 'milestone' ? 'border-primary' : 'border-gray-600'} pl-3 py-2">
            <div class="flex items-start gap-2">
                <span class="text-sm">${typeIcons[activity.type] || '•'}</span>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-100">${activity.title}</p>
                    <p class="text-xs text-gray-400 mt-1">${activity.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${timeAgo(activity.timestamp)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDeadlines(deadlines) {
    const container = document.getElementById('deadlines-list');
    container.innerHTML = deadlines.map(deadline => {
        const urgency = deadline.daysRemaining < 14 ? 'border-error' : deadline.daysRemaining < 30 ? 'border-warning' : 'border-gray-600';
        return `
            <div class="bg-surface-light rounded-lg p-4 border-2 ${urgency}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">${deadline.priority === 'high' ? '🔥' : '📅'}</span>
                    <span class="text-2xl font-bold ${deadline.daysRemaining < 14 ? 'text-error' : 'text-gray-100'}">${deadline.daysRemaining}d</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-100 mb-1">${deadline.name}</h3>
                <p class="text-xs text-gray-400">${new Date(deadline.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
        `;
    }).join('');
}

function updateAgentStatus(status) {
    const indicator = document.getElementById('agent-status');
    const statusDot = document.querySelector('#status-indicator .w-3');
    
    const statusConfig = {
        'active': { text: 'ACTIVE', color: 'text-success', dotColor: 'bg-success' },
        'idle': { text: 'IDLE', color: 'text-gray-400', dotColor: 'bg-gray-400' },
        'error': { text: 'ERROR', color: 'text-error', dotColor: 'bg-error' }
    };
    
    const config = statusConfig[status] || statusConfig['idle'];
    indicator.textContent = config.text;
    indicator.className = `text-sm font-medium ${config.color}`;
    statusDot.className = `w-3 h-3 ${config.dotColor} rounded-full pulse-slow`;
}

// Fetch and render dashboard
async function fetchDashboard() {
    try {
        const response = await fetch('dashboard-state.json?' + Date.now()); // Cache bust
        if (!response.ok) throw new Error('Failed to fetch dashboard state');
        
        dashboardState = await response.json();
        
        // Update last updated time
        const lastUpdated = new Date(dashboardState.meta.lastUpdated);
        const minutesAgo = Math.floor((Date.now() - lastUpdated) / 60000);
        document.getElementById('last-updated').textContent = 
            `Updated ${minutesAgo < 1 ? 'just now' : timeAgo(dashboardState.meta.lastUpdated)}`;
        
        // Update agent status
        updateAgentStatus(dashboardState.meta.agentStatus);
        
        // Render all sections
        renderCurrentActivity(dashboardState);
        renderProjects(dashboardState.projects);
        renderMetrics(dashboardState.metrics);
        renderCronJobs(dashboardState.cronJobs);
        renderActivity(dashboardState.recentActivity);
        renderDeadlines(dashboardState.upcomingDeadlines);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('agent-status').textContent = 'ERROR';
        updateAgentStatus('error');
    }
}

// Initial load and auto-refresh
fetchDashboard();
setInterval(fetchDashboard, 60000); // Refresh every 60 seconds
