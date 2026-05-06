const UNLOCKS = [
  {
    type: 'dlc', name: 'Legends: Rogue Mode', iapKey: 'btd6_legendsrogue',
    desc: 'Grants ownership of the Rogue DLC game mode.',
    extraApply: (p, on) => { if (on) p.hasPlayedPurchasedFrontier = true; }
  },
  {
    type: 'dlc', name: 'Legends: Frontier Mode', iapKey: 'btd6_legendsfrontier',
    desc: 'Grants ownership of the Frontier DLC game mode.',
    extraApply: null
  },
  {
    type: 'dlc', name: 'Beast Handler Tower', iapKey: 'btd6_beast',
    desc: 'Grants ownership of the Beast Handler tower DLC.',
    extraApply: (p, on) => {
      if (!p.unlockedTowers) p.unlockedTowers = [];
      if (on && !p.unlockedTowers.includes('BeastHandler'))
        p.unlockedTowers.push('BeastHandler');
    }
  },
  {
    type: 'dlc', name: 'Map Editor', iapKey: 'btd6_mapeditorsupporter_new',
    desc: 'Grants ownership of the Map Editor.',
    extraApply: (p, on) => {
      p.hasUnlockedMapEditor = on;
      if (on) p.seenMapEditorInfoPopup = true;
    }
  },
  {
    type: 'iap', name: 'Double Cash Mode',
    iapKey: 'btd6_doublecashmode',
    iapCheck:  p => p.purchase?.purchasedDoubleCashMode === true,
    iapApply:  (p, on) => { if (!p.purchase) p.purchase = {}; p.purchase.purchasedDoubleCashMode = on; },
    desc: 'Unlocks Double Cash mode (2× cash from pops).',
    activeKey: null
  },
  {
    type: 'iap', name: 'Monkey Knowledge',
    iapKey: 'btd6_knowledgeunlocked',
    iapCheck: null,
    iapApply: null,
    desc: 'Unlocks the Monkey Knowledge system.',
    activeKey: null,
    unlockedKey: null,
    extraUnlockApply: (p, on) => {
      toggleIap(p, 'btd6_knowledgeunlocked', on);
      p.knowledgeDisabled = !on;
      if (on) p.newKnowledgePoints = true;
    },
    extraActiveApply: (p, on) => { p.knowledgeDisabled = !on; },
    checkUnlocked: p => (p.purchase?.purchasedOneTimeItems || []).includes('btd6_knowledgeunlocked'),
    checkActive:   p => p.knowledgeDisabled === false
  },
  {
    type: 'toggle', name: 'Fast Track',
    unlockedKey: 'unlockedFastTrack', activeKey: 'fastTrackActive',
    seenKey: 'seenFastTrack',
    desc: 'Lets you speed up games in progress.'
  },
  {
    type: 'toggle', name: 'Big Bloons',
    unlockedKey: 'unlockedBigBloons', activeKey: 'bigBloonsActive',
    seenKey: 'seenBigBloons',
    desc: 'Visual modifier — bloons appear larger.'
  },
  {
    type: 'toggle', name: 'Small Bloons',
    unlockedKey: 'unlockedSmallBloons', activeKey: 'smallBloonsActive',
    seenKey: 'seenSmallBloons',
    desc: 'Visual modifier — bloons appear smaller.'
  },
  {
    type: 'toggle', name: 'Big Towers',
    unlockedKey: 'unlockedBigTowers', activeKey: 'bigTowersActive',
    seenKey: 'seenBigTowers',
    desc: 'Visual modifier — towers appear larger.'
  },
  {
    type: 'toggle', name: 'Small Towers',
    unlockedKey: 'unlockedSmallTowers', activeKey: 'smallTowersActive',
    seenKey: 'seenSmallTowers',
    desc: 'Visual modifier — towers appear smaller.'
  },
  {
    type: 'toggle', name: 'Small Bosses',
    unlockedKey: 'unlockedSmallBosses', activeKey: 'smallBossesActive',
    seenKey: 'seenSmallBosses',
    desc: 'Visual modifier — boss bloons appear smaller.'
  },
  {
    type: 'toggle', name: 'Perks',
    unlockedKey: null, activeKey: 'perksToggledOn',
    seenKey: null,
    desc: 'Enables the perks system for hero abilities.'
  },
  {
    type: 'toggle', name: 'Oompa Loompa Easter Egg',
    unlockedKey: 'unlockedBigBloons',
    activeKey: 'oompaLoompad',
    seenKey: null,
    desc: 'Activates the hidden Oompa Loompa easter egg skin flag.'
  },
  {
    type: 'toggle', name: 'Colour Blind Mode',
    unlockedKey: null, activeKey: 'colorBlindModeOn',
    seenKey: null,
    desc: 'Enables the colour blind accessibility setting.'
  },
];
