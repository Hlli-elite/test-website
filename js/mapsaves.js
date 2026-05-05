const mapJsonCache = {};

async function getMapJson(technicalName) {
  if (mapJsonCache[technicalName]) return mapJsonCache[technicalName];
  const url = `./map-data/${encodeURIComponent(technicalName)}.json`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  mapJsonCache[technicalName] = data;
  return data;
}

function msDrawMapBackground(mapJson) {
  if (!msCtx || !mapJson) return;

  msCtx.save();
  msCtx.translate(0, 2320);
  msCtx.scale(1, -1);

  for (const area of (mapJson.areas ?? [])) {
    const pts = area.polygon?.points;
    if (!pts?.length) continue;
    msCtx.beginPath();
    msCtx.moveTo((pts[0].x + 150) * 10, (pts[0].y + 116) * 10);
    for (let i = 1; i < pts.length; i++) {
      msCtx.lineTo((pts[i].x + 150) * 10, (pts[i].y + 116) * 10);
    }
    msCtx.closePath();
    msCtx.fillStyle = area.type === 1 ? 'rgba(80,140,200,0.35)'
                    : area.type === 0 ? 'rgba(160,120,60,0.4)'
                    : 'rgba(60,130,60,0.2)';
    msCtx.fill();
  }
  for (const path of (mapJson.paths ?? [])) {
    const pts = path.points;
    if (!pts?.length) continue;
    msCtx.beginPath();
    msCtx.strokeStyle = 'rgba(200,170,80,0.25)';
    msCtx.lineWidth = 80;
    msCtx.lineCap = 'round';
    msCtx.lineJoin = 'round';
    msCtx.moveTo((pts[0].point.x + 150) * 10, (pts[0].point.y + 116) * 10);
    for (let i = 1; i < pts.length; i++) {
      msCtx.lineTo((pts[i].point.x + 150) * 10, (pts[i].point.y + 116) * 10);
    }
    msCtx.stroke();
  }

  msCtx.restore();
}

const MS_PI2 = Math.PI * 2;
let msCtx = null, msCanvas = null;
let msSelectedMap = null, msSelectedTower = null;
let msTowerManager = [];

function msTowerFootprint(t) {
  switch (t.baseId) {
    case 'SuperMonkey': case 'MonkeyVillage': case 'MortarMonkey': return 11;
    case 'NinjaMonkey': case 'SniperMonkey':  case 'IceMonkey':
    case 'TackShooter': case 'GlueGunner':    case 'Alchemist':    return 6;
    case 'BeastHandler': case 'BombShooter': case 'Druid':
    case 'Desperado': case 'EngineerMonkey': case 'WizardMonkey':
    case 'MonkeySub': case 'BoomerangMonkey': case 'DartlingGunner': return 7;
    case 'MonkeyBuccaneer': case 'SpikeFactory': case 'Mermonkey':  return 8;
    default: return 5;
  }
}

function msToCanvas(t) { return { x:(t.position.x+150)*10, y:(t.position.y+116)*10 }; }

function msIsRect(t) { return t.baseId==='MonkeyAce'||t.baseId==='BananaFarm'||t.baseId==='HeliPilot'; }

function msRectDims(t) {
  if (t.baseId==='MonkeyAce')  return {w:280,h:180};
  if (t.baseId==='BananaFarm') return {w:300,h:300};
  if (t.baseId==='HeliPilot')  return {w:270,h:270};
}

function msHitTest(t, gx, gy) {
  const {x,y}=msToCanvas(t);
  if (msIsRect(t)){const d=msRectDims(t);return gx>=x-d.w/2&&gx<=x+d.w/2&&gy>=y-d.h/2&&gy<=y+d.h/2;}
  const r=msTowerFootprint(t)*10; return (gx-x)**2+(gy-y)**2<=r*r;
}

function msStatMaker(parent, cls, label, info) {
  const div = document.createElement('div');
  div.classList.add(cls + '-div', 'ms-stat-row');
  const lbl = document.createElement('p');
  lbl.classList.add(cls, 'ms-stat-label');
  lbl.textContent = label;
  const val = document.createElement('p');
  val.classList.add(cls, 'ms-stat-val');
  val.textContent = (info === undefined || info === null) ? '' : info;
  val.contentEditable = 'true';
  div.appendChild(lbl);
  div.appendChild(val);
  parent.appendChild(div);
  return val;
}

function msJsonPair(parent, label, data, onSave) {
  const pair = document.createElement('div');
  pair.classList.add('ms-pair');
  const lbl = document.createElement('p');
  lbl.classList.add('ms-pair-label');
  lbl.textContent = label;
  pair.appendChild(lbl);
  const box = document.createElement('div');
  box.classList.add('ms-json-box');
  box.textContent = JSON.stringify(data).replaceAll(':', ': ').replaceAll(',', ', ');
  box.contentEditable = 'true';
  box.addEventListener('blur', () => {
    try { onSave(JSON.parse(box.textContent)); }
    catch { box.style.borderColor = '#f47474'; return; }
    box.style.borderColor = '';
  });
  pair.appendChild(box);
  parent.appendChild(pair);
}

function msMapVariablesFiller(container, mapKey) {
  container.innerHTML = '';
  const d = profile.savedMaps?.[mapKey];
  if (!d) { container.innerHTML = '<p style="color:#555">No data</p>'; return; }

  const titleDiv = document.createElement('div'); titleDiv.classList.add('ms-mv-title');
  const titleText = document.createElement('p'); titleText.textContent = 'Map Variables';
  titleDiv.appendChild(titleText); container.appendChild(titleDiv);

  const cash      = msStatMaker(container,'cash',      'Cash:',                        d.players?.[-1]?.cash);
  const hero      = msStatMaker(container,'hero',      'Hero:',                        d.players?.[-1]?.hero);
  const health    = msStatMaker(container,'health',    'Lives:',                       d.health);
  const seed      = msStatMaker(container,'seed',      'Seed:',                        d.freeplayRoundSeed);
  const mk        = msStatMaker(container,'mk',        'Active Monkey Knowledge:',     d.activeKnowledge);
  const cashSpent = msStatMaker(container,'cashSpent', 'Cash Spent:',                  d.cashSpent);
  const cont      = msStatMaker(container,'cont',      'Continues Used:',              d.continuesUsed);
  const diff      = msStatMaker(container,'diff',      'Map Difficulty:',              d.mapDifficulty);
  const mode      = msStatMaker(container,'mode',      'Mode Name:',                   d.modeName);
  const round     = msStatMaker(container,'round',     'Round:',                       d.round);
  const shield    = msStatMaker(container,'shield',    'Shield:',                      d.shield);

  cash.addEventListener('blur',()=>{if(d.players?.[-1]) d.players[-1].cash=parseFloat(cash.textContent)||0;});
  hero.addEventListener('blur',()=>{if(d.players?.[-1]) d.players[-1].hero=hero.textContent;});
  health.addEventListener('blur',()=>{d.health=parseInt(health.textContent)||0;});
  seed.addEventListener('blur',()=>{d.freeplayRoundSeed=parseInt(seed.textContent)||0;});
  mk.addEventListener('blur',()=>{d.activeKnowledge=mk.textContent;});
  cashSpent.addEventListener('blur',()=>{d.cashSpent=parseFloat(cashSpent.textContent)||0;});
  cont.addEventListener('blur',()=>{d.continuesUsed=parseInt(cont.textContent)||0;});
  diff.addEventListener('blur',()=>{d.mapDifficulty=diff.textContent;});
  mode.addEventListener('blur',()=>{d.modeName=mode.textContent;});
  round.addEventListener('blur',()=>{d.round=parseInt(round.textContent)||0;});
  shield.addEventListener('blur',()=>{d.shield=parseInt(shield.textContent)||0;});

  msJsonPair(container,'Active Mutators:',    d.activeMutators,      v=>{d.activeMutators=v;});
  msJsonPair(container,'Metadata:',           d.metaData,            v=>{d.metaData=v;});
  msJsonPair(container,'Tower History:',      d.towerHistory,        v=>{d.towerHistory=v;});
  msJsonPair(container,'Power History:',      d.powerPlaceHistory,   v=>{d.powerPlaceHistory=v;});
  msJsonPair(container,'Placed Projectiles:', d.placedProjectiles,   v=>{d.placedProjectiles=v;});
}

function msDrawCanvas() {
  if (!msCtx || !msSelectedMap) return;
  const towers = (profile.savedMaps?.[msSelectedMap]?.placedTowers ?? [])
    .filter(t => t.parentTowerId === 4294967295);

  msCtx.save();
  msCtx.translate(0, 2320);
  msCtx.scale(1, -1);

  msCtx.fillStyle  = '#00ff00';
  msCtx.globalAlpha = 0.5;
  msCtx.font = '48px serif';
  msCtx.textBaseline = 'middle';
  msCtx.textAlign = 'center';
  msCtx.beginPath();

  for (const t of towers) {
    if (t === msSelectedTower) continue;
    const {x,y} = msToCanvas(t);
    const r = msTowerFootprint(t)*10;
    if      (t.baseId==='MonkeyAce')   msCtx.rect(x-140,y-90,280,180);
    else if (t.baseId==='BananaFarm')  msCtx.rect(x-150,y-150,300,300);
    else if (t.baseId==='HeliPilot')   msCtx.rect(x-135,y-135,270,270);
    else { msCtx.moveTo(x+r,y); msCtx.arc(x,y,r,0,MS_PI2); }
  }
  msCtx.stroke(); msCtx.fill();

  msCtx.globalAlpha = 1;
  msCtx.beginPath();
  if (msSelectedTower) {
    const t = msSelectedTower;
    const {x,y} = msToCanvas(t);
    const r = msTowerFootprint(t)*10;
    if      (t.baseId==='MonkeyAce')   msCtx.rect(x-140,y-90,280,180);
    else if (t.baseId==='BananaFarm')  msCtx.rect(x-150,y-150,300,300);
    else if (t.baseId==='HeliPilot')   msCtx.rect(x-135,y-135,270,270);
    else { msCtx.moveTo(x+r,y); msCtx.arc(x,y,r,0,MS_PI2); }
    msCtx.stroke(); msCtx.fill();
  }

  msCtx.restore();

  msCtx.globalAlpha = 1;
  msCtx.fillStyle  = '#ffffff';
  msCtx.strokeStyle = 'black';
  msCtx.lineWidth  = 8;
  msCtx.font = '48px serif';
  msCtx.textBaseline = 'middle';
  msCtx.textAlign = 'center';
  for (const t of towers) {
    if (t.parentTowerId !== 4294967295) continue;
    const {x,y} = msToCanvas(t);
    const label = `${t.pathOneTier}-${t.pathTwoTier}-${t.pathThreeTier}`;
    msCtx.strokeText(label,x,y);
    msCtx.fillStyle = 'white';
    msCtx.fillText(label,x,y);
  }
}

function msShowTowerInfo(t) {
  const leftMenu  = document.getElementById('msInfoLeft');
  const rightMenu = document.getElementById('msInfoRight');
  const panel = t.position.x > 0 ? leftMenu : rightMenu;
  const other = t.position.x > 0 ? rightMenu : leftMenu;

  other.style.display = 'none';
  panel.style.display = 'block';
  panel.innerHTML = '';

  const towerInfo = document.createElement('div');
  towerInfo.classList.add('ms-tower-info');

  const baseId       = msStatMaker(towerInfo,'base-id',       'Base ID:',         t.baseId);
  const towerName    = msStatMaker(towerInfo,'tower-name',    'Tower Name:',      t.towerName);
  const uniqueId     = msStatMaker(towerInfo,'unique-id',     'Unique ID:',       t.uniqueId);
  const idLastSave   = msStatMaker(towerInfo,'id-last-save',  'ID Last Save:',    t.IdLastSave);
  const createdAt    = msStatMaker(towerInfo,'created-at',    'Created At:',      t.createdAt);
  const origOwner    = msStatMaker(towerInfo,'orig-owner',    'Original Owner:',  t.originalOwner);
  const owner        = msStatMaker(towerInfo,'owner',         'Owner:',           t.owner);
  const parentId     = msStatMaker(towerInfo,'parent-id',     'Parent Tower ID:', t.parentTowerId);

  const topStats = document.createElement('div'); topStats.classList.add('ms-top-stats');
  const cashEarned   = msStatMaker(topStats,'cash-earned',   'Cash Earned:',     t.cashEarned);
  const damageDealt  = msStatMaker(topStats,'damage-dealt',  'Damage Dealt:',    t.damageDealt);
  towerInfo.appendChild(topStats);

  baseId.addEventListener('blur',()=>{t.baseId=baseId.textContent;});
  towerName.addEventListener('blur',()=>{t.towerName=towerName.textContent;});
  uniqueId.addEventListener('blur',()=>{t.uniqueId=uniqueId.textContent;});
  idLastSave.addEventListener('blur',()=>{t.IdLastSave=parseInt(idLastSave.textContent)||0;});
  createdAt.addEventListener('blur',()=>{t.createdAt=parseInt(createdAt.textContent)||0;});
  origOwner.addEventListener('blur',()=>{t.originalOwner=parseInt(origOwner.textContent)||0;});
  owner.addEventListener('blur',()=>{t.owner=parseInt(owner.textContent)||0;});
  parentId.addEventListener('blur',()=>{t.parentTowerId=parseInt(parentId.textContent)||0;});
  cashEarned.addEventListener('blur',()=>{t.cashEarned=parseInt(cashEarned.textContent)||0;});
  damageDealt.addEventListener('blur',()=>{t.damageDealt=parseInt(damageDealt.textContent)||0;});

  const targeting = msStatMaker(towerInfo,'targeting','Targeting:',t.targetType?.id);
  targeting.addEventListener('blur',()=>{if(t.targetType) t.targetType.id=targeting.textContent;});

  const mdDiv = document.createElement('div'); mdDiv.classList.add('ms-pair');
  const mdLbl = document.createElement('p'); mdLbl.classList.add('ms-pair-label'); mdLbl.textContent='Metadata:';
  const mdBox = document.createElement('div'); mdBox.classList.add('ms-json-box');
  mdBox.textContent = JSON.stringify(t.metaData).replaceAll(':',': ').replaceAll(',',', ');
  mdBox.contentEditable='true';
  mdBox.addEventListener('blur',()=>{try{t.metaData=JSON.parse(mdBox.textContent);}catch{}});
  mdDiv.appendChild(mdLbl); mdDiv.appendChild(mdBox); towerInfo.appendChild(mdDiv);

  const upgDiv = document.createElement('div'); upgDiv.classList.add('ms-upgrades');
  const upg1 = msStatMaker(upgDiv,'upgrade','Path 1:',t.pathOneTier);
  const upg2 = msStatMaker(upgDiv,'upgrade','Path 2:',t.pathTwoTier);
  const upg3 = msStatMaker(upgDiv,'upgrade','Path 3:',t.pathThreeTier);
  upg1.addEventListener('blur',()=>{t.pathOneTier=parseInt(upg1.textContent)||0; msDrawCanvas();});
  upg2.addEventListener('blur',()=>{t.pathTwoTier=parseInt(upg2.textContent)||0; msDrawCanvas();});
  upg3.addEventListener('blur',()=>{t.pathThreeTier=parseInt(upg3.textContent)||0; msDrawCanvas();});
  towerInfo.appendChild(upgDiv);

  const posX = msStatMaker(towerInfo,'pos-x','Position X:',t.position?.x);
  const posY = msStatMaker(towerInfo,'pos-y','Position Y:',t.position?.y);
  const posZ = msStatMaker(towerInfo,'pos-z','Position Z:',t.position?.z);
  posX.addEventListener('blur',()=>{if(t.position)t.position.x=parseFloat(posX.textContent)||0; msDrawCanvas();});
  posY.addEventListener('blur',()=>{if(t.position)t.position.y=parseFloat(posY.textContent)||0; msDrawCanvas();});
  posZ.addEventListener('blur',()=>{if(t.position)t.position.z=parseFloat(posZ.textContent)||0;});

  const worth = msStatMaker(towerInfo,'worth','Tower Value: $',t.worth);
  worth.addEventListener('blur',()=>{t.worth=parseInt(worth.textContent)||0;});

  panel.appendChild(towerInfo);
}

function msCanvasThing(event) {
  if (!msSelectedMap || !msCanvas) return;
  const rect = msCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const gameX = (((3000 / rect.width)  * clickX) / 10) - 150;
  const gameY = (((2320 / rect.height) * clickY) / 10) - 116;

  const towers = (profile.savedMaps?.[msSelectedMap]?.placedTowers??[])
    .filter(t => t.parentTowerId === 4294967295);

  const cx = (gameX + 150) * 10;
  const cy = (gameY + 116) * 10;

  let best=null, bestDist=Infinity;
  for (const t of towers) {
    const {x,y} = msToCanvas(t);
    let hit = false;
    if (msIsRect(t)) {
      const d = msRectDims(t);
      hit = cx >= x-d.w/2 && cx <= x+d.w/2 && cy >= y-d.h/2 && cy <= y+d.h/2;
    } else {
      const r = msTowerFootprint(t)*10;
      hit = (cx-x)**2 + (cy-y)**2 <= r*r;
    }
    if (hit) {
      const dist = (cx-x)**2 + (cy-y)**2;
      if (dist < bestDist) { best=t; bestDist=dist; }
    }
  }

  const leftMenu  = document.getElementById('msInfoLeft');
  const rightMenu = document.getElementById('msInfoRight');

  if (!best) {
    leftMenu.style.display  = 'none';
    rightMenu.style.display = 'none';
    msSelectedTower = null;
    msDrawCanvas();
  } else {
    msSelectedTower = best;
    msDrawCanvas();
    msShowTowerInfo(best);
  }
}

let msMVOpen = false;

function msToggleMapVars() {
  const mv = document.getElementById('msMapVariables');
  msMVOpen = !msMVOpen;
  mv.style.display = msMVOpen ? 'block' : 'none';
  if (msMVOpen && msSelectedMap) msMapVariablesFiller(mv, msSelectedMap);
}

function buildMapSaves() {
  const saveList = document.getElementById('msSaveList');
  saveList.innerHTML = '';

  const savedMaps = profile.savedMaps;
  if (!savedMaps || Object.keys(savedMaps).length === 0) {
    saveList.innerHTML = '<p style="color:#555;font-size:12px;padding:8px;">No map saves found in this save file.</p>';
    return;
  }

  msCanvas = document.getElementById('msCanvas');
  msCtx    = msCanvas.getContext('2d');
  msCanvas.width  = 3000;
  msCanvas.height = 2320;
  msCanvas.addEventListener('click', msCanvasThing);

  const knownMapKeys = new Set(MAPS.map(m => m[0]));

  for (const mapKey of Object.keys(savedMaps).sort()) {
    if (!knownMapKeys.has(mapKey)) continue;
    const towers = (savedMaps[mapKey]?.placedTowers??[]).filter(t=>t.parentTowerId===4294967295);
    const btn = document.createElement('div');
    btn.className = 'ms-map-btn';
    btn.dataset.map = mapKey;
    btn.innerHTML = `<div class="ms-map-name" title="${mapKey}">${mapKey}</div>
      <div class="ms-map-sub">${towers.length} tower${towers.length!==1?'s':''} &middot; Rd ${savedMaps[mapKey]?.round??'?'}</div>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ms-map-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      msSelectMap(mapKey);
    });
    saveList.appendChild(btn);
  }

  const first = saveList.querySelector('.ms-map-btn');
  if (first) first.click();
}

async function msSelectMap(mapKey) {
  msSelectedMap   = mapKey;
  msSelectedTower = null;
  const leftMenu  = document.getElementById('msInfoLeft');
  const rightMenu = document.getElementById('msInfoRight');
  if (leftMenu)  leftMenu.style.display  = 'none';
  if (rightMenu) rightMenu.style.display = 'none';

  const towers = (profile.savedMaps?.[mapKey]?.placedTowers??[]).filter(t=>t.parentTowerId===4294967295);
  document.getElementById('msMapName').textContent    = mapKey;
  document.getElementById('msTowerCount').textContent = `${towers.length} tower${towers.length!==1?'s':''}`;

  if (msMVOpen) msMapVariablesFiller(document.getElementById('msMapVariables'), mapKey);

  msCtx.clearRect(0, 0, 3000, 2320);
  const mapJson = await getMapJson(mapKey);
  msDrawMapBackground(mapJson);
  msDrawCanvas();
}
