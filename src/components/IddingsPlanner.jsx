import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Scale,
  Users,
  Layers,
  MapPin,
  Phone,
  Mail,
  Shirt,
  GraduationCap,
  Backpack,
  CheckSquare,
  Square,
  Copy,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

// ---------------------------------------------------------------------------
// Single source of truth for the family's real numbers. Everything the page
// shows is derived from the data in this block — update here if a figure changes.
// ---------------------------------------------------------------------------

const TODAY = '2026-07-09';

// Per-child 2026-27 gross tuition and the NBCA financial aid already granted.
const STUDENTS = [
  { name: 'Cassius', grade: '9th Grade', tuition: 16790, nbcaAid: 5850, scholarship: 4000 },
  { name: 'Dorothy', grade: '7th Grade', tuition: 16050, nbcaAid: 5600, scholarship: 4000 },
  { name: 'Sebastian', grade: '4th Grade', tuition: 15185, nbcaAid: 4750, scholarship: 4000 },
];

const SIBLING_DISCOUNT = 1518.5;   // FACTS applies the family sibling discount to Sebastian's account.

const usd = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const usd2 = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Withdrawal penalty once the Jun 30 penalty-free deadline passes: 10% if we
// withdraw in July, 20% in August. ASSUMPTION pending the enrollment contract's
// exact wording ("x% of annual tuition"): the percentage is assessed on the NET
// tuition we actually owe — the FACTS balance, i.e. tuition after NBCA aid, the
// sibling discount and the scholarship ($18,306.50) — NOT gross sticker tuition.
const PENALTY_BASE = STUDENTS.reduce((a, s) => a + s.tuition - s.nbcaAid - s.scholarship, 0) - SIBLING_DISCOUNT;
const WITHDRAWAL_PENALTY = { july: PENALTY_BASE * 0.1, august: PENALTY_BASE * 0.2 };

// TEFA waitlist status — the bucket the Comptroller texted us on May 13.
const TEFA = {
  tier: 'Tier 3 (200–500% FPL)',
  band: '30,001 – 50,000',
  bandLo: 30001,
  bandHi: 50000,
  notifiedOn: '2026-05-13',
};

// Cody's own original lottery position within that band — the deep end (the chart's
// y-axis is original position, so the frontier must reach THIS to fund us).
const YOUR_POS = { lo: 45000, hi: 50000 };

// ---------------------------------------------------------------------------
// Confirmed program budget — Travis Pillow (Comptroller spokesperson),
// answering directly in the TEFA Facebook group on Jun 25, 2026:
//   • ~$910M to award this year, after admin, startup, and TEA transfers
//     (~$90M comes off the $1B biennium cap).
//   • ~$890M already funded in ACTIVE awards. They hold to that $890M by
//     funding additional batches to backfill as families opt out or bump down
//     to homeschool/other ($2,000).
//   • ~$20M reserve was held for outstanding appeals. Once the appeal window
//     closed, they awarded that down to the waitlist.
//
// UPDATE (Jul 8, 2026): the appeal window has now closed and Travis Pillow
// confirmed the reserve is SPENT — "we funded approximately 4,000 additional
// students today … with the appeal window closed, we spent down nearly all of
// the reserve set aside for appeals. That's where the bulk of this funding came
// from." So the reserve is no longer FUTURE upside: it has already fired, and
// its ~4,000 seats are now baked into the observed frontier (see the Jul 8 point
// in T2_OBSERVATIONS). Forward motion from here is BACKFILL CHURN only — the
// program is fully deployed ($890M active + the now-spent reserve = ~$910M), so
// the waitlist advances only as awarded families leave (opt out, bump to $2,000,
// or miss the Jul 15 deadline), each departure recycling ~one new blended seat.
//
// Reconciliation note: ~4,000 seats off "nearly all of ~$20M" implies ~$5,000
// per seat — below the $7,678 blend, so either those reserve awards skewed toward
// the $2,000 homeschool tier or the pot was larger than $20M. We anchor on the
// PUBLISHED count (4,000 seats), per this file's "published numbers win" rule,
// rather than forcing it through the blended cost.
// ---------------------------------------------------------------------------

const TEFA_BUDGET = {
  awardable: 910_000_000,    // after admin/startup/TEA (~$90M off the $1B)
  fundedActive: 890_000_000, // active awards, held here via backfill
  reserve: 20_000_000,       // total reserve pot (appeals + waitlist) — SPENT DOWN Jul 8
  reserveNet: 0,             // reserve is exhausted after the Jul 8 draw → 0 left to cascade
  // New T2/T3 seat = blend of private ESA (~$10,474) and homeschool/other ($2,000).
  // Mix updated to 67/33 (was 77/23) — homeschool share has climbed 23%→~33% of
  // active awards as private families bump down via the $2,000 downgrade.
  blendedCost: Math.round(0.67 * 10474 + 0.33 * 2000), // ~7,678 (67/33 private/homeschool)
  source: 'Travis Pillow, Comptroller spokesperson — Jul 8, 2026 (reserve spent)',
};
// The reserve draw actually observed Jul 8 — ~4,000 waitlist students funded off
// the appeals reserve as the appeal window closed. This is NOW in the frontier
// (T2_OBSERVATIONS Jul 8), not a future add-on.
const RESERVE_AWARDED_JUL8 = 4000;
// Reserve seats still available to cascade GOING FORWARD — zero, the reserve is
// exhausted. (Was ~2,084 modeled as future upside; that release has since fired
// as the larger Jul 8 draw and is already counted in the observed frontier.)
const RESERVE_SEATS = 0;
// Active awards that can churn — the population that frees seats when it leaves.
const ACTIVE_AWARDS = 107000; // "nearly 107,000 active" (Jun 23 update)

// ---------------------------------------------------------------------------
// The Jul 1 activation cut — the number that pins how much fuel is actually left.
// Jun 30 Comptroller release: "nearly 73,000" TEFA accounts receive INITIAL
// funding July 1 — private families who opted in AND had enrollment confirmed,
// plus homeschool/other who opted in by the deadline. So of the ~107,000 active
// awards, ~73,000 have COMMITTED. The rest were awarded but have NOT yet opted in
// / selected a school / confirmed — that ~34,000 "remainder" is the entire pool
// that can still free a seat by being moved aside (opt out, drop to $2,000
// homeschool, or miss the Jul 15 / Jul 31 confirmation deadlines).
//
// This bounds the cascade hard: the moved-aside count CANNOT exceed ~34,000,
// because the other ~73,000 have already locked in. The only open question is
// what SHARE of that remainder fails to confirm — realistically 30–50%.
// ---------------------------------------------------------------------------
const FUNDED_JULY1 = 73000;                       // "nearly 73,000" funded Jul 1 (Jun 30 release)
const REMAINDER = ACTIVE_AWARDS - FUNDED_JULY1;   // ~34,000 awarded but NOT activated — the churn pool

// ---------------------------------------------------------------------------
// Funded seats per departure — the DOLLAR mechanics that turn an active family's
// departure into a funded waitlist seat. A private opt-out frees its full ESA
// (~$10,474); a downgrade to the $2,000 tier frees only the difference (~$8,474).
// Each new funded seat costs the blended ~$7,678. So seats-per-departure =
// dollars-freed ÷ blended-cost, and the opt-out : downgrade split is the lever:
// the OBSERVED mix is downgrade-heavy (2.8% : 9.3% = 23.1% opt-out share) →
// ~$8,937 freed ÷ $7,678 ≈ 1.16 seats/departure. An opt-out-heavy mix climbs toward
// 1.36 (full ESA). We DEFAULT to the conservative observed split, exposed as a lever.
// NOTE: never-activation does NOT appear here — a waitlist family declining frees NO
// new dollars, it just passes the SAME dollars to the next person. That is a reach
// STRETCH on the offer frontier (see NEVER_ACTIVATION), never a funding source.
const FREED_OPTOUT = 10474;       // private opt-out frees the full ESA
const FREED_DOWNGRADE = 8474;     // bump to $2,000 frees the difference ($10,474 − $2,000)
const OBS_OPTOUT_RATE = 0.028;    // ~3,000 opt-outs / ~107k active (Jun 23)
const OBS_DOWNGRADE_RATE = 0.093; // ~9,900 downgrades / ~107k active (frontier − opt-outs)
const OBS_OPTOUT_SHARE = OBS_OPTOUT_RATE / (OBS_OPTOUT_RATE + OBS_DOWNGRADE_RATE); // 0.231
const avgFreedPerDeparture = (optOut, downgrade) =>
  (optOut * FREED_OPTOUT + downgrade * FREED_DOWNGRADE) / (optOut + downgrade);
// Funded seats per departure = dollars freed ÷ blended new-seat cost (~1.16 at obs mix).
const seatsPerDeparture = (optOut, downgrade) =>
  avgFreedPerDeparture(optOut, downgrade) / TEFA_BUDGET.blendedCost;

// ---------------------------------------------------------------------------
// TEFA cascade frontier — how deep the waitlist has been funded, vs. three
// projections. Feeds the TEFA tab. All published (empirical) numbers live in
// the *_OBSERVATIONS arrays; everything else is derived.
//
// The metric that actually answers "will an offer reach us?" is the CASCADE
// FRONTIER: how far down the single, tier-ordered global waitlist awards have
// reached. Tier 3 begins at position 20,383 (everyone ahead is Tier 2); our
// family band is global positions 30,001–50,000. We deliberately do NOT chart
// raw opt-out counts: each departure recycles ~one new blended seat (a private
// opt-out frees $10,474 → ~1.4 seats; a homeschool downgrade frees $8,474 → ~1.1
// seats), so progress is measured in seats reached, not raw opt-outs.
// ---------------------------------------------------------------------------

const AWARDED_BASE = 95934;       // initially awarded (44,753 T1-family + 51,181 T2)
const T2_AT_LOTTERY = 20383;      // Tier 2 waitlisted ahead of Tier 3 at lottery time (May 7 PDF)
const T3_START = T2_AT_LOTTERY;   // the cascade frontier at which the FIRST Tier 3 offer goes out
const BAND_LO = TEFA.bandLo;      // 30,001 — top of our family's band
const BAND_HI = TEFA.bandHi;      // 50,000 — bottom of our family's band

// How the cascade frontier maps to "fuel": the frontier advances ~1 seat per family
// that LEAVES an award without taking a full private seat. With the Jul 1 activation
// count in hand, the fuel is no longer a guessed rate on all 107k — it's a SHARE of
// the ~34,000 remainder (awarded but not activated by Jul 1). The appeals reserve has
// already fired (Jul 8, ~4,000 seats, now in frontier-now), so it no longer adds a
// forward term. A scenario's terminal frontier ≈
//   frontier-now (16,916)  +  movedAsideShare × 34,000 × seats-per-departure  +  0 reserve.
// Each moved-aside family frees a seat one of two ways, and BOTH are counted via the
// opt-out:downgrade split in seatsPerDeparture: a full opt-out frees the whole award
// (~$10,474), a drop to the $2,000 homeschool tier frees only the difference (~$8,474).

// Jun 23, 2026 Comptroller News & Updates ("More than 5,000 new awards issued to
// waitlisted TEFA students"). 5,499 newly awarded, all Tier 2 — so the frontier
// advances 1:1 to 7,417 + 5,499 = 12,916 (Tier 2 backlog 12,966 → 7,467).
const JUNE23_CASCADE = {
  asOf: '2026-06-23',
  t2Cascaded: 5499,               // "5,499 waitlisted students" newly awarded, all Tier 2
  optOuts: 3000,                  // "nearly 3,000" cumulative opt-outs
  grossAwardedApprox: 109327,     // "nearly 110,000" awarded so far
  activeAwardsApprox: 106327,     // "nearly 107,000" active after opt-outs
  t2RemainingAfterCascade: 7467,
};

// Published cumulative opt-out counts — kept as supporting context (the headline
// "X have opted out so far" stat), not as a chart axis.
const OPTOUT_OBSERVATIONS = [
  { date: '2026-05-11', cumOptOuts: 0 },    // opt-in portal opens — baseline
  { date: '2026-05-29', cumOptOuts: 1400 }, // May 29 News & Updates (~1,400)
  { date: '2026-06-10', cumOptOuts: 2000 }, // Jun 10 press release (~2,000)
  { date: '2026-06-23', cumOptOuts: 3000 }, // Jun 23 News & Updates ("nearly 3,000")
];

// Observed Tier 2 backlog still ahead of Tier 3 (from the cascade posts). The
// cascade frontier is derived from these: frontier = T2_AT_LOTTERY − t2Remaining.
// APPEND new Comptroller posts here and both the observed line and the
// projections re-anchor to the newest point automatically.
const T2_OBSERVATIONS = [
  { date: '2026-05-04', t2Remaining: 20383 }, // Tier 2 award batch — backlog established (frontier 0)
  { date: '2026-05-29', t2Remaining: 17066 }, // after 3,317 cascade awards
  { date: '2026-06-10', t2Remaining: 12966 }, // after 4,100 more cascade awards
  { date: '2026-06-23', t2Remaining: 7467 },  // after 5,499 more cascade awards (Jun 23 update) → frontier 12,916
  { date: '2026-07-08', t2Remaining: 3467 },  // Jul 8: ~4,000 more awarded off the now-spent appeals reserve → frontier 16,916 (still Tier 2)
];

// Frontier reached so far = how deep the cascade has funded down the global list.
// Future advance is added ON TOP of this from the 34k remainder, so it's the base
// the projection and the simulator both build from.
const FRONTIER_NOW = T2_AT_LOTTERY - T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1].t2Remaining; // 16,916 (Jul 8)

// Three scenarios over ONE honest unknown: what SHARE of the ~34,000 remainder (awarded
// but not activated by Jul 1) ends up moved aside — opting out or dropping to the $2,000
// homeschool tier — instead of confirming a private seat. Realistic band is 30–50%.
// Anchored on the Jul 8 frontier (16,916, reserve already spent), the terminals are now:
//   LOW   (30% of the remainder leaves)  → funded ≈ 28,800  (just short of our band start)
//   LIKELY (40%, the central anchor)     → funded ≈ 32,700  (into the band, low end)
//   HIGH  (50%)                          → funded ≈ 36,700  (into the band, short of our 45k)
// `share` is the moved-aside fraction; `optOutShare` is how that fraction splits between
// full opt-outs (~$10,474 freed) and $2,000 homeschool downgrades (~$8,474) — held at the
// observed 23% opt-out / 77% downgrade mix (→ ~1.16 seats/departure), exposed as a lever.
// Each terminal = frontier-now + share × 34,000 × seats-per-departure + 0 reserve (spent).
// Scenarios, not forecasts; after Aug 15 each drifts on small residual churn.
const OBS_OPTOUT_SHARE_OF_CHURN = 0.231;   // observed 2.8% opt-out / 9.3% downgrade split

const REALISTIC = {
  share: 0.40,                              // LIKELY — 40% of the 34k remainder moved aside
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,   // 23% opt out fully, 77% drop to $2,000 → ~1.16 seats/departure
  reserveSeats: RESERVE_SEATS,              // 0 — appeals reserve spent Jul 8 (already in frontier-now)
};

const AGGRESSIVE = {
  share: 0.50,                              // HIGH — half the remainder fails to confirm
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,
  reserveSeats: RESERVE_SEATS,              // 0 — reserve spent
};

const RESEARCH = {
  share: 0.30,                              // LOW — most of the remainder still confirms by Jul 15/31
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,
  reserveSeats: RESERVE_SEATS,              // 0 — reserve spent
};

// Chart window: from the lottery (frontier 0) through end-August. The big waves
// (Tier 2 clear, reserve, the Jul 15 deadline shakeout) are done by ~Aug 15; after
// that both lines carry only a small residual attrition drift, not another wave.
// `today` anchors the "Today" marker to a fixed date so a screenshot of the
// chart reads the same for everyone (the artifact gets posted/shared) — bump it
// as the analysis is refreshed, rather than letting it drift with the viewer's clock.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: '2026-07-09', jul15: '2026-07-15', end: '2026-08-31' };
const WAVES_END = '2026-08-15';   // after this the big mechanisms are exhausted
const POST_DRIFT = 30;            // seats/day of small residual attrition after Aug 15 (realistic trickle)

// Cascade-frontier model. Two scenarios, both anchored on the last published
// frontier point and landing on a terminal by Aug 15 (small drift after). Each is
// a set of monotone waypoints: the REALISTIC line tapers through the Jul 15
// deadline; the AGGRESSIVE line spikes at end-of-June (PreK/K seat shortage) then
// runs hot through the deadline.
function buildCascadeProjection({
  t2Observations = T2_OBSERVATIONS,
  optOuts = OPTOUT_OBSERVATIONS,
  realistic = REALISTIC,
  aggressive = AGGRESSIVE,
  research = RESEARCH,
  window: win = FRONTIER_WINDOW,
} = {}) {
  const DAY = 86_400_000;
  const t0 = Date.parse(win.chartStart);
  const dayOf = (d) => Math.round((Date.parse(d) - t0) / DAY);

  // Observed frontier = how deep the cascade has reached down the global list.
  const obsF = t2Observations.map((o) => ({ t: dayOf(o.date), f: T2_AT_LOTTERY - o.t2Remaining }));
  const last = obsF[obsF.length - 1];
  const [tL, fL] = [last.t, last.f];
  const tEnd = dayOf(win.end);

  const interp = (pts, t) => {
    if (t <= pts[0].t) return pts[0].f;
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i].t) {
        const [a, b] = [pts[i - 1], pts[i]];
        return a.f + ((b.f - a.f) * (t - a.t)) / (b.t - a.t);
      }
    }
    return pts[pts.length - 1].f;
  };

  // Monotone cubic (Fritsch–Carlson) interpolation through waypoints — gives each
  // line a smooth curve through its staged waypoints WITHOUT overshooting, so the
  // bows can't push a line into a false dip or above its scenario's terminal.
  // (Recharts' own curve types can't help here: the series is sampled daily along
  // straight segments, so the points are colinear and there's nothing to round.)
  const monoSpline = (pts) => {
    const n = pts.length;
    if (n < 2) return () => (n ? pts[0].f : 0);
    const xs = pts.map((p) => p.t), ys = pts.map((p) => p.f);
    const dx = [], sl = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = xs[i + 1] - xs[i]; sl[i] = (ys[i + 1] - ys[i]) / dx[i]; }
    const m = new Array(n);
    m[0] = sl[0]; m[n - 1] = sl[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / sl[i], b = m[i + 1] / sl[i], h = Math.hypot(a, b);
      if (h > 3) { const tau = 3 / h; m[i] = tau * a * sl[i]; m[i + 1] = tau * b * sl[i]; }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (x > xs[i + 1]) i++;
      const h = dx[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] +
             (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  };

  const optOutsSoFar = optOuts[optOuts.length - 1].cumOptOuts;

  const wavesEnd = dayOf(WAVES_END);
  const jul15 = dayOf('2026-07-15');

  // Build a scenario line from monotone waypoints: observed up to the anchor, the
  // spline through the waypoints to Aug 15, then small residual drift after.
  const buildLine = (waypoints, endT) => {
    const pts = [{ t: tL, f: fL }];
    for (const q of waypoints) {
      if (q.t <= tL) continue;
      const prev = pts[pts.length - 1];
      const f = Math.round(Math.max(q.f, prev.f));   // clamp monotone — never dips
      // Merge any same-day waypoints; a duplicate x makes dx=0 in monoSpline → a NaN
      // tangent that would blank the rest of the line.
      if (q.t === prev.t) prev.f = f;
      else pts.push({ t: q.t, f });
    }
    const spline = monoSpline(pts);
    return (t) =>
      t <= tL ? interp(obsF, t)
              : spline(Math.min(t, endT)) + Math.max(0, t - endT) * POST_DRIFT;
  };

  // FUNDED frontier — the hard money limit. = frontier-now + (share of the 34k remainder
  // that's moved aside) × seats-per-departure (dollars freed ÷ blended cost) + reserve seats
  // (now 0 — the appeals reserve was spent Jul 8 and its ~4,000 seats are already in
  // frontier-now). The deepest waitlist position real money reaches. Both fuel mechanisms
  // count via the opt-out:downgrade split — a full opt-out frees the whole award, a $2,000
  // homeschool drop frees only the difference. Never-activation does NOT enter here.
  const terminalSeats = (s) =>
    Math.round(fL + s.share * REMAINDER * seatsPerDeparture(s.optOutShare, 1 - s.optOutShare) + s.reserveSeats);
  // Default-shape terminals from the module scenarios. The waypoint heights below are
  // the hand-tuned DEFAULT curves (lull → Jul-15 step → taper). When a scenario's
  // churn is changed by the simulator sliders, `fitLine` rescales the whole curve's
  // height-above-the-anchor so it lands on the NEW terminal while keeping that shape.
  const defResearchT = terminalSeats(RESEARCH);
  const defRealT = terminalSeats(REALISTIC);
  const defAggT = terminalSeats(AGGRESSIVE);

  // Pin the Jul-8 anchor; scale each future waypoint's gap above it linearly so the
  // line still hits `terminalSeats(scenario)`. scale = 1 at default churn (identical
  // curve); a terminal below the current frontier clamps the line flat (can't rewind).
  const fitLine = (waypoints, defTerminal, scenario) => {
    const newTerminal = terminalSeats(scenario);
    const denom = defTerminal - fL;
    const scale = denom > 0 ? Math.max(0, (newTerminal - fL) / denom) : 1;
    const scaled = waypoints.map((q) =>
      q.t <= tL ? q : { t: q.t, f: fL + (q.f - fL) * scale });
    return { fn: buildLine(scaled, wavesEnd), terminal: newTerminal };
  };

  // All three share ONE shape from the Jul 8 anchor (16,916, reserve already spent): a quiet
  // Jul 8–15 lull (the 34k remainder is still inside its confirmation window), then the SURGE
  // Jul 15–31 as non-confirmers are moved aside, tapering to the terminal by Aug 15. They
  // differ only in how much of the remainder leaves (30 / 40 / 50%). fitLine pins each to its
  // exact terminal. There is no reserve step now — the appeals reserve fired Jul 8.

  // LIKELY — 40% of the remainder moved aside → ~32,700 (into the band, low end).
  const real_ = fitLine([
    { t: tL, f: fL },                              // Jul 8 anchor (16,916)
    { t: jul15, f: 19000 },                        // QUIET Jul 8–15 lull; Tier 2 tail clearing
    { t: dayOf('2026-07-17'), f: 20500 },          // Jul 15 deadline shakeout begins
    { t: dayOf('2026-07-31'), f: 29000 },          // bulk of moved-aside seats cascade Jul 15–31
    { t: wavesEnd, f: defRealT },                  // taper Aug 1–15 → ~32,700
  ], defRealT, realistic);
  const realFn = real_.fn, realTerminal = real_.terminal;

  // HIGH — 50% of the remainder leaves → ~36,700 (into the band, still short of our 45k).
  const agg_ = fitLine([
    { t: tL, f: fL },                              // Jul 8 anchor (16,916)
    { t: jul15, f: 19500 },                        // QUIET Jul 8–15 lull
    { t: dayOf('2026-07-17'), f: 21500 },          // heavier Jul 15 deadline shakeout begins
    { t: dayOf('2026-07-31'), f: 32000 },          // heavy moved-aside cascade Jul 15–31
    { t: wavesEnd, f: defAggT },                   // taper Aug 1–15 → ~36,700
  ], defAggT, aggressive);
  const aggFn = agg_.fn, aggTerminal = agg_.terminal;

  // LOW — 30% of the remainder leaves → ~28,800 (most confirm; cascade stalls just short of the band).
  const research_ = fitLine([
    { t: tL, f: fL },                              // Jul 8 anchor (16,916)
    { t: jul15, f: 18500 },                        // QUIET Jul 8–15 lull; slow Tier 2 clearing
    { t: dayOf('2026-07-17'), f: 19800 },          // small Jul 15 deadline bump
    { t: dayOf('2026-07-31'), f: 25500 },          // modest moved-aside cascade Jul 15–31
    { t: wavesEnd, f: defResearchT },              // taper Aug 1–15 → ~28,800
  ], defResearchT, research);
  const researchFn = research_.fn, researchTerminal = research_.terminal;

  const crossTs = (fn, level) => {
    for (let t = tL; t <= tEnd; t++) if (fn(t) >= level) return t0 + t * DAY;
    return null;
  };

  const series = [];
  for (let t = dayOf(win.chartStart); t <= tEnd; t++) {
    const row = { ts: t0 + t * DAY };
    const od = obsF.find((o) => o.t === t);
    if (od) row.observed = od.f;
    if (t <= tL) row.observedLine = Math.round(interp(obsF, t));
    if (t >= tL) {
      row.research = Math.round(researchFn(t));
      row.realistic = Math.max(Math.round(realFn(t)), row.research);
      // High is by definition ≥ likely; clamp away sub-100-seat spline crossings.
      row.aggressive = Math.max(Math.round(aggFn(t)), row.realistic);
    }
    series.push(row);
  }

  // Frontier reached at the dates the table below the chart reports.
  const TABLE_DATES = ['2026-07-08', '2026-07-15', '2026-07-20', '2026-07-31', '2026-08-15', '2026-08-31'];
  const sampleAt = (fn) => TABLE_DATES.map((d) => Math.round(fn(dayOf(d))));
  const projectionTable = {
    dates: TABLE_DATES,
    aggressive: sampleAt(aggFn),
    conservative: sampleAt(realFn),
    research: sampleAt(researchFn),
  };

  const kpis = {
    asOf: t2Observations[t2Observations.length - 1].date,
    frontierNow: fL,
    t2Remaining: T2_AT_LOTTERY - fL,
    optOutsSoFar,
    optOutPctNow: +(100 * optOutsSoFar / ACTIVE_AWARDS).toFixed(1), // ~2.8% (Jun 23)
    funded: FUNDED_JULY1,
    remainder: REMAINDER,
    reserveSeats: realistic.reserveSeats,
    projectionTable,
    researchTerminal,
    // *ChurnPct now = the share of the 34k remainder that's moved aside (30 / 40 / 50%).
    researchChurnPct: Math.round(research.share * 100),
    realisticChurnPct: Math.round(realistic.share * 100),
    aggressiveChurnPct: Math.round(aggressive.share * 100),
    realisticTerminal: realTerminal,
    realisticTier3Ts: crossTs(realFn, T3_START),
    realisticBandLoTs: crossTs(realFn, BAND_LO),
    aggressiveTerminal: aggTerminal,
    aggressiveTier3Ts: crossTs(aggFn, T3_START),
    aggressiveBandLoTs: crossTs(aggFn, BAND_LO),
    aggressiveBandHiTs: crossTs(aggFn, BAND_HI),
    realisticYourPosTs: crossTs(realFn, YOUR_POS.lo),
    aggressiveYourPosTs: crossTs(aggFn, YOUR_POS.lo),
    freedRatio: +seatsPerDeparture(realistic.optOutShare, 1 - realistic.optOutShare).toFixed(2),
  };
  return { series, kpis };
}


const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtChartDate = (ts) => {
  if (ts == null) return '—';
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const FRONTIER_TICKS = ['2026-05-04', '2026-06-01', '2026-07-01', '2026-07-15', '2026-08-01', '2026-08-15', '2026-08-31'].map(Date.parse);

// Plain-language likelihood of the cascade reaching each global waitlist band,
// drawn from the published bands analysis. ourBand flags the family's bucket.
const BAND_OUTLOOK = [
  {
    band: 'Tier 2 clears',
    scope: 'positions 1 – 20,383',
    call: 'Expected',
    tone: 'good',
    note: 'Every seat freed so far has gone to Tier 2, and the Jul 8 reserve draw (~4,000 more) pushed the frontier to 16,916 — only ~3,467 Tier 2 families left ahead of us. At this pace the backlog clears in July, and this has to finish before any Tier 3 offer goes out at all.',
  },
  {
    band: '20,384 – 25,000',
    scope: 'early Tier 3',
    call: 'Likely',
    tone: 'good',
    note: 'Reached once the last ~3,467 Tier 2 families clear. The appeals reserve has already fired (Jul 8, into Tier 2), so from here it is churn-driven — but even the low case, 30% of the ~34k remainder moved aside (~28,800), funds well past here.',
  },
  {
    band: '25,001 – 30,000',
    scope: 'mid Tier 3',
    call: 'Likely',
    tone: 'good',
    note: 'The Jul 8 reserve draw lifted the whole cascade ~1,900 seats. The low 30% case (~28,800) now lands inside this band, and the likely 40% (~32,700) and high 50% (~36,700) cases pass through it. Needs the Jul 15 shakeout to land.',
  },
  {
    band: '30,001 – 50,000',
    scope: 'YOUR BAND · you sit at 45–50k',
    call: 'Band start reached in the likely & high cases',
    tone: 'mid',
    ourBand: true,
    note: 'Our seat is the DEEP end (45–50k). After the Jul 8 reserve draw, the likely 40% case (~32,700) and the high 50% case (~36,700) both cross into the START of the band (30,001); the low 30% case (~28,800) falls just short. None reach our 45k: that would take essentially the entire remainder collapsing, far beyond a 30–50% shakeout. Plan as if no voucher.',
  },
  {
    band: '50,001 +',
    scope: 'deep Tier 3 / Tier 4',
    call: 'Not expected',
    tone: 'bad',
    note: 'Even 50% of the remainder leaving funds only ~36,700 — reaching 50k would need more departures than the entire ~34k remainder contains, and the reserve is now spent. Tier 4 does not move in Year 1 at all.',
  },
];

const TONE_STYLE = {
  good: { chip: 'bg-tefa-green/15 text-tefa-green', dot: 'bg-tefa-green' },
  mid: { chip: 'bg-amber-100 text-amber-800', dot: 'bg-tefa-gold' },
  bad: { chip: 'bg-gray-100 text-tefa-body/50', dot: 'bg-gray-300' },
};

// Plain-language tooltip for the frontier chart. Whitelisting by dataKey also
// drops the raw `ts` the Scatter series would otherwise inject.
const FRONTIER_SERIES = {
  observedLine: 'Funded so far (published)',
  research: 'Low — 30% of remainder leaves',
  realistic: 'Likely — 40% of remainder leaves',
  aggressive: 'High — 50% of remainder leaves',
};

const FrontierTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => FRONTIER_SERIES[p.dataKey] && p.value != null);
  if (!rows.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[260px]">
      <div className="font-bold text-tefa-navy">{fmtChartDate(label)}</div>
      <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">Waitlist position reached</div>
      {rows.map((r) => (
        <div key={r.dataKey} className="flex justify-between gap-4">
          <span style={{ color: r.color || r.stroke }}>{FRONTIER_SERIES[r.dataKey]}</span>
          <span className="font-semibold tabular-nums text-tefa-body">{Math.round(r.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// The dates that actually require a decision or a payment, in order.
const TIMELINE = [
  { date: 'Jun 15', iso: '2026-06-15', title: 'Accept NBCA scholarship', kind: 'do',
    detail: 'Reply to NBCA to lock in the $12,000 scholarship ($4,000 per child).' },
  { date: 'Jun 22', iso: '2026-06-22', title: 'ACE scholarship — denied (all three)', kind: 'info',
    detail: 'Decision arrived early: Cassius, Dorothy, and Sebastian were all denied for "Scholarship funds unavailable" — the applications were complete, on time, and income-eligible, but ACE ran out of funding before reaching them. This does not change the balance; no ACE award was ever built into it, and the NBCA scholarship still stands. Questions go to ACE at (985) 800-3950 or support@acescholarships.org.' },
  { date: 'End of June', iso: '2026-06-29', title: 'Decide: all three at NBCA, or just Cassius?', kind: 'decide',
    detail: 'Nanette confirmed the full $12,000 scholarship can go to one child instead of $4,000 three ways. Settle whether to enroll all three or send only Cassius (with the whole scholarship, covering his tuition) while Dorothy and Sebastian stay at the School of Science and Technology. The trade-off is cost vs. a two-school commute. Reply to Nanette and decide alongside the June 30 withdrawal deadline.' },
  { date: 'Jun 30', iso: '2026-06-30', title: 'Penalty-free withdrawal deadline', kind: 'decide',
    detail: `Last day to withdraw from NBCA losing only the $690 enrollment fee. After this: 10% of tuition owed (${usd2(WITHDRAWAL_PENALTY.july)}) in July, 20% (${usd2(WITHDRAWAL_PENALTY.august)}) in August.` },
  { date: 'Jul 6', iso: '2026-07-06', title: 'First FACTS tuition draft', kind: 'pay',
    detail: 'First scheduled payment. Use checking/savings ACH to avoid the card fee. See the Money tab for the full schedule.' },
  { date: 'Jul 8', iso: '2026-07-08', title: 'TEFA reserve draw — ~4,000 awarded, appeal reserve now spent', kind: 'info',
    detail: 'With the appeal window closed, the Comptroller funded ~4,000 more waitlisted students off the appeals reserve — spending nearly all of it (Travis Pillow). The funded frontier moved from ~12,916 to ~16,916 (still Tier 2). This is the reserve firing early rather than a future upside; forward motion now depends entirely on the Jul 15 shakeout. Still doesn\'t reach our band.' },
  { date: 'Jul 15', iso: '2026-07-15', title: 'TEFA opt-in / opt-out deadline', kind: 'info',
    detail: 'The biggest TEFA waitlist-cascade event of the year — but it lands AFTER the June 30 withdrawal deadline.' },
  { date: 'Oct 1', iso: '2026-10-01', title: 'TEFA 2nd installment (if funded)', kind: 'info',
    detail: 'Only relevant if a waitlist offer reached us and we opted in. Not expected in Year 1.' },
  { date: 'Feb 1', iso: '2027-02-01', title: 'TEFA final installment (if funded)', kind: 'info',
    detail: 'Final 50% of a TEFA award, if one ever arrives. Not expected in Year 1.' },
];

// Confirmed payment plan: ten equal FACTS drafts starting July 6. Amounts are
// computed from the live balance below.
const PAYMENT_PLAN = {
  note: 'Standard FACTS schedule: ten equal drafts starting July 6.',
  shares: Array(10).fill(0.1),
  dates: ['Jul 6, 2026', 'Aug 5, 2026', 'Sep 8, 2026', 'Oct 5, 2026', 'Nov 5, 2026',
    'Dec 7, 2026', 'Jan 5, 2027', 'Feb 5, 2027', 'Mar 5, 2027', 'Apr 5, 2027'],
};

const VALID_TABS = ['now', 'money', 'timeline', 'nbca', 'tefa'];
const TAB_LABELS = { now: 'Now', money: 'Money', timeline: 'Timeline', nbca: 'NBCA Prep', tefa: 'TEFA' };

const IddingsPlanner = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = VALID_TABS.includes(tab) ? tab : 'now';
  const setTab = (t) => navigate(`/${t}`);

  // --- Money: derive the family balance from the data above -----------------
  const perStudent = STUDENTS.map((s) => {
    const discount = s.name === 'Sebastian' ? SIBLING_DISCOUNT : 0;
    const balance = s.tuition - s.nbcaAid - discount - s.scholarship;
    return { ...s, discount, balance };
  });

  const tuition = STUDENTS.reduce((a, s) => a + s.tuition, 0);
  const nbcaAid = STUDENTS.reduce((a, s) => a + s.nbcaAid, 0);
  const scholarship = STUDENTS.reduce((a, s) => a + s.scholarship, 0);
  const balanceDue = perStudent.reduce((a, s) => a + s.balance, 0);

  const schedule = PAYMENT_PLAN.dates.map((date, i) => ({
    number: i + 1,
    date,
    amount: balanceDue * PAYMENT_PLAN.shares[i],
  }));

  return (
    <div className="min-h-screen bg-tefa-light font-sans text-tefa-body pb-12">
      {/* Header */}
      <header className="bg-tefa-navy text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Iddings Family Planner</h1>
            <p className="text-tefa-sky text-sm mt-1">NBCA 2026–2027 · what to do, when, and what we owe</p>
          </div>
          <nav className="flex gap-2 text-sm font-medium">
            {VALID_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full transition ${
                  activeTab === t
                    ? 'bg-white text-tefa-navy font-bold'
                    : 'text-white border border-white/20 hover:text-tefa-sky'
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {activeTab === 'now' && (
          <NowView balanceDue={balanceDue} perStudent={perStudent} setTab={setTab} />
        )}
        {activeTab === 'money' && (
          <MoneyView
            tuition={tuition}
            nbcaAid={nbcaAid}
            scholarship={scholarship}
            balanceDue={balanceDue}
            perStudent={perStudent}
            schedule={schedule}
          />
        )}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'nbca' && <NbcaPrepView />}
        {activeTab === 'tefa' && <TefaView />}
      </main>

      <footer className="bg-tefa-navy text-white p-6 text-center text-xs mt-8">
        <p>Created for the Iddings Family · 2026–2027 school year</p>
        <p className="mt-1 text-white/60">
          Figures are estimates. Final awards are set by NBCA, ACE, and the Texas Comptroller (TEFA).
        </p>
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// NOW — the one page that answers "what do we do, and what do we owe?"
// ---------------------------------------------------------------------------
const NowView = ({ balanceDue, perStudent, setTab }) => {
  const actions = [
    { date: 'By Jun 15', text: 'Accept the NBCA scholarship ($12,000) by replying to Nanette.', done: false },
    { date: 'Resolved', text: 'ACE scholarship came back denied for all three (funds unavailable) — no ACE money is coming, so budget for the full balance below.', done: true },
    { date: 'By Jun 30', text: 'Decide: withdraw penalty-free, or commit and pay tuition.', done: false },
  ];

  const cassius = perStudent.find((s) => s.name === 'Cassius');
  // Nanette confirmed the full scholarship can be concentrated on one child
  // instead of being split $4,000 three ways.
  const scholarshipPool = perStudent.reduce((a, s) => a + s.scholarship, 0);
  const cassiusPostAid = cassius.tuition - cassius.nbcaAid;
  const cassiusSoloBalance = Math.max(0, cassiusPostAid - scholarshipPool);

  return (
    <div className="space-y-6">
      {/* The decision */}
      <section className="bg-white rounded-xl shadow-md border-2 border-tefa-gold/50 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Scale size={20} /> The one decision that matters: by June 30
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          TEFA almost certainly won't fund us this school year (see below), so the real choice is whether to
          commit to NBCA and pay tuition out of pocket. June 30 is the last day to back out cheaply.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-tefa-green/30 bg-tefa-green/5 p-4">
            <div className="font-bold text-tefa-green mb-1">Withdraw by June 30</div>
            <p className="text-tefa-body/70 text-xs">
              Walk away losing only the $690 enrollment fee. No tuition owed.
            </p>
          </div>
          <div className="rounded-lg border border-tefa-red/30 bg-tefa-red/5 p-4">
            <div className="font-bold text-tefa-red mb-1">Commit past June 30</div>
            <p className="text-tefa-body/70 text-xs">
              Tuition is owed and penalties bind: 10% of tuition owed ({usd2(WITHDRAWAL_PENALTY.july)}) in July, 20% ({usd2(WITHDRAWAL_PENALTY.august)}) in August.
            </p>
          </div>
        </div>
      </section>

      {/* Split-enrollment question */}
      <section className="bg-white rounded-xl shadow-md border-2 border-tefa-sky/60 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Users size={20} /> Open question: all three at NBCA, or just Cassius?
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          Nanette confirmed we can put the <strong>full {usd(scholarshipPool)} scholarship behind one child</strong>{' '}
          instead of splitting it {usd(scholarshipPool / 3)} three ways. So one option is to send{' '}
          <strong>Cassius</strong> to NBCA with the entire scholarship and keep <strong>Dorothy</strong> and{' '}
          <strong>Sebastian</strong> at the School of Science and Technology. The money case is strong — it more
          than covers his tuition — but it means a two-school morning, and the drop-off and pick-up logistics
          of running two campuses are the real sticking point. Worth settling{' '}
          <strong>by the end of June</strong>, alongside the withdrawal decision.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-tefa-navy/20 bg-tefa-light p-4">
            <div className="font-bold text-tefa-navy mb-1">All three at NBCA</div>
            <p className="text-tefa-body/70 text-xs">
              Balance of {usd2(balanceDue)} with the {usd(scholarshipPool)} split {usd(scholarshipPool / 3)} per
              child — but one school run, everyone on the same schedule.
            </p>
          </div>
          <div className="rounded-lg border border-tefa-navy/20 bg-tefa-light p-4">
            <div className="font-bold text-tefa-navy mb-1">Just Cassius at NBCA</div>
            <p className="text-tefa-body/70 text-xs">
              The full {usd(scholarshipPool)} covers his {usd(cassiusPostAid)} post-aid tuition, so his balance is
              essentially <strong>{usd2(cassiusSoloBalance)}</strong> — but it adds a second daily drive, and
              Dorothy and Sebastian stay at the School of Science and Technology.
            </p>
          </div>
        </div>
        <p className="text-xs text-tefa-body/50 mt-3">
          Reply to Nanette with how we want the {usd(scholarshipPool)} applied. Note that keeping Dorothy and
          Sebastian out this year means their NBCA aid doesn't carry over — worth confirming whether comparable
          awards would be available if they enroll in a later year.
        </p>
      </section>

      {/* What we owe */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-3">
          <DollarSign size={20} /> What we owe right now
        </h2>
        <div className="flex items-end gap-3 mb-4">
          <div className="text-4xl font-bold text-tefa-navy">{usd2(balanceDue)}</div>
          <div className="text-sm text-tefa-body/60 pb-1">for all three kids, after aid &amp; scholarship</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {perStudent.map((s) => (
            <div key={s.name} className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
              <div className="font-bold text-tefa-navy text-sm">{s.name}</div>
              <div className="text-[11px] text-tefa-body/50">{s.grade}</div>
              <div className="text-xl font-bold text-tefa-navy mt-1">{usd2(s.balance)}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setTab('money')}
          className="mt-4 text-sm font-bold text-tefa-navy underline decoration-tefa-navy/40 hover:text-tefa-green"
        >
          See the full breakdown &amp; payment schedule →
        </button>
      </section>

      {/* Next steps */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-3">
          <CheckCircle size={20} /> What to do next
        </h2>
        <ul className="space-y-3">
          {actions.map((a) => (
            <li key={a.text} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wide bg-tefa-navy/10 text-tefa-navy rounded px-2 py-1 w-28 text-center">
                {a.date}
              </span>
              <span className="text-sm text-tefa-body/80">{a.text}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setTab('timeline')}
          className="mt-4 text-sm font-bold text-tefa-navy underline decoration-tefa-navy/40 hover:text-tefa-green"
        >
          See the full timeline →
        </button>
      </section>

      {/* TEFA outlook — the whole modeling story, in one honest card */}
      <section className="bg-amber-50 rounded-xl shadow-md border border-amber-300 p-6">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-2">
          <AlertCircle size={20} /> TEFA outlook: plan for no voucher this year
        </h2>
        <p className="text-sm text-amber-900/90 mb-3">
          All three kids are <strong>{TEFA.tier}</strong> and <strong>waitlisted</strong> in band{' '}
          <strong>{TEFA.band}</strong> (texted to us {TEFA.notifiedOn}). Funding is awarded strictly in
          tier order, and as of the latest Comptroller numbers the cascade is still clearing Tier 2 — it has
          not reached Tier 3 at all.
        </p>
        <p className="text-sm text-amber-900/90">
          A late-summer cascade <em>could</em> reach our band, but the biggest opt-out event isn't until{' '}
          <strong>July 15 — after</strong> the June 30 penalty-free withdrawal deadline. So treat TEFA as a
          possible bonus, never as money you're counting on. <strong>Budget for the full balance above.</strong>
        </p>
        <button
          onClick={() => setTab('tefa')}
          className="mt-3 text-sm font-bold text-amber-800 underline decoration-amber-800/40 hover:text-tefa-navy"
        >
          See the live opt-out trajectory &amp; projections →
        </button>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MONEY — the breakdown and the payment schedule
// ---------------------------------------------------------------------------
const MoneyView = ({ tuition, nbcaAid, scholarship, balanceDue, perStudent, schedule }) => {
  const lines = [
    { label: 'Tuition (3 kids)', amount: tuition, sign: '+' },
    { label: 'NBCA financial aid', amount: -nbcaAid, sign: '−' },
    { label: 'Sibling discount', amount: -SIBLING_DISCOUNT, sign: '−' },
    { label: 'NBCA scholarship', amount: -scholarship, sign: '−' },
  ];

  return (
    <div className="space-y-6">
      {/* Breakdown */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-4">
          <DollarSign size={20} /> How the balance is built
        </h2>
        <div className="divide-y divide-gray-100">
          {lines.map((l) => (
            <div key={l.label} className="flex justify-between py-2 text-sm">
              <span className="text-tefa-body/70">{l.label}</span>
              <span className={`font-mono font-bold ${l.amount < 0 ? 'text-tefa-green' : 'text-tefa-navy'}`}>
                {l.amount < 0 ? `−${usd2(Math.abs(l.amount))}` : usd2(l.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 text-base font-bold">
            <span className="text-tefa-navy">Balance due (FACTS)</span>
            <span className="font-mono text-tefa-navy">{usd2(balanceDue)}</span>
          </div>
        </div>
        <p className="text-xs text-tefa-body/50 mt-2">
          TEFA is not included — it's waitlisted and not expected this year. If a voucher ever arrives it would
          credit against this balance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {perStudent.map((s) => (
            <div key={s.name} className="rounded-lg bg-tefa-light border border-gray-200 p-3">
              <div className="font-bold text-tefa-navy text-sm">{s.name}</div>
              <div className="text-[11px] text-tefa-body/50 mb-1">{s.grade}</div>
              <div className="text-[11px] text-tefa-body/60 font-mono">
                {usd(s.tuition)} − {usd(s.nbcaAid)} aid
                {s.discount ? ` − ${usd2(s.discount)}` : ''} − {usd(s.scholarship)} schol.
              </div>
              <div className="text-lg font-bold text-tefa-navy mt-1">{usd2(s.balance)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment plan */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Clock size={20} /> Payment schedule
        </h2>
        <p className="text-sm text-tefa-body/70 mb-4">{PAYMENT_PLAN.note}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-tefa-body/50 bg-tefa-light">
              <tr>
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-right px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedule.map((p) => (
                <tr key={p.number}>
                  <td className="px-4 py-2 font-mono text-tefa-body/50">{p.number}</td>
                  <td className="px-4 py-2 font-medium text-tefa-navy">{p.date}</td>
                  <td className="px-4 py-2 text-right font-mono">{usd2(p.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-tefa-light/60">
                <td className="px-4 py-2" colSpan={2}>Total</td>
                <td className="px-4 py-2 text-right font-mono">{usd2(balanceDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-tefa-body/50 mt-3">
          Pay by checking/savings (ACH) to avoid the ~$92/draft card fee. The $690 enrollment fee is already paid
          and is non-refundable.
        </p>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// TIMELINE — the dated steps, marked do / decide / pay / info
// ---------------------------------------------------------------------------
const KIND_STYLE = {
  do: { dot: 'bg-tefa-green', tag: 'bg-tefa-green/10 text-tefa-green', label: 'Do' },
  wait: { dot: 'bg-tefa-gold', tag: 'bg-tefa-gold/20 text-tefa-gold', label: 'Wait' },
  decide: { dot: 'bg-tefa-red', tag: 'bg-tefa-red/10 text-tefa-red', label: 'Decide' },
  pay: { dot: 'bg-tefa-navy', tag: 'bg-tefa-navy/10 text-tefa-navy', label: 'Pay' },
  info: { dot: 'bg-gray-300', tag: 'bg-gray-100 text-tefa-body/60', label: 'Info' },
};

const TimelineView = () => {
  const nextIdx = TIMELINE.findIndex((e) => e.iso >= TODAY);

  return (
    <div>
      <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-6">
        <Calendar size={20} /> What happens, and when
      </h2>
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {TIMELINE.map((e, idx) => {
          const past = e.iso < TODAY;
          const isNext = idx === nextIdx;
          const style = KIND_STYLE[e.kind];
          return (
            <div key={e.title} className={`relative pl-6 ${past ? 'opacity-50' : ''}`}>
              <div
                className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                  isNext ? 'bg-tefa-navy ring-4 ring-tefa-sky/40' : style.dot
                }`}
              />
              <div
                className={`bg-white p-4 rounded-lg shadow-sm border ${
                  isNext ? 'border-tefa-navy/30 ring-1 ring-tefa-sky/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isNext && (
                    <span className="text-[10px] font-bold bg-tefa-green text-white px-2 py-0.5 rounded uppercase tracking-wide">
                      Up next
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${style.tag}`}>
                    {style.label}
                  </span>
                  <span className="text-xs font-bold text-tefa-body/50">{e.date}</span>
                </div>
                <h3 className="font-bold text-tefa-navy">{e.title}</h3>
                <p className="text-sm text-tefa-body/70 mt-1">{e.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-tefa-body/50 flex items-center gap-1">
        <ExternalLink size={12} /> TEFA status is checked at{' '}
        <a
          href="https://withodyssey.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-tefa-green"
        >
          withodyssey.com
        </a>
        .
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Monte Carlo simulator — distribution of terminal-frontier outcomes.
// Reuses the model constants above (ACTIVE_AWARDS, seatsPerDeparture,
// RESERVE_SEATS, T3_START, BAND_LO/HI, YOUR_POS). Churn and opt-out share are
// drawn SEPARATELY each trial so attrition volume and its mix don't move in
// lockstep. PERT draws via a Beta (two Gamma samples, Marsaglia–Tsang).
// ---------------------------------------------------------------------------
const mcGaussian = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const mcGamma = (k) => {
  if (k < 1) return mcGamma(1 + k) * Math.pow(Math.random(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, vv;
    do { x = mcGaussian(); vv = 1 + c * x; } while (vv <= 0);
    vv = vv * vv * vv;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * vv;
    if (Math.log(u) < 0.5 * x * x + d * (1 - vv + Math.log(vv))) return d * vv;
  }
};
const mcBeta = (a, b) => { const x = mcGamma(a), y = mcGamma(b); return x / (x + y); };
const mcPert = (min, mode, max, lambda = 4) => {
  if (max <= min) return min;
  const a = 1 + (lambda * (mode - min)) / (max - min);
  const b = 1 + (lambda * (max - mode)) / (max - min);
  return min + mcBeta(a, b) * (max - min);
};

const CONSERVATIVE_CHURN = 40; // "likely" is pinned here — central share of the 34k remainder moved aside (opt-out + $2,000 downgrade)

const TefaMonteCarlo = ({ churnMin, setChurnMin, churnMax, setChurnMax, k, cascadeSeries, frontierYMax, todayTs }) => {
  const churnMode = CONSERVATIVE_CHURN; // fixed, not draggable
  const [optMode, setOptMode] = useState(23); // opt-out share of those leaving (observed 2.8/9.3 ≈ 23%); rest drop to $2,000
  const [holdFlat, setHoldFlat] = useState(true);
  const [trials, setTrials] = useState(10000);
  const [seed, setSeed] = useState(0); // bump to re-run with fresh draws
  const [view, setView] = useState('lines'); // 'lines' (averages) | 'dist' (full simulation)

  const r = useMemo(() => {
    const arr = new Float64Array(trials);
    for (let i = 0; i < trials; i++) {
      const moved = mcPert(churnMin, churnMode, churnMax) / 100;       // share of the 34k remainder moved aside
      const optShare = mcPert(Math.max(0, optMode - 12), optMode, Math.min(100, optMode + 18)) / 100;
      // holdFlat pins seats/departure at the observed downgrade-heavy mix (~1.16); otherwise it
      // varies with the sampled opt-out share. Both exit routes (opt-out / $2,000) are in seatsPerDeparture.
      const spd = holdFlat || moved === 0 ? seatsPerDeparture(OBS_OPTOUT_RATE, OBS_DOWNGRADE_RATE) : seatsPerDeparture(optShare, 1 - optShare);
      arr[i] = FRONTIER_NOW + moved * REMAINDER * spd + RESERVE_SEATS; // FUNDED frontier reached (RESERVE_SEATS now 0 — reserve spent Jul 8, already in FRONTIER_NOW)
    }
    const sorted = Array.from(arr).sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(p * (sorted.length - 1))];
    const frac = (thr) => { let n = 0; for (const v of arr) if (v >= thr) n++; return n / trials; };
    const lo = 10000, hi = 50000, bins = 52, w = (hi - lo) / bins;
    const hist = new Array(bins).fill(0);
    for (const v of arr) {
      let b = Math.floor((v - lo) / w);
      if (b < 0) b = 0; if (b >= bins) b = bins - 1;
      hist[b]++;
    }
    return {
      p05: pct(0.05), p50: pct(0.5), p95: pct(0.95),
      pBand: frac(BAND_LO), pTier3: frac(T3_START), pHouse: frac(YOUR_POS.lo),
      hist, lo, hi, w, maxBin: Math.max(...hist),
    };
  }, [churnMin, churnMode, churnMax, optMode, holdFlat, trials, seed]);

  const fmt = (n) => Math.round(n).toLocaleString();
  const pctFmt = (p) => (p * 100).toFixed(1) + '%';

  const W = 760, H = 280, padL = 8, padR = 8, padT = 22, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xOf = (val) => padL + ((val - r.lo) / (r.hi - r.lo)) * plotW;
  const barW = plotW / r.hist.length;

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
        <Activity size={20} /> How far the line reaches — and how likely
      </h2>
      <p className="text-sm text-tefa-body/80 mb-4">
        One model, two views of the same thing. <strong>Lines</strong> is the average path at each level — how much of the ~{k.remainder.toLocaleString()}{' '}
        remainder (awarded but not funded Jul 1) gets moved aside (the middle line is our likely 40%). <strong>Distribution</strong> runs that model{' '}
        <strong>{trials.toLocaleString()} times</strong> and shows where the cascade landed across all of them — <em>the lines are essentially the averages of that cloud</em>.
        Drag the dials and <strong>both</strong> update. Our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()}; Tier 3 opens at {T3_START.toLocaleString()}.
      </p>

      {/* context KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Funded So Far</div>
          <div className="font-bold text-tefa-navy text-lg">{k.frontierNow.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">all Tier 2 · official as of {fmtChartDate(Date.parse(k.asOf))}</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Tier 2 Still Ahead</div>
          <div className="font-bold text-tefa-gold text-lg">{k.t2Remaining.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">must clear before any Tier 3 offer</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-navy/20 p-3 text-center">
          <div className="text-xs text-tefa-navy/70 font-medium">Likely FUNDED</div>
          <div className="font-bold text-tefa-navy text-lg">~{k.realisticTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">~{k.realisticChurnPct}% of remainder leaves · into the band, short of our 45k</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
          <div className="text-xs text-tefa-red/70 font-medium">High FUNDED</div>
          <div className="font-bold text-tefa-red text-lg">~{k.aggressiveTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">~{k.aggressiveChurnPct}% of remainder leaves · into the band, still short of 45k</div>
        </div>
      </div>

      {/* probability headline — straight from the simulation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4">
        <div className="rounded-lg bg-tefa-light border border-tefa-navy/30 p-3 text-center ring-1 ring-tefa-gold/40">
          <div className="text-xs text-tefa-navy/70 font-medium">P(reach our band ≥ {BAND_LO.toLocaleString()})</div>
          <div className="font-bold text-tefa-gold text-2xl">{pctFmt(r.pBand)}</div>
          <div className="text-[10px] text-tefa-body/40">odds the cascade enters Tier 3 territory at all</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Median frontier</div>
          <div className="font-bold text-tefa-navy text-2xl">{fmt(r.p50)}</div>
          <div className="text-[10px] text-tefa-body/40">90% range: {fmt(r.p05)} – {fmt(r.p95)}</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
          <div className="text-xs text-tefa-red/70 font-medium">P(reach us ~{YOUR_POS.lo.toLocaleString()})</div>
          <div className="font-bold text-tefa-red text-2xl">{pctFmt(r.pHouse)}</div>
          <div className="text-[10px] text-tefa-body/40">our actual original lottery position</div>
        </div>
      </div>

      {/* view toggle — same model, flip between the average lines and the full cloud */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-tefa-light p-0.5 text-xs font-semibold">
          <button type="button" onClick={() => setView('lines')}
            className={`px-3 py-1.5 rounded-md transition ${view === 'lines' ? 'bg-tefa-navy text-white' : 'text-tefa-body/70 hover:text-tefa-navy'}`}>
            Lines (averages)
          </button>
          <button type="button" onClick={() => setView('dist')}
            className={`px-3 py-1.5 rounded-md transition ${view === 'dist' ? 'bg-tefa-navy text-white' : 'text-tefa-body/70 hover:text-tefa-navy'}`}>
            Distribution (all runs)
          </button>
        </div>
        <span className="text-[11px] text-tefa-body/45">
          {view === 'lines' ? 'Average path by how much of the remainder leaves — drag the dials to reshape.' : `Where ${trials.toLocaleString()} runs landed — the lines are the averages of this.`}
        </span>
      </div>

      {/* the active view */}
      {view === 'lines' ? (
        <>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cascadeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="ts" scale="time" domain={['dataMin', 'dataMax']}
                       ticks={FRONTIER_TICKS} tickFormatter={fmtChartDate} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, frontierYMax]} tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }}
                       label={{ value: 'Waitlist position reached', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <ChartTooltip content={<FrontierTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x={Date.parse(FRONTIER_WINDOW.jul15)} stroke="#aa2142" strokeWidth={1.5}
                    label={{ value: 'Jul 15 deadline', position: 'insideTop', fontSize: 9, fontWeight: 700, fill: '#aa2142' }} />
                <ReferenceLine x={todayTs} stroke="#94a3b8" strokeDasharray="2 2"
                    label={{ value: 'Today', fontSize: 10, fill: '#64748b', position: 'insideBottomLeft' }} />
                <ReferenceArea y1={YOUR_POS.lo} y2={YOUR_POS.hi} fill="#aa2142" fillOpacity={0.10}
                    label={{ value: `Your original position (${(YOUR_POS.lo/1000)}–${(YOUR_POS.hi/1000)}k)`, position: 'insideTopRight', fontSize: 9, fontWeight: 700, fill: '#aa2142' }} />
                <ReferenceLine y={T3_START} stroke="#b08a3e" strokeDasharray="8 4"
                    label={{ value: `Tier 3 starts — ${T3_START.toLocaleString()}`, position: 'insideBottomLeft', fontSize: 9, fontWeight: 600, fill: '#b08a3e' }} />
                <ReferenceLine y={BAND_LO} stroke="#aa2142" strokeDasharray="8 4"
                    label={{ value: `T3 Middle band starts — ${BAND_LO.toLocaleString()}`, position: 'insideTopLeft', fontSize: 9, fontWeight: 600, fill: '#aa2142' }} />
                <ReferenceLine y={BAND_HI} stroke="#aa2142" strokeDasharray="8 4"
                    label={{ value: `T3 Middle band ends — ${BAND_HI.toLocaleString()}`, position: 'insideTopLeft', fontSize: 9, fontWeight: 600, fill: '#aa2142' }} />
                <Line type="monotone" dataKey="observedLine" name="Funded so far (published)" stroke="#202562" strokeWidth={2.5} dot={false} legendType="none" />
                <Line type="monotone" dataKey="research" name={`Low — ${k.researchChurnPct}% of the 34k remainder leaves`} stroke="#2e7d5b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realistic" name={`Likely — ${k.realisticChurnPct}% of the remainder leaves`} stroke="#202562" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="aggressive" name={`High — ${k.aggressiveChurnPct}% of the remainder leaves`} stroke="#aa2142" strokeWidth={2.5} dot={false} />
                <Scatter dataKey="observed" name="Published data" fill="#202562" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-tefa-body/45 mt-1">
            Each line is a share of the ~{REMAINDER.toLocaleString()} awarded families who hadn't activated by Jul 1 (107k active − 73k funded)
            being moved aside — opting out or dropping to the $2,000 homeschool tier. When a line crosses a band threshold, the cascade has reached that band.
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-tefa-light/40 p-3">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Distribution of simulated frontier outcomes">
            {r.hist.map((c, i) => {
              const binStart = r.lo + i * r.w;
              const h = r.maxBin ? (c / r.maxBin) * plotH : 0;
              const inBand = binStart >= BAND_LO && binStart < BAND_HI;
              const belowTier3 = binStart < T3_START;
              const fill = inBand ? '#b08a3e' : belowTier3 ? '#cbd5e1' : '#202562';
              return <rect key={i} x={padL + i * barW + 0.5} y={padT + plotH - h} width={Math.max(barW - 1, 0.5)} height={h} fill={fill} rx="1" />;
            })}
            {[
              { v: T3_START, label: `Tier 3 · ${(T3_START / 1000).toFixed(0)}k`, color: '#b08a3e' },
              { v: BAND_LO, label: `Band · ${(BAND_LO / 1000).toFixed(0)}k`, color: '#aa2142' },
              { v: YOUR_POS.lo, label: `Us · ${(YOUR_POS.lo / 1000).toFixed(0)}k`, color: '#aa2142' },
            ].map((ln) => (
              <g key={ln.v}>
                <line x1={xOf(ln.v)} y1={padT} x2={xOf(ln.v)} y2={padT + plotH} stroke={ln.color} strokeWidth="1.3" strokeDasharray="4 3" />
                <text x={xOf(ln.v)} y={padT - 7} fill={ln.color} fontSize="10" textAnchor="middle" fontWeight="700">{ln.label}</text>
              </g>
            ))}
            {[10000, 20000, 30000, 40000, 50000].map((t) => (
              <text key={t} x={xOf(t)} y={H - 22} fill="#94a3b8" fontSize="10" textAnchor="middle">{t / 1000}k</text>
            ))}
            <text x={W / 2} y={H - 6} fill="#64748b" fontSize="11" textAnchor="middle">Terminal cascade frontier (waitlist position reached)</text>
          </svg>
          <div className="flex flex-wrap gap-4 text-[11px] text-tefa-body/60 mt-1 px-1">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#cbd5e1' }} />Below Tier 3 (&lt;{T3_START.toLocaleString()})</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#202562' }} />Tier 3, below our band</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#b08a3e' }} />In our band (≥{BAND_LO.toLocaleString()})</span>
          </div>
        </div>
      )}

      <div className="mt-5" />

      {/* how to read the two inputs */}
      <div className="rounded-lg border border-tefa-navy/15 bg-tefa-light/60 p-4 mb-5 text-xs text-tefa-body/80 space-y-2.5">
        <div className="font-semibold text-tefa-navy text-[13px]">How to read the two dials</div>
        <p>
          <strong className="text-tefa-navy">Share of remainder moved aside (PERT min / likely / max)</strong> — your three-point guess for{' '}
          <em>what % of the ~{k.remainder.toLocaleString()} awarded-but-not-activated families leave</em> (opt out or drop to $2,000) rather than
          confirm a seat by Jul 15/31. It sets <strong>how many seats free up</strong>. You give three numbers and the simulator draws thousands of
          values shaped like a hill peaked at <em>likely</em>: most runs land near it, fewer trail out toward min and max.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-tefa-body/70">
          <li><strong>likely</strong> is <span className="font-mono text-tefa-gold">{CONSERVATIVE_CHURN}%</span> — pinned to our central read and <strong>not draggable</strong>; it's the anchor everything bends around.</li>
          <li><strong>min</strong> = best case (30% — most of the remainder still confirms). <strong>max</strong> = worst case (50% — half the remainder fails to confirm). Drag to set <em>how wide</em> the uncertainty is around the anchor.</li>
        </ul>
        <p>
          <strong className="text-tefa-navy">Opt-out share of those leaving</strong> — a <em>different</em> thing: of the families who leave,
          what fraction <strong>quit the program entirely</strong> (freeing the full $10,474) versus <strong>drop to the $2,000
          homeschool tier</strong> (freeing only $8,474). It doesn't change <em>how many</em> leave — it changes <strong>how far each
          departure pushes the frontier</strong>, because opt-outs free more dollars per seat.
        </p>
      </div>

      {/* controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="block text-xs font-semibold text-tefa-body/80 mb-2">
            Share of remainder leaving — min / <span className="text-tefa-body/50">likely (fixed)</span> / max{' '}
            <span className="font-mono text-tefa-gold ml-1">{churnMin} / {churnMode} / {churnMax}%</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">min (best)</div>
              <input type="range" min="15" max="39" value={churnMin} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMin(Math.min(+e.target.value, churnMode - 1))} />
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-gold/80 mb-1">likely · locked</div>
              <div className="flex items-center justify-center h-[18px] font-mono text-sm font-bold text-tefa-gold">{churnMode}%</div>
              <div className="text-[9px] text-tefa-body/40">central</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">max (worst)</div>
              <input type="range" min="41" max="75" value={churnMax} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMax(Math.max(+e.target.value, churnMode + 1))} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-tefa-body/80 mb-2">
            Opt-out share of churn (likely) <span className="font-mono text-tefa-gold ml-1">{optMode}%</span>
          </label>
          <input type="range" min="5" max="80" value={optMode} className="w-full accent-tefa-navy"
            onChange={(e) => setOptMode(+e.target.value)} />
          <p className="text-[11px] text-tefa-body/45 mt-1.5">The rest are $2,000 homeschool downgrades. Drawn in a ±range around this. More opt-outs free more dollars per departure.</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-tefa-body/80 cursor-pointer">
            <input type="checkbox" checked={holdFlat} className="w-4 h-4 accent-tefa-navy"
              onChange={(e) => setHoldFlat(e.target.checked)} />
            Hold seats-per-departure flat at 1.0 (friction discount)
          </label>
          <p className="text-[11px] text-tefa-body/45 mt-1.5">
            On = the reviewers' fix: ignore the mix-driven lift, assume admin friction persists. Off = let the dollar mechanism scale seats up to
            ~1.06 in opt-out-heavy draws. (Barely moves the odds either way.)
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <label className="block text-xs font-semibold text-tefa-body/80">
            Trials <span className="font-mono text-tefa-gold ml-1">{trials.toLocaleString()}</span>
          </label>
          <input type="range" min="1000" max="20000" step="1000" value={trials} className="w-full accent-tefa-navy"
            onChange={(e) => setTrials(+e.target.value)} />
          <button onClick={() => setSeed((s) => s + 1)}
            className="self-start bg-tefa-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-tefa-navy/90 transition">
            Re-run simulation
          </button>
        </div>
      </div>

      <p className="text-[10px] text-tefa-body/45 mt-4">
        Defaults reproduce the model: moved-aside share PERT(30 / 40 / 50) of the ~{k.remainder.toLocaleString()} remainder, opt-out share ~23%,
        freed-ratio held at the observed ~1.16 — the median lands near the central point estimate (~{fmt(r.p50)}). The share of runs clearing{' '}
        {BAND_LO.toLocaleString()} is the probability the cascade enters our band at all. Drag the Jul-15 assumptions to stress-test. A planning tool, not a forecast.
      </p>
    </section>
  );
};

// ---------------------------------------------------------------------------
// TEFA — likelihood the cascade reaches each band, and two projections
// ---------------------------------------------------------------------------
const TefaView = () => {
  // min / max are shared with the simulator below; "likely" is fixed at the central.
  // The three chart lines (low / likely / high) are the share of the 34k remainder that's
  // moved aside — min / likely / max — so dragging the sliders reshapes the chart live.
  const [churnMin, setChurnMin] = useState(30); // low: 30% of the remainder leaves
  const [churnMax, setChurnMax] = useState(50); // high: 50% of the remainder leaves
  const { series: cascadeSeries, kpis: k } = useMemo(
    () => buildCascadeProjection({
      research: { ...RESEARCH, share: churnMin / 100 },
      realistic: { ...REALISTIC, share: CONSERVATIVE_CHURN / 100 },
      aggressive: { ...AGGRESSIVE, share: churnMax / 100 },
    }),
    [churnMin, churnMax]
  );
  const frontierYMax = useMemo(
    () => Math.ceil(Math.max(BAND_HI, ...cascadeSeries.map((row) => Math.max(row.realistic ?? 0, row.aggressive ?? 0))) * 1.05 / 1000) * 1000,
    [cascadeSeries]
  );
  const todayTs = Math.min(
    Math.max(Date.parse(FRONTIER_WINDOW.today), Date.parse(FRONTIER_WINDOW.chartStart)),
    Date.parse(FRONTIER_WINDOW.end)
  );

  return (
    <div className="space-y-6">
      {/* The plain-language answer: how likely is each band to be reached? */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Layers size={20} /> Will an offer reach us? Likelihood by band
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          Awards cascade down <strong>one</strong> tier-ordered waitlist. Tier 3 doesn't start until the{' '}
          <strong>{k.t2Remaining.toLocaleString()}</strong> Tier 2 families still ahead of us are cleared. Here's
          how likely the cascade is to reach each band this year — our family sits in{' '}
          <strong>{TEFA.band}</strong>.
        </p>
        <div className="space-y-2">
          {BAND_OUTLOOK.map((b) => {
            const s = TONE_STYLE[b.tone];
            return (
              <div
                key={b.band}
                className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${
                  b.ourBand ? 'border-tefa-navy/40 bg-tefa-light ring-1 ring-tefa-sky/40' : 'border-gray-200'
                }`}
              >
                <div className="sm:w-44 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className="font-bold text-tefa-navy text-sm">{b.band}</span>
                  </div>
                  <div className="text-[11px] text-tefa-body/50 ml-4.5 pl-0.5">
                    {b.ourBand ? <strong className="text-tefa-navy">{b.scope}</strong> : b.scope}
                  </div>
                </div>
                <div className="sm:w-40 shrink-0">
                  <span className={`inline-block text-[11px] font-bold px-2 py-1 rounded ${s.chip}`}>{b.call}</span>
                </div>
                <p className="text-xs text-tefa-body/70 flex-1">{b.note}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-tefa-body/50 mt-3">
          <strong>Bottom line:</strong> of the ~107,000 active awards, <strong>~{k.funded.toLocaleString()} were funded on Jul 1</strong>, and on Jul 8
          the Comptroller spent nearly all of the appeals reserve to award <strong>~{RESERVE_AWARDED_JUL8.toLocaleString()} more</strong> — moving the frontier to <strong>{k.frontierNow.toLocaleString()}</strong>.
          With the reserve now gone, the only fuel left is the <strong>~{k.remainder.toLocaleString()} remainder</strong> that hadn't activated, leaving by opt-out or the $2,000 homeschool drop.
          Realistically 30–50% of that remainder is moved aside, funding the cascade to <strong>~{k.researchTerminal.toLocaleString()}–{k.aggressiveTerminal.toLocaleString()}</strong>{' '}
          (likely ~{k.realisticTerminal.toLocaleString()}). That now crosses <strong>into</strong> the start of our band in the likely and high cases, but never reaches our actual
          45–50k position. <strong>Plan on no voucher this year</strong>; it would take essentially the entire remainder collapsing to get money to our seat.
        </p>
      </section>

      {/* Combined chart + simulator — one card; toggle between the average lines and the full distribution. */}
      <TefaMonteCarlo churnMin={churnMin} setChurnMin={setChurnMin} churnMax={churnMax} setChurnMax={setChurnMax}
        k={k} cascadeSeries={cascadeSeries} frontierYMax={frontierYMax} todayTs={todayTs} />

      {/* Explanatory notes + projection table for the chart above. */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> The scenarios behind the model, and the dates
        </h2>
        <p className="text-[11px] text-tefa-body/55 mb-3">
          <strong>As of Jul 8, 2026.</strong> The Jun 23 Comptroller update put the frontier at <strong>12,916</strong> —
          nearly 110,000 awarded, ~{JUNE23_CASCADE.optOuts.toLocaleString()} opt-outs, ~107,000 active. The Jun 30 release pinned the activation:{' '}
          <strong>~{k.funded.toLocaleString()} accounts funded Jul 1</strong> (opted in + confirmed), leaving a <strong>~{k.remainder.toLocaleString()} remainder</strong> that was awarded but hadn't activated.
          Then on <strong>Jul 8</strong> the Comptroller funded <strong>~{RESERVE_AWARDED_JUL8.toLocaleString()} more</strong> off the appeals reserve as the appeal window closed — spending nearly all of it — lifting the frontier to <strong>{k.frontierNow.toLocaleString()}</strong> (still Tier 2). The reserve is now spent; that ~{k.remainder.toLocaleString()} remainder is the only pool left that can still free a seat.
        </p>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 space-y-1">
          <div><strong>One unknown, a 30–50% band.</strong> The frontier (= {T2_AT_LOTTERY.toLocaleString()} at-lottery − Tier 2 still queued) has reached {k.frontierNow.toLocaleString()}, with only ~{k.t2Remaining.toLocaleString()} Tier 2 families still ahead. The appeals reserve has already fired (Jul 8), so future advance = how much of the ~{k.remainder.toLocaleString()} remainder is moved aside × seats freed per departure (no reserve add-on left). Both exit routes count: a full <strong>opt-out</strong> frees the whole award (~$10,474), a drop to the <strong>$2,000 homeschool</strong> tier frees only the difference (~$8,474) — held at the observed ~23/77 mix → freed-ratio {k.freedRatio} seats/departure. <strong>Low ~{k.researchChurnPct}%</strong> → ~<strong>{k.researchTerminal.toLocaleString()}</strong>; <strong>likely ~{k.realisticChurnPct}%</strong> → ~<strong>{k.realisticTerminal.toLocaleString()}</strong>; <strong>high ~{k.aggressiveChurnPct}%</strong> → ~<strong>{k.aggressiveTerminal.toLocaleString()}</strong>. The likely and high cases now cross our band start ({BAND_LO.toLocaleString()}); none reach our 45k.</div>
          <div><strong>Watch — the Jul 15 deadline.</strong> Families awarded before Jun 22 who don't select a school by Jul 15 (confirmed by Jul 31) are "moved aside to allow other families to come off the waitlist" (Travis Pillow). With the appeals reserve already spent (Jul 8), that shakeout of the remainder is now the <em>only</em> event left that could push the cascade toward our band — and it lands <em>after</em> the Jun 30 penalty-free withdrawal deadline.</div>
        </div>

        {/* Frontier position reached by each scenario, at the key cascade dates. */}
        <div className="mt-4 overflow-x-auto">
          <div className="text-xs font-bold text-tefa-navy mb-2">Projected waitlist position reached, by scenario &amp; date</div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-tefa-body/60 border-b border-gray-200">
                <th className="text-left font-semibold py-2 pr-3">Scenario</th>
                {k.projectionTable.dates.map((d) => (
                  <th key={d} className="text-right font-semibold py-2 px-2 tabular-nums">{fmtChartDate(Date.parse(d))}</th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[
                { key: 'aggressive', label: `High — ${k.aggressiveChurnPct}% of remainder`, color: '#aa2142', vals: k.projectionTable.aggressive },
                { key: 'conservative', label: `Likely — ${k.realisticChurnPct}% of remainder`, color: '#202562', vals: k.projectionTable.conservative },
                { key: 'research', label: `Low — ${k.researchChurnPct}% of remainder`, color: '#2e7d5b', vals: k.projectionTable.research },
              ].map((row) => (
                <tr key={row.key} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap" style={{ color: row.color }}>{row.label}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className="text-right py-2 px-2 text-tefa-body">{v.toLocaleString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-tefa-body/45 mt-2">
            Each row is the global waitlist position real money reaches if that share of the ~{REMAINDER.toLocaleString()} remainder is moved aside.
            Tier 3 starts at {T3_START.toLocaleString()}; our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()}. All share the
            published track through Jun 23 ({k.frontierNow.toLocaleString()}); they differ only in how much of the remainder leaves after.
          </p>
        </div>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// NBCA PREP — everything we need to know, do, and remember for the 2026–27
// school year at New Braunfels Christian Academy. Data mirrors nbca-prep.md.
// ---------------------------------------------------------------------------

// The must-do items with hard consequences if missed, most urgent first.
// `links` are verified against nbcatx.org/page/parent-resources (Jul 2026).
const NBCA_ACTIONS = [
  {
    title: 'OTC medication permission (Tylenol / Ibuprofen / Benadryl)',
    due: 'Before school starts',
    who: 'Any child needing OTC meds',
    detail:
      'This is a school-wide Jotform, not 4th-grade-only — complete it for any child the nurse may need to give Tylenol, Ibuprofen, or Benadryl to during the day. We flagged it for Sebastian, but do one per child as needed. Off-campus and prescription meds use separate forms (see Key links).',
    links: [{ label: 'Permission to Administer (Jotform)', url: 'https://form.jotform.com/251976016734058' }],
  },
  {
    title: 'Athletic paperwork — Cassius & Dorothy',
    due: 'Due Jul 31',
    who: 'Both athletes',
    detail:
      'Physicals and medical-history forms must be completed and uploaded to the Rank One portal before either can participate in sports. Download the Rank One app (iOS/Android) and subscribe to "Schedule Alerts." The Athletic Handbook has the full policy.',
    links: [
      { label: 'Rank One portal', url: 'https://nbca.store.rankone.com/' },
      { label: 'Athletic Handbook', url: 'https://docs.google.com/document/d/1rpI6cJBamE3AZuOGglpiffz3fI2JBXaMzKeFwSl5Fkg/edit' },
    ],
  },
  {
    title: 'Grandparent passes',
    due: 'Anytime',
    who: 'FACTS portal',
    detail:
      'Log in to FACTS (District Code: NBCA-TX) → "Family" tab → "Family Demographic Form." Verify or add grandparents’ names and addresses so they get free passes mailed for all NBCA sporting events.',
    links: [{ label: 'FACTS Family Portal', url: 'https://factsmgt.com/parent-log-in/' }],
  },
  {
    title: 'Hot lunch ordering (optional)',
    due: 'Daily, 9am–1pm',
    who: 'FACTS Parent Portal',
    detail:
      'Vendors: Chick-Fil-A, NB Tortilleria, Whataburger, Jersey Mike’s, Mattenga’s Pizza. Order via the FACTS Parent Portal; ordering closes daily between 9am and 1pm.',
    links: [{ label: 'Ordering & paying for lunch (PDF)', url: 'https://core-docs.s3.us-east-1.amazonaws.com/documents/asset/uploaded_file/902/New_Braunfels_Christian_Academy/5936517/Ordering_and_Paying_for_Lunch_25-26.pdf' }],
  },
];

// Verified official NBCA links, grouped for the "Key links & portals" card.
const NBCA_LINKS = [
  {
    group: 'Portals & hubs',
    links: [
      { label: 'Parent Resources hub', url: 'https://www.nbcatx.org/page/parent-resources' },
      { label: 'School calendar', url: 'https://www.nbcatx.org/page/calendar-events' },
      { label: 'FACTS Family Portal', url: 'https://factsmgt.com/parent-log-in/' },
      { label: 'Athletics overview', url: 'https://www.nbcatx.org/page/athletics-overview' },
    ],
  },
  {
    group: 'Health & medical forms',
    links: [
      { label: 'OTC meds — Permission to Administer (Jotform)', url: 'https://form.jotform.com/251976016734058' },
      { label: 'Elementary off-campus medication', url: 'https://5il.co/i8gg' },
      { label: 'Secondary off-campus medication', url: 'https://5il.co/i8gj' },
      { label: 'Prescription medication permission', url: 'https://5il.co/i8gl' },
      { label: 'Vaccine requirements (K–12)', url: 'https://5il.co/2tez3' },
      { label: 'Asthma action plan', url: 'https://5il.co/i8gk' },
      { label: 'Food allergy action plan', url: 'https://5il.co/i8gh' },
    ],
  },
  {
    group: 'Uniforms, spirit wear & volunteering',
    links: [
      { label: 'Global Schoolwear (uniforms & PE)', url: 'https://www.globalschoolwear.com/' },
      { label: 'PTO online store (spirit wear)', url: 'https://nbcapto.org/product/set-the-example-t-shirts/' },
      { label: 'NBCA Resale Facebook group', url: 'https://www.facebook.com/groups/900133394399967' },
      { label: 'Volunteer application', url: 'https://forms.gle/ZTV3kLtAhhTxUTaEA' },
      { label: 'Business Office FAQs', url: 'https://5il.co/3nawo' },
    ],
  },
];

const NBCA_CAMPUSES = [
  {
    name: 'Elementary Campus',
    who: 'Sebastian · 4th Grade',
    address: '995 Mission Hills Dr., New Braunfels, TX 78130',
    dropoff: '7:30 AM',
    pickup: '3:10 PM',
  },
  {
    name: 'Secondary Campus',
    who: 'Cassius · 9th · & Dorothy · 7th',
    address: '220 FM 1863, New Braunfels, TX 78132',
    dropoff: '7:30 AM (earlier if morning sports)',
    pickup: '3:45 PM (later if afternoon sports)',
  },
];

const NBCA_CONTACTS = [
  {
    role: 'Business Office — FACTS, tuition, lunch, extended care',
    name: 'Nanette Jones',
    phone: '830-629-3696',
    email: 'njones@nbcatx.org',
  },
  { role: 'Athletic Operations', name: 'Janey Polk', phone: null, email: 'jpolk@nbcatx.org' },
  { role: 'School Nurse', name: 'Keri Benson', phone: '830-629-6222', email: 'kbenson@nbcatx.org' },
];

const NBCA_KIDS = [
  {
    name: 'Cassius',
    grade: '9th Grade',
    accent: 'text-tefa-navy',
    // Per-child official links (verified Jul 2026). Secondary supply list is shared MS+HS.
    links: [
      { label: 'Secondary supply list', url: 'https://aptg.co/tCJ7SC' },
      { label: '9th & 9th Honors summer reading', url: 'https://aptg.co/y0zrrR' },
      { label: 'Secondary dress code', url: 'https://aptg.co/92BMKR' },
      { label: 'Report an absence', url: 'https://forms.gle/9X6MM7t3gq3Q3vRu8' },
    ],
    items: [
      {
        label: 'Summer strength & conditioning',
        text:
          'Mon–Thurs, 6:30–8:00 AM on the football field / weight room until Jul 23. Coach Hunter Harrison. Sign up via the RankOne link.',
        link: 'https://nbca.store.rankone.com/Camp/List?mc_cid=230ac33dbb&mc_eid=2b0df2e354',
        linkLabel: 'RankOne camp sign-up',
      },
      {
        label: 'TAPPS / TMS registration',
        text: 'Needs a profile in the TAPPS system to track eligibility. You’ll need his Student ID.',
      },
      {
        label: 'Fall Break athletics (Oct 12–23)',
        text:
          'The district does NOT pause. ALL high-school athletes must stay in town and attend practices and competitions during Fall Break.',
      },
      {
        label: 'Parent meetings',
        text: 'Cross Country: Aug 4 @ 5:30 PM (Secondary Gym) · Football: Aug 7 @ 8:00 PM (Wildcat Stadium home stands).',
      },
      {
        label: 'Student involvement',
        text: 'Eligible to apply/run for Student Council or audition for the Chapel Worship Team. (NHS is sophomores/juniors only.)',
      },
      { label: 'Retreat', text: '9th-grade class retreat — dates TBD.' },
      {
        label: 'Summer reading — English 9 Honors',
        text:
          'Three books (Honors reads all three): The 7 Habits of Highly Effective Teens by Sean Covey · The Faithful Spy by John Hendrix · The Hiding Place by Corrie ten Boom. Typed reading-response questions + annotations due the first day of class (submit to Google Classroom & turnitin.com). Regular English 9 does the first two only.',
      },
      {
        label: 'Fall schedule',
        text:
          'English 9 Honors · Spanish I · Old Testament · World Geography (Chapel Wed) · Honors Geometry · HS Band · Biology · Athletics (Periods 8 & 9).',
      },
    ],
  },
  {
    name: 'Dorothy',
    grade: '7th Grade',
    accent: 'text-tefa-red',
    links: [
      { label: 'Secondary supply list', url: 'https://aptg.co/tCJ7SC' },
      { label: '7th grade summer reading', url: 'https://aptg.co/J20fyQ' },
      { label: 'MS Math IXL Summer Boost', url: 'https://aptg.co/bs1dtZ' },
      { label: 'PE uniform — Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { label: 'Secondary dress code', url: 'https://aptg.co/92BMKR' },
    ],
    items: [
      {
        label: 'Mandatory PE uniform',
        text:
          'Buy at least 1 pair of athletic shorts and 1 athletic shirt through the Global Schoolwear site. Compression shorts allowed underneath.',
      },
      {
        label: 'IXL Summer Boost — Math',
        text: 'Complete the 7th-grade summer plan before Aug 12 using the NBCA custom link.',
      },
      {
        label: 'Middle School Houses',
        text: 'Randomly assigned to Courage, Loyalty, Integrity, or Wisdom for monthly team competitions.',
      },
      {
        label: 'Fall Break athletics (Oct 12–23)',
        text:
          'Week 1 (Oct 12–16) is a BYE for MS Football & Volleyball — best time to travel. Week 2 (Oct 19–23) has normal practices and playoff games; attendance mandatory.',
      },
      {
        label: 'Parent meetings',
        text: 'Volleyball: Aug 3 @ 5:30 PM (Secondary Gym) · Cross Country: Aug 4 @ 5:30 PM (Secondary Gym).',
      },
      { label: 'Retreat', text: 'Middle-school class retreat — dates TBD.' },
      {
        label: 'Summer reading',
        text:
          'The Wednesday Wars by Gary D. Schmidt. Plus a creative One-Pager reading response (title, author, themes border, character & setting drawings, 2 cited quotes, summary, personal rating) — counts as a test grade, due the first week of school.',
      },
      {
        label: 'Fall schedule',
        text: 'MS Athletics · Math 7 · Bible 7 Girls · English 7 (Chapel Wed) · Science 7 · MS Band · History 7 · MS Art (Periods 8 & 9).',
      },
    ],
  },
  {
    name: 'Sebastian',
    grade: '4th Grade',
    accent: 'text-tefa-green',
    links: [
      { label: 'Elementary 3rd–5th supply list', url: 'https://5il.co/2o0ag' },
      { label: 'All elementary supply lists', url: 'https://aptg.co/rSGL4x' },
      { label: 'Elementary dress code', url: 'https://aptg.co/HcLxcf' },
      { label: 'Report an absence', url: 'https://forms.gle/mnX8JapePioAnfPq5' },
    ],
    // Itemized 4th-grade list, grouped so it reads as a checklist rather than a wall of text.
    supplies: [
      {
        group: 'Label with name',
        tone: 'navy',
        items: [
          'ESV Bible (w/ sticky arrow page markers)',
          'Forvencer 12-pocket project organizer',
          'Zippered pencil bag',
          'Thick plastic folders w/ brads — 1 orange, 1 red',
          'Dry-erase grid whiteboard',
          '4 wide-ruled composition notebooks',
          '2 wide-ruled 70-page spiral notebooks',
          'Fiskars 6" scissors',
          'Crayola 12-ct colored pencils',
          'Wired mouse',
          'Wired in-ear headphones',
          'Black Sharpies — 2 regular, 2 fine tip',
          '2 highlighters',
          '2 grading pens',
          'Crayola watercolors (8 colors)',
        ],
      },
      {
        group: 'Community use — do NOT label',
        tone: 'gold',
        items: [
          'Ticonderoga 30-ct pencils',
          '12-ct pencil-top erasers',
          'Magic Rub eraser',
          'Expo 12-ct dry-erase markers',
          '4 Elmer’s giant glue sticks',
          '2 Clorox wipes',
          '10-ct Crayola markers',
          '24-ct Crayola crayons',
        ],
      },
      {
        group: 'Boys only (Sebastian)',
        tone: 'green',
        items: [
          '3-ct Scotch tape rolls',
          '1 medium hand sanitizer',
          '12-pack file folders',
        ],
      },
    ],
    items: [
      {
        label: 'Summer reading (recommended)',
        text:
          'The Tale of Despereaux · Because of Winn-Dixie · Frindle · The Cricket in Times Square · The Miraculous Journey of Edward Tulane · Hatchet.',
      },
    ],
  },
];

const NBCA_MISC = [
  {
    icon: Shirt,
    title: 'Uniforms, spirit wear & technology',
    points: [
      'Daily uniforms ordered through Tommy Hilfiger.',
      'Spirit wear: Athletic Booster Club (sold at home football games), the PTO Online Store, the NBCA Resale Facebook page, or limited resale at the Elementary/Secondary offices.',
      'Technology: students use Google Apps for Education. Classroom Chromebooks are for academic use only.',
    ],
  },
  {
    icon: Users,
    title: 'Parent volunteering & booster clubs',
    points: [
      'Field-trip chaperones must submit a Volunteer Application at least one week ahead for background checks.',
      'NBCA PTO — fosters a close union between home and school.',
      'Athletic Booster Club — boards: Membership, Merchandise, Fundraising, Concessions, Sports Banquet (athleticboosters@nbcatx.org).',
      'Fine Arts Booster Club — theater, band, choir, dance, yearbook, art (nbcafinearts@gmail.com).',
    ],
  },
];

// Master July–March timeline. `iso` drives past/upcoming styling against TODAY.
const NBCA_TIMELINE = [
  { date: 'Now – Jul 23', iso: '2026-07-23', title: 'Summer strength & conditioning', detail: 'Cassius · Mon–Thurs 6:30–8:00 AM.' },
  { date: 'Jul 25', iso: '2026-07-25', title: 'Summer Band Camp', detail: '10:15 AM–12:15 PM · Cassius & Dorothy.' },
  { date: 'Jul 27 – 31', iso: '2026-07-27', title: 'Athletics Dead Week', detail: 'No practices, games, or team events.' },
  { date: 'Jul 31', iso: '2026-07-31', title: 'Rank One athletic paperwork DUE', detail: 'Physicals + medical history uploaded for Cassius & Dorothy.' },
  { date: 'Aug 1', iso: '2026-08-01', title: 'Band Camp / schedule-change window opens', detail: 'Summer Band Camp 10:15–12:15.' },
  { date: 'Aug 3', iso: '2026-08-03', title: 'HS fall sports begin · Media Day · Volleyball meeting', detail: 'Cassius practice starts · HS Media Day 12:30–4:30 PM · HS & MS Volleyball parent meeting 5:30 PM (Secondary Gym).' },
  { date: 'Aug 4', iso: '2026-08-04', title: 'Cross Country parent meeting', detail: 'HS & MS · 5:30 PM (Secondary Gym).' },
  { date: 'Aug 7', iso: '2026-08-07', title: 'Football parent meeting', detail: 'HS & MS · 8:00 PM (Wildcat Stadium home stands).' },
  { date: 'Aug 10', iso: '2026-08-10', title: 'MS football/volleyball begin · Elementary Meet the Teacher', detail: 'Dorothy practice starts · Meet the Teacher (A–M last names) 4:30–5:30 PM (Elementary).' },
  { date: 'Aug 11', iso: '2026-08-11', title: '4th Grade Parent Orientation', detail: '5:30–6:30 PM.' },
  { date: 'Aug 12', iso: '2026-08-12', title: 'FIRST DAY OF SCHOOL', detail: 'MS Cross Country practice also begins.' },
  { date: 'Aug 17', iso: '2026-08-17', title: '7th/8th meeting · Meet the Wildcats', detail: '7th & 8th grade parent/student meeting 5:30 PM (Secondary Gym) · Meet the Wildcats 6:30 PM (Athletic Complex).' },
  { date: 'Aug 21', iso: '2026-08-21', title: 'Football home opener', detail: 'vs. Austin Hill Country Christian · 7:00 PM · Band plays!' },
  { date: 'Aug 24', iso: '2026-08-24', title: 'HS parent/student meeting', detail: '6:30 PM (Secondary Gym).' },
  { date: 'Aug 27', iso: '2026-08-27', title: 'Volleyball home opener', detail: 'vs. Bracken · 6:00 PM.' },
  { date: 'Oct 9', iso: '2026-10-09', title: 'End of 1st Quarter', detail: null },
  { date: 'Oct 12 – 23', iso: '2026-10-12', title: 'Fall Break', detail: 'Students off — but mandatory sports-attendance rules apply (see per-kid notes).' },
  { date: 'Mar 8 – 12', iso: '2027-03-08', title: 'Spring Break', detail: null },
  { date: 'May 26', iso: '2027-05-26', title: 'Last Day of School', detail: 'Half day.' },
];

// A compact external-link pill used across the NBCA Prep tab.
const LinkPill = ({ label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-[11px] font-semibold text-tefa-green bg-tefa-green/10 hover:bg-tefa-green/20 rounded-full px-2.5 py-1 transition"
  >
    {label} <ExternalLink size={11} />
  </a>
);

const SUPPLY_TONE = {
  navy: { head: 'text-tefa-navy', dot: 'bg-tefa-navy/40', chip: 'bg-tefa-navy/5 border-tefa-navy/15' },
  gold: { head: 'text-tefa-gold', dot: 'bg-tefa-gold', chip: 'bg-tefa-gold/10 border-tefa-gold/25' },
  green: { head: 'text-tefa-green', dot: 'bg-tefa-green/50', chip: 'bg-tefa-green/5 border-tefa-green/20' },
};

// Master back-to-school task list, distilled from everything on this page.
// `done: true` items are already handled. This is the single source both the
// on-page checklist and the "Copy as Markdown" button read from.
const NBCA_TASKS = [
  {
    group: 'Urgent — all family',
    tasks: [
      { text: 'Athletic paperwork completed (medical-history forms uploaded to Rank One) — except Physicals', done: true },
      { text: 'Physicals for Cassius & Dorothy uploaded to Rank One (DUE Jul 31)', done: false },
      { text: 'OTC medication permission Jotform completed (Sebastian / any child needing meds)', done: false },
      { text: 'Grandparent passes added via FACTS → Family → Family Demographic Form', done: false },
      { text: 'Hot lunch ordering set up in FACTS Parent Portal (optional)', done: false },
    ],
  },
  {
    group: 'Cassius · 9th Grade',
    tasks: [
      { text: 'Signed up for High School Football tryouts', done: true },
      { text: 'Summer strength & conditioning (Mon–Thu 6:30–8:00 AM until Jul 23)', done: false },
      { text: 'TAPPS / TMS registration (need Student ID)', done: false },
      { text: 'Cross Country parent meeting Aug 4 · Football parent meeting Aug 7', done: false },
      { text: 'Secondary supply list purchased', done: false },
      { text: 'Summer reading (English 9 Honors): The 7 Habits of Highly Effective Teens (Covey), The Faithful Spy (Hendrix), The Hiding Place (ten Boom) + response questions', done: false },
    ],
  },
  {
    group: 'Dorothy · 7th Grade',
    tasks: [
      { text: 'Mandatory PE uniform ordered from Global Schoolwear (1 shorts + 1 shirt)', done: false },
      { text: 'IXL Summer Boost — Math completed before Aug 12', done: false },
      { text: 'Volleyball parent meeting Aug 3 · Cross Country parent meeting Aug 4', done: false },
      { text: 'Secondary supply list purchased', done: false },
      { text: 'Summer reading: The Wednesday Wars (Gary D. Schmidt) + One-Pager response (test grade)', done: false },
    ],
  },
  {
    group: 'Sebastian · 4th Grade',
    tasks: [
      { text: 'Uniforms for Elementary purchased', done: true },
      { text: '4th-grade school supplies purchased', done: false },
      { text: 'Summer reading (recommended): The Tale of Despereaux, Because of Winn-Dixie, Frindle, The Cricket in Times Square, The Miraculous Journey of Edward Tulane, Hatchet', done: false },
    ],
  },
  {
    group: 'General',
    tasks: [
      { text: 'Daily uniforms ordered through Tommy Hilfiger', done: false },
      { text: 'Volunteer application submitted (for field-trip chaperones / background check)', done: false },
    ],
  },
];

// Serialize the task list to GitHub-flavored Markdown checkboxes for copying.
const tasksToMarkdown = () =>
  NBCA_TASKS.map(
    (g) =>
      `### ${g.group}\n` +
      g.tasks.map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')
  ).join('\n\n');

// Checklist card with a one-click "Copy as Markdown" button.
const NbcaTaskList = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const md = `# NBCA 2026–27 Back-to-School Task List\n\n${tasksToMarkdown()}\n`;
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const ta = document.createElement('textarea');
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const total = NBCA_TASKS.reduce((a, g) => a + g.tasks.length, 0);
  const done = NBCA_TASKS.reduce((a, g) => a + g.tasks.filter((t) => t.done).length, 0);

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2">
          <CheckSquare size={20} /> Back-to-school task list
        </h2>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-tefa-green hover:bg-tefa-navy rounded-lg px-3 py-2 transition shrink-0"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy as Markdown'}
        </button>
      </div>
      <p className="text-sm text-tefa-body/70 mb-4">
        Everything from this page in one checklist — {done} of {total} done. Copy pastes clean
        Markdown checkboxes into Notes, Todoist, GitHub, etc.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {NBCA_TASKS.map((g) => (
          <div key={g.group}>
            <div className="text-xs font-bold uppercase tracking-wide text-tefa-body/60 mb-2">{g.group}</div>
            <ul className="space-y-1.5">
              {g.tasks.map((t) => (
                <li key={t.text} className="flex items-start gap-2 text-sm">
                  {t.done ? (
                    <CheckSquare size={16} className="mt-0.5 shrink-0 text-tefa-green" />
                  ) : (
                    <Square size={16} className="mt-0.5 shrink-0 text-tefa-body/30" />
                  )}
                  <span className={t.done ? 'text-tefa-body/50 line-through' : 'text-tefa-body/80'}>{t.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const NbcaPrepView = () => {
  const nextIdx = NBCA_TIMELINE.findIndex((e) => e.iso >= TODAY);

  return (
    <div className="space-y-6">
      {/* Urgent action items */}
      <section className="bg-white rounded-xl shadow-md border-2 border-tefa-gold/50 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-1">
          <AlertCircle size={20} /> Urgent all-family action items
        </h2>
        <p className="text-sm text-tefa-body/70 mb-4">The paperwork with hard deadlines — clear these first.</p>
        <ul className="space-y-3">
          {NBCA_ACTIONS.map((a) => (
            <li key={a.title} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-tefa-light/50 p-3">
              <span className="shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wide bg-tefa-gold/20 text-tefa-navy rounded px-2 py-1 w-28 text-center">
                {a.due}
              </span>
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-tefa-navy text-sm">{a.title}</span>
                  <span className="text-[11px] text-tefa-body/50">{a.who}</span>
                </div>
                <p className="text-sm text-tefa-body/75 mt-0.5">{a.detail}</p>
                {a.links && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.links.map((l) => (
                      <LinkPill key={l.url} label={l.label} url={l.url} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Key links & portals — verified against the NBCA parent-resources pages */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-1">
          <ExternalLink size={20} /> Key links & portals
        </h2>
        <p className="text-sm text-tefa-body/70 mb-4">
          Official NBCA links, verified from{' '}
          <a href="https://www.nbcatx.org/page/parent-resources" target="_blank" rel="noopener noreferrer"
            className="underline text-tefa-green hover:text-tefa-navy">nbcatx.org/parent-resources</a>{' '}
          (Jul 2026).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NBCA_LINKS.map((grp) => (
            <div key={grp.group}>
              <div className="text-xs font-bold uppercase tracking-wide text-tefa-body/60 mb-2">{grp.group}</div>
              <div className="flex flex-wrap gap-2">
                {grp.links.map((l) => (
                  <LinkPill key={l.url} label={l.label} url={l.url} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus logistics */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-4">
          <MapPin size={20} /> Campuses, hours & drop-off
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NBCA_CAMPUSES.map((c) => (
            <div key={c.name} className="rounded-lg border border-gray-200 bg-tefa-light p-4">
              <div className="font-bold text-tefa-navy text-sm">{c.name}</div>
              <div className="text-[11px] text-tefa-body/50 mb-2">{c.who}</div>
              <div className="text-xs text-tefa-body/70 flex items-start gap-1.5 mb-2">
                <MapPin size={13} className="mt-0.5 shrink-0 text-tefa-body/40" /> {c.address}
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-tefa-body/50">Drop-off</span>{' '}
                  <span className="font-bold text-tefa-navy">{c.dropoff}</span>
                </div>
                <div>
                  <span className="text-tefa-body/50">Pick-up</span>{' '}
                  <span className="font-bold text-tefa-navy">{c.pickup}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-tefa-navy mt-5 mb-2">Key contacts</h3>
        <div className="divide-y divide-gray-100">
          {NBCA_CONTACTS.map((p) => (
            <div key={p.name} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <div className="font-bold text-tefa-navy text-sm">{p.name}</div>
                <div className="text-[11px] text-tefa-body/50">{p.role}</div>
              </div>
              <div className="flex flex-col sm:items-end text-xs gap-0.5">
                {p.phone && (
                  <a href={`tel:${p.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-1.5 text-tefa-body/70 hover:text-tefa-green">
                    <Phone size={12} /> {p.phone}
                  </a>
                )}
                <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-tefa-body/70 hover:text-tefa-green">
                  <Mail size={12} /> {p.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Per-kid cards */}
      {NBCA_KIDS.map((kid) => (
        <section key={kid.name} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <GraduationCap size={20} className={kid.accent} />
            <span className={kid.accent}>{kid.name}</span>
            <span className="text-sm font-medium text-tefa-body/50">· {kid.grade}</span>
          </h2>

          {/* Per-child official links */}
          {kid.links && (
            <div className="flex flex-wrap gap-2 mb-4">
              {kid.links.map((l) => (
                <LinkPill key={l.url} label={l.label} url={l.url} />
              ))}
            </div>
          )}

          <div className="space-y-3">
            {kid.items.map((it) => (
              <div key={it.label} className="border-l-2 border-gray-200 pl-3">
                <div className="text-xs font-bold uppercase tracking-wide text-tefa-body/60">{it.label}</div>
                <p className="text-sm text-tefa-body/80 mt-0.5">
                  {it.text}
                  {it.link && (
                    <>
                      {' '}
                      <a href={it.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-tefa-green hover:underline">
                        {it.linkLabel || 'Open link'} <ExternalLink size={12} />
                      </a>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Itemized, grouped supply checklist (Sebastian) */}
          {kid.supplies && (
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <Backpack size={16} className="text-tefa-body/60" />
                <span className="text-sm font-bold text-tefa-navy">School supply list</span>
                <span className="text-[11px] text-tefa-body/50">4th grade · check off as you shop</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {kid.supplies.map((sg) => {
                  const t = SUPPLY_TONE[sg.tone];
                  return (
                    <div key={sg.group} className={`rounded-lg border p-3 ${t.chip}`}>
                      <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${t.head}`}>{sg.group}</div>
                      <ul className="space-y-1.5">
                        {sg.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-tefa-body/80">
                            <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${t.dot}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-tefa-body/50 mt-2">
                Girls-only list (not needed for Sebastian): 1 box tissues, 50-ct 9"×12" construction paper.
              </p>
            </div>
          )}
        </section>
      ))}

      {/* Uniforms / boosters */}
      {NBCA_MISC.map((m) => {
        const Icon = m.icon;
        return (
          <section key={m.title} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-3">
              <Icon size={20} /> {m.title}
            </h2>
            <ul className="space-y-2">
              {m.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2 text-sm text-tefa-body/80">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-tefa-navy/40" />
                  {pt}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Master timeline */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-6">
          <Calendar size={20} /> Master timeline · July – May
        </h2>
        <div className="relative border-l-2 border-gray-200 ml-3 space-y-5">
          {NBCA_TIMELINE.map((e, idx) => {
            const past = e.iso < TODAY;
            const isNext = idx === nextIdx;
            return (
              <div key={e.title} className={`relative pl-6 ${past ? 'opacity-50' : ''}`}>
                <div
                  className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    isNext ? 'bg-tefa-navy ring-4 ring-tefa-sky/40' : 'bg-gray-300'
                  }`}
                />
                <div className={`bg-white p-3 rounded-lg shadow-sm border ${isNext ? 'border-tefa-navy/30 ring-1 ring-tefa-sky/30' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    {isNext && (
                      <span className="text-[10px] font-bold bg-tefa-green text-white px-2 py-0.5 rounded uppercase tracking-wide">
                        Up next
                      </span>
                    )}
                    <span className="text-xs font-bold text-tefa-body/50">{e.date}</span>
                  </div>
                  <h3 className="font-bold text-tefa-navy text-sm">{e.title}</h3>
                  {e.detail && <p className="text-sm text-tefa-body/70 mt-0.5">{e.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Copyable master task list — distilled from everything above */}
      <NbcaTaskList />
    </div>
  );
};

export default IddingsPlanner;
