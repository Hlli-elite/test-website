let trophyFilter = 'all';
let trophySearchTerm = '';

function getTrophyArray() {
  if (!profile.trophyStoreItems) profile.trophyStoreItems = [];
  return profile.trophyStoreItems;
}
function hasTrophyItem(name) {
  return getTrophyArray().includes(name);
}
function setTrophyItem(name, owned) {
  const arr = getTrophyArray();
  const idx = arr.indexOf(name);
  if (owned && idx === -1) arr.push(name);
  if (!owned && idx !== -1) arr.splice(idx, 1);
}
function updateTrophyCount() {
  const total = Object.keys(TROPHY_ITEMS).length;
  const owned = getTrophyArray().filter(n => TROPHY_ITEMS[n]).length;
  document.getElementById('trophyCount').textContent = `${owned} / ${total} items owned`;
}
function buildTrophyStore() {
  const grid = document.getElementById('trophyGrid');
  grid.innerHTML = '';

  document.getElementById('trophyFilters').addEventListener('click', e => {
    const btn = e.target.closest('.trophy-filter');
    if (!btn) return;
    trophyFilter = btn.dataset.f;
    document.querySelectorAll('.trophy-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterTrophyCards();
  });

  const frag = document.createDocumentFragment();
  for (const [name, d] of Object.entries(TROPHY_ITEMS)) {
    const owned = hasTrophyItem(name);
    const card = document.createElement('div');
    card.className = 'art-card' + (owned ? ' owned' : '');
    card.dataset.store = d.store;
    card.dataset.name = name.toLowerCase();
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = owned;
    cb.addEventListener('change', () => {
      setTrophyItem(name, cb.checked);
      card.classList.toggle('owned', cb.checked);
      updateTrophyCount();
    });
    const nameEl = document.createElement('span');
    nameEl.className = 'art-name';
    nameEl.title = name;
    const pretty = name
      .replace(/^(Bloons|Coop|GameUI|Heroes|Monkeys|Tower)/, '')
      .replace(/^(Emote|Profile|Prop|Pet|Placement|Projectile|Effect|Power|Music|Track|Upgrades|UI|Animation|Icon|Sound|Text)/, '')
      .replace(/([A-Z])/g, ' $1').trim();
    nameEl.textContent = pretty;
    card.appendChild(cb);
    card.appendChild(nameEl);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
  updateTrophyCount();
}
function filterTrophyCards() {
  const search = trophySearchTerm.toLowerCase();
  document.querySelectorAll('#trophyGrid .art-card').forEach(card => {
    const matchStore = trophyFilter === 'all' || card.dataset.store === trophyFilter;
    const matchSearch = !search || card.dataset.name.includes(search);
    card.style.display = (matchStore && matchSearch) ? '' : 'none';
  });
}
function trophySelectAll() {
  const arr = getTrophyArray();
  for (const name of Object.keys(TROPHY_ITEMS)) {
    if (!arr.includes(name)) arr.push(name);
  }
  document.querySelectorAll('#trophyGrid .art-card').forEach(card => {
    if (card.style.display !== 'none') {
      card.classList.add('owned');
      card.querySelector('input').checked = true;
    }
  });
  updateTrophyCount();
}
function trophydeselectAll() {
  profile.trophyStoreItems = profile.trophyStoreItems?.filter(n => !TROPHY_ITEMS[n]) ?? [];
  document.querySelectorAll('#trophyGrid .art-card').forEach(card => {
    card.classList.remove('owned');
    card.querySelector('input').checked = false;
  });
  updateTrophyCount();
}
