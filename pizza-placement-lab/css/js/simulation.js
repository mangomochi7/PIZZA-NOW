// simulation.js — the trial lifecycle (setup -> running -> finished) and the
// per-frame physics: movement along a node's path, crowd slowdown, personal
// space, and hesitation pauses.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Simulation = (function (Config, Room, Entities, Personalities, ScoringStrategies) {

  function create() {
    return {
      state: 'setup',       // 'setup' | 'running' | 'finished'
      leaders: Entities.makeLeaders(),
      members: [],
      targets: [],           // pizza locations; only one is used today, but
                              // this stays an array so multi-pizza trials
                              // (a planned feature) don't need a data model change
      elapsed: 0,
      speedMultiplier: 1,
      trialCount: 0,
      trials: []
    };
  }

  function setTable(sim, x, y) {
    const clamped = Room.clampToRoom(x, y);
    sim.targets = [ Entities.makeTable(clamped.x, clamped.y) ];
  }

  function startTrial(sim, memberCount) {
    if (sim.targets.length === 0) return false;
    sim.members = Entities.makeMembers(memberCount);
    sim.elapsed = 0;
    sim.state = 'running';
    return true;
  }

  function step(sim, dtRaw) {
    if (sim.state !== 'running') return;
    const dt = dtRaw * sim.speedMultiplier;
    sim.elapsed += dt;

    for (const m of sim.members) {
      updateMember(m, dt, sim);
    }

    const allArrived = sim.members.every(m => m.state === 'arrived');
    const timedOut = sim.elapsed >= Config.trial.timeoutSeconds;

    if (allArrived || timedOut) {
      finishTrial(sim, timedOut);
    }
  }

  function finishTrial(sim, timedOut) {
    sim.state = 'finished';
    sim.trialCount += 1;

    const timeout = Config.trial.timeoutSeconds;
    const metrics = {};
    for (const key in ScoringStrategies) {
      metrics[key] = ScoringStrategies[key].compute(sim.members, timeout);
    }

    sim.trials.unshift({
      trial: sim.trialCount,
      table: { x: sim.targets[0].x, y: sim.targets[0].y },
      memberCount: sim.members.length,
      metrics,
      timedOut
    });
  }

  function updateMember(node, dt, sim) {
    if (node.state === 'arrived') return;

    if (node.pauseRemaining > 0) {
      node.pauseRemaining -= dt;
      node.state = 'paused';
      return;
    }

    // Random hesitation: a node occasionally stops for a moment, independent
    // of how crowded it is.
    const cfgM = Config.members;
    if (Math.random() < cfgM.pauseChancePerSecond * dt) {
      const [minP, maxP] = cfgM.pauseDurationRange;
      node.pauseRemaining = minP + Math.random() * (maxP - minP);
      node.state = 'paused';
      return;
    }

    node.state = 'moving';

    if (node.path.length === 0) {
      node.path = Personalities[node.personality](node, sim);
    }

    const wp = node.path[0];
    const dx = wp.x - node.x;
    const dy = wp.y - node.y;
    const dist = Math.hypot(dx, dy);

    const { speedFactor, pushX, pushY } = crowdAndSeparation(node, sim);
    const step = node.speed * speedFactor * dt;

    if (dist <= step || dist < 0.5) {
      node.distanceTraveled += dist;
      node.x = wp.x;
      node.y = wp.y;
      node.path.shift();
      if (node.path.length === 0) {
        // Check whether we've actually reached a target, not just an
        // intermediate waypoint (e.g. an aisle turn).
        const arrived = sim.targets.some(t =>
          Math.hypot(t.x - node.x, t.y - node.y) <= cfgM.arrivalRadius
        );
        if (arrived) {
          node.state = 'arrived';
          node.arrivalTime = sim.elapsed;
        }
      }
    } else {
      const nx = node.x + (dx / dist) * step + pushX;
      const ny = node.y + (dy / dist) * step + pushY;
      node.distanceTraveled += Math.hypot(nx - node.x, ny - node.y);
      node.x = nx;
      node.y = ny;
    }
  }

  // Crowd slowdown + personal-space separation. O(n) per node (O(n^2) per
  // frame overall) — comfortably fast up to a few hundred nodes. If the
  // crowd size grows much larger than that, this is the place to add a
  // spatial grid so each node only checks nearby cells.
  function crowdAndSeparation(node, sim) {
    const cfgM = Config.members;
    let neighborCount = 0;
    let pushX = 0, pushY = 0;

    for (const other of sim.members) {
      if (other === node || other.state === 'arrived') continue;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const d = Math.hypot(dx, dy) || 0.0001;

      if (d < cfgM.crowdSensingRadius) neighborCount++;

      if (d < cfgM.personalSpace) {
        const overlap = (cfgM.personalSpace - d) / cfgM.personalSpace;
        pushX += (dx / d) * overlap * 1.2;
        pushY += (dy / d) * overlap * 1.2;
      }
    }

    const speedFactor = Math.max(
      cfgM.minSpeedFactor,
      1 / (1 + cfgM.crowdSlowdownFactor * neighborCount)
    );

    return { speedFactor, pushX, pushY };
  }

  return { create, setTable, startTrial, step };
})(PizzaSim.Config, PizzaSim.Room, PizzaSim.Entities, PizzaSim.Personalities, PizzaSim.ScoringStrategies);
