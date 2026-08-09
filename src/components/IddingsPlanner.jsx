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
  ShoppingCart,
  RotateCcw,
  Tag,
  Package,
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

const TODAY = '2026-07-29';

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

// ---------------------------------------------------------------------------
// Our CURRENT standing, from the personal Odyssey update on Jul 29, 2026:
// "your range is 15,001 – 20,000". Per the waitlist mechanics, the displayed
// range is our ORIGINAL position minus the depth the cascade has funded — so this
// is the first datum that pins our original position instead of assuming it.
//
// The arithmetic:  original = displayed range + depth already pulled ahead of us.
// Against the Jul 29 frontier (~34,000): 15,001–20,000 + 34,000 = 49,001–54,000,
// and the May 13 Comptroller text capped our band at 50,000 — so the top of that
// interval is truncated and we land at 49,001–50,000: the very BOTTOM of our band.
//
// Why not the softer 45,001–50,000 read (which a 30,000 credit would give)? Because
// the displayed range is what the state says is still AHEAD of us, and it is the one
// datum specific to our family. Anchoring on it avoids having to first settle whether
// the true depth is the community's 34,000 or the ~30,000 implied by a 45k position —
// the gap is 15,001–20,000 either way. Taking the optimistic edge instead would pair a
// 34,000 frontier with a position derived from a 30,000 credit, which is incoherent.
//
// A staleness check rules out the hopeful alternative: if the display still reflected
// Pillow's Jul 11 depth (~17,000), our original would be 32,001–37,000 — but a 34,000
// frontier would then already have PASSED us and Odyssey would be showing ~0 ahead,
// not 15,001–20,000. The display cannot be both lagging and showing that range, so the
// credited depth really is ~30–34k and we are at the deep end regardless.
// ---------------------------------------------------------------------------
const CURRENT_RANGE = { lo: 15001, hi: 20000, asOf: '2026-07-29' };
// Depth already pulled ahead of us — the Jul 29 frontier (kept in sync with
// T2_OBSERVATIONS' last entry below; asserted at load so the two can't drift).
const CREDITED_DEPTH = 34000;
// Cody's own original lottery position — DERIVED from the Jul 29 personal range, then
// truncated by the May 13 band ceiling (the chart's y-axis is original position, so the
// frontier must reach THIS to fund us). → 49,001 – 50,000.
const YOUR_POS = {
  lo: Math.min(CURRENT_RANGE.lo + CREDITED_DEPTH, TEFA.bandHi),
  hi: Math.min(CURRENT_RANGE.hi + CREDITED_DEPTH, TEFA.bandHi),
};

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
// This bounds the cascade hard: the moved-aside count CANNOT exceed the not-yet-
// opted-in pool, because everyone else has already locked in. The only open
// question is what SHARE of that pool fails to confirm — realistically 30–50%.
//
// UPDATE (Jul 11, 2026): Travis Pillow, answering in the TEFA Facebook group,
// gave TWO hard numbers as the Jul 15 deadline nears:
//   • "subtract about 17,000 from your original [waitlist] position" — the funded
//     cascade frontier is now ~17,000 deep. This CONFIRMS our model's 16,916
//     (Jul 8) frontier; nothing to re-anchor, the observed track was right.
//   • "how many of the current 18,000 families who have not opted in act before
//     the deadline" — the not-opted-in pool has fallen to a PUBLISHED ~18,000,
//     down from the ~34,000 that hadn't activated on Jul 1. So ~16,000 of that
//     Jul-1 remainder have since opted IN (locking in their own awards — they
//     free NO seats), leaving 18,000 laggards as the entire pool that can still
//     be moved aside. Pillow also flagged "a new group of families awarded after
//     next week [~after Jul 18], but the exact number will depend on how many of
//     the … 18,000 … act before the deadline" — i.e. the post-deadline award
//     batch is sized directly by the moved-aside share of this 18,000.
//
// This is a big DOWNWARD revision of the fuel: the churn pool is now 18,000, not
// 34,000, so the moved-aside count cannot exceed 18,000. Per this file's
// "published numbers win" rule we anchor the cascade on the 18,000, not the
// derived 34,000. Consequence (see terminals below): even 100% of the 18,000
// leaving tops out at ~37,900 — the family's 45k seat is now mathematically out
// of reach this year, and the realistic 30–50% band falls SHORT of the 30,001
// band start entirely (reaching it would take ~62% of the laggards moved aside).
//
// UPDATE (Jul 29, 2026) — THE DEADLINE SHAKEOUT FIRED, AND IT WAS BIG.
// Unofficial community number: ~34,000 have now been pulled off the waitlist —
// i.e. the cascade frontier stands at ~34,000, not the ~17,000 of Jul 11. That is
// an advance of ~17,084 in 21 days, and it is the Jul 15 deadline sweep landing
// exactly as Travis Pillow described ("a new group of families awarded after next
// week … sized by how many of the 18,000 act").
//
// TWO structural consequences:
//   1. TIER 2 IS CLEARED. The Tier 2 backlog was 20,383 at the lottery; a frontier
//      of 34,000 is ~13,600 positions INTO Tier 3. Every prior observation was
//      recorded as "Tier 2 remaining", which now goes negative — so observations
//      below carry an explicit `frontier` and the t2Remaining framing is retired.
//   2. THE 18,000 LAGGARD POOL IS MOSTLY SPENT. It was the only fuel source in the
//      Jul 11 model, and the Jul 29 advance consumed most of it. What remains is
//      no longer a deadline event — it's the residual laggard tail plus ordinary
//      August attrition. The forward model is rebuilt on those two terms below.
//
// This does NOT mean the cascade stops: the user's read is that churn continues,
// and the mechanism is real (August withdrawals, no-shows, late school changes).
// It means the remaining advance is a slower grind, not another cliff.
// ---------------------------------------------------------------------------
const FUNDED_JULY1 = 73000;                       // "nearly 73,000" funded Jul 1 (Jun 30 release)
const REMAINDER = ACTIVE_AWARDS - FUNDED_JULY1;   // ~34,000 not activated Jul 1 (historical — superseded)
// Jul 11 published pool: not-yet-opted-in families still able to be moved aside.
// This was the whole fuel pool BEFORE the Jul 15 deadline; the Jul 29 advance drew
// most of it down. It is now the pool we back the consumption out OF, not the pool
// the forward scenarios scale directly.
const NOT_OPTED_IN = 18000;                       // Travis Pillow, Jul 11 — "the current 18,000 … who have not opted in"
const CHURN_POOL = NOT_OPTED_IN;                  // pre-deadline pool; see remainingPool() for what's actually left

// ---------------------------------------------------------------------------
// FORWARD FUEL after the Jul 29 draw — two terms, both modest, both real.
//
//  (A) RESIDUAL LAGGARD TAIL. The 18,000 drained two different ways between Jul 11
//      and Jul 29: some OPTED IN (locking their own award — frees nothing) and some
//      were MOVED ASIDE (frees a seat). Only the second kind produced the observed
//      advance, so we can back it out: the seats the advance actually funded, divided
//      by seats-per-departure, is how many departures it took. Whatever is left of
//      the 18,000 is the tail — and most of THOSE opted in rather than walked, so only
//      a modest slice (`tailShare`) is still available to be swept by Jul 31 / August.
//
//  (B) AUGUST ATTRITION. Ordinary summer melt on the funded base: families who took
//      the ESA and then withdrew, moved, or never showed up in August. Small as a rate
//      (0.5–1.5%) but applied to a base of ~80,000, so it is not negligible.
//
// Note the self-consistency this buys: a scenario with a HIGH decline rate needed
// FEWER departures to produce the observed 17,084-deep advance (each freed seat got
// offered further down before it stuck), so it leaves MORE tail in reserve — and a
// low-decline scenario burned more pool to get here and has less left. The back-out
// makes the levers cohere with the observation instead of floating free of it.
// ---------------------------------------------------------------------------
const TAIL_SHARE = { low: 0.15, likely: 0.25, high: 0.35 };  // slice of the surviving laggards still to be swept
const AUG_ATTRITION = { low: 0.005, likely: 0.010, high: 0.015 }; // August melt on the funded base

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
// that LEAVES an award without taking a full private seat. With the Jul 11 pool count
// in hand, the fuel is no longer a guessed rate on all 107k, nor even a share of the
// ~34,000 Jul-1 remainder — it's a SHARE of the PUBLISHED 18,000 who still have not
// opted in with the deadline days away. The appeals reserve has already fired (Jul 8,
// ~4,000 seats, now in frontier-now), so it no longer adds a forward term. A scenario's
// terminal OFFER frontier ≈
//   frontier-now (16,916)  +  movedAsideShare × 18,000 × seats-per-departure ÷ acceptRate  +  0 reserve.
// Each moved-aside family frees a seat one of two ways, and BOTH are counted via the
// opt-out:downgrade split in seatsPerDeparture: a full opt-out frees the whole award
// (~$10,474), a drop to the $2,000 homeschool tier frees only the difference (~$8,474).
// The ÷ acceptRate is the never-activation stretch: a deep offeree who declines frees no new
// money, it just passes the same dollars to the next position — so the OFFER travels 1/acceptRate
// as deep as the funded-seat count. (Superseded Jul 29: with our seat pinned at 49,001 the
// stretch no longer suffices in the central case — see the Jul 29 block above.)

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

// Observed cascade depth. Points recorded BEFORE Tier 2 cleared carry the Tier 2
// backlog (frontier = T2_AT_LOTTERY − t2Remaining); from Jul 29 the frontier runs
// past the 20,383 Tier 2 backlog, so `t2Remaining` would go negative and the point
// carries an explicit `frontier` instead. APPEND new observations here and both the
// observed line and the projections re-anchor to the newest point automatically.
const T2_OBSERVATIONS = [
  { date: '2026-05-04', t2Remaining: 20383 }, // Tier 2 award batch — backlog established (frontier 0)
  { date: '2026-05-29', t2Remaining: 17066 }, // after 3,317 cascade awards
  { date: '2026-06-10', t2Remaining: 12966 }, // after 4,100 more cascade awards
  { date: '2026-06-23', t2Remaining: 7467 },  // after 5,499 more cascade awards (Jun 23 update) → frontier 12,916
  { date: '2026-07-08', t2Remaining: 3467 },  // Jul 8: ~4,000 more awarded off the now-spent appeals reserve → frontier 16,916 (still Tier 2)
  // Jul 29: the Jul 15 deadline shakeout lands. UNOFFICIAL community number — ~34,000
  // now pulled off the waitlist. Tier 2 is fully cleared and the cascade is ~13,600
  // positions into Tier 3. Corroborated within ~4,000 by our own Odyssey range moving
  // to 15,001–20,000 the same day — that many still AHEAD of us, putting our original
  // original position). Flagged `unofficial` — replace with the Comptroller figure
  // when it publishes.
  { date: '2026-07-29', frontier: 34000, unofficial: true },
];

// Frontier for an observation, whichever way it was recorded.
const frontierOf = (o) => (o.frontier != null ? o.frontier : T2_AT_LOTTERY - o.t2Remaining);

// Frontier reached so far = how deep the cascade has funded down the global list.
// Future advance is added ON TOP of this from the 18k not-opted-in pool, so it's the base
// the projection and the simulator both build from.
const FRONTIER_NOW = frontierOf(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1]); // 34,000 (Jul 29, unofficial)
// The advance the Jul 15 deadline shakeout actually produced (16,916 → 34,000).
const FRONTIER_PREV = frontierOf(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 2]);  // 16,916 (Jul 8)
const JUL29_ADVANCE = FRONTIER_NOW - FRONTIER_PREV;                             // ~17,084

// YOUR_POS is derived by adding CREDITED_DEPTH to the Odyssey range, so that depth must
// stay equal to the frontier we chart. If a future observation moves the frontier without
// a matching Odyssey update, these drift apart and our position silently shifts — which is
// exactly the incoherence (34,000 frontier vs 30,000-implied position) this replaced.
if (CREDITED_DEPTH !== FRONTIER_NOW) {
  console.warn(
    `[TEFA] CREDITED_DEPTH (${CREDITED_DEPTH}) != FRONTIER_NOW (${FRONTIER_NOW}). ` +
    `YOUR_POS is derived from the Odyssey range + credited depth; update CURRENT_RANGE ` +
    `from a fresh Odyssey reading, or set CREDITED_DEPTH to match the new frontier.`
  );
}

// TWO frontiers, TWO levers. The number that decides whether an offer REACHES us is the
// OFFER frontier, not the funded-seat count — and it runs much deeper, because a deep-Tier-3
// family who is offered a freed seat and says NO frees no money; it just passes the SAME
// dollars to the next position on the list (the never-activation stretch). So, rebuilt on
// the Jul 29 anchor (34,000) with the deadline pool now largely spent:
//
//   departures     = tailShare × (what's LEFT of the 18k)  +  augAttrition × funded base
//   funded seats   = departures × seats-per-departure          (how many seats get filled)
//   OFFER frontier = 34,000 + funded seats ÷ acceptance        (how deep an offer travels)
//
// where "what's LEFT of the 18k" is backed out of the observation itself:
//   departures already spent = (17,084 advance × acceptance) ÷ seats-per-departure
//
// Three honest unknowns, each a scenario lever:
//   1. `tailShare`  — of the laggards who survived the Jul 15 sweep, what slice still gets
//                     moved aside by Jul 31 / August (most of the rest opted in, so this is
//                     a minority: 15–35%).
//   2. `augRate`    — ordinary August melt on the ~80,000 funded base (0.5–1.5%): took the
//                     ESA, then withdrew, moved, or never showed.
//   3. `acceptRate` — of the deep-Tier-3 families newly OFFERED those seats, what fraction
//                     say YES. By August nearly every deep family has enrolled somewhere
//                     else, so decline rates run high (35–65%) → acceptance 35–65%.
//                     Every decline stretches the offer deeper for free.
//
// The three lines pair the levers along one "how favorable to deep waitlisters" axis (a soft
// year has BOTH more awardees walking away AND more deep offerees declining):
//   LOW    (15% tail, 0.5% melt, 35% decline) → OFFER ≈ 37,000  (short of us by ~8,000)
//   LIKELY (25% tail, 1.0% melt, 50% decline) → OFFER ≈ 42,100  (short of us by ~7,000)
//   HIGH   (35% tail, 1.5% melt, 65% decline) → OFFER ≈ 52,900  (CLEARS our 49,001 seat)
// Every scenario is now deep inside our 30,001–50,000 band — the band question is settled.
// The live question is the last ~15,000–20,000 positions between the frontier and OUR seat,
// and only the high case covers it. `optOutShare` splits each departure between full opt-outs
// (~$10,474 freed) and $2,000 homeschool downgrades (~$8,474) — held at the observed 23/77
// mix; new fills stay at the observed 33% homeschool blend (~$7,678/seat).
// Scenarios, not forecasts; after Aug 31 each drifts on small residual churn.
const OBS_OPTOUT_SHARE_OF_CHURN = 0.231;   // observed 2.8% opt-out / 9.3% downgrade split

const REALISTIC = {
  tailShare: TAIL_SHARE.likely,             // LIKELY — 25% of the surviving laggards still swept
  augRate: AUG_ATTRITION.likely,            // 1.0% August melt on the funded base
  acceptRate: 0.50,                         // 50% of deep offerees say yes (50% decline) → offer stretches 2×
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,   // 23% opt out fully, 77% drop to $2,000 → ~1.16 seats/departure
  reserveSeats: RESERVE_SEATS,              // 0 — appeals reserve spent Jul 8 (already in frontier-now)
};

const AGGRESSIVE = {
  tailShare: TAIL_SHARE.high,               // HIGH — 35% of the surviving laggards swept
  augRate: AUG_ATTRITION.high,              // 1.5% August melt
  acceptRate: 0.35,                         // 65% of deep offerees decline → offer reaches ~52,900
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,
  reserveSeats: RESERVE_SEATS,              // 0 — reserve spent
};

const RESEARCH = {
  tailShare: TAIL_SHARE.low,                // LOW — only 15% of the surviving laggards swept
  augRate: AUG_ATTRITION.low,               // 0.5% August melt
  acceptRate: 0.65,                         // only 35% of deep offerees decline → little stretch
  optOutShare: OBS_OPTOUT_SHARE_OF_CHURN,
  reserveSeats: RESERVE_SEATS,              // 0 — reserve spent
};

// Shared fuel math, used by both the projection and the Monte Carlo so the two can't drift.
// Back-solve how much of the 18k the observed Jul 29 advance consumed, then price what's left.
const spentDepartures = (accept, spd) => (JUL29_ADVANCE * accept) / spd;
const remainingPool = (accept, spd) => Math.max(0, CHURN_POOL - spentDepartures(accept, spd));
// Funded base the August melt applies to: the Jul 1 cohort plus the seats the Jul 29 draw filled.
const fundedBase = (accept) => FUNDED_JULY1 + JUL29_ADVANCE * accept;
// Forward OFFER advance beyond the Jul 29 frontier.
const forwardAdvance = (tailShare, augRate, accept, spd) =>
  ((tailShare * remainingPool(accept, spd) + augRate * fundedBase(accept)) * spd) / accept;

// Chart window: from the lottery (frontier 0) through end-August. The big waves
// (Tier 2 clear, reserve, the Jul 15 deadline shakeout) are done by ~Aug 15; after
// that both lines carry only a small residual attrition drift, not another wave.
// `today` anchors the "Today" marker to a fixed date so a screenshot of the
// chart reads the same for everyone (the artifact gets posted/shared) — bump it
// as the analysis is refreshed, rather than letting it drift with the viewer's clock.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: '2026-07-29', jul15: '2026-07-15', jul29: '2026-07-29', end: '2026-09-15' };
const WAVES_END = '2026-08-31';   // August melt runs the whole month; after this it's a trickle
const POST_DRIFT = 25;            // seats/day of small residual attrition after Aug 31 (realistic trickle)

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
  const obsF = t2Observations.map((o) => ({ t: dayOf(o.date), f: frontierOf(o) }));
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

  // Terminal OFFER frontier = the Jul 29 anchor + the forward advance from the two remaining
  // fuel terms (residual laggard tail + August melt), stretched by 1/acceptance. The pool the
  // tail is drawn from is what SURVIVED the Jul 29 draw, back-solved from the observed advance —
  // so a scenario can never spend more of the 18,000 than existed. Both departure routes count
  // via the opt-out:downgrade split (a full opt-out frees the whole award, a $2,000 homeschool
  // drop frees only the difference). Never-activation does NOT fund seats; it only stretches
  // the offer, which is the ÷ acceptance term.
  const terminalSeats = (s) => {
    const spd = seatsPerDeparture(s.optOutShare, 1 - s.optOutShare);
    return Math.round(fL + forwardAdvance(s.tailShare, s.augRate, s.acceptRate, spd) + s.reserveSeats);
  };
  // Funded-seat frontier for a scenario — the offer stretch removed.
  const terminalFunded = (s) => {
    const spd = seatsPerDeparture(s.optOutShare, 1 - s.optOutShare);
    return Math.round(fL + forwardAdvance(s.tailShare, s.augRate, s.acceptRate, spd) * s.acceptRate);
  };
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

  // All three share ONE shape from the Jul 29 anchor (34,000 — the deadline shakeout has fired
  // and Tier 2 is cleared): a fast early-August stretch as declines from the big Jul 29 batch
  // recycle down the list, then a steady grind on the residual laggard tail and August melt,
  // flattening to the terminal by Aug 31. There is no cliff left — the Jul 15 deadline WAS the
  // cliff. They differ in how much tail survives and how many deep offerees decline. fitLine
  // pins each curve to its exact terminal.

  // LIKELY — 25% tail, 1.0% melt, 50% decline → OFFER ~42,100 (short of our 49,001 by ~7,000).
  const real_ = fitLine([
    { t: tL, f: fL },                              // Jul 29 anchor (34,000)
    { t: dayOf('2026-08-05'), f: 36400 },          // declines from the Jul 29 batch recycle fast
    { t: dayOf('2026-08-15'), f: 39800 },          // laggard tail swept + first-week-of-school melt
    { t: wavesEnd, f: defRealT },                  // grind to ~42,100 by Aug 31
  ], defRealT, realistic);
  const realFn = real_.fn, realTerminal = real_.terminal;

  // HIGH — 35% tail, 1.5% melt, 65% decline → OFFER ~52,900 (CLEARS our 49,001 seat).
  const agg_ = fitLine([
    { t: tL, f: fL },                              // Jul 29 anchor (34,000)
    { t: dayOf('2026-08-05'), f: 39500 },          // heavy decline stretch off the Jul 29 batch
    { t: dayOf('2026-08-15'), f: 46500 },          // crosses our position mid-August
    { t: wavesEnd, f: defAggT },                   // ~52,900 by Aug 31
  ], defAggT, aggressive);
  const aggFn = agg_.fn, aggTerminal = agg_.terminal;

  // LOW — 15% tail, 0.5% melt, 35% decline → OFFER ~37,000 (deep in our band, short of us).
  const research_ = fitLine([
    { t: tL, f: fL },                              // Jul 29 anchor (34,000)
    { t: dayOf('2026-08-05'), f: 34900 },          // little stretch; most offerees accept
    { t: dayOf('2026-08-15'), f: 36100 },          // thin tail, light melt
    { t: wavesEnd, f: defResearchT },              // ~37,000 by Aug 31
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
  const TABLE_DATES = ['2026-07-08', '2026-07-29', '2026-08-05', '2026-08-15', '2026-08-31', '2026-09-15'];
  const sampleAt = (fn) => TABLE_DATES.map((d) => Math.round(fn(dayOf(d))));
  const projectionTable = {
    dates: TABLE_DATES,
    aggressive: sampleAt(aggFn),
    conservative: sampleAt(realFn),
    research: sampleAt(researchFn),
  };

  const spdObs = seatsPerDeparture(realistic.optOutShare, 1 - realistic.optOutShare);
  const kpis = {
    asOf: t2Observations[t2Observations.length - 1].date,
    asOfUnofficial: !!t2Observations[t2Observations.length - 1].unofficial,
    frontierNow: fL,
    frontierPrev: FRONTIER_PREV,
    jul29Advance: JUL29_ADVANCE,
    // Tier 2 is CLEARED — the frontier is this far PAST the 20,383 Tier 2 backlog.
    intoTier3: fL - T2_AT_LOTTERY,
    // Positions still between the frontier and our own seat — the only gap that matters now.
    // Anchored on the Odyssey range directly (the datum specific to us), not on a position
    // derived from the disputed frontier number. Equal to YOUR_POS.lo − frontier by
    // construction, but stated this way so the robust source is obvious.
    gapToUs: CURRENT_RANGE.lo,
    gapToUsHi: CURRENT_RANGE.hi,
    currentRangeLo: CURRENT_RANGE.lo,
    currentRangeHi: CURRENT_RANGE.hi,
    optOutsSoFar,
    optOutPctNow: +(100 * optOutsSoFar / ACTIVE_AWARDS).toFixed(1), // ~2.8% (Jun 23)
    funded: FUNDED_JULY1,
    remainder: CHURN_POOL,          // the PRE-deadline 18k pool (historical reference)
    // What's actually left of that 18k after the Jul 29 draw, at the central acceptance.
    poolLeft: Math.round(remainingPool(realistic.acceptRate, spdObs)),
    poolSpent: Math.round(spentDepartures(realistic.acceptRate, spdObs)),
    notActivatedJul1: REMAINDER,    // historical: 107k active − 73k funded Jul 1
    optedInSince: REMAINDER - CHURN_POOL, // ~16k of the Jul-1 remainder have since opted in
    reserveSeats: realistic.reserveSeats,
    projectionTable,
    researchTerminal,
    // *TailPct = the share of the SURVIVING laggard pool still to be swept (15 / 25 / 35%).
    researchChurnPct: Math.round(research.tailShare * 100),
    realisticChurnPct: Math.round(realistic.tailShare * 100),
    aggressiveChurnPct: Math.round(aggressive.tailShare * 100),
    // *MeltPct = August attrition rate on the funded base (0.5 / 1.0 / 1.5%).
    researchMeltPct: +(research.augRate * 100).toFixed(1),
    realisticMeltPct: +(realistic.augRate * 100).toFixed(1),
    aggressiveMeltPct: +(aggressive.augRate * 100).toFixed(1),
    // *DeclinePct = the deep-waitlist decline rate that stretches the OFFER frontier (35/50/65%).
    researchDeclinePct: Math.round((1 - research.acceptRate) * 100),
    realisticDeclinePct: Math.round((1 - realistic.acceptRate) * 100),
    aggressiveDeclinePct: Math.round((1 - aggressive.acceptRate) * 100),
    // Funded-seat frontier (offer stretch removed) — how many NEW seats each scenario actually fills.
    researchFunded: terminalFunded(research),
    realisticFunded: terminalFunded(realistic),
    aggressiveFunded: terminalFunded(aggressive),
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
const FRONTIER_TICKS = ['2026-05-04', '2026-06-01', '2026-07-01', '2026-07-29', '2026-08-15', '2026-08-31', '2026-09-15'].map(Date.parse);

// Plain-language likelihood of the cascade reaching each global waitlist band,
// drawn from the published bands analysis. ourBand flags the family's bucket.
const BAND_OUTLOOK = [
  {
    band: 'Tier 2 clears',
    scope: 'positions 1 – 20,383',
    call: 'DONE',
    tone: 'good',
    note: 'Settled. The Jul 29 draw carried the frontier to ~34,000, roughly 13,600 positions PAST the 20,383 Tier 2 backlog. Tier 2 is fully cleared and every award now going out is a Tier 3 award — the gate that stood in front of us all summer is behind us.',
  },
  {
    band: '20,384 – 30,000',
    scope: 'early / mid Tier 3',
    call: 'DONE',
    tone: 'good',
    note: 'Also passed on Jul 29. These positions were the whole question in the Jul 11 model, which topped out near 37,900 even if all 18,000 laggards walked. The deadline shakeout cleared them outright.',
  },
  {
    band: '30,001 – 49,000',
    scope: 'our band, above our seat',
    call: 'Reached / in reach',
    tone: 'good',
    note: 'The frontier is already inside our band at ~34,000, and every scenario runs deeper — the low case still lands ~37,000, the likely case ~42,100. Reaching the band is settled. What is NOT settled is the last stretch to our own position, which sits at the very bottom of it.',
  },
  {
    band: '49,001 – 50,000',
    scope: 'YOUR SEAT · the bottom of the band',
    call: 'Unlikely — needs ~15,000 more; only the top of the high case',
    tone: 'bad',
    ourBand: true,
    note: 'Our Jul 29 Odyssey range of 15,001–20,000 is the number that matters, and it is the one datum specific to us: that many families are still AHEAD of us right now. Added to the ~34,000 frontier it puts our original position at 49,001–50,000 — the bottom of the band, not the 45,001 we assumed before the personal update. That extra ~4,000 matters: the likely case (~42,100) now misses by ~7,000 rather than ~2,900, and the model\'s 95th percentile (~47,800) still falls short of 49,001. Only the strongest runs — a fat laggard tail, heavy August melt AND a very high decline rate together — get there. A voucher this year is a genuine possibility but a clear minority one. Budget the full balance and treat it as upside, not plan.',
  },
  {
    band: '50,001 +',
    scope: 'deeper Tier 3 / Tier 4',
    call: 'Tail only',
    tone: 'bad',
    note: 'Past our seat entirely — barely further than us now, since we sit at the band floor. It takes the high case or better for the offer to travel beyond 50,000. Real in the upper tail, not a base case. Tier 4 does not move in Year 1.',
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
  observedLine: 'Pulled off the waitlist so far',
  research: 'Low — 15% tail · 35% decline',
  realistic: 'Likely — 25% tail · 50% decline',
  aggressive: 'High — 35% tail · 65% decline',
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
  { date: 'Jul 11', iso: '2026-07-11', title: 'TEFA update — 18,000 still not opted in; frontier ~17,000', kind: 'info',
    detail: 'Travis Pillow (Comptroller spokesperson) gave two hard numbers as the deadline nears: your updated waitlist position ≈ original − 17,000 (so the funded cascade is ~17,000 deep — confirming our 16,916 read), and just 18,000 families still have not opted in. That 18,000 — down from the ~34,000 that hadn\'t activated on Jul 1 — is now the entire pool that can free seats. Even if all 18,000 were moved aside the cascade tops out near 37,900, so our 45–50k seat is out of reach this year. SUPERSEDED BY JUL 29 — that ceiling was wrong: the actual sweep carried the frontier to ~34,000, well past this estimate, because the 18,000 freed seats at a better ratio than modelled and deep declines stretched each one further. The seat is no longer out of reach outright, though our position also turned out to be deeper (49,001–50,000) than assumed here.' },
  { date: 'Jul 15', iso: '2026-07-15', title: 'TEFA opt-in / opt-out deadline — passed', kind: 'info',
    detail: 'The biggest TEFA waitlist-cascade event of the year, and it landed AFTER the June 30 withdrawal deadline. Families who did not select a school by this date were "moved aside to allow other families to come off the waitlist" (Travis Pillow). The shakeout was far larger than the Jul 11 model allowed for — see Jul 29.' },
  { date: 'Jul 29', iso: '2026-07-29', title: 'TEFA — ~34,000 pulled off the waitlist; Tier 2 cleared', kind: 'info',
    detail: 'Unofficial community number: roughly 34,000 have now been pulled off the waitlist, up from ~17,000 on Jul 11 — the Jul 15 deadline shakeout firing at full force. Two things changed. First, Tier 2 is CLEARED: the frontier is ~13,600 positions past the 20,383 Tier 2 backlog, so every award now going out is Tier 3. Second, our own Odyssey range moved to 15,001–20,000 — that many families are still AHEAD of us, which is the one datum specific to our family. Added to the ~34,000 frontier that puts our original position at 49,001–50,000, truncated by the May 13 band ceiling: the very bottom of our band, not the 45,001 we had assumed. Awaiting the official Comptroller figure to replace the unofficial 34,000.' },
  { date: 'Jul 31', iso: '2026-07-31', title: 'TEFA — enrollment confirmation deadline', kind: 'info',
    detail: 'Families swept in the Jul 15 sweep had to have enrollment confirmed by this date. Whatever laggard tail survives here is one of the two remaining fuel sources for the cascade; the other is ordinary August melt on the ~80,000 funded families.' },
  { date: 'August', iso: '2026-08-15', title: 'TEFA — August melt is the remaining fuel', kind: 'info',
    detail: 'No cliff left — the Jul 15 deadline was the cliff. From here the cascade advances on a slower grind: the residual laggard tail plus families who took an ESA and then withdrew, moved, or never showed up as school starts (0.5–1.5% of ~80,000). Every deep family who is offered a seat and declines passes it deeper for free, which is what stretches the offer toward us. Likely case lands ~42,100 by Aug 31 — about 7,000 short of our 49,001; only the top of the high case reaches us.' },
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

const VALID_TABS = ['now', 'money', 'timeline', 'nbca', 'supplies', 'tefa'];
const TAB_LABELS = { now: 'Now', money: 'Money', timeline: 'Timeline', nbca: 'NBCA Prep', supplies: 'Supplies', tefa: 'TEFA' };

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
          <nav className="flex flex-wrap justify-center gap-2 text-sm font-medium">
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
        {activeTab === 'nbca' && <NbcaPrepView setTab={setTab} />}
        {activeTab === 'supplies' && <SuppliesView setTab={setTab} />}
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

      {/* Back-to-school shopping, in one number */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <ShoppingCart size={20} /> School supplies
        </h2>
        <div className="flex items-end gap-3">
          <div className="text-4xl font-bold text-tefa-navy">{OPEN_SUPPLY_ITEMS.length}</div>
          <div className="text-sm text-tefa-body/60 pb-1">
            items still outstanding across the supply lists, Dorothy&rsquo;s art sheet, and the uniform gaps.
          </div>
        </div>
        <button
          onClick={() => setTab('supplies')}
          className="mt-4 text-sm font-bold text-tefa-navy underline decoration-tefa-navy/40 hover:text-tefa-green"
        >
          Open the supplies checklist →
        </button>
      </section>

      {/* TEFA outlook — the whole modeling story, in one honest card */}
      <section className="bg-amber-50 rounded-xl shadow-md border border-amber-300 p-6">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-2">
          <AlertCircle size={20} /> TEFA outlook: still budget for no voucher — but we are much closer than we were
        </h2>
        <p className="text-sm text-amber-900/90 mb-3">
          All three kids are <strong>{TEFA.tier}</strong> and <strong>waitlisted</strong> in band{' '}
          <strong>{TEFA.band}</strong> (texted to us {TEFA.notifiedOn}). On <strong>Jul 29</strong> roughly{' '}
          <strong>34,000</strong> were pulled off the waitlist (unofficial) — the Jul 15 deadline shakeout firing hard.
          <strong> Tier 2 is cleared</strong>, and our own Odyssey range moved to{' '}
          <strong>{CURRENT_RANGE.lo.toLocaleString()}–{CURRENT_RANGE.hi.toLocaleString()}</strong> — that many families are still{' '}
          <em>ahead</em> of us, which puts our original position at{' '}
          <strong>{YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()}</strong>: the bottom of our band.
        </p>
        <p className="text-sm text-amber-900/90">
          There is no cliff left — the deadline <em>was</em> the cliff — but the cascade keeps grinding on the leftover
          laggards and <strong>August melt</strong>, and every deep family who <strong>declines</strong> an offer passes it
          deeper for free. The likely case lands ~42,100 by Aug 31, still <strong>~7,000 short</strong> of us, and even the
          model&rsquo;s 95th percentile falls just short — only the top of the high case reaches us. So a voucher is a{' '}
          <strong>real but clear minority</strong> outcome, and it lands <strong>after</strong> the Jun 30 withdrawal deadline
          regardless. <strong>Budget the full balance; treat a voucher as upside.</strong>
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

const CONSERVATIVE_CHURN = 25; // "likely" tail share — slice of the SURVIVING laggard pool still to be swept
const CONSERVATIVE_DECLINE = 50; // "likely" deep-waitlist decline rate — half of new offerees say no (offer stretches 2×)

const TefaMonteCarlo = ({ churnMin, setChurnMin, churnMax, setChurnMax, declineMin, setDeclineMin, declineMax, setDeclineMax, k, cascadeSeries, frontierYMax, todayTs }) => {
  const churnMode = CONSERVATIVE_CHURN; // fixed, not draggable
  const declineMode = CONSERVATIVE_DECLINE; // fixed, not draggable
  const [optMode, setOptMode] = useState(23); // opt-out share of those leaving (observed 2.8/9.3 ≈ 23%); rest drop to $2,000
  const [holdFlat, setHoldFlat] = useState(true);
  const [trials, setTrials] = useState(10000);
  const [seed, setSeed] = useState(0); // bump to re-run with fresh draws
  const [view, setView] = useState('lines'); // 'lines' (averages) | 'dist' (full simulation)

  const r = useMemo(() => {
    const arr = new Float64Array(trials);
    for (let i = 0; i < trials; i++) {
      // The two levers CO-MOVE: a year that's favorable to deep waitlisters has BOTH more
      // current awardees walking away AND more deep offerees declining. Draw one shared
      // "favorability" factor (hill-peaked at the central case) and place both levers along
      // it, with mild independent jitter so they're strongly but not perfectly correlated.
      // This makes the distribution match the three coupled lines: the median lands on LIKELY,
      // and the high tail (both levers high together) is what can reach our seat.
      const fav = mcPert(0, 50, 100) / 100;                    // 0 = low reach, 1 = deep reach
      const jitter = () => (mcPert(0, 50, 100) / 100 - 0.5) * 0.2; // ±10% independent wobble
      const at = (lo, hi) => Math.min(hi, Math.max(lo, lo + (fav + jitter()) * (hi - lo)));
      const tail = at(churnMin, churnMax) / 100;               // slice of the SURVIVING laggards still swept
      const decline = at(declineMin, declineMax) / 100;        // deep-waitlist decline rate (co-moves with tail)
      const acc = Math.max(0.05, 1 - decline);                 // acceptance rate (floor to avoid blow-up)
      // August melt on the funded base rides the same favorability axis (0.5% → 1.5%).
      const augRate = (AUG_ATTRITION.low + (fav + jitter()) * (AUG_ATTRITION.high - AUG_ATTRITION.low));
      const optShare = mcPert(Math.max(0, optMode - 12), optMode, Math.min(100, optMode + 18)) / 100;
      // holdFlat pins seats/departure at the observed downgrade-heavy mix (~1.16); otherwise it
      // varies with the sampled opt-out share. Both exit routes (opt-out / $2,000) are in seatsPerDeparture.
      const spd = holdFlat ? seatsPerDeparture(OBS_OPTOUT_RATE, OBS_DOWNGRADE_RATE) : seatsPerDeparture(optShare, 1 - optShare);
      // Same two-term fuel model as the chart (shared helpers, so they cannot drift): the residual
      // laggard tail — drawn from what SURVIVED the Jul 29 draw, back-solved from the observed
      // advance — plus August melt, all stretched by 1/acceptance since a decline passes the same
      // dollars deeper for free. RESERVE_SEATS is 0 (the appeals reserve fired Jul 8).
      arr[i] = FRONTIER_NOW + forwardAdvance(tail, Math.max(0, augRate), acc, spd) + RESERVE_SEATS;
    }
    const sorted = Array.from(arr).sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(p * (sorted.length - 1))];
    const frac = (thr) => { let n = 0; for (const v of arr) if (v >= thr) n++; return n / trials; };
    // Every run now starts at the Jul 29 frontier (34,000), so the window shifts up.
    const lo = 30000, hi = 70000, bins = 52, w = (hi - lo) / bins;
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
  }, [churnMin, churnMode, churnMax, declineMin, declineMode, declineMax, optMode, holdFlat, trials, seed]);

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
        One model, two views of the same thing. Each line is the <strong>offer frontier</strong> — how deep an offer travels, set by two dials: how much of the{' '}
        <strong>~{k.poolLeft.toLocaleString()}</strong> laggards left after the Jul 29 draw still get swept (plus August melt — together they fund the seats) and how many
        deep-waitlist families <em>decline</em> the seats they're offered (each &ldquo;no&rdquo; passes the offer deeper for free). <strong>Distribution</strong> runs that model{' '}
        <strong>{trials.toLocaleString()} times</strong> and shows where the offer landed across all of them — <em>the lines are essentially the averages of that cloud</em>.
        Drag the dials and <strong>both</strong> update. Our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()} (we sit at ~{YOUR_POS.lo.toLocaleString()}); Tier 3 opens at {T3_START.toLocaleString()}.
      </p>

      {/* context KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Pulled Off So Far</div>
          <div className="font-bold text-tefa-navy text-lg">{k.frontierNow.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">
            {k.asOfUnofficial ? 'UNOFFICIAL' : 'official'} as of {fmtChartDate(Date.parse(k.asOf))} · +{k.jul29Advance.toLocaleString()} since Jul 8
          </div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Still Ahead Of Us</div>
          <div className="font-bold text-tefa-gold text-lg">{k.gapToUs.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">Tier 2 cleared · gap to our {YOUR_POS.lo.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-navy/20 p-3 text-center">
          <div className="text-xs text-tefa-navy/70 font-medium">Likely OFFER reach</div>
          <div className="font-bold text-tefa-navy text-lg">~{k.realisticTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">{k.realisticChurnPct}% tail · {k.realisticMeltPct}% melt · {k.realisticDeclinePct}% decline · ~{(YOUR_POS.lo - k.realisticTerminal).toLocaleString()} short of us</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
          <div className="text-xs text-tefa-red/70 font-medium">High OFFER reach</div>
          <div className="font-bold text-tefa-red text-lg">~{k.aggressiveTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">{k.aggressiveChurnPct}% tail · {k.aggressiveMeltPct}% melt · {k.aggressiveDeclinePct}% decline · clears our {YOUR_POS.lo.toLocaleString()}</div>
        </div>
      </div>

      {/* probability headline — straight from the simulation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4">
        <div className="rounded-lg bg-tefa-light border border-tefa-navy/30 p-3 text-center ring-1 ring-tefa-gold/40">
          <div className="text-xs text-tefa-navy/70 font-medium">P(reach our band ≥ {BAND_LO.toLocaleString()})</div>
          <div className="font-bold text-tefa-gold text-2xl">{pctFmt(r.pBand)}</div>
          <div className="text-[10px] text-tefa-body/40">odds an offer reaches our band at all</div>
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
          {view === 'lines' ? 'Offer-frontier path per scenario (moved-aside share + decline rate) — drag the dials to reshape.' : `Where ${trials.toLocaleString()} runs landed — the lines are the averages of this.`}
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
                    label={{ value: 'Jul 15 deadline', position: 'insideTopLeft', fontSize: 9, fontWeight: 700, fill: '#aa2142' }} />
                <ReferenceLine x={todayTs} stroke="#94a3b8" strokeDasharray="2 2"
                    label={{ value: 'Today', fontSize: 10, fill: '#64748b', position: 'insideBottomLeft' }} />
                {/* Our seat now sits flush against the band ceiling (49,001–50,000), so the old
                    "band ends — 50,000" line would stack three labels on the same pixel. The
                    position band IS the top of the band now; one emphatic marker replaces both. */}
                <ReferenceArea y1={YOUR_POS.lo} y2={YOUR_POS.hi} fill="#aa2142" fillOpacity={0.18}
                    label={{ value: `US — ${YOUR_POS.lo.toLocaleString()}–${YOUR_POS.hi.toLocaleString()}`, position: 'insideTopRight', fontSize: 10, fontWeight: 700, fill: '#aa2142' }} />
                <ReferenceLine y={YOUR_POS.lo} stroke="#aa2142" strokeWidth={1.5} />
                <ReferenceLine y={T3_START} stroke="#b08a3e" strokeDasharray="8 4"
                    label={{ value: `Tier 3 starts — ${T3_START.toLocaleString()} (cleared)`, position: 'insideBottomLeft', fontSize: 9, fontWeight: 600, fill: '#b08a3e' }} />
                <ReferenceLine y={BAND_LO} stroke="#aa2142" strokeDasharray="8 4"
                    label={{ value: `Our band starts — ${BAND_LO.toLocaleString()} (reached)`, position: 'insideTopLeft', fontSize: 9, fontWeight: 600, fill: '#aa2142' }} />
                <Line type="monotone" dataKey="observedLine" name="Pulled off so far" stroke="#202562" strokeWidth={2.5} dot={false} legendType="none" />
                <Line type="monotone" dataKey="research" name={`Low — ${k.researchChurnPct}% tail · ${k.researchDeclinePct}% decline`} stroke="#2e7d5b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="realistic" name={`Likely — ${k.realisticChurnPct}% tail · ${k.realisticDeclinePct}% decline`} stroke="#202562" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="aggressive" name={`High — ${k.aggressiveChurnPct}% tail · ${k.aggressiveDeclinePct}% decline`} stroke="#aa2142" strokeWidth={2.5} dot={false} />
                <Scatter dataKey="observed" name="Published data" fill="#202562" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-tefa-body/45 mt-1">
            Each line is the OFFER frontier: how deep an offer travels once the residual laggard tail (~{k.poolLeft.toLocaleString()} left of Pillow's {k.remainder.toLocaleString()})
            and August melt free seats, AND deep-waitlist families decline them. Declines cost no money — they pass the offer deeper for free — so the offer reaches well past
            the funded-seat count. When a line crosses our position line, an offer has reached us.
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-tefa-light/40 p-3">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Distribution of simulated frontier outcomes">
            {r.hist.map((c, i) => {
              const binStart = r.lo + i * r.w;
              const h = r.maxBin ? (c / r.maxBin) * plotH : 0;
              // Every run clears Tier 3 and the band start now, so the meaningful split is
              // whether the offer reaches OUR position (49,001) or stalls short of it.
              const reachesUs = binStart >= YOUR_POS.lo;
              const inBand = binStart >= BAND_LO && binStart < YOUR_POS.lo;
              const fill = reachesUs ? '#2e7d5b' : inBand ? '#b08a3e' : '#cbd5e1';
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
            {[30000, 40000, 50000, 60000, 70000].map((t) => (
              <text key={t} x={xOf(t)} y={H - 22} fill="#94a3b8" fontSize="10" textAnchor="middle">{t / 1000}k</text>
            ))}
            <text x={W / 2} y={H - 6} fill="#64748b" fontSize="11" textAnchor="middle">Terminal cascade frontier (waitlist position reached)</text>
          </svg>
          <div className="flex flex-wrap gap-4 text-[11px] text-tefa-body/60 mt-1 px-1">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#cbd5e1' }} />Short of our band (&lt;{BAND_LO.toLocaleString()})</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#b08a3e' }} />In our band, short of us</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm" style={{ background: '#2e7d5b' }} />Reaches us (≥{YOUR_POS.lo.toLocaleString()})</span>
          </div>
        </div>
      )}

      <div className="mt-5" />

      {/* how to read the inputs */}
      <div className="rounded-lg border border-tefa-navy/15 bg-tefa-light/60 p-4 mb-5 text-xs text-tefa-body/80 space-y-2.5">
        <div className="font-semibold text-tefa-navy text-[13px]">How to read the dials</div>
        <p>
          <strong className="text-tefa-navy">Residual tail swept (PERT min / likely / max)</strong> — your three-point guess for{' '}
          <em>what % of the ~{k.poolLeft.toLocaleString()} laggards who survived the Jul 29 draw</em> still get moved aside (opt out or drop to $2,000)
          rather than confirm. Alongside August melt on the funded base, it sets <strong>how many seats free up</strong>. The pool it draws from is
          back-solved from the observed Jul 29 advance, so a scenario can never spend more of the {k.remainder.toLocaleString()} than existed.
        </p>
        <p>
          <strong className="text-tefa-navy">Deep-waitlist decline rate</strong> — the second lever, and the one that reopened our band:
          of the deep-Tier-3 families newly <em>offered</em> a freed seat, what fraction <strong>say no</strong>. A decline frees no money — it just
          passes the same seat to the next position for free — so a higher decline rate <strong>stretches the offer deeper down the list</strong>
          (offer reach = funded seats ÷ acceptance). In late summer most deep families have enrolled elsewhere, so this runs high.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-tefa-body/70">
          <li><strong>likely</strong> is <span className="font-mono text-tefa-gold">{CONSERVATIVE_CHURN}%</span> of the tail swept / <span className="font-mono text-tefa-gold">{CONSERVATIVE_DECLINE}%</span> decline — pinned to our central read, <strong>not draggable</strong>.</li>
          <li>Drag <strong>min</strong> / <strong>max</strong> on each to set how wide the low- and high-reach cases run around that anchor.</li>
        </ul>
        <p>
          <strong className="text-tefa-navy">Opt-out share of those leaving</strong> — of the families moved aside, what fraction <strong>quit entirely</strong>
          (freeing the full $10,474) vs <strong>drop to the $2,000 homeschool tier</strong> (freeing only $8,474). Changes how far each departure pushes the frontier, not how many leave.
        </p>
      </div>

      {/* controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="block text-xs font-semibold text-tefa-body/80 mb-2">
            Residual tail swept — min / <span className="text-tefa-body/50">likely (fixed)</span> / max{' '}
            <span className="font-mono text-tefa-gold ml-1">{churnMin} / {churnMode} / {churnMax}%</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">min (best)</div>
              <input type="range" min="5" max="24" value={churnMin} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMin(Math.min(+e.target.value, churnMode - 1))} />
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-gold/80 mb-1">likely · locked</div>
              <div className="flex items-center justify-center h-[18px] font-mono text-sm font-bold text-tefa-gold">{churnMode}%</div>
              <div className="text-[9px] text-tefa-body/40">central</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">max (worst)</div>
              <input type="range" min="26" max="60" value={churnMax} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMax(Math.max(+e.target.value, churnMode + 1))} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-tefa-body/80 mb-2">
            Deep-waitlist decline rate — min / <span className="text-tefa-body/50">likely (fixed)</span> / max{' '}
            <span className="font-mono text-tefa-gold ml-1">{declineMin} / {declineMode} / {declineMax}%</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">min (low reach)</div>
              <input type="range" min="10" max="49" value={declineMin} className="w-full accent-tefa-navy"
                onChange={(e) => setDeclineMin(Math.min(+e.target.value, declineMode - 1))} />
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-gold/80 mb-1">likely · locked</div>
              <div className="flex items-center justify-center h-[18px] font-mono text-sm font-bold text-tefa-gold">{declineMode}%</div>
              <div className="text-[9px] text-tefa-body/40">central</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">max (deep reach)</div>
              <input type="range" min="51" max="85" value={declineMax} className="w-full accent-tefa-navy"
                onChange={(e) => setDeclineMax(Math.max(+e.target.value, declineMode + 1))} />
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
        Defaults reproduce the model: residual tail PERT(15 / 25 / 35) of the ~{k.poolLeft.toLocaleString()} laggards left after Jul 29, August melt 0.5–1.5% of the
        ~{Math.round(k.funded / 1000)}k funded base, decline rate PERT(35 / 50 / 65), opt-out share ~23%, freed-ratio held at the observed ~1.16 — the median offer lands
        near ~{fmt(r.p50)}. Every run clears our band start ({BAND_LO.toLocaleString()}) now, so the only number that matters is the share clearing{' '}
        {YOUR_POS.lo.toLocaleString()} — the probability an offer reaches <em>us</em>. Drag to stress-test. A planning tool, not a forecast.
      </p>
    </section>
  );
};

// ---------------------------------------------------------------------------
// TEFA — likelihood the cascade reaches each band, and two projections
// ---------------------------------------------------------------------------
const TefaView = () => {
  // min / max are shared with the simulator below; "likely" is fixed at the central.
  // The three chart lines (low / likely / high) pair the two levers along one axis: the
  // moved-aside SHARE of the 18k (funds seats) AND the deep-waitlist DECLINE rate (stretches
  // the offer). Dragging either pair of sliders reshapes the chart live.
  const [churnMin, setChurnMin] = useState(15);     // low: 15% of the surviving laggard tail swept
  const [churnMax, setChurnMax] = useState(35);     // high: 35% of the tail swept
  const [declineMin, setDeclineMin] = useState(35); // low reach: 35% of deep offerees decline
  const [declineMax, setDeclineMax] = useState(65); // high reach: 65% decline
  const { series: cascadeSeries, kpis: k } = useMemo(
    () => buildCascadeProjection({
      research: { ...RESEARCH, tailShare: churnMin / 100, acceptRate: Math.max(0.05, 1 - declineMin / 100) },
      realistic: { ...REALISTIC, tailShare: CONSERVATIVE_CHURN / 100, acceptRate: Math.max(0.05, 1 - CONSERVATIVE_DECLINE / 100) },
      aggressive: { ...AGGRESSIVE, tailShare: churnMax / 100, acceptRate: Math.max(0.05, 1 - declineMax / 100) },
    }),
    [churnMin, churnMax, declineMin, declineMax]
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
          Awards cascade down <strong>one</strong> tier-ordered waitlist. <strong>Tier 2 is now cleared</strong> — the Jul 29
          draw carried the frontier to <strong>~{k.frontierNow.toLocaleString()}</strong>, about {k.intoTier3.toLocaleString()} positions
          past the {T2_AT_LOTTERY.toLocaleString()} Tier 2 backlog. Our own seat is at{' '}
          <strong>{YOUR_POS.lo.toLocaleString()}</strong>, so roughly <strong>{k.gapToUs.toLocaleString()}</strong> families still sit
          between the frontier and us.
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
          <strong>Bottom line:</strong> the Jul 15 shakeout fired far harder than the Jul 11 model allowed. The frontier is <strong>~{k.frontierNow.toLocaleString()}</strong> (unofficial),
          up ~{k.jul29Advance.toLocaleString()} from {k.frontierPrev.toLocaleString()} on Jul 8 — Tier 2 cleared, and our Odyssey range moved to{' '}
          <strong>{k.currentRangeLo.toLocaleString()}–{k.currentRangeHi.toLocaleString()}</strong>, pinning our original position at <strong>{YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()}</strong>.
          That leaves <strong>~{k.gapToUs.toLocaleString()}</strong> families between the frontier and us. The deadline cliff is spent: of the {k.remainder.toLocaleString()} laggards Pillow counted on Jul 11,
          roughly <strong>{k.poolSpent.toLocaleString()}</strong> were consumed producing this advance, leaving ~{k.poolLeft.toLocaleString()}. Forward fuel is now the residual tail plus <strong>August melt</strong> on
          the ~{Math.round(k.funded / 1000)}k funded base, stretched by the <strong>decline rate</strong> among deep offerees — every decline passes the seat down for free.
          Low (<strong>~{k.researchTerminal.toLocaleString()}</strong>) and likely (<strong>~{k.realisticTerminal.toLocaleString()}</strong>) both fall short of us; high (<strong>~{k.aggressiveTerminal.toLocaleString()}</strong>) clears us.
          A voucher is now a <strong>genuine live possibility</strong> rather than a long shot — but the likely case still misses by ~{(YOUR_POS.lo - k.realisticTerminal).toLocaleString()}.
          <strong> Still budget the full balance</strong>; treat a reach to us as upside, not plan.
        </p>
      </section>

      {/* Combined chart + simulator — one card; toggle between the average lines and the full distribution. */}
      <TefaMonteCarlo churnMin={churnMin} setChurnMin={setChurnMin} churnMax={churnMax} setChurnMax={setChurnMax}
        declineMin={declineMin} setDeclineMin={setDeclineMin} declineMax={declineMax} setDeclineMax={setDeclineMax}
        k={k} cascadeSeries={cascadeSeries} frontierYMax={frontierYMax} todayTs={todayTs} />

      {/* Explanatory notes + projection table for the chart above. */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> The scenarios behind the model, and the dates
        </h2>
        <p className="text-[11px] text-tefa-body/55 mb-3">
          <strong>As of Jul 29, 2026 — the frontier figure is UNOFFICIAL.</strong> It comes from the parent community, not the Comptroller:
          ~<strong>{k.frontierNow.toLocaleString()}</strong> pulled off the waitlist, up from {k.frontierPrev.toLocaleString()} on Jul 8. Two independent
          things support it. Our own Odyssey range moved to <strong>{k.currentRangeLo.toLocaleString()}–{k.currentRangeHi.toLocaleString()}</strong> the same day, which
          implies ~{CREDITED_DEPTH.toLocaleString()} credited against a {YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()} original position — agreeing with
          the 34,000 within ~4,000. And the size matches the mechanism Travis Pillow described on Jul 11: the Jul 15 deadline sweep of the
          ~{k.remainder.toLocaleString()} who had not opted in. Treat the exact number as provisional; the direction and rough scale are well supported.
        </p>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 space-y-1">
          <div><strong>The fuel is now two slow terms, not one cliff.</strong> Forward advance = (residual laggard tail + August melt) × seats-freed-per-departure ÷ <strong>acceptance rate</strong>. The tail is drawn from what <em>survived</em> the Jul 29 draw: of Pillow's {k.remainder.toLocaleString()} laggards, ~<strong>{k.poolSpent.toLocaleString()}</strong> were consumed producing the observed {k.jul29Advance.toLocaleString()}-deep advance, leaving ~{k.poolLeft.toLocaleString()}. August melt is ordinary summer attrition on the ~{Math.round(k.funded / 1000)}k funded base ({k.researchMeltPct}–{k.aggressiveMeltPct}%): took the ESA, then withdrew, moved, or never showed. Each departure frees dollars two ways (a full <strong>opt-out</strong> frees ~$10,474, a <strong>$2,000 homeschool</strong> drop frees ~$8,474; observed ~23/77 mix → {k.freedRatio} seats/departure). The ÷ acceptance is the OFFER stretch: a deep family who <strong>declines</strong> frees no money but passes the same seat deeper for free, so the offer travels 1/acceptance as deep. <strong>Low</strong> ({k.researchChurnPct}% tail, {k.researchMeltPct}% melt, {k.researchDeclinePct}% decline) → ~<strong>{k.researchTerminal.toLocaleString()}</strong>; <strong>likely</strong> ({k.realisticChurnPct}% / {k.realisticMeltPct}% / {k.realisticDeclinePct}%) → ~<strong>{k.realisticTerminal.toLocaleString()}</strong>; <strong>high</strong> ({k.aggressiveChurnPct}% / {k.aggressiveMeltPct}% / {k.aggressiveDeclinePct}%) → ~<strong>{k.aggressiveTerminal.toLocaleString()}</strong>. Only the high case reaches our {YOUR_POS.lo.toLocaleString()}.</div>
          <div><strong>Why the back-out matters.</strong> A high-decline scenario needed <em>fewer</em> departures to produce the observed {k.jul29Advance.toLocaleString()}-deep advance — each freed seat travelled further before it stuck — so it leaves <em>more</em> tail in reserve. A low-decline scenario burned more pool to get here and has less left. Tying the levers to the observation this way stops a scenario from spending more of the {k.remainder.toLocaleString()} than ever existed, which is the error that makes naive &ldquo;apply the same attrition % to every wave&rdquo; projections run away.</div>
          <div className="pt-1"><strong>On the &ldquo;each wave unlocks another 34%&rdquo; claim (Facebook, Jul 29).</strong> The argument: ~34% of awardees failed to finalize by the deadline, so applying 34% to the 34,000 just funded yields ~11,560 more, then ~3,930 more — reaching ~50,490 and covering the whole 30k–50k band in two waves. It lands near our HIGH case, so it is not off the map — but it is an upper bound presented as a base case, and it has two real errors. <strong>First, it double-counts.</strong> 34,000 is the <em>cumulative</em> depth, not a fresh batch; only ~{JUL29_ADVANCE.toLocaleString()} were newly awarded since Jul 8, and the earlier waves' declines are <em>already</em> baked into reaching 34,000. Apply that same 34% to just the newly-awarded {JUL29_ADVANCE.toLocaleString()} and the full series lands at <strong>~42,800</strong> — within ~700 of our likely case ({k.realisticTerminal.toLocaleString()}). <strong>Second, the 34% premise is shaky.</strong> It comes from an AI search summary (not a Comptroller release) asserting the ~29,000 who missed Jul 15 &ldquo;instantly expired&rdquo; at 100%. But Pillow said on Jul 11 that only <strong>18,000</strong> had not opted in — ~16,000 of the Jul 1 gap were merely slow, not forfeited — and those families still had until Jul 31 to confirm. <strong>The deeper conflation:</strong> a <em>funded</em> family who forfeits frees real dollars and creates a new seat; a <em>waitlist</em> family who declines frees nothing — the same dollars just pass deeper. Only the first compounds. That is why the honest model converges instead of running away.</div>
          <div><strong>Watch — the {WAVES_END === '2026-08-31' ? 'August' : 'late-summer'} grind, not another cliff.</strong> The Jul 15 deadline <em>was</em> the cliff and it has fired. What remains is the Jul 31 confirmation tail and melt as school starts. It all lands <em>after</em> the Jun 30 penalty-free withdrawal deadline, so the withdrawal call had to be made without knowing any of this.</div>
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
                { key: 'aggressive', label: `High — ${k.aggressiveChurnPct}% aside · ${k.aggressiveDeclinePct}% decline`, color: '#aa2142', vals: k.projectionTable.aggressive },
                { key: 'conservative', label: `Likely — ${k.realisticChurnPct}% aside · ${k.realisticDeclinePct}% decline`, color: '#202562', vals: k.projectionTable.conservative },
                { key: 'research', label: `Low — ${k.researchChurnPct}% aside · ${k.researchDeclinePct}% decline`, color: '#2e7d5b', vals: k.projectionTable.research },
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
            Each row is the OFFER frontier — the global waitlist position an offer reaches given that residual-tail share, August melt rate, and deep-waitlist decline rate.
            Tier 2 cleared at {T2_AT_LOTTERY.toLocaleString()}; our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()} and our own seat is {YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()}.
            All three share the observed track through Jul 29 ({k.frontierNow.toLocaleString()}, unofficial); they differ only in what happens through August.
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
    due: 'Cleared — TAPPS account only',
    who: 'Both athletes',
    detail:
      'CLEARED by Janey (Jul 21): both kids are complete in Rank One — Medical History, Student Profile, Handbook, and physicals all in. NO transfer paperwork for either: those forms are high-school transfers only, and Cassius is an incoming 9th grader who has never competed at the HS level elsewhere. The PDFs she emailed Jul 20 are the same forms already done in Rank One, so nothing to re-file. ONE thing left for the whole family: Cassius must create his OWN TAPPS account first, then add Cody’s email inside it as the parent address so it links to the parent account.',
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

// ---------------------------------------------------------------------------
// SUPPLIES — the single source of truth for every school-supply list and for
// what is still outstanding on each one. Item statuses were reconciled against
// the two Walmart and two Amazon orders placed Aug 7–8; `note` records which
// order closed an item out so nothing gets bought twice. Both the Supplies tab
// and the per-kid cards on NBCA Prep render from this block.
//
// `where` on an open item is the only field the shopping list groups by — keep
// it to the WHERE_ORDER values below so nothing falls off the end of that list.
// ---------------------------------------------------------------------------

const SUPPLIES_ASOF = 'Aug 8, 2026';

const SUPPLY_LISTS = [
  {
    id: 'secondary',
    title: 'Secondary supply list',
    // One list serves both secondary kids, so it is stored once rather than
    // duplicated per child.
    who: ['Cassius', 'Dorothy'],
    meta: 'One shared MS + HS list · needed by the first day',
    due: 'Aug 12',
    link: { label: 'Secondary supply list', url: 'https://aptg.co/tCJ7SC' },
    groups: [
      {
        group: 'Not started',
        tone: 'red',
        items: [
          {
            item: 'The whole Secondary list — nothing bought yet',
            status: 'open',
            where: 'Walmart / Amazon',
            note:
              'Not itemized here. Open the linked list and shop it. The same list covers both kids, so anything personal has to be bought twice — and Dorothy’s art sheet below is separate, with no overlap allowed since those supplies never leave the art room.',
          },
        ],
      },
    ],
  },
  {
    id: 'ms-art',
    title: 'MS Art supply list',
    who: ['Dorothy'],
    meta: 'Separate sheet from the art teacher · lives in the art room all year',
    due: 'Wed Aug 19',
    link: null,
    groups: [
      {
        group: 'To live in art class',
        tone: 'red',
        items: [
          { item: '1" binder', status: 'bought', note: 'Two black Pen+Gear binders on the Aug 7 order.' },
          { item: '1 pkg 50-count sheet protectors', status: 'open', where: 'Walmart / Amazon' },
          { item: '12 Ticonderoga #2 pencils', status: 'bought', note: '96 bought.' },
          { item: '1 white block eraser', status: 'bought', note: 'Pentel Hi-Polymer 4-pack.' },
          {
            item: '2 black Sharpies — 1 medium tip, 1 ultra fine',
            status: 'bought',
            note: 'The multi-tip 6-pack covers Dorothy and Sebastian if you split it.',
          },
          {
            item: '1 zippered pencil pouch',
            status: 'open',
            where: 'Walmart / Amazon',
            note: 'Only one pouch was ordered and it is Sebastian’s. This is a second one.',
          },
          { item: '1 pack notebook paper', status: 'bought', note: 'Wide- and college-ruled filler both bought.' },
        ],
      },
      {
        group: 'Before the sheet goes back',
        tone: 'gold',
        items: [
          {
            item: 'Parent initials on the art sheet',
            status: 'open',
            where: 'Paperwork',
            note: 'The signed sheet goes back to the teacher with the supplies by Aug 19.',
          },
        ],
      },
    ],
  },
  {
    id: 'elementary-4',
    title: 'School supply list',
    who: ['Sebastian'],
    meta: '4th grade · mostly closed out by the Aug 7–8 orders',
    due: 'Aug 12',
    link: { label: 'Elementary 3rd–5th supply list', url: 'https://5il.co/2o0ag' },
    groups: [
      {
        group: 'Label with name',
        tone: 'navy',
        items: [
          { item: 'ESV Bible (w/ sticky arrow page markers)', status: 'bought' },
          { item: 'Forvencer 12-pocket project organizer', status: 'bought' },
          { item: 'Zippered pencil bag', status: 'bought' },
          { item: 'Thick plastic folder w/ brads — red', status: 'bought', note: 'The red 3-prong folder on the Aug 7 order is correct.' },
          {
            item: 'Thick plastic folder w/ brads — orange',
            status: 'open',
            where: 'Walmart / Amazon',
            note: 'The orange Pen+Gear poly folder that arrived is 2-pocket with no prongs, so it does not meet the list. Re-buy an orange one WITH brads.',
          },
          { item: 'Dry-erase grid whiteboard', status: 'bought' },
          { item: '4 wide-ruled composition notebooks', status: 'bought' },
          { item: '2 wide-ruled 70-page spiral notebooks', status: 'bought' },
          { item: 'Fiskars 6" scissors', status: 'bought' },
          { item: 'Crayola 12-ct colored pencils', status: 'bought' },
          { item: 'Wired mouse', status: 'bought', note: 'Already owned — not on any of the four Aug 7–8 receipts, so do not re-order off those.' },
          { item: 'Wired in-ear headphones', status: 'bought', note: 'Already owned — same caveat as the mouse.' },
          { item: 'Black Sharpies — 2 regular, 2 fine tip', status: 'bought' },
          { item: '2 highlighters', status: 'bought' },
          { item: '2 grading pens', status: 'bought' },
          { item: 'Crayola watercolors (8 colors)', status: 'bought' },
        ],
      },
      {
        group: 'Community use — do NOT label',
        tone: 'gold',
        items: [
          { item: 'Ticonderoga 30-ct pencils', status: 'bought' },
          { item: '12-ct pencil-top erasers', status: 'bought' },
          { item: 'Magic Rub eraser', status: 'bought' },
          { item: 'Expo 12-ct dry-erase markers', status: 'bought' },
          { item: '4 Elmer’s giant glue sticks', status: 'bought' },
          { item: '2 Clorox wipes', status: 'bought' },
          { item: '10-ct Crayola markers', status: 'bought' },
          { item: '24-ct Crayola crayons', status: 'bought' },
        ],
      },
      {
        group: 'Boys only (Sebastian)',
        tone: 'green',
        items: [
          { item: '3-ct Scotch tape rolls', status: 'open', where: 'Walmart / Amazon' },
          { item: '1 medium hand sanitizer', status: 'bought' },
          { item: '12-pack file folders', status: 'bought' },
        ],
      },
    ],
    notes: ['Girls-only items on the same sheet, not needed for Sebastian: 1 box tissues, 50-ct 9"×12" construction paper.'],
  },
];

const supplyListsFor = (name) => SUPPLY_LISTS.filter((l) => l.who.includes(name));

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
        text: 'SKIPPING — we opted out of the summer camp (ran Mon–Thurs 6:30–8:00 AM until Jul 23). Fall practice still starts Aug 3.',
      },
      {
        label: 'TAPPS account — LAST ITEM',
        text:
          'Rank One is complete (Janey, Jul 21) and no transfer paperwork is owed — those forms are for HS transfer students, and he has never competed at the HS level. Remaining: CASSIUS creates his own TAPPS account himself, then adds Cody’s email inside it as the parent address so it links to the parent account. Order matters — his account first, then the link.',
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
        text: 'NOT REQUIRED — Mrs. Scobee confirmed (Jul 20) that new students are exempt from the IXL Summer Boost.',
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
    items: [
      {
        label: 'Summer reading (recommended)',
        text:
          'The Tale of Despereaux · Because of Winn-Dixie · Frindle · The Cricket in Times Square · The Miraculous Journey of Edward Tulane · Hatchet.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Dress code, verbatim from the two official 2026-27 PDFs (Secondary Campus
// Student Dress Code; Elementary Campus Section 4, update 6.16.26). The two
// campuses differ in ways that cost money if you guess — belts and the chapel
// uniform are Elementary-only, and the colour is "hunter" at Secondary but
// "evergreen" at Elementary. Keep this block as the single source of truth.
// ---------------------------------------------------------------------------

const UNIFORM_RULES = [
  {
    campus: 'Secondary · Cassius (9th) & Dorothy (7th)',
    tone: 'navy',
    colors: 'White · hunter · black',
    rules: [
      { label: 'Shoes', text: 'Any closed-toe shoe. Must have a full front AND back — slip-ons are not allowed. No Crocs, water shoes, or slippers. No messages, writing, or wheels.' },
      { label: 'Socks', text: 'Matching socks in solid white, hunter, or black. (Dorothy: capri/ankle leggings or tights in solid white or black only, and only under skirts.)' },
      { label: 'Belts', text: 'NOT required — belts appear nowhere in the secondary dress code. Do not buy.', flag: 'good' },
      { label: 'Tops', text: 'Long or short sleeve polo — white, hunter, or black — stretch pique, pique, interlock, or performance. NBCA logo required.' },
      { label: 'Dorothy bottoms', text: 'A-Line side button, box pleat, or pleated — SKIRT OR SKORT — in white plaid or khaki. Also khaki twill Bermuda short or straight/bootcut pant. No shorter than 3" above the knee or she is sent to call home.' },
      { label: 'Cassius bottoms', text: 'Flat front twill blend, flat front twill cotton, or performance golf — short or pant — in khaki. Same 3"-above-knee rule applies to boys.' },
      { label: 'Outerwear', text: 'Only TH hunter or black ½-zip fleece, full-zip polar fleece, or crewneck sweatshirt — all with the NBCA logo. No sweatshirts or hoodies inside any building, gym included, except Friday. Full uniform underneath.' },
      { label: 'Friday spirit day', text: 'Long blue jeans (not ragged, torn, or holed) or uniform shorts, plus an OFFICIAL (not handmade) NBCA t-shirt or athletic jersey. No cargo shorts.' },
      { label: 'MS P.E.', text: 'Order at globalschoolwear.com OR wear a green, white, black, or gray spirit shirt. Shorts need a 5" minimum inseam.' },
    ],
  },
  {
    campus: 'Elementary · Sebastian (4th)',
    tone: 'green',
    colors: 'White · evergreen · black',
    rules: [
      { label: 'Belts', text: 'REQUIRED — brown or black belt whenever slacks or shorts have belt loops. (Navy also allowed for chapel.) This is the opposite of the secondary rule.', flag: 'warn' },
      { label: 'Chapel uniform', text: 'A separate, stricter uniform: TH khaki pant + EVERGREEN pique/interlocking/performance polo with NBCA logo, belt, solid socks. Easy to miss when buying only daily options.', flag: 'warn' },
      { label: 'Shoes', text: 'Any athletic shoe, any color. MAY NOT have characters, wheels, light-up, or open toe. Boots allowed on Spirit Days. The daily-options list also says "simple athletic-type shoe (black and/or white)" — plain black or white is the safe buy.' },
      { label: 'Socks', text: 'Solid color — evergreen, black, or white only.' },
      { label: 'Daily uniform', text: 'TH khaki pant or khaki shorts + TH white, evergreen, or black pique/interlocking/performance co-ed polo with NBCA logo. All boys’ shirts must be tucked in.' },
      { label: 'Outerwear', text: 'Inside: TH full-zip polar fleece, co-ed half-zip fleece, or crewneck — school colors, logo required. Hoodies (NBCA or school colors) only on Spirit Days. Outside: any color.' },
      { label: 'Friday spirit day', text: 'Long blue jeans (hemmed, not ragged/torn/holed) or uniform shorts with an official NBCA spirit shirt. Closed-toe shoes like boots or Sperry’s are fine, but he must bring proper athletic shoes for P.E.' },
    ],
  },
];

// What is actually still missing after the resale-sale haul (voice message, Jul 27).
// `where` matches the WHERE_ORDER buckets so these join the Supplies-tab
// shopping list alongside the paper-and-pencil items.
const UNIFORM_BUY = [
  { kid: 'Dorothy', item: '3 skirts or skorts — white plaid or khaki', where: 'Global Schoolwear', why: 'Sold out at the resale sale in five minutes. No resale path; longest lead time of anything on this list.', urgent: true },
  { kid: 'Cassius', item: '2 khaki shorts — size 31', where: 'Global Schoolwear', why: 'The "size 32" she hunted for runs big on him. 32 only if 31 is unavailable.', urgent: true },
  { kid: 'Cassius', item: '2 more logo polos (white / hunter / black)', where: 'Global Schoolwear', why: 'He has 3 from resale. 5 covers a week without midweek laundry — but confirm his 2 black + 1 green are daily polos, not spirit shirts. If they are spirit shirts he needs 5.' },
  { kid: 'Dorothy', item: 'P.E. shorts (5" min inseam)', where: 'Global Schoolwear', why: 'Shirt may not be needed — the dress code allows a green/white/black/gray spirit shirt instead. Confirm with Janey before buying the Global Schoolwear top.' },
  { kid: 'Sebastian', item: 'Brown or black belt', where: 'Any store', why: 'Required at Elementary whenever bottoms have belt loops. Not covered by the secondary rules.', urgent: true },
  { kid: 'Sebastian', item: 'Evergreen chapel polo — verify owned', where: 'Check at home', why: 'Chapel uniform is separate from daily options. Check the purchased set actually includes an evergreen logo polo.' },
  { kid: 'All three', item: 'Plain lace-up athletic sneakers', where: 'Any store', why: 'No slip-ons (secondary), no light-up or characters (elementary). Doubles as P.E. footwear for all three.' },
  { kid: 'All three', item: 'Solid white & solid black sock multipacks', where: 'Any store', why: 'Same palette works on both campuses. No patterns, no logos.' },
  { kid: 'Dorothy', item: 'Verify the BOGO cardigan + zip-up', where: 'Check at home', why: 'Must be TH hunter or black WITH the NBCA logo to be legal daily wear. A plain sweater will not pass.', urgent: true },
];

const NBCA_MISC = [
  {
    icon: Shirt,
    title: 'Uniforms, spirit wear & technology',
    points: [
      'Tommy Hilfiger is the sole approved uniform provider. Order through globalschoolwear.com using NBCA partner school code NEWB01.',
      'Spirit wear: Athletic Booster Club (sold at home football games), the PTO Online Store, the NBCA Resale Facebook page, or limited resale at the Elementary/Secondary offices.',
      'Dress-code infractions send the student to the office to call home, and the missed class counts as an unexcused absence.',
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
  { date: 'Now – Jul 23', iso: '2026-07-23', title: 'Summer strength & conditioning', detail: 'Skipping — Cassius is not attending.' },
  { date: 'Jul 25', iso: '2026-07-25', title: 'Summer Band Camp', detail: '10:15 AM–12:15 PM · Cassius & Dorothy.' },
  { date: 'Jul 27 – 31', iso: '2026-07-27', title: 'Athletics Dead Week', detail: 'No practices, games, or team events.' },
  { date: 'Jul 31', iso: '2026-07-31', title: 'Rank One athletic paperwork DUE', detail: 'DONE — Janey confirmed Jul 21 that Cassius & Dorothy are both complete in Rank One and owe no transfer forms. Only Cassius’s own TAPPS account is left.' },
  { date: 'Aug 1', iso: '2026-08-01', title: 'Band Camp / schedule-change window opens', detail: 'Summer Band Camp 10:15–12:15.' },
  { date: 'Aug 3', iso: '2026-08-03', title: 'HS fall sports begin · Media Day · Volleyball meeting', detail: 'Cassius practice starts · HS Media Day 12:30–4:30 PM · HS & MS Volleyball parent meeting 5:30 PM (Secondary Gym).' },
  { date: 'Aug 4', iso: '2026-08-04', title: 'Cross Country parent meeting', detail: 'HS & MS · 5:30 PM (Secondary Gym).' },
  { date: 'Aug 7', iso: '2026-08-07', title: 'Football parent meeting', detail: 'HS & MS · 8:00 PM (Wildcat Stadium home stands).' },
  { date: 'Aug 10', iso: '2026-08-10', title: 'MS football/volleyball begin · Elementary Meet the Teacher', detail: 'Dorothy practice starts · Meet the Teacher (A–M last names) 4:30–5:30 PM (Elementary).' },
  { date: 'Aug 11', iso: '2026-08-11', title: '4th Grade Parent Orientation', detail: '5:30–6:30 PM.' },
  { date: 'Aug 12', iso: '2026-08-12', title: 'FIRST DAY OF SCHOOL', detail: 'MS Cross Country practice also begins.' },
  { date: 'Aug 17', iso: '2026-08-17', title: 'New Parent Breakfast · 7th/8th meeting · Meet the Wildcats', detail: 'New Parent Breakfast 8:30 AM (McKenna Event Center) — RSVP’d ✓ · 7th & 8th grade parent/student meeting 5:30 PM (Secondary Gym) · Meet the Wildcats 6:30 PM (Athletic Complex).' },
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
  navy: { head: 'text-tefa-navy', chip: 'bg-tefa-navy/5 border-tefa-navy/15' },
  gold: { head: 'text-tefa-gold', chip: 'bg-tefa-gold/10 border-tefa-gold/25' },
  green: { head: 'text-tefa-green', chip: 'bg-tefa-green/5 border-tefa-green/20' },
  red: { head: 'text-tefa-red', chip: 'bg-tefa-red/5 border-tefa-red/15' },
};

// Column counts are written out literally so Tailwind's scanner emits them.
const SUPPLY_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
};

// One card per supply list, used on both the Supplies tab and the per-kid
// cards on NBCA Prep. Bought items stay visible (struck through) so the list
// reads as a reconciliation, not just a to-buy list.
const SupplyListCard = ({ list, showWho = false }) => (
  <div>
    <div className="flex items-center gap-2 mb-1 flex-wrap">
      <Backpack size={16} className="text-tefa-body/60" />
      <span className="text-sm font-bold text-tefa-navy">{list.title}</span>
      {showWho && <span className="text-[11px] font-semibold text-tefa-body/70">{list.who.join(' & ')}</span>}
      <span className="text-[11px] text-tefa-body/50">{list.meta}</span>
      {list.due && (
        <span className="text-[10px] font-bold uppercase tracking-wide bg-tefa-gold/20 text-tefa-navy rounded px-2 py-0.5">
          Due {list.due}
        </span>
      )}
      {list.link && <LinkPill label={list.link.label} url={list.link.url} />}
    </div>
    <div className={`grid gap-3 mt-3 items-start ${SUPPLY_COLS[list.groups.length] || SUPPLY_COLS[3]}`}>
      {list.groups.map((sg) => {
        const t = SUPPLY_TONE[sg.tone];
        const openInGroup = sg.items.filter((i) => i.status === 'open').length;
        return (
          <div key={sg.group} className={`rounded-lg border p-3 ${t.chip}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center justify-between gap-2 ${t.head}`}>
              <span>{sg.group}</span>
              {openInGroup > 0 && (
                <span className="text-[10px] font-bold text-tefa-red bg-white/70 rounded px-1.5 py-0.5">{openInGroup} open</span>
              )}
            </div>
            <ul className="space-y-1.5">
              {sg.items.map((item) => (
                <li key={item.item} className="flex items-start gap-2 text-xs">
                  {item.status === 'bought' ? (
                    <CheckSquare size={13} className="mt-0.5 shrink-0 text-tefa-green" />
                  ) : (
                    <Square size={13} className="mt-0.5 shrink-0 text-tefa-red" />
                  )}
                  <span className="flex-1">
                    <span className={item.status === 'bought' ? 'text-tefa-body/45 line-through' : 'font-bold text-tefa-body'}>
                      {item.item}
                    </span>
                    {item.note && <span className="block text-[11px] text-tefa-body/50 mt-0.5">{item.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
    {list.notes?.map((note) => (
      <p key={note} className="text-[11px] text-tefa-body/50 mt-2">
        {note}
      </p>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// SUPPLIES tab — "what is still outstanding", in one place. Everything below is
// derived; the facts live in SUPPLY_LISTS and UNIFORM_BUY.
// ---------------------------------------------------------------------------

// Grouped by where you actually have to go to close the item out, because that
// is what decides whether it happens in one trip or five.
const WHERE_ORDER = ['Walmart / Amazon', 'Global Schoolwear', 'Any store', 'Check at home', 'Paperwork'];
const WHERE_META = {
  'Walmart / Amazon': { blurb: 'Add to the next general-supplies order.' },
  'Global Schoolwear': {
    blurb: 'Tommy Hilfiger is the only approved provider — partner school code NEWB01. Longest lead time, order first.',
    url: 'https://www.globalschoolwear.com/',
    label: 'Global Schoolwear',
  },
  'Any store': { blurb: 'No approved vendor — it only has to meet the dress code.' },
  'Check at home': { blurb: 'Nothing to buy until someone physically checks what already arrived.' },
  Paperwork: { blurb: 'Not a purchase — a signature or a form.' },
};

// Every open line from the supply lists, plus the uniform gaps, flattened into
// one shopping list. `id` is stable so the local check-off state survives a
// reload; it changes only if the item's wording changes.
const OPEN_SUPPLY_ITEMS = [
  ...SUPPLY_LISTS.flatMap((l) =>
    l.groups.flatMap((g) =>
      g.items
        .filter((i) => i.status === 'open')
        .map((i) => ({
          id: `${l.id}:${i.item}`,
          item: i.item,
          who: l.who.join(' & '),
          source: l.title,
          due: l.due,
          where: i.where || 'Walmart / Amazon',
          note: i.note,
          url: l.link?.url,
          linkLabel: l.link?.label,
        }))
    )
  ),
  ...UNIFORM_BUY.map((u) => ({
    id: `uniform:${u.item}`,
    item: u.item,
    who: u.kid,
    source: 'Uniform & dress code',
    due: 'Aug 12',
    where: u.where,
    note: u.why,
    urgent: u.urgent,
    url: u.where === 'Global Schoolwear' ? 'https://www.globalschoolwear.com/' : undefined,
    linkLabel: u.where === 'Global Schoolwear' ? 'Global Schoolwear' : undefined,
  })),
];

// Check-off state is deliberately local to the browser: it is a shopping aid,
// not a fact about the family, so it never edits the data above. Anything
// genuinely bought should be promoted to `status: 'bought'` in SUPPLY_LISTS.
const SUPPLY_CHECK_KEY = 'iddings.supplies.checked.v1';

const readChecked = () => {
  try {
    const raw = window.localStorage.getItem(SUPPLY_CHECK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// PACK THE BOX — once something is bought, this is the sorting the kids
// actually have to do: does it get a name on it, or does it go in unlabeled
// for the class to share. Only lists that are itemized (more than the
// "nothing bought yet" placeholder) have anything to sort, so the shared
// Secondary list — bought off-page, never broken out here — is skipped in
// favor of the general rules.
// ---------------------------------------------------------------------------

const PACK_DESTINATION = {
  'ms-art': 'Its own bag — this lives in the art room all year, not the everyday box.',
  'elementary-4': 'The everyday supply box, ready to go Aug 12.',
};

const packGroupsFor = (kidName) =>
  SUPPLY_LISTS.filter((l) => l.who.includes(kidName))
    .map((l) => ({
      ...l,
      packItems: l.groups.flatMap((g) =>
        g.items
          .filter((i) => i.where !== 'Paperwork')
          .map((i) => ({ ...i, community: /community/i.test(g.group) }))
      ),
    }))
    .filter((l) => l.packItems.length > 1);

const PACK_RULES = [
  {
    icon: Tag,
    title: 'One name, one box',
    text: 'Anything that’s just theirs — pencil pouch, scissors, calculator, binder — gets their name on it before it goes in.',
  },
  {
    icon: Users,
    title: 'Shared stuff stays unlabeled',
    text: 'Consumables donated to the whole class — tissues, wipes, glue sticks, community pencils — go in bare. A name on shared stuff just means it disappears into someone else’s desk.',
  },
  {
    icon: Package,
    title: 'Class-only supplies get their own bag',
    text: 'Some supplies live in one classroom all year, not the backpack. Dorothy’s MS Art supplies stay in the art room — pack them separately from her everyday box.',
  },
  {
    icon: Backpack,
    title: 'Backups stay home',
    text: 'Extra folders or notebooks bought as backups sit in a bin at home. Only what the list actually calls for on day one rides in on day one.',
  },
];

const SUPPLY_PACK_KEY = 'iddings.supplies.packed.v1';

const readPacked = () => {
  try {
    const raw = window.localStorage.getItem(SUPPLY_PACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// A single sortable line inside a kid's pack card.
const PackItem = ({ id, item, packed, togglePacked }) => {
  const isPacked = !!packed[id];
  return (
    <li>
      <button
        onClick={() => togglePacked(id)}
        className="w-full flex items-start gap-2 text-left hover:bg-tefa-light/60 rounded px-1 -mx-1 py-0.5 transition"
      >
        {isPacked ? (
          <CheckSquare size={13} className="mt-0.5 shrink-0 text-tefa-green" />
        ) : (
          <Square size={13} className="mt-0.5 shrink-0 text-tefa-body/30" />
        )}
        <span className={`text-xs flex-1 ${isPacked ? 'text-tefa-body/40 line-through' : 'text-tefa-body/90'}`}>
          {item.item}
        </span>
      </button>
    </li>
  );
};

// Per-kid packing card: each itemized list gets split into "name goes on it"
// vs "unlabeled — shared", plus where the packed box actually ends up.
const PackTheBoxView = ({ packed, togglePacked }) => (
  <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
    <div>
      <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2">
        <Backpack size={20} /> Pack the box
      </h2>
      <p className="text-sm text-tefa-body/70">
        Once it&rsquo;s bought, here&rsquo;s how each kid sorts it &mdash; what gets a name on it, what stays
        unlabeled for the class, and what doesn&rsquo;t go in the everyday box at all.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {PACK_RULES.map((r) => (
        <div key={r.title} className="rounded-lg bg-tefa-light border border-gray-200 p-3">
          <r.icon size={16} className="text-tefa-navy/60 mb-1.5" />
          <div className="text-xs font-bold text-tefa-navy">{r.title}</div>
          <p className="text-[11px] text-tefa-body/60 mt-1">{r.text}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {STUDENTS.map((kid) => {
        const lists = packGroupsFor(kid.name);
        return (
          <div key={kid.name} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-bold text-tefa-navy">{kid.name}</span>
              <span className="text-[11px] text-tefa-body/50">{kid.grade}</span>
            </div>
            {lists.length === 0 ? (
              <p className="text-xs text-tefa-body/60">
                Nothing itemized yet — the Secondary list isn&rsquo;t broken out item by item. Once it&rsquo;s
                shopped, sort it by the rules above: personal tools get a name, class-pool consumables don&rsquo;t.
              </p>
            ) : (
              lists.map((l) => {
                const labelItems = l.packItems.filter((i) => !i.community);
                const communityItems = l.packItems.filter((i) => i.community);
                return (
                  <div key={l.id} className="mb-4 last:mb-0">
                    <div className="text-xs font-bold text-tefa-navy">{l.title}</div>
                    <div className="text-[11px] text-tefa-body/50 mb-2">
                      {PACK_DESTINATION[l.id] || 'The everyday supply box.'}
                    </div>
                    {labelItems.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-tefa-body/40 mb-1">
                          Name goes on it
                        </div>
                        <ul className="space-y-1">
                          {labelItems.map((i) => (
                            <PackItem
                              key={`${l.id}:${i.item}`}
                              id={`${l.id}:${i.item}`}
                              item={i}
                              packed={packed}
                              togglePacked={togglePacked}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                    {communityItems.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-tefa-body/40 mb-1">
                          Unlabeled — shared with the class
                        </div>
                        <ul className="space-y-1">
                          {communityItems.map((i) => (
                            <PackItem
                              key={`${l.id}:${i.item}`}
                              id={`${l.id}:${i.item}`}
                              item={i}
                              packed={packed}
                              togglePacked={togglePacked}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  </section>
);

const SuppliesView = ({ setTab }) => {
  const [checked, setChecked] = useState(readChecked);
  const [packed, setPacked] = useState(readPacked);
  const [copied, setCopied] = useState(false);

  const persist = (next) => {
    setChecked(next);
    try {
      window.localStorage.setItem(SUPPLY_CHECK_KEY, JSON.stringify(next));
    } catch {
      // Private-mode / storage-disabled browsers: the tick still works for the session.
    }
  };

  const toggle = (id) => persist({ ...checked, [id]: !checked[id] });
  const reset = () => persist({});

  const togglePacked = (id) => {
    const next = { ...packed, [id]: !packed[id] };
    setPacked(next);
    try {
      window.localStorage.setItem(SUPPLY_PACK_KEY, JSON.stringify(next));
    } catch {
      // Private-mode / storage-disabled browsers: the tick still works for the session.
    }
  };

  const total = OPEN_SUPPLY_ITEMS.length;
  const got = OPEN_SUPPLY_ITEMS.filter((i) => checked[i.id]).length;
  const left = total - got;

  const buckets = WHERE_ORDER.map((where) => ({
    where,
    items: OPEN_SUPPLY_ITEMS.filter((i) => i.where === where),
  })).filter((b) => b.items.length > 0);

  const copy = async () => {
    const md =
      `# School supplies still outstanding\n\n` +
      `_Reconciled against the Aug 7–8 orders (as of ${SUPPLIES_ASOF}). ${left} of ${total} left._\n\n` +
      buckets
        .map(
          (b) =>
            `## ${b.where}\n` +
            b.items
              .map((i) => `- [${checked[i.id] ? 'x' : ' '}] **${i.who}** · ${i.item}${i.note ? ` — ${i.note}` : ''}`)
              .join('\n')
        )
        .join('\n\n');
    try {
      await navigator.clipboard.writeText(`${md}\n`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = `${md}\n`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* The headline: how much is left, and against what deadlines */}
      <section className="bg-white rounded-xl shadow-md border-2 border-tefa-gold/50 p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2">
            <ShoppingCart size={20} /> Still outstanding
          </h2>
          <div className="flex gap-2 shrink-0">
            {got > 0 && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-tefa-body/70 border border-gray-300 hover:bg-tefa-light rounded-lg px-3 py-2 transition"
              >
                <RotateCcw size={14} /> Reset ticks
              </button>
            )}
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-tefa-green hover:bg-tefa-navy rounded-lg px-3 py-2 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy shopping list'}
            </button>
          </div>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <div className="text-4xl font-bold text-tefa-navy">{left}</div>
          <div className="text-sm text-tefa-body/60 pb-1">
            of {total} open items left — school supplies, the art sheet, and the uniform gaps, in one list.
          </div>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
          <div className="h-full bg-tefa-green transition-all" style={{ width: `${total ? (got / total) * 100 : 0}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-tefa-body/50">Aug 12</div>
            <div className="font-bold text-tefa-navy">First day of school</div>
            <div className="text-xs text-tefa-body/60 mt-0.5">Everything except the art sheet has to be in the backpack.</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-tefa-body/50">Wed Aug 19</div>
            <div className="font-bold text-tefa-navy">MS Art supplies due</div>
            <div className="text-xs text-tefa-body/60 mt-0.5">Dorothy — sheet needs a parent&rsquo;s initials too.</div>
          </div>
          <div className="rounded-lg bg-tefa-light border border-gray-200 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-tefa-body/50">Reconciled</div>
            <div className="font-bold text-tefa-navy">{SUPPLIES_ASOF}</div>
            <div className="text-xs text-tefa-body/60 mt-0.5">Checked against the two Walmart and two Amazon orders.</div>
          </div>
        </div>
        <p className="text-[11px] text-tefa-body/50 mt-3">
          Ticks are saved in this browser only — they are a shopping aid, not a record. Once something is genuinely
          bought, promote it in the source list so it shows as bought for everyone.
        </p>
      </section>

      {/* The shopping list, grouped by where you have to go */}
      {buckets.map((b) => {
        const meta = WHERE_META[b.where] || {};
        const bucketLeft = b.items.filter((i) => !checked[i.id]).length;
        return (
          <section key={b.where} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-tefa-navy">{b.where}</h2>
              <span className="text-xs font-bold text-tefa-body/50">
                {bucketLeft} of {b.items.length} left
              </span>
              {meta.url && <LinkPill label={meta.label} url={meta.url} />}
            </div>
            {meta.blurb && <p className="text-sm text-tefa-body/70 mb-4">{meta.blurb}</p>}
            <ul className="divide-y divide-gray-100">
              {b.items.map((i) => {
                const isChecked = !!checked[i.id];
                return (
                  <li key={i.id}>
                    <button
                      onClick={() => toggle(i.id)}
                      className="w-full flex items-start gap-3 text-left py-3 hover:bg-tefa-light/60 rounded-lg px-2 -mx-2 transition"
                    >
                      {isChecked ? (
                        <CheckSquare size={18} className="mt-0.5 shrink-0 text-tefa-green" />
                      ) : (
                        <Square size={18} className="mt-0.5 shrink-0 text-tefa-body/30" />
                      )}
                      <span className="flex-1">
                        <span className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${isChecked ? 'text-tefa-body/40 line-through' : 'text-tefa-navy'}`}
                          >
                            {i.item}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-tefa-navy/10 text-tefa-navy rounded px-1.5 py-0.5">
                            {i.who}
                          </span>
                          {i.urgent && !isChecked && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-tefa-red/10 text-tefa-red rounded px-1.5 py-0.5">
                              Urgent
                            </span>
                          )}
                        </span>
                        {i.note && (
                          <span className={`block text-xs mt-0.5 ${isChecked ? 'text-tefa-body/35' : 'text-tefa-body/70'}`}>
                            {i.note}
                          </span>
                        )}
                        <span className="block text-[11px] text-tefa-body/45 mt-1">
                          {i.source}
                          {i.due && ` · due ${i.due}`}
                        </span>
                      </span>
                    </button>
                    {i.url && (
                      <div className="pb-3 pl-9">
                        <LinkPill label={i.linkLabel || 'Open list'} url={i.url} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* Once it's bought, this is how the kids actually sort it into their box */}
      <PackTheBoxView packed={packed} togglePacked={togglePacked} />

      {/* Full lists, so "outstanding" can be checked against what's already done */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2">
            <Backpack size={20} /> The full lists
          </h2>
          <p className="text-sm text-tefa-body/70">
            Everything each list asks for, with what the Aug 7–8 orders already closed out struck through — so an open
            item is open because it was checked, not because it was forgotten.
          </p>
        </div>
        {SUPPLY_LISTS.map((l) => (
          <SupplyListCard key={l.id} list={l} showWho />
        ))}
      </section>

      <p className="text-sm text-tefa-body/70 text-center">
        The uniform items above are the gaps only. The full dress code, campus by campus, lives on{' '}
        <button
          onClick={() => setTab('nbca')}
          className="font-bold text-tefa-navy underline decoration-tefa-navy/40 hover:text-tefa-green"
        >
          NBCA Prep
        </button>
        .
      </p>
    </div>
  );
};

// Dress-code reference + the remaining shopping gaps, in one card. Split by
// campus because the rules genuinely conflict between the two.
const UniformView = () => (
  <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-1">
      <Shirt size={20} /> Dress code &amp; what’s left to buy
    </h2>
    <p className="text-sm text-tefa-body/70 mb-5">
      From the official 2026-27 Secondary and Elementary dress-code PDFs. The two campuses
      differ — <span className="font-semibold text-tefa-body">belts are required at Elementary and
      absent from Secondary</span>, and the green is called “hunter” at Secondary but “evergreen”
      at Elementary.
    </p>

    {/* Still-to-buy list first — it's the actionable part */}
    <div className="rounded-lg border border-tefa-gold/30 bg-tefa-gold/5 p-4 mb-6">
      <div className="text-xs font-bold uppercase tracking-wide text-tefa-gold mb-3">
        Still to buy · after the Jul 27 resale haul
      </div>
      <ul className="space-y-2.5">
        {UNIFORM_BUY.map((b) => (
          <li key={`${b.kid}-${b.item}`} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                b.urgent ? 'bg-tefa-gold' : 'bg-tefa-navy/30'
              }`}
            />
            <span className="flex-1">
              <span className="font-semibold text-tefa-navy">{b.kid}</span>
              <span className="text-tefa-body/50"> · </span>
              <span className="text-tefa-body/90">{b.item}</span>
              {b.urgent && (
                <span className="ml-2 text-[10px] font-bold bg-tefa-gold text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Order first
                </span>
              )}
              <span className="block text-xs text-tefa-body/60 mt-0.5">{b.why}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>

    {/* Per-campus rules */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {UNIFORM_RULES.map((c) => {
        const t = SUPPLY_TONE[c.tone];
        return (
          <div key={c.campus} className={`rounded-lg border p-4 ${t.chip}`}>
            <div className={`text-xs font-bold uppercase tracking-wide ${t.head}`}>{c.campus}</div>
            <div className="text-[11px] text-tefa-body/60 mb-3">Uniform colors: {c.colors}</div>
            <div className="space-y-2.5">
              {c.rules.map((r) => (
                <div key={r.label} className="border-l-2 border-gray-200 pl-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-tefa-body/60">
                    {r.label}
                    {r.flag === 'warn' && <span className="ml-1.5 text-tefa-gold">▲</span>}
                    {r.flag === 'good' && <span className="ml-1.5 text-tefa-green">✓</span>}
                  </div>
                  <p className="text-xs text-tefa-body/80 mt-0.5">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>

    <p className="text-[11px] text-tefa-body/50 mt-4">
      Order through globalschoolwear.com · NBCA partner school code <span className="font-semibold">NEWB01</span>.
      School starts Aug 12, so anything ordered new should ship by ~Aug 5.
    </p>
  </section>
);

// Master back-to-school task list, distilled from everything on this page.
// `done: true` items are already handled. `owner` is who is on the hook for an
// open item — Cody by default; only assigned elsewhere when someone else has to
// physically do it (e.g. TAPPS requires the student to create his own account).
// This is the single source both the on-page checklist and the "Copy as
// Markdown" button read from.
const NBCA_TASKS = [
  {
    group: 'Urgent — all family',
    tasks: [
      { text: 'Athletic paperwork approved for Cassius & Dorothy (TAPPS Medical History, TAPPS Student Profile, Athletic Handbook)', done: true, link: 'Rank One', url: 'https://nbca.store.rankone.com/' },
      { text: 'Physicals for Cassius & Dorothy uploaded — Janey confirmed Jul 21 that both kids are COMPLETE in Rank One', done: true, link: 'Rank One', url: 'https://nbca.store.rankone.com/' },
      { text: 'Transfer paperwork (PAPF/STF) — NOT NEEDED for either kid (Janey, Jul 21): those forms are HS transfer students only, and Cassius has never competed at the HS level', done: true },
      { text: 'Janey’s emailed PDF forms — same forms already completed in Rank One; nothing to re-file (Janey, Jul 21)', done: true },
      { text: 'OTC medication permission Jotform completed for all three kids', done: true, link: 'Open Jotform', url: 'https://form.jotform.com/251976016734058' },
      { text: 'Grandparent passes added via FACTS → Family → Family Demographic Form', done: true, link: 'FACTS', url: 'https://factsmgt.com/parent-log-in/' },
      { text: 'Hot lunch ordering set up in FACTS Parent Portal (optional)', done: false, owner: 'Cody', link: 'FACTS', url: 'https://factsmgt.com/parent-log-in/' },
    ],
  },
  {
    group: 'Cassius · 9th Grade',
    tasks: [
      { text: 'TAPPS account — LAST ITEM for the whole family: Cassius creates his OWN account first, then adds Cody’s email in it as the parent address so it links to the parent account', done: false, owner: 'Cassius', link: 'TAPPS', url: 'https://www.tapps.net/' },
      { text: 'Khaki shorts ordered — SIZE 31 (32 runs big on him); flat front twill or performance golf, no shorter than 3" above the knee', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Confirm his 2 black + 1 green resale shirts are daily logo polos, not spirit shirts — decides whether he needs 2 more tops or 5', done: false, owner: 'Cody' },
      { text: 'Signed up for High School Football tryouts', done: true, link: 'Athletics', url: 'https://www.nbcatx.org/page/athletics-overview' },
      { text: 'Summer strength & conditioning — SKIPPED (opted out)', done: true },
      { text: 'Rank One complete — TAPPS docs approved, physical in, no transfer forms owed (Janey, Jul 21)', done: true, link: 'Rank One', url: 'https://nbca.store.rankone.com/' },
      { text: 'Cross Country parent meeting Aug 4 · Football parent meeting Aug 7', done: false, owner: 'Cody', link: 'Calendar', url: 'https://www.nbcatx.org/page/calendar-events' },
      { text: 'Secondary supply list purchased', done: false, owner: 'Cody', link: 'Supply list', url: 'https://aptg.co/tCJ7SC' },
      { text: 'Summer reading (English 9 Honors): The 7 Habits of Highly Effective Teens (Covey), The Faithful Spy (Hendrix), The Hiding Place (ten Boom) + response questions', done: true, link: 'Reading list', url: 'https://aptg.co/y0zrrR' },
    ],
  },
  {
    group: 'Dorothy · 7th Grade',
    tasks: [
      { text: 'PE shorts ordered (5" min inseam) — ask Janey whether the Global Schoolwear shirt is required, since the dress code allows a green/white/black/gray spirit shirt instead', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Skirts/skorts ordered — white plaid or khaki, no shorter than 3" above the knee (sold out at the resale sale)', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Resale BOGO cardigan + zip-up verified as TH hunter/black WITH the NBCA logo', done: false, owner: 'Cody' },
      { text: 'Athletic paperwork COMPLETE — physical received, no transfer forms needed (Janey, Jul 21)', done: true, link: 'Rank One', url: 'https://nbca.store.rankone.com/' },
      { text: 'IXL Summer Boost — NOT REQUIRED for new students (Mrs. Scobee, Jul 20)', done: true },
      { text: 'Volleyball parent meeting Aug 3 · Cross Country parent meeting Aug 4', done: false, owner: 'Cody', link: 'Calendar', url: 'https://www.nbcatx.org/page/calendar-events' },
      { text: 'Secondary supply list purchased', done: false, owner: 'Cody', link: 'Supply list', url: 'https://aptg.co/tCJ7SC' },
      { text: 'MS Art supply list — DUE WED AUG 19, needs parent initials on the sheet. Item-by-item status is on the Supplies tab', done: false, owner: 'Cody' },
      { text: 'Summer reading: The Wednesday Wars (Gary D. Schmidt) + One-Pager response (test grade)', done: true, link: 'Reading list', url: 'https://aptg.co/J20fyQ' },
    ],
  },
  {
    group: 'Sebastian · 4th Grade',
    tasks: [
      { text: 'Uniforms for Elementary purchased', done: true, link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Brown or black belt bought — REQUIRED at Elementary whenever bottoms have belt loops (secondary has no belt rule, so easy to miss)', done: false, owner: 'Cody' },
      { text: 'Confirm the purchased set includes an EVERGREEN logo polo for the chapel uniform — it is separate from the daily options', done: false, owner: 'Cody' },
      { text: '4th-grade school supplies — mostly bought Aug 7–8; what is left is on the Supplies tab', done: false, owner: 'Cody', link: 'Supply list', url: 'https://5il.co/2o0ag' },
      { text: 'Summer reading (recommended): The Tale of Despereaux, Because of Winn-Dixie, Frindle, The Cricket in Times Square, The Miraculous Journey of Edward Tulane, Hatchet', done: true },
    ],
  },
  {
    group: 'General',
    tasks: [
      { text: 'Daily uniforms — Sebastian’s purchased; Cassius & Dorothy’s being picked up by a helper while we’re traveling', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Pickup arranged for the resale haul (Cassius: 2 black + 1 green shirts; Dorothy: cardigan + zip-up; plus spirit wear) — count and size everything on arrival', done: false, owner: 'Cody' },
      { text: 'Plain lace-up athletic sneakers for all three — no slip-ons (secondary), no light-up/characters (elementary)', done: false, owner: 'Cody' },
      { text: 'Solid white & solid black sock multipacks — same palette works on both campuses', done: false, owner: 'Cody' },
      { text: 'Volunteer application submitted (for field-trip chaperones / background check)', done: false, owner: 'Cody', link: 'Apply', url: 'https://forms.gle/ZTV3kLtAhhTxUTaEA' },
    ],
  },
];

// Serialize the task list to GitHub-flavored Markdown checkboxes for copying.
const tasksToMarkdown = () =>
  NBCA_TASKS.map(
    (g) =>
      `### ${g.group}\n` +
      g.tasks
        .map(
          (t) =>
            `- [${t.done ? 'x' : ' '}] ${t.owner ? `**@${t.owner}** · ` : ''}${t.text}` +
            `${t.url ? ` — [${t.link || 'Link'}](${t.url})` : ''}`
        )
        .join('\n')
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
        Everything from this page in one checklist — {done} of {total} done. Every open item has an
        owner (Cody unless tagged otherwise). Copy pastes clean Markdown checkboxes into Notes,
        Todoist, GitHub, etc.
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
                  <span className="flex-1">
                    {!t.done && t.owner && (
                      <span
                        className={`mr-1.5 inline-block align-baseline rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          t.owner === 'Cody'
                            ? 'bg-tefa-navy/10 text-tefa-navy'
                            : 'bg-tefa-gold/20 text-tefa-body'
                        }`}
                      >
                        {t.owner}
                      </span>
                    )}
                    <span className={t.done ? 'text-tefa-body/50 line-through' : 'text-tefa-body/80'}>{t.text}</span>
                    {t.url && (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1.5 inline-flex items-center gap-0.5 align-baseline text-[11px] font-semibold text-tefa-green hover:underline whitespace-nowrap"
                      >
                        {t.link || 'Link'} <ExternalLink size={10} />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const NbcaPrepView = ({ setTab }) => {
  const nextIdx = NBCA_TIMELINE.findIndex((e) => e.iso >= TODAY);
  const openSupplies = OPEN_SUPPLY_ITEMS.length;

  return (
    <div className="space-y-6">
      {/* Supplies live on their own tab — this page links there rather than
          re-listing what is outstanding. */}
      <button
        onClick={() => setTab('supplies')}
        className="w-full flex items-center justify-between gap-3 text-left bg-white rounded-xl shadow-md border border-gray-200 hover:border-tefa-green/50 p-4 transition"
      >
        <span className="flex items-center gap-3">
          <ShoppingCart size={20} className="text-tefa-green shrink-0" />
          <span>
            <span className="block text-sm font-bold text-tefa-navy">
              {openSupplies} school-supply &amp; uniform items still outstanding
            </span>
            <span className="block text-xs text-tefa-body/60">
              Supply lists, the art sheet, and the uniform gaps — one tickable checklist.
            </span>
          </span>
        </span>
        <span className="text-sm font-bold text-tefa-navy shrink-0">Supplies &rarr;</span>
      </button>
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

          {/* Supply lists for this child, rendered from the shared SUPPLY_LISTS
              source so the Supplies tab and this card can never disagree. */}
          {supplyListsFor(kid.name).map((l) => (
            <div key={l.id} className="mt-5">
              <SupplyListCard list={l} />
            </div>
          ))}
        </section>
      ))}

      {/* Dress code + what's still to buy */}
      <UniformView />

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
