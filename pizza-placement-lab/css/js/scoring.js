// scoring.js — the extension point for "efficiency." Every strategy here
// runs on every finished trial, so switching the headline metric or adding
// a new one never requires re-running anything.
window.PizzaSim = window.PizzaSim || {};

PizzaSim.ScoringStrategies = {
  lastArrival: {
    label: 'Time until last arrival',
    unit: 's',
    compute(members, timeoutSeconds) {
      const times = members.map(m => m.arrivalTime ?? timeoutSeconds);
      return Math.max(...times);
    }
  },
  avgTime: {
    label: 'Average arrival time',
    unit: 's',
    compute(members, timeoutSeconds) {
      const times = members.map(m => m.arrivalTime ?? timeoutSeconds);
      return times.reduce((a, b) => a + b, 0) / times.length;
    }
  },
  totalDistance: {
    label: 'Total distance traveled',
    unit: 'px',
    compute(members) {
      return members.reduce((sum, m) => sum + m.distanceTraveled, 0);
    }
  }

  // Add another key here (e.g. `medianTime`, `fairness`) and it appears in
  // the "sort by" dropdown automatically — see ui.js.
};
