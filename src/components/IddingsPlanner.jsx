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
} from 'recharts';

// ---------------------------------------------------------------------------
// Single source of truth for the family's real numbers. Everything the page
// shows is derived from the data in this block — update here if a figure changes.
// ---------------------------------------------------------------------------

const TODAY = '2026-06-10';

// Per-child 2026-27 gross tuition and the NBCA financial aid already granted.
const STUDENTS = [
  { name: 'Cassius', grade: '9th Grade', tuition: 16790, nbcaAid: 5850, scholarship: 4000 },
  { name: 'Dorothy', grade: '7th Grade', tuition: 16050, nbcaAid: 5600, scholarship: 4000 },
  { name: 'Sebastian', grade: '4th Grade', tuition: 15185, nbcaAid: 4750, scholarship: 4000 },
];

const SIBLING_DISCOUNT = 1518.5;   // FACTS applies the family sibling discount to Sebastian's account.
const ENROLLMENT_FEE_PAID = 690;   // ($175 + $55) x 3 — paid Apr 2, non-refundable.

// TEFA waitlist status — the bucket the Comptroller texted us on May 13.
const TEFA = {
  tier: 'Tier 3 (200–500% FPL)',
  band: '30,001 – 50,000',
  bandLo: 30001,
  notifiedOn: '2026-05-13',
};

// ---------------------------------------------------------------------------
// TEFA opt-out trajectory — observed Comptroller counts + deadline-pulse model.
// Feeds the TEFA tab. All published (empirical) numbers live in the two
// *_OBSERVATIONS arrays; everything else is derived.
// ---------------------------------------------------------------------------

const AWARDED_BASE = 95934;       // initially awarded (44,753 T1-family + 51,181 T2) — attrition base
const T2_AT_LOTTERY = 20383;      // Tier 2 waitlisted ahead of Tier 3 at lottery time (May 7 PDF)
const T3_BAND_START = TEFA.bandLo - T2_AT_LOTTERY; // ≈ 9,618 — our band's start, in Tier 3 positions

// Jun 10, 2026 Comptroller press release ("TEFA Pass 100,000-Student Milestone").
// Reconciliation: 99,728 gross (May 29) + ~4,100 = 103,828 ≈ "more than 102,000";
// 248,636 eligible − 103,828 = 144,808 ≈ "nearly 145,000 remain on the waitlist";
// 17,066 − 4,100 = 12,966 ≈ "nearly 13,000 Tier 2 applicants" still waitlisted.
const JUNE10_CASCADE = {
  asOf: '2026-06-10',
  t2Cascaded: 4100,               // "more than 4,100" newly awarded, all Tier 2
  optOuts: 2000,                  // "about 2,000" cumulative opt-outs to date
  grossAwardedApprox: 103828,
  t2RemainingAfterCascade: 12966,
};

// Published cumulative opt-out counts — the ONLY empirical opt-out data so far.
// APPEND new Comptroller posts here: the trickle rate re-fits (least squares)
// and the projection re-anchors to the newest point automatically.
const OPTOUT_OBSERVATIONS = [
  { date: '2026-05-11', cumOptOuts: 0 },    // opt-in portal opens — baseline
  { date: '2026-05-29', cumOptOuts: 1400 }, // May 29 News & Updates (~1,400)
  { date: '2026-06-10', cumOptOuts: 2000 }, // Jun 10 press release (~2,000)
];

// Observed Tier 2 backlog still ahead of Tier 3 (from the cascade posts). APPEND likewise.
const T2_OBSERVATIONS = [
  { date: '2026-05-04', t2Remaining: 20383 }, // Tier 2 award batch — backlog established
  { date: '2026-05-29', t2Remaining: 17066 }, // after 3,317 cascade awards
  { date: '2026-06-10', t2Remaining: 12966 }, // after 4,100 more cascade awards
];

// Deadline pulses. weight = share of the non-trickle opt-out mass; center sits one
// day before each deadline (decisions cluster in the final days); scale = logistic
// ramp width in days. Weights are assumptions, not data: Jul 15 carries the
// majority (0.55) because the Comptroller's own materials make it the single
// largest attrition event of Year 1; Jul 1 sticker-shock (families see only
// ~$2,618 of a $10,474 award against a full tuition bill) gets 0.20; Jun 15
// July-track school confirmation 0.10; 0.15 tails off through Sept 15. The
// observed deceleration (77.8/day May 11–29 → 50/day May 29–Jun 10) supports
// back-loading.
const OPTOUT_TRIGGERS = [
  { date: '2026-06-01', label: 'Jun 1 opt-in',     pulse: null },
  { date: '2026-06-15', label: 'Jun 15 confirm',   pulse: { weight: 0.10, scale: 2 } },
  { date: '2026-07-01', label: 'Jul 1 first 25%',  pulse: { weight: 0.20, scale: 2 } },
  { date: '2026-07-15', label: 'Jul 15 DEADLINE',  pulse: { weight: 0.55, scale: 1.5 }, emphasized: true },
  { date: '2026-07-31', label: 'Jul 31 confirm',   pulse: null },
  { date: '2026-08-15', label: null,               pulse: { weight: 0.15, scale: 10 } }, // post-deadline tail (no chart line)
  { date: '2026-09-15', label: 'Sep 15 proration', pulse: null },
];

const OPTOUT_SCENARIOS = [
  { key: 'low',     rate: 0.08, color: '#9ad5ed', label: '8% (low)' },
  { key: 'central', rate: 0.15, color: '#202562', label: '15% (central)' },
  { key: 'high',    rate: 0.25, color: '#13612e', label: '25% (high)' },
];

// Model origin = opt-out baseline (portal open). Chart extends back to the first
// T2 observation (May 4) and forward to the proration cutoff.
const OPTOUT_WINDOW = { origin: '2026-05-11', chartStart: '2026-05-04', end: '2026-09-15' };

// Opt-out trajectory model. Cumulative opt-outs decompose into (a) a baseline
// "trickle" fitted by least squares through the origin to the published counts,
// and (b) normalized logistic deadline pulses whose combined mass closes the gap
// between the trickle and each scenario's terminal (rate × 95,934 initially
// awarded). The normalization guarantees every scenario curve passes exactly
// through the last observation and lands exactly on its terminal at Sept 15.
// Pure function of the constants above; computed once at module scope.
function buildOptOutTrajectory({
  observations = OPTOUT_OBSERVATIONS,
  t2Observations = T2_OBSERVATIONS,
  scenarios = OPTOUT_SCENARIOS,
  triggers = OPTOUT_TRIGGERS,
  awardedBase = AWARDED_BASE,
  window: win = OPTOUT_WINDOW,
} = {}) {
  const DAY = 86_400_000;
  const t0 = Date.parse(win.origin); // day 0 = May 11
  const dayOf = (d) => Math.round((Date.parse(d) - t0) / DAY);
  const sigma = (x) => 1 / (1 + Math.exp(-x));

  const obs = observations.map((o) => ({ t: dayOf(o.date), y: o.cumOptOuts }));
  const t2Obs = t2Observations.map((o) => ({ t: dayOf(o.date), y: o.t2Remaining }));
  const tEnd = dayOf(win.end);               // 127 (Sep 15)
  const tChartStart = dayOf(win.chartStart); // −7 (May 4)
  const [tL, yL] = [obs[obs.length - 1].t, obs[obs.length - 1].y]; // last published point

  // Trickle: least squares through the origin (the May 11 baseline of 0 is exact).
  const fitPts = obs.filter((o) => o.t > 0);
  const m = fitPts.reduce((s, o) => s + o.t * o.y, 0) / fitPts.reduce((s, o) => s + o.t * o.t, 0);

  // Trickle runs at m/day until the hard deadline, then stops (the tail pulse
  // carries the post-deadline drip).
  const tHard = dayOf(triggers.find((g) => g.emphasized).date); // 65 (Jul 15)
  const trickleTotal = yL + m * (tHard - tL);

  // Normalized logistic pulses: each is 0 at the last observation, 1 at Sept 15.
  const pulses = triggers
    .filter((g) => g.pulse)
    .map((g) => ({ c: dayOf(g.date) - 1, s: g.pulse.scale, w: g.pulse.weight }));
  const pulseSum = (t) =>
    pulses.reduce((sum, p) => {
      const lo = sigma((tL - p.c) / p.s);
      const hi = sigma((tEnd - p.c) / p.s);
      return sum + p.w * ((sigma((t - p.c) / p.s) - lo) / (hi - lo));
    }, 0);

  const terminals = scenarios.map((sc) => ({ ...sc, T: Math.round(sc.rate * awardedBase) }));
  const cum = (t, T) => {
    if (t <= tL) return interp(obs, t);
    const P = Math.max(0, T - trickleTotal);
    return yL + m * (Math.min(t, tHard) - tL) + P * pulseSum(t);
  };
  function interp(pts, t) {
    if (t <= pts[0].t) return pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      if (t <= pts[i].t) {
        const [a, b] = [pts[i - 1], pts[i]];
        return a.y + ((b.y - a.y) * (t - a.t)) / (b.t - a.t);
      }
    }
    return pts[pts.length - 1].y;
  }

  // T2 depletion bounds. Conservative: only opt-outs free seats (1 release per
  // opt-out) — a floor, since the observed cumulative ratio is ~3.7 releases per
  // opt-out (7,417 cascade awards vs 2,000 opt-outs: homeschool downgrades free
  // $8,474 of $10,474 and the appeals reserve adds awards without any opt-out).
  // Observed-pace: the budget/reserve-driven cascade continues at its latest
  // window pace — an upper bound on speed, since that fuel is finite.
  const t2Last = t2Obs[t2Obs.length - 1];
  const t2Prev = t2Obs[t2Obs.length - 2];
  const releaseRate = (t2Prev.y - t2Last.y) / (t2Last.t - t2Prev.t); // ≈ 342/day
  const centralT = terminals.find((s) => s.key === 'central').T;
  const t2Cons = (t) => Math.max(0, t2Last.y - (cum(t, centralT) - yL));
  const t2Pace = (t) => Math.max(0, t2Last.y - releaseRate * (t - t2Last.t));

  const series = [];
  for (let t = tChartStart; t <= tEnd; t++) {
    const row = { ts: t0 + t * DAY };
    const od = obs.find((o) => o.t === t);
    if (od) row.observed = od.y;
    const t2d = t2Obs.find((o) => o.t === t);
    if (t2d) row.t2Observed = t2d.y;
    if (t >= 0 && t <= tL) row.observedLine = interp(obs, t);
    if (t >= t2Obs[0].t && t <= t2Last.t) row.t2ObservedLine = interp(t2Obs, t);
    if (t >= tL) {
      row.pace = Math.round(yL + m * (t - tL));
      for (const sc of terminals) row[sc.key] = Math.round(cum(t, sc.T));
      row.t2Cons = Math.round(t2Cons(t));
      row.t2Pace = Math.round(t2Pace(t));
    }
    series.push(row);
  }

  const jul15 = Object.fromEntries(terminals.map((sc) => [sc.key, Math.round(cum(tHard, sc.T))]));
  const paceWindows = fitPts.map((o, i) => {
    const prev = i === 0 ? { t: 0, y: 0 } : fitPts[i - 1];
    return (o.y - prev.y) / (o.t - prev.t);
  });
  const t2ClearOptOuts = yL + t2Last.y; // cumulative opt-outs at which T2 clears, 1:1
  const t2ClearDayAtPace = t2Last.t + t2Last.y / releaseRate;
  const kpis = {
    asOf: observations[observations.length - 1].date,
    observedToDate: yL,
    dailyPaceFit: m,
    paceByWindow: paceWindows,
    paceAtJul15: Math.round(yL + m * (tHard - tL)),
    jul15,
    terminals: Object.fromEntries(terminals.map((sc) => [sc.key, sc.T])),
    t2Remaining: t2Last.y,
    t2ClearOptOuts,
    t2ClearRate: t2ClearOptOuts / awardedBase,
    releaseRate,
    t2ClearTsAtPace: t0 + t2ClearDayAtPace * DAY,
    cascadeRatio: (T2_AT_LOTTERY - t2Last.y) / yL, // observed cumulative releases per opt-out ≈ 3.7
    tHardTs: t0 + tHard * DAY,
  };
  return { series, kpis };
}

const OPTOUT_TRAJECTORY = buildOptOutTrajectory();
const OPTOUT_KPIS = OPTOUT_TRAJECTORY.kpis;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtChartDate = (ts) => {
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const OPTOUT_TICKS = ['2026-05-04', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01', '2026-09-15'].map(Date.parse);

// The dates that actually require a decision or a payment, in order.
const TIMELINE = [
  { date: 'Jun 15', iso: '2026-06-15', title: 'Accept NBCA scholarship', kind: 'do',
    detail: 'Reply to NBCA to lock in the $12,000 scholarship ($4,000 per child).' },
  { date: 'End of June', iso: '2026-06-29', title: 'ACE scholarship decision', kind: 'wait',
    detail: 'ACE said decisions arrive by the end of June. Any award lowers the balance further.' },
  { date: 'End of June', iso: '2026-06-29', title: 'Decide: all three at NBCA, or just Cassius?', kind: 'decide',
    detail: 'Nanette confirmed the full $12,000 scholarship can go to one child instead of $4,000 three ways. Settle whether to enroll all three or send only Cassius (with the whole scholarship, covering his tuition) while Dorothy and Sebastian stay at the School of Science and Technology. The trade-off is cost vs. a two-school commute. Reply to Nanette and decide alongside the June 30 withdrawal deadline.' },
  { date: 'Jun 30', iso: '2026-06-30', title: 'Penalty-free withdrawal deadline', kind: 'decide',
    detail: 'Last day to withdraw from NBCA losing only the $690 enrollment fee. After this: 10% penalty ($4,802.50) in July, 20% ($9,605) in August.' },
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

const usd = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const usd2 = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    { date: 'End of June', text: 'Watch for the ACE scholarship decision — it could lower the bill.', done: false },
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
              Tuition is owed and penalties bind: 10% ($4,802.50) in July, 20% ($9,605) in August.
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
// TEFA — observed opt-out trajectory vs. modeled expectations
// ---------------------------------------------------------------------------
const TefaView = () => {
  const k = OPTOUT_KPIS;
  const todayTs = Math.min(
    Math.max(Date.now(), Date.parse(OPTOUT_WINDOW.chartStart)),
    Date.parse(OPTOUT_WINDOW.end)
  );

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> Opt-out trajectory — why the trickle isn't the wave
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          The pre-deadline trickle is <strong>decelerating</strong> ({Math.round(k.paceByWindow[0])}/day May 11–29
          → {Math.round(k.paceByWindow[1])}/day since) — at the fitted ~{Math.round(k.dailyPaceFit)}/day it reaches
          only <strong>~{k.paceAtJul15.toLocaleString()} by Jul 15</strong>, far short of the{' '}
          {k.terminals.central.toLocaleString()} central case. The wave is back-loaded to the July deadlines by
          program design. Meanwhile the cascade is running{' '}
          <strong>~{k.cascadeRatio.toFixed(1)} Tier 2 awards per opt-out</strong> (appeals reserve + homeschool
          downgrades) — which is why the queue ahead of us is shrinking faster than opt-outs alone would allow.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm mb-4">
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">Observed Opt-Outs</div>
            <div className="font-bold text-tefa-navy text-lg">{k.observedToDate.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">as of {fmtChartDate(Date.parse(k.asOf))} · pace decelerating</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">Pace Alone → Jul 15</div>
            <div className="font-bold text-tefa-navy text-lg">~{k.paceAtJul15.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">vs {k.terminals.central.toLocaleString()} central — wave must be deadline-driven</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">Modeled by Jul 15</div>
            <div className="font-bold text-tefa-navy text-lg">~{(Math.round(k.jul15.central / 100) / 10).toFixed(1)}k</div>
            <div className="text-[10px] text-tefa-body/40">range {(Math.round(k.jul15.low / 100) / 10).toFixed(1)}k–{(Math.round(k.jul15.high / 100) / 10).toFixed(1)}k (8–25%)</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
            <div className="text-xs text-tefa-body/50 font-medium">T2 Still Ahead of T3</div>
            <div className="font-bold text-tefa-gold text-lg">{k.t2Remaining.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">clears at {k.t2ClearOptOuts.toLocaleString()} opt-outs ({(k.t2ClearRate * 100).toFixed(1)}%) or ~{fmtChartDate(k.t2ClearTsAtPace)} at observed pace</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-tefa-red/20 p-3 text-center">
            <div className="text-xs text-tefa-red/70 font-medium">Our T3 Band</div>
            <div className="font-bold text-tefa-red text-lg">≥ {T3_BAND_START.toLocaleString()}</div>
            <div className="text-[10px] text-tefa-body/40">into T3 · 25% case reaches ~{(k.terminals.high - k.t2ClearOptOuts).toLocaleString()} at 1:1 — any amplification ({k.cascadeRatio.toFixed(1)}× observed) crosses in</div>
          </div>
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={OPTOUT_TRAJECTORY.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="ts" scale="time" domain={['dataMin', 'dataMax']}
                     ticks={OPTOUT_TICKS} tickFormatter={fmtChartDate} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="optouts" tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }}
                     label={{ value: 'Cumulative opt-outs', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <YAxis yAxisId="t2" orientation="right" domain={[0, 20383]} tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                     tick={{ fontSize: 11 }} label={{ value: 'T2 ahead of T3', angle: 90, position: 'insideRight', fontSize: 11 }} />
              <ChartTooltip labelFormatter={fmtChartDate}
                            formatter={(v, name) => [Math.round(v).toLocaleString(), name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {OPTOUT_TRIGGERS.filter((g) => g.label).map((g, i) => (
                <ReferenceLine key={g.date} yAxisId="optouts" x={Date.parse(g.date)}
                    stroke={g.emphasized ? '#aa2142' : 'rgba(32,37,98,0.25)'} strokeWidth={g.emphasized ? 1.5 : 1}
                    label={{ value: g.label, position: g.date === '2026-09-15' ? 'insideTopRight' : 'insideTop', dy: i % 2 ? 14 : 2, fontSize: 9, fontWeight: g.emphasized ? 700 : 400, fill: g.emphasized ? '#aa2142' : 'rgba(32,37,98,0.55)' }} />
              ))}
              <ReferenceLine yAxisId="optouts" x={todayTs} stroke="#aa2142" strokeDasharray="2 2"
                  label={{ value: 'Today', fontSize: 10, fill: '#aa2142', position: 'insideBottomLeft' }} />
              <Line yAxisId="optouts" dataKey="observedLine" name="Observed opt-outs" stroke="#aa2142" strokeWidth={2} dot={false} legendType="none" />
              <Line yAxisId="optouts" dataKey="pace" name="Current pace only" stroke="#94a3b8" strokeDasharray="6 4" dot={false} />
              <Line yAxisId="optouts" dataKey="low" name="8% terminal" stroke="#9ad5ed" dot={false} />
              <Line yAxisId="optouts" dataKey="central" name="15% central" stroke="#202562" strokeWidth={2.5} dot={false} />
              <Line yAxisId="optouts" dataKey="high" name="25% terminal" stroke="#13612e" dot={false} />
              <Line yAxisId="t2" dataKey="t2ObservedLine" name="T2 ahead (observed)" stroke="#d8ab61" strokeWidth={2} dot={false} legendType="none" />
              <Line yAxisId="t2" dataKey="t2Cons" name="T2 ahead — opt-outs only (15%)" stroke="#d8ab61" dot={false} />
              <Line yAxisId="t2" dataKey="t2Pace" name="T2 ahead — observed cascade pace" stroke="#d8ab61" strokeDasharray="5 3" dot={false} />
              <Scatter yAxisId="optouts" dataKey="observed" name="Published opt-out counts" fill="#aa2142" />
              <Scatter yAxisId="t2" dataKey="t2Observed" name="Published T2 backlog" fill="#d8ab61" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 mt-3 space-y-1">
          <div><strong>Assumptions.</strong> Scenario terminals = rate × {AWARDED_BASE.toLocaleString()} initially awarded. Trickle = least-squares fit through every published count (May 29: ~1,400 · Jun 10: ~2,000); it re-fits automatically as new posts are appended to <code>OPTOUT_OBSERVATIONS</code>.</div>
          <div>Deadline pulse weights — Jun 15: 10% · Jul 1: 20% · <strong>Jul 15: 55%</strong> · post-deadline tail: 15% — with ~5–7-day logistic ramps. Curves pass exactly through the last observation and land exactly on their terminals at Sep 15.</div>
          <div>T2 depletion is shown as bounds: <em>opt-outs only</em> (1 release per opt-out — a floor) vs. <em>observed cascade pace</em> (~{Math.round(k.releaseRate)}/day, budget/reserve-driven — a ceiling on speed; that fuel is finite). Observed cumulative ratio: ~{k.cascadeRatio.toFixed(1)} releases per opt-out, because homeschool/other downgrades free $8,474 of each $10,474 award and appeals-reserve awards need no opt-out at all.</div>
          <div>Cascade recipients ({JUNE10_CASCADE.grossAwardedApprox.toLocaleString()} gross awarded) can themselves opt out; excluded to keep the base consistent.</div>
        </div>
        <p className="text-xs text-tefa-body/50 mt-3">
          Bottom line, unchanged: even the 25% curve only reaches ~{(k.terminals.high - k.t2ClearOptOuts).toLocaleString()} into
          Tier 3 at one release per opt-out — short of our band at {T3_BAND_START.toLocaleString()}. The observed{' '}
          {k.cascadeRatio.toFixed(1)}× amplification is the genuine upside lever, but it depends on finite reserve fuel.
          Treat TEFA as a bonus; don't budget around it.
        </p>
      </section>
    </div>
  );
};

export default IddingsPlanner;
