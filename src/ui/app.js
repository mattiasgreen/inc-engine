// src/ui/app.js
// Interactive Game UI & Multi-Game Presentation Controller with Dynamic SVG Assets and Fine-Grained Reactive DOM Updates

import { gamesList, getGameConfig } from '../games/index.js';
import { GameSession } from '../session/session.js';
import { Simulator } from '../engine/simulator.js';
import { OptimalRoiPolicy } from '../engine/policies.js';
import { BigNum } from '../engine/bignum.js';

let activeGameId = localStorage.getItem('inc_engine_active_game') || gamesList[0].id;
let activeConfig = getGameConfig(activeGameId);
let session;
let simulator;

const generatorUI = {};
const upgradeUI = {};

function triggerUpgradeAnimation(btn, card, label = '+UPGRADE!') {
  if (btn) {
    btn.classList.remove('anim-upgrade-btn');
    void btn.offsetWidth; // Trigger reflow
    btn.classList.add('anim-upgrade-btn');

    // Spawn floating particle burst relative to viewport
    const rect = btn.getBoundingClientRect();
    const burst = document.createElement('div');
    burst.className = 'floating-upgrade-burst';
    burst.textContent = label;
    burst.style.position = 'fixed';
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top - 10}px`;
    document.body.appendChild(burst);
    setTimeout(() => {
      burst.remove();
    }, 750);
  }
  if (card) {
    card.classList.remove('anim-card-pulse');
    void card.offsetWidth; // Trigger reflow
    card.classList.add('anim-card-pulse');
  }
}

function init() {
  initGame(activeGameId);

  // Setup loop for time advancement and fine-grained UI updates
  setInterval(() => {
    session.tickToNow();
    render();
  }, 100);

  // Auto-save every 5 seconds
  setInterval(() => {
    session.save();
  }, 5000);

  window.addEventListener('beforeunload', () => {
    session.save();
  });

  setupStaticEventListeners();
  setupPWA();
  setupMobileTabs();
}

function setupMobileTabs() {
  const tabs = document.querySelectorAll('.mobile-tab-btn');
  if (!tabs.length) return;

  function applyTab(targetId) {
    const l0 = document.getElementById('layer0-panel');
    const l1 = document.getElementById('layer1-panel');
    const sb = document.getElementById('sandbox-panel');
    const rightCol = document.getElementById('spa-col-right');

    if (window.innerWidth <= 900) {
      if (targetId === 'layer0-panel') {
        l0?.classList.remove('mobile-tab-hidden');
        rightCol?.classList.add('mobile-tab-hidden');
      } else if (targetId === 'layer1-panel') {
        l0?.classList.add('mobile-tab-hidden');
        rightCol?.classList.remove('mobile-tab-hidden');
        l1?.classList.remove('mobile-tab-hidden');
        sb?.classList.add('mobile-tab-hidden');
      } else if (targetId === 'sandbox-panel') {
        l0?.classList.add('mobile-tab-hidden');
        rightCol?.classList.remove('mobile-tab-hidden');
        l1?.classList.add('mobile-tab-hidden');
        sb?.classList.remove('mobile-tab-hidden');
      }
    } else {
      l0?.classList.remove('mobile-tab-hidden');
      rightCol?.classList.remove('mobile-tab-hidden');
      l1?.classList.remove('mobile-tab-hidden');
      sb?.classList.remove('mobile-tab-hidden');
    }
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      applyTab(btn.getAttribute('data-tab'));
    });
  });

  // Apply initially and on resize
  applyTab('layer0-panel');
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.mobile-tab-btn.active');
    applyTab(activeBtn?.getAttribute('data-tab') || 'layer0-panel');
  });
}

function setupPWA() {
  const updateToast = document.getElementById('pwa-update-toast');
  const refreshBtn = document.getElementById('btn-refresh-app');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (updateToast) updateToast.style.display = 'flex';
              }
            });
          }
        });
      }).catch((err) => {
        console.warn('PWA service worker registration failed:', err);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (updateToast) updateToast.style.display = 'flex';
      });
    });
  }

  let deferredInstallPrompt = null;
  const installBtn = document.getElementById('btn-install-pwa');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredInstallPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });
}

function initGame(gameId) {
  activeGameId = gameId;
  activeConfig = getGameConfig(gameId);
  localStorage.setItem('inc_engine_active_game', gameId);

  // Apply Theme Palette Custom Properties
  if (activeConfig.palette) {
    for (const [prop, val] of Object.entries(activeConfig.palette)) {
      document.documentElement.style.setProperty(prop, val);
    }
  }

  session = new GameSession({ config: activeConfig });
  simulator = new Simulator(activeConfig);

  // Check for offline progress
  const offlineReport = session.load();
  if (offlineReport && offlineReport.elapsedMs > 5000) {
    showOfflineModal(offlineReport);
  }

  // Update Game Title & Subtitle in Header
  document.getElementById('game-title').textContent = window.innerWidth <= 900 && activeConfig.shortName ? activeConfig.shortName : activeConfig.name;
  document.getElementById('game-subtitle').textContent = activeConfig.subtitle || '';

  // Render Game Selector
  populateGameSelector();

  // Mount UI and render initial state
  mountUI();
  render();
}

function populateGameSelector() {
  const select = document.getElementById('game-select');
  if (!select) return;

  select.innerHTML = '';
  for (const game of gamesList) {
    const opt = document.createElement('option');
    opt.value = game.id;
    opt.textContent = game.selectLabel || game.shortName || game.name;
    if (game.id === activeGameId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }

  select.onchange = (e) => {
    session.save();
    initGame(e.target.value);
  };
}

function mountUI() {
  const l0Config = activeConfig.layers[0];
  const l1Config = activeConfig.layers[1];

  // Scenery Panorama
  const sceneryContainer = document.getElementById('scenery-bg');
  if (sceneryContainer) {
    sceneryContainer.innerHTML = activeConfig.scenery || '';
  }

  // Character Guide Banner
  const charPortrait = document.getElementById('character-portrait');
  const charName = document.getElementById('character-name');
  const charTitle = document.getElementById('character-title');
  const charQuote = document.getElementById('character-quote');

  if (activeConfig.character) {
    if (charPortrait) {
      if (activeConfig.character.image) {
        charPortrait.innerHTML = `
          <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <img src="${activeConfig.character.image}" alt="${activeConfig.character.name}" class="char-portrait-img" />
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">${activeConfig.character.svg || ''}</div>
          </div>
        `;
      } else {
        charPortrait.innerHTML = activeConfig.character.svg || '';
      }
      charPortrait.style.cursor = 'pointer';
      charPortrait.title = `Click to view ${activeConfig.character.name} Lore Card`;
      charPortrait.onclick = (e) => {
        e.stopPropagation();
        openLoreModal({
          title: activeConfig.character.name,
          subtitle: activeConfig.character.title,
          image: activeConfig.character.image,
          svg: activeConfig.character.svg,
          quote: document.getElementById('character-quote')?.textContent || activeConfig.character.dialogue?.intro,
          backstory: activeConfig.character.backstory
        });
      };
    }
    if (charName) charName.textContent = activeConfig.character.name || '';
    if (charTitle) charTitle.textContent = activeConfig.character.title || '';
    if (charQuote) charQuote.textContent = `"${activeConfig.character.dialogue?.intro || ''}"`;
  }

  // Layer 0 Header
  const l0Title = document.getElementById('layer0-title');
  const l0Icon = document.getElementById('layer0-icon');
  const l0SubLabel = document.getElementById('layer0-sub-label');
  const l0CurrSymbol = document.getElementById('layer0-currency-symbol');

  if (l0Title) l0Title.textContent = l0Config.name;
  if (l0Icon) {
    l0Icon.innerHTML = l0Config.image
      ? `<img src="${l0Config.image}" alt="${l0Config.name}" class="panel-icon-img" />`
      : (l0Config.svg || '');
  }
  if (l0SubLabel) l0SubLabel.textContent = `Run ${l0Config.currency.name}:`;
  if (l0CurrSymbol) l0CurrSymbol.textContent = l0Config.currency.symbol;

  // Mount Layer 0 Generators
  const genContainer = document.getElementById('layer0-generators');
  genContainer.innerHTML = '';
  generatorUI.layer0 = {};

  for (const gen of l0Config.generators) {
    const card = document.createElement('div');
    card.className = 'card';

    const genIconHtml = gen.image
      ? `<img src="${gen.image}" alt="${gen.name}" class="gen-thumb-img" />`
      : (gen.svg || '');

    card.innerHTML = `
      <div class="lock-view" style="display: none;">
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <div class="card-icon" style="opacity: 0.5;">${genIconHtml}</div>
          <div>
            <h3>${gen.name} (Locked)</h3>
            <p class="desc">Unlocks at ${BigNum.from(gen.unlockThreshold || 0).format()} total ${l0Config.currency.name}</p>
          </div>
        </div>
      </div>
      <div class="main-view">
        <div class="card-header">
          <div style="display: flex; gap: 0.65rem; align-items: center; min-width: 0; flex: 1;">
            <div class="card-icon">${genIconHtml}</div>
            <div style="min-width: 0; flex: 1;">
              <h3 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${gen.name}</h3>
              <p class="lore-text">${gen.lore || ''}</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.35rem; align-items: center; flex-shrink: 0;">
            <span class="badge owned-badge">Owned: 0</span>
            <span class="badge bought-badge" style="background: rgba(129, 140, 248, 0.15); color: var(--secondary);">0 bought</span>
          </div>
        </div>
        <p class="meta output-meta">Output: 0 ${l0Config.currency.symbol}/tick | 0 ${l0Config.currency.symbol}/s</p>
        <div class="actions">
          <button class="btn primary btn-buy-1">Buy 1 (10 ${l0Config.currency.symbol})</button>
          <button class="btn secondary btn-buy-max">Buy Max (0)</button>
        </div>
      </div>
    `;

    const lockView = card.querySelector('.lock-view');
    const mainView = card.querySelector('.main-view');
    const ownedBadge = card.querySelector('.owned-badge');
    const boughtBadge = card.querySelector('.bought-badge');
    const outputMeta = card.querySelector('.output-meta');
    const buy1Btn = card.querySelector('.btn-buy-1');
    const buyMaxBtn = card.querySelector('.btn-buy-max');

    buy1Btn.addEventListener('click', () => {
      session.buyGenerator('layer0', gen.id, 1);
      triggerUpgradeAnimation(buy1Btn, card, '+1 BOUGHT');
      render();
    });

    buyMaxBtn.addEventListener('click', () => {
      session.buyGenerator('layer0', gen.id, 'max');
      triggerUpgradeAnimation(buyMaxBtn, card, '+MAX BOUGHT');
      render();
    });

    card.querySelectorAll('.card-icon').forEach(genIcon => {
      genIcon.style.cursor = 'pointer';
      genIcon.title = `Click to view ${gen.name} Lore Card`;
      genIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        openLoreModal({
          title: gen.name,
          subtitle: `${l0Config.name} Generator`,
          image: gen.image,
          svg: gen.svg,
          quote: gen.lore,
          backstory: gen.backstory || gen.lore,
          effect: `Base yield: ${gen.baseOutputPerTick} ${typeof gen.produces === 'string' ? l0Config.currency.symbol : 'units'}/tick`
        });
      });
    });

    genContainer.appendChild(card);

    generatorUI.layer0[gen.id] = {
      card,
      lockView,
      mainView,
      ownedBadge,
      boughtBadge,
      outputMeta,
      buy1Btn,
      buyMaxBtn
    };
  }

  // Mount Layer 0 Upgrades
  const upgContainer = document.getElementById('layer0-upgrades');
  upgContainer.innerHTML = '';
  upgradeUI.layer0 = {};

  for (const upg of l0Config.upgrades) {
    const card = document.createElement('div');
    card.className = 'card upg-card';

    const upgIconHtml = upg.image
      ? `<img src="${upg.image}" alt="${upg.name}" class="upg-thumb-img" />`
      : (upg.svg || '');

    const artHtml = upg.image ? `
      <div class="card-thumb-art">
        <img src="${upg.image}" alt="${upg.name}" class="upg-thumb-img" />
      </div>
    ` : `<div class="card-icon">${upg.svg || ''}</div>`;

    card.innerHTML = `
      <div class="lock-view" style="display: none;">
        <div style="display: flex; gap: 0.65rem; align-items: center;">
          <div class="card-icon" style="opacity: 0.5;">${upgIconHtml}</div>
          <div>
            <h4>${upg.name} (Locked)</h4>
            <p class="desc">Unlocks at ${BigNum.from(upg.unlockThreshold || 0).format()} run ${l0Config.currency.name}</p>
          </div>
        </div>
      </div>
      <div class="main-view">
        <div class="card-header">
          <div style="display: flex; gap: 0.65rem; align-items: center; min-width: 0; flex: 1;">
            ${artHtml}
            <div style="min-width: 0; flex: 1;">
              <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${upg.name}</h4>
              <p class="lore-text">${upg.lore || ''}</p>
            </div>
          </div>
          <span class="badge lvl-badge">Lvl 0/${upg.maxLevel || '∞'}</span>
        </div>
        <p class="desc">${upg.description}</p>
        <div class="actions">
          <button class="btn primary btn-upgrade">Upgrade</button>
        </div>
      </div>
    `;

    const lockView = card.querySelector('.lock-view');
    const mainView = card.querySelector('.main-view');
    const lvlBadge = card.querySelector('.lvl-badge');
    const btn = card.querySelector('.btn-upgrade');

    btn.addEventListener('click', () => {
      session.buyUpgrade('layer0', upg.id);
      triggerUpgradeAnimation(btn, card);
      render();
    });

    card.querySelectorAll('.card-thumb-art, .card-icon').forEach(upgArt => {
      upgArt.style.cursor = 'pointer';
      upgArt.title = `Click to view ${upg.name} Lore Card`;
      upgArt.addEventListener('click', (e) => {
        e.stopPropagation();
        openLoreModal({
          title: upg.name,
          subtitle: `${l0Config.name} Upgrade`,
          image: upg.image,
          svg: upg.svg,
          quote: upg.lore,
          backstory: upg.backstory || upg.lore,
          effect: upg.description
        });
      });
    });

    upgContainer.appendChild(card);

    upgradeUI.layer0[upg.id] = {
      card,
      lockView,
      mainView,
      lvlBadge,
      btn
    };
  }

  // Layer 1 Header & Panel
  const l1Title = document.getElementById('layer1-title');
  const l1Icon = document.getElementById('layer1-icon');
  const l1PassiveTarget = document.getElementById('layer1-passive-target');
  const l1CurrSymbol = document.getElementById('layer1-currency-symbol');
  const l1CurrName = document.getElementById('layer1-currency-name');
  const prestigeThresholdBadge = document.getElementById('prestige-threshold-badge');

  if (l1Title) l1Title.textContent = l1Config.name;
  if (l1Icon) {
    l1Icon.innerHTML = l1Config.image
      ? `<img src="${l1Config.image}" alt="${l1Config.name}" class="panel-icon-img" />`
      : (l1Config.svg || '');
  }
  if (l1PassiveTarget) l1PassiveTarget.textContent = l0Config.name;
  if (l1CurrSymbol) l1CurrSymbol.textContent = l1Config.currency.symbol;
  if (l1CurrName) l1CurrName.textContent = l1Config.currency.name;
  if (prestigeThresholdBadge) {
    prestigeThresholdBadge.textContent = `Threshold: ${BigNum.from(l1Config.prestige.thresholdCurrency).format()} ${l0Config.currency.symbol}`;
  }

  // Prestige Artwork Banner
  const prestigeImg = document.getElementById('prestige-art-img');
  const prestigeTitle = document.getElementById('prestige-art-title');
  if (prestigeImg && activeConfig.prestigeImage) {
    prestigeImg.src = activeConfig.prestigeImage;
    prestigeImg.alt = activeConfig.prestigeTitle || 'Prestige Ascension';
  }
  if (prestigeTitle && activeConfig.prestigeTitle) {
    prestigeTitle.textContent = activeConfig.prestigeTitle;
  }

  // Mount Layer 1 Upgrades
  const l1UpgContainer = document.getElementById('layer1-upgrades');
  l1UpgContainer.innerHTML = '';
  upgradeUI.layer1 = {};

  for (const upg of l1Config.upgrades) {
    const card = document.createElement('div');
    card.className = 'card upg-card';

    const artHtml = upg.image ? `
      <div class="card-thumb-art">
        <img src="${upg.image}" alt="${upg.name}" class="upg-thumb-img" />
      </div>
    ` : `<div class="card-icon">${upg.svg || ''}</div>`;

    card.innerHTML = `
      <div class="main-view">
        <div class="card-header">
          <div style="display: flex; gap: 0.65rem; align-items: center; min-width: 0; flex: 1;">
            ${artHtml}
            <div style="min-width: 0; flex: 1;">
              <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${upg.name}</h4>
              <p class="lore-text">${upg.lore || ''}</p>
            </div>
          </div>
          <span class="badge lvl-badge">Lvl 0/${upg.maxLevel || '∞'}</span>
        </div>
        <p class="desc">${upg.description}</p>
        <div class="actions">
          <button class="btn primary btn-upgrade">Upgrade</button>
        </div>
      </div>
    `;

    const lvlBadge = card.querySelector('.lvl-badge');
    const btn = card.querySelector('.btn-upgrade');

    btn.addEventListener('click', () => {
      session.buyUpgrade('layer1', upg.id);
      triggerUpgradeAnimation(btn, card);
      render();
    });

    card.querySelectorAll('.card-thumb-art, .card-icon').forEach(l1UpgArt => {
      l1UpgArt.style.cursor = 'pointer';
      l1UpgArt.title = `Click to view ${upg.name} Lore Card`;
      l1UpgArt.addEventListener('click', (e) => {
        e.stopPropagation();
        openLoreModal({
          title: upg.name,
          subtitle: `${l1Config.name} Prestige Upgrade`,
          image: upg.image,
          svg: upg.svg,
          quote: upg.lore,
          backstory: upg.backstory || upg.lore,
          effect: upg.description
        });
      });
    });

    l1UpgContainer.appendChild(card);

    upgradeUI.layer1[upg.id] = {
      card,
      lvlBadge,
      btn
    };
  }
}

function showOfflineModal(report) {
  const modal = document.getElementById('offline-modal');
  if (!modal) return;
  const elapsedSec = (report.elapsedMs / 1000).toFixed(1);
  const layer0Delta = report.currencyDeltas.layer0 ? report.currencyDeltas.layer0.format() : '0';
  const sym = activeConfig.layers[0].currency.symbol;

  document.getElementById('offline-summary').innerHTML = `
    <p>You were offline for <strong>${elapsedSec}s</strong>.</p>
    <p>Cycles fired: <strong>${report.cyclesFired.format()}</strong></p>
    <p>Ticks generated: <strong>${report.ticksEmitted.format()}</strong></p>
    <p>${activeConfig.layers[0].currency.name} gained: <strong>+${layer0Delta} ${sym}</strong></p>
  `;
  modal.style.display = 'flex';
}

function render() {
  const state = session.getState();
  const stats = session.getDerivedStats();
  const l0Config = activeConfig.layers[0];
  const l1Config = activeConfig.layers[1];

  // Telemetry Header
  const cycleFreq = (1000 / stats.effectiveCycleDurationMs).toFixed(2);
  document.getElementById('telemetry-cycle-freq').textContent = `${cycleFreq} /s`;
  document.getElementById('telemetry-tick-yield').textContent = stats.tickYieldPerCycle.format();
  document.getElementById('telemetry-eff-ticks').textContent = `${stats.effectiveTicksPerSec.toFixed(2)} /s`;
  document.getElementById('telemetry-total-ticks').textContent = state.totalTicks.format();
  document.getElementById('telemetry-total-cycles').textContent = state.totalCycles.format();

  // Progressive Character Dialogue updates
  const charQuote = document.getElementById('character-quote');
  if (charQuote && activeConfig.character?.dialogue) {
    const l1 = activeConfig.layers[1]?.id;
    const l0Gens = activeConfig.layers[0]?.generators || [];
    const lastGen = l0Gens[l0Gens.length - 1]?.id;
    const midGen = l0Gens[1]?.id;

    if (l1 && state.layers[l1]?.currency.gt(0)) {
      charQuote.textContent = `"${activeConfig.character.dialogue.prestigeExecuted}"`;
    } else if (l1 && stats.visibility.layers[l1] === 'visible') {
      charQuote.textContent = `"${activeConfig.character.dialogue.prestigeVisible}"`;
    } else if (lastGen && stats.visibility.generators.layer0[lastGen] === 'visible') {
      charQuote.textContent = `"${activeConfig.character.dialogue.gen3Revealed}"`;
    } else if (midGen && stats.visibility.generators.layer0[midGen] === 'visible') {
      charQuote.textContent = `"${activeConfig.character.dialogue.gen2Revealed}"`;
    } else {
      charQuote.textContent = `"${activeConfig.character.dialogue.intro}"`;
    }
  }

  // Layer 0 Currency
  const layer0 = state.layers.layer0;
  document.getElementById('layer0-currency').textContent = layer0.currency.format();
  document.getElementById('layer0-run-total').textContent = layer0.runTotalCurrency.format();

  const netOutputPerTick = stats.layerProductionPerTick.layer0 || new BigNum(0);
  const netOutputPerSec = netOutputPerTick.mul(stats.effectiveTicksPerSec);
  document.getElementById('layer0-output-sec').textContent = `${netOutputPerSec.format()} ${l0Config.currency.symbol}/s`;

  // Update Layer 0 Generators
  for (const gen of l0Config.generators) {
    const ui = generatorUI.layer0?.[gen.id];
    if (!ui) continue;

    const vis = stats.visibility.generators.layer0[gen.id];
    if (vis === 'hidden') {
      ui.card.style.display = 'none';
      continue;
    }
    ui.card.style.display = 'block';

    const isUnlocked = !gen.unlockThreshold || layer0.runTotalCurrency.gte(gen.unlockThreshold);
    if (!isUnlocked) {
      ui.lockView.style.display = 'block';
      ui.mainView.style.display = 'none';
      ui.card.className = 'card locked';
      continue;
    }

    ui.lockView.style.display = 'none';
    ui.mainView.style.display = 'block';
    ui.card.className = 'card';

    const bought = layer0.generators[gen.id].bought || layer0.generators[gen.id].owned;
    const owned = layer0.generators[gen.id].owned;
    const rate = stats.generatorOutputs.layer0[gen.id];
    const cost1 = stats.generatorCosts.layer0[gen.id];
    const maxInfo = stats.maxAffordable.layer0[gen.id];
    const canAfford1 = layer0.currency.gte(cost1);

    ui.ownedBadge.textContent = `Owned: ${owned.format()}`;
    ui.boughtBadge.textContent = `${bought.format()} bought`;

    if (gen.produces && gen.produces.type === 'generator') {
      const targetGen = l0Config.generators.find(g => g.id === gen.produces.targetId);
      const targetName = targetGen?.name || gen.produces.targetId;
      ui.outputMeta.innerHTML = `Produces: <strong>${targetName}</strong> (+<strong>${rate.format()}</strong>/tick | +<strong>${rate.mul(stats.effectiveTicksPerSec).format()}</strong>/s)`;
    } else {
      ui.outputMeta.innerHTML = `Output: <strong>${rate.format()}</strong> ${l0Config.currency.symbol}/tick | <strong>${rate.mul(stats.effectiveTicksPerSec).format()}</strong> ${l0Config.currency.symbol}/s`;
    }

    ui.buy1Btn.textContent = `Buy 1 (${cost1.format()} ${l0Config.currency.symbol})`;
    ui.buy1Btn.disabled = !canAfford1;
    ui.buy1Btn.className = `btn btn-buy-1 ${canAfford1 ? 'primary' : 'disabled'}`;

    ui.buyMaxBtn.textContent = `Buy Max (${maxInfo.count})`;
    ui.buyMaxBtn.disabled = maxInfo.count <= 0;
    ui.buyMaxBtn.className = `btn btn-buy-max ${maxInfo.count > 0 ? 'secondary' : 'disabled'}`;
  }

  // Update Layer 0 Upgrades
  let visibleL0UpgradesCount = 0;
  for (const upg of l0Config.upgrades) {
    const ui = upgradeUI.layer0?.[upg.id];
    if (!ui) continue;

    const vis = stats.visibility.upgrades.layer0[upg.id];
    if (vis === 'hidden') {
      ui.card.style.display = 'none';
      continue;
    }
    ui.card.style.display = 'block';
    visibleL0UpgradesCount++;

    const isLocked = upg.unlockThreshold && layer0.runTotalCurrency.lt(upg.unlockThreshold);
    if (isLocked) {
      ui.lockView.style.display = 'block';
      ui.mainView.style.display = 'none';
      ui.card.className = 'card locked';
      continue;
    }

    ui.lockView.style.display = 'none';
    ui.mainView.style.display = 'block';

    const level = layer0.upgrades[upg.id]?.level || 0;
    const isMax = level >= (upg.maxLevel || Infinity);
    const cost = stats.upgradeCosts.layer0[upg.id];
    const canAfford = cost && layer0.currency.gte(cost);

    ui.card.className = `card ${isMax ? 'maxed' : ''}`;
    ui.lvlBadge.textContent = isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`;

    if (isMax) {
      ui.btn.textContent = 'Maxed';
      ui.btn.disabled = true;
      ui.btn.className = 'btn btn-upgrade disabled';
    } else {
      ui.btn.textContent = `Upgrade (${cost.format()} ${l0Config.currency.symbol})`;
      ui.btn.disabled = !canAfford;
      ui.btn.className = `btn btn-upgrade ${canAfford ? 'primary' : 'disabled'}`;
    }
  }

  const l0UpgHeader = document.getElementById('layer0-upgrades-header');
  if (l0UpgHeader) {
    l0UpgHeader.style.display = visibleL0UpgradesCount > 0 ? 'block' : 'none';
  }

  // Layer 1 Prestige
  const layer1 = state.layers.layer1;
  const prestigeReward = stats.prestigeRewards.layer1;
  const canPrestige = prestigeReward.gte(1);
  const passiveMult = stats.layerMultipliers.layer0;

  const l1Visible = stats.visibility.layers.layer1 !== 'hidden';
  const l1Panel = document.getElementById('layer1-panel');
  if (l1Panel) {
    if (l1Visible) {
      l1Panel.classList.remove('layer-locked-hidden');
    } else {
      l1Panel.classList.add('layer-locked-hidden');
    }
  }
  const l1TabBtn = document.getElementById('mobile-tab-l1');
  if (l1TabBtn) {
    l1TabBtn.style.display = l1Visible ? 'block' : 'none';
  }

  document.getElementById('layer1-currency').textContent = layer1.currency.format();
  document.getElementById('layer1-passive-mult').textContent = `${passiveMult.toNumber().toFixed(2)}x`;
  const pendingEl = document.getElementById('layer1-pending');
  if (pendingEl) {
    pendingEl.textContent = prestigeReward.format();
  }

  const prestigeBtn = document.getElementById('btn-prestige');
  prestigeBtn.disabled = !canPrestige;
  prestigeBtn.className = `btn ${canPrestige ? 'danger' : 'disabled'}`;
  const actionLabel = l1Config.prestige.actionLabel || `Prestige for +${prestigeReward.format()} ${l1Config.currency.name}`;
  prestigeBtn.textContent = canPrestige
    ? `${actionLabel} (+${prestigeReward.format()} ${l1Config.currency.symbol})`
    : `Need ${BigNum.from(l1Config.prestige.thresholdCurrency).format()} Run ${l0Config.currency.symbol}`;

  // Update Layer 1 Upgrades
  let visibleL1UpgradesCount = 0;
  for (const upg of l1Config.upgrades) {
    const ui = upgradeUI.layer1?.[upg.id];
    if (!ui) continue;

    const vis = stats.visibility.upgrades.layer1[upg.id];
    if (vis === 'hidden') {
      ui.card.style.display = 'none';
      continue;
    }
    ui.card.style.display = 'block';
    visibleL1UpgradesCount++;

    const level = layer1.upgrades[upg.id]?.level || 0;
    const isMax = level >= (upg.maxLevel || Infinity);
    const cost = stats.upgradeCosts.layer1[upg.id];
    const canAfford = cost && layer1.currency.gte(cost);

    ui.card.className = `card ${isMax ? 'maxed' : (!cost ? 'locked' : '')}`;
    ui.lvlBadge.textContent = isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`;

    if (isMax) {
      ui.btn.textContent = 'Maxed';
      ui.btn.disabled = true;
      ui.btn.className = 'btn btn-upgrade disabled';
    } else if (!cost) {
      let reason = 'Locked';
      if (upg.exclusiveWith && upg.exclusiveWith.some(s => (layer1.upgrades[s]?.level || 0) > 0)) {
        reason = 'Locked (Exclusive Branch)';
      } else if (upg.prerequisites) {
        reason = 'Requires Prerequisites';
      }
      ui.btn.textContent = reason;
      ui.btn.disabled = true;
      ui.btn.className = 'btn btn-upgrade disabled';
    } else {
      ui.btn.textContent = `Upgrade (${cost.format()} ${l1Config.currency.symbol})`;
      ui.btn.disabled = !canAfford;
      ui.btn.className = `btn btn-upgrade ${canAfford ? 'primary' : 'disabled'}`;
    }
  }

  const l1UpgHeader = document.getElementById('layer1-upgrades-header');
  if (l1UpgHeader) {
    l1UpgHeader.style.display = visibleL1UpgradesCount > 0 ? 'block' : 'none';
  }
}

function setupStaticEventListeners() {
  document.getElementById('btn-prestige').addEventListener('click', () => {
    session.resetLayer('layer1');
    render();
  });

  // Time Jump Dev Sandbox
  document.querySelectorAll('[data-jump-ms]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ms = parseInt(btn.dataset.jumpMs, 10);
      const report = session.jumpTime(ms);
      if (report) showOfflineModal(report);
      render();
    });
  });

  // Active Policy Simulation
  document.getElementById('btn-sim-optimal').addEventListener('click', () => {
    const current = session.getState();
    const policy = new OptimalRoiPolicy();
    const target = activeConfig.layers[1].prestige.thresholdCurrency;
    const result = simulator.run(current, policy, {
      stopCondition: st => st.layers.layer0.runTotalCurrency.gte(target),
      maxSimulatedMs: 15 * 60 * 1000
    });
    session.syncFromSimulation(result.state);
    alert(`Simulation finished! Ran ${(result.simulatedMs / 1000).toFixed(1)}s of active play across ${result.steps} decisions.`);
    render();
  });

  // Persistence Buttons
  document.getElementById('btn-save').addEventListener('click', () => {
    session.save();
    alert('Game saved successfully!');
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    const str = session.exportSave();
    navigator.clipboard.writeText(str).then(() => {
      alert('Save copied to clipboard!');
    }).catch(() => {
      prompt('Save data:', str);
    });
  });

  document.getElementById('btn-import').addEventListener('click', () => {
    const str = prompt('Paste your save string:');
    if (str) {
      try {
        session.importSave(str);
        render();
        alert('Save loaded successfully!');
      } catch {
        alert('Invalid save string');
      }
    }
  });

  document.getElementById('btn-hard-reset').addEventListener('click', () => {
    if (confirm(`Are you sure you want to hard reset all progress for ${activeConfig.name}?`)) {
      session.hardReset();
      render();
    }
  });

  document.getElementById('btn-close-offline-modal')?.addEventListener('click', () => {
    document.getElementById('offline-modal').style.display = 'none';
  });

  // Character & Upgrade Lore Dossier Modal
  const charBanner = document.getElementById('character-banner');
  if (charBanner) {
    charBanner.style.cursor = 'pointer';
    charBanner.title = 'View Character Lore Dossier';
    charBanner.addEventListener('click', () => {
      if (!activeConfig.character) return;
      openLoreModal({
        title: activeConfig.character.name,
        subtitle: activeConfig.character.title,
        image: activeConfig.character.image,
        svg: activeConfig.character.svg,
        quote: document.getElementById('character-quote')?.textContent || activeConfig.character.dialogue?.intro,
        backstory: activeConfig.character.backstory
      });
    });
  }

  const loreModal = document.getElementById('character-modal');
  if (loreModal) {
    loreModal.addEventListener('click', (e) => {
      if (e.target === loreModal) {
        loreModal.style.display = 'none';
      }
    });
  }

  document.getElementById('btn-close-character-modal')?.addEventListener('click', () => {
    if (loreModal) loreModal.style.display = 'none';
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loreModal) loreModal.style.display = 'none';
      const offlineModal = document.getElementById('offline-modal');
      if (offlineModal) offlineModal.style.display = 'none';
    }
  });
}

export function openLoreModal({ title, subtitle, image, svg, quote, backstory, effect }) {
  const modal = document.getElementById('character-modal');
  const portrait = document.getElementById('dossier-portrait');
  const name = document.getElementById('dossier-name');
  const titleEl = document.getElementById('dossier-title');
  const quoteEl = document.getElementById('dossier-quote');
  const backstoryEl = document.getElementById('dossier-backstory');
  const effectContainer = document.getElementById('dossier-effect-container');
  const effectEl = document.getElementById('dossier-effect');

  if (portrait) {
    if (image) {
      portrait.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <img src="${image}" alt="${title || ''}" />
          ${svg ? `<div class="halo-overlay">${svg}</div>` : ''}
        </div>
      `;
    } else if (svg) {
      portrait.innerHTML = svg;
    } else {
      portrait.innerHTML = '';
    }
  }

  if (name) name.textContent = title || '';
  if (titleEl) titleEl.textContent = subtitle || 'Archive Dossier';

  if (quoteEl) {
    if (quote) {
      quoteEl.textContent = quote.startsWith('"') ? quote : `"${quote}"`;
      quoteEl.style.display = 'block';
    } else {
      quoteEl.style.display = 'none';
    }
  }

  if (backstoryEl) {
    backstoryEl.textContent = backstory || 'No additional transmission recorded.';
  }

  if (effectContainer && effectEl) {
    if (effect) {
      effectEl.textContent = effect;
      effectContainer.style.display = 'block';
    } else {
      effectContainer.style.display = 'none';
    }
  }

  if (modal) modal.style.display = 'flex';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
