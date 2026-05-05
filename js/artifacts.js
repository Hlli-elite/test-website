function getRogueSave() {
  return profile?.legendsData?.rogueSaves?.MainSave ?? null;
}
function getArtifactArray() {
  const rs = getRogueSave();
  if (!rs) return null;
  if (!rs.artifactsInventory) rs.artifactsInventory = [];
  return rs.artifactsInventory;
}
function getArtifactLimit() {
  const rs = getRogueSave();
  return rs?.modifiers?.artifactLimit ?? 50;
}
function isToken(name) {
  return name === 'Token' || name === 'TokenMonkeyMoney' || name === 'TokenRogueXp';
}
function countNonTokenArtifacts() {
  const arr = getArtifactArray();
  if (!arr) return 0;
  return arr.filter(a => !isToken(a.artifactName)).length;
}
function hasArtifact(name) {
  const arr = getArtifactArray();
  if (!arr) return false;
  return arr.some(a => a.artifactName === name);
}
function addArtifact(name) {
  const arr = getArtifactArray();
  if (!arr) return false;
  const d = ARTIFACT_DATA[name];
  if (!d) return false;
  if (!isToken(name) && countNonTokenArtifacts() >= getArtifactLimit()) return false;
  if (hasArtifact(name)) return true;
  arr.push({ artifactName: name, tier: d.tier, baseId: d.baseId, lootType: 1, startingArtifact: false, frontierIds: [] });
  return true;
}
function removeArtifact(name) {
  const arr = getArtifactArray();
  if (!arr) return;
  const idx = arr.findIndex(a => a.artifactName === name);
  if (idx !== -1) arr.splice(idx, 1);
}
function countTokens(name) {
  const arr = getArtifactArray();
  if (!arr) return 0;
  return arr.filter(a => a.artifactName === name).length;
}
function setTokenCount(name, d, qty) {
  const arr = getArtifactArray();
  if (!arr) return;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].artifactName === name) arr.splice(i, 1);
  }
  for (let i = 0; i < qty; i++) {
    arr.push({ artifactName: name, tier: d.tier, baseId: d.baseId, lootType: 1, startingArtifact: false, frontierIds: [] });
  }
}
function updateArtifactCount() {
  const arr = getArtifactArray();
  const limit = getArtifactLimit();
  const nonToken = arr ? arr.filter(a => !isToken(a.artifactName)).length : 0;
  const tokenTotal = arr ? arr.filter(a => isToken(a.artifactName)).length : 0;
  document.getElementById('artifactCount').textContent =
    `${nonToken}/${limit} artifacts  •  ${tokenTotal} token${tokenTotal !== 1 ? 's' : ''}`;
}

let artFilter = 'all';

function buildArtifacts() {
  const grid = document.getElementById('artifactGrid');
  const tokenSection = document.getElementById('tokenSection');
  grid.innerHTML = '';
  tokenSection.innerHTML = '';

  if (!getRogueSave()) {
    grid.innerHTML = '<p style="color:#666;font-size:13px;">No MainSave Rogue data found in this save file.</p>';
    return;
  }

  const TOKEN_NAMES = ['Token', 'TokenMonkeyMoney', 'TokenRogueXp'];
  const TOKEN_LABELS = { Token: 'Trade Token', TokenMonkeyMoney: 'Monkey Money Token', TokenRogueXp: 'Rogue XP Token' };
  const TOKEN_COLORS = { Token: '#ffe082', TokenMonkeyMoney: '#ffcc02', TokenRogueXp: '#ce93d8' };

  for (const tName of TOKEN_NAMES) {
    const d = ARTIFACT_DATA[tName];
    const currentQty = countTokens(tName);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'background:#2a2a1a;border:1px solid #5a4a00;border-radius:4px;padding:8px 12px;display:flex;align-items:center;gap:10px;';
    const label = document.createElement('span');
    label.style.cssText = `font-size:12px;color:${TOKEN_COLORS[tName]};white-space:nowrap;`;
    label.textContent = TOKEN_LABELS[tName];
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = currentQty;
    inp.style.cssText = 'width:70px;';
    inp.dataset.token = tName;
    inp.addEventListener('change', () => {
      const qty = Math.max(0, parseInt(inp.value) || 0);
      inp.value = qty;
      setTokenCount(tName, d, qty);
      updateArtifactCount();
    });
    wrap.appendChild(label);
    wrap.appendChild(inp);
    tokenSection.appendChild(wrap);
  }

  document.getElementById('artifactFilters').addEventListener('click', e => {
    const btn = e.target.closest('.art-filter');
    if (!btn) return;
    artFilter = btn.dataset.f;
    document.querySelectorAll('.art-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterArtifactCards();
  });

  const frag = document.createDocumentFragment();
  for (const [name, d] of Object.entries(ARTIFACT_DATA)) {
    if (isToken(name)) continue;
    const owned = hasArtifact(name);
    const card = document.createElement('div');
    card.className = 'art-card' + (owned ? ' owned' : '');
    card.dataset.type = d.isBossArtifact ? 'boss' : d.rarityFrameType;
    const tierLabel = ['Common','Rare','Legendary'][d.tier] ?? '';
    const tierClass = ['tier-0','tier-1','tier-2'][d.tier] ?? '';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = owned;
    cb.addEventListener('change', () => {
      if (cb.checked) {
        const ok = addArtifact(name);
        if (!ok) {
          cb.checked = false;
          setStatus('err', `Artifact limit (${getArtifactLimit()}) reached — raise it first.`);
          return;
        }
        card.classList.add('owned');
      } else {
        removeArtifact(name);
        card.classList.remove('owned');
      }
      updateArtifactCount();
    });
    const nameEl = document.createElement('span');
    nameEl.className = 'art-name';
    nameEl.title = name;
    nameEl.textContent = name;
    const tierEl = document.createElement('span');
    tierEl.className = `art-tier ${tierClass}`;
    tierEl.textContent = tierLabel;
    card.appendChild(cb);
    card.appendChild(nameEl);
    card.appendChild(tierEl);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
  updateArtifactCount();
}

function filterArtifactCards() {
  document.querySelectorAll('.art-card').forEach(card => {
    const t = card.dataset.type;
    const show = artFilter === 'all'
      || artFilter === t
      || (artFilter === 'boss' && t === 'boss');
    card.style.display = show ? '' : 'none';
  });
}

function artifactMaxLimit() {
  const rs = getRogueSave();
  if (!rs) { setStatus('err', 'No Rogue save found.'); return; }
  if (!rs.modifiers) rs.modifiers = {};
  rs.modifiers.artifactLimit = 9999;
  updateArtifactCount();
  setStatus('ok', 'Artifact limit raised to 9999.');
}

function artifactClearAll() {
  const rs = getRogueSave();
  if (!rs) return;
  rs.artifactsInventory = [];
  document.querySelectorAll('.art-card').forEach(card => {
    card.classList.remove('owned');
    card.querySelector('input').checked = false;
  });
  document.querySelectorAll('#tokenSection input[type="number"]').forEach(inp => inp.value = 0);
  updateArtifactCount();
}
