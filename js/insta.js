function calcCrosspath(num) {
  return {
    is_new:   Boolean(num & 1),
    path1:    (num >> 1) & 7,
    path2:    (num >> 4) & 7,
    path3:    (num >> 7) & 7,
    quantity: (num >> 10) & 262143,
  };
}

function encodeCrosspath(quantity, path1, path2, path3, is_new = false) {
  const p1 = parseInt(path1), p2 = parseInt(path2), p3 = parseInt(path3);
  return (quantity << 10) | (p3 << 7) | (p2 << 4) | (p1 << 1) | (is_new ? 1 : 0);
}

function buildInstaLookup(towerArr) {
  const lookup = {};
  if (!Array.isArray(towerArr)) return lookup;
  for (const encoded of towerArr) {
    const d = calcCrosspath(encoded);
    lookup[`${d.path1}-${d.path2}-${d.path3}`] = d.quantity;
  }
  return lookup;
}

function lookupToArray(lookup) {
  const arr = [];
  for (const [cp, qty] of Object.entries(lookup)) {
    if (qty <= 0) continue;
    arr.push(encodeCrosspath(qty, cp[0], cp[2], cp[4], false));
  }
  return arr;
}

let currentInstaTower = TOWERS[0][0];
let instaShowAll = false;

function buildInstaTabs() {
  const tabsEl = document.getElementById('instaTowerTabs');
  tabsEl.innerHTML = '';
  for (const [tKey, tName] of TOWERS) {
    const tab = document.createElement('div');
    tab.className = 'insta-tab' + (tKey === currentInstaTower ? ' active' : '');
    tab.textContent = tName;
    tab.dataset.tower = tKey;
    tab.onclick = () => activateInstaTab(tKey);
    tabsEl.appendChild(tab);
  }
  const panelsEl = document.getElementById('instaPanels');
  panelsEl.addEventListener('change', () => {
    const lookup = {};
    panelsEl.querySelectorAll('input').forEach(inp => {
      const cp = inp.dataset.cp;
      if (!cp) return;
      lookup[cp] = parseInt(inp.value) || 0;
    });
    if (!profile.instaTowers) profile.instaTowers = {};
    profile.instaTowers[currentInstaTower] = lookupToArray(lookup);
  });
}

function activateInstaTab(tKey) {
  flushHeavy('instas');
  currentInstaTower = tKey;
  document.querySelectorAll('.insta-tab').forEach(t => t.classList.toggle('active', t.dataset.tower === tKey));
  renderInstaPanel(tKey);
}

function renderInstaPanel(tKey) {
  const panelsEl = document.getElementById('instaPanels');
  panelsEl.innerHTML = '';
  const lookup = buildInstaLookup(profile.instaTowers?.[tKey] ?? []);
  const owned = CROSSPATHS.filter(cp => (lookup[cp] ?? 0) > 0);
  const toShow = instaShowAll ? CROSSPATHS : owned;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:8px;';
  header.innerHTML = `
    <span style="font-size:12px;color:#888;">${owned.length} crosspath${owned.length !== 1 ? 's' : ''} owned</span>
    <button class="btn btn-sm" onclick="toggleInstaView('${tKey}')" style="background:#2d2d2d;border:1px solid #444;color:#888;">
      ${instaShowAll ? 'Show owned only' : 'Show all crosspaths'}
    </button>`;
  panelsEl.appendChild(header);

  if (toShow.length === 0) {
    const empty = document.createElement('p');
    empty.style.cssText = 'color:#555;font-size:12px;padding:8px 0;';
    empty.textContent = 'No insta-monkeys owned for this tower.';
    panelsEl.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'insta-grid';
  for (const cp of toShow) {
    const qty  = lookup[cp] ?? 0;
    const cell = document.createElement('div');
    cell.className = 'insta-cell';
    if (qty > 0) cell.style.borderColor = '#4a6a3a';
    const label = document.createElement('label');
    label.textContent = cp;
    label.style.cursor = 'pointer';
    label.title = 'Click to add 1';
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = '0'; inp.max = '262143';
    inp.value = qty; inp.dataset.tower = tKey; inp.dataset.cp = cp;
    label.addEventListener('click', () => {
      inp.value = Math.min(262143, (parseInt(inp.value) || 0) + 1);
      if (parseInt(inp.value) > 0) cell.style.borderColor = '#4a6a3a';
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    });
    cell.appendChild(label); cell.appendChild(inp);
    grid.appendChild(cell);
  }
  panelsEl.appendChild(grid);
}

function toggleInstaView(tKey) {
  flushHeavy('instas');
  instaShowAll = !instaShowAll;
  renderInstaPanel(tKey);
}
