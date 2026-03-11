/**
 * app.js — Composition root / entry point.
 *
 * Wires the timer and UI modules together. Neither timer.js nor ui.js
 * imports the other — all orchestration lives here. This keeps both
 * modules independently testable and swappable.
 */

import * as timer from './timer.js';
import * as ui    from './ui.js';

// Passed to timer.start() as the interval callback — timer.js stays DOM-free
function onTick() {
  ui.updateDisplay(timer.getTotal());
}

function toggleStartStop() {
  if (!timer.isRunning()) {
    timer.start(onTick);
    ui.updateButtons('running');
    ui.updateStatus('running');
  } else {
    timer.pause();
    // Snapshot the display one final time so it freezes at the exact paused value,
    // not one tick behind — interval may have fired just before pause() cleared it
    ui.updateDisplay(timer.getTotal());
    ui.updateButtons('paused');
    ui.updateStatus('paused');
  }
}

function handleReset() {
  timer.reset();
  ui.resetDisplay();
  ui.updateButtons('ready');
  ui.updateStatus('ready');
}

function handleLap() {
  // recordLap returns the full updated list; pass directly to renderLaps
  const laps = timer.recordLap();
  ui.renderLaps(laps);
}

// addEventListener over inline onclick= attributes — keeps HTML free of JS,
// enables multiple listeners on the same element, and is easier to test
document.getElementById('btn-start').addEventListener('click', toggleStartStop);
document.getElementById('btn-reset').addEventListener('click', handleReset);
document.getElementById('btn-lap').addEventListener('click', handleLap);