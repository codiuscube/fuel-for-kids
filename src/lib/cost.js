// ---------------------------------------------------------------------------
// The cost model. Five years of ownership at the user's own mileage, fuel
// price, electricity rate, and Texas tax and fee rules.
// ---------------------------------------------------------------------------

import { GC, OWN } from '../data/vehicles';

export const TAX = 0.0625;
export const FEES = 400;

export const DEFAULT_ASSUMPTIONS = {
  down: 10000,
  miles: 25000,
  gas: 3.0,
  kwh: 0.113,
  elec: 0.55,
  charger: 1000,
  term: 60,
};

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
// family's slider defaults to 25,000, which is why wear items and failure
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
  return clamp(1.41 + (a - 12) * 0.12, 1.41, 2.3);
};

// RepairPal's sample sits around 90,000 miles. Past 150k the curve steepens
// because you are into the second set of major wear items; past 220k it is
// a high-mile vehicle even for a Toyota truck.
const mileFactor = (odo) => {
  if (odo < 90000) return 0.55 + (odo / 90000) * 0.45;
  if (odo < 150000) return 1.0 + ((odo - 90000) / 60000) * 0.5;
  if (odo < 220000) return 1.5 + ((odo - 150000) / 70000) * 0.7;
  return clamp(2.2 + ((odo - 220000) / 80000) * 0.5, 2.2, 2.8);
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

// Five-year maintenance: wear items that scale with the miles slider, plus
// unscheduled repairs that scale with age, odometer, remaining warranty,
// and how hard you drive relative to RepairPal's 15,000-mile sample.
export const maintenanceFor = (o, S) => {
  const miles = Math.max(0, S.miles);
  const start = startMilesOf(o);
  const year = modelYearOf(o);
  const startAge = Math.max(0, COST_YEAR - year);
  const w = warrantyOf(o);
  const own = ownFor(o);
  const base = own ? own[2] : 650;
  const drive = Math.sqrt(miles / RP_MILES_YR);
  const rel = relAdj(o);
  const scheduled = scheduledCpm(o) * miles * 5;

  let unscheduled = 0;
  for (let t = 0; t < 5; t++) {
    const age = startAge + t;
    const odoStart = start + t * miles;
    const odoMid = odoStart + miles / 2;
    const wear = 0.5 * ageFactor(age) + 0.5 * mileFactor(odoMid);
    const pay = unscheduledPay(w, age, odoStart);
    unscheduled += base * 0.7 * wear * pay * drive * rel;
  }

  const total = scheduled + unscheduled;
  return { total, scheduled, unscheduled };
};

// Five-year running total. Resale is marked down about 11% for every extra
// 25,000 miles a year beyond the 15,000-a-year the published figures assume.
export const compute = (o, S) => {
  const price = o.sticker + (o.ship || 0);
  const tax = price * TAX + FEES;
  const loan = Math.max(0, price + tax - o.cash - S.down);
  const m = pmt(loan, o.apr, S.term);
  const interest = m * S.term - loan;
  const wear = Math.max(0.45, Math.min(1.15, 1 - 0.11 * ((S.miles * 5 - 75000) / 25000)));
  const res = o.res * wear;
  const fuel = S.miles * 5 * perMile(o, S);
  const dep = price + tax - o.cash - res;
  const chg = o.charger ? S.charger : 0;
  const evfee = o.ev ? 1000 : 0;
  const mnt = maintenanceFor(o, S);
  return {
    net: dep + interest + fuel + o.ins + mnt.total + chg + evfee,
    evfee,
    dep,
    interest,
    fuel,
    ins: o.ins,
    mnt: mnt.total,
    mntWear: mnt.scheduled,
    mntRepair: mnt.unscheduled,
    chg,
    m,
    res,
  };
};

export const ownFor = (o) => OWN.find((r) => r[0].test(o.n)) || null;
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

// Best overall is a weighted mix you set. Captain's chairs and overall
// legroom (second plus third row) outrank a bench or a jump-seat cabin, even
// when that van is cheaper. Cost still counts, just not enough to put a
// sliding 8-passenger Carnival over a Sienna. Drag any slider; the mix
// always renormalises to 100%.
export const SCORE_KEYS = ['cost', 'cap', 'leg3', 'rel', 'awd', 'cargo', 'cln', 'roof', 'gc'];

export const SCORE_FACTORS = [
  { id: 'cost', label: 'Five-year cost', short: 'cost' },
  { id: 'cap', label: "Captain's chairs", short: 'captains' },
  { id: 'leg3', label: 'Overall legroom', short: 'legroom' },
  { id: 'rel', label: 'Reliability', short: 'reliability' },
  { id: 'awd', label: 'AWD available', short: 'AWD' },
  { id: 'cargo', label: 'Cargo behind 3rd', short: 'cargo' },
  { id: 'cln', label: 'Easy to clean', short: 'cleanability' },
  { id: 'roof', label: 'Sunroof', short: 'sunroof' },
  { id: 'gc', label: 'Ground clearance', short: 'clearance' },
];

export const DEFAULT_WEIGHTS = {
  cost: 2,
  cap: 5,
  leg3: 5,
  rel: 0,
  awd: 0,
  cargo: 0,
  cln: 0,
  roof: 1,
  gc: 1,
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

// Minor bonuses. Sunroof is by trim: Carnival SX and Prestige have the dual
// roof as standard; EX does not. A 0.35 is "often optional, listing unopened."
export const roofScore = (o) => {
  if (o.roof === 'dual') return 1;
  if (o.roof === 'yes') return 0.85;
  if (o.roof === 'no') return 0;
  if (o.roof === 'ask') return 0.35;
  const n = o.n;
  if (/Voyager|Grand Caravan|Tahoe LS|Carnival EX|Carnival Hybrid EX/i.test(n)) return 0;
  if (/Carnival/i.test(n) && /\bSX\b/i.test(n)) return 1;
  if (
    /Prestige|Platinum|Limited|Ltd\b|Denali|Premier|Calligraphy|Avenir|Inscription|Sensory|Advance|XSE|Pinnacle|Land AWD|Ioniq 9|Model X|R1S|Vistiq|EX90|X7|GLS|Escalade|Navigator|TX 350|RST\b/i.test(
      n,
    )
  ) {
    return /Prestige|Calligraphy|Denali|Premier|Platinum/i.test(n) ? 1 : 0.85;
  }
  if (/Odyssey EX-L|Pacifica.*Touring L|Telluride.*SX|Atlas SEL|Enclave Avenir|Explorer Platinum/i.test(n)) {
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

export const weightsEqual = (a, b) => SCORE_KEYS.every((k) => (a[k] || 0) === (b[k] || 0));

export const encodeWeights = (W) => SCORE_KEYS.map((k) => W[k] || 0).join('-');

export const parseWeights = (raw) => {
  let parts = String(raw || '').split('-').map((n) => parseInt(n, 10));
  // Older links stored seven weights; sunroof and clearance were added later.
  if (parts.length === 7) parts = [...parts, 1, 1];
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
  leg3: roomScore(r.o),
  rel: r.o.rel / 5,
  awd: hasAWD(r.o) ? 1 : 0,
  cargo: Math.min(1, r.o.cargo / 41.5),
  cln: r.o.cln / 5,
  roof: roofScore(r.o),
  gc: gcScore(r.o),
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
