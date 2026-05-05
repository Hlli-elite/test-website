function getFrontierSave() {
  return profile?.legendsData?.frontierSaves?.MainSave ?? null;
}

function buildFrontier() {
  const fs = getFrontierSave();
  const missing = !fs;

  const currencyFields = [
    { label: 'Currency (Bananite)',  key: 'currency',       min: 0 },
    { label: 'Lives',                key: 'lives',          min: 0 },
    { label: 'Sheriff Morale',       key: 'sheriffMorale',  min: 0, max: 1600 },
    { label: 'Fishing Rod (1-3)',     key: 'selectedFishingRod', min: 1, max: 3 },
    { label: 'Difficulty (0=Easy)',   key: 'selectedDifficulty', min: 0, max: 2 },
  ];
  renderFrontierFields('frontierCurrencyGrid', currencyFields, fs, missing);

  if (fs) {
    const currInp = document.querySelector('#frontierCurrencyGrid input');
    if (currInp) {
      currInp.addEventListener('change', () => {
        fs.Currency = Number(currInp.value) || 0;
        fs.CurrencyActual = Number(currInp.value) || 0;
      });
    }
  }

  const sheriffDiv = document.getElementById('frontierSheriffGrid');
  if (missing || !fs) {
    sheriffDiv.innerHTML = '<p style="color:#555;font-size:12px;">No Frontier save found.</p>';
  } else {
    sheriffDiv.innerHTML = '';
    const nameWrap = document.createElement('div');
    nameWrap.className = 'field';
    nameWrap.innerHTML = `<label>Sheriff Name</label>`;
    const nameInp = document.createElement('input');
    nameInp.type = 'text';
    nameInp.value = fs.sheriffCustomName ?? '';
    nameInp.addEventListener('change', () => { fs.sheriffCustomName = nameInp.value; });
    nameWrap.appendChild(nameInp);
    sheriffDiv.appendChild(nameWrap);

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'field';
    const badgeCb = document.createElement('input');
    badgeCb.type = 'checkbox';
    badgeCb.checked = fs.hasGainedSheriffBadge === true;
    badgeCb.addEventListener('change', () => { fs.hasGainedSheriffBadge = badgeCb.checked; });
    const badgeLabel = document.createElement('label');
    badgeLabel.style.display = 'flex';
    badgeLabel.style.gap = '6px';
    badgeLabel.style.alignItems = 'center';
    badgeLabel.appendChild(badgeCb);
    badgeLabel.appendChild(document.createTextNode('Has Sheriff Badge'));
    badgeWrap.appendChild(badgeLabel);
    sheriffDiv.appendChild(badgeWrap);
  }

  const powersDiv = document.getElementById('frontierPowersGrid');
  if (missing || !fs) {
    powersDiv.innerHTML = '<p style="color:#555;font-size:12px;">No Frontier save found.</p>';
  } else {
    powersDiv.innerHTML = '';
    const powers = fs.powersData ?? {};
    for (const [pKey, pLabel] of [['HealthPotion','Health Potions'],['StaminaPotion','Stamina Potions']]) {
      const qty = powers[pKey]?.quantity ?? 0;
      const wrap = document.createElement('div');
      wrap.className = 'field';
      wrap.innerHTML = `<label>${pLabel}</label>`;
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = 0;
      inp.value = qty;
      inp.addEventListener('change', () => {
        if (!fs.powersData) fs.powersData = {};
        if (!fs.powersData[pKey]) fs.powersData[pKey] = { quantity: 0, isNew: false };
        fs.powersData[pKey].quantity = Number(inp.value) || 0;
      });
      wrap.appendChild(inp);
      powersDiv.appendChild(wrap);
    }
  }

  const flagsDiv = document.getElementById('frontierFlagsGrid');
  if (missing || !fs) {
    flagsDiv.innerHTML = '<p style="color:#555;font-size:12px;">No Frontier save found.</p>';
  } else {
    flagsDiv.innerHTML = '';
    const flags = [
      { key: 'isEliteMode',         label: 'Elite Mode Active' },
      { key: 'isCampaignCompleted', label: 'Campaign Completed' },
      { key: 'isNightTime',         label: 'Night Time' },
      { key: 'seenFishing',         label: 'Has Seen Fishing' },
      { key: 'hasSeenMovementTutorial', label: 'Has Seen Movement Tutorial' },
    ];
    for (const f of flags) {
      const row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = fs[f.key] === true;
      cb.style.accentColor = '#a5d6a7';
      cb.addEventListener('change', () => { fs[f.key] = cb.checked; });
      row.appendChild(cb);
      row.appendChild(document.createTextNode(f.label));
      flagsDiv.appendChild(row);
    }
  }
}

function renderFrontierFields(gridId, fields, obj, missing) {
  const grid = document.getElementById(gridId);
  if (missing || !obj) {
    grid.innerHTML = '<p style="color:#555;font-size:12px;grid-column:1/-1;">No Frontier save found.</p>';
    return;
  }
  grid.innerHTML = '';
  for (const f of fields) {
    const val = obj[f.key] ?? 0;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    let labelText = f.label;
    if (f.max !== undefined) labelText += ` (max ${f.max})`;
    wrap.innerHTML = `<label>${labelText}</label>`;
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = f.min ?? 0;
    if (f.max !== undefined) inp.max = f.max;
    inp.value = val;
    inp.addEventListener('change', () => {
      let v = Number(inp.value) || 0;
      if (f.max !== undefined) v = Math.min(f.max, v);
      if (f.min !== undefined) v = Math.max(f.min, v);
      inp.value = v;
      obj[f.key] = v;
    });
    wrap.appendChild(inp);
    grid.appendChild(wrap);
  }
}
