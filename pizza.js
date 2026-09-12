// ============================================================
// CONFIG
// ============================================================
const CANVAS_W = 900;
const CANVAS_H = 700;
const WALL = 12;

const ROOM = { x: WALL, y: WALL, w: CANVAS_W - WALL * 2, h: CANVAS_H - WALL * 2 };

const STAGE_H = 130;
const STAGE = { x: ROOM.x, y: ROOM.y, w: ROOM.w, h: STAGE_H };

const SEAT_AREA = {
  x: ROOM.x,
  y: ROOM.y + STAGE_H + 16,
  w: ROOM.w,
  h: ROOM.h - STAGE_H - 32
};

const AISLE_W = 60;

const SEAT_ROWS = 8;
const SEATS_PER_BLOCK = 6;
const SEAT_SIZE = 9;
const SEAT_SPACING_X = 30;
const SEAT_SPACING_Y = 44;

const PERSON_RADIUS = 7;
const WALK_SPEED = 1.6;
const SERVICE_TIME = 0.5;       // <-- 0.5 seconds at the triangle
const QUEUE_SPACING = 16;

const PHASE = {
  SEATED: 'seated',
  EXITING_ROW: 'exit_row',
  IN_AISLE: 'in_aisle',
  QUEUING: 'queuing',
  APPROACHING: 'approaching',   // head of the line, walking onto the triangle
  AT_TARGET: 'at_target',
  TO_EXIT: 'to_exit',
  EXITED: 'exited'
};

// Globals
let blocks = [];
let seats = [];
let people = [];
let exits = [];
let target = { x: 0, y: 0, r: 18 };
let dragging = false;

let queue = [];              // ordered list of people waiting (NOT including head)
let servingPerson = null;
let serveStart = 0;

let simState = 'idle';
let simStartMs = 0;
let elapsed = 0;
let crowdSize = 40;

// ============================================================
// SETUP
// ============================================================
function setup() {
  const c = createCanvas(CANVAS_W, CANVAS_H);
  c.parent('canvas-holder');

  buildLayout();
  buildSeats();
  buildExits();

  target.x = CANVAS_W / 2;
  target.y = STAGE.y + STAGE.h / 2;

  spawnCrowd(crowdSize);
  wireUI();
  updateStatus('Ready');
}

// ============================================================
// LAYOUT
// ============================================================
function buildLayout() {
  const totalW = SEAT_AREA.w;
  const blockW = (totalW - AISLE_W * 2) / 3;
  blocks = [
    { x: SEAT_AREA.x, w: blockW },
    { x: SEAT_AREA.x + blockW + AISLE_W, w: blockW },
    { x: SEAT_AREA.x + (blockW + AISLE_W) * 2, w: blockW }
  ];
}

function buildSeats() {
  seats = [];
  const rowGap = (SEAT_AREA.h - 40) / (SEAT_ROWS - 1);

  for (let b = 0; b < 3; b++) {
    const blockCenterX = blocks[b].x + blocks[b].w / 2;
    const totalSeatWidth = (SEATS_PER_BLOCK - 1) * SEAT_SPACING_X;
    const startX = blockCenterX - totalSeatWidth / 2;

    for (let r = 0; r < SEAT_ROWS; r++) {
      const y = SEAT_AREA.y + 20 + r * rowGap;
      for (let c = 0; c < SEATS_PER_BLOCK; c++) {
        const x = startX + c * SEAT_SPACING_X;
        seats.push({ x, y, row: r, block: b, occupant: null });
      }
    }
  }
}

function buildExits() {
  const exitW = 40;
  const exitH = 34;
  exits = [
    { x: ROOM.x + 24,                  y: STAGE.y + STAGE.h - exitH - 12, w: exitW, h: exitH },
    { x: ROOM.x + ROOM.w - 24 - exitW, y: STAGE.y + STAGE.h - exitH - 12, w: exitW, h: exitH }
  ];
}

// ============================================================
// SPAWN
// ============================================================
function spawnCrowd(n) {
  people = [];
  queue = [];
  servingPerson = null;

  for (const s of seats) s.occupant = null;

  const shuffled = seats.slice().sort(() => Math.random() - 0.5);
  const count = Math.min(n, shuffled.length);

  for (let i = 0; i < count; i++) {
    const seat = shuffled[i];
    const p = {
      id: i,
      x: seat.x,
      y: seat.y,
      r: PERSON_RADIUS,
      seat: seat,
      phase: PHASE.SEATED,
      speed: WALK_SPEED,
      serveProgress: 0,
      queueIndex: -1,
      aisleTargetX: 0,
      exitGoal: null
    };
    seat.occupant = p;
    people.push(p);
  }
}

// ============================================================
// DRAW
// ============================================================
function draw() {
  background(12, 14, 18);

  drawRoom();
  drawStage();
  drawAisles();
  drawSeats();
  drawExits();
  drawTarget();

  updateSimulation();
  drawPeople();
}

function drawRoom() {
  noStroke();
  fill(28, 32, 40);
  rect(ROOM.x, ROOM.y, ROOM.w, ROOM.h, 8);
}

function drawStage() {
  noStroke();
  fill(40, 46, 56);
  rect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

  fill(80, 90, 105);
  textAlign(LEFT, TOP);
  textSize(11);
  text('FRONT STAGE', STAGE.x + 12, STAGE.y + 8);
}

function drawAisles() {
  noStroke();
  fill(22, 26, 32);
  const blockW = blocks[0].w;

  rect(SEAT_AREA.x + blockW, SEAT_AREA.y, AISLE_W, SEAT_AREA.h, 4);
  rect(SEAT_AREA.x + (blockW + AISLE_W) * 2 - AISLE_W, SEAT_AREA.y, AISLE_W, SEAT_AREA.h, 4);

  fill(60, 70, 85);
  textAlign(CENTER, CENTER);
  textSize(10);
  push();
  translate(SEAT_AREA.x + blockW + AISLE_W / 2, SEAT_AREA.y + SEAT_AREA.h / 2);
  rotate(-HALF_PI);
  text('AISLE', 0, 0);
  pop();
  push();
  translate(SEAT_AREA.x + (blockW + AISLE_W) * 2 - AISLE_W / 2, SEAT_AREA.y + SEAT_AREA.h / 2);
  rotate(-HALF_PI);
  text('AISLE', 0, 0);
  pop();
}

function drawSeats() {
  noStroke();
  fill(52, 58, 70);
  for (const s of seats) {
    rect(s.x - SEAT_SIZE / 2, s.y - SEAT_SIZE / 2, SEAT_SIZE, SEAT_SIZE, 2);
  }
}

function drawExits() {
  noStroke();
  for (const e of exits) {
    fill(60, 140, 90);
    rect(e.x, e.y, e.w, e.h, 4);
    fill(180, 240, 200);
    textAlign(CENTER, CENTER);
    textSize(9);
    text('EXIT', e.x + e.w / 2, e.y + e.h / 2);
  }
}

function drawTarget() {
  push();
  translate(target.x, target.y);

  noStroke();
  fill(255, 210, 60, 50);
  circle(0, 0, target.r * 3.2);

  fill(255, 210, 60);
  stroke(255, 160, 0);
  strokeWeight(2);
  triangle(
    0, -target.r,
    -target.r * 0.9, target.r * 0.8,
     target.r * 0.9, target.r * 0.8
  );
  noStroke();
  fill(120, 70, 0);
  textAlign(CENTER, CENTER);
  textSize(10);
  text('★', 0, 2);
  pop();
}

function drawPeople() {
  noStroke();
  for (const p of people) {
    if (p.phase === PHASE.EXITED) continue;

    if (p.phase === PHASE.AT_TARGET || p.phase === PHASE.TO_EXIT) {
      fill(120, 230, 130);
    } else if (p.phase === PHASE.APPROACHING) {
      fill(255, 220, 120);
    } else if (p.phase === PHASE.QUEUING) {
      fill(230, 190, 90);
    } else {
      fill(230, 90, 90);
    }

    circle(p.x, p.y, p.r * 2);

    if (p.phase === PHASE.AT_TARGET) {
      noFill();
      stroke(255, 255, 255, 200);
      strokeWeight(2);
      arc(p.x, p.y, p.r * 2 + 5, p.r * 2 + 5,
          -HALF_PI, -HALF_PI + TWO_PI * (1 - p.serveProgress));
      noStroke();
    }
  }
}

// ============================================================
// SIMULATION
// ============================================================
function updateSimulation() {
  if (simState === 'idle') {
    for (const p of people) {
      if (p.seat) { p.x = p.seat.x; p.y = p.seat.y; }
    }
    return;
  }
  if (simState !== 'running') return;

  elapsed = (millis() - simStartMs) / 1000;
  document.getElementById('timeDisplay').textContent = elapsed.toFixed(2);

  updateServing();
  reindexQueue();

  for (const p of people) stepPerson(p);
  resolveOverlaps();

  if (people.length > 0 && people.every(p => p.phase === PHASE.EXITED)) {
    simState = 'done';
    updateStatus(`Done — ${elapsed.toFixed(2)}s`);
  }
}

// Keep queue indices sequential. Called every frame.
function reindexQueue() {
  queue = queue.filter(p => p.phase === PHASE.QUEUING);
  for (let i = 0; i < queue.length; i++) {
    queue[i].queueIndex = i;
  }
}

// ============================================================
// SERVING
// ============================================================
function updateServing() {
  // --- Case A: someone is currently being served ---
  if (servingPerson) {
    servingPerson.serveProgress = (millis() / 1000 - serveStart) / SERVICE_TIME;
    servingPerson.x = target.x;
    servingPerson.y = target.y;

    if (servingPerson.serveProgress >= 1) {
      // Service done: hand off to exit
      const exit = pickExit(servingPerson);
      servingPerson.phase = PHASE.TO_EXIT;
      servingPerson.exitGoal = exit;
      servingPerson.queueIndex = -1;
      servingPerson.serveProgress = 0;

      // Nudge them off the triangle so they don't collide with it next frame
      const dx = exit.x - target.x;
      const dy = exit.y - target.y;
      const d = Math.hypot(dx, dy) || 1;
      servingPerson.x = target.x + (dx / d) * (target.r + servingPerson.r + 2);
      servingPerson.y = target.y + (dy / d) * (target.r + servingPerson.r + 2);

      servingPerson = null;
    }
    return;
  }

  // --- Case B: promote the next person ---
  // Priority 1: someone already in APPROACHING phase
  const approaching = people.find(p => p.phase === PHASE.APPROACHING);

  if (approaching) {
    // They are the current candidate. When they touch the triangle,
    // promote them to AT_TARGET.
    const d = dist(approaching.x, approaching.y, target.x, target.y);
    if (d <= target.r + approaching.r + 1) {
      approaching.phase = PHASE.AT_TARGET;
      approaching.serveProgress = 0;
      approaching.x = target.x;
      approaching.y = target.y;
      servingPerson = approaching;
      serveStart = millis() / 1000;
    }
    return;
  }

  // Priority 2: nobody is APPROACHING, so promote the front of the queue.
  if (queue.length > 0) {
    const front = queue[0];
    front.phase = PHASE.APPROACHING;
    queue.shift();
  }
}

// ============================================================
// PERSON STEP
// ============================================================
function stepPerson(p) {
  if (p.phase === PHASE.EXITED) return;
  if (p.phase === PHASE.AT_TARGET) return;

  let goal = null;

  if (p.phase === PHASE.SEATED) {
    p.phase = PHASE.EXITING_ROW;
    p.exitRowGoal = computeExitRowGoal(p);
  }

  if (p.phase === PHASE.EXITING_ROW) {
    goal = p.exitRowGoal;
    if (dist(p.x, p.y, goal.x, goal.y) < 3) {
      p.phase = PHASE.IN_AISLE;
    }
  }

  if (p.phase === PHASE.IN_AISLE) {
    const stageBottom = STAGE.y + STAGE.h;
    const yTrigger = stageBottom - 6;

    if (p.y <= yTrigger) {
      p.phase = PHASE.QUEUING;
      p.queueIndex = queue.length;
      queue.push(p);
    } else {
      goal = { x: p.aisleTargetX, y: yTrigger };
    }
  }

  if (p.phase === PHASE.QUEUING) {
    goal = queueSlot(p.queueIndex);
    if (dist(p.x, p.y, goal.x, goal.y) < 1.5) return;
  }

  // Head of line: walk straight onto the triangle, ignoring everyone.
  if (p.phase === PHASE.APPROACHING) {
    goal = { x: target.x, y: target.y };
    // Close enough? updateServing will promote next frame.
    const d = dist(p.x, p.y, goal.x, goal.y);
    if (d < 0.5) return;
  }

  if (p.phase === PHASE.TO_EXIT) {
    goal = p.exitGoal || pickExit(p);
    if (dist(p.x, p.y, goal.x, goal.y) < p.r + 2) {
      p.phase = PHASE.EXITED;
      return;
    }
  }

  if (!goal) return;

  // --- Steering ---
  let dx = goal.x - p.x;
  let dy = goal.y - p.y;
  const d = Math.hypot(dx, dy) || 1;
  dx /= d; dy /= d;

  // Phases that ignore repulsion entirely:
  //  - APPROACHING: must reach the triangle no matter what
  //  - TO_EXIT: must reach the exit no matter what
  const ignoreRepulsion =
    p.phase === PHASE.APPROACHING || p.phase === PHASE.TO_EXIT;

  if (!ignoreRepulsion) {
    for (const q of people) {
      if (q === p || q.phase === PHASE.EXITED) continue;
      // Queued people are not pushed by APPROACHING or TO_EXIT people
      if (q.phase === PHASE.APPROACHING || q.phase === PHASE.TO_EXIT) continue;

      const sx = p.x - q.x, sy = p.y - q.y;
      const sd = Math.hypot(sx, sy);
      const minD = p.r + q.r + 3;
      if (sd > 0.01 && sd < minD) {
        const push = (minD - sd) / minD;
        dx += (sx / sd) * push * 1.2;
        dy += (sy / sd) * push * 1.2;
      }
    }
  }

  const m = Math.hypot(dx, dy) || 1;
  dx /= m; dy /= m;

  let spd = p.speed;
  if (p.phase === PHASE.QUEUING) {
    const dGoal = Math.hypot(p.x - goal.x, p.y - goal.y);
    spd = Math.min(p.speed, Math.max(0.15, dGoal * 0.3));
  }

  p.x += dx * spd;
  p.y += dy * spd;

  // Only clamp people who are inside the room and not exiting.
  if (p.phase !== PHASE.TO_EXIT) {
    p.x = constrain(p.x, ROOM.x + p.r, ROOM.x + ROOM.w - p.r);
    p.y = constrain(p.y, ROOM.y + p.r, ROOM.y + ROOM.h - p.r);
  }
}

// ============================================================
// QUEUE SLOTS
// ============================================================
// Slots form a straight line pointing AWAY from the nearest exit,
// starting just behind the triangle.
function queueSlot(index) {
  const exit = pickExit(target);
  let ux = target.x - exit.x;
  let uy = target.y - exit.y;
  const d = Math.hypot(ux, uy) || 1;
  ux /= d; uy /= d;

  const offset = target.r + PERSON_RADIUS + 4 + index * QUEUE_SPACING;
  return {
    x: target.x + ux * offset,
    y: target.y + uy * offset
  };
}

// ============================================================
// EXIT PICK
// ============================================================
function pickExit(p) {
  let best = null;
  let bd = Infinity;
  for (const e of exits) {
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < bd) { bd = d; best = { x: cx, y: cy, exit: e }; }
  }
  return best;
}

// ============================================================
// ROW EXIT GOAL
// ============================================================
function computeExitRowGoal(p) {
  const blockW = blocks[0].w;
  const aisleLeftX  = SEAT_AREA.x + blockW + AISLE_W / 2;
  const aisleRightX = SEAT_AREA.x + (blockW + AISLE_W) * 2 - AISLE_W / 2;

  let aisleX;
  if (p.seat.block === 0) {
    aisleX = aisleLeftX;
  } else if (p.seat.block === 2) {
    aisleX = aisleRightX;
  } else {
    aisleX = (Math.abs(p.x - aisleLeftX) < Math.abs(p.x - aisleRightX))
      ? aisleLeftX : aisleRightX;
  }

  p.aisleTargetX = aisleX;
  return { x: aisleX, y: p.seat.y };
}

// ============================================================
// HARD NON-OVERLAP
// ============================================================
function resolveOverlaps() {
  const ITER = 4;
  for (let k = 0; k < ITER; k++) {
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const a = people[i], b = people[j];
        if (a.phase === PHASE.EXITED && b.phase === PHASE.EXITED) continue;

        // Phases that should never be pushed by the overlap resolver:
        //  - AT_TARGET: anchored on the triangle
        //  - APPROACHING: has right of way to reach the triangle
        //  - TO_EXIT: has right of way to reach the door
        const aFixed = a.phase === PHASE.AT_TARGET ||
                       a.phase === PHASE.APPROACHING ||
                       a.phase === PHASE.TO_EXIT;
        const bFixed = b.phase === PHASE.AT_TARGET ||
                       b.phase === PHASE.APPROACHING ||
                       b.phase === PHASE.TO_EXIT;

        // Two "fixed" agents can overlap freely; never tug-of-war them.
        if (aFixed && bFixed) continue;

        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const minD = a.r + b.r;

        if (d < minD) {
          if (d < 0.0001) { dx = 1; dy = 0; d = 1; }
          const overlap = (minD - d) * 0.5;
          const ux = dx / d, uy = dy / d;

          if (aFixed && !bFixed) {
            b.x += ux * overlap * 2; b.y += uy * overlap * 2;
          } else if (bFixed && !aFixed) {
            a.x -= ux * overlap * 2; a.y -= uy * overlap * 2;
          } else {
            a.x -= ux * overlap; a.y -= uy * overlap;
            b.x += ux * overlap; b.y += uy * overlap;
          }
        }
      }
    }
    // Clamp everyone still inside the room (fixed/right-of-way phases excluded).
    for (const p of people) {
      if (p.phase === PHASE.EXITED) continue;
      if (p.phase === PHASE.TO_EXIT || p.phase === PHASE.APPROACHING) continue;
      p.x = constrain(p.x, ROOM.x + p.r, ROOM.x + ROOM.w - p.r);
      p.y = constrain(p.y, ROOM.y + p.r, ROOM.y + ROOM.h - p.r);
    }
  }
}

// ============================================================
// INPUT — drag the target triangle
// ============================================================
function mousePressed() {
  if (simState !== 'idle') return;
  if (dist(mouseX, mouseY, target.x, target.y) < target.r * 1.6) {
    dragging = true;
  }
}

function mouseDragged() {
  if (!dragging) return;

  const nx = mouseX;
  const ny = mouseY;

  const inStage =
    nx > STAGE.x + target.r &&
    nx < STAGE.x + STAGE.w - target.r &&
    ny > STAGE.y + target.r &&
    ny < STAGE.y + STAGE.h - target.r;

  const blockW = blocks[0].w;
  const aisle1X = SEAT_AREA.x + blockW;
  const aisle2X = SEAT_AREA.x + (blockW + AISLE_W) * 2 - AISLE_W;

  const inAisle1 =
    nx > aisle1X + target.r && nx < aisle1X + AISLE_W - target.r &&
    ny > SEAT_AREA.y + target.r && ny < SEAT_AREA.y + SEAT_AREA.h - target.r;

  const inAisle2 =
    nx > aisle2X + target.r && nx < aisle2X + AISLE_W - target.r &&
    ny > SEAT_AREA.y + target.r && ny < SEAT_AREA.y + SEAT_AREA.h - target.r;

  if (inStage || inAisle1 || inAisle2) {
    target.x = nx;
    target.y = ny;
  }
}

function mouseReleased() {
  dragging = false;
}

// ============================================================
// UI
// ============================================================
function wireUI() {
  const slider = document.getElementById('crowdSlider');
  const valueEl = document.getElementById('crowdValue');

  slider.addEventListener('input', (e) => {
    crowdSize = parseInt(e.target.value);
    valueEl.textContent = crowdSize;
    if (simState === 'idle') {
      spawnCrowd(crowdSize);
    }
  });

  document.getElementById('startBtn').addEventListener('click', startSim);
  document.getElementById('resetBtn').addEventListener('click', resetSim);
}

function startSim() {
  if (simState === 'running') return;

  spawnCrowd(crowdSize);

  simState = 'running';
  simStartMs = millis();
  elapsed = 0;

  document.getElementById('startBtn').disabled = true;
  updateStatus('Running...');
}

function resetSim() {
  simState = 'idle';
  elapsed = 0;
  document.getElementById('timeDisplay').textContent = '0.00';
  document.getElementById('startBtn').disabled = false;
  spawnCrowd(crowdSize);
  updateStatus('Ready');
}

function updateStatus(text) {
  const el = document.getElementById('status');
  el.textContent = text;
  if (text.startsWith('Done')) el.classList.add('done');
  else el.classList.remove('done');
}