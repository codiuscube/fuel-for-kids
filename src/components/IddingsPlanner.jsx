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
import FallPlanView from './FallPlanView';

// ---------------------------------------------------------------------------
// Single source of truth for the family's real numbers. Everything the page
// shows is derived from the data in this block — update here if a figure changes.
// ---------------------------------------------------------------------------

const TODAY = '2026-08-13';

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
// OUR ORIGINAL POSITION — 49,001 – 50,000. An ESTIMATE, not a fact. ⚠ Read this before
// quoting the absolute numbers anywhere.
//
// What Odyssey has ACTUALLY told us about our own position, and nothing more:
//   • original band          30,000 – 50,000   (at sign-up)
//   • families ahead, Jul 29 15,001 – 20,000
//   • families ahead, Aug 11  3,001 –  4,000   (official, ticket #727303)
// Note what is missing: no absolute rank, ever. Odyssey only reports the GAP.
//
// The 49,001–50,000 below is inferred: Jul 29's gap (15,001–20,000) added to the Jul 29
// frontier (~34,000, itself community-derived) gives 49,001–54,000, truncated by the
// 50,000 band ceiling. So it inherits every soft assumption in that 34,000 — it is the
// DEEPEST reading our band allows, i.e. the conservative end, not a measurement.
//
// ⚠ WHY IT IS SAFE TO KEEP USING ANYWAY. Swept across the whole band Odyssey gave us
// (original position 32,000 → 50,000, so frontier 28,500 → 46,500), the verdict does not
// change: the high case clears the gap at every value, the low case falls short at every
// value, and the expected case covers ~3,450 of a 3,001–4,000 gap at every value — i.e. the
// open question is where in that 1,000-wide band we sit, never how deep the cascade has run.
// (Before the Aug 13 pool cut the expected case cleared outright; it no longer does.) That is
// not luck — the model is anchored on the GAP (measured, ±1,000) and prices fuel in seats,
// so where the absolute line sits only changes how much fuel has already been burned. And
// it errs safe: a SHALLOWER true position means less fuel spent, hence more left, hence a
// BIGGER advance. 49,001 is the pessimistic corner of the band.
//
// Consequence for the reader: treat every absolute figure in this file (46,000 frontier,
// ~49,450 expected terminal) as a scale that could shift by ±10,000 wholesale. Treat the GAP,
// and the advance-vs-gap comparison built on it, as the real output.
// ---------------------------------------------------------------------------
const YOUR_POS = { lo: 49001, hi: 50000 };
// The one HARD fact about our absolute position: the band Odyssey gave us at sign-up.
// YOUR_POS sits at the very bottom of it.
const ORIGINAL_BAND = { lo: 30001, hi: 50000 };
// Verified by sweeping the fuel model across ORIGINAL_BAND — see the ⚠ note above.
const POSITION_IS_ESTIMATE = true;

// THE PERSONAL READING — now the single most reliable input in this file, and the
// PRIMARY quantity the model tracks. Everything about "how close are we" derives from
// this; the absolute frontier is downstream of it, not the other way round.
//
// Aug 11, 2026, 3:25 PM — Odyssey Parent Support, ticket #727303 (Devon, Parent Support
// Associate), replying to a direct question: "your student currently falls within the
// 3,001-4,000 range on the waitlist. This is a band, not an exact position, since agents
// don't have visibility into individual rankings, only management can confirm ranges."
//
// This is OFFICIAL and PERSONAL — not a community estimate, not an inference. It is the
// first hard number we have had about our own position since Jul 29.
//
// ⚠ BE PRECISE ABOUT WHAT THE MATCH PROVES. The model's derived gap was also 3,001–4,000,
// and an earlier pass read that agreement as confirming the 46,000 frontier AND the
// 49,001–50,000 position. It does not. Expand the derivation and the anchor cancels:
//   derived gap = YOUR_POS − FRONTIER_NOW
//               = (Jul29 gap + 34,000) − (34,000 + observed advance)
//               = Jul29 gap − observed advance
// The 34,000 drops out. So the exact match confirms the OBSERVED ADVANCE (~12,000–16,000
// between Jul 29 and Aug 11) and the gap itself — it says nothing about absolute depth.
// Odyssey reports only gaps, so no Odyssey reading can ever pin the absolute frontier.
// That is why the model treats the gap as primary and the frontier as cosmetic scale.
//
// The same email confirms three mechanics the model already assumes:
//   • "No fixed weekly or monthly schedule for awards. They go out in BATCHES tied to
//     Comptroller announcements."     → bursty, not a smooth per-day rate.
//   • "Spots open up as awarded students OPT OUT, SWITCH from private school to
//     HOMESCHOOL, or as APPEALS get resolved."  → exactly the three fuel terms modelled
//     below (opt-out frees ~$10,474, the $2,000 homeschool downgrade frees ~$8,474, and
//     appeals draw on the reserve).
//   • "No action is needed on your end. We'll notify you directly if your student is
//     awarded."                        → nothing to chase; awards arrive by email and text.
//
// Prior reading, for the delta: 15,001–20,000 as of Jul 29.
const ODYSSEY_READING = { lo: 3001, hi: 4000, asOf: '2026-08-11', official: true };
const ODYSSEY_PREV = { lo: 15001, hi: 20000, asOf: '2026-07-29' };

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
// ⚠ DATED. This is the JUN 23 figure and is only valid for Jun/Jul-vintage derivations
// (REMAINDER, OBS_OPTOUT_RATE, optOutPctNow). Do NOT swap the Aug figure in here — REMAINDER
// is defined as (this − FUNDED_JULY1), so mixing an August count with a July funded count
// silently produces a meaningless "remainder". Use AWARDED_AUG10 for anything current.
const ACTIVE_AWARDS = 107000; // "nearly 107,000 active" (Jun 23 update)

// ---------------------------------------------------------------------------
// AUG 10 2026 FACT SHEET — "118,441 STUDENTS AWARDED", Award Snapshot 8/10/2026, published
// alongside the "Nearly 15,000 Additional TEFA Awards Issued to Tier 3 Students" release.
// The single most informative document of the summer: it is the first data that lets the
// cascade depth be derived WITHOUT any community input.
// ---------------------------------------------------------------------------
const AWARDED_AUG10 = 118441;
// Priority-tier split of that total (fact sheet donut). Tier 4 is absent — it does not move
// in Year 1. Percentages are as published; the counts are ours.
const TIER_SPLIT_AUG10 = { t1: 0.18, t2: 0.55, t3: 0.27 };
const AWARDED_BY_TIER = {
  t1: Math.round(AWARDED_AUG10 * TIER_SPLIT_AUG10.t1),   // ~21,319
  t2: Math.round(AWARDED_AUG10 * TIER_SPLIT_AUG10.t2),   // ~65,143
  t3: Math.round(AWARDED_AUG10 * TIER_SPLIT_AUG10.t3),   // ~31,979
};
// Awards made at the lottery, before any cascade (May 7 tier table).
const INITIAL_AWARDS = { t1: 20700, t1sib: 12800, t2: 51800, t3: 30 };
// INDEPENDENT FRONTIER CHECK. Every Tier 2/Tier 3 award beyond the lottery allocation is a
// cascade award, so summing them gives the depth directly — no community reports involved.
// Lands at ~45,300 against the model's 46,000: agreement within ~700 from a wholly separate
// direction, and the first real corroboration this estimate has ever had.
const FRONTIER_FROM_FACTSHEET =
  (AWARDED_BY_TIER.t2 - INITIAL_AWARDS.t2) + (AWARDED_BY_TIER.t3 - INITIAL_AWARDS.t3);
// Two caveats, both live: these are counts NET of opt-outs, so true cumulative depth is
// somewhat deeper; and it assumes the 12,800 Tier 1 siblings are not folded into fact-sheet
// T2/T3 (if they all sat in T2 the implied frontier would be ~32,500). Fact-sheet Tier 1
// (21,319) is close to initial Tier 1 alone (20,700) and CANNOT be the 33,500 that includes
// siblings — counts do not shrink — so siblings are certainly not in Tier 1. The community
// read (frontier cutting the DEEP end of the 30–50k band) also favours ~45,300 over ~32,500.

// Funded participants as of the annual demographic report ("more than 85,000", early Aug,
// i.e. BEFORE the Aug 10 wave). Deliberately held at the floor of "more than 85,000".
const FUNDED_EARLY_AUG = 85000;
// ⚠ THE POOL DOES NOT DRAIN — it REFILLS. Awarded-but-unresolved before the Aug wave was
// 103,441 − 85,000 = ~18,441, essentially IDENTICAL to Pillow's 18,000 on Jul 11, even though
// ~13,000 families lapsed out of it in between. Each new award wave refills it as fast as it
// empties. (See the Aug 13 block below: the refill argument was right about the MECHANISM but
// the Aug 13 count shows the pool empties into FUNDED far faster than it lapses.)
const AWARDED_BEFORE_AUG_WAVE = AWARDED_AUG10 - 15000;          // ~103,441
const PENDING_BEFORE_AUG_WAVE = AWARDED_BEFORE_AUG_WAVE - FUNDED_EARLY_AUG;  // ~18,441

// ---------------------------------------------------------------------------
// AUG 13 2026 PRESS RELEASE — "Comptroller Don Huffines Announces 100,000 Students Receiving
// Texas Education Freedom Accounts". Short release, one hard number, and it is the number the
// model has been waiting all summer for.
//
// VERBATIM, the three things it states:
//   • "Huffines previously announced more than 85,000 students had received funding. The new
//      awards bring the number to 101,600, and that figure is expected to increase as
//      additional awards are made."
//   • "More than 100,000 students remain on the program waitlist for the 2026-27 school year."
//   • The four-week mechanic, spelled out precisely: "Once a student receives an award, their
//      parents have four weeks to opt in … Parents must complete these steps before a child can
//      receive funding in their account and count as a participant."
//
// ⚠ THIS RELEASE IS PRECISE ABOUT "FUNDED" vs "AWARDED" — unlike the Aug 11 social copy that
// triggered the acceptance-rate false alarm below. It says funding has been DELIVERED and that
// these students COUNT AS PARTICIPANTS, and it separately describes awards as the thing that
// precedes funding. So 101,600 is a genuine FUNDED count, directly comparable to the 85,000.
// ---------------------------------------------------------------------------
const FUNDED_AUG13 = 101600;                                    // OFFICIAL, Aug 13 press release
const FUNDED_SINCE_EARLY_AUG = FUNDED_AUG13 - FUNDED_EARLY_AUG; // ~16,600 funded in ~2 weeks
// Floor only — the release says "more than 100,000". Cannot be converted into a frontier
// without an eligible-applicant count, which this file does not carry. Recorded, not used.
const WAITLIST_REMAINING_AUG13 = 100000;

// THE POOL, RE-MEASURED. pending = awarded − funded. Awarded is the Aug 10 fact sheet's
// 118,441; funded is now the Aug 13 release's 101,600.
//
//   118,441 − 101,600 = 16,841
//
// That HALVES the fuel pool the whole forward model runs on (it was 33,441 on the Aug 11
// pass). Every one of those ~16,600 families who converted to funded has permanently locked
// their money in — they can no longer lapse and free a seat for us. This is a real, material
// downgrade and the narrative below has been rewritten to match rather than talked around.
//
// ⚠ IT IS A FLOOR, NOT A MEASUREMENT. The awarded side is stale: the release says awards are
// still going out ("expected to increase as additional awards are made"), and any award issued
// after Aug 10 adds to pending without appearing in the 118,441. So true pending is ≥ 16,841.
// The model takes the floor, which is the conservative choice.
const PENDING_NOW = AWARDED_AUG10 - FUNDED_AUG13;               // ~16,841
// Of what is left, at most 15,000 can be the Aug 10 cohort (window to ~Sep 7), so at least
// this many must be older awards whose window closes ~Aug 26. Used to shape the wave's steps.
const PENDING_EARLY_NOW = Math.max(0, PENDING_NOW - 15000);     // ~1,841

// ---------------------------------------------------------------------------
// WHAT 101,600 SAYS ABOUT THE LAPSE RATE — the measurement, and the trap in it.
//
// AGGREGATE VIEW (the like-for-like one). 101,600 of 118,441 awards are already funded — 85.8%
// — with two cohorts' windows still open. So the CUMULATIVE non-activation rate across every
// award TEFA has issued cannot exceed 14.2%, and will land under it as the open windows
// resolve. That matters because the benchmarks this model leans on (D.C. 14.3%, Milwaukee 30%,
// 8% queueing floor) are all AGGREGATE program-level attrition rates. TEFA is already running
// stickier than D.C. and nowhere near Milwaukee. The honest read: the benchmark transfer that
// the Aug 11 pass called "a defensible stretch" is now measurably too generous at the top end.
//
// RESIDUAL VIEW (what the model actually uses). The 15% dial is applied to the PENDING pool,
// not to all awards — "of families still holding an unresolved award, what share let the window
// expire". Those two definitions are not the same number, and the conversion is stark:
//   residual rate = aggregate rate × (total awards ÷ pending) = aggregate × 7.03
// So the model's 15% residual = only ~2.1% aggregate, and the break-even below (~17.4%
// residual) = ~2.5% aggregate. Read the other way, D.C.'s 14.3% AGGREGATE would need ~16,900
// lapses — more than the entire 16,841 pool. The aggregate benchmarks are now un-hittable
// ceilings rather than central cases.
//
// WHICH TO BELIEVE: the residual view, and it is the conservative one. Two reasons the residual
// pool should lapse HARDER than any aggregate benchmark: (1) it has been purified — the
// already-opted-in families just drained out of it into the funded count, leaving the
// non-responders concentrated; (2) it is deep Tier 3, offered in mid-August after school
// started, so most have already committed elsewhere. Against that, the Aug 13 number is direct
// evidence that Texas families are claiming these awards at a very high rate. Net: keep 15% as
// the central dial, treat the aggregate ceiling as the reason NOT to raise it.
// ---------------------------------------------------------------------------
const CONVERSION_TO_DATE = FUNDED_AUG13 / AWARDED_AUG10;        // ~0.858 funded / awarded
const MAX_AGGREGATE_LAPSE = 1 - CONVERSION_TO_DATE;             // ~0.142 — a hard ceiling
// Multiply an aggregate program-level rate by this to put it on the model's residual scale.
const RESIDUAL_PER_AGGREGATE = AWARDED_AUG10 / PENDING_NOW;     // ~7.03

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
const TAIL_SHARE = { low: 0.15, likely: 0.25, high: 0.35 };  // LEGACY (pre-Aug-11 model) — see LAPSE_RATE
const AUG_ATTRITION = { low: 0.005, likely: 0.010, high: 0.015 }; // LEGACY (pre-Aug-11 model)

// ---------------------------------------------------------------------------
// THE MODEL, REBUILT Aug 11 2026 — ONE WAVE, ONE DIAL.
//
// The old three-lever model (tail share × melt ÷ acceptance) was answering the wrong question,
// and it under-called two waves running. The Aug 10 fact sheet showed why: it assumed a fixed
// 18,000 laggard pool DRAINING to ~5,505, when in fact the pool REFILLS with every award wave.
//
// ⚠ REVISED Aug 13. That refill argument was right about the mechanism and wrong about the
// magnitude. The Aug 13 press release put funded at 101,600 against the Aug 10 fact sheet's
// 118,441 awarded, so the pool is ~16,841, not the ~33,441 this model used two days ago — the
// pool empties into FUNDED far faster than it lapses. Fuel is the binding constraint again, and
// the expected case has gone from clearing our seat by ~2,200 to clearing it by ~450.
//
// What actually decides the outcome is now a single quantity: of the families holding an
// unresolved award, what share let their four-week window LAPSE. So the model is one wave at
// ~Sep 7 (by which date both open cohorts' windows have closed — Jul 29's ~Aug 26 and
// Aug 10's ~Sep 7), drawn on the known pool, with lapse rate as the only unknown.
//
//      wave = PENDING_NOW × lapseRate × SEATS_PER_LAPSE
//
// WHY THE RATES BELOW ARE EXTERNAL BENCHMARKS, NOT OUR OWN HISTORY. Backing a lapse rate out
// of the Jul/Aug waves gives ~61%, but that is selection-biased garbage: Pillow's 18,000 were
// families who had ALREADY failed to respond for weeks, so of course they lapsed. Worse, those
// waves were a one-time deadline mop-up (Jul 15 opt-in + Jul 31 confirmation both fell right
// before the Aug 10 batch, and that pool went 18,000 → ~1,400). A fresh cohort will not repeat
// it. So the scenarios are anchored on published multi-program attrition instead.
//
// Corroboration that the reassignment is right: the observed Jul/Aug waves imply an effective
// ~30% rate — which lands on Milwaukee, the HIGH benchmark, not the central one. The waves
// were running hot, exactly as the mop-up reading predicts. Hence 30% is the aggressive case.
//
// ⚠ HONEST LIMIT: these are YEAR-ONE attrition rates for lottery winners, not lapse rates
// within a four-week opt-in window. Using them here is a defensible stretch, not a like-for-
// like transfer. It should if anything UNDERSTATE lapse — this cohort is deep Tier 3, offered
// in late August after school has already started, so most have committed elsewhere. The 8%
// floor is doing real work precisely because of that mismatch.
//
// ⚠ SHARPENED Aug 13, and this cuts BOTH ways. The release lets the mismatch be quantified for
// the first time (see CONVERSION_TO_DATE): read as AGGREGATE rates, all three benchmarks are
// now above what TEFA can physically produce — 85.8% of every award issued is already funded,
// capping cumulative non-activation at 14.2%. Read as RESIDUAL rates on the pending pool —
// which is how the model applies them — the same three numbers imply an aggregate of only
// 1.1 / 2.1 / 4.3%, comfortably inside that ceiling. The dials stay where they are, but the
// label is now "share of the pending pool", never "share of all awardees".
// ---------------------------------------------------------------------------
const LAPSE_RATE = {
  low:    0.08,   // queueing-theory minimum renege rate (Kanoria); the gem's "optimistic floor"
  likely: 0.15,   // gem central; D.C. Opportunity Scholarship measured 14.3% (Hoover)
  high:   0.30,   // Milwaukee Parental Choice (ERIC ED472999) — and what Jul/Aug implied
};
// A LAPSE releases the whole award, not a downgrade's fraction: the family took no action, so
// they cannot have chosen the $2,000 homeschool tier. Full $10,474 back, against a ~$7,678
// blended new award → each lapse funds ~1.36 seats. (The old model applied the observed 23:77
// opt-out:downgrade split to lapsers, which was wrong for exactly this reason.)
const FULL_AWARD = 10474;
const SEATS_PER_LAPSE = FULL_AWARD / TEFA_BUDGET.blendedCost;   // ~1.364

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
// as deep as the funded-seat count. (Superseded Jul 29: with our seat ESTIMATED at 49,001 the
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
  // Aug 11: a SECOND big wave, with no deadline behind it. Still unofficial — the
  // Comptroller has published nothing since late June — but this point is TRIANGULATED
  // from four independent readings in the Aug 10–11 TEFA Parents threads rather than
  // resting on one person's number (see AUG11_TRIANGULATION for the full working):
  //   1. Devyn Shaffer  — orig 30–50k "closer to the 50k end", now 3–4k ahead  → ~45–46k
  //   2. Mary Foreman   — orig 50,001–100,000, gap 20–25k as of Jul 31         → validates 34k
  //   3. Hilda Soto     — orig 50k–100k, now 5–10k ahead                       → ~45–48k
  //   4. The funded/unfunded boundary: every 30–50k original who does NOT self-place at
  //      the deep end got funded Aug 10–11 (Savannah Elery, Jenn Graham, Chelsea Krek,
  //      Marie Alexa, Jamie Pfent, Ashleigh Bomar), while the deep-end 30–50k families
  //      (Devyn, Shawna Turk, Amanda Mae Morris) did NOT — so the frontier is cutting
  //      through the deep end of the 30–50k band right now                     → ~45–47k
  // Four methods converge on 46,000. Rate: ~1,000/day since Jul 29.
  //
  // OFFICIAL CORROBORATION (Aug 11): the Texas Education Freedom Accounts account posted
  // "We've funded almost 15,000 additional waitlisted students! Log in to your parent portal
  // to check for an updated status and award notification." This is the first official figure
  // since late June, and it independently confirms a wave of this size. It does NOT pin the
  // frontier exactly, because "additional funded" is a COUNT and the frontier is a DEPTH, and
  // the two readings disagree:
  //   (a) 34,000 (community Jul 29) + 15,000  → frontier ~49,000, i.e. AT our seat already.
  //   (b) The personal anecdotes cap it lower: Devyn Shaffer self-places at the deep end of
  //       the 30–50k band (so ≤50,000) and still reads 3–4k ahead, which is impossible if the
  //       frontier were 49,000. Reading (b) implies the community's 34,000 was ~2–3k high and
  //       the true Jul 29 base was ~31–32k, giving 31,500 + 15,000 → ~46,500.
  // NARROWED, same day, by the Odyssey support email (see ODYSSEY_READING): our own
  // management-confirmed band is 3,001–4,000 ahead, which is incompatible with reading (a)
  // (at 49,000 we would be ~1,000 out, not 3–4k), so (a) is RETIRED and 46,000 stands as the
  // central estimate. ⚠ But `confirmed` here means "consistent with every reading we have",
  // NOT "published". No document states a cascade depth. This 46,000 still rests on the
  // community triangulation above plus an inferred position — see the ⚠ note on YOUR_POS for
  // why the conclusion survives being wrong about it by ±10,000.
  { date: '2026-08-11', frontier: 46000, confirmed: true, officialWave: 15000 },
  // Aug 13: NO new frontier point. The press release publishes a FUNDED count (101,600), not a
  // waitlist depth, and the two are different populations — see the funded/awarded/active note.
  // It does say awards are still going out ("expected to increase as additional awards are
  // made") and that "more than 100,000 students remain on the program waitlist", so the frontier
  // has probably moved a little past 46,000 since Aug 11 and our official 3,001–4,000 gap is if
  // anything slightly stale in our favour. Neither is quantified, so neither is modelled.
];

// The frontier band, DERIVED from the official Odyssey reading rather than triangulated:
// frontier = our ESTIMATED position − families still ahead of us. Width ~±1,000 reflects only
// the Odyssey band; it does NOT include the (much larger, but harmless) uncertainty in
// YOUR_POS, which shifts this whole band bodily without changing the gap. See YOUR_POS.
//   lo = YOUR_POS.lo − gap.hi = 49,001 − 4,000 = 45,001
//   hi = YOUR_POS.hi − gap.lo = 50,000 − 3,001 = 46,999
// Used as the anchor uncertainty for the Monte Carlo. It is ~±1,000 now instead of the old
// −2,000/+3,000 triangulation spread, because we are no longer guessing where the line is.
const AUG11_TRIANGULATION = {
  lo: YOUR_POS.lo - ODYSSEY_READING.hi,
  central: 46000,
  hi: YOUR_POS.hi - ODYSSEY_READING.lo,
};

// Frontier for an observation, whichever way it was recorded.
const frontierOf = (o) => (o.frontier != null ? o.frontier : T2_AT_LOTTERY - o.t2Remaining);

// Frontier reached so far = how deep the cascade has funded down the global list.
// Future advance is added ON TOP of this from the 18k not-opted-in pool, so it's the base
// the projection and the simulator both build from.
const FRONTIER_NOW = frontierOf(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1]); // 46,000 (Aug 11, confirmed by the Odyssey band)
// The advance since the previous observation (34,000 Jul 29 → 46,000 Aug 11).
const FRONTIER_PREV = frontierOf(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 2]);  // 34,000 (Jul 29)
const RECENT_ADVANCE = FRONTIER_NOW - FRONTIER_PREV;                            // ~12,000 in 13 days
// The Jul 15 shakeout advance, kept for the fuel back-out below (16,916 → 34,000).
const JUL29_ADVANCE = 34000 - 16916;                                            // ~17,084

// THE GAP — how many families are still ahead of us. OBSERVED, not derived: it is read
// straight off the Odyssey support email. This is deliberately the primary quantity in
// the model, because it survives every dispute about the absolute frontier. Whether the
// line is really at 46,000 or 41,000 changes our implied original position, but it does
// NOT change how many families are ahead of us — Odyssey measured that directly.
const CURRENT_GAP = { lo: ODYSSEY_READING.lo, hi: ODYSSEY_READING.hi };
// The gap two weeks ago, and how much of it burned off in the Aug wave.
const GAP_PREV = { lo: ODYSSEY_PREV.lo, hi: ODYSSEY_PREV.hi };
const GAP_CLOSED = {
  lo: GAP_PREV.lo - CURRENT_GAP.hi,   // ~11,001, the conservative read
  hi: GAP_PREV.hi - CURRENT_GAP.lo,   // ~16,999, the generous read
};
// Kept for the copy that quotes a best/worst spread. With an official reading the spread
// collapses onto the reading itself.
const GAP_RANGE = { best: CURRENT_GAP.lo, worst: CURRENT_GAP.hi };

// Consistency check, replacing the old staleness guard. Two independent things now claim
// to know where the frontier is: the observation series, and (our estimated position − the
// official Odyssey gap). They should agree. If a future edit moves one without the other,
// say so loudly rather than letting the model quietly describe two different worlds.
if (FRONTIER_NOW < AUG11_TRIANGULATION.lo || FRONTIER_NOW > AUG11_TRIANGULATION.hi) {
  console.warn(
    `[TEFA] Frontier observation (${FRONTIER_NOW.toLocaleString()}) is outside the band implied by ` +
    `the ${ODYSSEY_READING.asOf} Odyssey reading (${AUG11_TRIANGULATION.lo.toLocaleString()}–` +
    `${AUG11_TRIANGULATION.hi.toLocaleString()}). One of YOUR_POS, ODYSSEY_READING, or the newest ` +
    `T2_OBSERVATIONS entry is out of date.`
  );
}
// Third, INDEPENDENT check: the Aug 10 fact sheet's tier split implies a cascade depth with no
// community input in it at all. Warn if the model's frontier drifts far from it.
if (Math.abs(FRONTIER_NOW - FRONTIER_FROM_FACTSHEET) > 2500) {
  console.warn(
    `[TEFA] Frontier (${FRONTIER_NOW.toLocaleString()}) disagrees with the Aug 10 fact-sheet ` +
    `derivation (${FRONTIER_FROM_FACTSHEET.toLocaleString()}) by more than 2,500. The fact sheet ` +
    `is the only frontier evidence with no community input — reconcile before trusting the model.`
  );
}
if (Date.parse(ODYSSEY_READING.asOf) < Date.parse(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1].date)) {
  console.warn(
    `[TEFA] Odyssey reading (${ODYSSEY_READING.asOf}) is older than the newest frontier ` +
    `observation (${T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1].date}) — refresh it.`
  );
}

// ⚠⚠ LEGACY — THE PRE-AUG-11 THREE-LEVER MODEL. Nothing below drives the chart, the table, or
// the simulator; the live model is the one-wave/one-dial block further down (forwardAdvance).
// Kept verbatim because the Aug 11 rebuild note and the "scoring our own Jul 29 call" narrative
// both refer back to these numbers. The terminals quoted here (47,300 / 51,200 / 60,900) are
// what the OLD model said, not current output — current is 47,838 / 49,446 / 52,892.
//
// TWO frontiers, TWO levers. The number that decides whether an offer REACHES us is the
// OFFER frontier, not the funded-seat count — and it runs much deeper, because a deep-Tier-3
// family who is offered a freed seat and says NO frees no money; it just passes the SAME
// dollars to the next position on the list (the never-activation stretch). So, rebuilt on
// the Aug 11 anchor (46,000) with the deadline pool now mostly spent:
//
//   departures     = tailShare × (what's LEFT of the 18k)  +  augAttrition × funded base
//   funded seats   = departures × seats-per-departure          (how many seats get filled)
//   OFFER frontier = 46,000 + funded seats ÷ acceptance        (how deep an offer travels)
//
// where "what's LEFT of the 18k" is backed out of the observations themselves — and note it
// is backed out of the FULL advance since the pool was counted, both draws, not just the
// Jul 15 one, or the August fuel would be credited twice:
//   departures already spent = (29,084 advance × acceptance) ÷ seats-per-departure
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
//   LOW    (15% tail, 0.5% melt, 35% decline) → OFFER ≈ 47,300  (short of us by ~1,700)
//   LIKELY (25% tail, 1.0% melt, 50% decline) → OFFER ≈ 51,200  (CLEARS our 49,001 by ~2,200)
//   HIGH   (35% tail, 1.5% melt, 65% decline) → OFFER ≈ 60,900  (clears comfortably)
// THE CONCLUSION FLIPPED. Under the Jul 29 anchor only the high case reached us; now only the
// LOW case misses, and it misses by ~1,700 instead of ~8,000. Our position did not move — the
// frontier did, ~12,000 deeper in 13 days. The live question is the last ~3,000–4,000 positions
// between the frontier and OUR seat. `optOutShare` splits each departure between full opt-outs
// (~$10,474 freed) and $2,000 homeschool downgrades (~$8,474) — held at the observed 23/77
// mix; new fills stay at the observed 33% homeschool blend (~$7,678/seat).
// Scenarios, not forecasts; after Aug 31 each drifts on small residual churn.
const OBS_OPTOUT_SHARE_OF_CHURN = 0.231;   // observed 2.8% opt-out / 9.3% downgrade split

const REALISTIC = {
  lapseRate: LAPSE_RATE.likely,             // EXPECTED — 15% lapse (gem central; D.C. 14.3%)
  reserveSeats: RESERVE_SEATS,              // 0 — appeals reserve spent Jul 8 (already in frontier-now)
};

const AGGRESSIVE = {
  lapseRate: LAPSE_RATE.high,               // AGGRESSIVE — 30% (Milwaukee; also what Jul/Aug implied)
  reserveSeats: RESERVE_SEATS,
};

const RESEARCH = {
  lapseRate: LAPSE_RATE.low,                // PESSIMISTIC — 8% queueing floor; below any real program
  reserveSeats: RESERVE_SEATS,
};

// ---------------------------------------------------------------------------
// ACCEPTANCE RATE — an alarm raised and then RETRACTED the same day (Aug 11). Kept in full,
// because the retraction depends on a wording distinction that is easy to lose again.
//
// THE ALARM: the program's social post said they had "FUNDED almost 15,000 additional
// waitlisted students." Our own gap closed by 11,001–16,999 POSITIONS over the same stretch.
// Read that way, positions-passed ÷ funded implies acceptance of 0.88–1.36 — at or above
// 1.0, not the 0.50 assumed here — which would mean the 2× offer stretch is fictitious and
// the forward advance is ~1,300 rather than ~5,200, i.e. short of the gap.
//
// THE RETRACTION: the official news release (Aug 11, "Nearly 15,000 Additional TEFA Awards
// ISSUED to Tier 3 Students") shows the social copy was loose. The release says the
// Comptroller "AWARDED TEFA to nearly 15,000 additional students," and that "parents will
// have FOUR WEEKS from the date of their award to opt in and confirm enrollment." So the
// 15,000 are OFFERS, not funded seats — none of them can be funded yet. Offers map ~1:1 onto
// waitlist positions passed, so 15,000 offers against our 11,001–16,999 positions is exactly
// what the offer-frontier model predicts. It implies NOTHING about acceptance.
//
// Net: the 0.50 stands, and the ~87% with it. The alarm was an artifact of reading "funded"
// where the agency meant "awarded".
//
// STILL GENUINELY UNKNOWN, just not evidenced either way: what fraction of deep Tier 3
// offerees actually opt in. The first real measurement arrives when the four-week window on
// the Aug 10 batch closes (~Sep 7) and the funded count is published against the 15,000
// issued. That single figure resolves the largest remaining lever in this model.
//
// LESSON: "funded", "awarded", and "active" are three different populations in this program
// (85,000 funded / 118,000 active / awards issued cumulatively higher still). Never cross a
// social-media paraphrase with a hard count without checking which one it means.
// ---------------------------------------------------------------------------

// Shared fuel math, used by both the projection and the Monte Carlo so the two can't drift.
// Back-solve how much of the 18k the observed Jul 29 advance consumed, then price what's left.
// The pool has been drawn down by BOTH big draws, not just the Jul 15 shakeout — the
// Aug 11 wave carried another ~12,000. Back the consumption out of the FULL advance
// since the Jul 11 pool count (16,916 → 46,000 = ~29,084), or the model would credit
// the August fuel twice and over-project the terminal.
const TOTAL_ADVANCE_SINCE_POOL_COUNT = FRONTIER_NOW - 16916;   // ~29,084 (Jul 8 → Aug 11)
// LEGACY back-out, retained only for the historical narrative on the TEFA tab (how much of
// Pillow's 18,000 the summer consumed). It no longer drives any projection.
const spentDepartures = (accept, spd) => (TOTAL_ADVANCE_SINCE_POOL_COUNT * accept) / spd;
const remainingPool = (accept, spd) => Math.max(0, CHURN_POOL - spentDepartures(accept, spd));
const fundedBase = (accept) => FUNDED_JULY1 + TOTAL_ADVANCE_SINCE_POOL_COUNT * accept;

// ---------------------------------------------------------------------------
// THE FORWARD MODEL. One wave, one dial. Everything the projection and the Monte Carlo
// need now comes from this single line:
//
//     wave = PENDING_NOW (16,841, published) × lapseRate (the only unknown) × 1.364 seats/lapse
//
// No ÷acceptance term any more. Under a ONE-generation model an award issued IS a position
// passed, so the offer frontier and the funded frontier are the same thing. The old ÷accept
// was standing in for the geometric refill across generations; gating to a single wave makes
// it explicit instead, and stops it silently doubling the reach.
//
// ⚠ THE ONE-GENERATION GATE IS NOW THE LOAD-BEARING ASSUMPTION, not a technicality. With a
// 33,441 pool it barely mattered — every scenario cleared us either way. With 16,841 it decides
// the answer. Each lapsed award is re-offered, and that new offeree can lapse in turn, so the
// true series is geometric: total ≈ wave ÷ (1 − lapseRate × 1.364). At the 15% central dial
// that multiplier is ~1.26, turning ~3,450 positions into ~4,340 — the difference between
// landing inside our 3,001–4,000 gap and clearing the far end of it. The model stays on ONE
// generation because a second generation needs a second award batch to actually be issued, and
// that is an agency decision we cannot observe. Treat the geometric figure as upside, not base.
// ---------------------------------------------------------------------------
const forwardAdvance = (lapseRate) => PENDING_NOW * lapseRate * SEATS_PER_LAPSE;
// How many families must let their window lapse for the wave to reach a given depth.
const lapsesFor = (positions) => (positions * TEFA_BUDGET.blendedCost) / FULL_AWARD;
// The break-even: below this lapse rate the wave stops short of the FAR end of our gap.
// ~17.4% of the pending pool, which is ~2.5% of all awards issued — the aggregate rate the
// benchmarks are actually measured on. Was ~8.8% before the Aug 13 funded count halved the pool.
const BREAKEVEN_LAPSE = lapsesFor(CURRENT_GAP.hi) / PENDING_NOW;
// The NEAR end of the gap — the depth that reaches us if we sit at the shallow end of our own
// 1,000-wide position estimate. ~13.1%, i.e. under the central dial.
const BREAKEVEN_LAPSE_NEAR = lapsesFor(CURRENT_GAP.lo) / PENDING_NOW;
// Multi-generation upside: each lapse is re-offered and can lapse again. Shown, not used.
const geometricAdvance = (lapseRate) => {
  const r = lapseRate * SEATS_PER_LAPSE;
  return r >= 1 ? Infinity : forwardAdvance(lapseRate) / (1 - r);
};

// Anchor uncertainty. This USED to be the dominant unknown, when the Aug 11 frontier rested
// on community triangulation. The Aug 11 Odyssey support email collapsed it to ~±1,000 (the
// width of the confirmed 3,001–4,000 band), so the forward fuel rate is now the binding
// uncertainty again. Kept in the model rather than removed, because the next refresh will
// re-widen it. This is deliberately NOT applied to the three projection
// lines: the chart's observed series ends at the central 46,000, so shifting a line's
// terminal without shifting its anchor would draw a low case that dips below a point we
// have already plotted. It belongs in the Monte Carlo instead, where the anchor can be
// drawn jointly with the fuel levers — see ANCHOR_SD in the simulator.
const ANCHOR_BAND = {
  lo: AUG11_TRIANGULATION.lo - AUG11_TRIANGULATION.central,   // −2,000
  hi: AUG11_TRIANGULATION.hi - AUG11_TRIANGULATION.central,   // +2,000
};

// Chart window: from the lottery (frontier 0) through mid-September. `today` anchors the
// "Today" marker to a fixed date so a screenshot of the chart reads the same for everyone
// (the artifact gets posted/shared) — bump it as the analysis is refreshed, rather than
// letting it drift with the viewer's clock.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: '2026-08-13', jul15: '2026-07-15', jul29: '2026-07-29', end: '2026-09-15' };
// ONE WAVE, landing ~Sep 7 — the date both open cohorts' four-week windows have closed
// (Jul 29's batch ~Aug 26, Aug 10's ~Sep 7). Modelling a single merged wave at the later date
// captures both without double-counting either.
const WAVES_END = '2026-09-07';
// No post-wave drift. The old model trickled 25 seats/day forever, which quietly added
// thousands past the horizon. Under a one-wave model the line is flat after Sep 7 — if a
// further wave comes, that is a NEW cohort to be added explicitly, not a drift term.
const POST_DRIFT = 0;
// Key intermediate: the Jul 29 cohort's window closes here, so part of the wave lands early.
const WAVE_MID = '2026-08-26';

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

  // Terminal frontier = the Aug 11 anchor + ONE wave, sized by how much of the known 16,841
  // pending pool lapses. No acceptance stretch: within a single generation an award issued is
  // a position passed, so offer depth and funded depth are the same number.
  const terminalSeats = (s) => Math.round(fL + forwardAdvance(s.lapseRate) + s.reserveSeats);
  // Kept so the UI's funded-vs-offer callouts still resolve; under one wave they coincide.
  const terminalFunded = (s) => terminalSeats(s);
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

  // ONE WAVE, shaped by when the two open cohorts' four-week windows actually close.
  // Nothing lapses before a window closes, so the line is FLAT through mid-August — the old
  // model's smooth taper implied movement on days when no deadline existed. The steps:
  //   • ~Aug 26  the Jul 29 cohort's window closes  → the older ~1,841 of the pool resolves
  //   • ~Sep 7   the Aug 10 cohort's window closes  → the fresh 15,000 resolves
  // after which the line is flat: no drift term, because a further wave would be a NEW cohort
  // to add explicitly rather than a trickle to assume.
  //
  // The split moved sharply on Aug 13. It used to be ~55% landing by Aug 26, on the assumption
  // that the older ~18,441 were all still unresolved. The Aug 13 funded count shows they were
  // not: ~16,600 families converted to funded, and the older cohort — awarded first, waiting
  // longest, opt-ins already lodged — is the obvious place that came from. At most 15,000 of
  // the remaining 16,841 can be the Aug 10 batch, so ≥1,841 is the older tail. The wave is now
  // essentially a single ~Sep 7 event with a small step before it.
  const waveMid = dayOf(WAVE_MID);
  const EARLY_SHARE = PENDING_EARLY_NOW / PENDING_NOW;   // ~0.11 lands by Aug 26
  const waveShape = (defTerminal) => [
    { t: tL, f: fL },                                                   // Aug 11 anchor (~46,000)
    { t: dayOf('2026-08-18'), f: fL },                                  // flat — no window has closed
    { t: waveMid, f: fL + EARLY_SHARE * (defTerminal - fL) },           // Jul 29 cohort lapses
    { t: wavesEnd, f: defTerminal },                                    // Aug 10 cohort lapses
  ];

  // EXPECTED — 15% lapse of the pending pool → ~49,450. Clears our estimated seat (49,001) by
  // only ~450, and lands INSIDE the 3,001–4,000 gap band rather than past it. Marginal, not safe.
  const real_ = fitLine(waveShape(defRealT), defRealT, realistic);
  const realFn = real_.fn, realTerminal = real_.terminal;

  // AGGRESSIVE — 30% lapse (Milwaukee, and what the Jul/Aug mop-up waves implied) → ~52,900.
  const agg_ = fitLine(waveShape(defAggT), defAggT, aggressive);
  const aggFn = agg_.fn, aggTerminal = agg_.terminal;

  // PESSIMISTIC — 8% lapse, the queueing-theory floor → ~47,850, about 1,150 SHORT of our seat.
  // It cleared us on the Aug 11 pass; the Aug 13 funded count halving the pool is what put it
  // back under water.
  const research_ = fitLine(waveShape(defResearchT), defResearchT, research);
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
  const TABLE_DATES = ['2026-07-08', '2026-07-29', '2026-08-11', '2026-08-26', '2026-09-07', '2026-09-15'];
  const sampleAt = (fn) => TABLE_DATES.map((d) => Math.round(fn(dayOf(d))));
  const projectionTable = {
    dates: TABLE_DATES,
    aggressive: sampleAt(aggFn),
    conservative: sampleAt(realFn),
    research: sampleAt(researchFn),
  };

  const spdObs = seatsPerDeparture(OBS_OPTOUT_SHARE_OF_CHURN, 1 - OBS_OPTOUT_SHARE_OF_CHURN);
  const HIST_ACCEPT = 0.50;   // the old model's central acceptance, kept ONLY for the historical back-out
  const kpis = {
    asOf: t2Observations[t2Observations.length - 1].date,
    asOfUnofficial: !!t2Observations[t2Observations.length - 1].unofficial,
    frontierNow: fL,
    frontierPrev: FRONTIER_PREV,
    jul29Advance: JUL29_ADVANCE,        // the Jul 15 shakeout (16,916 → 34,000)
    recentAdvance: RECENT_ADVANCE,      // the Aug 11 wave (34,000 → 46,000)
    totalAdvance: TOTAL_ADVANCE_SINCE_POOL_COUNT,
    anchorLo: AUG11_TRIANGULATION.lo,
    anchorHi: AUG11_TRIANGULATION.hi,
    officialWave: t2Observations[t2Observations.length - 1].officialWave ?? null,
    // Tier 2 is CLEARED — the frontier is this far PAST the 20,383 Tier 2 backlog.
    intoTier3: fL - T2_AT_LOTTERY,
    // Positions still between the frontier and our own seat — the only gap that matters,
    // and the one number here that is OFFICIAL and specific to us: read straight off the
    // Aug 11 Odyssey support email rather than derived from any frontier estimate.
    gapToUs: CURRENT_GAP.lo,
    gapToUsHi: CURRENT_GAP.hi,
    gapBest: GAP_RANGE.best,
    gapWorst: GAP_RANGE.worst,
    gapPrevLo: GAP_PREV.lo,
    gapPrevHi: GAP_PREV.hi,
    gapClosedLo: GAP_CLOSED.lo,     // ~11,001 positions burned off in the Aug wave
    gapClosedHi: GAP_CLOSED.hi,     // ~16,999 on the generous read
    // The last personal Odyssey reading, and whether it still confirms the derived gap.
    odysseyLo: ODYSSEY_READING.lo,
    odysseyHi: ODYSSEY_READING.hi,
    odysseyAsOf: ODYSSEY_READING.asOf,
    odysseyStale: Date.parse(ODYSSEY_READING.asOf) < Date.parse(t2Observations[t2Observations.length - 1].date),
    optOutsSoFar,
    optOutPctNow: +(100 * optOutsSoFar / ACTIVE_AWARDS).toFixed(1), // ~2.8% (Jun 23)
    funded: FUNDED_JULY1,
    // Base the August melt actually applies to: the Jul 1 cohort PLUS the seats both draws
    // filled since. Quoting the bare 73,000 understates it by ~14,500.
    meltBase: Math.round(fundedBase(HIST_ACCEPT)),
    remainder: CHURN_POOL,          // the PRE-deadline 18k pool (historical reference)
    // What's actually left of that 18k after the Jul 29 draw, at the central acceptance.
    poolLeft: Math.round(remainingPool(HIST_ACCEPT, spdObs)),
    poolSpent: Math.round(spentDepartures(HIST_ACCEPT, spdObs)),
    notActivatedJul1: REMAINDER,    // historical: 107k active − 73k funded Jul 1
    optedInSince: REMAINDER - CHURN_POOL, // ~16k of the Jul-1 remainder have since opted in
    reserveSeats: realistic.reserveSeats,
    projectionTable,
    researchTerminal,
    // *TailPct = the share of the SURVIVING laggard pool still to be swept (15 / 25 / 35%).
    // *LapsePct = THE dial: share of the pending pool that lets its 4-week window lapse.
    researchLapsePct: +(research.lapseRate * 100).toFixed(1),
    realisticLapsePct: +(realistic.lapseRate * 100).toFixed(1),
    aggressiveLapsePct: +(aggressive.lapseRate * 100).toFixed(1),
    // The known pool the wave is drawn from, and the two cohorts inside it.
    pendingNow: PENDING_NOW,
    pendingEarly: PENDING_EARLY_NOW,
    pendingFresh: PENDING_NOW - PENDING_EARLY_NOW,
    pendingWas: PENDING_BEFORE_AUG_WAVE + 15000,   // ~33,441, the Aug 11 pass's pool
    // Aug 13 press release — the first published funded count since the annual report.
    fundedNow: FUNDED_AUG13,
    fundedPrev: FUNDED_EARLY_AUG,
    fundedSince: FUNDED_SINCE_EARLY_AUG,
    waitlistRemaining: WAITLIST_REMAINING_AUG13,
    conversionPct: +(CONVERSION_TO_DATE * 100).toFixed(1),      // ~85.8% of awards already funded
    maxAggregateLapsePct: +(MAX_AGGREGATE_LAPSE * 100).toFixed(1), // ~14.2% ceiling
    // Lapse rate below which the wave stops short of us, and the lapses that implies.
    breakevenLapsePct: +(BREAKEVEN_LAPSE * 100).toFixed(1),
    breakevenLapseNearPct: +(BREAKEVEN_LAPSE_NEAR * 100).toFixed(1),
    // The same break-even expressed on the scale the published benchmarks are measured on.
    breakevenAggregatePct: +(BREAKEVEN_LAPSE / RESIDUAL_PER_AGGREGATE * 100).toFixed(1),
    breakevenLapses: Math.round(lapsesFor(CURRENT_GAP.hi)),
    seatsPerLapse: +SEATS_PER_LAPSE.toFixed(2),
    // Upside if a SECOND award batch is issued and its lapses cascade too (not in the lines).
    realisticWaveGeometric: Math.round(geometricAdvance(realistic.lapseRate)),
    // Wave size each scenario implies (positions, = awards issued).
    researchWave: Math.round(forwardAdvance(research.lapseRate)),
    realisticWave: Math.round(forwardAdvance(realistic.lapseRate)),
    aggressiveWave: Math.round(forwardAdvance(aggressive.lapseRate)),
    factsheetFrontier: FRONTIER_FROM_FACTSHEET,
    awardedAug10: AWARDED_AUG10,
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

// The default (no-slider) projection, computed once at module load. The Now tab's summary
// card quotes the same headline terminals the TEFA tab charts, and both must come from this
// one call so a future tweak to the scenarios cannot leave the two tabs disagreeing.
const DEFAULT_KPIS = buildCascadeProjection().kpis;


const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtChartDate = (ts) => {
  if (ts == null) return '—';
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const FRONTIER_TICKS = ['2026-05-04', '2026-06-01', '2026-07-01', '2026-07-29', '2026-08-11', '2026-08-31', '2026-09-15'].map(Date.parse);

// Plain-language likelihood of the cascade reaching each global waitlist band,
// drawn from the published bands analysis. ourBand flags the family's bucket.
const BAND_OUTLOOK = [
  {
    band: 'Tier 2 clears',
    scope: 'positions 1 – 20,383',
    call: 'DONE',
    tone: 'good',
    note: 'Settled since Jul 29, and now far behind the frontier — at ~46,000 the cascade is roughly 25,600 positions PAST the 20,383 Tier 2 backlog. Every award going out is a Tier 3 award.',
  },
  {
    band: '20,384 – 30,000',
    scope: 'early / mid Tier 3',
    call: 'DONE',
    tone: 'good',
    note: 'Also passed on Jul 29. These positions were the whole question in the Jul 11 model, which topped out near 37,900 even if all 18,000 laggards walked. The deadline shakeout cleared them outright — and the Aug 11 wave has since gone ~16,000 deeper still.',
  },
  {
    band: '30,001 – 46,000',
    scope: 'our band, above our seat',
    call: 'DONE',
    tone: 'good',
    note: 'Passed. The Aug 11 wave carried the frontier to ~46,000 — a second big draw with no deadline behind it. The Aug 10–11 community threads show exactly this boundary: families whose original was 30–50k are being funded right now (Savannah Elery, Jenn Graham, Chelsea Krek, Marie Alexa, Jamie Pfent, Ashleigh Bomar), while the ones who self-place at the DEEP end of that same band are not yet. The frontier is cutting through the last few thousand positions of our band as of today.',
  },
  {
    band: '49,001 – 50,000',
    scope: 'YOUR SEAT · the bottom of the band',
    call: 'Live — 3,001–4,000 to go; expected case clears by ~450, pessimistic case misses',
    tone: 'mid',
    ourBand: true,
    note: 'The gap itself is not an estimate. Odyssey Parent Support confirmed on Aug 11 (ticket #727303) that we sit in the 3,001–4,000 range on the waitlist — a management-confirmed band, down from 15,001–20,000 on Jul 29. So roughly 11,000–17,000 families cleared in thirteen days, which matches the Comptroller\'s "almost 15,000 additional waitlisted students" post over the same window: two unrelated sources, one personal and one public, agreeing on the movement. Our own position inside the band is still an ESTIMATE (~49,001–50,000, the deepest corner of it) — Odyssey only ever reports the gap, never a rank. THEN AUG 13 TIGHTENED IT. The Comptroller\'s press release put funded students at 101,600, up from "more than 85,000": about 16,600 families claimed their awards in a fortnight. Every one of them is a family that can no longer release money to us, so the unconfirmed-award pool the whole forward model runs on halved, from ~33,441 to ~16,841. The scenarios move with it: expected ~49,450 (clears our estimated seat by only ~450 and covers ~3,450 of the 3,001–4,000 gap), aggressive ~52,900 (clears), pessimistic ~47,850 (misses by ~1,150). The break-even went from 8.8% of the pool to 17.4% — above D.C.\'s 14.3% benchmark. Two things still argue our way: 85.8% of all awards issued are already funded, so the break-even is only ~2.5% of the total awarded population, well inside any published attrition rate; and the families left in the pool are the concentrated non-responders, deep Tier 3 offered in mid-August after school started. The wave lands in two steps as the four-week windows close — ~Aug 26 for the small older tail, ~Sep 7 for the Aug 10 batch. This is a live chance leaning our way, NOT the comfortable clear it looked like on Aug 11. Do not spend the money before it arrives.',
  },
  {
    band: '50,001 +',
    scope: 'deeper Tier 3 / Tier 4',
    call: 'Plausible',
    tone: 'mid',
    note: 'Barely further than us, since we sit at the band floor. On the Aug 13 numbers the expected case (~49,450) stops just short of it and only the aggressive case (~52,900) crosses — a change from the Aug 11 pass, where the likely case reached in. Families originally in the 50k–100k band are being funded (Amy Bryant, Hilda Soto now 5–10k out), so the frontier is in the neighbourhood. Tier 4 still does not move in Year 1.',
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
  { date: 'Aug 11', iso: '2026-08-11', title: 'OFFICIAL — "almost 15,000 additional waitlisted students" funded. CHECK THE PORTAL.', kind: 'do',
    detail: 'The Texas Education Freedom Accounts account posted: "We\'ve funded almost 15,000 additional waitlisted students! Log in to your parent portal to check for an updated status and award notification." First official figure since late June, and it confirms the August wave the community threads were describing. Resolved the same afternoon by Odyssey support: we are 3,001–4,000 from the front, so the wave took the frontier to ~46,000 rather than the ~49,000 the most optimistic reading allowed. ACTION: log into the Odyssey parent portal and check status — and check email and text, including spam. Awards have been landing at odd hours (one family was funded at 9pm).' },
  { date: 'Aug 11', iso: '2026-08-11', title: 'OFFICIAL — Odyssey confirms we are in the 3,001–4,000 range', kind: 'info',
    detail: 'Odyssey Parent Support replied to a direct question (ticket #727303, 3:25 PM): "your student currently falls within the 3,001-4,000 range on the waitlist. This is a band, not an exact position, since agents don\'t have visibility into individual rankings, only management can confirm ranges." This is the single most reliable datapoint we have — official and specific to our family — and it replaces every community estimate for the number that decides our outcome. On Jul 29 the same reading was 15,001–20,000, so ~11,000–17,000 families cleared in thirteen days, matching the Comptroller\'s "almost 15,000 additional" post independently. Our position has not moved (49,001–50,000), so the frontier is 45,001–46,999 — confirming the ~46,000 central estimate and retiring the competing ~49,000 read. The email also confirms three mechanics the model assumes: awards go out in BATCHES tied to Comptroller announcements with no fixed schedule; spots open as families opt out, switch to homeschool, or win appeals; and no action is needed on our end — they notify directly. On the numbers available that day the likely case cleared our seat by ~2,200; the Aug 13 funded count has since cut that to ~450.' },
  { date: 'Aug 13', iso: '2026-08-13', title: 'OFFICIAL — 101,600 students funded. The fuel just halved.', kind: 'info',
    detail: 'Comptroller press release, "Huffines Announces 100,000 Students Receiving Texas Education Freedom Accounts": funding has been delivered to 101,600 students, up from the "more than 85,000" announced in the annual report — about 16,600 families claimed their awards in a fortnight. It also restates the mechanic precisely: four weeks from the award date to opt in and confirm enrollment, and only then does a child "receive funding in their account and count as a participant". Consequence for us, and it is not the good kind: the model runs on awarded minus funded, so the pool of unconfirmed awards fell from ~33,441 to ~16,841. Claimed money can never be released to the waitlist. Expected terminal ~52,800 → ~49,450 (clears our estimated seat by ~450 instead of ~2,200), pessimistic ~49,650 → ~47,850 (now misses), break-even 8.8% → 17.4% of the pool. Two offsets: 85.8% of all awards issued are already funded, so the break-even is only ~2.5% of everyone awarded — well inside any published attrition rate; and the release says awards are still going out, which the model does not count. Also stated: "more than 100,000 students remain on the program waitlist."' },
  { date: 'Late August', iso: '2026-08-25', title: 'TEFA — first of two window-close steps (~Aug 26)', kind: 'info',
    detail: 'The four-week opt-in window closes for what is left of the Jul 29 award cohort. After the Aug 13 funded count that is a small step — at most 15,000 of the 16,841 unconfirmed awards can be the Aug 10 batch, so at least ~1,841 sit in this older tail. The bigger step is ~Sep 7, when the Aug 10 batch closes. Only families who let the window LAPSE free money for us; families who opt in do not. Watch email AND text — awards land at odd hours (one family in the Aug 10 thread was funded at 9pm).' },
  { date: 'Sep 7', iso: '2026-09-07', title: 'TEFA — the wave that decides it (~Sep 7)', kind: 'info',
    detail: 'The Aug 10 cohort\'s four-week window closes. This is the single event the whole model turns on: up to 15,000 unconfirmed awards resolve, and each one that lapses returns the full $10,474, funding ~1.36 new offers at the ~$7,678 blended cost. At the expected 15% lapse rate that is ~3,450 more positions against a 3,001–4,000 gap — enough if we sit at the shallow end of our position estimate, short at the deep end. Aggressive 30% clears outright; pessimistic 8% falls ~1,150 short.' },
  { date: 'Oct 1', iso: '2026-10-01', title: 'TEFA 2nd installment (if funded)', kind: 'info',
    detail: 'Only relevant if a waitlist offer reached us and we opted in. As of the Aug 13 revision that is a live chance leaning our way rather than either a long shot or a safe bet. Still not money to spend before it lands.' },
  { date: 'Feb 1', iso: '2027-02-01', title: 'TEFA final installment (if funded)', kind: 'info',
    detail: 'Final 50% of a TEFA award, if one arrives.' },
];

// Confirmed payment plan: ten equal FACTS drafts starting July 6. Amounts are
// computed from the live balance below.
const PAYMENT_PLAN = {
  note: 'Standard FACTS schedule: ten equal drafts starting July 6.',
  shares: Array(10).fill(0.1),
  dates: ['Jul 6, 2026', 'Aug 5, 2026', 'Sep 8, 2026', 'Oct 5, 2026', 'Nov 5, 2026',
    'Dec 7, 2026', 'Jan 5, 2027', 'Feb 5, 2027', 'Mar 5, 2027', 'Apr 5, 2027'],
};

const VALID_TABS = ['now', 'money', 'timeline', 'nbca', 'supplies', 'fall', 'tefa'];
const TAB_LABELS = {
  now: 'Now',
  money: 'Money',
  timeline: 'Timeline',
  nbca: 'NBCA Prep',
  supplies: 'Supplies',
  fall: 'Fall Plan',
  tefa: 'TEFA',
};

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

      {/* The Fall Plan is a full-bleed call sheet with its own masthead and grid,
          so it gets a wider container and no page padding of its own. */}
      <main
        className={
          activeTab === 'fall'
            ? 'max-w-6xl mx-auto'
            : 'max-w-4xl mx-auto p-6 space-y-6'
        }
      >
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
        {activeTab === 'fall' && <FallPlanView />}
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
  const k = DEFAULT_KPIS;   // headline TEFA numbers, shared with the TEFA tab
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
          This decision had to be made back in June, when TEFA looked out of reach — and it had to be made
          without knowing what August would bring. It is now genuinely in reach (see below), but every TEFA
          date lands <em>after</em> June 30, so the choice was always whether to commit to NBCA and pay tuition
          out of pocket. Kept here as the record of a call made on the information available at the time.
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
          <AlertCircle size={20} /> TEFA: check the parent portal now — we are ~{k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()} away, possibly zero
        </h2>
        <p className="text-sm text-amber-900 mb-3 font-semibold">
          Odyssey Parent Support confirmed it directly on Aug 11 (ticket #727303): we are in the{' '}
          <strong>{k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()}</strong> range on the waitlist. That is a
          management-confirmed band about our own family — the first hard number we have had since Jul 29, when it was{' '}
          {k.gapPrevLo.toLocaleString()}–{k.gapPrevHi.toLocaleString()}.
        </p>
        <p className="text-sm text-amber-900/90 mb-3">
          All three kids are <strong>{TEFA.tier}</strong> and <strong>waitlisted</strong> in band{' '}
          <strong>{TEFA.band}</strong> (texted to us {TEFA.notifiedOn}). Where we sit <em>inside</em> that band has never been
          published — we estimate <strong>{YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()}</strong>, the deepest
          and therefore most pessimistic corner of it. What changed is everything ahead of us: about{' '}
          <strong>{k.gapClosedLo.toLocaleString()}–{k.gapClosedHi.toLocaleString()}</strong> families cleared in thirteen days.
          That independently matches the Comptroller&rsquo;s Aug 11 post — &ldquo;we&rsquo;ve funded almost{' '}
          {k.officialWave?.toLocaleString()} additional waitlisted students&rdquo; — so two unrelated sources agree on the
          movement, which puts the frontier at roughly <strong>{FRONTIER_NOW.toLocaleString()}</strong>.
        </p>
        <p className="text-sm text-amber-900/90 mb-3">
          <strong>Still a live chance, but the margin got thin on Aug 13.</strong> The expected case lands{' '}
          ~{k.realisticTerminal.toLocaleString()} by ~Sep 7 — <strong>past our estimated seat</strong>, but by only ~
          {Math.abs(k.realisticTerminal - YOUR_POS.lo).toLocaleString()} rather than the ~2,200 this page showed two days ago.
          In gap terms it covers {k.realisticWave.toLocaleString()} of the {k.gapToUs.toLocaleString()}–
          {k.gapToUsHi.toLocaleString()} still ahead of us: enough if we sit at the shallow end of our own position estimate,
          short if we sit at the deep end. The aggressive case clears comfortably; the pessimistic case now misses by ~
          {Math.abs(YOUR_POS.lo - k.researchTerminal).toLocaleString()}. Call it a coin flip that leans our way, not a
          likely win.
        </p>
        <p className="text-sm text-amber-900/90 mb-3">
          <strong>What changed.</strong> The Aug 13 press release put funded students at{' '}
          <strong>{k.fundedNow.toLocaleString()}</strong>, up from {k.fundedPrev.toLocaleString()} — about{' '}
          {k.fundedSince.toLocaleString()} families claimed their awards. Good news for them, bad news for the fuel: every
          family who <em>takes</em> the money is a family who can no longer <em>release</em> it to us. The pool of unconfirmed
          awards has halved, from ~{k.pendingWas.toLocaleString()} to <strong>{k.pendingNow.toLocaleString()}</strong>. For the
          next wave to reach the far end of our gap, <strong>{k.breakevenLapsePct}%</strong> of those{' '}
          {k.pendingNow.toLocaleString()} now have to let their four-week window expire — up from 8.8% before this release.
          To reach the near end, {k.breakevenLapseNearPct}%.
        </p>
        <p className="text-sm text-amber-900/90 mb-3">
          <strong>The one number that argues the other way.</strong> {k.conversionPct}% of every award TEFA has issued is
          already funded, which caps the program&rsquo;s total walk-away rate at {k.maxAggregateLapsePct}% — so our break-even
          only needs {k.breakevenAggregatePct}% of all awardees, not {k.breakevenLapsePct}% of everyone. And the families left
          in the pool are the concentrated non-responders: the ones who already acted have just drained out of it into the
          funded count. Deep Tier 3, offered mid-August with school already started, is exactly the group that lapses.
        </p>
        <p className="text-sm text-amber-900/90">
          <strong>Two real cautions.</strong> The wave being too small is back on the table — that is the whole Aug 13
          revision. And a wave may not come at all: a funding halt, an administrative pause, a legal challenge. Nothing points
          at the second, and the release says awards are still going out and the funded figure &ldquo;is expected to increase
          as additional awards are made&rdquo;. Odyssey says they arrive in batches tied to Comptroller announcements, so
          expect a step around <strong>Aug 26</strong> and a bigger one around <strong>Sep 7</strong> rather than steady
          movement. It all lands <strong>after</strong> the Jun 30 withdrawal deadline regardless. This model has been too
          pessimistic twice and is now correcting downward two days later, which is a fair warning about how much any single
          reading is worth — <strong>keep budgeting the full balance until the money actually arrives</strong>.
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

const CONSERVATIVE_CHURN = 15; // EXPECTED lapse rate — gem central; D.C. Opportunity Scholarship measured 14.3%
const CONSERVATIVE_DECLINE = 50; // LEGACY, unused by the one-wave model; retained so old props still resolve

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
      // ONE DIAL. The model now has a single unknown — what share of the 16,841 pending awards
      // let their four-week window lapse — so the simulator draws that and nothing else. The old
      // shared "favorability" factor coupling three levers is gone: coupling levers was a way of
      // faking a single underlying axis, and now the axis is explicit.
      const lapse = mcPert(churnMin, churnMode, churnMax) / 100;
      // ANCHOR UNCERTAINTY. Small: the Aug 11 Odyssey email pins the gap to a 1,000-wide band,
      // so the start point is uncertain by only ~±1,000 (45,001-46,999). Drawn on its OWN axis —
      // how precisely Odyssey banded us has nothing to do with how the lapse rate turns out, so
      // it must NOT ride the same draw.
      const anchor = FRONTIER_NOW + mcPert(ANCHOR_BAND.lo, 0, ANCHOR_BAND.hi);
      // Same one-wave fuel model as the chart, via the shared helper so the two cannot drift.
      arr[i] = anchor + forwardAdvance(lapse) + RESERVE_SEATS;
    }
    const sorted = Array.from(arr).sort((a, b) => a - b);
    const pct = (p) => sorted[Math.floor(p * (sorted.length - 1))];
    const frac = (thr) => { let n = 0; for (const v of arr) if (v >= thr) n++; return n / trials; };
    // Every run starts at the Aug 11 frontier (~46,000 ± 2,000). The Aug 13 pool cut roughly
    // halves the spread of the wave on top, so the window tightens from 80,000 to 64,000 —
    // otherwise the right two-thirds of the axis is empty.
    const lo = 42000, hi = 64000, bins = 52, w = (hi - lo) / bins;
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
        One model, two views of the same thing. Each line is the <strong>frontier</strong> after one wave at ~Sep 7, set by a single dial: what share of the{' '}
        <strong>{k.pendingNow.toLocaleString()}</strong> families holding an unresolved award let their four-week window lapse. Each lapse returns the full award and funds
        ~{k.seatsPerLapse} more offers. <strong>Distribution</strong> runs that model{' '}
        <strong>{trials.toLocaleString()} times</strong> and shows where it landed across all of them — <em>the lines are essentially the averages of that cloud</em>.
        Drag the dial and <strong>both</strong> update. Our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()} (we sit at ~{YOUR_POS.lo.toLocaleString()}); Tier 3 opens at {T3_START.toLocaleString()}.
      </p>

      {/* context KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Pulled Off So Far</div>
          <div className="font-bold text-tefa-navy text-lg">{k.frontierNow.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">
            {k.asOfUnofficial ? 'UNOFFICIAL' : 'CONFIRMED'} as of {fmtChartDate(Date.parse(k.asOf))} · +{k.recentAdvance.toLocaleString()} since Jul 29
          </div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-gray-200 p-3 text-center">
          <div className="text-xs text-tefa-body/50 font-medium">Still Ahead Of Us</div>
          <div className="font-bold text-tefa-gold text-lg">{k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">OFFICIAL · Odyssey, {fmtChartDate(Date.parse(k.odysseyAsOf))} · was {k.gapPrevLo.toLocaleString()}–{k.gapPrevHi.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-navy/20 p-3 text-center">
          <div className="text-xs text-tefa-navy/70 font-medium">Expected reach</div>
          <div className="font-bold text-tefa-navy text-lg">~{k.realisticTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">{k.realisticLapsePct}% lapse of {k.pendingNow.toLocaleString()} pending · {k.realisticTerminal >= YOUR_POS.lo
            ? `clears us by ~${(k.realisticTerminal - YOUR_POS.lo).toLocaleString()}`
            : `~${(YOUR_POS.lo - k.realisticTerminal).toLocaleString()} short of us`}</div>
        </div>
        <div className="rounded-lg bg-tefa-light border border-tefa-red/30 p-3 text-center">
          <div className="text-xs text-tefa-red/70 font-medium">Aggressive reach</div>
          <div className="font-bold text-tefa-red text-lg">~{k.aggressiveTerminal.toLocaleString()}</div>
          <div className="text-[10px] text-tefa-body/40">{k.aggressiveLapsePct}% lapse of {k.pendingNow.toLocaleString()} pending · clears our {YOUR_POS.lo.toLocaleString()}</div>
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
          <div className="text-[10px] text-tefa-body/40">our estimated original lottery position</div>
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
          {view === 'lines' ? 'Frontier after one wave at ~Sep 7, by lapse rate — drag the dial to reshape.' : `Where ${trials.toLocaleString()} runs landed — the lines are the averages of this.`}
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
                <Line type="monotone" dataKey="observedLine" name="Pulled off so far" stroke="#202562" strokeWidth={2.5} dot={false} legendType="none"  isAnimationActive={false} />
                <Line type="monotone" dataKey="research" name={`Pessimistic — ${k.researchLapsePct}% lapse`} stroke="#2e7d5b" strokeWidth={2} dot={false}  isAnimationActive={false} />
                <Line type="monotone" dataKey="realistic" name={`Expected — ${k.realisticLapsePct}% lapse`} stroke="#202562" strokeWidth={2.5} dot={false}  isAnimationActive={false} />
                <Line type="monotone" dataKey="aggressive" name={`Aggressive — ${k.aggressiveLapsePct}% lapse`} stroke="#aa2142" strokeWidth={2.5} dot={false}  isAnimationActive={false} />
                <Scatter dataKey="observed" name="Published data" fill="#202562" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-tefa-body/45 mt-1">
            Each line is the frontier after ONE wave at ~Sep 7, sized by how much of the {k.pendingNow.toLocaleString()}-family pending pool lets its four-week window lapse.
            The line is flat until a window actually closes — nothing moves on a day with no deadline behind it — then steps at ~Aug 26 and ~Sep 7. When a line crosses our position line, an offer has reached us.
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
            {[45000, 50000, 55000, 60000].map((t) => (
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
        <div className="font-semibold text-tefa-navy text-[13px]">How to read the dial</div>
        <p>
          There is now <strong>one</strong> dial, because the model has one unknown. Everything else is published:
          the pool is <strong>{k.pendingNow.toLocaleString()}</strong> families holding an award they have not confirmed
          ({k.awardedAug10.toLocaleString()} awarded on the Aug 10 fact sheet, less {k.fundedNow.toLocaleString()} funded in
          the Aug 13 press release), and the wave date is fixed by the four-week opt-in rule.
        </p>
        <p>
          <strong className="text-tefa-navy">That pool halved on Aug 13</strong>, from ~{k.pendingWas.toLocaleString()} to{' '}
          {k.pendingNow.toLocaleString()}, because ~{k.fundedSince.toLocaleString()} families converted from awarded to funded.
          Money that has been claimed cannot be released, so this is a straight cut to the fuel — every scenario below moved
          down with it, and the break-even went from 8.8% to {k.breakevenLapsePct}%.
        </p>
        <p>
          <strong className="text-tefa-navy">Lapse rate</strong> — of those {k.pendingNow.toLocaleString()}, what share simply
          let the four-week window expire without opting in. A lapse returns the <strong>full ${FULL_AWARD.toLocaleString()}</strong>
          (they took no action, so they cannot have chosen the $2,000 homeschool tier), which funds ~<strong>{k.seatsPerLapse}</strong>
          new awards at the ~${TEFA_BUDGET.blendedCost.toLocaleString()} blended cost. Note this is <em>lapsing</em>, not
          <em> opting out</em>: giving up money you already hold is rare (2.8% observed), while never claiming an offer you
          waited months for is common.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-tefa-body/70">
          <li><strong>expected</strong> is <span className="font-mono text-tefa-gold">{CONSERVATIVE_CHURN}%</span> — the gem&rsquo;s central figure, with D.C.&rsquo;s measured 14.3% underneath it. <strong>Not draggable.</strong></li>
          <li>Drag <strong>pessimistic</strong> down to the 8% queueing-theory floor, or <strong>aggressive</strong> up toward Milwaukee&rsquo;s 30%.</li>
          <li>Below <span className="font-mono text-tefa-gold">{k.breakevenLapsePct}%</span> the wave stops short of the far end of our gap; below <span className="font-mono text-tefa-gold">{k.breakevenLapseNearPct}%</span> it misses us entirely. The expected {CONSERVATIVE_CHURN}% sits between the two.</li>
          <li><strong>The benchmarks are on a different scale.</strong> D.C.&rsquo;s 14.3% and Milwaukee&rsquo;s 30% are shares of <em>all</em> awardees; this dial is a share of the <em>pending</em> pool, which is {RESIDUAL_PER_AGGREGATE.toFixed(1)}× smaller. Our {k.breakevenLapsePct}% break-even is only <strong>{k.breakevenAggregatePct}%</strong> of everyone awarded — far inside every published rate.</li>
        </ul>
        <p className="text-tefa-body/50">
          The three old dials (tail swept, decline rate, opt-out share) are gone. They were three ways of describing one
          underlying quantity, coupled by a shared &ldquo;favorability&rdquo; factor to stop them drifting apart &mdash; which
          was a sign they should have been one dial all along.
        </p>
      </div>

      {/* controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <div>
          <label className="block text-xs font-semibold text-tefa-body/80 mb-2">
            Lapse rate — pessimistic / <span className="text-tefa-body/50">expected (fixed)</span> / aggressive{' '}
            <span className="font-mono text-tefa-gold ml-1">{churnMin} / {churnMode} / {churnMax}%</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">pessimistic</div>
              <input type="range" min="2" max="14" value={churnMin} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMin(Math.min(+e.target.value, churnMode - 1))} />
              <div className="text-[9px] text-tefa-body/40">queueing floor 8%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-gold/80 mb-1">expected · locked</div>
              <div className="flex items-center justify-center h-[18px] font-mono text-sm font-bold text-tefa-gold">{churnMode}%</div>
              <div className="text-[9px] text-tefa-body/40">D.C. 14.3%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-tefa-body/40 mb-1">aggressive</div>
              <input type="range" min="16" max="45" value={churnMax} className="w-full accent-tefa-navy"
                onChange={(e) => setChurnMax(Math.max(+e.target.value, churnMode + 1))} />
              <div className="text-[9px] text-tefa-body/40">Milwaukee 30%</div>
            </div>
          </div>
          <p className="text-[11px] text-tefa-body/45 mt-2">
            Of the <strong>{k.pendingNow.toLocaleString()}</strong> families holding an unresolved award, what share let their
            four-week window lapse without opting in. Each lapse returns the full ${FULL_AWARD.toLocaleString()} and funds
            ~{k.seatsPerLapse} seats at the ~${TEFA_BUDGET.blendedCost.toLocaleString()} blended cost of a new award.
            <strong> This is the only unknown left in the model</strong> — the pool size is published, and the wave date is set
            by the four-week rule. Anchored on published multi-program attrition rather than on our own July/August history,
            which was a one-off deadline mop-up and is not a repeatable rate.
          </p>
        </div>

        <div className="rounded-lg bg-tefa-light border border-tefa-sky/30 p-3">
          <div className="text-xs font-bold text-tefa-navy mb-1.5">The whole model in four lines</div>
          <div className="text-[11px] text-tefa-body/70 space-y-0.5 font-mono">
            <div>{k.awardedAug10.toLocaleString()} awarded (Aug 10); {k.fundedNow.toLocaleString()} funded (Aug 13).</div>
            <div>{k.pendingNow.toLocaleString()} families hold an award they have not confirmed.</div>
            <div>If {churnMode}% let it lapse &rarr; {Math.round(k.pendingNow * churnMode / 100).toLocaleString()} lapses &times; {k.seatsPerLapse} = <strong>{Math.round(k.pendingNow * churnMode / 100 * k.seatsPerLapse).toLocaleString()}</strong> more offers.</div>
            <div>We need <strong>{k.gapToUs.toLocaleString()}&ndash;{k.gapToUsHi.toLocaleString()}</strong>.</div>
          </div>
          <p className="text-[11px] text-tefa-body/50 mt-2">
            That lands <em>inside</em> the gap — enough at the shallow end of our position estimate, short at the deep end.
            Clearing the far end takes <strong>{k.breakevenLapsePct}%</strong>, i.e. {k.breakevenLapses.toLocaleString()} of the{' '}
            {k.pendingNow.toLocaleString()}. Above D.C.&rsquo;s 14.3% — but not the same measure: those{' '}
            {k.breakevenLapses.toLocaleString()} lapses are just <strong>{k.breakevenAggregatePct}%</strong> of the{' '}
            {k.awardedAug10.toLocaleString()} awards issued, and D.C.&rsquo;s figure is an all-awardee rate.
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
        Defaults reproduce the model: lapse rate PERT({k.researchLapsePct} / {k.realisticLapsePct} / {k.aggressiveLapsePct}) on the {k.pendingNow.toLocaleString()} pending pool
        at {k.seatsPerLapse} seats per lapse, one wave at ~Sep 7, anchor ±1,000 drawn on its own axis — the median lands
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
  const [churnMin, setChurnMin] = useState(8);      // PESSIMISTIC lapse — queueing-theory floor
  const [churnMax, setChurnMax] = useState(30);     // AGGRESSIVE lapse — Milwaukee; also what Jul/Aug implied
  const [declineMin, setDeclineMin] = useState(35); // low reach: 35% of deep offerees decline
  const [declineMax, setDeclineMax] = useState(65); // high reach: 65% decline
  const { series: cascadeSeries, kpis: k } = useMemo(
    () => buildCascadeProjection({
      research: { ...RESEARCH, lapseRate: churnMin / 100 },
      realistic: { ...REALISTIC, lapseRate: CONSERVATIVE_CHURN / 100 },
      aggressive: { ...AGGRESSIVE, lapseRate: churnMax / 100 },
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
          Awards cascade down <strong>one</strong> tier-ordered waitlist. <strong>Tier 2 is now cleared</strong> — the August
          wave carried the frontier to <strong>~{k.frontierNow.toLocaleString()}</strong>, about {k.intoTier3.toLocaleString()} positions
          past the {T2_AT_LOTTERY.toLocaleString()} Tier 2 backlog. Odyssey confirmed on Aug 11 that{' '}
          <strong>{k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()}</strong> families still sit between the frontier
          and us — a management-confirmed band about our own family, down from{' '}
          {k.gapPrevLo.toLocaleString()}–{k.gapPrevHi.toLocaleString()} on Jul 29. That gap is the measured quantity here.
          Our absolute seat (~{YOUR_POS.lo.toLocaleString()}) and the frontier are <em>estimates</em> derived from it, and the
          two move together — so the conclusion holds even if both are off by thousands.
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
          <strong>Bottom line:</strong> a second wave landed in August with no deadline behind it, and we now have this
          straight from Odyssey rather than from the community: <strong>{k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()}</strong> families
          are still ahead of us, down from {k.gapPrevLo.toLocaleString()}–{k.gapPrevHi.toLocaleString()} on Jul 29. That is
          ~{k.gapClosedLo.toLocaleString()}–{k.gapClosedHi.toLocaleString()} positions cleared in thirteen days, which matches the
          Comptroller&rsquo;s &ldquo;almost {k.officialWave?.toLocaleString()} additional&rdquo; wave almost exactly — two
          independent sources agreeing on the <em>movement</em> — though not, note, on the absolute depth, which no source has
          ever published; <strong>~{k.frontierNow.toLocaleString()}</strong> remains our best estimate rather than a settled
          figure, and the answer is built so that does not matter. <strong>Then Aug 13 cut the fuel in half.</strong> The
          Comptroller&rsquo;s press release put funded students at <strong>{k.fundedNow.toLocaleString()}</strong>, up from{' '}
          {k.fundedPrev.toLocaleString()} — roughly {k.fundedSince.toLocaleString()} families claimed their awards in a
          fortnight. Claimed money cannot be released, so the pool of unconfirmed awards fell from ~{k.pendingWas.toLocaleString()} to{' '}
          <strong>{k.pendingNow.toLocaleString()}</strong>, and every scenario moved down with it: expected{' '}
          <strong>~{k.realisticTerminal.toLocaleString()}</strong> (past our estimated seat by only ~{Math.abs(k.realisticTerminal - YOUR_POS.lo).toLocaleString()}),
          aggressive <strong>~{k.aggressiveTerminal.toLocaleString()}</strong>, pessimistic <strong>~{k.researchTerminal.toLocaleString()}</strong>{' '}
          — which now <em>misses</em> by ~{Math.abs(YOUR_POS.lo - k.researchTerminal).toLocaleString()}. A voucher is still
          the way to bet, but it is a <strong>coin flip leaning our way</strong>, not the comfortable clear this page showed
          two days ago. Two things cut back the other way: {k.conversionPct}% of all awards issued are already funded, capping
          the program&rsquo;s total walk-away rate at {k.maxAggregateLapsePct}% and putting our break-even at just{' '}
          {k.breakevenAggregatePct}% of everyone awarded; and the families left in the pool are the concentrated
          non-responders, since everyone who acted has just drained out of it. Parents have FOUR WEEKS from their award date
          to opt in and confirm, so the Aug 10 batch resolves around Sep 7 — and the seats its non-responders give up are the
          fuel for the wave that would reach us. Awards are still going out, which the model does not count.
          <strong> Check the portal, then keep budgeting the full balance until the money lands.</strong>
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
          <strong>Updated Aug 13, 2026 — the gap is official, the fuel just halved.</strong> The Comptroller&rsquo;s Aug 13
          press release put funded students at {k.fundedNow.toLocaleString()} against &ldquo;more than{' '}
          {k.fundedPrev.toLocaleString()}&rdquo; a fortnight earlier, cutting the unconfirmed-award pool from{' '}
          ~{k.pendingWas.toLocaleString()} to {k.pendingNow.toLocaleString()}. Every terminal below moved down ~3,400 with it.
          The Aug 11 reading of our own position is unchanged and still governs:
          <br /><br />
          <strong>As of Aug 11, 2026 — our own GAP is OFFICIAL, and that is what this model tracks.</strong>{' '}
          Odyssey Parent Support answered a direct question the same day (ticket #727303): &ldquo;your student currently falls
          within the {k.gapToUs.toLocaleString()}-{k.gapToUsHi.toLocaleString()} range on the waitlist … only management can
          confirm ranges.&rdquo; That replaces every community estimate for the number that actually decides our outcome.
          On Jul 29 the same reading was {k.gapPrevLo.toLocaleString()}–{k.gapPrevHi.toLocaleString()}, so roughly{' '}
          <strong>{k.gapClosedLo.toLocaleString()}–{k.gapClosedHi.toLocaleString()}</strong> families cleared in thirteen days.
          The Comptroller independently posted that &ldquo;almost {k.officialWave?.toLocaleString()} additional waitlisted
          students&rdquo; were funded over the same window. Two unrelated sources — one personal, one public — landing on the
          same movement is the strongest evidence we have had all summer.
          <br /><br />
          <strong>What that email does NOT tell us — and why it does not matter.</strong> Odyssey reports only a <em>gap</em>,
          never an absolute rank, so no reading from them can pin how deep the cascade has actually run. Our{' '}
          {YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()} is an <em>inference</em> — Jul 29&rsquo;s gap added to a
          community-estimated Jul 29 frontier, then capped by our band ceiling. It could be off by ten thousand either way.
          Worth being precise here, because an earlier pass overstated it: the model&rsquo;s derived gap also came to{' '}
          {k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()}, but that agreement confirms the <em>advance</em> since
          Jul 29, not the depth — expand the arithmetic and the frontier estimate cancels out of both sides.
          <br /><br />
          <strong>Why the gap, not the frontier, is the headline number.</strong> Because the answer does not depend on the
          depth. Sweeping our true position across the entire band Odyssey gave us — anywhere from{' '}
          {ORIGINAL_BAND.lo.toLocaleString()} to {ORIGINAL_BAND.hi.toLocaleString()} — the verdict never changes: the wave is
          measured in positions and compared against a measured gap, so the high case clears at every value, the low case
          falls short at every value, and the expected case covers ~{k.realisticWave.toLocaleString()} of a{' '}
          {k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()} gap at every value. What is undecided is <em>where in
          that 1,000-wide band we sit</em>, not how deep the cascade has run. That is by construction. The
          model is anchored on the measured gap and prices fuel in seats, so the absolute depth only changes how much fuel has
          already been burned — and it errs safe, since a shallower true position means <em>more</em> fuel left, not less.
          Treat the absolute figures on this page as a scale that could shift bodily; treat the gap as the real output.
        </p>
        <div className="text-[11px] text-tefa-body/60 bg-tefa-light rounded p-3 space-y-1">
          <div><strong>The whole model, in one line.</strong> <strong>wave = pending pool &times; lapse rate &times; seats per lapse</strong>. The pool is <strong>{k.pendingNow.toLocaleString()}</strong> families holding an award they have not confirmed &mdash; published, not estimated ({k.awardedAug10.toLocaleString()} awarded on the Aug 10 fact sheet, minus {k.fundedNow.toLocaleString()} funded in the Aug 13 press release). Each family who lets their four-week window <strong>lapse</strong> returns the full ${FULL_AWARD.toLocaleString()}, which funds ~<strong>{k.seatsPerLapse}</strong> new awards at the ~${TEFA_BUDGET.blendedCost.toLocaleString()} blended cost. That leaves the lapse rate as the single unknown: <strong>pessimistic {k.researchLapsePct}%</strong> &rarr; ~{k.researchWave.toLocaleString()} more offers (frontier ~{k.researchTerminal.toLocaleString()}); <strong>expected {k.realisticLapsePct}%</strong> &rarr; ~{k.realisticWave.toLocaleString()} (~{k.realisticTerminal.toLocaleString()}); <strong>aggressive {k.aggressiveLapsePct}%</strong> &rarr; ~{k.aggressiveWave.toLocaleString()} (~{k.aggressiveTerminal.toLocaleString()}). We need {k.gapToUs.toLocaleString()}&ndash;{k.gapToUsHi.toLocaleString()}. <strong>The aggressive case clears it; the expected case lands inside it; the pessimistic case falls short.</strong></div>
          <div><strong>Aug 13 halved the pool, and that is the whole story of this revision.</strong> The Comptroller&rsquo;s release &mdash; a short one, one hard number &mdash; put funded students at <strong>{k.fundedNow.toLocaleString()}</strong>, against &ldquo;more than {k.fundedPrev.toLocaleString()}&rdquo; a fortnight earlier. About {k.fundedSince.toLocaleString()} families converted from <em>awarded</em> to <em>funded</em>, and a family that has banked its money can never release it to us. The pending pool went ~{k.pendingWas.toLocaleString()} &rarr; <strong>{k.pendingNow.toLocaleString()}</strong>, the expected terminal ~52,800 &rarr; ~{k.realisticTerminal.toLocaleString()}, and the break-even 8.8% &rarr; {k.breakevenLapsePct}%. Note the direction: on Aug 11 this model revised sharply <em>up</em>, and two days later it is revising <em>down</em>. That is a fair measure of how much weight any single reading deserves.</div>
          <div><strong>The counter-argument, and it is a real one.</strong> {k.conversionPct}% of every award TEFA has issued is already funded, which caps the program&rsquo;s cumulative walk-away rate at <strong>{k.maxAggregateLapsePct}%</strong> &mdash; TEFA is running <em>stickier</em> than D.C. and nowhere near Milwaukee. That sounds bad for us until you notice the scales differ: this model&rsquo;s dial is a share of the <em>pending pool</em>, which is {RESIDUAL_PER_AGGREGATE.toFixed(1)}&times; smaller than the awarded population the benchmarks measure. Our {k.breakevenLapsePct}% break-even is only <strong>{k.breakevenAggregatePct}%</strong> of all awardees &mdash; well inside the {k.maxAggregateLapsePct}% ceiling and far below any published rate. The pool is also purer now: the families who were going to act have just acted, leaving the non-responders concentrated, and they are deep Tier 3 offered in mid-August with school already started.</div>
          <div><strong>What the release does NOT say, and both omissions favour us.</strong> It gives no new awarded count, yet states awards are still going out (&ldquo;expected to increase as additional awards are made&rdquo;) &mdash; so the true pending pool is <em>at least</em> {k.pendingNow.toLocaleString()}, and the frontier has probably moved a little past {k.frontierNow.toLocaleString()} since the Aug 11 Odyssey reading. And the model gates itself to ONE generation of lapses; if a second award batch goes out and its non-responders lapse in turn, the expected wave grows from ~{k.realisticWave.toLocaleString()} to ~{k.realisticWaveGeometric.toLocaleString()}, clearing the far end of the gap outright. Both are upside deliberately left out. The &ldquo;more than 100,000 students remain on the waitlist&rdquo; line is a floor with no eligible-applicant count behind it in this file, so it is recorded and not used.</div>
          <div><strong>Why the rates come from other programmes, not from our own summer.</strong> Backing a lapse rate out of the July/August waves gives ~61%, and that number is worthless: Pillow&rsquo;s 18,000 were families who had <em>already</em> failed to respond for weeks, so of course they lapsed. Those waves were also a one-time deadline mop-up &mdash; Jul 15 opt-in and Jul 31 confirmation both fell just before the Aug 10 batch, and that pool went 18,000 &rarr; ~1,400. A fresh cohort will not repeat it. So the scenarios use published attrition instead: the queueing-theory floor (8%), D.C. Opportunity Scholarship (14.3%), Milwaukee Parental Choice (30%). Telling detail: the observed July/August waves imply ~30% &mdash; which lands on <em>Milwaukee, the high benchmark</em>, confirming they were running hot. Hence 30% is the aggressive case, not the expected one.</div>
          <div><strong>What would have to happen for this to miss.</strong> The wave falls short of the far end of our gap if the lapse rate comes in below <strong>{k.breakevenLapsePct}%</strong> of the pending pool &mdash; fewer than {k.breakevenLapses.toLocaleString()} of the {k.pendingNow.toLocaleString()} walking away &mdash; and misses us entirely below <strong>{k.breakevenLapseNearPct}%</strong>. The expected {k.realisticLapsePct}% dial sits between those two, which is exactly why the answer is now marginal rather than comfortable. &ldquo;The wave is too small&rdquo; is a live failure mode again, alongside &ldquo;no wave happens at all&rdquo; &mdash; a funding halt, an administrative pause, a legal challenge. Nothing in the releases points at the second; the Aug 13 release explicitly says awards are still being made.</div>
          <div><strong>Awarded &ne; funded &ne; active &mdash; three different populations.</strong> The Aug 10 fact sheet counts <strong>{k.awardedAug10.toLocaleString()} awarded</strong>; the Aug 13 press release counts <strong>{k.fundedNow.toLocaleString()} funded</strong>; the gap between them is the {k.pendingNow.toLocaleString()} this whole model runs on. The program&rsquo;s own social copy said it had &ldquo;<em>funded</em> almost {k.officialWave?.toLocaleString()}&rdquo; when the release said &ldquo;<em>awarded</em>&rdquo; &mdash; and reading it the wrong way briefly made the outlook look far worse than it is. The Aug 13 release, by contrast, is careful: it says funding was <em>delivered</em>, that these students &ldquo;count as a participant&rdquo;, and separately describes awards as the step that precedes funding &mdash; which is why 101,600 is safe to difference against 118,441. Keep the three straight.</div>
          <div className="pt-1"><strong>Scoring our own Jul 29 call — we were too pessimistic, and it is worth being clear about why.</strong> Three weeks ago this model said the likely case landed ~42,100 and put <em>P(reach us)</em> near 2%. The frontier is now ~{k.frontierNow.toLocaleString()}, past that likely case and three weeks early. The error was structural, not arithmetic: we treated Pillow's 18,000 not-opted-in as a <em>hard ceiling on all future fuel</em>, when in fact August produced departures from the <em>already-funded</em> base at a rate well above the 0.5–1.5% melt we allowed — families who took an ESA and then did not show up when school actually started. The lesson for the next refresh: a published pool count bounds <em>that pool</em>, not the total fuel, and school-start melt is a bigger, later term than a summer model wants to believe. The Facebook &ldquo;each wave unlocks another 34%&rdquo; claim we argued down on Jul 29 (it projected ~50,490) has landed closer to the truth than our central case did — its double-counting critique still stands on the arithmetic, but its <em>conclusion</em> was better calibrated than ours.</div>
          <div><strong>Watch &mdash; the two dates that matter.</strong> Awards carry a <strong>four-week</strong> opt-in window, so the wave arrives in two steps rather than as a drift &mdash; though after Aug 13 the first step is small: <strong>~Aug 26</strong>, when what is left of the Jul 29 cohort closes (at least ~{k.pendingEarly.toLocaleString()} of the pool, since at most 15,000 of the {k.pendingNow.toLocaleString()} can be the Aug 10 batch), and <strong>~Sep 7</strong>, when the Aug 10 cohort&rsquo;s closes (up to {k.pendingFresh.toLocaleString()}). The model treats these as one merged wave at Sep 7 to avoid double-counting. Odyssey confirms awards go out in batches tied to Comptroller announcements &mdash; expect a step, and expect it to land at an odd hour. It all falls <em>after</em> the Jun 30 penalty-free withdrawal deadline, so that call had to be made without any of this.</div>
          <div className="pt-1 border-t border-tefa-body/10"><strong>What changed on Aug 11, and why the odds moved so much.</strong> Three findings landed the same day and all pointed the same way. <strong>One:</strong> the pending pool does not drain, it <em>refills</em> &mdash; it was ~18,000 in July and ~18,441 in early August despite ~13,000 lapsing in between, because each wave replenishes it. The old model had it draining to ~{k.poolLeft.toLocaleString()}, understating the fuel roughly six-fold. <strong>Two:</strong> a lapse frees the <em>full</em> award, not the blended figure &mdash; a family who never responded cannot have chosen a $2,000 homeschool downgrade, so the old 1.16 seats/departure was too low for this population. <strong>Three:</strong> the fact sheet&rsquo;s tier split independently puts the frontier at ~{k.factsheetFrontier.toLocaleString()} against our ~{k.frontierNow.toLocaleString()} &mdash; the first corroboration with no community input in it. Together they turned a marginal outlook into a comfortable one &mdash; and the note added then, that a model twice too pessimistic deserves suspicion rather than relief, proved right within 48 hours. <strong>Aug 13 took most of it back:</strong> finding one was directionally right and quantitatively wrong. The pool refills, but it drains into <em>funded</em> far faster than it lapses, and the {k.fundedNow.toLocaleString()} funded count is the first hard measurement of that. Findings two and three stand unchanged.</div>
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
                { key: 'aggressive', label: `Aggressive — ${k.aggressiveLapsePct}% lapse`, color: '#aa2142', vals: k.projectionTable.aggressive },
                { key: 'conservative', label: `Expected — ${k.realisticLapsePct}% lapse`, color: '#202562', vals: k.projectionTable.conservative },
                { key: 'research', label: `Pessimistic — ${k.researchLapsePct}% lapse`, color: '#2e7d5b', vals: k.projectionTable.research },
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
            Each row is the waitlist position reached after one wave, given that share of the {k.pendingNow.toLocaleString()}-family pending pool letting its four-week window lapse.
            Tier 2 cleared at {T2_AT_LOTTERY.toLocaleString()}; our band is {BAND_LO.toLocaleString()}–{BAND_HI.toLocaleString()} and our own seat is {YOUR_POS.lo.toLocaleString()}–{YOUR_POS.hi.toLocaleString()}.
            All three share the observed track through Aug 11 ({k.frontierNow.toLocaleString()}, confirmed against our official {k.gapToUs.toLocaleString()}–{k.gapToUsHi.toLocaleString()} Odyssey band); they differ only in the size of the wave that lands by ~Sep 7.
            These are the Aug 13 figures — the same table on Aug 11 ran ~3,400 higher across the board, before the funded count halved the pool.
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
    // 5il.co/2o0ag is the 3rd–5th summer READING suggestions, not the supply list.
    // The official K–5 supply list PDF (4th grade is p.5) is the aptg.co link.
    link: { label: 'Elementary K–5 supply list (4th grade, p.5)', url: 'https://aptg.co/rSGL4x' },
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
      // 5il.co/2o0ag was labelled as the supply list but resolves to the 3rd–5th summer
      // READING suggestions. The K–5 supply list PDF (4th grade is p.5) is the aptg.co link.
      { label: 'Elementary K–5 supply list (4th grade, p.5)', url: 'https://aptg.co/rSGL4x' },
      { label: '3rd–5th summer reading suggestions', url: 'https://5il.co/2o0ag' },
      { label: 'Elementary dress code', url: 'https://aptg.co/HcLxcf' },
      // The 4th-grade list links these two by name — the organizer is bolded "please get this one".
      { label: 'Forvencer 12-pocket organizer (exact product)', url: 'https://a.co/d/1Q6xRAm' },
      { label: '12-pack colored file folders (exact product)', url: 'https://a.co/d/06AoTcyK' },
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
      { text: 'Secondary supply list purchased (Aug 7) — wipes, Kleenex, ESV Bible, pencils, pens, 1" binder, college-ruled paper. TI-84 not bought; using the one we already own', done: true, link: 'Supply list', url: 'https://aptg.co/tCJ7SC' },
      { text: 'Summer reading (English 9 Honors): The 7 Habits of Highly Effective Teens (Covey), The Faithful Spy (Hendrix), The Hiding Place (ten Boom) + response questions', done: true, link: 'Reading list', url: 'https://aptg.co/y0zrrR' },
    ],
  },
  {
    group: 'Dorothy · 7th Grade',
    tasks: [
      { text: 'PE uniform — STILL OPEN. Athletic Works 9" shorts bought at Walmart Aug 7, which clears the 5" min inseam, but the PE uniform is Global Schoolwear-only so those likely do not substitute. Ask Janey whether the GS shirt is required too, since the dress code allows a green/white/black/gray spirit shirt instead', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Skirts/skorts ordered — white plaid or khaki, no shorter than 3" above the knee (sold out at the resale sale)', done: false, owner: 'Cody', link: 'Global Schoolwear', url: 'https://www.globalschoolwear.com/' },
      { text: 'Resale BOGO cardigan + zip-up verified as TH hunter/black WITH the NBCA logo', done: false, owner: 'Cody' },
      { text: 'Athletic paperwork COMPLETE — physical received, no transfer forms needed (Janey, Jul 21)', done: true, link: 'Rank One', url: 'https://nbca.store.rankone.com/' },
      { text: 'IXL Summer Boost — NOT REQUIRED for new students (Mrs. Scobee, Jul 20)', done: true },
      { text: 'Volleyball parent meeting Aug 3 · Cross Country parent meeting Aug 4', done: false, owner: 'Cody', link: 'Calendar', url: 'https://www.nbcatx.org/page/calendar-events' },
      { text: 'Secondary supply list purchased (Aug 7) — wipes, Kleenex, pencils, pens, 1" binder, wide-ruled paper. ESV STUDY Bible already owned; TI-84 is optional in 7th, required in 8th', done: true, link: 'Supply list', url: 'https://aptg.co/tCJ7SC' },
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
      // Status text from the Supplies tab work; URL kept from this branch — 5il.co/2o0ag
      // is the 3rd–5th summer READING list, not the supply list (see the Sebastian links above).
      { text: '4th-grade school supplies — mostly bought Aug 7–8; what is left is on the Supplies tab', done: false, owner: 'Cody', link: 'Supply list', url: 'https://aptg.co/rSGL4x' },
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
