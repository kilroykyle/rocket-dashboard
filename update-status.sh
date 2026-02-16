#!/bin/bash
# Helper script for Rocket to update the status dashboard

STATUS_FILE="/home/kilroy/.openclaw/workspace/rocket.kylekilroy.com/status.json"

# Function to add a new activity
add_activity() {
    local description="$1"
    local timestamp=$(date -d "now" "+%Y-%m-%d %H:%M EST")
    
    # Read current status
    local temp=$(mktemp)
    
    # Add new activity to the top of the list (uses jq if available)
    if command -v jq &> /dev/null; then
        jq --arg time "$timestamp" --arg desc "$description" \
           '.activities = [{time: $time, description: $desc}] + .activities | .activities = .activities[0:10] | .lastUpdate = (now | strftime("%Y-%m-%dT%H:%M:%S-05:00"))' \
           "$STATUS_FILE" > "$temp" && mv "$temp" "$STATUS_FILE"
        
        # Auto-deploy
        cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
        git add status.json
        git commit -m "Update: $description"
        git push
        
        echo "✅ Activity added and deployed: $description"
    else
        echo "❌ jq not installed. Install with: sudo apt install jq"
        exit 1
    fi
}

# Function to update stats
update_stats() {
    local sites="${1:-4}"
    local repos="${2:-3}"
    local cron="${3:-1}"
    local health="${4:-100}"
    
    if command -v jq &> /dev/null; then
        local temp=$(mktemp)
        jq --arg s "$sites" --arg r "$repos" --arg c "$cron" --arg h "$health" \
           '.stats.sitesDeployed = ($s | tonumber) | 
            .stats.githubRepos = ($r | tonumber) | 
            .stats.cronJobs = ($c | tonumber) | 
            .stats.systemHealth = ($h | tonumber) |
            .lastUpdate = (now | strftime("%Y-%m-%dT%H:%M:%S-05:00"))' \
           "$STATUS_FILE" > "$temp" && mv "$temp" "$STATUS_FILE"
        
        cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
        git add status.json
        git commit -m "Update stats: $sites sites, $repos repos"
        git push
        
        echo "✅ Stats updated and deployed"
    else
        echo "❌ jq not installed"
        exit 1
    fi
}

# Function to update project status
update_project_status() {
    local project_name="$1"
    local new_status="$2" # live, building, or planned
    
    if command -v jq &> /dev/null; then
        local temp=$(mktemp)
        jq --arg name "$project_name" --arg status "$new_status" \
           '(.projects[] | select(.name == $name) | .status) = $status |
            .lastUpdate = (now | strftime("%Y-%m-%dT%H:%M:%S-05:00"))' \
           "$STATUS_FILE" > "$temp" && mv "$temp" "$STATUS_FILE"
        
        cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
        git add status.json
        git commit -m "Update: $project_name -> $new_status"
        git push
        
        echo "✅ Project updated: $project_name -> $new_status"
    else
        echo "❌ jq not installed"
        exit 1
    fi
}

# Function to update system health
update_health() {
    local service="$1"
    local status="$2" # ok, warning, error
    
    if command -v jq &> /dev/null; then
        local temp=$(mktemp)
        jq --arg svc "$service" --arg st "$status" \
           '(.systemHealth[] | select(.label == $svc) | .status) = $st |
            .lastUpdate = (now | strftime("%Y-%m-%dT%H:%M:%S-05:00"))' \
           "$STATUS_FILE" > "$temp" && mv "$temp" "$STATUS_FILE"
        
        cd /home/kilroy/.openclaw/workspace/rocket.kylekilroy.com
        git add status.json
        git commit -m "Health update: $service -> $status"
        git push
        
        echo "✅ Health updated: $service -> $status"
    else
        echo "❌ jq not installed"
        exit 1
    fi
}

# Parse command line arguments
case "$1" in
    activity)
        add_activity "$2"
        ;;
    stats)
        update_stats "$2" "$3" "$4" "$5"
        ;;
    project)
        update_project_status "$2" "$3"
        ;;
    health)
        update_health "$2" "$3"
        ;;
    *)
        echo "Usage:"
        echo "  ./update-status.sh activity 'Description of what I did'"
        echo "  ./update-status.sh stats [sites] [repos] [cron] [health%]"
        echo "  ./update-status.sh project 'Project Name' [live|building|planned]"
        echo "  ./update-status.sh health 'Service Name' [ok|warning|error]"
        echo ""
        echo "Examples:"
        echo "  ./update-status.sh activity '✅ Deployed new feature to kylekilroy.com'"
        echo "  ./update-status.sh stats 5 4 2 100"
        echo "  ./update-status.sh project 'Kilroy Electric' live"
        echo "  ./update-status.sh health 'Daily Briefing' warning"
        exit 1
        ;;
esac
