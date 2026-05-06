const HEAVY_TABS = new Set(['instas', 'achievements', 'maps']);
let currentTab = 'currency';

function switchTab(name) {
  if (HEAVY_TABS.has(currentTab)) flushHeavy(currentTab);
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.tab[onclick="switchTab('${name}')"]`).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  currentTab = name;

  if (name === 'powers'        && !document.getElementById('powersGrid').children.length) buildPowers();
  if (name === 'instas')       renderInstaPanel(currentInstaTower);
  if (name === 'achievements') renderAch();
  if (name === 'maps')         renderMaps();
  if (name === 'unlocks'       && !document.getElementById('unlockGrid').children.length) buildUnlocks();
  if (name === 'artifacts'     && !document.getElementById('artifactGrid').children.length) buildArtifacts();
  if (name === 'roguestats'    && !document.getElementById('rogueStatsGrid').children.length) buildRogueStats();
  if (name === 'frontier'      && !document.getElementById('frontierCurrencyGrid').children.length) buildFrontier();
  if (name === 'trophystore'   && !document.getElementById('trophyGrid').children.length) buildTrophyStore();
  if (name === 'mapsaves'      && !document.getElementById('msSaveList').children.length) buildMapSaves();
  if (name === 'profilestats'  && !document.getElementById('psGrid').children.length) buildProfileStats();
}

function flushHeavy(tab) {
  if (tab === 'instas') {
    const lookup = {};
    document.querySelectorAll('#instaPanels input').forEach(inp => {
      const cp = inp.dataset.cp;
      if (!cp) return;
      lookup[cp] = parseInt(inp.value) || 0;
    });
    const tKey = currentInstaTower;
    if (!profile.instaTowers) profile.instaTowers = {};
    profile.instaTowers[tKey] = lookupToArray(lookup);
    document.getElementById('instaPanels').innerHTML = '';
  }
  if (tab === 'achievements') {
    document.querySelectorAll('#achGrid input').forEach(inp => {
      if (!profile.achievementProgress) profile.achievementProgress = {};
      profile.achievementProgress[inp.dataset.ach] = parseInt(inp.value) || 0;
    });
    document.getElementById('achGrid').innerHTML = '';
  }
  if (tab === 'maps') {
    document.querySelectorAll('#mapsBody input').forEach(inp => {
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
        delete profile.mapInfo.maps[m].difficult[d].modes[k];
      } else {
        profile.mapInfo.maps[m].difficult[d].modes[k] = medalToEncoded(newVal);
      }
    });
    document.getElementById('mapsBody').innerHTML = '';
  }
}
