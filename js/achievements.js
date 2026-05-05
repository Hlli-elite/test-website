let achFilter = 'all';

function initAchListener() {
  document.getElementById('achGrid').addEventListener('change', e => {
    const inp = e.target; if (!inp.dataset.ach) return;
    if (!profile.achievementProgress) profile.achievementProgress = {};
    profile.achievementProgress[inp.dataset.ach] = parseInt(inp.value) || 0;
  });
}

function renderAch() {
  const grid = document.getElementById('achGrid');
  grid.innerHTML = '';
  const ap = profile.achievementProgress ?? {};
  const frag = document.createDocumentFragment();
  for (const ach of ACHIEVEMENTS) {
    if (achFilter === 'incomplete' && (ap[ach.type] ?? 0) >= ach.goal) continue;
    if (achFilter === 'hidden' && !ach.hidden) continue;
    const current = ap[ach.type] ?? 0;
    const row = document.createElement('div');
    row.className = 'ach-row' + (ach.hidden ? ' hidden-ach' : '');
    row.innerHTML = `<div class="ach-info"><div class="ach-name" title="${ach.name}">${ach.name}${ach.hidden ? ' <span style="color:#6a5a00">[hidden]</span>' : ''}</div><div class="ach-desc" title="${ach.desc}">${ach.desc}</div></div><input type="number" min="0" max="${ach.goal}" value="${current}" data-ach="${ach.type}"><span class="ach-max">/ ${ach.goal.toLocaleString()}</span>`;
    frag.appendChild(row);
  }
  grid.appendChild(frag);
}

function filterAch(f) { achFilter = f; renderAch(); }

function achMaxAll() {
  if (!profile.achievementProgress) profile.achievementProgress = {};
  for (const ach of ACHIEVEMENTS) profile.achievementProgress[ach.type] = ach.goal;
  renderAch();
}
