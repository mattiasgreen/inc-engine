// src/ui/app.js
// Interactive Game UI & Simulation Sandbox Controller

import { defaultGameConfig } from '../engine/config.js';
import { GameSession } from '../session/session.js';
import { Simulator } from '../engine/simulator.js';
import { OptimalRoiPolicy, GreedyPolicy } from '../engine/policies.js';
import { BigNum } from '../engine/bignum.js';

let session;
let simulator;

function init() {
  session = new GameSession({ config: defaultGameConfig });
  simulator = new Simulator(defaultGameConfig);

  // Check for offline progress
  const offlineReport = session.load();
  if (offlineReport && offlineReport.elapsedMs > 5000) {
    showOfflineModal(offlineReport);
  }

  // Setup loop
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

  // Calculate net output per sec in Layer 0
  let netOutputPerTick = new BigNum(0);
  for (const gen of defaultGameConfig.layers[0].generators) {
    const owned = layer0.generators[gen.id].owned;
    if (owned.gt(0)) {
      netOutputPerTick = netOutputPerTick.add(owned.mul(stats.generatorOutputs.layer0[gen.id]));
    }
  }
  const netOutputPerSec = netOutputPerTick.mul(stats.effectiveTicksPerSec);
  document.getElementById('layer0-output-sec').textContent = `${netOutputPerSec.format()} E/s`;

  // Render Generators
  const genContainer = document.getElementById('layer0-generators');
  genContainer.innerHTML = defaultGameConfig.layers[0].generators.map(gen => {
    const isUnlocked = !gen.unlockThreshold || layer0.runTotalCurrency.gte(gen.unlockThreshold);
    if (!isUnlocked) {
      return `
        <div class="card locked">
          <h3>${gen.name} (Locked)</h3>
          <p>Unlocks at ${BigNum.from(gen.unlockThreshold).format()} total Energy</p>
        </div>
      `;
    }

    const owned = layer0.generators[gen.id].owned;
    const rate = stats.generatorOutputs.layer0[gen.id];
    const cost1 = stats.generatorCosts.layer0[gen.id];
    const maxInfo = stats.maxAffordable.layer0[gen.id];
    const canAfford1 = layer0.currency.gte(cost1);

    return `
      <div class="card">
        <div class="card-header">
          <h3>${gen.name}</h3>
          <span class="badge">Owned: ${owned.format()}</span>
        </div>
        <p class="meta">Output: <strong>${rate.format()}</strong> E/tick | <strong>${rate.mul(stats.effectiveTicksPerSec).format()}</strong> E/s</p>
        <div class="actions">
          <button class="btn ${canAfford1 ? 'primary' : 'disabled'}" data-action="buyGen" data-layer="layer0" data-id="${gen.id}" data-count="1" ${canAfford1 ? '' : 'disabled'}>
            Buy 1 (${cost1.format()} E)
          </button>
          <button class="btn ${maxInfo.count > 0 ? 'secondary' : 'disabled'}" data-action="buyGen" data-layer="layer0" data-id="${gen.id}" data-count="max" ${maxInfo.count > 0 ? '' : 'disabled'}>
            Buy Max (${maxInfo.count})
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Render Layer 0 Upgrades
  const upgContainer = document.getElementById('layer0-upgrades');
  upgContainer.innerHTML = defaultGameConfig.layers[0].upgrades.map(upg => {
    const level = layer0.upgrades[upg.id]?.level || 0;
    const isMax = level >= (upg.maxLevel || Infinity);
    const cost = stats.upgradeCosts.layer0[upg.id];
    const canAfford = cost && layer0.currency.gte(cost);

    return `
      <div class="card ${isMax ? 'maxed' : ''}">
        <div class="card-header">
          <h4>${upg.name}</h4>
          <span class="badge">${isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`}</span>
        </div>
        <p class="desc">${upg.description}</p>
        <div class="actions">
          ${isMax ? '<button class="btn disabled" disabled>Maxed</button>' : `
            <button class="btn ${canAfford ? 'primary' : 'disabled'}" data-action="buyUpg" data-layer="layer0" data-id="${upg.id}" ${canAfford ? '' : 'disabled'}>
              Upgrade (${cost.format()} E)
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

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

  // Render Layer 1 Upgrades
  const l1UpgContainer = document.getElementById('layer1-upgrades');
  l1UpgContainer.innerHTML = defaultGameConfig.layers[1].upgrades.map(upg => {
    const level = layer1.upgrades[upg.id]?.level || 0;
    const isMax = level >= (upg.maxLevel || Infinity);
    const cost = stats.upgradeCosts.layer1[upg.id];
    const canAfford = cost && layer1.currency.gte(cost);

    return `
      <div class="card ${isMax ? 'maxed' : ''}">
        <div class="card-header">
          <h4>${upg.name}</h4>
          <span class="badge">${isMax ? 'MAX' : `Lvl ${level}/${upg.maxLevel}`}</span>
        </div>
        <p class="desc">${upg.description}</p>
        <div class="actions">
          ${isMax ? '<button class="btn disabled" disabled>Maxed</button>' : `
            <button class="btn ${canAfford ? 'primary' : 'disabled'}" data-action="buyUpg" data-layer="layer1" data-id="${upg.id}" ${canAfford ? '' : 'disabled'}>
              Upgrade (${cost.format()} Cores)
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    if (action === 'buyGen') {
      const { layer, id, count } = target.dataset;
      session.buyGenerator(layer, id, count === 'max' ? 'max' : parseInt(count, 10));
      render();
    } else if (action === 'buyUpg') {
      const { layer, id } = target.dataset;
      session.buyUpgrade(layer, id);
      render();
    }
  });

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
    // Simulate until next prestige or max 15 minutes
    const result = simulator.run(current, policy, {
      stopCondition: st => st.layers.layer0.runTotalCurrency.gte(1e6),
      maxSimulatedMs: 15 * 60 * 1000
    });
    session.state = result.state;
    session.lastTickAtMs = Date.now();
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

window.addEventListener('DOMContentLoaded', init);
