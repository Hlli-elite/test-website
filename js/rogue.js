function buildRogueStats() {
  const rs = profile?.legendsData?.rogueSaves?.MainSave;
  const ld = profile?.legendsData;

  const runFields = [
    { label: 'Current Lives',      path: 'rs.lives',                  type: 'number', min: 0 },
    { label: 'Max Lives',          path: 'rs.maxLives',               type: 'number', min: 0 },
    { label: 'Current Stage',      path: 'rs.stage',                  type: 'number', min: 0 },
    { label: 'XP Earned (run)',    path: 'rs.xpEarned',               type: 'number', min: 0 },
    { label: 'Loot Choices',       path: 'rs.lootChoices',            type: 'number', min: 1 },
    { label: 'End-of-Run Rerolls', path: 'rs.endOfGameRerolls',       type: 'number', min: 0 },
    { label: 'Tower Bans',         path: 'rs.towerBans',              type: 'number', min: 0 },
    { label: 'MM Reward Queued',   path: 'rs.queuedMonkeyMoneyReward',type: 'number', min: 0 },
    { label: 'XP Reward Queued',   path: 'rs.queuedRogueXpReward',    type: 'number', min: 0 },
  ];
  renderLegendSection('rogueStatsGrid', runFields, rs, !rs);

  const legendFields = [
    { label: 'Legend XP (total)',  path: 'ld.rogueLegendXp',      type: 'number', min: 0 },
    { label: 'Highest Stage',      path: 'ld.highestStageBeaten', type: 'number', min: 0 },
    { label: 'Rogue Game ID',      path: 'ld.rogueGameId',        type: 'number', min: 0 },
  ];
  renderLegendSection('rogueLegendGrid', legendFields, ld, !ld);

  renderShopSection('rogueXpShopGrid', ld?.unlockedRogueXpShopItems, key => {
    if (!ld.unlockedRogueXpShopItems) ld.unlockedRogueXpShopItems = {};
    ld.unlockedRogueXpShopItems[key] = parseInt(event.target.value) || 0;
  }, !ld);

  renderShopSection('rogueAppliedShopGrid', rs?.appliedRogueXpShopItems, key => {
    if (!rs.appliedRogueXpShopItems) rs.appliedRogueXpShopItems = {};
    rs.appliedRogueXpShopItems[key] = parseInt(event.target.value) || 0;
  }, !rs);
}

function renderLegendSection(gridId, fields, obj, missing) {
  const grid = document.getElementById(gridId);
  if (missing || !obj) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No save data found.</p>';
    return;
  }
  grid.innerHTML = '';
  for (const f of fields) {
    const key = f.path.split('.').pop();
    const val = obj[key] ?? 0;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = `<label>${f.label}</label>`;
    const inp = document.createElement('input');
    inp.type = f.type || 'number';
    inp.min = f.min ?? 0;
    inp.value = val;
    inp.addEventListener('change', () => { obj[key] = Number(inp.value) || 0; });
    wrap.appendChild(inp);
    grid.appendChild(wrap);
  }
}

function renderShopSection(gridId, shopObj, onChange, missing) {
  const grid = document.getElementById(gridId);
  if (missing) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No save data found.</p>';
    return;
  }
  grid.innerHTML = '';
  for (const [key, def] of Object.entries(XP_SHOP_ITEMS)) {
    const val = shopObj?.[key] ?? 0;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = `<label>${def.label}<span style="color:#555;font-size:10px;margin-left:4px;">(max ${def.max})</span></label>`;
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = 0;
    inp.max = def.max;
    inp.value = val;
    inp.addEventListener('change', () => {
      const v = Math.min(def.max, Math.max(0, parseInt(inp.value) || 0));
      inp.value = v;
      if (!shopObj) return;
      shopObj[key] = v;
    });
    wrap.appendChild(inp);
    grid.appendChild(wrap);
  }
}
