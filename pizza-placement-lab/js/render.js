// render.js — all canvas drawing. Nothing in here changes simulation state;
// it only reads it.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.Render = (function (Config, Room) {
  const COLORS = {
    bandA: '#12294A',
    bandB: '#0E2138',
    aisle: '#0A1A2C',
    gridLine: '#23425F',
    schematicLine: '#3FA7D6',
    leader: '#5C7086',
    member: '#BFE3F0',
    memberPaused: '#5C7086',
    memberArrived: '#2E4966',
    table: '#D8492F',
    tableBorder: '#F2A65A',
    exit: '#E3A857'
  };

  function draw(ctx, sim) {
    const { width, height } = Config.canvas;
    ctx.clearRect(0, 0, width, height);

    drawFront(ctx);
    drawRows(ctx);
    drawAisles(ctx);
    drawExit(ctx);
    drawLeaders(ctx, sim.leaders);
    if (sim.targets[0]) drawTable(ctx, sim.targets[0]);
    drawMembers(ctx, sim.members);
  }

  function drawFront(ctx) {
    ctx.fillStyle = COLORS.bandB;
    ctx.fillRect(0, 0, Config.canvas.width, Config.room.frontHeight);
  }

  function drawRows(ctx) {
    Room.rows.forEach((r, i) => {
      ctx.fillStyle = i % 2 === 0 ? COLORS.bandA : COLORS.bandB;
      ctx.fillRect(0, r.yMin, Config.canvas.width, r.yMax - r.yMin);
    });
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    Room.rows.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(0, r.yMin);
      ctx.lineTo(Config.canvas.width, r.yMin);
      ctx.stroke();
    });
  }

  function drawAisles(ctx) {
    Room.aisles.forEach(a => {
      ctx.fillStyle = COLORS.aisle;
      ctx.fillRect(a.xMin, 0, a.xMax - a.xMin, Room.totalHeight);
      ctx.strokeStyle = COLORS.schematicLine;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(a.xMin, 0); ctx.lineTo(a.xMin, Room.totalHeight);
      ctx.moveTo(a.xMax, 0); ctx.lineTo(a.xMax, Room.totalHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function drawExit(ctx) {
    const e = Config.room.exit;
    ctx.strokeStyle = COLORS.exit;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(e.x - 12, e.y);
    ctx.lineTo(e.x + 12, e.y);
    ctx.stroke();
  }

  function drawLeaders(ctx, leaders) {
    ctx.fillStyle = COLORS.leader;
    leaders.forEach(l => {
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawTable(ctx, table) {
    ctx.fillStyle = COLORS.table;
    ctx.strokeStyle = COLORS.tableBorder;
    ctx.lineWidth = 2;
    const x = table.x - table.width / 2;
    const y = table.y - table.height / 2;
    ctx.fillRect(x, y, table.width, table.height);
    ctx.strokeRect(x, y, table.width, table.height);
  }

  function drawMembers(ctx, members) {
    members.forEach(m => {
      ctx.fillStyle =
        m.state === 'arrived' ? COLORS.memberArrived :
        m.state === 'paused' ? COLORS.memberPaused :
        COLORS.member;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  return { draw, COLORS };
})(PizzaSim.Config, PizzaSim.Room);
