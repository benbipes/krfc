# 🐺 Wolfpack Fans Fantasy Football League (KRFC / WFFFL)
### Official Hall of Fame & Historical Record Book (2001 – 2026)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Site-brightgreen?logo=github)](https://benbipes.github.io/krfc/)
[![Seasons](https://img.shields.io/badge/Seasons-25%20Completed-red)](#-championship-ring-leaderboard)
[![Matchups](https://img.shields.io/badge/Total%20Matchups-1%2C854-blue)](#-key-features)
[![Beer Bitch](https://img.shields.io/badge/The%20Loser%20Bowl-Beer%20Bitch%20for%20a%20Year-orange)](#-the-loser-bowl--ultimate-loser-ul-wall-of-shame)

A complete archive and interactive web application celebrating a quarter-century of cutthroat competition, historic rivalries, legendary champions, and unforgettable Ultimate Losers in the **Wolfpack Fans Fantasy Football League (KRFC)**.

---

## 🏆 Championship Ring Leaderboard (By Manager)

Championship rings are awarded to the **managers** who drafted and coached their squads to glory:

| Rings | Manager | Status | Championship Seasons (Team Names) |
| :---: | :--- | :---: | :--- |
| **5** | **Dave Jewell** | Active | **2010**, **2014**, **2016**, **2022**, **2024** (*Cubswin*) |
| **4** | **John Proctor** | Active | **2009**, **2017**, **2018**, **2025** (*Smokers Express*) |
| **4** | **Matt Tyson** | Active | **2006** (*The Mantis*), **2013** (*Mother Puncher*), **2015** (*King Kunta*), **2021** (*The Once Great Champ...*) |
| **4** | **Alex Moise** | Active | **2002**, **2004**, **2011**, **2012** (*Fecal Freaks / Butterbuns*) |
| **3** | **Michael "Mike" Xu** | Active | **2007** (*Xuing*), **2008** (*Xuing*), **2019** (*Paper Tigers, Wispy Dragons*) |
| **2** | **Gregg Russ** | Alumni | **2003** (*PIMPS*), **2005** (*PIMPS*) |
| **1** | **Blaine Bowers** | Active | **2023** (*The Raging Boos*) |
| **1** | **Graham West** | Active | **2020** (*The Turd on the Porch*) |
| **1** | **Charles Matthews** | Alumni | **2001** (*The CAPS*) |
| **0** | **Ben Bipes** | Active | *Hunting 1st Ring* (143–136–0 career record; 1st in Reg Season 2022; Runner-Up 2007) |
| **0** | **Paul O'Sullivan** | Active | *Hunting 1st Ring* (165–187–0 career record; 1st in Reg Season 2017) |
| **0** | **Chris Beatson** | Active | *Hunting 1st Ring* (102–137–0 career record; 1st in Reg Season 2023) |
| **0** | **Cameron Williams** | Alumni | *Hunting 1st Ring* (24–34–0 career record; Runner-Up 2003) |

---

## 🍺 "The Loser Bowl" & Ultimate Loser (UL) Wall of Shame

The last-place tournament in KRFC is officially **"The Loser Bowl"**. The manager who finishes in dead last is crowned the **Ultimate Loser (UL)** and must serve as the league's **"Beer Bitch for a Year"**!

* **Most UL Finishes**: Graham West (4), Chris Beatson (4), Dave Jewell (3), Alex Moise (3), Paul O'Sullivan (3).
* **2025 Ultimate Loser & Reigning Beer Bitch**: Dave Jewell (*Cubswin*).

---

## 🚀 Key Web Application Features

1. **💍 Trophy Room & Championship Rings**: Heavyweight championship ring cards and 25-year timeline.
2. **⚡ 2026 Live Standings & Power Rankings**: Real-time season tracker with CBS Power Rankings, points leaderboards, and the *Beer Bitch Watch* (Loser Bowl countdown).
3. **📊 All-Time Career Standings**: Sortable leaderboard across all 25 seasons tracking wins, win %, PF, PA, and point differential.
4. **⚔️ Head-to-Head Rivalries**: Tale of the Tape comparison between any two managers with series records and a game-by-game log.
5. **👥 Manager Showcase**: Complete profiles for all 13 managers showing 25-year team name evolutions and season-by-season logs.
6. **📜 Record Book & Extremes**:
   * **Highest Single-Game Score**: *Limey's* (Chris Beatson) – **247.0 pts** (2021 Wk 5)
   * **Biggest Blowout**: *Cubswin* (Dave Jewell) – **+157.0 pts** (213 vs 56, 2015 Wk 15)
   * **Highest Combined Shootout**: **419.0 combined pts** (*Funky Monkeys* 236.0 vs *Cubswin* 183.0, 2019 Wk 5)
   * **Longest Winning Streak**: *Xuing* (Michael Xu) – **13 straight wins** (2007)
7. **📅 Year-by-Year Vault (2001–2025)**: Full season archives, final standings, and weekly box scores.
8. **⚡ Live Scoring Button**: Quick launch to live scoring at `https://krfc.football.cbssports.com/scoring/live`.

---

## 🛠️ Automated Weekly Updates

A weekly automation script (`scripts/update_weekly.py`) refreshes 2026 standings and power rankings from CBS Sports Commissioner every Tuesday morning.

```bash
# Manual update
python3 scripts/update_weekly.py
```

---

## 🌐 Hosting via GitHub Pages

This repository is optimized for **GitHub Pages**:
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**.
3. Select **main** branch and `/ (root)` folder.
4. Save — your Hall of Fame will be live at `https://benbipes.github.io/krfc/`.
