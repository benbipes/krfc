// Wolfpack Fans Fantasy Football League Hall of Fame App (Manager-First & Live 2026 Edition)
document.addEventListener("DOMContentLoaded", () => {
  const data = window.HOF_DATA;
  if (!data) {
    console.error("HOF_DATA is missing!");
    return;
  }

  // --- TAB NAVIGATION ---
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add("active");
    });
  });

  // Helper: championship ring icon HTML
  function getRingIcon(size = 26) {
    return `<img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: ${size}px; height: ${size}px;" alt="Championship Ring">`;
  }

  // Helper: multiple ring icons
  function renderRings(count) {
    if (count <= 0) return "";
    return Array(count).fill(getRingIcon(20)).join(" ");
  }

  // Helper: Map (year, team_name) to manager
  const teamYrToMgr = {};
  data.franchises.forEach(f => {
    f.seasons.forEach(s => {
      const yr = s.year;
      const tname = s.team_name.toLowerCase().trim();
      let mgr = s.manager;
      if (["Mike Xu", "Michael Xu", "Fantasy Football Barbie"].includes(mgr)) {
        mgr = "Michael Xu";
      }
      teamYrToMgr[`${yr}_${tname}`] = mgr;
    });
  });

  // 2026 active team to manager lookup
  const team2026ToMgr = {
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
  };

  function resolveManager(year, teamName) {
    if (!teamName) return "Unknown";
    const cleanTeam = teamName.toLowerCase().trim();
    if (year === 2026 && team2026ToMgr[cleanTeam]) {
      return team2026ToMgr[cleanTeam];
    }
    const key = `${year}_${cleanTeam}`;
    return teamYrToMgr[key] || team2026ToMgr[cleanTeam] || "Unknown";
  }

  // --- INITIALIZE ALL MODULES ---
  initTrophyRoom();
  initLive2026();
  initStandings();
  initRivalries();
  initManagerShowcase();
  initRecordBook();
  initYearVault();
  initModal();

  // ==========================================
  // MODULE 1: TROPHY ROOM & RINGS
  // ==========================================
  function initTrophyRoom() {
    const ringsGrid = document.getElementById("ringsGrid");
    const championsGrid = document.getElementById("championsGrid");
    const sackoList = document.getElementById("sackoList");
    const searchInput = document.getElementById("championSearch");

    // Managers sorted by rings desc
    const managers = data.managers.slice().sort((a, b) => {
      if (b.titles_count !== a.titles_count) return b.titles_count - a.titles_count;
      return b.w - a.w;
    });

    // Render Ring Cards
    ringsGrid.innerHTML = managers.map(m => {
      const isChamp = m.titles_count > 0;
      return `
        <div class="ring-card" onclick="window.openManagerModal('${m.name}')" style="cursor: pointer;">
          <div class="ring-icon-wrap">
            <img src="assets/championship_ring.svg" class="champ-ring-icon-lg" style="width: 44px; height: 44px;" alt="Ring">
          </div>
          <div class="ring-card-info" style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h4>
                ${m.name}
                <span class="status-tag ${m.is_active ? 'active' : 'alumni'}">${m.is_active ? 'Active' : 'Alumni'}</span>
              </h4>
              <div class="ring-count">${m.titles_count}</div>
            </div>
            <p>${m.current_team ? `Team: ${m.current_team}` : `Primary: ${m.aliases[0] || 'Member'}`}</p>
            <div class="ring-years">
              ${isChamp 
                ? m.titles.map(t => `<span class="badge-year">${t.year} (${t.team_name})</span>`).join("") 
                : `<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Hunting for 1st Ring (${m.seasons_count} Seasons)</span>`}
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Build 25 Champions list
    const championsList = [];
    for (let yr = 2025; yr >= 2001; yr--) {
      const s = data.seasons[yr];
      let champTeam = data.overview.champions_by_year[yr] || (s ? s.champion : "Unknown");
      let winningManager = resolveManager(yr, champTeam);
      let franchiseName = "";

      data.franchises.forEach(f => {
        const found = f.seasons.find(ss => ss.year === yr && ss.finish && ss.finish.toUpperCase().includes("CHAMP"));
        if (found) {
          franchiseName = f.name;
          winningManager = found.manager || winningManager;
          champTeam = found.team_name || champTeam;
        }
      });

      if (["Mike Xu", "Fantasy Football Barbie"].includes(winningManager)) {
        winningManager = "Michael Xu";
      }

      championsList.push({
        year: yr,
        manager: winningManager,
        teamName: champTeam,
        franchise: franchiseName,
        runnerUp: s ? s.ultimate_loser : ""
      });
    }

    function renderChampions(filter = "") {
      const query = filter.toLowerCase();
      const filtered = championsList.filter(c => 
        c.manager.toLowerCase().includes(query) ||
        c.teamName.toLowerCase().includes(query) ||
        c.year.toString().includes(query)
      );

      championsGrid.innerHTML = filtered.map(c => `
        <div class="champion-card" onclick="window.openManagerModal('${c.manager}')" style="cursor: pointer;">
          <div class="champ-year-header">
            <span class="champ-year">${c.year} Champion</span>
            <span class="champ-badge">
              <img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: 16px; height: 16px;" alt="Ring"> Ring
            </span>
          </div>
          <div class="champ-mgr-name">${c.manager}</div>
          <div class="champ-team-used">Team: "${c.teamName}"</div>
          <div class="champ-details">
            <span>Franchise: <strong>${c.franchise || 'WFFFL'}</strong></span>
            <span>Season #${c.year - 2000}</span>
          </div>
        </div>
      `).join("");
    }

    renderChampions();

    searchInput.addEventListener("input", (e) => {
      renderChampions(e.target.value);
    });

    // Render The Loser Bowl UL / Beer Bitch Wall of Shame
    const sackos = [];
    for (let yr = 2025; yr >= 2001; yr--) {
      const s = data.seasons[yr];
      if (s && s.ultimate_loser) {
        let loserMgr = resolveManager(yr, s.ultimate_loser);
        sackos.push({
          year: yr,
          team: s.ultimate_loser,
          manager: loserMgr
        });
      }
    }

    sackoList.innerHTML = sackos.map(sk => `
      <div style="background: rgba(31, 41, 55, 0.9); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 0.4rem; padding: 0.45rem 0.8rem; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
        <span class="badge-ul">🍺 ${sk.year} UL</span>
        <span style="color: #ffffff; font-weight: 800;">${sk.manager}</span>
        <span style="color: var(--text-muted); font-size: 0.75rem;">("${sk.team}")</span>
      </div>
    `).join("");
  }

  // ==========================================
  // MODULE 2: 2026 LIVE STANDINGS & POWER RANKINGS
  // ==========================================
  function initLive2026() {
    const live = data.current_season;
    if (!live) return;

    const updatedEl = document.getElementById("liveUpdatedNotice");
    if (updatedEl && live.last_updated) {
      updatedEl.textContent = `CBS Sports Live Data • Updated ${live.last_updated} (Refreshed automatically every Tuesday morning)`;
    }

    // Live Standings Table
    const stdBody = document.getElementById("liveStandingsBody");
    if (stdBody && live.standings) {
      stdBody.innerHTML = live.standings.map((st, idx) => {
        const diff = Math.round((st.pf - st.pa) * 10) / 10;
        const isLeader = idx === 0;
        const isBeerBitchZone = idx >= 8;
        return `
          <tr class="${isLeader ? 'highlight' : (isBeerBitchZone ? 'danger-row' : '')}" onclick="window.openManagerModal('${st.manager}')" style="cursor: pointer;" title="Click to view manager dossier">
            <td style="font-weight: 800; color: ${isLeader ? 'var(--gold)' : (isBeerBitchZone ? '#f87171' : 'var(--text-secondary)')};">
              ${isLeader ? '🥇 1st' : (idx === 1 ? '🥈 2nd' : (idx === 2 ? '🥉 3rd' : (isBeerBitchZone ? `🍺 ${idx + 1}th` : `${idx + 1}th`)))}
            </td>
            <td style="font-weight: 800; color: #ffffff;">
              ${st.manager}
              ${isLeader ? getRingIcon(16) : ''}
              ${isBeerBitchZone ? `<span style="font-size: 0.7rem; color: #ef4444; margin-left: 0.3rem;">[UL Watch]</span>` : ''}
            </td>
            <td style="color: var(--text-secondary); font-weight: 600;">${st.team}</td>
            <td style="font-weight: 800; color: #4ade80;">${st.w}</td>
            <td style="color: #f87171;">${st.l}</td>
            <td>${st.t}</td>
            <td style="font-weight: 700;">${(st.pct * 100).toFixed(1)}%</td>
            <td style="color: var(--text-muted);">${st.gb}</td>
            <td style="font-weight: 700; color: ${st.streak.startsWith('W') ? '#4ade80' : '#f87171'};">${st.streak}</td>
            <td>${st.high_wks}</td>
            <td style="font-weight: 800; color: #ffffff;">${st.pf.toLocaleString()}</td>
            <td>${st.pa.toLocaleString()}</td>
            <td style="color: ${diff >= 0 ? '#4ade80' : '#f87171'}; font-weight: 700;">
              ${diff > 0 ? '+' : ''}${diff.toLocaleString()}
            </td>
          </tr>
        `;
      }).join("");
    }

    // Live Power Rankings Table
    const prBody = document.getElementById("livePowerRankingsBody");
    if (prBody && live.power_rankings) {
      prBody.innerHTML = live.power_rankings.map(pr => `
        <tr onclick="window.openManagerModal('${pr.manager}')" style="cursor: pointer;">
          <td style="font-weight: 800; color: var(--gold); font-size: 1.05rem;">#${pr.rank}</td>
          <td style="font-weight: 800; color: #ffffff;">${pr.manager}</td>
          <td style="color: var(--text-secondary);">${pr.team}</td>
          <td style="font-weight: 900; color: #38bdf8; font-size: 1.15rem;">${pr.power_score.toFixed(1)}</td>
          <td>${pr.record_pts}</td>
          <td>${pr.points_pts}</td>
          <td>${pr.breakdown_pts}</td>
        </tr>
      `).join("");
    }
  }

  // ==========================================
  // MODULE 3: ALL-TIME STANDINGS (MANAGER-FIRST)
  // ==========================================
  function initStandings() {
    const tableBody = document.getElementById("standingsTableBody");
    const searchInput = document.getElementById("standingsSearch");
    const headers = document.querySelectorAll("#standingsTable th");

    const rows = data.managers.map(m => {
      const avgPts = m.seasons_count > 0 ? Math.round(m.pf / m.seasons_count) : 0;
      return {
        manager: m.name,
        status: m.is_active ? "Active" : "Alumni",
        titles: m.titles_count,
        seasons: m.seasons_count,
        w: m.w,
        l: m.l,
        t: m.t,
        pct: m.pct,
        pf: m.pf,
        pa: m.pa,
        diff: m.diff,
        avg_pts: avgPts,
        team: m.current_team || (m.aliases[0] || "-")
      };
    });

    let currentSort = "titles";
    let sortDir = -1; // descending

    function renderStandings(filter = "") {
      const query = filter.toLowerCase();
      let list = rows.filter(r => 
        r.manager.toLowerCase().includes(query) || 
        r.team.toLowerCase().includes(query)
      );

      list.sort((a, b) => {
        let valA = a[currentSort];
        let valB = b[currentSort];

        if (valA === valB) {
          return sortDir * (b.w - a.w);
        }

        if (typeof valA === "string") {
          return sortDir * valA.localeCompare(valB);
        }
        return sortDir * (valA - valB);
      });

      tableBody.innerHTML = list.map((r, idx) => `
        <tr onclick="window.openManagerModal('${r.manager}')" style="cursor: pointer;" title="Click to view full manager dossier">
          <td style="font-weight: 800; color: var(--gold);">${idx + 1}</td>
          <td style="font-weight: 800; color: #ffffff;">
            ${r.manager}
            <div style="font-size: 0.75rem; color: var(--text-muted);">${renderRings(r.titles)}</div>
          </td>
          <td>
            <span class="status-tag ${r.status === 'Active' ? 'active' : 'alumni'}">${r.status}</span>
          </td>
          <td style="font-weight: 900; color: var(--gold); font-size: 1.05rem;">${r.titles}</td>
          <td style="color: var(--text-secondary);">${r.seasons}</td>
          <td style="font-weight: 800; color: #4ade80;">${r.w}</td>
          <td style="color: #f87171;">${r.l}</td>
          <td style="font-weight: 700;">${(r.pct * 100).toFixed(1)}%</td>
          <td>${r.pf.toLocaleString()}</td>
          <td>${r.pa.toLocaleString()}</td>
          <td style="color: ${r.diff >= 0 ? '#4ade80' : '#f87171'}; font-weight: 700;">
            ${r.diff > 0 ? '+' : ''}${r.diff.toLocaleString()}
          </td>
          <td>${r.avg_pts.toLocaleString()}</td>
          <td style="color: var(--text-secondary); font-size: 0.85rem;">${r.team}</td>
        </tr>
      `).join("");
    }

    renderStandings();

    searchInput.addEventListener("input", (e) => {
      renderStandings(e.target.value);
    });

    headers.forEach(th => {
      th.addEventListener("click", () => {
        const field = th.getAttribute("data-sort");
        if (field === "rank") return;

        if (currentSort === field) {
          sortDir = -sortDir;
        } else {
          currentSort = field;
          sortDir = -1;
        }

        headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));
        th.classList.add(sortDir === 1 ? "sorted-asc" : "sorted-desc");

        renderStandings(searchInput.value);
      });
    });
  }

  // ==========================================
  // MODULE 4: HEAD-TO-HEAD RIVALRIES
  // ==========================================
  function initRivalries() {
    const selectA = document.getElementById("h2hManagerA");
    const selectB = document.getElementById("h2hManagerB");
    const resultsContainer = document.getElementById("h2hResultsContainer");

    const managers = data.managers;

    managers.forEach((m, idx) => {
      const optA = document.createElement("option");
      optA.value = m.name;
      optA.textContent = `${m.name} (${m.titles_count} Rings, ${m.w}-${m.l})`;
      if (m.name === "Ben Bipes") optA.selected = true;
      selectA.appendChild(optA);

      const optB = document.createElement("option");
      optB.value = m.name;
      optB.textContent = `${m.name} (${m.titles_count} Rings, ${m.w}-${m.l})`;
      if (m.name === "John Proctor") optB.selected = true;
      selectB.appendChild(optB);
    });

    function updateH2H() {
      const nameA = selectA.value;
      const nameB = selectB.value;

      if (nameA === nameB) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
            Please select two different managers to compare their all-time head-to-head rivalry.
          </div>
        `;
        return;
      }

      const mA = managers.find(m => m.name === nameA);
      const mB = managers.find(m => m.name === nameB);

      const rivalryGames = [];
      data.matchups.forEach(m => {
        const awayMgr = resolveManager(m.year, m.away_team);
        const homeMgr = resolveManager(m.year, m.home_team);

        const isAHome = homeMgr === nameA && awayMgr === nameB;
        const isAAway = awayMgr === nameA && homeMgr === nameB;

        if (isAHome || isAAway) {
          rivalryGames.push({
            year: m.year,
            week: m.week,
            away_team: m.away_team,
            home_team: m.home_team,
            away_score: m.away_score,
            home_score: m.home_score,
            away_mgr: awayMgr,
            home_mgr: homeMgr,
            diff: m.diff,
            winner_mgr: m.away_score > m.home_score ? awayMgr : (m.home_score > m.away_score ? homeMgr : "Tie")
          });
        }
      });

      let winsA = 0;
      let winsB = 0;
      let ties = 0;
      let ptsA = 0;
      let ptsB = 0;

      rivalryGames.forEach(g => {
        if (g.away_mgr === nameA) ptsA += g.away_score;
        else ptsB += g.away_score;

        if (g.home_mgr === nameA) ptsA += g.home_score;
        else ptsB += g.home_score;

        if (g.winner_mgr === nameA) winsA++;
        else if (g.winner_mgr === nameB) winsB++;
        else ties++;
      });

      const totalGames = rivalryGames.length;
      const pctA = totalGames > 0 ? ((winsA / totalGames) * 100).toFixed(1) : "0.0";
      const pctB = totalGames > 0 ? ((winsB / totalGames) * 100).toFixed(1) : "0.0";
      const avgA = totalGames > 0 ? (ptsA / totalGames).toFixed(1) : "0.0";
      const avgB = totalGames > 0 ? (ptsB / totalGames).toFixed(1) : "0.0";

      resultsContainer.innerHTML = `
        <div class="h2h-scorecard">
          <div class="h2h-tale">
            <div class="h2h-team-col">
              <div class="h2h-mgr-title">${mA.name}</div>
              <div class="h2h-team-mgr">${mA.is_active ? 'Active' : 'Alumni'} • ${renderRings(mA.titles_count)}</div>
              <div class="h2h-team-wins">${winsA}</div>
              <div class="h2h-games-total">Wins (${pctA}%)</div>
            </div>

            <div class="h2h-middle">
              <div class="h2h-ties">${ties} Ties</div>
              <div class="h2h-games-total">${totalGames} Total Matchups</div>
              <div style="margin-top: 0.6rem; font-size: 0.8rem; color: var(--gold); font-weight: 700;">
                All-Time Series Record
              </div>
            </div>

            <div class="h2h-team-col">
              <div class="h2h-mgr-title">${mB.name}</div>
              <div class="h2h-team-mgr">${mB.is_active ? 'Active' : 'Alumni'} • ${renderRings(mB.titles_count)}</div>
              <div class="h2h-team-wins" style="color: var(--blue);">${winsB}</div>
              <div class="h2h-games-total">Wins (${pctB}%)</div>
            </div>
          </div>

          <div class="h2h-stats-grid">
            <div class="h2h-stat-box">
              <div class="h2h-stat-val">${ptsA.toLocaleString()}</div>
              <div class="h2h-stat-lbl">${mA.name} Total Points</div>
            </div>
            <div class="h2h-stat-box">
              <div class="h2h-stat-val">${avgA} vs ${avgB}</div>
              <div class="h2h-stat-lbl">Average Score / Matchup</div>
            </div>
            <div class="h2h-stat-box">
              <div class="h2h-stat-val">${ptsB.toLocaleString()}</div>
              <div class="h2h-stat-lbl">${mB.name} Total Points</div>
            </div>
          </div>

          <h4 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem;">
            Chronological Rivalry Log (${totalGames} Games)
          </h4>
          ${totalGames > 0 ? `
            <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Week</th>
                    <th>Matchup (Team Names)</th>
                    <th>Score</th>
                    <th>Winner</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  ${rivalryGames.slice().reverse().map(g => {
                    const isWinA = g.winner_mgr === nameA;
                    const isWinB = g.winner_mgr === nameB;
                    return `
                      <tr>
                        <td style="font-weight: 800;">${g.year}</td>
                        <td>Week ${g.week}</td>
                        <td>${g.away_team} @ ${g.home_team}</td>
                        <td style="font-weight: 800; color: #ffffff;">${g.away_score} - ${g.home_score}</td>
                        <td style="font-weight: 800; color: ${isWinA ? '#4ade80' : (isWinB ? '#60a5fa' : 'var(--text-secondary)')};">
                          ${g.winner_mgr}
                        </td>
                        <td>+${g.diff} pts</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          ` : `
            <p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No historical head-to-head games found between these two managers.</p>
          `}
        </div>
      `;
    }

    selectA.addEventListener("change", updateH2H);
    selectB.addEventListener("change", updateH2H);
    updateH2H();
  }

  // ==========================================
  // MODULE 5: MANAGER SHOWCASE
  // ==========================================
  function initManagerShowcase() {
    const grid = document.getElementById("managersGrid");

    grid.innerHTML = data.managers.map(m => {
      const avgPts = m.seasons_count > 0 ? Math.round(m.pf / m.seasons_count) : 0;
      return `
        <div class="manager-card" onclick="window.openManagerModal('${m.name}')">
          <div class="m-card-header">
            <div>
              <div class="m-title">
                ${m.name}
                <span class="status-tag ${m.is_active ? 'active' : 'alumni'}">${m.is_active ? 'Active' : 'Alumni'}</span>
              </div>
              <div class="m-tenure">Tenure: ${m.tenure_str} (${m.seasons_count} Seasons)</div>
            </div>
            ${m.titles_count > 0 ? `
              <div class="m-rings-badge">
                <img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: 18px; height: 18px;" alt="Ring">
                ${m.titles_count} Ring${m.titles_count > 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>

          <div class="m-stats-row">
            <div class="m-stat-item">
              <div class="val">${m.w}</div>
              <div class="lbl">Wins</div>
            </div>
            <div class="m-stat-item">
              <div class="val">${m.l}</div>
              <div class="lbl">Losses</div>
            </div>
            <div class="m-stat-item">
              <div class="val">${(m.pct * 100).toFixed(0)}%</div>
              <div class="lbl">Win Pct</div>
            </div>
            <div class="m-stat-item">
              <div class="val">${Math.round(m.pf / 1000)}k</div>
              <div class="lbl">Total PF</div>
            </div>
          </div>

          <div class="m-aliases">
            <strong>Historical Team Names (${m.aliases.length}):</strong><br>
            ${m.aliases.slice(0, 5).join(", ")}${m.aliases.length > 5 ? '...' : ''}
          </div>
        </div>
      `;
    }).join("");
  }

  // ==========================================
  // MODULE 6: RECORD BOOK
  // ==========================================
  function initRecordBook() {
    const container = document.getElementById("recordsListContainer");

    const categories = [
      { key: "rb_mpsg", title: "Highest Single Game Scores", icon: "🔥" },
      { key: "rb_bmvg", title: "Largest Blowouts & Margin of Victory", icon: "💥" },
      { key: "rb_mpss", title: "Most Points Scored in a Season", icon: "🚀" },
      { key: "rb_hags", title: "Highest Average Points Per Game (Season)", icon: "🎯" },
      { key: "rb_hwps", title: "Best Regular Season Win Percentage", icon: "🏆" },
      { key: "rb_lwss", title: "Longest Winning Streaks", icon: "⚡" },
      { key: "rb_mhws", title: "Most High-Scoring Weeks in a Season", icon: "👑" },
      { key: "rb_mpag", title: "Most Points Allowed in a Single Game", icon: "🛡️" }
    ];

    container.innerHTML = categories.map(cat => {
      const recObj = data.records[cat.key];
      if (!recObj || !recObj.records) return "";

      const firstSubKey = Object.keys(recObj.records)[0];
      const items = recObj.records[firstSubKey] || [];

      return `
        <div class="record-category-card">
          <div class="record-cat-title">
            <span>${cat.icon}</span>
            <span>${recObj.title}</span>
          </div>
          <div class="record-items-list">
            ${items.slice(0, 5).map((item, idx) => {
              const mgr = resolveManager(parseInt(item.year, 10), item.team);
              return `
                <div class="record-item-row">
                  <span class="rank">#${idx + 1}</span>
                  <span class="name">
                    <strong>${mgr !== 'Unknown' ? mgr : item.team}</strong>
                    <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.4rem;">("${item.team}")</span>
                  </span>
                  <span class="year">${item.year}</span>
                  <span class="val">${item.value} ${recObj.unit}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  // ==========================================
  // MODULE 7: YEAR-BY-YEAR VAULT
  // ==========================================
  function initYearVault() {
    const pillsContainer = document.getElementById("yearPills");
    const detailContainer = document.getElementById("yearVaultDetail");

    const years = [];
    for (let yr = 2025; yr >= 2001; yr--) years.push(yr);

    pillsContainer.innerHTML = years.map((yr, idx) => `
      <button class="year-pill-btn ${idx === 0 ? 'active' : ''}" data-year="${yr}">
        ${yr}
      </button>
    `).join("");

    function renderYear(year) {
      const s = data.seasons[year];
      if (!s) {
        detailContainer.innerHTML = `<p>No records found for ${year}</p>`;
        return;
      }

      const champMgr = resolveManager(year, s.champion);
      const sackoMgr = resolveManager(year, s.ultimate_loser);

      detailContainer.innerHTML = `
        <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(180deg, #1f2937 0%, #111827 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="font-size: 1.8rem; font-weight: 900; color: #ffffff;">
                ${year} Season Vault
              </h3>
              <p style="color: var(--text-secondary);">Season #${year - 2000} of Wolfpack Fans Fantasy Football</p>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid var(--gold); border-radius: 0.5rem; padding: 0.6rem 1.1rem; display: flex; align-items: center; gap: 0.75rem;">
                <img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: 32px; height: 32px;" alt="Ring">
                <div>
                  <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--gold); font-weight: 800;">Championship Ring Winner</div>
                  <div style="font-size: 1.15rem; font-weight: 900; color: #ffffff;">${champMgr} <span style="font-size: 0.85rem; color: #ff6b6b;">("${s.champion}")</span></div>
                </div>
              </div>
              ${s.ultimate_loser ? `
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 0.5rem; padding: 0.6rem 1.1rem;">
                  <div style="font-size: 0.7rem; text-transform: uppercase; color: #ef4444; font-weight: 800;">🍺 The Loser Bowl UL (Beer Bitch)</div>
                  <div style="font-size: 1.15rem; font-weight: 900; color: #ffffff;">${sackoMgr} <span style="font-size: 0.85rem; color: var(--text-muted);">("${s.ultimate_loser}")</span></div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- FINAL STANDINGS WITH MANAGERS -->
        <h4 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 0.75rem;">📊 Final ${year} Standings</h4>
        <div class="table-responsive" style="margin-bottom: 2rem;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Manager</th>
                <th>Team Name Used</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>Win %</th>
                <th>Points For (PF)</th>
                <th>Points Against (PA)</th>
                <th>Top Weeks</th>
              </tr>
            </thead>
            <tbody>
              ${s.standings.map((st, idx) => {
                const mgr = resolveManager(year, st.team);
                return `
                  <tr class="${idx === 0 ? 'highlight' : ''}">
                    <td style="font-weight: 800; color: ${idx === 0 ? 'var(--gold)' : 'var(--text-secondary)'};">
                      ${idx === 0 ? '🥇 1st' : (idx === 1 ? '🥈 2nd' : (idx === 2 ? '🥉 3rd' : `${idx + 1}th`))}
                    </td>
                    <td style="font-weight: 800; color: #ffffff;">
                      ${mgr}
                      ${idx === 0 ? getRingIcon(18) : ''}
                    </td>
                    <td style="color: var(--text-secondary);">${st.team}</td>
                    <td style="font-weight: 800; color: #4ade80;">${st.w}</td>
                    <td style="color: #f87171;">${st.l}</td>
                    <td>${st.t}</td>
                    <td>${(st.pct * 100).toFixed(1)}%</td>
                    <td style="font-weight: 700;">${st.pf.toLocaleString()}</td>
                    <td>${st.pa.toLocaleString()}</td>
                    <td>${st.high_wks || 0}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <!-- WEEKLY MATCHUPS -->
        <h4 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 0.75rem;">🏈 Full ${year} Schedule & Matchup Results (${s.matchups.length} Games)</h4>
        <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Away Manager (Team)</th>
                <th>Score</th>
                <th>Home Manager (Team)</th>
                <th>Winner</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              ${s.matchups.map(m => {
                const awayMgr = resolveManager(year, m.away_team);
                const homeMgr = resolveManager(year, m.home_team);
                const winMgr = resolveManager(year, m.winner);
                return `
                  <tr>
                    <td style="font-weight: 700;">Week ${m.week}</td>
                    <td>
                      <strong>${awayMgr}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${m.away_team}</span>
                    </td>
                    <td style="font-weight: 900; color: #ffffff; font-size: 1rem;">${m.away_score} - ${m.home_score}</td>
                    <td>
                      <strong>${homeMgr}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${m.home_team}</span>
                    </td>
                    <td style="font-weight: 800; color: #4ade80;">${winMgr !== 'Unknown' ? winMgr : m.winner}</td>
                    <td>+${m.diff} pts</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    renderYear(2025);

    pillsContainer.querySelectorAll(".year-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        pillsContainer.querySelectorAll(".year-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderYear(parseInt(btn.getAttribute("data-year"), 10));
      });
    });
  }

  // ==========================================
  // MODULE 8: MANAGER DOSSIER MODAL
  // ==========================================
  function initModal() {
    const modal = document.getElementById("managerModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    const content = document.getElementById("modalContent");

    closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });

    window.openManagerModal = function(managerName) {
      const m = data.managers.find(item => item.name.toLowerCase() === managerName.toLowerCase());
      if (!m) return;

      content.innerHTML = `
        <div style="border-bottom: 2px solid var(--wolfpack-red); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 2.2rem; font-weight: 900; color: #ffffff;">
                ${m.name}
                <span class="status-tag ${m.is_active ? 'active' : 'alumni'}">${m.is_active ? 'Active' : 'Alumni'}</span>
              </h2>
              <div style="color: #ff6b6b; font-size: 1rem; font-weight: 700;">
                League Tenure: ${m.tenure_str} (${m.seasons_count} Seasons Competed)
              </div>
            </div>
            ${m.titles_count > 0 ? `
              <div class="m-rings-badge" style="font-size: 1.1rem; padding: 0.5rem 1rem;">
                <img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: 26px; height: 26px;" alt="Ring">
                ${m.titles_count} Championship Ring${m.titles_count > 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- CAREER STATS -->
        <div class="h2h-stats-grid" style="margin-bottom: 1.5rem;">
          <div class="h2h-stat-box">
            <div class="h2h-stat-val" style="color: #4ade80;">${m.w} - ${m.l} - ${m.t}</div>
            <div class="h2h-stat-lbl">Career Record (${(m.pct * 100).toFixed(1)}%)</div>
          </div>
          <div class="h2h-stat-box">
            <div class="h2h-stat-val">${m.pf.toLocaleString()}</div>
            <div class="h2h-stat-lbl">Career Points Scored</div>
          </div>
          <div class="h2h-stat-box">
            <div class="h2h-stat-val">${m.pa.toLocaleString()}</div>
            <div class="h2h-stat-lbl">Career Points Allowed</div>
          </div>
          <div class="h2h-stat-box">
            <div class="h2h-stat-val" style="color: ${m.diff >= 0 ? '#4ade80' : '#f87171'};">
              ${m.diff > 0 ? '+' : ''}${m.diff.toLocaleString()}
            </div>
            <div class="h2h-stat-lbl">Point Differential</div>
          </div>
        </div>

        <!-- CHAMPIONSHIPS WON -->
        ${m.titles_count > 0 ? `
          <div style="margin-bottom: 1.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--gold); padding: 1.25rem; border-radius: 0.6rem;">
            <h4 style="color: var(--gold); text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.05em; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <img src="assets/championship_ring.svg" class="champ-ring-icon" style="width: 22px; height: 22px;" alt="Ring">
              Championship Rings Hoisted (${m.titles_count})
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
              ${m.titles.map(t => `
                <div style="background: rgba(17, 24, 39, 0.8); border: 1px solid var(--gold); border-radius: 0.4rem; padding: 0.5rem 0.85rem;">
                  <span style="font-weight: 800; color: var(--gold); font-size: 1rem;">${t.year}</span>:
                  <strong style="color: #ffffff;">"${t.team_name}"</strong>
                  <span style="color: var(--text-secondary); font-size: 0.8rem;">(${t.record})</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- SACKOS / BEER BITCH REIGNS -->
        ${m.sackos_count > 0 ? `
          <div style="margin-bottom: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem 1.25rem; border-radius: 0.6rem;">
            <h4 style="color: #ef4444; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              🍺 The Loser Bowl: Ultimate Loser (UL) & Beer Bitch Duties (${m.sackos_count}):
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${m.sackos.map(sk => `
                <span class="badge-ul">🍺 ${sk.year}: "${sk.team_name}"</span>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- TEAM NAME EVOLUTION -->
        <div style="margin-bottom: 1.5rem; background: rgba(17, 24, 39, 0.6); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
          <strong style="color: var(--gold); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Historical Team Names (${m.aliases.length}):</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem;">
            ${m.aliases.map(name => `<span class="badge-year" style="color: #ffffff; border-color: var(--border-color);">${name}</span>`).join("")}
          </div>
        </div>

        <!-- HEAD TO HEAD SUMMARY -->
        <h4 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 0.75rem;">⚔️ Head-to-Head Record vs Opponents</h4>
        <div class="table-responsive" style="margin-bottom: 1.5rem; max-height: 320px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Opponent</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>Win %</th>
                <th>Points For</th>
                <th>Points Against</th>
                <th>Games</th>
              </tr>
            </thead>
            <tbody>
              ${m.head_to_head.map(h => `
                <tr>
                  <td style="font-weight: 700; color: #ffffff;">${h.opponent}</td>
                  <td style="color: #4ade80; font-weight: 800;">${h.w}</td>
                  <td style="color: #f87171;">${h.l}</td>
                  <td>${h.t}</td>
                  <td style="font-weight: 700;">${(h.pct * 100).toFixed(1)}%</td>
                  <td>${h.pts_for.toLocaleString()}</td>
                  <td>${h.pts_against.toLocaleString()}</td>
                  <td>${h.games_count}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- SEASON BY SEASON -->
        <h4 style="font-size: 1.1rem; color: #ffffff; margin-bottom: 0.75rem;">📅 Season-by-Season Career Log</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Team Name Used</th>
                <th>Franchise</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>Win %</th>
                <th>PF</th>
                <th>PA</th>
                <th>Finish</th>
              </tr>
            </thead>
            <tbody>
              ${m.season_log.map(s => {
                const isChamp = s.finish && s.finish.toUpperCase().includes('CHAMP');
                return `
                  <tr class="${isChamp ? 'highlight' : ''}">
                    <td style="font-weight: 800;">${s.year}</td>
                    <td style="color: #ffffff; font-weight: 600;">${s.team_name}</td>
                    <td style="color: var(--text-secondary);">${s.franchise}</td>
                    <td style="color: #4ade80; font-weight: 800;">${s.w}</td>
                    <td style="color: #f87171;">${s.l}</td>
                    <td>${s.t}</td>
                    <td>${(s.pct * 100).toFixed(1)}%</td>
                    <td>${s.pf.toLocaleString()}</td>
                    <td>${s.pa.toLocaleString()}</td>
                    <td style="font-weight: 800; color: ${isChamp ? 'var(--gold)' : 'var(--text-primary)'};">
                      ${isChamp ? getRingIcon(16) + ' CHAMPION' : s.finish}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;

      modal.classList.add("open");
    };
  }
});
