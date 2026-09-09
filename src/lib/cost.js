// ---------------------------------------------------------------------------
// The cost model. Five years of ownership at the user's own mileage, fuel
// price, electricity rate, and Texas tax and fee rules.
// ---------------------------------------------------------------------------

import { CLEAR, GC, KNOWN, OWN } from '../data/vehicles';
import { SAFETY } from '../data/safety';

export const TAX = 0.0625;
export const FEES = 400;

export const DEFAULT_ASSUMPTIONS = {
  down: 10000,
  miles: 15000,
  gas: 3.0,
  kwh: 0.113,
  elec: 0.55,
  charger: 1000,
  term: 60,
  years: 5,
};

// Ownership horizons. Five years sells the car at the published resale figure.
// Fifteen years is running it into the ground: no sale beyond a token value,
// insurance easing as the car ages, repairs climbing on the same curve, and a
// flag on the card for the year the odometer passes 250,000 miles.
export const HORIZONS = [5, 15];
export const LIFE_MILES = 250000;
export const yearsOf = (S) => (HORIZONS.includes(S.years) ? S.years : 5);

// `gain` is a minimum improvement over your current car, not an absolute
// figure: +2 on leg3 means "at least two inches more third-row legroom than
// whatever is selected as yours on the Compare tab".
export const PRICE_MAX = 80000;
export const PMT_MAX = 1600;

export const DEFAULT_FILTERS = {
  cat: 'all',
  cond: 'all',
  must: {},
  sort: 'net',
  maxp: PRICE_MAX,
  gain: { leg2: 0, leg3: 0, cargo: 0 },
};

export const money = (v) => '$' + Math.round(v).toLocaleString();

export const pmt = (principal, apr, n) => {
  if (principal <= 0) return 0;
  if (apr === 0) return principal / n;
  const r = apr / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
};

// A listing can lock a manufacturer promo to its advertised term (48, 72).
// A listing with aprByTerm follows the slider and picks the matching KFA
// rate — stretching 1.90% across 60 months would invent a deal Kia did not
// offer; using 2.99% at 48 would ignore the cheaper 48-month rung.
export const termOf = (o, S) => o.term || S.term;

export const aprOf = (o, S) => {
  const n = termOf(o, S);
  if (o.aprByTerm && o.aprByTerm[n] != null) return o.aprByTerm[n];
  return o.apr;
};

export const aprLabel = (apr) => `${(apr * 100).toFixed(2)}%`;

export const hasPromoFinance = (o) => !!(o.term || o.aprByTerm);

// Fuel cost per mile: electricity for EVs, a blend for plug-ins, petrol otherwise.
export const perMile = (o, S) => {
  const g = o.diesel ? S.gas * 1.22 : S.gas;
  if (o.ev) return (o.kwh100 / 100) * S.kwh;
  if (o.phev) return S.elec * ((o.kwh100 / 100) * S.kwh) + (1 - S.elec) * (g / o.mpg);
  return g / o.mpg;
};

// Snapshot year for age/warranty maths. The listings are a late-2026 freeze,
// so we do not use Date.now() — a later calendar year would silently age
// every car and drop warranties that were still in force when the prices
// were recorded.
export const COST_YEAR = 2026;

// RepairPal / AAA sample cars are driven about 15,000 miles a year. This
// family drives about 15,000 too, but the slider goes to 35,000, which is why wear items and failure
// rates have to scale with miles instead of sitting as a lump sum.
export const RP_MILES_YR = 15000;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export const modelYearOf = (o) => {
  const m = String(o.y || '').match(/^(\d{4})/);
  return m ? Number(m[1]) : COST_YEAR;
};

export const startMilesOf = (o) => {
  if (o.cond === 'new') return 0;
  const y = String(o.y || '');
  const k = y.match(/~?(\d+)\s*k\s*mi/i);
  if (k) return Number(k[1]) * 1000;
  const exact = y.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*mi/i);
  if (exact) return Number(exact[1].replace(/,/g, ''));
  const age = Math.max(0, COST_YEAR - modelYearOf(o));
  return Math.min(100000, Math.max(30000, age * 12500));
};

const kiaHyundai = (o) =>
  /Kia |Hyundai |Genesis |Palisade|Telluride|Carnival|Santa Fe|Sorento|Ioniq|EV9|Sedona/i.test(
    o.n,
  );

// Remaining factory coverage. Bumper-to-bumper usually transfers; Kia and
// Hyundai's 10-year / 100,000-mile powertrain warranty does not, unless the
// car is still with its original owner (modeled here as cond === 'new').
export const warrantyOf = (o) => {
  if (o.ev) {
    // Battery coverage usually transfers with the car. Kia/Hyundai pack is
    // 10/100; everyone else in this list is the federal 8/100 floor.
    if (kiaHyundai(o)) return { bumperY: 5, bumperM: 60000, ptY: 10, ptM: 100000 };
    return { bumperY: 3, bumperM: 36000, ptY: 8, ptM: 100000 };
  }
  if (kiaHyundai(o) && o.cond === 'new') {
    return { bumperY: 5, bumperM: 60000, ptY: 10, ptM: 100000 };
  }
  if (kiaHyundai(o)) {
    return { bumperY: 5, bumperM: 60000, ptY: 5, ptM: 60000 };
  }
  return { bumperY: 3, bumperM: 36000, ptY: 5, ptM: 60000 };
};

// Share of unscheduled repairs you actually pay. Tires, brakes and
// deductibles still land on you during bumper coverage (~22%). After bumper
// but inside powertrain, engine/trans work is covered (~62% paid). After
// that you pay all of it.
const unscheduledPay = (w, age, odo) => {
  if (age < w.bumperY && odo < w.bumperM) return 0.22;
  if (age < w.ptY && odo < w.ptM) return 0.62;
  return 1;
};

// Age bands track shop data: cheap while new, a step up at 6–8 years, then
// a steeper climb after year 8–9 when water pumps, suspension and A/C start
// landing. AAA finds 10–15 year cars cost 30–60% more per year than a newer
// example of the same model; the top of this curve is in that range.
const ageFactor = (age) => {
  const a = Math.max(0, age);
  if (a <= 2) return 0.5;
  if (a <= 5) return 0.5 + (a - 2) * 0.07;
  if (a <= 8) return 0.71 + (a - 5) * 0.1;
  if (a <= 12) return 1.01 + (a - 8) * 0.1;
  return clamp(1.41 + (a - 12) * 0.12, 1.41, 2.8);
};

// RepairPal's sample sits around 90,000 miles. Past 150k the curve steepens
// because you are into the second set of major wear items; past 220k it is
// a high-mile vehicle even for a Toyota truck. The 15-year horizon runs cars
// to 300,000 miles and beyond, so the curve keeps climbing to a 3.5x cap
// rather than flattening at 2.8x; on a five-year view nothing here reaches it.
const mileFactor = (odo) => {
  if (odo < 90000) return 0.55 + (odo / 90000) * 0.45;
  if (odo < 150000) return 1.0 + ((odo - 90000) / 60000) * 0.5;
  if (odo < 220000) return 1.5 + ((odo - 150000) / 70000) * 0.7;
  return clamp(2.2 + ((odo - 220000) / 80000) * 0.5, 2.2, 3.5);
};

// Oil, tires, brakes, filters. Scales with miles you will actually drive.
// AAA's 2025 "maintenance, repair and tires" average is about 11¢/mile, but
// that figure includes a prepaid extended warranty; this is the wear-item
// slice only, with bigger tires costing more.
const scheduledCpm = (o) => {
  let cpm;
  if (o.ev) cpm = 0.018;
  else if (
    /Defender|GLS(?:\s|$)|X7|XC90|EX90|Grand Wagoneer|Escalade|Navigator/i.test(o.n)
  ) {
    cpm = 0.05;
  } else if (/Tahoe|Suburban|Yukon|Sequoia|Expedition|Armada|QX80/i.test(o.n)) {
    cpm = 0.042;
  } else if (o.cat === 'van') cpm = 0.026;
  else cpm = 0.03;
  if (/\d+"?\s*lift|\b35s\b|on 35/i.test(`${o.y} ${o.n}`)) cpm *= 1.35;
  return cpm;
};

const relAdj = (o) => clamp(1 + (3.2 - (o.rel || 3)) * 0.18, 0.75, 1.45);

// Known big-ticket failures that apply to this listing: nameplate regex plus
// model-year range. See KNOWN in the data file for what qualifies as one.
export const knownFor = (o) => {
  const y = modelYearOf(o);
  // Every matching entry contributes, so a nameplate-wide pattern and a year-
  // or engine-specific one can both land on the same listing.
  //
  // `eng` and `not` are matched against the name alone, never the descriptive
  // tail in `y`. That tail is prose — "petrol, not hybrid", "market estimate" —
  // and matching it made the petrol Highlander exclude itself from a V6-only
  // failure on the word "hybrid" inside "not hybrid". Engine and trim identity
  // lives in the name: Denali, AT4, Duramax, Hybrid.
  return KNOWN.filter((k) => k.m.test(o.n) && y >= k.y[0] && y <= k.y[1])
    .flatMap((k) => k.items)
    .filter((it) => (!it.eng || it.eng.test(o.n)) && !(it.not && it.not.test(o.n)));
};

// Whether this listing has been through the known-issue review at all. An empty
// panel on a 'clear' car means nothing qualified; on an 'unreviewed' one it
// means nobody has looked, which is not the same thing and should not read as
// a clean bill of health.
export const knownStatus = (o) => {
  if (knownFor(o).length) return { state: 'charged' };
  const hit = CLEAR.find((c) => c.m.test(o.n));
  if (hit) return { state: 'clear', note: hit.note };
  return { state: 'unreviewed' };
};

// Expected cost of the known failures over your five years, and the working
// for each one so the card can show it.
//
// A failure is treated as equally likely anywhere in its odometer band, so you
// are charged `p` of the repair for the fraction of that band you will drive
// through — buy a car at 97,000 miles and the 60,000-mile half of the window
// is somebody else's problem, already either survived or already fixed. Then
// factory coverage is checked at the point in the band where it would land:
// bumper-to-bumper pays for anything, powertrain only for the `pt` items.
export const knownCostFor = (o, S) => {
  const miles = Math.max(0, S.miles);
  const Y = yearsOf(S);
  const start = startMilesOf(o);
  const end = start + miles * Y;
  const startAge = Math.max(0, COST_YEAR - modelYearOf(o));
  const w = warrantyOf(o);

  const items = knownFor(o).map((it) => {
    const lo = it.at[0] * 1000;
    const hi = it.at[1] * 1000;
    const band = Math.max(1, hi - lo);
    const overlap = Math.max(0, Math.min(hi, end) - Math.max(lo, start));
    const share = overlap / band;

    // Where in your ownership the middle of that overlap falls.
    const odo = Math.max(lo, start) + overlap / 2;
    const age = miles ? startAge + (odo - start) / miles : startAge;
    const covered =
      (age < w.bumperY && odo < w.bumperM) ||
      (it.pt && age < w.ptY && odo < w.ptM) ||
      // A component with its own, longer coverage window: a hybrid pack.
      (!!it.cov && age < it.cov[0] && odo < it.cov[1]);

    const expected = covered ? 0 : it.usd * it.p * share;
    return { ...it, share, expected, covered, inWindow: overlap > 0 };
  });

  return { total: items.reduce((t, i) => t + i.expected, 0), items };
};

// Maintenance over the horizon: wear items that scale with the miles slider,
// plus unscheduled repairs that scale with age, odometer, remaining warranty,
// and how hard you drive relative to RepairPal's 15,000-mile sample.
export const maintenanceFor = (o, S) => {
  const miles = Math.max(0, S.miles);
  const Y = yearsOf(S);
  const start = startMilesOf(o);
  const year = modelYearOf(o);
  const startAge = Math.max(0, COST_YEAR - year);
  const w = warrantyOf(o);
  const own = ownFor(o);
  const base = own ? own[2] : 650;
  const drive = Math.sqrt(miles / RP_MILES_YR);
  const rel = relAdj(o);
  const scheduled = scheduledCpm(o) * miles * Y;

  let unscheduled = 0;
  for (let t = 0; t < Y; t++) {
    const age = startAge + t;
    const odoStart = start + t * miles;
    const odoMid = odoStart + miles / 2;
    const wear = 0.5 * ageFactor(age) + 0.5 * mileFactor(odoMid);
    const pay = unscheduledPay(w, age, odoStart);
    unscheduled += base * 0.7 * wear * pay * drive * rel;
  }

  const known = knownCostFor(o, S);

  const total = scheduled + unscheduled + known.total;
  return { total, scheduled, unscheduled, known: known.total, knownItems: known.items };
};

// Running total over the horizon. Resale starts from the published five-year
// figure, marked down about 11% for every 25,000 miles the horizon runs past
// 15,000 a year; beyond year five it loses a further 11% a year, which is
// roughly what a ten-year-old mainstream car does on its way to fifteen, with
// a $1,000 floor for what is left of a 300,000-mile van. Insurance is a
// five-year lump in the data; years past five are charged at 75% of that
// annual rate, since collision and comprehensive shrink with the car's value
// while liability does not.
export const compute = (o, S) => {
  const Y = yearsOf(S);
  const price = o.sticker + (o.ship || 0);
  const tax = price * TAX + FEES;
  const loan = Math.max(0, price + tax - o.cash - S.down);
  const n = termOf(o, S);
  const apr = aprOf(o, S);
  const m = pmt(loan, apr, n);
  const interest = m * n - loan;
  const wear = Math.max(0.45, Math.min(1.15, 1 - 0.11 * (((S.miles - RP_MILES_YR) * Y) / 25000)));
  const res = Math.max(1000, o.res * wear * Math.pow(0.89, Math.max(0, Y - 5)));
  const fuel = S.miles * Y * perMile(o, S);
  const dep = price + tax - o.cash - res;
  const chg = o.charger ? S.charger : 0;
  const evfee = o.ev ? 200 * Y : 0;
  const ins = o.ins * (Y <= 5 ? Y / 5 : 1 + (0.75 * (Y - 5)) / 5);
  const mnt = maintenanceFor(o, S);
  const start = startMilesOf(o);
  const endMiles = start + S.miles * Y;
  // Year of ownership in which the odometer passes LIFE_MILES, if it does
  // inside the horizon. 0 means it was already past when you bought it.
  const lifeYear =
    start >= LIFE_MILES ? 0 : S.miles > 0 ? Math.ceil((LIFE_MILES - start) / S.miles) : Infinity;
  return {
    net: dep + interest + fuel + ins + mnt.total + chg + evfee,
    years: Y,
    endMiles,
    pastLife: lifeYear <= Y ? lifeYear : null,
    evfee,
    dep,
    interest,
    fuel,
    ins,
    mnt: mnt.total,
    mntWear: mnt.scheduled,
    mntRepair: mnt.unscheduled,
    mntKnown: mnt.known,
    knownItems: mnt.knownItems,
    chg,
    m,
    apr,
    term: n,
    res,
  };
};

export const ownFor = (o) => OWN.find((r) => r[0].test(o.n)) || null;

// Crash-safety record for this listing's nameplate and model year, or null if
// nobody has looked it up. Entries are matched on the name alone plus a
// model-year range, the same way known issues are.
export const safetyOf = (o) => {
  const y = modelYearOf(o);
  return SAFETY.find((e) => e.m.test(o.n) && y >= e.y[0] && y <= e.y[1]) || null;
};

const IIHS_SCORE = { 'TSP+': 1, TSP: 0.8, none: 0.45, untested: 0.4 };
const REAR_SCORE = { Good: 1, Acceptable: 0.7, Marginal: 0.4, Poor: 0.1 };

// 0–1. Standard automatic emergency braking is a quarter of it on its own,
// because with a new driver in the house it is the single feature most likely
// to matter. IIHS award and the updated rear-seat test carry the crash side;
// NHTSA stars fill in where IIHS has not tested. Anything unknown scores as a
// middling 0.4 rather than 0, so an untested car is not punished as though it
// had failed, and an unverified entry is capped so it cannot win on a guess.
export const safeScore = (o) => {
  const e = safetyOf(o);
  if (!e) return 0.4;
  const iihs = IIHS_SCORE[e.iihs] ?? 0.4;
  const rear = e.rearSeat ? REAR_SCORE[e.rearSeat] ?? 0.4 : iihs;
  const nhtsa = e.nhtsa === 5 ? 1 : e.nhtsa === 4 ? 0.7 : e.nhtsa ? 0.4 : iihs;
  const aeb = e.aeb === true ? 1 : e.aeb === false ? 0 : 0.4;
  const raw = 0.35 * iihs + 0.2 * rear + 0.2 * nhtsa + 0.25 * aeb;
  return e.conf === 'unverified' ? Math.min(raw, 0.6) : raw;
};

// Short chip for the card. Warns loudly on the one thing a buyer can act on.
export const safeLabel = (o) => {
  const e = safetyOf(o);
  if (!e) return null;
  const bits = [];
  if (e.iihs === 'TSP+' || e.iihs === 'TSP') bits.push(`IIHS ${e.iihs}`);
  if (e.aeb === false) bits.push('No auto braking');
  else if (e.rearSeat === 'Poor' || e.rearSeat === 'Marginal') bits.push(`Rear seat ${e.rearSeat.toLowerCase()}`);
  if (!bits.length && e.nhtsa) bits.push(`NHTSA ${e.nhtsa}★`);
  if (!bits.length) return e.aeb ? 'Auto braking std' : null;
  return bits.join(' · ');
};

export const safeTone = (o) => {
  const e = safetyOf(o);
  if (!e) return '';
  if (e.aeb === false || e.rearSeat === 'Poor') return 'warn';
  if (e.iihs === 'TSP+' || e.iihs === 'TSP') return 'ok';
  return '';
};
export const gcFor = (o) => {
  const hit = GC.find((r) => r[0].test(o.n));
  return hit ? hit[1] : null;
};

export const hasAWD = (o) => !/No AWD|FWD only|RWD/i.test(o.awd);
export const isEff = (o) => !!(o.ev || o.phev || (o.mpg && o.mpg >= 30));

// Second-row type on each listing. Captains and lounge both put two in the
// middle with a walkthrough; lounge seats (Carnival Prestige, Sedona SX, EV9
// VIP) do not fold or come out. Bench is a confirmed three-across second row.
// Ask means the trim can go either way and this car was not opened.
export const ROW2 = {
  captains: { label: 'Captains', short: "Captain's chairs", chip: 'ok', frac: 1 },
  lounge: { label: 'Captains · lounge', short: "Captain's chairs — lounge, do not stow", chip: 'ok', frac: 0.9 },
  bench: { label: 'Bench 2nd', short: 'Second-row bench', chip: 'warn', frac: 0 },
  ask: { label: 'Ask 2nd row', short: 'Second row unverified', chip: 'warn', frac: 0.2 },
};

export const row2Of = (o) => {
  if (o.row2 && ROW2[o.row2]) return o.row2;
  const blob = `${o.n} ${o.y} ${o.offer}`;
  if (/lounge|VIP 2nd row/i.test(blob)) return 'lounge';
  if (/no captain|bench 2nd|ships with a bench/i.test(blob)) return 'bench';
  if (o.seats === 8) return 'bench';
  if (/Carnival/i.test(o.n)) {
    if (/Prestige/i.test(o.n)) return 'lounge';
    if (/\bcaptains\b/i.test(blob)) return 'captains';
    // 2025–2026 EX/SX are sliding 8-passenger seats, not captains. 2027 is the
    // first year those trims can option real buckets — this car still unverified.
    if (modelYearOf(o) >= 2027) return 'ask';
    return 'bench';
  }
  if (/captain|buckets standard|stow.?n.?go buckets/i.test(blob)) return 'captains';
  if (
    /check for buckets|buckets optional|check 2nd row|check buckets|check for the buckets|check it/i.test(
      blob,
    )
  ) {
    return 'ask';
  }
  if (/Wagoneer Series II/i.test(o.n) && !/Grand Wagoneer/i.test(o.n)) return 'ask';
  if (/Voyager/i.test(o.n)) return 'ask';
  if (/\b(Tahoe|Suburban|Yukon)\b/i.test(o.n)) {
    if (/\b(Premier|RST|SLT|Denali|Platinum|High Country)\b/i.test(o.n)) return 'captains';
    if (/\bLS\b/.test(o.n)) return 'bench';
    if (/\b(LT|Elevation|Z71|AT4)\b/.test(o.n)) return 'ask';
  }
  if (/Armada SV/i.test(o.n)) return 'ask';
  if (o.seats === 6) return 'captains';
  return 'captains';
};

export const row2Meta = (o) => ROW2[row2Of(o)];
export const hasCaptains = (o) => {
  const id = row2Of(o);
  return id === 'captains' || id === 'lounge';
};

// Best overall is a weighted mix you set. Captain's chairs and skipping the
// COVID build years lead the default mix, with seven seats, safety, overall
// legroom, cost and reliability just behind; AWD and cargo are off by default
// because the filters already handle them. Drag any slider; the mix renormalises to 100%.
//
// SCORE_KEYS is the wire order — it is what encodeWeights/parseWeights write
// into the `w` link parameter, so new factors are appended, never inserted.
// SCORE_FACTORS is the display order for the sliders and may differ.
export const SCORE_KEYS = ['cost', 'cap', 'leg3', 'rel', 'awd', 'cargo', 'cln', 'roof', 'gc', 'covid', 'mpg', 'seats', 'safe'];

export const SCORE_FACTORS = [
  { id: 'cost', label: 'Five-year cost', short: 'cost' },
  { id: 'mpg', label: 'Fuel economy', short: 'mpg' },
  { id: 'cap', label: "Captain's chairs", short: 'captains' },
  { id: 'seats', label: 'Seven seats', short: '7 seats' },
  { id: 'leg3', label: 'Overall legroom', short: 'legroom' },
  { id: 'rel', label: 'Reliability', short: 'reliability' },
  { id: 'safe', label: 'Crash safety and auto braking', short: 'safety' },
  { id: 'awd', label: 'AWD available', short: 'AWD' },
  { id: 'cargo', label: 'Cargo behind 3rd', short: 'cargo' },
  { id: 'cln', label: 'Easy to clean', short: 'cleanability' },
  { id: 'roof', label: 'Sunroof', short: 'sunroof' },
  { id: 'gc', label: 'Ground clearance', short: 'clearance' },
  { id: 'covid', label: 'Skip COVID years', short: 'COVID years' },
];

export const DEFAULT_WEIGHTS = {
  cost: 7,
  cap: 10,
  leg3: 8,
  rel: 7,
  awd: 0,
  cargo: 0,
  cln: 5,
  roof: 5,
  gc: 3,
  covid: 10,
  mpg: 5,
  seats: 8,
  safe: 8,
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));

// Combined second-plus-third row, with a floor so a long second row cannot
// hide a jump-seat third. 70" combined / 30" third is children-only; a
// Sienna-class cabin (79" / 38.7") is a 1.0.
export const roomScore = (o) => {
  const overall = clamp01((o.leg2 + o.leg3 - 70) / 9);
  const third = clamp01((o.leg3 - 30) / 8.7);
  return 0.5 * overall + 0.5 * third;
};

// Minor bonuses. Sunroof is by trim, vans and SUVs. Dual/panoramic is 1,
// a conventional moonroof is 0.85, often-optional is 0.35, known-absent is 0.
export const roofScore = (o) => {
  if (o.roof === 'dual') return 1;
  if (o.roof === 'yes') return 0.85;
  if (o.roof === 'no') return 0;
  if (o.roof === 'ask') return 0.35;
  const n = o.n;

  if (
    /Voyager|Grand Caravan|Tahoe LS|Carnival EX|Carnival Hybrid EX|EV9 Light|Telluride S\b/i.test(n)
  ) {
    return 0;
  }

  // Dual / panoramic as standard on the trim.
  if (
    /Carnival/i.test(n) && /\bSX\b/i.test(n) ||
    /Prestige|Calligraphy|Denali|Premier|Platinum|Avenir|Land AWD|Ioniq 9|Model X|R1S|Vistiq|EX90|TX 350|ID\. Buzz/i.test(n)
  ) {
    return 1;
  }

  // Conventional moonroof / sunroof standard, or panoramic on this trim.
  if (
    /Limited|Ltd\b|XSE|Pinnacle|Inscription|Sensory|Advance|X7|GLS|Escalade|Navigator|RST\b|Yukon SLT|Armada SL|CX-9 Signature|CX-90 Turbo Premium|Santa Fe Calligraphy|Telluride.*SX|Atlas SEL|Explorer Platinum|Odyssey EX-L|Pacifica.*Touring L|Pilot EX-L|Pathfinder SL|Grand Cherokee L Limited|Flex Limited|Wagoneer|Traverse RS|Sequoia Limited|Grand Highlander Hybrid Ltd|Expedition.*Limited|QX80|QX60|MDX/i.test(
      n,
    )
  ) {
    return 0.85;
  }

  return 0.35;
};

export const roofLabel = (o) => {
  const s = roofScore(o);
  if (s >= 0.99) return 'dual sunroof';
  if (s >= 0.8) return 'sunroof';
  return null;
};

// 5" is a minivan on its belly (Odyssey). 8" is enough for Port Aransas sand
// without needing a lift. Anything above 8" is the same bonus.
export const gcScore = (o) => {
  const gc = gcFor(o);
  if (gc == null) return 0.4;
  return clamp01((gc - 5) / 3);
};

// EPA combined for petrol, and the hand-set MPGe comparable (`mpgBar`) that the
// card's fuel bar already uses for electrics and plug-ins. Scaled across the
// actual list rather than from zero: 14 is the worst here (the lifted 6.2 Yukon
// AT4), 40 the best (EV9, Model X), so the weight has real range to work in.
// Note this partly restates the fuel line inside `cost` — it earns its own
// slider as a hedge on the petrol price, not as new information.
export const mpgScore = (o) => clamp01(((o.mpgBar || o.mpg || 0) - 14) / 26);

// 2020–2022 factory years: shutdowns, then the chip shortage, cars leaving
// without modules, and a well-documented QC dip. 2021–2022 are the worst.
// 2023 still carries some of that hangover. 2019 and earlier, and 2024+,
// are treated as normal builds. Higher score = not a COVID-year car.
export const covidScore = (o) => {
  const y = modelYearOf(o);
  if (y === 2021 || y === 2022) return 0;
  if (y === 2020) return 0.15;
  if (y === 2023) return 0.55;
  return 1;
};

export const covidLabel = (o) => {
  const y = modelYearOf(o);
  if (y >= 2020 && y <= 2022) return 'COVID build';
  if (y === 2023) return '2023 QC';
  return null;
};

export const weightsEqual = (a, b) => SCORE_KEYS.every((k) => (a[k] || 0) === (b[k] || 0));

export const encodeWeights = (W) => SCORE_KEYS.map((k) => W[k] || 0).join('-');

// Links written before a factor existed. Seven weights predate sunroof,
// clearance and the COVID-year demotion; nine predate COVID; ten predate mpg;
// eleven predate the seat-count factor; twelve predate safety.
const LEGACY_WEIGHT_LENGTHS = [7, 9, 10, 11, 12];

export const parseWeights = (raw) => {
  let parts = String(raw || '').split('-').map((n) => parseInt(n, 10));
  // An old link only ever expressed the factors that existed when it was
  // shared, so the missing tail takes today's defaults rather than zero.
  if (LEGACY_WEIGHT_LENGTHS.includes(parts.length)) {
    parts = [...parts, ...SCORE_KEYS.slice(parts.length).map((k) => DEFAULT_WEIGHTS[k])];
  }
  if (parts.length !== SCORE_KEYS.length || parts.some((n) => !Number.isFinite(n))) {
    return { ...DEFAULT_WEIGHTS };
  }
  const W = {};
  SCORE_KEYS.forEach((k, i) => {
    W[k] = Math.max(0, Math.min(10, parts[i]));
  });
  return W;
};

export const normalizeWeights = (W) => {
  const sum = SCORE_KEYS.reduce((s, k) => s + Math.max(0, W[k] || 0), 0);
  const parts = {};
  SCORE_KEYS.forEach((k) => {
    parts[k] = sum ? Math.max(0, W[k] || 0) / sum : 0;
  });
  return { parts, sum };
};

export const scoreParts = (r, lo, hi) => ({
  cost: hi > lo ? 1 - (r.c.net - lo) / (hi - lo) : 1,
  cap: row2Meta(r.o).frac,
  // Seven or more is the brief. A six-seater is two captains and a two-seat
  // third row, which carries three kids only if nobody brings a friend.
  seats: r.o.seats >= 7 ? 1 : r.o.seats === 6 ? 0.5 : 0,
  safe: safeScore(r.o),
  leg3: roomScore(r.o),
  rel: r.o.rel / 5,
  awd: hasAWD(r.o) ? 1 : 0,
  cargo: Math.min(1, r.o.cargo / 41.5),
  cln: r.o.cln / 5,
  roof: roofScore(r.o),
  gc: gcScore(r.o),
  covid: covidScore(r.o),
  mpg: mpgScore(r.o),
});

export const scoreRow = (r, lo, hi, W = DEFAULT_WEIGHTS) => {
  const p = scoreParts(r, lo, hi);
  const { parts, sum } = normalizeWeights(W);
  if (!sum) return 0;
  return SCORE_KEYS.reduce((s, k) => s + p[k] * parts[k], 0);
};

export const weightMixLabel = (W) => {
  const { parts, sum } = normalizeWeights(W);
  if (!sum) return 'nothing — drag a slider';
  return SCORE_FACTORS.filter((f) => parts[f.id] >= 0.005)
    .map((f) => `${Math.round(parts[f.id] * 100)}% ${f.short}`)
    .join(', ');
};

export const bestOf = (list, W = DEFAULT_WEIGHTS) => {
  if (!list.length) return null;
  let lo = Infinity;
  let hi = -Infinity;
  list.forEach((r) => {
    if (r.c.net < lo) lo = r.c.net;
    if (r.c.net > hi) hi = r.c.net;
  });
  return list
    .map((r) => ({ r, s: scoreRow(r, lo, hi, W) }))
    .sort((a, b) => b.s - a.s);
};

export const specMpg = (v) => {
  const n = parseFloat(v);
  return /e$/.test(v) ? null : Number.isNaN(n) ? null : n;
};
export const baseFromSpec = (r) => ({
  name: r[1],
  leg2: r[3],
  leg3: r[4],
  cargo: r[5],
  mpg: specMpg(r[6]),
  frunk: r[7] || 0,
});

// The Ford Flex's 44.3in second row is the longest measurement on the page.
export const LGMAX = 44.5;
export const CGMAX = 45;
