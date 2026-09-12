// config.js — every tunable number lives here. Reshape the room or tune the
// crowd's behavior by editing this file; nothing else needs to change.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Config = {
  canvas: { width: 900, height: 620 },

  room: {
    frontHeight: 140,        // px height of the front floor (stage/table area)
    numRows: 6,              // seating rows behind the front floor
    rowHeight: 80,           // px height of each row
    aisles: [                // vertical corridors that cut through every row
      { x: 300, width: 50 },
      { x: 600, width: 50 }
    ],
    // Placeholder location for a future "quitter" personality to head toward.
    // Not used by any movement logic yet.
    exit: { x: 24, y: 24 }
  },

  leaders: {
    clusterCenters: [ { x: 200, y: 70 }, { x: 700, y: 70 } ],
    perCluster: 7,
    clusterRadius: 45,
    radius: 7
  },

  members: {
    defaultCount: 150,
    minCount: 20,
    maxCount: 400,
    radius: 5,
    baseSpeed: 70,            // px per simulated second
    speedVariance: 0.2,       // +/- 20%, gives the crowd a natural mix of paces
    personalSpace: 14,        // nodes push apart if closer than this
    crowdSensingRadius: 30,   // neighbors within this radius slow a node down
    crowdSlowdownFactor: 0.15,
    minSpeedFactor: 0.25,     // never slow below 25% of base speed
    pauseChancePerSecond: 0.15,
    pauseDurationRange: [0.3, 1.2],
    arrivalRadius: 20
  },

  table: { width: 60, height: 36 },

  trial: { timeoutSeconds: 120 } // safety cutoff so a trial can't run forever
};
