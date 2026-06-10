import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Scale,
  Users,
} from 'lucide-react';

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
  notifiedOn: '2026-05-13',
};

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

const VALID_TABS = ['now', 'money', 'timeline'];

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
                className={`px-4 py-2 rounded-full transition capitalize ${
                  activeTab === t
                    ? 'bg-white text-tefa-navy font-bold'
                    : 'text-white border border-white/20 hover:text-tefa-sky'
                }`}
              >
                {t}
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

export default IddingsPlanner;
