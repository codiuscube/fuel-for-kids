import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Scroll guard.
//
// A phone hands any touch that lands on an <input type="range"> to that input,
// and the input takes its value from wherever the finger came down. This page
// is one long scroll with sliders sitting in the middle of it — thirteen
// stacked weight sliders under "Adjust what matters", three gain sliders and
// two price sliders in Filters, six in Assumptions — so a swipe meant to
// scroll past them starts on one and moves it, and a tap meant to arrest a
// flick nudges it.
//
// `touch-action: pan-y` on the inputs already gives the vertical gesture back
// to the scroller, so the page does move. What it cannot undo is the value the
// input took the moment the finger landed. This module tracks whether anything
// on the page is scrolling right now, so a slider can stay inert while a
// scroll is in flight and can tell a scroll gesture from a real drag after the
// fact. RangeInput is the consumer.
// ---------------------------------------------------------------------------

// How long after the last scroll event a touch counts as deliberate again.
// Momentum scrolling fires in bursts, so this has to outlast the gap between
// two frames of a decelerating flick without feeling like a lockout.
const SETTLE_MS = 250;

let ticks = 0;
let timer = null;

// Every scroll anywhere on the page bumps this. A slider compares the count at
// touchstart against the count at touchend: a different number means the page
// moved under the finger, which makes the gesture a scroll whatever else it
// looked like.
export const scrollTicks = () => ticks;

export const isScrolling = () => timer !== null;

const settle = () => {
  timer = null;
  document.documentElement.removeAttribute('data-scrolling');
};

const onScroll = () => {
  ticks += 1;
  if (timer) clearTimeout(timer);
  else document.documentElement.setAttribute('data-scrolling', 'true');
  timer = setTimeout(settle, SETTLE_MS);
};

// Capture phase, because a scroll event does not bubble: this way the filter
// sheet's own scroller and the horizontal matrix strips count too, not just
// the window.
export const useScrollGuard = () => {
  useEffect(() => {
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      if (timer) {
        clearTimeout(timer);
        settle();
      }
    };
  }, []);
};
