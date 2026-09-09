import { useRef } from 'react';
import { isScrolling, scrollTicks } from '../lib/scrollGuard';

// How far a finger has to travel before the gesture has committed to a
// direction. Below this it is still a tap.
const SLOP = 8;
// How much more vertical than horizontal a gesture has to be to read as a
// scroll. A shade over 1, so a diagonal drag still counts as a drag.
const VERTICAL_BIAS = 1.2;

// A slider that only keeps a change you meant to make.
//
// With a mouse or a keyboard this is exactly <input type="range">. Under a
// finger it watches the gesture it is caught up in and throws the change away
// when that gesture was really a scroll:
//
//   * a touch that lands while the page is still moving is ignored outright —
//     that is a tap to stop a flick, not a slider adjustment;
//   * a drag that travels further down the screen than across it puts the
//     value back where it was and sits out the rest of the gesture;
//   * a touch that never became a horizontal drag but did move the page —
//     which is what `touch-action: pan-y` does as soon as it hands the swipe
//     to the scroller — is put back too, on touchend or touchcancel.
//
// Once a gesture has established itself as a horizontal drag it is trusted to
// the end, so a re-render that shifts the page underneath cannot cancel a
// deliberate adjustment.
//
// onChange receives the parsed number rather than the event.
export default function RangeInput({ value, onChange, ...rest }) {
  const touch = useRef(null);

  const revert = (g) => {
    if (g.start !== value) onChange(g.start);
  };

  const handleChange = (e) => {
    const g = touch.current;
    // Mid-gesture the intent decides. Outside one, a scroll in flight means
    // whatever produced this change was aimed at the page, not at the slider.
    if (g ? g.intent === 'scroll' : isScrolling()) return;
    onChange(parseFloat(e.target.value));
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    if (!t) return;
    touch.current = {
      x: t.clientX,
      y: t.clientY,
      start: value,
      ticks: scrollTicks(),
      intent: isScrolling() ? 'scroll' : 'unknown',
    };
  };

  const onTouchMove = (e) => {
    const g = touch.current;
    if (!g || g.intent !== 'unknown') return;
    const t = e.touches[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - g.x);
    const dy = Math.abs(t.clientY - g.y);
    if (Math.max(dx, dy) < SLOP) return;
    g.intent = dy > dx * VERTICAL_BIAS ? 'scroll' : 'drag';
    if (g.intent === 'scroll') revert(g);
  };

  const onTouchEnd = () => {
    const g = touch.current;
    touch.current = null;
    if (!g) return;
    // Either we called it a scroll while it was happening, or it never became
    // a drag and the page moved, which says the same thing after the fact.
    if (g.intent === 'scroll' || (g.intent === 'unknown' && g.ticks !== scrollTicks())) revert(g);
  };

  return (
    <input
      {...rest}
      type="range"
      value={value}
      onChange={handleChange}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    />
  );
}
