// ui.js — connects the DOM (controls, canvas, trial log) to the simulation
// and drives the requestAnimationFrame loop. This is the only file that
// touches document/window directly.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.UI = (function (Config, Room, Simulation, ScoringStrategies, Render) {
  let sim, canvas, ctx;
  let lastTs = null;
  let activeMetric = 'lastArrival';

  function init() {
    canvas = document.getElementById('room-canvas');
    canvas.width = Config.canvas.width;
    canvas.height = Config.canvas.height;
    ctx = canvas.getContext('2d');

    sim = Simulation.create();

    setupControls();
    populateMetricOptions();
    updateStatus('Click the floor to place the pizza table.');
    requestAnimationFrame(loop);
  }

  function setupControls() {
    canvas.addEventListener('click', onCanvasClick);

    const countInput = document.getElementById('member-count');
    countInput.min = Config.members.minCount;
    countInput.max = Config.members.maxCount;
    countInput.value = Config.members.defaultCount;
    document.getElementById('member-count-value').textContent = countInput.value;
    countInput.addEventListener('input', () => {
      document.getElementById('member-count-value').textContent = countInput.value;
    });

    document.getElementById('start-btn').addEventListener('click', onStart);
    document.getElementById('reset-btn').addEventListener('click', onReset);

    document.querySelectorAll('input[name="speed"]').forEach(radio => {
      radio.addEventListener('change', e => {
        sim.speedMultiplier = parseFloat(e.target.value);
      });
    });

    document.getElementById('metric-select').addEventListener('change', e => {
      activeMetric = e.target.value;
      renderTrialLog();
    });
  }

  function populateMetricOptions() {
    const select = document.getElementById('metric-select');
    Object.entries(ScoringStrategies).forEach(([key, strat]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = strat.label;
      select.appendChild(opt);
    });
    select.value = activeMetric;
  }

  function onCanvasClick(e) {
    if (sim.state === 'running') return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    Simulation.setTable(sim, x, y);
    sim.state = 'setup';
    updateStatus('Pizza placed. Start the trial when ready.');
  }

  function onStart() {
    const count = parseInt(document.getElementById('member-count').value, 10);
    const ok = Simulation.startTrial(sim, count);
    updateStatus(ok ? 'Trial running…' : 'Place the pizza on the floor first.');
  }

  function onReset() {
    sim.members = [];
    sim.state = 'setup';
    updateStatus('Click the floor to place the pizza table.');
  }

  function updateStatus(text) {
    document.getElementById('status-text').textContent = text;
  }

  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    Simulation.step(sim, dt);
    Render.draw(ctx, sim);
    updateHud();

    if (sim.state === 'finished') {
      renderTrialLog();
      updateStatus(sim.trials[0].timedOut
        ? 'Trial timed out before everyone arrived.'
        : 'Trial complete. Place a new pizza location to compare.');
      sim.state = 'setup';
    }

    requestAnimationFrame(loop);
  }

  function updateHud() {
    document.getElementById('elapsed-time').textContent = sim.elapsed.toFixed(1) + 's';
    const arrived = sim.members.filter(m => m.state === 'arrived').length;
    document.getElementById('arrived-count').textContent = `${arrived} / ${sim.members.length}`;
  }

  function renderTrialLog() {
    const tbody = document.getElementById('trial-log-body');
    tbody.innerHTML = '';
    sim.trials.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.trial}</td>
        <td>(${Math.round(t.table.x)}, ${Math.round(t.table.y)})</td>
        <td>${t.metrics[activeMetric].toFixed(1)}${ScoringStrategies[activeMetric].unit}</td>
        <td>${t.timedOut ? 'timeout' : 'complete'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  return { init };
})(PizzaSim.Config, PizzaSim.Room, PizzaSim.Simulation, PizzaSim.ScoringStrategies, PizzaSim.Render);
