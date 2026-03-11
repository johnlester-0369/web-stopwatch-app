/**
 * timer.js — Pure timer domain module.
 *
 * Owns all stopwatch state and time logic. Zero DOM knowledge:
 * this module can be unit-tested in Node without a browser.
 * The onTick callback is injected by the caller so the interval
 * can drive UI updates without creating a hard dependency on ui.js.
 */

let elapsed    = 0;       // ms accumulated before the current run segment
let startedAt  = null;    // Date.now() snapshot when the timer last started
let running    = false;
let intervalId = null;
let lapTimes   = [];      // each entry is the lap duration in ms

// Wall-clock diff avoids drift when the tab is backgrounded or interval fires late
export function getTotal() {
  return running ? elapsed + (Date.now() - startedAt) : elapsed;
}

export function isRunning() { return running; }

// Returns a shallow copy so callers cannot accidentally mutate internal state
export function getLapTimes() { return [...lapTimes]; }

// Format ms → "MM:SS.cc" — centiseconds for human readability at a glance.
// Returns an HTML string because the .ms span is part of the display contract.
export function formatTime(ms) {
  const centis  = Math.floor(ms / 10) % 100;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}<span class="ms">.${pad(centis)}</span>`;
}

// onTick is called every 10ms; 10ms interval gives centisecond precision
// without heavy CPU cost. Caller decides what to do on each tick (e.g. update DOM).
export function start(onTick) {
  startedAt  = Date.now();
  intervalId = setInterval(onTick, 10);
  running    = true;
}

export function pause() {
  // Accumulate elapsed before clearing so resume picks up exactly where we left off
  elapsed += Date.now() - startedAt;
  clearInterval(intervalId);
  running = false;
}

export function reset() {
  clearInterval(intervalId);
  elapsed    = 0;
  startedAt  = null;
  running    = false;
  lapTimes   = [];
}

// Records the current lap, returns the full updated lap list so the caller
// can pass it directly to the UI layer without a separate getLapTimes() call.
export function recordLap() {
  const prevTotal   = lapTimes.reduce((a, b) => a + b, 0);
  const lapDuration = getTotal() - prevTotal;
  lapTimes.push(lapDuration);
  return [...lapTimes];
}