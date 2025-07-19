import json
import os

STATS_FILE = "stats.json"

def increment_usage(plugin_id):
    stats = {}
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE, "r") as f:
            stats = json.load(f)
    stats[plugin_id] = stats.get(plugin_id, 0) + 1
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f)

def get_usage():
    if not os.path.exists(STATS_FILE):
        return {}
    with open(STATS_FILE, "r") as f:
        return json.load(f)