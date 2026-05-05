let mapDiffFilter = 'all';

function initMapListener() {
  document.getElementById('mapsBody').addEventListener('change', e => {
    const inp = e.target;
    const m = inp.dataset.map, d = inp.dataset.diff, k = inp.dataset.mode;
    if (!m) return;
    if (!profile.mapInfo) profile.mapInfo = {};
    if (!profile.mapInfo.maps) profile.mapInfo.maps = {};
    if (!profile.mapInfo.maps[m]) profile.mapInfo.maps[m] = {};
    if (!profile.mapInfo.maps[m].difficult) profile.mapInfo.maps[m].difficult = {};
    if (!profile.mapInfo.maps[m].difficult[d]) profile.mapInfo.maps[m].difficult[d] = {};
    profile.mapInfo.maps[m].difficult[d][k] = parseInt(inp.value) || 0;
  });
}

function renderMaps() {
  const tbody = document.getElementById('mapsBody');
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const [tName, dName, diff] of MAPS) {
    if (mapDiffFilter !== 'all' && diff !== mapDiffFilter) continue;
    const mapData = profile.mapInfo?.maps?.[tName]?.difficult ?? {};
    const tr = document.createElement('tr');
    tr.dataset.diff = diff;
    let html = `<td class="map-name" title="${diff}">${dName}</td>`;
    for (const gm of GAMEMODES) {
      const val = mapData[gm.diff]?.[gm.key] ?? 0;
      html += `<td class="medal-col"><input type="number" min="0" max="4" value="${val}" data-map="${tName}" data-diff="${gm.diff}" data-mode="${gm.key}" style="width:42px"></td>`;
    }
    tr.innerHTML = html;
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}

function filterMaps(f, btn) {
  flushHeavy('maps');
  mapDiffFilter = f;
  document.querySelectorAll('.map-filter button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMaps();
}

function mapsMaxAll() {
  if (!profile.mapInfo) profile.mapInfo = {};
  if (!profile.mapInfo.maps) profile.mapInfo.maps = {};
  for (const [tName] of MAPS) {
    if (!profile.mapInfo.maps[tName]) profile.mapInfo.maps[tName] = {};
    if (!profile.mapInfo.maps[tName].difficult) profile.mapInfo.maps[tName].difficult = {};
    for (const gm of GAMEMODES) {
      if (!profile.mapInfo.maps[tName].difficult[gm.diff]) profile.mapInfo.maps[tName].difficult[gm.diff] = {};
      profile.mapInfo.maps[tName].difficult[gm.diff][gm.key] = 4;
    }
  }
  renderMaps();
}
