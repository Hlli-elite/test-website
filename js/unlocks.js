function toggleIap(p, item, on) {
  if (!p.purchase) p.purchase = {};
  if (!p.purchase.purchasedOneTimeItems) p.purchase.purchasedOneTimeItems = [];
  const arr = p.purchase.purchasedOneTimeItems;
  const idx = arr.indexOf(item);
  if (on && idx === -1) arr.push(item);
  if (!on && idx !== -1) arr.splice(idx, 1);
}

function makeCheckLabel(labelText, checked, onChange) {
  const wrap = document.createElement('label');
  wrap.style.cssText = 'display:flex;align-items:center;gap:5px;cursor:pointer;font-size:11px;color:#888;white-space:nowrap;';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = checked;
  cb.dataset.label = labelText;
  cb.style.accentColor = '#f0c040';
  cb.addEventListener('change', () => onChange(cb.checked));
  wrap.appendChild(cb);
  wrap.appendChild(document.createTextNode(labelText));
  return wrap;
}

function syncCb(row, labelText, value) {
  row.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (cb.dataset.label === labelText) cb.checked = value;
  });
}

function buildUnlocks() {
  const grid = document.getElementById('unlockGrid');
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();

  for (const u of UNLOCKS) {
    const row = document.createElement('div');
    row.className = 'unlock-row' + (u.type === 'dlc' || u.type === 'iap' ? ' iap' : '');

    const info = document.createElement('div');
    info.className = 'unlock-info';
    info.innerHTML = `<div class="unlock-name">${u.name}</div><div class="unlock-desc">${u.desc}</div>`;

    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;flex-direction:column;gap:4px;flex-shrink:0;';

    if (u.type === 'dlc') {
      const owned = (profile.purchase?.purchasedOneTimeItems || []).includes(u.iapKey);
      const label = makeCheckLabel('Owned', owned, on => {
        toggleIap(profile, u.iapKey, on);
        if (u.extraApply) u.extraApply(profile, on);
        row.classList.toggle('active', on);
      });
      if (owned) row.classList.add('active');
      controls.appendChild(label);

    } else if (u.type === 'iap') {
      const isUnlocked = u.checkUnlocked ? u.checkUnlocked(profile)
        : (profile.purchase?.purchasedOneTimeItems || []).includes(u.iapKey);
      const isActive = u.checkActive ? u.checkActive(profile)
        : (u.activeKey ? profile[u.activeKey] === true : isUnlocked);

      const lU = makeCheckLabel('Unlocked', isUnlocked, on => {
        if (u.extraUnlockApply) u.extraUnlockApply(profile, on);
        else { toggleIap(profile, u.iapKey, on); if (u.iapApply) u.iapApply(profile, on); }
        row.classList.toggle('active', on);
      });
      controls.appendChild(lU);

      if (u.activeKey || u.checkActive) {
        const lA = makeCheckLabel('Active', isActive, on => {
          if (u.extraActiveApply) u.extraActiveApply(profile, on);
          else if (u.activeKey) profile[u.activeKey] = on;
        });
        controls.appendChild(lA);
      }

      if (isUnlocked) row.classList.add('active');

    } else {
      const isUnlocked = u.unlockedKey ? profile[u.unlockedKey] === true : true;
      const isActive   = u.activeKey   ? profile[u.activeKey]   === true : false;

      if (u.unlockedKey) {
        const lU = makeCheckLabel('Unlocked', isUnlocked, on => {
          profile[u.unlockedKey] = on;
          if (u.seenKey) profile[u.seenKey] = on;
          if (!on && u.activeKey) { profile[u.activeKey] = false; syncCb(row, 'Active', false); }
          row.classList.toggle('active', on || (u.activeKey && profile[u.activeKey]));
        });
        controls.appendChild(lU);
      }

      if (u.activeKey) {
        const lA = makeCheckLabel('Active', isActive, on => {
          profile[u.activeKey] = on;
          if (on && u.unlockedKey) { profile[u.unlockedKey] = true; if (u.seenKey) profile[u.seenKey] = true; syncCb(row, 'Unlocked', true); }
          row.classList.toggle('active', on);
        });
        controls.appendChild(lA);
      }

      if (isUnlocked || isActive) row.classList.add('active');
    }

    row.appendChild(info);
    row.appendChild(controls);
    frag.appendChild(row);
  }

  grid.appendChild(frag);
}
