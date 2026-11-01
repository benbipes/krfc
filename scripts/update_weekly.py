#!/usr/bin/env python3
"""
Weekly Update Script for KRFC Fantasy Football
Fetches live standings and power rankings from CBS Sports Commissioner,
updates data/current_season.json, and re-bundles data/hall_of_fame_data.js.
"""

import os
import re
import json
import urllib.request
from datetime import datetime
from bs4 import BeautifulSoup

def get_cookie():
    cookie = os.environ.get("CBS_COOKIE")
    if cookie:
        return cookie.strip()
    # Check .env file
    env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                if line.startswith("CBS_COOKIE="):
                    val = line.split("=", 1)[1].strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    return val
    return ""

TEAM_TO_MGR_2026 = {
    "butterbuns": "Alex Moise",
    "i'll turn you from a rooster to a hen in one shot": "Matt Tyson",
    "smokers express": "John Proctor",
    "yo mama sux": "Michael Xu",
    "the raging boos": "Blaine Bowers",
    "funky monkeys": "Paul O'Sullivan",
    "dover": "Ben Bipes",
    "cubswin": "Dave Jewell",
    "turd on the porch": "Graham West",
    "claude's clangers": "Chris Beatson"
}

def update():
    cookie = get_cookie()
    if not cookie:
        print("Warning: No CBS_COOKIE provided in environment or .env. Using cached data.")
        return

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": cookie
    }
    
    # 1. Standings
    req_std = urllib.request.Request("https://krfc.football.cbssports.com/standings/overall", headers=headers)
    with urllib.request.urlopen(req_std) as resp:
        html_std = resp.read().decode("utf-8", errors="replace")
        
    # 2. Power Rankings
    req_pr = urllib.request.Request("https://krfc.football.cbssports.com/standings/power-rankings", headers=headers)
    with urllib.request.urlopen(req_pr) as resp:
        html_pr = resp.read().decode("utf-8", errors="replace")
        
    soup_std = BeautifulSoup(html_std, "html.parser")
    table_std = soup_std.find_all("table")[0]
    standings_list = []
    
    for r in table_std.find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
        if len(cols) >= 11:
            team = cols[0]
            mgr = TEAM_TO_MGR_2026.get(team.lower(), "Unknown")
            standings_list.append({
                "team": team,
                "manager": mgr,
                "w": int(cols[1]),
                "l": int(cols[2]),
                "t": int(cols[3]),
                "pct": float(cols[4]),
                "gb": cols[5],
                "streak": cols[6],
                "high_wks": int(cols[7]) if cols[7].isdigit() else 0,
                "pf": float(cols[8].replace(",", "")),
                "pa": float(cols[10].replace(",", ""))
            })
            
    soup_pr = BeautifulSoup(html_pr, "html.parser")
    table_pr = soup_pr.find_all("table")[0]
    power_rankings = []
    
    for r in table_pr.find_all("tr")[1:]:
        cols = [td.get_text(strip=True) for td in r.find_all(["th", "td"])]
        if len(cols) >= 6:
            team = cols[1]
            mgr = TEAM_TO_MGR_2026.get(team.lower(), "Unknown")
            power_rankings.append({
                "rank": cols[0],
                "team": team,
                "manager": mgr,
                "record_pts": cols[2],
                "points_pts": cols[3],
                "breakdown_pts": cols[4],
                "power_score": float(cols[5])
            })
            
    current_data = {
        "season": 2026,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "live_scoring_url": "https://krfc.football.cbssports.com/scoring/live",
        "standings": standings_list,
        "power_rankings": power_rankings
    }
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    with open(os.path.join(data_dir, "current_season.json"), "w") as f:
        json.dump(current_data, f, indent=2)
        
    bundle_data = {
        "overview": json.load(open(os.path.join(data_dir, "league_overview.json"))),
        "franchises": json.load(open(os.path.join(data_dir, "franchises.json"))),
        "managers": json.load(open(os.path.join(data_dir, "managers.json"))),
        "seasons": json.load(open(os.path.join(data_dir, "seasons.json"))),
        "records": json.load(open(os.path.join(data_dir, "records.json"))),
        "matchups": json.load(open(os.path.join(data_dir, "all_matchups.json"))),
        "current_season": current_data
    }
    
    js_content = "window.HOF_DATA = " + json.dumps(bundle_data) + ";"
    with open(os.path.join(data_dir, "hall_of_fame_data.js"), "w") as f:
        f.write(js_content)
        
    print(f"[{datetime.now()}] Successfully updated 2026 Standings and Power Rankings!")

if __name__ == "__main__":
    update()
