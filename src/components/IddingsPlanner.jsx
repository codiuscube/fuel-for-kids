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

const TODAY = '2026-08-27';

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
// AWARDED — Aug 27, 2026. The question this tab existed to answer is CLOSED.
// All three kids received TEFA awards in the FIRST post-expiry batch, one day inside
// the near edge of the model's Aug 28–Sep 3 batch-1 estimate. The mechanism called it
// too: the Jul 29-dated awards' four-week windows expired Aug 26, and the batch cut the
// next day.
//
// What this resolves, and what it does NOT:
//   ✅ RESOLVED — does an offer reach us in Year 1. Yes, out of the AUGUST window
//      expiries, not the September ones. The forward model below is kept (it is the
//      record of the call) and re-pointed at the question the community still has.
//   ⚠ NOT RESOLVED — what we actually OWE. An award is an offer, not money, and NBCA
//      has said aid would be reduced if TEFA landed. See NBCA_AID_QUESTION: the
//      $31,422 is GROSS fuel, not savings, and the two readings of Nanette's "10% of
//      tuition" differ by ~$13,500.
//
// ⚠ THE BINDING DATE IS SEP 15, NOT THE FOUR-WEEK WINDOW. The award carries a four-week
// opt-in window (~Sep 24, Aug 13 release), but the Jun 4 funding-timelines release
// prorates anyone confirming after Sep 15 to 75% of the second installment. Sep 15
// governs, and it is 19 days from the award.
// ---------------------------------------------------------------------------
const AWARD = {
  received: '2026-08-27',
  students: STUDENTS.length,        // all three — Cassius, Dorothy, Sebastian
  perStudent: 10474,                // asserted equal to FULL_AWARD below
  optInWindowEnds: '2026-09-24',    // four weeks from award
  prorationCliff: '2026-09-15',     // Jun 4 release — the date that actually binds
  batch: 1,                         // the Aug 26 expiry batch, est. Aug 28–Sep 3
};
const AWARD_TOTAL = AWARD.students * AWARD.perStudent;   // $31,422 gross

// ---------------------------------------------------------------------------
// ⚠ THE OPEN MONEY QUESTION — what the award is actually WORTH to us. This, not the
// waitlist, is now the largest unresolved number in the file.
//
// Nanette (NBCA) said on the Jun 26 call that if TEFA came through, aid and
// scholarships would be reduced so we pay "10% of tuition". That phrase was never
// disambiguated: the Jun 28 email (`nanette-aid-commitment-tefa-scenario.md`) laid out
// both readings side by side and NO ANSWER WAS EVER RECORDED. The award makes it live.
//
//   GROSS reading — we pay 10% of GROSS tuition ($4,802.50) and TEFA covers most of the
//                   rest. We save ~$13,504 against today's net. NBCA's own support drops
//                   from $29,718.50 to ~$11,800.50.
//   NET reading   — aid is clawed back until we pay roughly today's NET ($18,306.50),
//                   i.e. the award lands on the SCHOOL's side of the ledger, not ours.
//                   We save ~$0.
//
// ⚠ THE NET READING IS ARITHMETICALLY IMPOSSIBLE AT THE FULL AWARD, and that is the
// strongest thing we have to say to Nanette. Our $18,306.50 plus the $31,422 award is
// $49,728.50 against $48,025 of GROSS tuition — the school would collect $1,703.50 MORE
// than full sticker price for three kids while still nominally granting aid. Whatever
// "10% of tuition" meant, it cannot mean that. The real question is where between the
// two readings NBCA intends to land.
//
// NOTHING on the money tab may be presented as savings until Nanette answers IN WRITING.
// ---------------------------------------------------------------------------
const GROSS_TUITION = STUDENTS.reduce((a, s) => a + s.tuition, 0);          // $48,025
const NET_TODAY = PENALTY_BASE;                                            // $18,306.50
const NBCA_SUPPORT_TODAY = GROSS_TUITION - NET_TODAY;                      // $29,718.50
const NBCA_AID_QUESTION = {
  asked: '2026-06-28',
  answered: false,
  grossReading: GROSS_TUITION * 0.1,                                       // $4,802.50 we pay
  netReading: NET_TODAY,                                                   // $18,306.50 we pay
  // Support NBCA would still have to grant under each reading, after the award.
  schoolGivesUnderGross: GROSS_TUITION - GROSS_TUITION * 0.1 - AWARD_TOTAL, // ~$11,800.50
  overCollection: NET_TODAY + AWARD_TOTAL - GROSS_TUITION,                 // $1,703.50 — see ⚠
};
const NBCA_AID_SPREAD = NBCA_AID_QUESTION.netReading - NBCA_AID_QUESTION.grossReading; // ~$13,504

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
// PLANNING ASSUMPTION (family decision, Aug 20): we work from the DEEP END — assume we sit
// at ~49,999 (gap ~4,000). ~49,000 (gap ~3,001) is the lucky case, used only as labelled
// upside, never as the base case. Every verdict on the TEFA tab anchors on gapHi.
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
  //
  // Aug 27: THE RESOLVING BATCH. All three of our kids awarded, and Brad Fleury in the same
  // cut (original band 50,001–100,000, gap 4,000–5,000 on his Aug 12 email). Recorded as a
  // LOWER BOUND — the only point in this series that is one. A batch tells you who it
  // REACHED, never where it stopped, and nobody in the Aug 27 threads reported being passed
  // over, so there is no upper anchor. The frontier is AT LEAST 46,000 + Brad's 5,000.
  //
  // THE ANCHOR-INDEPENDENT STATEMENT, which is the one to quote anywhere: BATCH 1 CLOSED A
  // GAP OF AT LEAST 5,000 POSITIONS IN A SINGLE CUT. That survives every dispute about
  // absolute depth (see the ⚠ on YOUR_POS), because both inputs are gaps Odyssey measured
  // directly rather than positions anyone inferred.
  //
  // ⚠ THIS FALSIFIES THE CLOSED-POOL ARITHMETIC — see BATCH1_OBSERVED below for the working.
  // Freeing 5,000 positions in batch 1 needs ~70% of the 8,503-award POOL to lapse in the
  // first 6 of 13 spread days: above the `aggressive` 45% dial, above Milwaukee's 30%, and
  // ~5× the program-wide rate. Even an impossible 100% lapse caps batch 1 at 6,634. So the
  // pool was BIGGER than AWARDED_AUG10 − REVOKED − FUNDED_AUG20 implied. That is precisely
  // the refill mechanism this file documented in July ("⚠ THE POOL DOES NOT DRAIN — it
  // REFILLS") and the Aug 20 pass overrode: awards kept being issued after the Aug 10 fact
  // sheet, which the Aug 13 release states verbatim ("expected to increase as additional
  // awards are made") and the model declined to quantify. That decision, not the lapse dial,
  // is what was wrong — and raising the dial to fit would assert behaviour nobody has
  // measured, so the forward number is re-anchored on the observation instead.
  { date: '2026-08-27', frontier: 51000, lowerBound: true, resolving: true },
];
// The pre-award anchor, kept as a named constant because the historical consistency guards
// below are all statements about the Aug 11 reading and must not drift onto the new point.
const FRONTIER_AT_AUG11 = 46000;

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
if (FRONTIER_AT_AUG11 < AUG11_TRIANGULATION.lo || FRONTIER_AT_AUG11 > AUG11_TRIANGULATION.hi) {
  console.warn(
    `[TEFA] Aug 11 frontier (${FRONTIER_AT_AUG11.toLocaleString()}) is outside the band implied by ` +
    `the ${ODYSSEY_READING.asOf} Odyssey reading (${AUG11_TRIANGULATION.lo.toLocaleString()}–` +
    `${AUG11_TRIANGULATION.hi.toLocaleString()}). One of YOUR_POS, ODYSSEY_READING, or the Aug 11 ` +
    `T2_OBSERVATIONS entry is out of date.`
  );
}
// Third, INDEPENDENT check: the Aug 10 fact sheet's tier split implies a cascade depth with no
// community input in it at all. Warn if the model's frontier drifts far from it.
if (Math.abs(FRONTIER_AT_AUG11 - FRONTIER_FROM_FACTSHEET) > 2500) {
  console.warn(
    `[TEFA] Aug 11 frontier (${FRONTIER_AT_AUG11.toLocaleString()}) disagrees with the Aug 10 fact-sheet ` +
    `derivation (${FRONTIER_FROM_FACTSHEET.toLocaleString()}) by more than 2,500. The fact sheet ` +
    `is the only frontier evidence with no community input — reconcile before trusting the model.`
  );
}
// Only meaningful while we were still waiting: once awarded, our own gap stops being the
// question and a stale Odyssey reading costs nothing.
if (!AWARD.received &&
    Date.parse(ODYSSEY_READING.asOf) < Date.parse(T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1].date)) {
  console.warn(
    `[TEFA] Odyssey reading (${ODYSSEY_READING.asOf}) is older than the newest frontier ` +
    `observation (${T2_OBSERVATIONS[T2_OBSERVATIONS.length - 1].date}) — refresh it.`
  );
}
// The award amount must agree with the model's ESA figure, or the money tab and the fuel
// model are describing different programs.
if (AWARD.perStudent !== FULL_AWARD) {
  console.warn(
    `[TEFA] AWARD.perStudent (${AWARD.perStudent}) !== FULL_AWARD (${FULL_AWARD}).`
  );
}

// ---------------------------------------------------------------------------
// THE FORWARD MODEL — Aug 20 revision. One question now: does an offer reach us out of
// the AUGUST window expiries or the SEPTEMBER ones — or not at all this year? Everything
// that doesn't feed that question has been removed (the pre-Aug-11 three-lever model, the
// acceptance-rate false-alarm postmortem, the Monte Carlo, the per-band outlook table —
// see git history if the reasoning is ever needed again).
//
// AUG 20 2026 — Comptroller social deck ("More than 109,000 participating students"):
//   • FUNDED 109,000+, up from 101,600 on Aug 13 — another ~7,400 claimed in a week.
//   • AWARDED: the deck says "117,000+" where the Aug 10 fact sheet said 118,441 exactly.
//     BY FAMILY DECISION (Aug 20) we read that as a REAL decline: ~940 awards revoked
//     (double-enrolled kids removed as public school opened — the Jun 4 release's removal
//     rule binding), money already re-cascading. This is the assumption-heavy branch of the
//     "117,000+" ambiguity — the deck's round-down convention (274,038 → "274,000+")
//     supports it, but promotional copy is not an award snapshot.
//     FALSIFIER: any official awarded count ≥ 118,000 kills it — then subtract REVOKED_SEATS
//     from every scenario and the break-evens revert to ~23–31%.
// ---------------------------------------------------------------------------
const FUNDED_AUG20 = 109000;                       // floor — "109,000+"
const AWARDED_ASSUMED = AWARDED_AUG10;             // 118,441 awarded EVER (Aug 10 fact sheet)
const REVOKED_AWARDS = 938;                        // ~118,441 → ~117,500 (deck band centre)
const REVOKED_SEATS = 1280;                        // 938 × 1.364 — already re-cascading, rides in batch 1
// The pool: unconfirmed awards still holding a live window — awarded ever, less revoked,
// less funded. Essentially ALL Tier 3 (Tier 1/2 ran hard deadlines June–August; only
// exemption cases remain there).
const POOL = AWARDED_ASSUMED - REVOKED_AWARDS - FUNDED_AUG20;   // ~8,503

// WHEN the pool resolves — the spread, and why the line is a RAMP, not two spikes.
// The ~15,000 Tier 3 awards were ANNOUNCED Aug 10 but not all DATED Aug 10: funded rose
// 85,000 → 101,600 between late July and Aug 13, and funding needs opt-in + school
// confirmation — impossible for an award only days old. So issuance ran continuously
// ~Jul 29 → Aug 10 and was announced in a batch. Each award carries a FOUR-WEEK window
// (Aug 13 release, verbatim), so windows expire continuously ~Aug 26 → Sep 7, roughly
// uniformly. Odyssey processes in bursts (~2 days/week), so freed money lands as offers a
// few days later still — the ramp runs to ~Sep 10.
const EXPIRY_START = '2026-08-26';   // the Jul 29-dated tail expires
const EXPIRY_END   = '2026-09-07';   // the Aug 10-dated awards expire
// ⚠ EXPIRY IS NOT DELIVERY. Lapsed money accrues continuously across the band above, but the
// waitlist only MOVES when the Comptroller cuts a batch — Odyssey stated it directly (Aug 11
// support email): awards go out in BATCHES tied to Comptroller announcements, no fixed
// schedule. Every observed advance this summer arrived that way (Jun 10, Jun 23, Jul 8,
// Aug 10). So the forward line is FLAT with two steps, not a ramp:
//   BATCH 1 — the revoked-award money (already loose) plus the early expiries. The
//             announcement cadence has run every 1–2 weeks all summer (Jun 10, Jun 23,
//             Jul 8, Aug 10, Aug 13, Aug 20), putting the next beat at ~Aug 28–Sep 3 —
//             charted at its centre, Aug 31.
//   BATCH 2 — processes the Sep 7 tail. The Comptroller has every reason to cut it before
//             the Sep 15 proration cliff so recipients can confirm in time → est. ~Sep 11.
// Both dates are ESTIMATES ± a few days; the batch COUNT (two-ish) is the solid part.
const BATCH1 = '2026-08-31';
const BATCH2 = '2026-09-11';
// Share of the pool's fuel accrued by ~Aug 31 and therefore riding in BATCH 1: deadlines
// Aug 26–31 are 6 of the 13 spread days. Two things this is NOT: (1) not a lapse count — of
// the deadlines that pass, only the lapse-dial share frees money (batch-1 seats = pool ×
// this × dial × 1.364); (2) not a measurement — uniform spread is assumed, and the residual
// pool likely skews late-dated (earlier-dated families had the most time to act and mostly
// did), so the true batch-1 share is probably BELOW this. Any pre-Jul-29-dated stragglers
// cut the other way (deadlines already passed → extra batch-1 fuel).
const BATCH1_SHARE = 6 / 13;

// ---------------------------------------------------------------------------
// BATCH 2 — RE-ANCHORED ON THE OBSERVATION (Aug 27 revision). The lapse dials below are
// retired as the BASIS for the forward number and kept only as the record of the call.
// Batch 1 outran the central dial by ~60%, and the pool arithmetic those dials multiply is
// falsified (see the Aug 27 observation). Estimating batch 2 off the dials would repeat the
// same error in the same direction; estimating it off the measured batch 1 does not.
//
// The one structural assumption kept — because it is a claim about the CALENDAR, not about
// behaviour — is the uniform expiry spread: four-week windows expire roughly evenly across
// Aug 26 → Sep 7, so batch 1 processed 6 of the 13 spread days and batch 2 processes the
// remaining 7.
//
//   batch-2 seats ≈ (observed batch-1 seats − revoked-money baseline) × 7/6
//
// The revoked-award money is netted out first because it needed no window to come loose: it
// rode in batch 1 as a one-off and does not recur.
//
// TWO ROUTES, ONE ANSWER — which is the reason to state a number at all. Keeping the closed
// pool and solving for the lapse rate that FITS batch 1 (~70%) yields the same batch-2
// figure, because both routes reduce to "the remaining 7/13 of whatever batch 1's lapse
// component actually was". The estimate is therefore robust to which explanation of the
// overshoot turns out to be right.
//
// ⚠ IT IS A FLOOR, NOT A CENTRAL CASE, for two compounding reasons. Batch 1 is itself a lower
// bound (nobody reported being passed over), so everything scaled off it inherits that. And
// if awards did keep flowing after Aug 10 — the explanation this file now favours — the pool
// refills again and a THIRD batch in late September is live, which the two-batch frame had
// ruled out. Both point the same way: batch 2 should be at least this big.
// ---------------------------------------------------------------------------
const BATCH1_OBSERVED = FRONTIER_NOW - FRONTIER_AT_AUG11;         // ≥5,000 positions closed
const BATCH1_LAPSE_COMPONENT = BATCH1_OBSERVED - REVOKED_SEATS;   // ≥3,720 from expiries
const BATCH2_EXPIRY_RATIO = (13 - 6) / 6;                         // remaining ÷ elapsed spread days
const BATCH2_FLOOR = Math.round(BATCH1_LAPSE_COMPONENT * BATCH2_EXPIRY_RATIO);  // ≥~4,340
const TERMINAL_FLOOR = FRONTIER_NOW + BATCH2_FLOOR;               // ≥~55,340
// The lapse rate batch 1 implies IF the closed pool were right — the falsification receipt.
// Not a dial: no benchmark in this file, or in the literature it cites, supports it.
const IMPLIED_BATCH1_LAPSE = BATCH1_LAPSE_COMPONENT / (POOL * BATCH1_SHARE * SEATS_PER_LAPSE);
// What batch 1 could have delivered at a literally impossible 100% lapse of the closed pool.
// Observed sits under it, so the pool is not merely mis-sized by a rounding error — but the
// rate required to get there is the part that does not survive contact with any benchmark.
const CLOSED_POOL_BATCH1_CEILING = Math.round(REVOKED_SEATS + POOL * BATCH1_SHARE * SEATS_PER_LAPSE);

// ---------------------------------------------------------------------------
// SCENARIOS — component framing: revoked (baseline) + lapsed + opted-out = seats freed.
//   REVOKED_SEATS  1,280 baseline in EVERY scenario (the assumed ~940 revocations above),
//                  riding in batch 1 — that money needs no window to free.
//   lapsePct       share of the pool that lets the four-week window expire. THE dial: net
//                  of the revocation credit the break-even is ~15–24% (near/far end of the
//                  measured gap).
//   extraSeats     opt-outs at the observed trickle plus audit removals BEYOND the ~940
//                  already credited — small, flagged unobserved, lands with batch 2.
// ---------------------------------------------------------------------------
const SCENARIOS = [
  // Dials set 25/35/45 by family decision (Aug 20), reasoning from the lag/vintage model:
  // funding trails opt-in by ~2–4 weeks, so today's funded count is July-vintage — the July
  // cohort is done deciding, and whatever July tail is still pending is dead weight, while
  // the residual is otherwise concentrated non-responders. ⚠ Honest caveat, kept on purpose:
  // measured PROGRAM-WIDE behaviour (86%+ of all awards claimed) would argue a floor nearer
  // 15%, and below ~23% the wave misses entirely — the old 15% row showed exactly that in
  // red. Raising the floor to 25% is a judgment that the vintage argument is at least partly
  // right, not a measurement. Batch 1 (~Aug 28-Sep 3) will size the lapse rate before batch 2 lands
  // — that is the check on this choice.
  { key: 'cautious', label: 'Cautious', lapsePct: 25, extraSeats: 0,
    basis: 'The vintage argument only partly holds: the residual is somewhat stickier than the average cohort, landing just above the 23% near-end break-even. Credits nothing beyond lapses. (Below ~23% — e.g. the residual behaving like the program-wide average — the wave misses entirely; batch 1\u2019s size will tell us.)' },
  { key: 'central', label: 'Central', lapsePct: 35, extraSeats: 150,
    basis: 'Residual pool behaves like a NON-RESPONDER pool: everyone who was going to act has acted or sits in the funding pipeline (101,600 \u2192 109,000 was July-vintage pipeline clearing), leaving deep Tier 3 offered after school started. Milwaukee ran 30% aggregate. Opt-outs continue at the observed trickle (~150 seats).' },
  { key: 'aggressive', label: 'Aggressive', lapsePct: 45, extraSeats: 500,
    basis: 'Deep-tail read \u2014 nearly half of late deep-Tier-3 offers never get claimed, and the double-enrollment audit bites as public school opens (~500 seats, mechanism confirmed / magnitude unobserved).' },
];
// Seats a scenario frees. Batch 1 = revoked money + the early-expiry slice of lapses;
// batch 2 = the remaining lapses + the extras.
const lapseSeatsOf = (s) => Math.round(POOL * (s.lapsePct / 100) * SEATS_PER_LAPSE);
const seatsOf = (s) => lapseSeatsOf(s) + REVOKED_SEATS + s.extraSeats;
const batch1SeatsOf = (s) => Math.round(lapseSeatsOf(s) * BATCH1_SHARE) + REVOKED_SEATS;
// Lapses needed for the wave to travel a given number of positions, NET of the revocation
// credit → break-even pool shares.
const lapsesFor = (positions) => (positions * TEFA_BUDGET.blendedCost) / FULL_AWARD;
const netLapsesFor = (positions) => Math.max(0, lapsesFor(positions) - REVOKED_AWARDS);
const BREAKEVEN_NEAR = netLapsesFor(CURRENT_GAP.lo) / POOL;   // ~14.8% — reaches us at the shallow end
const BREAKEVEN_FAR = netLapsesFor(CURRENT_GAP.hi) / POOL;    // ~23.5% — clears the far end of the gap

// Chart window: lottery through the Sep 15 proration deadline.
const FRONTIER_WINDOW = { chartStart: '2026-05-04', today: AWARD.received, end: '2026-09-15' };

// ---------------------------------------------------------------------------
// Projection: observed frontier through Aug 11, then anchor + seats × ramp(t) per scenario.
// The ramp is linear Aug 26 → Sep 10 (uniform window expiries plus processing lag), flat on
// either side — nothing can move before the first window closes.
// ---------------------------------------------------------------------------
function buildCascadeProjection() {
  const DAY = 86_400_000;
  const t0 = Date.parse(FRONTIER_WINDOW.chartStart);
  const dayOf = (d) => Math.round((Date.parse(d) - t0) / DAY);

  const obsF = T2_OBSERVATIONS.map((o) => ({ t: dayOf(o.date), f: frontierOf(o) }));
  const last = obsF[obsF.length - 1];

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

  // ONE step now, not two. Batch 1 is no longer projected — it is the Aug 27 observation the
  // line already ends on. What remains forward is batch 2, and it is drawn as a FLOOR rather
  // than a scenario fan: the three lapse dials are falsified (see BATCH1_OBSERVED) and
  // charting them would show three wrong answers instead of one honest bound.
  const b2 = dayOf(BATCH2);

  const series = [];
  const tEnd = dayOf(FRONTIER_WINDOW.end);
  for (let t = obsF[0].t; t <= tEnd; t++) {
    const row = { ts: t0 + t * DAY };
    if (t <= last.t) row.observedLine = Math.round(interp(obsF, t));
    const hit = obsF.find((o) => o.t === t);
    if (hit) row.observed = hit.f;
    if (t >= last.t) row.floorLine = t >= b2 ? TERMINAL_FLOOR : last.f;
    series.push(row);
  }

  const kpis = {
    asOf: FRONTIER_WINDOW.today,
    frontierNow: FRONTIER_NOW,
    // Batch 1 as MEASURED, and batch 2 re-anchored on it. Both are floors.
    frontierAtAug11: FRONTIER_AT_AUG11,
    batch1Observed: BATCH1_OBSERVED,
    batch1LapseComponent: BATCH1_LAPSE_COMPONENT,
    batch1Ceiling: CLOSED_POOL_BATCH1_CEILING,
    impliedLapsePct: Math.round(IMPLIED_BATCH1_LAPSE * 1000) / 10,
    batch2Floor: BATCH2_FLOOR,
    terminalFloor: TERMINAL_FLOOR,
    awardDate: AWARD.received,
    awardTotal: AWARD_TOTAL,
    gapLo: CURRENT_GAP.lo,
    gapHi: CURRENT_GAP.hi,
    gapAsOf: ODYSSEY_READING.asOf,
    awarded: AWARDED_ASSUMED,
    fundedNow: FUNDED_AUG20,
    pool: POOL,
    batch1SharePct: Math.round(BATCH1_SHARE * 100),
    batch1Date: BATCH1,
    batch2Date: BATCH2,
    breakevenNearPct: Math.round(BREAKEVEN_NEAR * 1000) / 10,
    breakevenFarPct: Math.round(BREAKEVEN_FAR * 1000) / 10,
    revokedAwards: REVOKED_AWARDS,
    revokedSeats: REVOKED_SEATS,
    lapsesNeededNear: Math.round(netLapsesFor(CURRENT_GAP.lo)),
    lapsesNeededFar: Math.round(netLapsesFor(CURRENT_GAP.hi)),
    scenarios: SCENARIOS.map((s) => ({
      ...s,
      lapses: Math.round(POOL * (s.lapsePct / 100)),
      lapseSeats: lapseSeatsOf(s),
      seats: seatsOf(s),
      batch1Seats: batch1SeatsOf(s),
      terminal: FRONTIER_NOW + seatsOf(s),
    })),
  };
  return { series, kpis };
}

const DEFAULT_KPIS = buildCascadeProjection().kpis;


const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtChartDate = (ts) => {
  if (ts == null) return '—';
  const d = new Date(ts);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
// Aug 26 / Sep 7 are ticks rather than floating labels — they are dates, they belong on the
// axis. No Aug 31 (marks nothing) and no Sep 15: Sep 15 sits 8 days from Sep 7, close enough
// that Recharts silently drops the colliding tick — and the one it drops is Sep 7, the date
// that matters. The axis still RUNS to Sep 15; only its label is gone.
const FRONTIER_TICKS = ['2026-05-04', '2026-06-01', '2026-07-01', '2026-07-29', '2026-08-11', AWARD.received, BATCH2].map(Date.parse);

// Plain-language tooltip for the frontier chart. Whitelisting by dataKey also
// drops the raw `ts` the Scatter series would otherwise inject.
const FRONTIER_SERIES = {
  observedLine: 'Pulled off the waitlist so far',
  floorLine: 'Batch 2 floor — at least this deep',
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
  { date: 'Aug 27', iso: '2026-08-27', title: 'AWARDED — all three kids. The waitlist question is closed.', kind: 'do',
    detail: 'The first batch after the four-week windows began expiring landed on Aug 27 \u2014 one day after the Aug 26 expiries and one day inside the model\u2019s Aug 28\u2013Sep 3 batch-1 estimate. Cassius, Dorothy and Sebastian all awarded: $31,422 gross. Corroborated in the same cut by Brad Fleury (original band 50,001\u2013100,000, gap 4,000\u20135,000 on his Aug 12 email), which is what makes the batch measurable: it closed AT LEAST 5,000 positions in one cut, against a central batch-1 estimate of ~3,150. ACTION, and it is the only time-critical item on this page: opt in, select NBCA, and get enrollment confirmed before Sep 15 \u2014 not the Sep 24 window end. Separately, get Nanette\u2019s answer on the \u201c10% of tuition\u201d aid reduction in writing; ~$13,500 of the award\u2019s value to us turns on it.' },
  { date: 'Aug 26 – Sep 7', iso: '2026-08-26', title: 'TEFA — the pool\u2019s four-week windows expire, continuously', kind: 'info',
    detail: 'The ~9,441 unconfirmed awards (118,441 awarded \u2212 109,000 funded, Aug 20) were issued continuously from late July through Aug 10, so their four-week opt-in windows expire continuously from ~Aug 26 through ~Sep 7 \u2014 so fuel accrues as a ramp. But the waitlist itself moves in Comptroller BATCHES (Odyssey, Aug 11 email) \u2014 expect ~two more, est. ~Aug 28\u2013Sep 3 and ~Sep 11. Every window that lapses returns the full $10,474 and funds ~1.36 new offers. Watch email AND text, including spam \u2014 awards land at odd hours.' },
  { date: 'Sep 8–14', iso: '2026-09-08', title: 'TEFA — batch 2 (no longer our decision point)', kind: 'info',
    detail: 'The Sep 7 expiries deliver as a second batch, est. ~Sep 11, plausibly cut just before the proration cliff. This no longer decides anything for us \u2014 batch 1 did that on Aug 27 \u2014 but it is what the families still waiting are asking about. Estimate, scaled off the MEASURED size of batch 1 rather than the lapse dials the batch falsified: at least ~4,340 further positions, taking the line to ~55,000+. Two reasons to read that as a floor: batch 1 is itself a lower bound (nobody reported being passed over, so there is no upper anchor), and if awards kept issuing after Aug 10 the pool refills and a third batch in late September is live.' },
  { date: 'Sep 15', iso: '2026-09-15', title: 'TEFA — proration cliff: confirm same-day or lose 25%', kind: 'do',
    detail: 'Waitlist families must confirm enrollment by Sep 15 to keep the full award (Jun 4 funding-timelines release); after that the second installment drops to 75%, and after Jan 15 the final drops to 50%. An offer arriving in the decisive week must be acted on immediately \u2014 have the school selection ready in advance.' },
  { date: 'Oct 1', iso: '2026-10-01', title: 'TEFA 2nd installment (if funded)', kind: 'info',
    detail: 'Now live: the offer reached us on Aug 27. The second installment pays in full ONLY if enrollment was confirmed by Sep 15 \u2014 after that it prorates to 75% (Jun 4 release). Still not money to spend before it lands, and how much of it we actually keep depends on the unresolved NBCA aid reduction.' },
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
          without knowing what August would bring. <strong>It came through on Aug 27</strong> (see below), but every
          TEFA date landed <em>after</em> June 30, so the choice was always whether to commit to NBCA and pay
          tuition out of pocket without knowing. Kept here as the record of a call made on the information
          available at the time — and it was the right one.
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

      {/* TEFA outlook — resolved Aug 27, mirrored from the TEFA tab */}
      <section className="bg-tefa-green/[0.06] rounded-xl shadow-md border-2 border-tefa-green/40 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <CheckCircle size={20} className="text-tefa-green" /> TEFA: awarded Aug 27 — now confirm by Sep 15
        </h2>
        <p className="text-sm text-tefa-body/85 mb-3 font-semibold">
          All three kids were awarded in the first batch after the four-week windows began expiring — {usd(k.awardTotal)} gross.
          Our Aug 11 gap was {k.gapLo.toLocaleString()}–{k.gapHi.toLocaleString()}; the batch closed at least{' '}
          {k.batch1Observed.toLocaleString()} positions in a single cut.
        </p>
        <p className="text-sm text-tefa-body/80 mb-3">
          <strong>The one time-critical thing.</strong> An award is an offer, not money. The four-week opt-in window runs to
          ~Sep 24, but <strong>Sep 15 is the date that binds</strong>: confirm after it and the second installment drops to 75%
          (Jun 4 release), and after Jan 15 the final drops to 50%. Opt in, select NBCA, get enrollment confirmed — well inside it.
        </p>
        <p className="text-sm text-tefa-body/80 mb-3">
          <strong>What we do not yet know is what it is worth.</strong> Nanette said aid would be reduced so we pay &ldquo;10% of
          tuition&rdquo;, and that was never disambiguated — {usd2(NBCA_AID_QUESTION.grossReading)} out of pocket under one reading,
          today&rsquo;s {usd2(NBCA_AID_QUESTION.netReading)} under the other, ~{usd(NBCA_AID_SPREAD)} apart. Until she answers in
          writing, <strong>keep budgeting the full balance</strong>.
        </p>
        <p className="text-sm text-tefa-body/80">
          For everyone still waiting: batch 2 (~Sep 11) should carry <strong>at least {k.batch2Floor.toLocaleString()} more
          positions</strong>, scaled off the size of batch 1 rather than off the old lapse dials.
        </p>
        <button
          onClick={() => setTab('tefa')}
          className="mt-3 text-sm font-bold text-amber-800 underline decoration-amber-800/40 hover:text-tefa-navy"
        >
          See what batch 1 measured, the chart, and what to do →
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
      {/* TEFA landed — and deliberately does NOT appear in the balance below yet. */}
      <section className="bg-amber-50 rounded-xl shadow-md border border-amber-300 p-6">
        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-2">
          <AlertCircle size={20} /> TEFA awarded Aug 27 — why the balance below has not moved
        </h2>
        <p className="text-sm text-amber-900/90 mb-3">
          All three kids were awarded {usd(AWARD_TOTAL)} gross. None of it is netted off the balance below, on purpose:
          NBCA said aid would be reduced if TEFA landed, and <strong>how much we actually save is unresolved</strong>.
          Subtracting the award now would show a number we have no basis for.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
          <div className="rounded-lg border border-amber-300 bg-white/60 p-3">
            <div className="font-bold text-tefa-navy mb-1">&ldquo;10% of gross&rdquo; reading</div>
            <div className="font-mono font-bold text-tefa-green text-base">{usd2(NBCA_AID_QUESTION.grossReading)}</div>
            <p className="text-amber-900/70 text-xs mt-1">
              We pay 10% of the {usd(GROSS_TUITION)} sticker price; TEFA covers most of the rest and NBCA still grants
              ~{usd2(NBCA_AID_QUESTION.schoolGivesUnderGross)}. Saves ~{usd(NBCA_AID_SPREAD)} against today.
            </p>
          </div>
          <div className="rounded-lg border border-amber-300 bg-white/60 p-3">
            <div className="font-bold text-tefa-navy mb-1">&ldquo;back to today&rsquo;s net&rdquo; reading</div>
            <div className="font-mono font-bold text-tefa-red text-base">{usd2(NBCA_AID_QUESTION.netReading)}</div>
            <p className="text-amber-900/70 text-xs mt-1">
              Aid is clawed back until we owe what we owe now. We save nothing and the award lands on the school&rsquo;s
              side of the ledger.
            </p>
          </div>
        </div>
        <p className="text-sm text-amber-900/90">
          <strong>The argument to make.</strong> The second reading cannot be what was meant: {usd2(NBCA_AID_QUESTION.netReading)} from
          us plus {usd(AWARD_TOTAL)} from TEFA is {usd2(NBCA_AID_QUESTION.netReading + AWARD_TOTAL)} against {usd(GROSS_TUITION)} of
          gross tuition — NBCA would collect {usd2(NBCA_AID_QUESTION.overCollection)} <em>more than full sticker price</em> for three
          kids while still calling part of it aid. Get Nanette&rsquo;s answer in writing, and budget the full balance below until then.
        </p>
      </section>

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
          TEFA is awarded but deliberately not included here — see above. How much of the {usd(AWARD_TOTAL)} credits
          against this balance rather than against NBCA&rsquo;s own aid is the unresolved question, so this stays the
          number to budget.
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
// TEFA — one question, answered as directly as the data allows: do we get funded out of
// the AUGUST window expiries, the SEPTEMBER ones, or not at all this year?
// The Monte Carlo simulator, band-outlook table, and interactive dials that used to live
// here were removed Aug 20 — at this point in the season they were answering questions
// that are no longer open. Git history has them.
// ---------------------------------------------------------------------------
const TefaView = () => {
  const { series: cascadeSeries, kpis: k } = useMemo(() => buildCascadeProjection(), []);
  const frontierYMax = useMemo(
    () => Math.ceil(Math.max(BAND_HI, ...cascadeSeries.map((r) => r.floorLine ?? 0)) * 1.05 / 1000) * 1000,
    [cascadeSeries]
  );
  const gapBand = `${k.gapLo.toLocaleString()}–${k.gapHi.toLocaleString()}`;

  const watch = [
    { date: 'NOW', text: 'Opt in and select NBCA in the Odyssey parent portal, then get NBCA to confirm enrollment. This is the only time-critical item on the page — everything else can wait.' },
    { date: 'NOW', text: 'Email Nanette and get the "10% of tuition" aid reduction answered IN WRITING before the school re-cuts the award letters. Gross reading vs net reading is ~$13,500 to us, and the net reading would have NBCA collecting more than full sticker tuition for three kids — say that plainly.' },
    { date: 'Sep 7', text: 'Last four-week windows expire — the Aug 10-dated awards. Whatever fuel batch 2 carries is fixed at this point.' },
    { date: '~Sep 11', text: 'Batch 2, for the families still waiting. Floor of ~4,340 further positions, scaled off the measured size of batch 1. If it lands materially larger, awards were still being issued after Aug 10 and a third batch is live.' },
    { date: 'Sep 15', text: 'PRORATION CLIFF — the date that actually binds our award, not the ~Sep 24 window end. Confirmed after Sep 15 and the second installment drops to 75%; after Jan 15 the final drops to 50%.' },
    { date: 'Oct 1', text: 'Second installment pays, if enrollment was confirmed in time. Do not spend it before it lands, and do not treat it as savings until the NBCA aid question is answered.' },
  ];

  return (
    <div className="space-y-6">
      {/* THE ANSWER — resolved Aug 27 */}
      <section className="bg-white rounded-xl shadow-md border-2 border-tefa-green/40 p-6 ring-1 ring-tefa-green/20">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <CheckCircle size={20} className="text-tefa-green" /> Awarded — {fmtChartDate(Date.parse(k.awardDate))}
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          All three kids, in the <strong>first batch after the four-week windows started expiring</strong> — one day after the
          Aug&nbsp;26 expiries and one day inside this model&rsquo;s Aug&nbsp;28–Sep&nbsp;3 estimate. {usd(k.awardTotal)} gross
          ({usd(AWARD.perStudent)} × {AWARD.students} kids). The question this tab was built to
          answer is closed. Two are still open, and the second one is worth more money than the first.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border-2 border-tefa-red/40 bg-tefa-red/[0.04] p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-tefa-navy">Confirm by Sep 15</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-tefa-red/15 text-tefa-red uppercase tracking-wide">Do this first</span>
            </div>
            <p className="text-tefa-body/70 text-xs">
              An award is an <em>offer</em>, not money. The four-week opt-in window runs to ~{fmtChartDate(Date.parse(AWARD.optInWindowEnds))},
              but that is <strong>not the binding date</strong> — the Jun&nbsp;4 funding-timelines release prorates anyone confirming
              after <strong>Sep&nbsp;15</strong> down to 75% of the second installment, and after Jan&nbsp;15 the final drops to 50%.
              Opt in, select NBCA, and get enrollment confirmed well inside that. Nothing else on this page is time-critical; this is.
            </p>
          </div>
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-tefa-navy">What it is actually worth</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wide">Unresolved — ~{usd(NBCA_AID_SPREAD)} at stake</span>
            </div>
            <p className="text-tefa-body/70 text-xs">
              Nanette said on Jun&nbsp;26 that aid would be reduced so we pay &ldquo;10% of tuition&rdquo;. That was never
              disambiguated and the Jun&nbsp;28 email was never answered. Gross reading: we pay {usd2(NBCA_AID_QUESTION.grossReading)} and
              save ~{usd(NBCA_AID_SPREAD)}. Net reading: aid is clawed back to today&rsquo;s {usd2(NBCA_AID_QUESTION.netReading)} and we save
              nothing. <strong>The net reading is arithmetically impossible at the full award</strong> — our{' '}
              {usd2(NBCA_AID_QUESTION.netReading)} plus {usd(k.awardTotal)} is {usd2(NBCA_AID_QUESTION.netReading + k.awardTotal)} against{' '}
              {usd(GROSS_TUITION)} of gross tuition, i.e. the school would collect {usd2(NBCA_AID_QUESTION.overCollection)} more than
              full sticker price while still nominally granting aid. Get the answer in writing.
            </p>
          </div>
        </div>
      </section>

      {/* THE MATH — re-anchored on the observation */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-3">
          <Scale size={20} /> What batch 1 measured, in five lines
        </h2>
        <div className="rounded-lg bg-tefa-navy/[0.03] border border-tefa-navy/10 p-4 font-mono text-[12px] leading-6 text-tefa-body/90 overflow-x-auto">
          <div>our gap was <strong>{gapBand}</strong> (Odyssey, Aug 11) · Brad Fleury&rsquo;s was 4,000–5,000 (Aug 12) · <strong>both awarded Aug 27</strong></div>
          <div>so batch 1 closed <strong>≥{k.batch1Observed.toLocaleString()} positions in one cut</strong> — a gap statement, independent of where the line absolutely sits</div>
          <div>closed-pool check FAILS: that needs <strong>{k.impliedLapsePct}% of the {k.pool.toLocaleString()} pool</strong> to lapse in 6 of 13 days (ceiling at an impossible 100%: {k.batch1Ceiling.toLocaleString()})</div>
          <div>→ the pool REFILLED — awards kept issuing after the Aug 10 fact sheet, so batch 2 is scaled off batch 1, not off the dials</div>
          <div>batch 2 ≈ ({k.batch1Observed.toLocaleString()} − {k.revokedSeats.toLocaleString()} revoked) × 7/6 = <strong>≥{k.batch2Floor.toLocaleString()} more</strong>, ~{fmtChartDate(Date.parse(BATCH2))} · line reaches <strong>≥{k.terminalFloor.toLocaleString()}</strong></div>
        </div>
        <p className="text-[11px] text-tefa-body/55 mt-2">
          Every figure here is a <strong>floor</strong>. A batch tells you who it reached, never where it stopped, and nobody in the
          Aug&nbsp;27 threads reported being passed over — so there is no upper anchor, and everything scaled off batch 1 inherits that.
          If awards did keep flowing after Aug&nbsp;10, the pool refills again and a <em>third</em> batch in late September is live.
        </p>
      </section>

      {/* SCORECARD — what the model said, and what actually happened */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Layers size={20} /> The scorecard — what the model said, and what happened
        </h2>
        <p className="text-sm text-tefa-body/80 mb-4">
          The three lapse scenarios that drove this page are <strong>retired</strong>, not merely updated. They got the
          mechanism and the timing right and the size badly wrong, and the reason matters for reading the batch-2 number
          above: they multiplied a pool that turned out not to be closed.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-tefa-body/50 border-b border-gray-200">
                <th className="py-2 pr-3 font-semibold">Call</th>
                <th className="py-2 pr-3 font-semibold">Model said</th>
                <th className="py-2 pr-3 font-semibold">Happened</th>
                <th className="py-2 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 align-top">
                <td className="py-2 pr-3 font-bold text-tefa-navy">Mechanism</td>
                <td className="py-2 pr-3">Nothing moves until four-week windows expire; first ones close Aug 26</td>
                <td className="py-2 pr-3">Batch cut Aug 27, the day after</td>
                <td className="py-2 font-semibold text-tefa-green">Right</td>
              </tr>
              <tr className="border-b border-gray-100 align-top">
                <td className="py-2 pr-3 font-bold text-tefa-navy">Batch 1 timing</td>
                <td className="py-2 pr-3">Est. Aug 28 – Sep 3 (charted Aug 31)</td>
                <td className="py-2 pr-3">Aug 27</td>
                <td className="py-2 font-semibold text-tefa-green">Right — 1 day early</td>
              </tr>
              <tr className="border-b border-gray-100 align-top">
                <td className="py-2 pr-3 font-bold text-tefa-navy">Batch 1 size</td>
                <td className="py-2 pr-3">2,618 / 3,154 / 3,689 seats (25 / 35 / 45% lapse)</td>
                <td className="py-2 pr-3">≥{k.batch1Observed.toLocaleString()} positions</td>
                <td className="py-2 font-semibold text-tefa-red">Wrong — low by ~60%</td>
              </tr>
              <tr className="border-b border-gray-100 align-top">
                <td className="py-2 pr-3 font-bold text-tefa-navy">Pool size</td>
                <td className="py-2 pr-3">{k.pool.toLocaleString()} unconfirmed awards, closed and draining</td>
                <td className="py-2 pr-3">Too small — batch 1 alone needs {k.impliedLapsePct}% of it</td>
                <td className="py-2 font-semibold text-tefa-red">Wrong — the pool refilled</td>
              </tr>
              <tr className="align-top">
                <td className="py-2 pr-3 font-bold text-tefa-navy">Our outcome</td>
                <td className="py-2 pr-3">September, and only if lapses beat ~23%</td>
                <td className="py-2 pr-3">August, out of batch 1</td>
                <td className="py-2 font-semibold text-amber-700">Right answer, wrong month</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-tefa-body/55">
          <strong>The instructive part.</strong> This file argued in July that &ldquo;the pool does not drain — it refills&rdquo;,
          because every award wave replenishes the unconfirmed pool as fast as it empties. The Aug 20 revision overrode that,
          recomputing the pool as awarded − revoked − funded and shrinking it to {k.pool.toLocaleString()}. Batch 1 says the July
          reading was right and the override was the error: awards kept issuing after the Aug 10 fact sheet, exactly as the Aug 13
          release said they would, and the model declined to quantify it. Raising the lapse dial to {k.impliedLapsePct}% would
          &ldquo;fix&rdquo; the fit while asserting behaviour no benchmark in this file supports — which is why batch 2 above is
          scaled off the observation instead.
        </p>
      </section>

      {/* THE CHART */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-2">
          <Activity size={20} /> How far the line reaches, and when
        </h2>
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
              {/* No separate "Today" line — today IS the award date, and two labels on the same
                  x-value overprint each other. The AWARDED marker below carries both meanings. */}
              {/* Fuel accrues in the shaded expiry band; the waitlist MOVES at the two batch lines. */}
              <ReferenceArea x1={Date.parse(EXPIRY_START)} x2={Date.parse(EXPIRY_END)}
                  fill="#b08a3e" fillOpacity={0.10} stroke="none"
                  label={{ value: 'WINDOWS EXPIRE', position: 'insideBottom', fontSize: 8, fontWeight: 700, fill: '#8a6b2f' }} />
              {/* Batch lines carry no labels — the axis ticks name the dates, and two labels
                  8 days apart collide at this chart width. */}
              {/* The award, not the old Aug 31 estimate — batch 1 is observed now. */}
              <ReferenceLine x={Date.parse(AWARD.received)} stroke="#2e7d5b" strokeWidth={2}
                  label={{ value: 'AWARDED', position: 'insideTopLeft', fontSize: 10, fontWeight: 700, fill: '#2e7d5b' }} />
              <ReferenceLine x={Date.parse(BATCH2)} stroke="#b08a3e" strokeWidth={1.5} strokeDasharray="5 3" />
              <ReferenceArea y1={YOUR_POS.lo} y2={YOUR_POS.hi} fill="#2e7d5b" fillOpacity={0.15}
                  label={{ value: `US — CLEARED ${fmtChartDate(Date.parse(AWARD.received))}`, position: 'insideTopRight', fontSize: 10, fontWeight: 700, fill: '#2e7d5b' }} />
              <ReferenceLine y={YOUR_POS.lo} stroke="#2e7d5b" strokeWidth={1.5} />
              <Line type="linear" dataKey="observedLine" name="Pulled off so far" stroke="#202562" strokeWidth={2.5} dot={false} legendType="none" isAnimationActive={false} />
              <Line type="linear" dataKey="floorLine" name="Batch 2 floor (~Sep 11) — at least this deep" stroke="#b08a3e" strokeWidth={2.5} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
              <Scatter dataKey="observed" name="Published data" fill="#202562" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-tefa-body/45 mt-1">
          Fuel accrues continuously in the gold band as four-week windows expire (Aug 26 → Sep 7), but the waitlist only <em>moves</em> when the
          Comptroller cuts a batch — Odyssey confirmed awards go out in batches tied to announcements, and every advance this summer arrived that
          way. The first batch landed <strong>Aug 27</strong>, one day after the earliest windows expired and one day inside the model&rsquo;s
          Aug 28–Sep 3 estimate, clearing our band. The dashed line is the <strong>floor</strong> for batch 2, scaled off the size of batch 1
          rather than off the lapse dials — it is where the line reaches <em>at least</em>, not where it is expected to stop.
        </p>
      </section>

      {/* WATCH LIST */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-tefa-navy flex items-center gap-2 mb-3">
          <CheckCircle size={20} /> What to do, and when it decides
        </h2>
        <ul className="space-y-3">
          {watch.map((w) => (
            <li key={w.text} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wide bg-tefa-navy/10 text-tefa-navy rounded px-2 py-1 w-20 text-center">{w.date}</span>
              <span className="text-sm text-tefa-body/80">{w.text}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-tefa-body/50 mt-4">
          The waitlist falsifier has been spent — the award landed. The one that still bites is financial:{' '}
          <strong>keep budgeting the full balance</strong> until the money is in the account AND Nanette has answered the aid
          question in writing. An award that arrives and is then netted out by an aid reduction changes nothing we owe.
        </p>
      </section>

      {/* PROVENANCE */}
      <section className="rounded-xl border border-gray-200 bg-tefa-light/50 p-4 text-[11px] text-tefa-body/60 space-y-1.5">
        <div className="font-bold text-tefa-navy text-xs">What this rests on</div>
        <p><strong>Published:</strong> 118,441 awarded (Aug 10 fact sheet) · 109,000+ funded (Aug 20 Comptroller deck) · four-week opt-in window (Aug 13 release) · Sep 15 proration (Jun 4 release) · removal of public-school enrollees (Jun 4 release).</p>
        <p><strong>Official to us:</strong> gap {gapBand} (Odyssey ticket #727303, Aug 11) · <strong>awarded {fmtChartDate(Date.parse(k.awardDate))}, all three kids</strong> — the reading that closed the question.</p>
        <p><strong>Observed, not published:</strong> batch 1&rsquo;s size. It rests on two gaps Odyssey stated directly — ours ({gapBand}, Aug 11) and Brad Fleury&rsquo;s (4,000–5,000, Aug 12) — both cleared in the same cut, giving ≥{k.batch1Observed.toLocaleString()} positions. No Comptroller document states a cascade depth, and none states this batch&rsquo;s size.</p>
        <p><strong>Assumed:</strong> a lower bound is the honest reading of a batch (nobody reported being passed over, so there is no upper anchor) · four-week windows expire roughly uniformly Aug 26 → Sep 7, which is what lets batch 2 be scaled 7/6 off batch 1 · the ~{k.revokedSeats.toLocaleString()} revoked seats rode in batch 1 and do not recur. <strong>Retired:</strong> the 25/35/45 lapse dials and the closed-{k.pool.toLocaleString()} pool they multiplied — see the scorecard.</p>
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
