function psGet(path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), profile);
}
function psSet(path, val) {
  const keys = path.split('.'), last = keys.pop();
  const obj  = keys.reduce((o, k) => (o != null ? o[k] : undefined), profile);
  if (obj != null) obj[last] = val;
}

function psMaxModeRound(modeKey) {
  const maps = profile.mapInfo?.maps ?? {};
  let best = 0;
  for (const map of Object.values(maps)) {
    for (const diff of Object.values(map.difficult ?? {})) {
      const v = diff.modes?.[modeKey];
      if (v != null) { const r = (v >> 10) & 0xFFFF; if (r > best) best = r; }
    }
  }
  return best;
}
function psSetModeRound(modeKey, newRound) {
  const maps = profile.mapInfo?.maps ?? {};
  for (const map of Object.values(maps)) {
    for (const diff of Object.values(map.difficult ?? {})) {
      if (diff.modes?.[modeKey] != null) {
        const old = diff.modes[modeKey];
        diff.modes[modeKey] = (old & 0x3FF) | ((newRound & 0xFFFF) << 10) | (old & 0xFC000000);
      }
    }
  }
}

function psBestTower() {
  const xp = profile.towerXp ?? {};
  let best = '', bestXp = -1;
  for (const [k, v] of Object.entries(xp)) { if (v > bestXp) { bestXp = v; best = k; } }
  return { name: best, xp: bestXp };
}

function psSection(parent, title) {
  const sec = document.createElement('div');
  sec.className = 'ps-section';
  const h = document.createElement('div');
  h.className = 'ps-section-title';
  h.textContent = title;
  sec.appendChild(h);
  parent.appendChild(sec);
  return sec;
}

function psRow(parent, label, getValue, setValue, isFloat) {
  const row = document.createElement('div');
  row.className = 'ps-row';
  const lbl = document.createElement('span');
  lbl.className = 'ps-label';
  lbl.textContent = label;
  const inp = document.createElement('input');
  inp.className = 'ps-input';
  inp.type = 'number';
  inp.min = '0';
  const cur = getValue();
  inp.value = (cur === undefined || cur === null) ? 0 : (isFloat ? cur : Math.round(cur));
  inp.addEventListener('change', () => setValue(isFloat ? parseFloat(inp.value)||0 : Math.round(parseFloat(inp.value)||0)));
  row.appendChild(lbl);
  row.appendChild(inp);
  parent.appendChild(row);
  return inp;
}

function psRowText(parent, label, value) {
  const row = document.createElement('div');
  row.className = 'ps-row';
  const lbl = document.createElement('span');
  lbl.className = 'ps-label';
  lbl.textContent = label;
  const val = document.createElement('span');
  val.className = 'ps-value-text';
  val.textContent = value ?? '—';
  row.appendChild(lbl);
  row.appendChild(val);
  parent.appendChild(row);
}

function buildProfileStats() {
  const grid = document.getElementById('psGrid');
  grid.innerHTML = '';

  const bs = () => profile.analyticsKonFuze?.basicStats;

  const g = psSection(grid, '🎮 General');
  psRow(g, 'Games Played',                  () => bs()?.gamesPlayed,              v => { if(bs()) bs().gamesPlayed=v; });
  psRow(g, 'Games Won',                     () => psGet('completedGame'),          v => psSet('completedGame',v));
  psRow(g, 'Highest Round (All Time)',       () => psGet('highestSeenRound'),       v => psSet('highestSeenRound',v));
  psRow(g, 'Highest Round (Current Version)',() => psGet('highestSeenRoundCurrentVersion'), v => psSet('highestSeenRoundCurrentVersion',v));
  psRow(g, 'Highest Round CHIMPS',          () => psMaxModeRound('SuperChimps'),   v => psSetModeRound('SuperChimps',v));
  psRow(g, 'Highest Round Deflation',       () => psMaxModeRound('Deflation'),     v => psSetModeRound('Deflation',v));
  psRow(g, 'Collection Chests Opened',      () => psGet('collectionEventCratesOpened'), v => psSet('collectionEventCratesOpened',v));
  psRow(g, 'Golden Bloons Popped',          () => psGet('goldenBloonsPopped'),     v => psSet('goldenBloonsPopped',v));
  psRow(g, 'Monkey Team Wins',              () => psGet('monkeyTeamsWins'),        v => psSet('monkeyTeamsWins',v));
  psRow(g, 'Odysseys Completed',            () => psGet('totalCompletedOdysseys'), v => psSet('totalCompletedOdysseys',v));
  psRow(g, 'Races Entered',                 () => psGet('totalRacesEntered'),      v => psSet('totalRacesEntered',v));
  psRow(g, 'Challenges Completed',          () => psGet('totalDailyChallengesCompleted'), v => psSet('totalDailyChallengesCompleted',v));
  psRow(g, 'Daily Reward Chests Opened',    () => psGet('dailyRewardIndex'),       v => psSet('dailyRewardIndex',v));
  psRow(g, 'Lifetime Trophies',             () => psGet('lifetimeTrophies'),       v => psSet('lifetimeTrophies',v));
  psRow(g, 'Trophies Spent',               () => psGet('trophiesSpent'),           v => psSet('trophiesSpent',v));

  const me = psSection(grid, '🐒 Most Experienced Monkey');
  const best = psBestTower();
  psRowText(me, 'Most Experienced Monkey', best.name || '—');
  psRowText(me, 'Most Experienced Monkey XP', best.xp > 0 ? Math.round(best.xp).toLocaleString() : '0');
  const txp = profile.towerXp ?? {};
  for (const [tower, xp] of Object.entries(txp).sort((a,b) => b[1]-a[1])) {
    psRow(me, tower,
      () => profile.towerXp?.[tower] ?? 0,
      v  => { if(profile.towerXp) profile.towerXp[tower] = v; },
      true);
  }

  const bp = psSection(grid, '🎈 Bloon Pops');
  psRow(bp, 'Total Pop Count',            () => bs()?.bloonsPopped,        v => { if(bs()) bs().bloonsPopped=v; });
  psRow(bp, 'Camo Bloons Popped',         () => bs()?.camosPopped,         v => { if(bs()) bs().camosPopped=v; });
  psRow(bp, 'Ceramic Bloons Popped',      () => bs()?.ceramicsPopped,      v => { if(bs()) bs().ceramicsPopped=v; });
  psRow(bp, 'Lead Bloons Popped',         () => bs()?.leadPopped,          v => { if(bs()) bs().leadPopped=v; });
  psRow(bp, 'Purple Bloons Popped',       () => bs()?.purplesPopped,       v => { if(bs()) bs().purplesPopped=v; });
  psRow(bp, 'Regrow Bloons Popped',       () => bs()?.regrowPopped,        v => { if(bs()) bs().regrowPopped=v; });
  psRow(bp, 'Fortified Bloons Popped',    () => bs()?.fortifiedPopped,     v => { if(bs()) bs().fortifiedPopped=v; });
  psRow(bp, 'Bloons Leaked',              () => bs()?.bloonsLeaked,        v => { if(bs()) bs().bloonsLeaked=v; });
  psRow(bp, 'Necro Bloons Reanimated',    () => psGet('analyticsKonFuze.necroBloonsReanimated'),  v => psSet('analyticsKonFuze.necroBloonsReanimated',v));
  psRow(bp, 'Bloons Revealed by Shimmer', () => psGet('analyticsKonFuze.bloonsRevealedByShimmer'),v => psSet('analyticsKonFuze.bloonsRevealedByShimmer',v));
  psRow(bp, 'Rainbow Bloons w/ Magic',   () => psGet('analyticsKonFuze.rainbowBloonsPoppedWithMagic'), v => psSet('analyticsKonFuze.rainbowBloonsPoppedWithMagic',v));
  psRow(bp, 'Bloon Pops on Peninsula',    () => psGet('analyticsKonFuze.bloonPopsOnPeninsula'),   v => psSet('analyticsKonFuze.bloonPopsOnPeninsula',v));

  const mc = psSection(grid, '🟦 MOAB-Class');
  psRow(mc, 'MOABs Popped',         () => bs()?.moabsPopped,        v => { if(bs()) bs().moabsPopped=v; });
  psRow(mc, 'BFBs Popped',          () => bs()?.bfbsPopped,         v => { if(bs()) bs().bfbsPopped=v; });
  psRow(mc, 'ZOMGs Popped',         () => bs()?.zomgsPopped,        v => { if(bs()) bs().zomgsPopped=v; });
  psRow(mc, 'DDTs Popped',          () => bs()?.ddtsPopped,         v => { if(bs()) bs().ddtsPopped=v; });
  psRow(mc, 'BADs Popped',          () => bs()?.badsPopped,         v => { if(bs()) bs().badsPopped=v; });
  psRow(mc, 'Bosses Popped',        () => bs()?.bossesPopped,       v => { if(bs()) bs().bossesPopped=v; });
  psRow(mc, 'Damage Done to Bosses',() => bs()?.damageDoneToBosses, v => { if(bs()) bs().damageDoneToBosses=v; }, true);

  const ec = psSection(grid, '💰 Economy');
  psRow(ec, 'Cash Generated',   () => bs()?.cashEarned,                         v => { if(bs()) bs().cashEarned=v; }, true);
  psRow(ec, 'Cash Gifted',      () => psGet('analyticsKonFuze.coopCashGiven'),   v => psSet('analyticsKonFuze.coopCashGiven',v), true);

  const mp = psSection(grid, '🏗️ Monkeys & Powers');
  psRow(mp, 'Monkeys Placed',          () => bs()?.totalTowersPlaced,       v => { if(bs()) bs().totalTowersPlaced=v; });
  psRow(mp, 'Abilities Used',          () => bs()?.totalAbilitiesActivated, v => { if(bs()) bs().totalAbilitiesActivated=v; });
  psRow(mp, 'Powers Used',             () => bs()?.totalPowersActivated,    v => { if(bs()) bs().totalPowersActivated=v; });
  psRow(mp, 'Insta Monkeys Used',      () => bs()?.instaMonkeysUsed,        v => { if(bs()) bs().instaMonkeysUsed=v; });
  psRow(mp, 'Total Upgrades Purchased',() => bs()?.totalUpgradesPurchased,  v => { if(bs()) bs().totalUpgradesPurchased=v; });
  psRow(mp, 'Transforming Tonics Used',
    () => bs()?.abilitiesActivatedByName?.['Total Transforming Tonic'] ?? 0,
    v  => { if(bs()?.abilitiesActivatedByName) bs().abilitiesActivatedByName['Total Transforming Tonic']=v; });

  const co = psSection(grid, '🤝 Co-op');
  psRow(co, 'Total Co-op Pop Count', () => psGet('analyticsKonFuze.coopBloonsPopped'), v => psSet('analyticsKonFuze.coopBloonsPopped',v));
  psRow(co, 'Co-op Maps Beaten',     () => psGet('analyticsKonFuze.coopMapsBeaten'),   v => psSet('analyticsKonFuze.coopMapsBeaten',v));
  psRow(co, 'Hosted Co-op Games',    () => psGet('hostedCoopGames'),                   v => psSet('hostedCoopGames',v));
}
