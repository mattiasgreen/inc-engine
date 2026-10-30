// src/ui/app.js
// Interactive Game UI & Simulation Sandbox Controller with Fine-Grained Reactive DOM Updates

import { defaultGameConfig } from '../engine/config.js';
import { GameSession } from '../session/session.js';
import { Simulator } from '../engine/simulator.js';
import { OptimalRoiPolicy, GreedyPolicy } from '../engine/policies.js';
import { BigNum } from '../engine/bignum.js';

let session;
let simulator;

const generatorUI = {};
const upgradeUI = {};

function init() {
  session = new GameSession({ config: defaultGameConfig });
  simulator = new Simulator(defaultGameConfig);

  // Check for offline progress
  const offlineReport = session.load();
  if (offlineReport && offlineReport.elapsedMs > 5000) {
    showOfflineModal(offlineReport);
  }

  // Mount cards once to prevent DOM thrashing
  mountUI();

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

  setupEventListeners();
  render();
}

function mountUI() {
  // Mount Layer 0 Generators
  const genContainer = document.getElementById('layer0-generators');
  genContainer.innerHTML = '';
  generatorUI.layer0 = {};

  for (const gen of defaultGameConfig.layers[0].generators) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="lock-view" style="display: none;">
        <h3>${gen.name} (Locked)</h3>
        <p class="desc">Unlocks at ${BigNum.from(gen.unlockThreshold || 0).format()} total Energy</p>
      </div>
      <div class="main-view">
        <div class="card-header">
          <h3>${gen.name}</h3>
          <span class="badge owned-badge">Owned: 0</span>
        </div>
        <p class="meta output-meta">Output: 0 E/tick | 0 E/s</p>
        <div class="actions">
          <button class="btn primary btn-buy-1">Buy 1 (10 E)</button>
          <button class="btn secondary btn-buy-max">Buy Max (0)</button>
        </div>
      </div>
    `;

    const lockView = card.querySelector('.lock-view');
    const mainView = card.querySelector('.main-view');
    const ownedBadge = card.querySelector('.owned-badge');
    const outputMeta = card.querySelector('.output-meta');
    const buy1Btn = card.querySelector('.btn-buy-1');
    const buyMaxBtn = card.querySelector('.btn-buy-max');

    buy1Btn.addEventListener('click', () => {
      session.buyGenerator('layer0', gen.id, 1);
      render();
    });

    buyMaxBtn.addEventListener('click', () => {
      session.buyGenerator('layer0', gen.id, 'max');
      render();
    });

    genContainer.appendChild(card);

    generatorUI.layer0[gen.id] = {
      card,
      lockView,
      mainView,
      ownedBadge,
      outputMeta,
      buy1Btn,
      buyMaxBtn
    };
  }

  // Mount Layer 0 Upgrades
  const upgContainer = document.getElementById('layer0-upgrades');
  upgContainer.innerHTML = '';
  upgradeUI.layer0 = {};

  for (const upg of defaultGameConfig.layers[0].upgrades) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="lock-view" style="display: none;">
        <h4>${upg.name} (Locked)</h4>
        <p class="desc">Unlocks at ${BigNum.from(upg.unlockThreshold || 0).format()} run Energy</p>
      </div>
      <div class="main-view">
        <div class="card-header">
          <h4>${upg.name}</h4>
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
      render();
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

  // Mount Layer 1 Upgrades
  const l1UpgContainer = document.getElementById('layer1-upgrades');
  l1UpgContainer.innerHTML = '';
  upgradeUI.layer1 = {};

  for (const upg of defaultGameConfig.layers[1].upgrades) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="main-view">
        <div class="card-header">
          <h4>${upg.name}</h4>
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
      render();
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

  document.getElementById('offline-summary').innerHTML = `
    <p>You were offline for <strong>${elapsedSec}s</strong>.</p>
    <p>Cycles fired: <strong>${report.cyclesFired.format()}</strong></p>
    <p>Ticks generated: <strong>${report.ticksEmitted.format()}</strong></p>
    <p>Energy gained: <strong>+${layer0Delta} E</strong></p>
  `;
  modal.style.display = 'flex';
}

function render() {
  const state = session.getState();
  const stats = session.getDerivedStats();

  // Telemetry Header
  const cycleFreq = (1000 / stats.effectiveCycleDurationMs).toFixed(2);
  document.getElementById('telemetry-cycle-freq').textContent = `${cycleFreq} /s`;
  document.getElementById('telemetry-tick-yield').textContent = stats.tickYieldPerCycle.format();
  document.getElementById('telemetry-eff-ticks').textContent = `${stats.effectiveTicksPerSec.toFixed(2)} /s`;
  document.getElementById('telemetry-total-ticks').textContent = state.totalTicks.format();
  document.getElementById('telemetry-total-cycles').textContent = state.totalCycles.format();

  // Layer 0 Currency
  const layer0 = state.layers.layer0;
  document.getElementById('layer0-currency').textContent = layer0.currency.format();
  document.getElementById('layer0-run-total').textContent = layer0.runTotalCurrency.format();

  const netOutputPerTick = stats.layerProductionPerTick.layer0 || new BigNum(0);
  const netOutputPerSec = netOutputPerTick.mul(stats.effectiveTicksPerSec);
  document.getElementById('layer0-output-sec').textContent = `${netOutputPerSec.format()} E/s`;

  // Update Layer 0 Generators
  for (const gen of defaultGameConfig.layers[0].generators) {
    const ui = generatorUI.layer0?.[gen.id];
    if (!ui) continue;

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

    const owned = layer0.generators[gen.id].owned;
    const rate = stats.generatorOutputs.layer0[gen.id];
    const cost1 = stats.generatorCosts.layer0[gen.id];
    const maxInfo = stats.maxAffordable.layer0[gen.id];
    const canAfford1 = layer0.currency.gte(cost1);

    ui.ownedBadge.textContent = `Owned: ${owned.format()}`;
    ui.outputMeta.innerHTML = `Output: <strong>${rate.format()}</strong> E/tick | <strong>${rate.mul(stats.effectiveTicksPerSec).format()}</strong> E/s`;

    ui.buy1Btn.textContent = `Buy 1 (${cost1.format()} E)`;
    ui.buy1Btn.disabled = !canAfford1;
    ui.buy1Btn.className = `btn ${canAfford1 ? 'primary' : 'disabled'}`;

    ui.buyMaxBtn.textContent = `Buy Max (${maxInfo.count})`;
    ui.buyMaxBtn.disabled = maxInfo.count <= 0;
    ui.buyMaxBtn.className = `btn ${maxInfo.count > 0 ? 'secondary' : 'disabled'}`;
  }

  // Update Layer 0 Upgrades
  for (const upg of defaultGameConfig.layers[0].upgrades) {
    const ui = upgradeUI.layer0?.[upg.id];
    if (!ui) continue;

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
      ui.btn.className = 'btn disabled';
    } else {
      ui.btn.textContent = `Upgrade (${cost.format()} E)`;
      ui.btn.disabled = !canAfford;
      ui.btn.className = `btn ${canAfford ? 'primary' : 'disabled'}`;
    }
  }

  // Layer 1 Prestige
  const layer1 = state.layers.layer1;
  const prestigeReward = stats.prestigeRewards.layer1;
  const canPrestige = prestigeReward.gte(1);
  const passiveMult = stats.layerMultipliers.layer0;

  document.getElementById('layer1-currency').textContent = layer1.currency.format();
  document.getElementById('layer1-passive-mult').textContent = `${passiveMult.toNumber().toFixed(2)}x`;
  document.getElementById('layer1-pending').textContent = prestigeReward.format();

  const prestigeBtn = document.getElementById('btn-prestige');
  prestigeBtn.disabled = !canPrestige;
  prestigeBtn.className = `btn ${canPrestige ? 'danger' : 'disabled'}`;
  prestigeBtn.textContent = canPrestige ? `Prestige for +${prestigeReward.format()} Cores` : `Need 1.00M Run Energy`;

  // Update Layer 1 Upgrades
  for (const upg of defaultGameConfig.layers[1].upgrades) {
    const ui = upgradeUI.layer1?.[upg.id];
    if (!ui) continue;

    const level = layer1.upgrades[upg.id]?.level || 0;
    const isMax = level >= (upg.maxLevel || Infinity);
    const cost = stats.upgradeCosts.layer1[upg.id];
    const canAfford = cost && layer1.currency.gte(cost);

    ui.card.className = `card ${isMax ? 'maxed' : ''}`;
    ui.lvlBadge.textContent = isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`;

    if (isMax) {
      ui.btn.textContent = 'Maxed';
      ui.btn.disabled = true;
      ui.btn.className = 'btn disabled';
    } else {
      ui.btn.textContent = `Upgrade (${cost.format()} Cores)`;
      ui.btn.disabled = !canAfford;
      ui.btn.className = `btn ${canAfford ? 'primary' : 'disabled'}`;
    }
  }
}

function setupEventListeners() {
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
    const result = simulator.run(current, policy, {
      stopCondition: st => st.layers.layer0.runTotalCurrency.gte(1e6),
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
    if (confirm('Are you sure you want to hard reset all progress?')) {
      session.hardReset();
      render();
    }
  });

  document.getElementById('btn-close-offline-modal')?.addEventListener('click', () => {
    document.getElementById('offline-modal').style.display = 'none';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
