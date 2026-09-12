// personalities.js — this is the extension point for node behavior.
//
// Each personality is a function: (node, sim) -> path (array of {x,y}
// waypoints). The simulation only ever calls
//   PizzaSim.Personalities[node.personality](node, sim)
// so adding a new kind of node is just adding a new key here and pointing
// some nodes' `personality` field at it — nothing in simulation.js has to
// change.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Personalities = (function (Room) {

  // Builds a path that respects the room's rule: move horizontally while on
  // a row or the front floor, move vertically while in an aisle.
  function planPath(node, target) {
    const start = Room.classify(node.x, node.y);
    const end = Room.classify(target.x, target.y);

    const sameBand =
      start.type !== 'aisle' &&
      end.type !== 'aisle' &&
      start.id === end.id;

    if (sameBand) {
      return [
        { x: target.x, y: node.y },   // walk along the row to the target's column
        { x: target.x, y: target.y }  // step across to the table itself
      ];
    }

    const aisle = Room.nearestAisle(node.x);
    return [
      { x: aisle.centerX, y: node.y },     // walk to the nearest aisle
      { x: aisle.centerX, y: target.y },   // travel the aisle to the target's row
      { x: target.x, y: target.y }         // walk across to the table
    ];
  }

  function nearestTarget(node, targets) {
    let best = targets[0];
    let bestDist = Infinity;
    for (const t of targets) {
      // Straight-line distance for now. Swap this for a path-length estimate
      // (e.g. via the aisle it would use) if "nearest" should account for
      // the room's layout rather than raw distance.
      const d = Math.hypot(t.x - node.x, t.y - node.y);
      if (d < bestDist) { bestDist = d; best = t; }
    }
    return best;
  }

  // Default behavior: always head for the nearest pizza.
  function seeker(node, sim) {
    const target = nearestTarget(node, sim.targets);
    return planPath(node, target);
  }

  // --- Extension points for later --------------------------------------
  // A "cutter" would use the same planPath() logic, but when queued behind
  // other nodes near the table, bias toward the front of that queue instead
  // of waiting its turn.
  //
  // function cutter(node, sim) { ... }
  //
  // A "quitter" would ignore sim.targets after some patience threshold and
  // instead call planPath(node, Config.room.exit) to head for the door.
  //
  // function quitter(node, sim) { ... }
  //
  // Register either by adding it below and setting some nodes'
  // `personality` field to the matching key.

  return { seeker, planPath, nearestTarget };
})(PizzaSim.Room);
