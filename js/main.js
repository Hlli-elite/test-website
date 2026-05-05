function setStatus(type, msg) {
  const el = document.getElementById('status');
  el.className = type; el.textContent = msg;
}

function reset() {
  profile = rawHeader = rawPwdIdx = rawSalt = null;
  document.getElementById('editor').style.display = 'none';
  document.getElementById('uploadArea').style.display = '';
  document.getElementById('status').className = '';
  document.getElementById('status').textContent = '';
  document.getElementById('fileInput').value = '';
}

function togglePreview() {
  const pre = document.getElementById('jsonPreview');
  const btn = document.getElementById('togglePreview');
  const open = pre.style.display === 'block';
  pre.style.display = open ? 'none' : 'block';
  btn.textContent   = open ? '▶ Show raw JSON' : '▼ Hide raw JSON';
  if (!open) pre.textContent = JSON.stringify(profile, null, 2);
}

function downloadJSON() {
  collectFields();
  dl(new Blob([JSON.stringify(profile, null, 2)], { type:'application/json' }),
     fileName.replace(/\.Save$/i, '') + '_decrypted.json');
}

async function downloadSave() {
  collectFields();
  setStatus('info', 'Re-encrypting...');
  try {
    const bytes = await encryptSave(profile);
    dl(new Blob([bytes], { type:'application/octet-stream' }), fileName);
    setStatus('ok', 'Done. Replace your original Profile.Save with the downloaded file.');
  } catch(e) {
    setStatus('err', 'Re-encryption failed: ' + e.message);
    console.error(e);
  }
}

function dl(blob, name) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  a.click(); URL.revokeObjectURL(a.href);
}

async function loadFile(file) {
  if (file.name.toLowerCase() !== 'profile.save') {
    setStatus('err', `Wrong file: "${file.name}". Please load your Profile.Save file.`);
    document.getElementById('fileInput').value = '';
    return;
  }
  fileName = file.name;
  setStatus('info', 'Decrypting ' + file.name + '...');
  try {
    profile = await decryptSave(await file.arrayBuffer());
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    currentTab = 'currency';
    instaShowAll = false;
    populateFields();
    buildInstaTabs();
    initAchListener();
    initMapListener();
    setStatus('ok', 'Loaded: ' + file.name);
  } catch(e) {
    setStatus('err', 'Decryption failed: ' + e.message);
    console.error(e);
  }
}

document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

const zone = document.getElementById('uploadArea');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
zone.addEventListener('drop', e => {
  e.preventDefault(); zone.classList.remove('drag');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});

document.addEventListener('DOMContentLoaded', () => {
  const si = document.getElementById('trophySearch');
  if (si) si.addEventListener('input', () => {
    trophySearchTerm = si.value;
    filterTrophyCards();
  });
});
