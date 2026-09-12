// entities.js — plain-object factories for everything that appears in the
// room. Nodes are simple data objects; all behavior lives in simulation.js
// and personalities.js so it stays easy to change how a node acts without
// touching what a node *is*.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Entities = (function (Config, Room) {

  function makeLeaders() {
    const leaders = [];
    const cfg = Config.leaders;
    cfg.clusterCenters.forEach((center, ci) => {
      for (let i = 0; i < cfg.perCluster; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * cfg.clusterRadius;
        leaders.push({
          x: center.x + Math.cos(angle) * dist,
          y: Math.max(10, Math.min(Config.room.frontHeight - 10, center.y + Math.sin(angle) * dist)),
          radius: cfg.radius,
          cluster: ci
        });
      }
    });
    return leaders;
  }

  function makeMember(id) {
    const rowIndex = Math.floor(Math.random() * Room.rows.length);
    const spot = Room.randomPointInRow(rowIndex);
    const cfgM = Config.members;
    const speed = cfgM.baseSpeed * (1 - cfgM.speedVariance + Math.random() * cfgM.speedVariance * 2);

    return {
      id,
      x: spot.x,
      y: spot.y,
      radius: cfgM.radius,
      speed,
      personality: 'seeker',   // which entry in PizzaSim.Personalities decides its path
      path: [],                 // queue of {x,y} waypoints toward the current target
      distanceTraveled: 0,
      arrivalTime: null,
      pauseRemaining: 0,        // seconds left in a hesitation pause
      state: 'moving'           // 'moving' | 'paused' | 'arrived'
    };
  }

  function makeMembers(count) {
    const members = [];
    for (let i = 0; i < count; i++) members.push(makeMember(i));
    return members;
  }

  function makeTable(x, y) {
    return { x, y, width: Config.table.width, height: Config.table.height };
  }

  return { makeLeaders, makeMembers, makeTable };
})(PizzaSim.Config, PizzaSim.Room);
