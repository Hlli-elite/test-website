function buildPowers() {
  const grid = document.getElementById('powersGrid');
  grid.innerHTML = '';
  grid.addEventListener('change', e => {
    const inp = e.target; if (!inp.dataset.power) return;
    if (!profile.powersData) profile.powersData = {};
    if (!profile.powersData[inp.dataset.power]) profile.powersData[inp.dataset.power] = {};
    profile.powersData[inp.dataset.power].quantity = parseInt(inp.value) || 0;
  });
  for (const p of POWERS) {
    const qty = profile.powersData?.[p.key]?.quantity ?? 0;
    const row = document.createElement('div');
    row.className = 'power-row';
    row.innerHTML = `<label>${p.name}</label><input type="number" min="0" value="${qty}" data-power="${p.key}">`;
    grid.appendChild(row);
  }
}
