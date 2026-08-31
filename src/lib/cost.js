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
export const DEFAULT_FILTERS = {
  cat: 'all',
  cond: 'all',
  must: {},
  sort: 'net',
  maxp: 80000,
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
  return {
    net: dep + interest + fuel + o.ins + o.mnt + chg + evfee,
    evfee,
    dep,
    interest,
    fuel,
    ins: o.ins,
    mnt: o.mnt,
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

// Recommendation score: cost is a third of it, the rest is what the car is like
// to live with. Weights are spelled out on the card itself.
export const scoreRow = (r, lo, hi) => {
  const cost = hi > lo ? 1 - (r.c.net - lo) / (hi - lo) : 1;
  const own = ownFor(r.o) ? ownFor(r.o)[1] / 5 : 0.7;
  return (
    cost * 0.35 +
    (r.o.rel / 5) * 0.2 +
    own * 0.1 +
    Math.min(1, r.o.leg3 / 38.7) * 0.15 +
    Math.min(1, r.o.cargo / 41.5) * 0.15 +
    (r.o.cln / 5) * 0.05
  );
};
export const bestOf = (list) => {
  if (!list.length) return null;
  let lo = Infinity;
  let hi = -Infinity;
  list.forEach((r) => {
    if (r.c.net < lo) lo = r.c.net;
    if (r.c.net > hi) hi = r.c.net;
  });
  return list
    .map((r) => ({ r, s: scoreRow(r, lo, hi) }))
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
