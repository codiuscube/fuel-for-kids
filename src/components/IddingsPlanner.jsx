import { useState } from 'react';
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
} from 'recharts';

// ---------------------------------------------------------------------------
// Single source of truth for the family's real numbers. Everything the page
// shows is derived from the data in this block — update here if a figure changes.
// ---------------------------------------------------------------------------

const TODAY = '2026-06-23';

// Per-child 2026-27 gross tuition and the NBCA financial aid already granted.
const STUDENTS = [
  { name: 'Cassius', grade: '9th Grade', tuition: 16790, nbcaAid: 5850, scholarship: 4000 },
  { name: 'Dorothy', grade: '7th Grade', tuition: 16050, nbcaAid: 5600, scholarship: 4000 },
  { name: 'Sebastian', grade: '4th Grade', tuition: 15185, nbcaAid: 4750, scholarship: 4000 },
];

const SIBLING_DISCOUNT = 1518.5;   // FACTS applies the family sibling discount to Sebastian's account.
const ENROLLMENT_FEE_PAID = 690;   // ($175 + $55) x 3 — paid Apr 2, non-refundable.

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

// ---------------------------------------------------------------------------
// TEFA cascade frontier — how deep the waitlist has been funded, vs. two
// projections. Feeds the TEFA tab. All published (empirical) numbers live in
// the *_OBSERVATIONS arrays; everything else is derived.
//
// The metric that actually answers "will an offer reach us?" is the CASCADE
// FRONTIER: how far down the single, tier-ordered global waitlist awards have
// reached. Tier 3 begins at position 20,383 (everyone ahead is Tier 2); our
// family band is global positions 30,001–50,000. We deliberately do NOT chart
// raw opt-out counts: the line ahead clears at ~3.7 seats per opt-out
// (homeschool downgrades free $8,474 of each $10,474 award; appeals-reserve
// awards free seats with no opt-out at all), so an opt-out count plotted 1:1
// against the thresholds badly understates real progress.
// ---------------------------------------------------------------------------

const AWARDED_BASE = 95934;       // initially awarded (44,753 T1-family + 51,181 T2)
const T2_AT_LOTTERY = 20383;      // Tier 2 waitlisted ahead of Tier 3 at lottery time (May 7 PDF)
const T3_START = T2_AT_LOTTERY;   // the cascade frontier at which the FIRST Tier 3 offer goes out
const BAND_LO = TEFA.bandLo;      // 30,001 — top of our family's band
const BAND_HI = TEFA.bandHi;      // 50,000 — bottom of our family's band

// ANECDOTAL upper-edge reading of the frontier "today" (Jun 23), from documented
// Odyssey frontline cases — the evidence behind the AGGRESSIVE+ scenario.
// The official Jun 23 frontier is 12,916 (see T2_OBSERVATIONS); these self-reported
// cases run hotter, implying the reserve may be releasing faster than the published
// count reflects:
//   Jun 22: one Tier 2 family went 5,001–10,000 (4:01pm) → 4,001–5,000 (8:52pm) the
//     SAME day (and ~15–20k → 4–5k overall) — ~13,000 cleared from ahead of them.
//   Jun 23: "ElegantTurkey" 10–15k → 2–3k then FUNDED (confirmed crossing). "Ty Hope"
//     15,001–20,000 → 1–1k, still waiting = ~17,000 cleared ahead of one person.
// Strongest point implies ~17k; we plot the conservative ~15,000 midpoint. This sits
// ABOVE the official line, so it brackets the aggressive+ upside, not the base case.
// Still UNOFFICIAL — self-reported cases — so always asterisked.
const EST_FRONTIER_TODAY = 15000;

// Pessimistic-guess (grounded; the `bestGuess` series) model from the published bands analysis: a blended
// 15%/18%/35% non-participation plus ~$25M of the inferred $100M+ appeals
// reserve. Under it Tier 2 fully clears and the cascade reaches roughly these
// global cut-offs. This already bakes in the 3.7× amplification.
const BG_FUNDED = 27500;          // best-guess funded depth (a seat actually paid)
const BG_OFFER = 31400;           // best-guess offer depth (an offer reaches this rank)

// Jun 10, 2026 Comptroller press release ("TEFA Pass 100,000-Student Milestone").
const JUNE10_CASCADE = {
  asOf: '2026-06-10',
  t2Cascaded: 4100,               // "more than 4,100" newly awarded, all Tier 2
  optOuts: 2000,                  // "about 2,000" cumulative opt-outs to date
  grossAwardedApprox: 103828,
  t2RemainingAfterCascade: 12966,
};

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

// The three projections the page now shows — nothing else.
//   bestGuess: the grounded model above. Terminal = offer depth (~31,400);
//              the bulk of movement lands at the Jul 15 deadline cascade.
//   cody:      the aggressive-churn scenario, STAGED in three legs:
//                1. current observed trend, with a $50M reserve release flowing
//                   ON TOP of it Jun 15 → Jul 15 (the line reads as
//                   "trend + reserve" through that window);
//                2. the deadline shakeout landing 25% cumulative opt-outs by
//                   Jul 25;
//                3. the full 50% wave from Jul 25 through Jul 31.
//              The reserve leg is $50M of the inferred ~$100M appeals pool
//              (~5,865 blended seats). That 50% sits ABOVE the 14–34%
//              historical range (D.C./Milwaukee/Virginia), so it is the
//              aggressive upper edge, not a forecast — labeled as such.
//   codyPlus:  same staging, nudged a little hotter — a touch higher opt-out
//              share, a slightly larger reserve draw ($55M), and the reserve
//              landing a few days sooner. This is the OUTER edge of the fan
//              (light-red dotted), drawn to bracket the upside if the Jun 22
//              anecdotes (reserve rolling now) prove out. Not a forecast.
const CODY = {
  wave1Rate: 0.25,                // cumulative opt-out share by Jul 25 — the deadline wave
  optOutRate: 0.50,               // cumulative share from Jul 25 onwards, landing by Jul 31
  reserveSeats: 5865,             // $50M toward the waitlist at ~$8,525 blended/seat
  reserveStart: '2026-06-15',     // appeals processed → reserve starts cascading
  reserveEnd: '2026-07-15',       // fully released by the opt-in/opt-out deadline
  // ANECDOTAL EARLY-CATALYST (not confirmed, Jun 22): frontline + support reports
  // suggest the appeals reserve is rolling through now and "Tier 2 funded by end
  // of month." If an OFFICIAL Comptroller number confirms frontier ~20,383 by
  // ~Jun 30, switch reserveEnd to '2026-06-30' (clears Tier 2 ~end of June) and
  // pull the best-guess bgWaypoints earlier to match. Until then, keep above.
};

// Slightly-more-aggressive variant of CODY — the outer edge of the fan, lifted
// toward the documented upper limit (~16k on Jun 22) so it keeps clear daylight
// from the aggressive-churn line. Same staged mechanism, pushed up: 57% opt-out
// (vs 50%), ~$66M reserve (vs $50M), reserve fully landed by Jun 28. ~67.9k vs ~59k.
const CODY_PLUS = {
  wave1Rate: 0.30,                // cumulative opt-out share by Jul 25 (vs 0.25)
  optOutRate: 0.57,               // cumulative share landing by Jul 31 (vs 0.50)
  reserveSeats: 7800,             // ~$66M toward the waitlist at ~$8,525 blended/seat
  reserveStart: '2026-06-15',
  reserveEnd: '2026-06-28',       // reserve fully landed before month-end → embodies the
                                  // (still anecdotal) "Tier 2 funded by end of month" reports;
                                  // pulls this upper-edge line's Tier 3 crossing to ~Jul 1
};

// Chart window: from the lottery (frontier 0) through end-August. The main
// mechanisms exhaust by ~Aug 1, but the line doesn't stop cold — confirmed
// students who never actually enroll (no-shows) and other recovered funds keep
// reconciling through Aug–Sep, so both lines carry a slow steady drift after
// their main waves complete.
// `today` anchors the "Today" marker to a fixed date so a screenshot of the
// chart reads the same for everyone (the artifact gets posted/shared) — bump it
// as the analysis is refreshed, rather than letting it drift with the viewer's clock.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: '2026-06-23', jul15: '2026-07-15', end: '2026-08-31' };
const RECON_DRIFT = 125;          // seats/day of post-wave reconciliation (~5% no-shows recovering over Aug–Sep)

// Cascade-frontier model. Three projections, all anchored on the last published
// frontier point and landing on a terminal by a stated end date (flat/drift
// after). Each is piecewise/staged so the steep cascade sits at/after the Jul 15
// deadline, not before it — with the bulk of motion at that deadline wave.
function buildCascadeProjection({
  t2Observations = T2_OBSERVATIONS,
  optOuts = OPTOUT_OBSERVATIONS,
  cody = CODY,
  codyPlus = CODY_PLUS,
  awardedBase = AWARDED_BASE,
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

  // Pessimistic guess (grounded; the `bestGuess` series), built piecewise so the steep part sits AFTER Jul 15,
  // not before it: from the Jun-23 official anchor (12,916) it climbs only GENTLY
  // (~150/day) through the lull to Jul 15, and the bulk of the cascade lands at
  // the Jul 15 deadline wave, ramping to offer depth (~31,400) by Aug 1, then slow
  // drift. A single logistic can't both hold the line early and stay flat to
  // Jul 15, hence waypoints. Terminal/depth unchanged (~31,400).
  const bgEnd = dayOf('2026-08-01');
  const bgWaypoints = [
    { t: tL, f: fL },                          // Jun 23 official anchor (12,916)
    { t: dayOf('2026-07-15'), f: 16200 },      // gentle pre-deadline lull (~150/day)
    { t: bgEnd, f: BG_OFFER },                 // Jul 15 → Aug 1 deadline cascade
  ];
  const bgSpline = monoSpline(bgWaypoints);
  const bestGuess = (t) =>
    t <= tL
      ? interp(obsF, t)
      : bgSpline(Math.min(t, bgEnd)) + Math.max(0, t - bgEnd) * RECON_DRIFT;

  // Aggressive churn: staged waypoints, not a logistic. Current trend (last
  // observed segment's pace) carries forward; the reserve flows on top of it
  // across the reserveStart→reserveEnd window; the deadline shakeout lands
  // wave1Rate cumulative opt-outs by Jul 25; the full optOutRate wave completes
  // Jul 31. Waypoints are clamped monotone so new observations re-anchor without
  // a dip. buildStaged builds one such line from a scenario (cody / codyPlus).
  const trendRate = (fL - obsF[obsF.length - 2].f) / (tL - obsF[obsF.length - 2].t);
  const codyEnd = dayOf('2026-07-31');
  const buildStaged = (p) => {
    const terminal = Math.round(fL + p.reserveSeats + (p.optOutRate * awardedBase - optOutsSoFar));
    // Post-reserve, pre-deadline lull: once the reserve has fully landed, growth
    // wanes back to the background trend until the Jul-deadline wave kicks in. For
    // a line whose reserve lands early (aggressive+), this restores the flat-then-
    // spike shape instead of one straight diagonal; for one whose reserve runs to
    // Jul 15 (aggressive churn) it sits inside the reserve leg and barely shows.
    const lull = dayOf('2026-07-14');
    const raw = [
      { t: dayOf(p.reserveStart), f: fL + trendRate * (dayOf(p.reserveStart) - tL) },
      { t: dayOf(p.reserveEnd), f: fL + trendRate * (dayOf(p.reserveEnd) - tL) + p.reserveSeats },
      { t: lull, f: fL + trendRate * (lull - tL) + p.reserveSeats },
      { t: dayOf('2026-07-25'), f: fL + (p.wave1Rate * awardedBase - optOutsSoFar) + p.reserveSeats },
      { t: codyEnd, f: terminal },
    ].sort((a, b) => a.t - b.t);
    const pts = [{ t: tL, f: fL }];
    for (const q of raw) {
      if (q.t <= tL) continue;
      pts.push({ t: q.t, f: Math.round(Math.max(q.f, pts[pts.length - 1].f)) });
    }
    const spline = monoSpline(pts);
    const fn = (t) =>
      t <= tL
        ? interp(obsF, t)
        : spline(Math.min(t, codyEnd)) + Math.max(0, t - codyEnd) * RECON_DRIFT;
    return { fn, terminal };
  };
  const { fn: codyFn, terminal: codyTerminal } = buildStaged(cody);
  const { fn: codyPlusFn, terminal: codyPlusTerminal } = buildStaged(codyPlus);

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
      row.bestGuess = Math.round(bestGuess(t));
      // Enforce the definitional ordering pessimistic ≤ churn ≤ churn+; the smooth
      // spline can otherwise introduce sub-100-seat crossings between the lines.
      row.cody = Math.max(Math.round(codyFn(t)), row.bestGuess);
      row.codyPlus = Math.max(Math.round(codyPlusFn(t)), row.cody);
    }
    series.push(row);
  }

  const kpis = {
    asOf: t2Observations[t2Observations.length - 1].date,
    frontierNow: fL,
    t2Remaining: T2_AT_LOTTERY - fL,
    optOutsSoFar,
    bgFunded: BG_FUNDED,
    bgOffer: BG_OFFER,
    bgTier3Ts: crossTs(bestGuess, T3_START),
    bgBandLoTs: crossTs(bestGuess, BAND_LO),
    codyTerminal,
    codyReserveSeats: cody.reserveSeats,
    codyTier3Ts: crossTs(codyFn, T3_START),
    codyBandLoTs: crossTs(codyFn, BAND_LO),
    codyBandHiTs: crossTs(codyFn, BAND_HI),
    codyPlusTerminal,
    codyPlusBandHiTs: crossTs(codyPlusFn, BAND_HI),
  };
  return { series, kpis };
}

const CASCADE = buildCascadeProjection();
const CASCADE_KPIS = CASCADE.kpis;
const FRONTIER_Y_MAX = Math.ceil(Math.max(BAND_HI, ...CASCADE.series.map((r) => Math.max(r.cody ?? 0, r.codyPlus ?? 0))) * 1.05 / 1000) * 1000;

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
    note: 'Inside the pessimistic-guess funded depth (~27,500). This is where the first real Tier 3 movement lands, just after the Jul 15 cascade.',
  },
  {
    band: '25,001 – 30,000',
    scope: 'mid Tier 3',
    call: 'Possible',
    tone: 'mid',
    note: 'Inside pessimistic-guess offer depth; turning that offer into a funded seat across the band needs ~+$20M more of the appeals reserve. Possible in July.',
  },
  {
    band: '30,001 – 50,000',
    scope: 'YOUR BAND',
    call: 'Bottom edge possible · rest unlikely in Year 1',
    tone: 'mid',
    ourBand: true,
    note: 'Only the first ~1,400 positions (to ~31,400) sit at the edge of pessimistic-guess offer depth — possible. Deeper in is upside-only: rank ~35k needs +$20M reserve, ~40k needs +$50M, the top (50k) nearly the whole pool. The aggressive-churn scenario is the bet the July cascade + reserve release pushes all the way through.',
  },
  {
    band: '50,001 +',
    scope: 'deep Tier 3 / Tier 4',
    call: 'Not expected',
    tone: 'bad',
    note: 'Requires decline rates well outside the historical 14–34% range plus nearly the entire reserve. Tier 4 does not move in Year 1 at all.',
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
  bestGuess: 'Pessimistic guess',
  cody: 'Aggressive churn',
  codyPlus: 'Aggressive+ (upper edge)',
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

// Payment plan options. Amounts are computed from the live balance below.
const PAYMENT_PLANS = {
  recommended: {
    label: 'Recommended (TEFA families)',
    note: 'Nanette\'s plan for TEFA families: five drafts starting in August. Shares: 15% / 15% / 15% / 15% / 40%.',
    shares: [0.15, 0.15, 0.15, 0.15, 0.4],
    dates: ['Aug 5, 2026', 'Oct 5, 2026', 'Dec 7, 2026', 'Feb 5, 2027', 'Apr 5, 2027'],
  },
  ten: {
    label: '10 month (standard FACTS)',
    note: 'Standard FACTS schedule: ten equal drafts starting July 6.',
    shares: Array(10).fill(0.1),
    dates: ['Jul 6, 2026', 'Aug 5, 2026', 'Sep 8, 2026', 'Oct 5, 2026', 'Nov 5, 2026',
      'Dec 7, 2026', 'Jan 5, 2027', 'Feb 5, 2027', 'Mar 5, 2027', 'Apr 5, 2027'],
  },
  full: {
    label: 'Pay in full',
    note: 'One draft after the July 15 TEFA deadline.',
    shares: [1],
    dates: ['Aug 5, 2026'],
  },
};

const VALID_TABS = ['now', 'money', 'timeline', 'tefa'];
const TAB_LABELS = { now: 'Now', money: 'Money', timeline: 'Timeline', tefa: 'TEFA' };

const IddingsPlanner = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = VALID_TABS.includes(tab) ? tab : 'now';
  const setTab = (t) => navigate(`/${t}`);

  const [planId, setPlanId] = useState('recommended');

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

  const plan = PAYMENT_PLANS[planId];
  const schedule = plan.dates.map((date, i) => ({
    number: i + 1,
    date,
    amount: balanceDue * plan.shares[i],
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
            plan={plan}
            planId={planId}
            setPlanId={setPlanId}
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
const MoneyView = ({ tuition, nbcaAid, scholarship, balanceDue, perStudent, plan, planId, setPlanId, schedule }) => {
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
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(PAYMENT_PLANS).map(([id, p]) => (
            <button
              key={id}
              onClick={() => setPlanId(id)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold border transition ${
                planId === id
                  ? 'bg-tefa-green text-white border-tefa-green'
                  : 'bg-white text-tefa-navy border-tefa-navy/20 hover:bg-tefa-navy/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-tefa-body/70 mb-4">{plan.note}</p>
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
          <strong>Bottom line:</strong> Tier 3 is expected to start in mid-to-late July, but our band sits at the far
          edge of even the pessimistic guess — only its very bottom (to ~{k.bgOffer.toLocaleString()}) is in reach, and a
          funded seat there isn't. Treat TEFA as a bonus, never as money you're counting on.
        </p>
      </section>

      {/* The two projections, on the metric that matters: cascade depth. */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> How far the line reaches — three projections
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          The chart tracks the <strong>cascade frontier</strong>: how far down the waitlist awards have reached.
          We show three lines — the grounded <strong>pessimistic guess</strong>, an <strong>aggressive churn</strong>{' '}
          scenario (a more optimistic opt-out bet), and a slightly-hotter <strong>aggressive+ upper edge</strong> that
          brackets the upside if the appeals reserve is releasing now. When a line crosses a band's threshold, the
          cascade has reached that band.
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
            <div className="text-xs text-tefa-navy/70 font-medium">Pessimistic Guess Reaches</div>
            <div className="font-bold text-tefa-navy text-lg">~{k.bgOffer.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">offer depth (funded ~{k.bgFunded.toLocaleString()}) · only the bottom edge of our band ({BAND_LO.toLocaleString()})</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
            <div className="text-xs text-tefa-red/70 font-medium">Aggressive Churn Reaches</div>
            <div className="font-bold text-tefa-red text-lg">~{k.codyTerminal.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">through our whole band by ~{fmtChartDate(k.codyBandHiTs)} · assumes 50% opt-out (above history) + $50M reserve</div>
          </div>
        </div>
        <p className="text-[10px] text-tefa-body/50 mb-3 -mt-2">
          <strong>Update — Jun 23, 2026.</strong> The Comptroller's office confirmed <strong>{JUNE23_CASCADE.t2Cascaded.toLocaleString()} more
          waitlisted students</strong> were awarded this week, all Tier 2 — funded by opt-outs and homeschool/other downgrades
          (which cut each award to $2,000). That advances the official frontier to <strong>{k.frontierNow.toLocaleString()}</strong>
          {' '}(from 7,417 on Jun 10) and brings the program to <strong>nearly 110,000 awarded</strong>, with{' '}
          <strong>~{JUNE23_CASCADE.optOuts.toLocaleString()} opt-outs</strong> leaving nearly 107,000 active awards.
        </p>
        <p className="text-[10px] text-tefa-body/50 mb-3 -mt-1">
          <strong>*</strong> The hollow pink dot marks the <strong>anecdotal ~{(EST_FRONTIER_TODAY / 1000).toFixed(0)}k</strong> frontline
          reading (documented Odyssey support cases, Jun 22–23 — one Tier 2 family's waitlist range moved ~15–20k → 4–5k in a single
          afternoon; another, ~17k cleared ahead of them). It runs <em>above</em> the official {k.frontierNow.toLocaleString()}, so it isn't the
          base case — it's the evidence behind the <span className="text-tefa-red font-semibold">aggressive+ upper edge</span>: if the appeals
          reserve really is releasing this fast, the frontier is ahead of the published count. Still unofficial (self-reported), so asterisked.
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
              <ReferenceLine y={T3_START} stroke="#b08a3e" strokeDasharray="8 4"
                  label={{ value: `Tier 3 starts — ${T3_START.toLocaleString()}`, position: 'insideBottomLeft', fontSize: 9, fontWeight: 600, fill: '#b08a3e' }} />
              <ReferenceLine y={BAND_LO} stroke="#aa2142" strokeDasharray="8 4"
                  label={{ value: `T3 Middle band starts — ${BAND_LO.toLocaleString()}`, position: 'insideTopLeft', fontSize: 9, fontWeight: 600, fill: '#aa2142' }} />
              <ReferenceLine y={BAND_HI} stroke="#aa2142" strokeDasharray="8 4"
                  label={{ value: `T3 Middle band ends — ${BAND_HI.toLocaleString()}`, position: 'insideTopLeft', fontSize: 9, fontWeight: 600, fill: '#aa2142' }} />
              <Line type="monotone" dataKey="observedLine" name="Funded so far (published)" stroke="#202562" strokeWidth={2.5} dot={false} legendType="none" />
              <Line type="monotone" dataKey="bestGuess" name="Pessimistic guess" stroke="#202562" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cody" name="Aggressive churn" stroke="#aa2142" strokeWidth={2.5} strokeDasharray="8 3" dot={false} />
              <Line type="monotone" dataKey="codyPlus" name="Aggressive+ (upper edge)" stroke="#e8889b" strokeWidth={2} strokeDasharray="2 3" dot={false} />
              <Scatter dataKey="observed" name="Published data" fill="#202562" />
              {/* Anecdotal frontline reading — hollow dot above the official line, supporting the aggressive+ path. */}
              <ReferenceDot x={todayTs} y={EST_FRONTIER_TODAY} r={5} fill="#fff" stroke="#e8889b" strokeWidth={2} strokeDasharray="2 1.5"
                  label={{ value: `anecdotal ~${(EST_FRONTIER_TODAY / 1000).toFixed(0)}k*`, position: 'right', fontSize: 9, fontWeight: 700, fill: '#aa2142' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 mt-3 space-y-1">
          <div><strong>What's plotted.</strong> The frontier is derived from the published Tier 2 backlog (frontier = {T2_AT_LOTTERY.toLocaleString()} at-lottery − Tier 2 still queued): 0 on May 4 → {k.frontierNow.toLocaleString()} on {fmtChartDate(Date.parse(k.asOf))}. The line ahead clears at roughly <strong>3.7 seats per opt-out</strong> — homeschool/other downgrades free $8,474 of each $10,474 award, and appeals-reserve awards free seats with no opt-out at all — so we measure progress in seats reached, not raw opt-outs.</div>
          <div><strong>Pessimistic guess (grounded).</strong> A blended 15/18/35% non-participation plus ~$25M of the inferred $100M+ appeals reserve. Tier 2 clears ~{fmtChartDate(k.bgTier3Ts)}, and the cascade settles around offer depth ~{k.bgOffer.toLocaleString()} (funded ~{k.bgFunded.toLocaleString()}) — just reaching the bottom edge of our band ~{fmtChartDate(k.bgBandLoTs)}.</div>
          <div><strong>Aggressive churn (staged — the upper edge, not a forecast).</strong> Three legs. First, the current pace continues, with <strong>$50M of the inferred ~$100M appeals reserve</strong> (~{k.codyReserveSeats.toLocaleString()} blended seats) flowing on top of it <strong>Jun 15 – Jul 15</strong> as appeals resolve — that stretch reads as "trend + reserve." Then the deadline shakeout lands <strong>25% cumulative opt-outs by Jul 25</strong>, and the wave completes at <strong>50% of the awarded base by Jul 31</strong>. That 50% sits <em>above</em> the 14–34% range seen in D.C., Milwaukee and Virginia, so it's the optimistic ceiling, not the expectation. Under it Tier 3 offers start ~{fmtChartDate(k.codyTier3Ts)} and the cascade clears our whole band by ~{fmtChartDate(k.codyBandHiTs)}.</div>
          <div><strong>After Aug 1 — the lines don't stop cold.</strong> Some share of confirmed students never actually enroll (historically ~5% no-show in comparable programs), and those seats — plus other recovered funds — reconcile through August and September. Both lines carry a steady ~{RECON_DRIFT}/day drift after their main waves complete, so the curve keeps creeping rather than going flat.</div>
          <div><strong>Watch — appeals-reserve release (~mid-June).</strong> Appeals are filed within 30 days of notice (T1 ~closed May 24 · T2 ~Jun 3 · waitlist ~Jun 12); unused reserve cascades to the waitlist. As the last windows close, a reserve release could move the line independent of opt-outs — the main thing that could push the real outcome toward the aggressive-churn ceiling.</div>
        </div>
      </section>
    </div>
  );
};

export default IddingsPlanner;
