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
    if (!profile.mapInfo.maps[m].difficult[d].modes) profile.mapInfo.maps[m].difficult[d].modes = {};

    const newVal = parseInt(inp.value) || 0;

    if (newVal === 0) {
      // Remove the key entirely so the game treats it as not completed
      delete profile.mapInfo.maps[m].difficult[d].modes[k];
    } else {
      // dogz.js uses 1049868 as the completion value — this encodes medal + round info
      // We preserve existing encoded value if present, otherwise use the standard value
      // Medal encoding: the game stores a bitfield. Simple approach: use known good values.
      // 0 = none, anything >= 3 = has medal. We store the raw medal int the user types
      // but map it to a real encoded value the game understands.
      profile.mapInfo.maps[m].difficult[d].modes[k] = medalToEncoded(newVal);
    }
  });
}

// Convert a simple medal value (0-4) to the encoded integer the game uses
// Based on dogz.js which uses 1049868 for a completed medal
// The game encodes: completion bits in lower bits, round number in bits 10-25
// For our purposes we use known safe values per medal level
function medalToEncoded(medalVal) {
  switch (medalVal) {
    case 1: return 1;       // bronze — started/minimal completion
    case 2: return 3;       // silver
    case 3: return 7;       // gold
    case 4: return 1049868; // black border — value dogz.js uses
    default: return 0;
  }
}

// Convert an encoded game value back to a simple medal value (0-4) for display
function encodedToMedal(encoded) {
  if (!encoded || encoded === 0) return 0;
  if (encoded >= 1049868) return 4; // black border
  if (encoded >= 7)       return 3; // gold
  if (encoded >= 3)       return 2; // silver
  if (encoded >= 1)       return 1; // bronze
  return 0;
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
      // Read from the correct path: .difficult[diff].modes[mode]
      const encoded = profile.mapInfo?.maps?.[tName]?.difficult?.[gm.diff]?.modes?.[gm.key] ?? 0;
      const medalVal = encodedToMedal(encoded);
      html += `<td class="medal-col"><input type="number" min="0" max="4" value="${medalVal}" data-map="${tName}" data-diff="${gm.diff}" data-mode="${gm.key}" style="width:42px"></td>`;
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
      profile.mapInfo.maps[tName].difficult[gm.diff].modes[gm.key] = 1049868;
    }
  }
  renderMaps();
}
