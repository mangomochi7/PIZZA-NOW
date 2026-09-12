# Pizza Placement Lab

A top-down crowd simulation. Click the floor to place the pizza table, run a
trial, and compare how quickly a large "club-member" crowd converges on it
from different placements.

Open `index.html` directly in a browser — no build step or server required.

## How it works

- **The room** is an auditorium: a front floor (where leaders cluster and the
  table can sit), seating rows behind it, and vertical aisles cutting through
  everything. Nodes can only move *horizontally* while on a row or the front
  floor, and only *vertically* while in an aisle — mirroring how you'd
  actually cross a real auditorium.
- **Club-members** spawn scattered across the seating rows and each path to
  the pizza: walk to the nearest aisle, travel the aisle to the target's row,
  then walk across to the table.
- **Club-leaders** are stationary and clustered near the front, acting as
  fixed points in the room.
- Nodes slow down in crowded areas, push apart from each other to keep some
  personal space, and occasionally pause at random (hesitation), so the
  crowd doesn't move in perfect lockstep.
- Every trial is scored by **time until the last node arrives**, but every
  other metric in `js/scoring.js` is computed too — switch the "sort by"
  dropdown to compare placements by average arrival time or total distance
  walked instead.

## File map

```
index.html          page structure
css/style.css        visual theme
js/config.js          every tunable number (room size, speeds, crowd behavior)
js/room.js            builds the floor plan, classifies any point into a zone
js/entities.js         creates leaders, club-members, and the table
js/personalities.js    decides each node's target and path — the behavior hook
js/scoring.js          efficiency metrics — the "how do we rate a trial" hook
js/simulation.js       per-frame movement, crowding, trial lifecycle
js/render.js           canvas drawing only
js/ui.js               DOM wiring and the animation loop
```

## Extending it

A few things were deliberately left as open hooks based on where this
project is headed:

- **More than one pizza at once.** `sim.targets` is already an array, and
  `Personalities.nearestTarget()` already picks the closest of however many
  targets exist. To support placing several tables, you mainly need UI for
  adding more click-placed points — the path-planning and scoring code
  underneath don't need to change.

- **Node personalities (cutters, quitters, etc.).** `js/personalities.js` is
  a registry: `PizzaSim.Personalities.seeker` is the only behavior today
  (always head for the nearest pizza). To add another kind of node, write a
  new function with the same signature — `(node, sim) => path` — add it to
  the registry, and set some nodes' `personality` field to that key in
  `entities.js`. A placeholder `exit` point is already defined in
  `config.js` for a future "quitter" that heads for the door instead of the
  pizza.

- **Smarter target choice.** Right now "nearest" means straight-line
  distance (`Personalities.nearestTarget`). If a node should sometimes
  prefer a farther pizza to avoid a crowded one, that's the function to
  change — it already has access to the full simulation state.

- **Editable room layout.** The room is entirely data-driven
  (`Config.room` in `config.js`), and `room.js` builds the floor plan from
  that data alone. A future in-app room editor would just need to write to
  that same config shape and call `PizzaSim.Room` again to rebuild.

- **Other efficiency metrics.** Add a new entry to
  `PizzaSim.ScoringStrategies` in `scoring.js` (a `label`, a `unit`, and a
  `compute(members, timeoutSeconds)` function) and it shows up in the "sort
  by" dropdown automatically.

## Known simplifications (v1)

- "Nearest pizza" uses straight-line distance, not actual path length
  through the aisles.
- The table can be clicked into place anywhere, including close to a
  leader cluster — there's no collision check between the table and
  leaders yet.
- Crowd separation is a simple push-apart force, not full collision
  physics — nodes can still overlap briefly in tight crowds.
