/**
 * ui.js — DOM manipulation module.
 *
 * Owns every document.getElementById reference and all DOM mutations.
 * Imports only formatTime from timer.js (a pure formatting utility —
 * no state access), so this module never touches timer internals directly.
 * All state decisions are made by app.js and passed in as arguments.
 */

import { formatTime } from './timer.js';

const display    = document.getElementById('display');
const btnStart   = document.getElementById('btn-start');
const btnLap     = document.getElementById('btn-lap');
const lapsEl     = document.getElementById('laps');
const lapsHeader = document.getElementById('laps-header');
const lapsCount  = document.getElementById('laps-count');
const statusEl   = document.getElementById('status');

export function updateDisplay(totalMs) {
  display.innerHTML = formatTime(totalMs);
}

// Three discrete states map to three distinct button configurations.
// Using a state string rather than booleans keeps the call-site readable.
export function updateButtons(state) {
  if (state === 'running') {
    btnStart.textContent = 'Pause';
    btnLap.disabled = false;
  } else if (state === 'paused') {
    btnStart.textContent = 'Resume';
    btnLap.disabled = true;
  } else {
    // 'ready' — initial state and post-reset state
    btnStart.textContent = 'Start';
    btnLap.disabled = true;
  }
}

export function updateStatus(state) {
  const labels = { running: 'Running', paused: 'Paused', ready: 'Ready' };
  // Fallback to raw state string so callers aren't silently swallowed
  statusEl.textContent = labels[state] ?? state;
}

// Called on reset — reverts display and lap list to their initial DOM state
export function resetDisplay() {
  display.innerHTML = '00:00<span class="ms">.00</span>';
  lapsEl.innerHTML  = '';
  lapsHeader.classList.remove('visible');
}

export function renderLaps(lapTimes) {
  // classList.toggle(cls, force) is more concise than add/remove conditionals
  lapsHeader.classList.toggle('visible', lapTimes.length > 0);
  lapsCount.textContent = lapTimes.length;
  lapsEl.innerHTML = '';

  // Fastest/slowest only meaningful with 2+ laps — single lap has no comparative reference
  const fastest = lapTimes.length > 1 ? Math.min(...lapTimes) : null;
  const slowest = lapTimes.length > 1 ? Math.max(...lapTimes) : null;

  // Newest lap first — most recent split is immediately visible without scrolling
  [...lapTimes].reverse().forEach((dur, reverseIdx) => {
    const num       = lapTimes.length - reverseIdx;
    const isFastest = fastest !== null && dur === fastest;
    const isSlowest = slowest !== null && dur === slowest;

    const item = document.createElement('div');
    item.className = 'lap-item';
    if (isFastest) item.classList.add('fastest');
    if (isSlowest) item.classList.add('slowest');

    // Text badge supplements colour — aids colour-blind users scanning the list
    const badgeHtml = isFastest
      ? '<span class="lap-badge">Best</span>'
      : isSlowest
      ? '<span class="lap-badge">Slow</span>'
      : '';

    item.innerHTML = `
      <div class="lap-left">
        <span class="lap-num">Lap ${num}</span>
        ${badgeHtml}
      </div>
      <span class="lap-time"></span>`;

    // Set innerHTML on the time cell after construction to preserve the inner <span>
    item.querySelector('.lap-time').innerHTML = formatTime(dur);
    lapsEl.appendChild(item);
  });
}