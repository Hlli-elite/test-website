function getPath(obj, path) {
  return path.split('.').reduce((o,k) => (o != null && o[k] !== undefined ? o[k] : undefined), obj);
}

function setPath(obj, path, value) {
  const keys = path.split('.'), last = keys.pop();
  const t = keys.reduce((o,k) => o && o[k], obj);
  if (t != null) t[last] = value;
}

function populateFields() {
  document.querySelectorAll('[data-key]').forEach(inp => {
    const v = getPath(profile, inp.dataset.key);
    if (v !== undefined) inp.value = v;
  });
}

function collectFields() {
  if (HEAVY_TABS.has(currentTab)) flushHeavy(currentTab);
  document.querySelectorAll('[data-key]').forEach(inp => {
    const raw = inp.value.trim();
    if (raw === '') return;
    const orig = getPath(profile, inp.dataset.key);
    setPath(profile, inp.dataset.key, typeof orig === 'number' ? Number(raw) : raw);
  });
}
