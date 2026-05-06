let mapDiffFilter = 'all';

const MEDAL_COMPLETE_VALUE = 1049868;

function hasMedal(encoded) {
  return encoded && encoded >= 3;
}

function initMapListener() {
  document.getElementById('mapsBody').addEventListener('change', e => {
    const inp = e.target;
    if (inp.type !== 'checkbox') return;
    const m = inp.dataset.map, d = inp.dataset.diff, k = inp.dataset.mode;
    if (!m) return;
    if (!profile.mapInfo) profile.mapInfo = {};
    if (!profile.mapInfo.maps) profile.mapInfo.maps = {};
    if (!profile.mapInfo.maps[m]) profile.mapInfo.maps[m] = {};
    if (!profile.mapInfo.maps[m].difficult) profile.mapInfo.maps[m].difficult = {};
    if (!profile.mapInfo.maps[m].difficult[d]) profile.mapInfo.maps[m].difficult[d] = {};
    if (!profile.mapInfo.maps[m].difficult[d].modes) profile.mapInfo.maps[m].difficult[d].modes = {};

    if (inp.checked) {
      profile.mapInfo.maps[m].difficult[d].modes[k] = MEDAL_COMPLETE_VALUE;
    } else {
      delete profile.mapInfo.maps[m].difficult[d].modes[k];
    }
  });
}

function renderMaps() {
  const tbody = document.getElementById('mapsBody');
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const [tName, dName, diff] of MAPS) {
    if (mapDiffFilter !== 'all' && diff !== mapDiffFilter) continue;

    const tr = document.createElement('tr');
    tr.dataset.diff = diff;
    let html = `<td class="map-name" title="${diff}">${dName}</td>`;

    for (const gm of GAMEMODES) {
      const encoded = profile.mapInfo?.maps?.[tName]?.difficult?.[gm.diff]?.modes?.[gm.key] ?? 0;
      const checked = hasMedal(encoded) ? 'checked' : '';
      html += `<td class="medal-col"><input type="checkbox" ${checked} data-map="${tName}" data-diff="${gm.diff}" data-mode="${gm.key}"></td>`;
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
      if (!profile.mapInfo.maps[tName].difficult[gm.diff].modes) profile.mapInfo.maps[tName].difficult[gm.diff].modes = {};
      profile.mapInfo.maps[tName].difficult[gm.diff].modes[gm.key] = MEDAL_COMPLETE_VALUE;
    }
  }
  renderMaps();
}
