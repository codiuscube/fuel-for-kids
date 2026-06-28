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
  ReferenceDot,
  ReferenceArea,
} from 'recharts';

// ---------------------------------------------------------------------------
// Single source of truth for the family's real numbers. Everything the page
// shows is derived from the data in this block — update here if a figure changes.
// ---------------------------------------------------------------------------

const TODAY = '2026-06-25';

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
//   • ~$20M reserve remains for outstanding appeals. Once the appeal window
//     closes, they award that down to the waitlist while continuing to backfill.
//
// This REPLACES the earlier inferred ~$100M reserve. The reserve is $20M — so
// the big "reserve release" upside is off the table. Forward motion now comes
// almost entirely from BACKFILL CHURN: the program is essentially fully
// deployed ($890M active + $20M reserve = $910M), so the waitlist advances only
// as awarded families leave (opt out, bump to $2,000, or miss the Jul 15
// deadline), each departure recycling ~one new blended seat down the list.
// ---------------------------------------------------------------------------

const TEFA_BUDGET = {
  awardable: 910_000_000,    // after admin/startup/TEA (~$90M off the $1B)
  fundedActive: 890_000_000, // active awards, held here via backfill
  reserve: 20_000_000,       // remaining, for appeals; cascades to waitlist after appeal window
  // New T2/T3 seat = blend of private ESA (~$10,474) and homeschool/other ($2,000).
  // Mix updated to 67/33 (was 77/23) — homeschool share has climbed 23%→~33% of
  // active awards as private families bump down via the $2,000 downgrade.
  blendedCost: Math.round(0.67 * 10474 + 0.33 * 2000), // ~7,678 (67/33 private/homeschool)
  source: 'Travis Pillow, Comptroller spokesperson — Jun 25, 2026',
};
// Seats the remaining reserve can fund once appeals close (~$20M ÷ ~$7,678).
const RESERVE_SEATS = Math.round(TEFA_BUDGET.reserve / TEFA_BUDGET.blendedCost); // ~2,605
// Active awards that can churn — the population that frees seats when it leaves.
const ACTIVE_AWARDS = 107000; // "nearly 107,000 active" (Jun 23 update)

// ---------------------------------------------------------------------------
// Seats per departure. Empirically the cascade has advanced ~1 seat per family
// that leaves (12,916 frontier on ~12,900 Jun-23 departures ≈ 1:1). But the two
// departure types free DIFFERENT amounts: a private opt-out frees its full ESA
// (~$10,474); a downgrade to the $2,000 tier frees only the difference (~$8,474).
// So a departure mix that skews toward OPT-OUTS recycles more dollars — hence more
// seats — per departure. We scale each scenario's seats-per-departure by how much
// its mix frees vs. the observed Jun-23 mix. The new-seat blended cost cancels in
// the ratio, so this is driven purely by the opt-out : downgrade split, and stays
// pinned to the observed ~1:1 at today's mix (no kink vs. the published anchor).
const FREED_OPTOUT = 10474;       // private opt-out frees the full ESA
const FREED_DOWNGRADE = 8474;     // bump to $2,000 frees the difference ($10,474 − $2,000)
const OBS_OPTOUT_RATE = 0.028;    // ~3,000 opt-outs / ~107k active (Jun 23)
const OBS_DOWNGRADE_RATE = 0.093; // ~9,900 downgrades / ~107k active (frontier − opt-outs)
const avgFreedPerDeparture = (optOut, downgrade) =>
  (optOut * FREED_OPTOUT + downgrade * FREED_DOWNGRADE) / (optOut + downgrade);
const OBS_AVG_FREED = avgFreedPerDeparture(OBS_OPTOUT_RATE, OBS_DOWNGRADE_RATE);
// Seats per departure, normalized to the observed ~1:1 baseline.
const seatsPerDeparture = (optOut, downgrade) =>
  avgFreedPerDeparture(optOut, downgrade) / OBS_AVG_FREED;

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

// ANECDOTAL frontline readings of the cascade frontier — hotter than the official
// frontier (still 12,916 on Jun 23, entirely Tier 2). These are the hollow dots on
// the chart AND the anchor points the AGGRESSIVE scenario is drawn through: ~15k
// around Jun 25 (recent frontline reports) and ~20k by Jul 1 (near-term projection).
// Both are UNOFFICIAL, so plotted hollow and asterisked. Edit here and both the dots
// and the aggressive line move together.
const AGG_DOTS = [
  { date: '2026-06-25', f: 15000 },
  { date: '2026-07-01', f: 20000 },
];

// How the cascade frontier maps to "fuel": the frontier advances ~1 seat per family
// that LEAVES an active award (opt-out or homeschool/$2,000 downgrade), plus the
// one-time reserve when it releases. So a scenario's terminal frontier ≈
//   churnRate × active-award base  +  reserve seats.
// The published frontier (12,916 on ~107k active) already implies ~12% have left in
// the first 7 weeks — mostly UNPUBLISHED downgrades (opt-outs alone are only ~3,000).
// That observed pace is the anchor; the two scenarios below differ only in how high
// total attrition climbs through the Jul 15 deadline.

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
];

// Two scenarios — nothing else. Both share the confirmed $20M reserve (~2,605
// seats), released at the Jul 15 deadline; they differ in how high total attrition
// climbs and in SHAPE.
// Terminal = departures × seats-per-departure + reserve. Opt-outs hold ~3% through
// Jul 15 in both; they diverge in how the deadline shakeout splits opt-outs vs.
// downgrades (opt-outs free more $, so reach deeper per departure).
//   REALISTIC: other-state Year-1 attrition (mid of the 14–34% range ≈ 24% of the
//     active base), opt-outs settling ~6%. Quiet through the Jul 1–15 lull, a sharp
//     SPIKE at the Jul 15 deadline (reserve drops the same week), aggressive churn
//     Jul 15–31, then a taper Aug 1–15. Terminal ≈ 28,400 — just BELOW our band.
//   AGGRESSIVE (extreme / opt-in collapse): climbs gently through the Jul 1–15 lull,
//     then a MASSIVE Jul 15–20 burst IF the deadline reveals a mass no-show (lots of
//     speculative awards never opted in / PreK/K families who can't find seats), high
//     churn Jul 20–31, taper Aug 1–15. ~43% total churn with opt-outs spiking to ~22%
//     — ABOVE any first-year program (historical range 14–34%). Terminal ≈ 51,500,
//     into the deep end of our band (past 50k). A low-probability CEILING, not a forecast.
// Both are SCENARIOS, not forecasts. After Aug 15 the big waves are done and each
// line just drifts on small residual attrition.
const REALISTIC = {
  churnRate: 0.24,                // total departures (opt-outs + downgrades), mid of 14–34%
  optOutRate: 0.06,              // opt-outs hold ~3% through Jul 15, settle ~6% after a normal deadline shakeout
  reserveSeats: RESERVE_SEATS,    // confirmed ~$20M reserve (~2,605 seats)
};

const AGGRESSIVE = {
  churnRate: 0.43,                // EXTREME — above the 14–34% historical range; only if Jul 15 opt-in take-up collapses
  optOutRate: 0.22,              // Jul 15 opt-in COLLAPSE — opt-outs spike from ~3% to ~22% (mass no-show)
  reserveSeats: RESERVE_SEATS,
};

// RESEARCH — purely the prior-research central, with NO TEFA-specific hot-pace
// adjustment. Anchored on the gem doc's §2 benchmarks: D.C. Opportunity Scholarship
// 14.3% (closest analog), inside the 8–34% range across D.C./Milwaukee/NYC/Virginia.
// Shares the observed line through the anchor, then projects the conservative 15%
// central. Notably this terminal (~18,800) doesn't even fully clear Tier 2 — i.e.
// the published cascade is ALREADY running hotter than the pure-research baseline,
// which is exactly why the Conservative/Aggressive lines sit above it.
const RESEARCH = {
  churnRate: 0.15,               // gem doc central (D.C. 14.3% anchor)
  optOutRate: 0.04,              // opt-outs a small subset; rest is $2,000 downgrades
  reserveSeats: RESERVE_SEATS,
};

// Chart window: from the lottery (frontier 0) through end-August. The big waves
// (Tier 2 clear, reserve, the Jul 15 deadline shakeout) are done by ~Aug 15; after
// that both lines carry only a small residual attrition drift, not another wave.
// `today` anchors the "Today" marker to a fixed date so a screenshot of the
// chart reads the same for everyone (the artifact gets posted/shared) — bump it
// as the analysis is refreshed, rather than letting it drift with the viewer's clock.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: '2026-06-25', jul15: '2026-07-15', end: '2026-08-31' };
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
  awardedBase = ACTIVE_AWARDS,
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

  // REALISTIC — quiet through the deadline, then the spike. Tier 2 finishes through
  // early July, Jul 1–15 is a lull, then the Jul 15 deadline + reserve drive a sharp
  // step, aggressive churn runs Jul 15–31, and it tapers Aug 1–15. Terminal =
  // churnRate × base + reserve (~28k, just below our band).
  // Terminal frontier = departures × seats-per-departure (opt-out-heavy mixes free
  // more $, so reach deeper) + the one-time reserve seats.
  const terminalSeats = (s) =>
    Math.round(s.churnRate * awardedBase * seatsPerDeparture(s.optOutRate, s.churnRate - s.optOutRate) + s.reserveSeats);
  const realTerminal = terminalSeats(realistic);
  const realFn = buildLine([
    { t: tL, f: fL },                              // Jun 23 anchor (12,916)
    { t: dayOf('2026-07-01'), f: 16500 },          // Tier 2 still clearing
    { t: jul15, f: 18800 },                        // QUIET Jul 1–15 lull (~165/day)
    { t: dayOf('2026-07-17'), f: 18800 + realistic.reserveSeats }, // SPIKE: reserve + deadline shakeout
    { t: dayOf('2026-07-31'), f: 26500 },          // aggressive churn Jul 15–31
    { t: wavesEnd, f: realTerminal },              // taper Aug 1–15 → just below our band
  ], wavesEnd);

  // AGGRESSIVE (extreme / opt-in collapse) — drawn through the anecdotal frontline
  // dots (~15k Jun 25, ~20k Jul 1), a lull to Jul 15, then a MASSIVE Jul 15–20 burst
  // (the deadline mass no-show + reserve), high churn Jul 20–31, tapering Aug 1–15.
  // Terminal = churnRate × base + reserve (~48k, deep band). Only if Jul 15 opt-in
  // take-up collapses — a low-probability ceiling.
  const aggTerminal = terminalSeats(aggressive);
  const aggFn = buildLine([
    { t: tL, f: fL },                              // Jun 23 official anchor (12,916)
    ...AGG_DOTS.map((d) => ({ t: dayOf(d.date), f: d.f })), // anecdotal hollow-dot anchors (~15k Jun 25, ~20k Jul 1)
    { t: jul15, f: 22000 },                        // QUIET Jul 1–15 lull
    { t: dayOf('2026-07-20'), f: 36000 },          // MASSIVE Jul 15–20 burst (deadline collapse + reserve)
    { t: dayOf('2026-07-31'), f: 46500 },          // high churn Jul 20–31
    { t: wavesEnd, f: aggTerminal },                // taper Aug 1–15 → deep band (~48k)
  ], wavesEnd);

  // RESEARCH (pure prior-research central, ~15%) — quiet Tier-2 clearing, a modest
  // Jul 15 reserve/deadline bump, then a gentle taper. Terminal ≈ 18,800 — it does
  // not even fully clear Tier 2, illustrating that the published cascade is already
  // running hotter than the conservative research baseline.
  const researchTerminal = terminalSeats(research);
  const researchFn = buildLine([
    { t: tL, f: fL },                              // Jun 23 official anchor (12,916)
    { t: dayOf('2026-07-01'), f: 14000 },          // slow Tier 2 clearing
    { t: jul15, f: 15200 },                        // QUIET Jul 1–15 lull
    { t: dayOf('2026-07-17'), f: 15200 + research.reserveSeats }, // reserve + small deadline bump
    { t: dayOf('2026-07-31'), f: 18400 },          // modest churn Jul 15–31
    { t: wavesEnd, f: researchTerminal },          // taper Aug 1–15 → ~18,800
  ], wavesEnd);

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
      // Aggressive is by definition ≥ realistic; clamp away sub-100-seat spline crossings.
      row.aggressive = Math.max(Math.round(aggFn(t)), row.realistic);
    }
    series.push(row);
  }

  // Frontier reached at the dates the table below the chart reports.
  const TABLE_DATES = ['2026-07-01', '2026-07-15', '2026-07-20', '2026-07-31', '2026-08-15', '2026-08-31'];
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
    researchOptOutPct: Math.round(research.optOutRate * 100),        // ~4% (research central)
    realisticOptOutPct: Math.round(realistic.optOutRate * 100),      // ~6% after Jul 15
    aggressiveOptOutPct: Math.round(aggressive.optOutRate * 100),    // ~22% after Jul 15
    reserveSeats: realistic.reserveSeats,
    projectionTable,
    researchTerminal,
    researchChurnPct: Math.round(research.churnRate * 100),
    realisticChurnPct: Math.round(realistic.churnRate * 100),
    aggressiveChurnPct: Math.round(aggressive.churnRate * 100),
    realisticTerminal: realTerminal,
    realisticTier3Ts: crossTs(realFn, T3_START),
    realisticBandLoTs: crossTs(realFn, BAND_LO),
    aggressiveTerminal: aggTerminal,
    aggressiveTier3Ts: crossTs(aggFn, T3_START),
    aggressiveBandLoTs: crossTs(aggFn, BAND_LO),
    aggressiveBandHiTs: crossTs(aggFn, BAND_HI),
    realisticYourPosTs: crossTs(realFn, YOUR_POS.lo),
    aggressiveYourPosTs: crossTs(aggFn, YOUR_POS.lo),
  };
  return { series, kpis };
}

const CASCADE = buildCascadeProjection();
const CASCADE_KPIS = CASCADE.kpis;
const FRONTIER_Y_MAX = Math.ceil(Math.max(BAND_HI, ...CASCADE.series.map((r) => Math.max(r.realistic ?? 0, r.aggressive ?? 0))) * 1.05 / 1000) * 1000;

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
    note: 'Every seat freed so far has gone to Tier 2. At the current pace the remaining backlog clears mid-to-late July — and this has to finish before any Tier 3 offer goes out at all.',
  },
  {
    band: '20,384 – 25,000',
    scope: 'early Tier 3',
    call: 'Likely',
    tone: 'good',
    note: 'Reached once Tier 2 clears and the confirmed $20M reserve (~2,605 seats) is awarded after the appeal window. This is where the first real Tier 3 movement lands, around the Jul 15 cascade.',
  },
  {
    band: '25,001 – 30,000',
    scope: 'mid Tier 3',
    call: 'Possible',
    tone: 'mid',
    note: 'Past the $20M reserve — getting here needs backfill churn, i.e. ~12–15% of active awards opting out / bumping to $2,000 / missing the Jul 15 deadline. Possible in July at moderate attrition.',
  },
  {
    band: '30,001 – 50,000',
    scope: 'YOUR BAND · you sit at 45–50k',
    call: 'Unlikely — needs record attrition',
    tone: 'bad',
    ourBand: true,
    note: 'Our original lottery position is the DEEP end (45–50k), and the chart plots original position — so the frontier has to climb all the way there to fund us. Reaching 45k needs ~38% of all awards given up; 50k needs ~43% — both ABOVE any first-year program (history is 14–34%). Realistic attrition stops ~28k, nowhere close; only an extreme Jul 15 opt-in collapse (~43% attrition, opt-out-heavy) reaches into the 45–50k band. Plan on no voucher.',
  },
  {
    band: '50,001 +',
    scope: 'deep Tier 3 / Tier 4',
    call: 'Not expected',
    tone: 'bad',
    note: 'Only the extreme opt-in-collapse ceiling (~51,500) grazes the very start of this band; short of that, reaching here requires decline rates beyond the historical 14–34% range. Tier 4 does not move in Year 1 at all.',
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
  research: 'Research central (~15%, D.C. anchor)',
  realistic: 'Conservative (other-state attrition ~24%)',
  aggressive: 'Aggressive (Jul 15 opt-in collapse ~43%)',
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

const VALID_TABS = ['now', 'money', 'timeline', 'tefa'];
const TAB_LABELS = { now: 'Now', money: 'Money', timeline: 'Timeline', tefa: 'TEFA' };

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
// TEFA — likelihood the cascade reaches each band, and two projections
// ---------------------------------------------------------------------------
const TefaView = () => {
  const k = CASCADE_KPIS;
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
          <strong>Bottom line:</strong> our original lottery position is the <strong>deep end (45–50k)</strong>, and the chart plots
          original position — so the frontier must reach 45–50k to fund us. That needs <strong>~40–45% of all awards abandoned</strong>,
          above any first-year program (history is 14–34%). Realistic attrition stops ~{k.realisticTerminal.toLocaleString()} (opt-outs
          ~{k.realisticOptOutPct}%) — nowhere near; only an extreme Jul 15 opt-in collapse (opt-outs spiking to ~{k.aggressiveOptOutPct}%)
          reaches ~{k.aggressiveTerminal.toLocaleString()}, far enough to cover our 45–50k band — but that needs ~43% total attrition, above any
          first-year program. <strong>Plan on no voucher this year</strong>; treat any offer as a pure surprise.
        </p>
      </section>

      {/* The two projections, on the metric that matters: cascade depth. */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> How far the line reaches — two scenarios
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          The chart tracks the <strong>cascade frontier</strong>: how far down the waitlist awards have reached.
          We show two scenarios — both sharing the confirmed <strong>$20M reserve</strong>: a{' '}
          <strong>realistic</strong> line built on other states' Year-1 attrition (~24%), which stops just short
          of our band; and an <strong>aggressive</strong> line drawn through the anecdotal frontline dots (~15k Jun 25, ~20k Jul 1) that
          assumes the Jul 15 opt-in deadline becomes a <em>mass no-show</em> (~43% of all awards given
          up — <strong>above any first-year program on record</strong>). That's the only path into the deep end of
          our band (45–50k); treat it as a low-probability ceiling, not a forecast. When a line crosses a band's
          threshold, the cascade has reached that band.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-4">
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">Funded So Far</div>
            <div className="font-bold text-tefa-navy text-lg">{k.frontierNow.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">all Tier 2 · official as of {fmtChartDate(Date.parse(k.asOf))} ({JUNE23_CASCADE.t2Cascaded.toLocaleString()} newly awarded this week)</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">Tier 2 Still Ahead</div>
            <div className="font-bold text-tefa-gold text-lg">{k.t2Remaining.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">must clear before any Tier 3 offer · {k.optOutsSoFar.toLocaleString()} opt-outs so far</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-tefa-navy/20 p-3 text-center">
            <div className="text-xs text-tefa-navy/70 font-medium">Realistic Reaches</div>
            <div className="font-bold text-tefa-navy text-lg">~{k.realisticTerminal.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">~24% attrition (other states), opt-outs ~{k.realisticOptOutPct}% + $20M reserve · stops just short of our band ({BAND_LO.toLocaleString()})</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
            <div className="text-xs text-tefa-red/70 font-medium">Aggressive Reaches</div>
            <div className="font-bold text-tefa-red text-lg">~{k.aggressiveTerminal.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">deep band by ~{fmtChartDate(k.aggressiveBandLoTs)} · only if Jul 15 opt-in collapses (~43%, opt-outs ~{k.aggressiveOptOutPct}% — above any precedent)</div>
          </div>
        </div>
        <p className="text-[10px] text-tefa-body/50 mb-3 -mt-2">
          <strong>As of Jun 25, 2026.</strong> The Jun 23 Comptroller update added <strong>{JUNE23_CASCADE.t2Cascaded.toLocaleString()} more
          waitlisted students</strong> (all Tier 2), advancing the official frontier to <strong>{k.frontierNow.toLocaleString()}</strong> —
          nearly 110,000 awarded, ~{JUNE23_CASCADE.optOuts.toLocaleString()} opt-outs, ~107,000 active. Per spokesperson Travis Pillow
          (Jun 25), the program is essentially fully deployed — <strong>~$910M awardable, ~$890M already in active awards, ~$20M reserve</strong>{' '}
          for appeals — so the waitlist now advances by <strong>backfill churn</strong> as families leave, not a big reserve release.
        </p>
        <p className="text-[10px] text-tefa-body/50 mb-3 -mt-1">
          <strong>*</strong> The hollow dots are <strong>anecdotal frontline readings</strong> of the frontier — <strong>~15k around Jun 25</strong> and
          <strong> ~20k by Jul 1</strong> — running hotter than the official {k.frontierNow.toLocaleString()} (still entirely Tier 2). They're unofficial,
          so plotted hollow; the <strong>aggressive line is drawn through them</strong>.
        </p>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={CASCADE.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="ts" scale="time" domain={['dataMin', 'dataMax']}
                     ticks={FRONTIER_TICKS} tickFormatter={fmtChartDate} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, FRONTIER_Y_MAX]} tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }}
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
              <Line type="monotone" dataKey="research" name="Research central (~15%, D.C. anchor)" stroke="#2e7d5b" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="realistic" name="Conservative (other-state attrition ~24%)" stroke="#202562" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="aggressive" name="Aggressive (Jul 15 opt-in collapse ~43%)" stroke="#aa2142" strokeWidth={2.5} strokeDasharray="8 3" dot={false} />
              <Scatter dataKey="observed" name="Published data" fill="#202562" />
              {/* Anecdotal frontline readings — hollow dots the aggressive line runs through. */}
              {AGG_DOTS.map((d) => (
                <ReferenceDot key={d.date} x={Date.parse(d.date)} y={d.f} r={5} fill="#fff" stroke="#e8889b" strokeWidth={2} strokeDasharray="2 1.5"
                    label={{ value: `~${(d.f / 1000).toFixed(0)}k*`, position: 'top', fontSize: 9, fontWeight: 700, fill: '#aa2142' }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 mt-3 space-y-1">
          <div><strong>Three scenarios.</strong> The frontier (= {T2_AT_LOTTERY.toLocaleString()} at-lottery − Tier 2 still queued) has reached {k.frontierNow.toLocaleString()}, advancing by <strong>backfill churn</strong> as awarded families leave. <strong>Research central</strong> applies the prior-research baseline (~{k.researchChurnPct}% attrition, D.C.'s 14.3% anchor) with no TEFA-specific adjustment, and settles ~<strong>{k.researchTerminal.toLocaleString()}</strong> — short of even fully clearing Tier 2, which shows the published cascade is <em>already</em> running hotter than pure research. <strong>Conservative</strong> uses ~{k.realisticChurnPct}% total attrition (mid of the 14–34% Year-1 range in D.C., Milwaukee and Virginia) and settles ~<strong>{k.realisticTerminal.toLocaleString()}</strong>, just short of our band ({BAND_LO.toLocaleString()}). <strong>Aggressive</strong> is a ceiling, not a forecast: only a Jul 15 opt-in collapse (~{k.aggressiveChurnPct}% attrition, above any first-year program) would reach the 45–50k end of our band, around ~{k.aggressiveTerminal.toLocaleString()}.</div>
          <div><strong>Watch — the Jul 15 deadline.</strong> Families who don't opt in by Jul 15 are "moved aside to allow other families to come off the waitlist" (Travis Pillow). That shakeout — plus the ~$20M reserve awarded once appeals finalize — is the single event that decides whether the cascade reaches our band, and it lands <em>after</em> the Jun 30 penalty-free withdrawal deadline.</div>
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
                { key: 'aggressive', label: `Aggressive (~${k.aggressiveChurnPct}%)`, color: '#aa2142', vals: k.projectionTable.aggressive },
                { key: 'conservative', label: `Conservative (~${k.realisticChurnPct}%)`, color: '#202562', vals: k.projectionTable.conservative },
                { key: 'research', label: `Research central (~${k.researchChurnPct}%)`, color: '#2e7d5b', vals: k.projectionTable.research },
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
            Values are the global waitlist position the cascade has funded down to. Tier 3 starts at {T3_START.toLocaleString()};
            our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()}. All three share the published track through Jun 23 ({k.frontierNow.toLocaleString()}); they differ only in projected attrition after.
          </p>
        </div>
      </section>
    </div>
  );
};

export default IddingsPlanner;
