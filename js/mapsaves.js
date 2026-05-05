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
  for (const area of (mapJson.areas ?? [])) {
    const pts = area.polygon?.points;
    if (!pts?.length) continue;
    msCtx.beginPath();
    msCtx.moveTo((pts[0].x + 150) * 10, (-pts[0].y + 116) * 10);
    for (let i = 1; i < pts.length; i++) {
      msCtx.lineTo((pts[i].x + 150) * 10, (-pts[i].y + 116) * 10);
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
    msCtx.moveTo((pts[0].point.x + 150) * 10, (-pts[0].point.y + 116) * 10);
    for (let i = 1; i < pts.length; i++) {
      msCtx.lineTo((pts[i].point.x + 150) * 10, (-pts[i].point.y + 116) * 10);
    }
    msCtx.stroke();
  }
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
