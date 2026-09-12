// room.js — turns the numbers in config.js into an actual floor plan, and
// answers the one question everything else needs: "what kind of floor is at
// this point, and can I move through it horizontally or vertically?"
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Room = (function (Config) {
  const cfg = Config.room;

  const rows = [];
  for (let i = 0; i < cfg.numRows; i++) {
    const yMin = cfg.frontHeight + i * cfg.rowHeight;
    rows.push({ index: i, yMin, yMax: yMin + cfg.rowHeight });
  }

  const front = { yMin: 0, yMax: cfg.frontHeight };

  const aisles = cfg.aisles.map((a, i) => ({
    index: i,
    xMin: a.x - a.width / 2,
    xMax: a.x + a.width / 2,
    centerX: a.x
  }));

  const totalWidth = Config.canvas.width;
  const totalHeight = cfg.frontHeight + cfg.numRows * cfg.rowHeight;

  // Aisles take priority: the stairs run the full height of the room, cutting
  // through the front floor and every row behind it.
  function classify(x, y) {
    for (const a of aisles) {
      if (x >= a.xMin && x <= a.xMax) {
        return { type: 'aisle', id: a.index, band: a };
      }
    }
    if (y < front.yMax) {
      return { type: 'front', id: 'front', band: front };
    }
    for (const r of rows) {
      if (y >= r.yMin && y < r.yMax) {
        return { type: 'row', id: r.index, band: r };
      }
    }
    const last = rows[rows.length - 1];
    return { type: 'row', id: last.index, band: last };
  }

  function clampToRoom(x, y) {
    return {
      x: Math.max(4, Math.min(totalWidth - 4, x)),
      y: Math.max(4, Math.min(totalHeight - 4, y))
    };
  }

  function randomPointInRow(rowIndex, margin = 10) {
    const r = rows[rowIndex];
    return {
      x: margin + Math.random() * (totalWidth - margin * 2),
      y: r.yMin + margin + Math.random() * (cfg.rowHeight - margin * 2)
    };
  }

  function nearestAisle(x) {
    let best = aisles[0];
    let bestDist = Math.abs(x - best.centerX);
    for (const a of aisles) {
      const d = Math.abs(x - a.centerX);
      if (d < bestDist) { best = a; bestDist = d; }
    }
    return best;
  }

  return {
    rows, front, aisles, totalWidth, totalHeight,
    classify, clampToRoom, randomPointInRow, nearestAisle
  };
})(PizzaSim.Config);
