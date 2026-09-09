// ---------------------------------------------------------------------------
// The numbers the Notes tab quotes, computed from the same model the cards
// use, at the default assumptions. Prose that hard-codes a five-year total
// goes stale the moment a slider default or a listing price changes; this
// file is how the Notes stop doing that. Everything here is recomputed on
// import, so a figure quoted in a sentence always matches its card.
// ---------------------------------------------------------------------------

import { OPTIONS, LEASE_RATES } from '../data/vehicles';
import { DEFAULT_ASSUMPTIONS, bestOf, compute, hasCaptains, perMile, startMilesOf } from './cost';

// Named listings the Notes talk about. Each regex is matched against
// `${n} | ${y}` so it can pin a specific car by year and mileage.
const NAMED = {
  siennaNew: /Toyota Sienna XLE \| 2026/,
  woodland: /Sienna Woodland Edition \| 2026/,
  sienna2025: /Toyota Sienna XLE \| 2025 · 59k/,
  sienna2023: /Toyota Sienna XLE \| 2023 · 67k/,
  sienna2020: /Toyota Sienna XLE \| 2020 · 75k/,
  sienna2017: /Toyota Sienna XLE \| 2017 · 62k/,
  odyssey2016: /Honda Odyssey EX-L \| 2016 · ~95k/,
  odyssey2022: /Honda Odyssey EX-L \| 2022 · 63k/,
  odyssey2024: /Honda Odyssey EX-L \| 2024 · 34k/,
  carnivalHybEx2026: /Kia Carnival Hybrid EX \| 2026/,
  carnivalHybSx2026: /Kia Carnival Hybrid SX \| 2026 · \$2,000/,
  carnivalHybSx2027cap: /Kia Carnival Hybrid SX \| 2027 · captains/,
  carnivalHybSx2025: /Kia Carnival Hybrid SX \| 2025 · 17k/,
  carnivalPrestige2026: /Kia Carnival Hybrid SX Prestige \| 2026/,
  // The two World Car New Braunfels cars, 9 Sep 2026. Both regexes are pinned
  // tightly: there are now two 2027 Hybrid EX listings and a bare year would
  // match whichever happened to be cheaper.
  carnivalHybEx2027nb: /Kia Carnival Hybrid EX \| 2027 · 6 mi/,
  carnivalHybEx2027austin: /Kia Carnival Hybrid EX \| 2027 · 2\.90%/,
  carnivalPrestige2027nb: /Kia Carnival Hybrid SX Prestige \| 2027/,
  carnivalEx2024_56k: /Kia Carnival EX \| 2024 · 56k/,
  carnivalEx2023: /Kia Carnival EX \| 2023 · 60k/,
  pacifica2024_57k: /Pacifica Hybrid Select \| 2024 · 57k/,
  pacifica2024_68k: /Pacifica Hybrid Select \| 2024 · 68k/,
  grandCaravan2019_21k: /Dodge Grand Caravan SE \| 2019 · 21k/,
  grandHighlander: /Grand Highlander Hybrid Ltd \| 2026/,
  palisadeHyb: /Palisade Hybrid SEL \| 2026 · FWD/,
  tellurideHyb2027: /Kia Telluride Hybrid EX \| 2027/,
  tellurideXLine: /Telluride X-Line SX Hybrid \| 2027/,
  telluride2025S: /Kia Telluride S \| 2025 · 36k/,
  pilotTrailSport: /Honda Pilot TrailSport \| 2026/,
  tahoeLS2023: /Chevy Tahoe LS \| 2023/,
  tahoeLT2023: /Chevy Tahoe LT 4WD \| 2023/,
  tahoeLTDuramax: /Chevy Tahoe LT Duramax \| 2023/,
  tahoeLTNew: /Chevy Tahoe LT 4WD \| 2026/,
  yukonSLT2023: /GMC Yukon SLT 4WD \| 2023/,
  yukonElevation2026: /GMC Yukon Elevation 4WD \| 2026/,
  yukonAT4: /GMC Yukon AT4 4WD \| 2022/,
  expedition2017: /Ford Expedition Limited \| 2017/,
  ev9_2024: /Kia EV9 Light LR \| 2024/,
  ev9New: /Kia EV9 Light LR \| 2026/,
  sequoiaLtd2023: /Toyota Sequoia Limited \| 2023/,
  sequoiaPlat2023: /Toyota Sequoia Platinum \| 2023/,
  armadaPro4x: /Armada PRO-4X/,
  r1sCheapest: /Rivian R1S/,
  modelX2017: /Tesla Model X 100D \| 2017/,
  defender130: /Defender 130/,
  wagoneerCheap: /Jeep Wagoneer Series II/,
};

const money = (v) => '$' + Math.round(v).toLocaleString();
const k = (v) => '$' + (v / 1000).toFixed(1) + 'k';

const build = (S) => {
  const all = OPTIONS.map((o) => ({ o, c: compute(o, S) })).sort((a, b) => a.c.net - b.c.net);
  const live = all.filter((r) => !/SOLD/.test(r.o.offer || ''));
  const eligible = live.filter((r) => r.o.seats >= 7 && hasCaptains(r.o));
  const rankIn = (list, r) => list.indexOf(r) + 1;

  const named = {};
  Object.entries(NAMED).forEach(([key, re]) => {
    const r = all.find((x) => re.test(`${x.o.n} | ${x.o.y}`));
    if (!r) return;
    named[key] = {
      o: r.o,
      c: r.c,
      net: r.c.net,
      netK: k(r.c.net),
      perYear: r.c.net / S.years,
      perMonth: r.c.net / (S.years * 12),
      rank: rankIn(all, r),
      rankLive: rankIn(live, r),
      rankEligible: rankIn(eligible, r),
      pmt: r.c.m,
      fuel: r.c.fuel,
      mnt: r.c.mnt,
      dep: r.c.dep,
      res: r.c.res,
      ins: r.c.ins,
      endMiles: r.c.endMiles,
      pastLife: r.c.pastLife,
      sold: /SOLD/.test(r.o.offer || ''),
    };
  });

  const miles = S.miles * S.years;
  const fuelAt = (mpg) => (miles * S.gas) / mpg;
  const podium = bestOf(live).slice(0, 5).map((x) => ({ ...x, netK: k(x.r.c.net) }));
  const cheapestSuv = live.find((r) => r.o.cat === 'suv' && r.o.seats >= 7 && hasCaptains(r.o));
  const cheapestNewSuv = live.find((r) => r.o.cat === 'suv' && r.o.cond === 'new' && r.o.seats >= 7);
  const cheapestEligible = eligible[0];
  const spread = (n) => (live[n - 1] ? live[n - 1].c.net - live[0].c.net : 0);

  return {
    S,
    years: S.years,
    miles,
    count: all.length,
    liveCount: live.length,
    eligibleCount: eligible.length,
    all,
    live,
    eligible,
    named,
    podium,
    cheapest: live[0],
    cheapestEligible,
    cheapestSuv,
    cheapestNewSuv,
    spreadTop20: spread(20),
    fuelAt,
    fuelGap: (a, b) => fuelAt(b) - fuelAt(a),
    money,
    k,
  };
};

export const FIG5 = build({ ...DEFAULT_ASSUMPTIONS, years: 5 });
export const FIG15 = build({ ...DEFAULT_ASSUMPTIONS, years: 15 });
export const FIG = FIG5;

// Lease overage at the default mileage: three years, minus the 10,000-a-year
// allowance every advertised offer carries.
export const leaseRows = (S = DEFAULT_ASSUMPTIONS) =>
  LEASE_RATES.map(([name, advertised, perMile36]) => {
    const over = Math.max(0, S.miles - 10000) * 3;
    const penalty = over * perMile36;
    return [name, money(advertised), money(advertised + penalty), over, penalty, advertised + penalty];
  });

export const overMiles = (S = DEFAULT_ASSUMPTIONS) => Math.max(0, S.miles - 10000) * 3;

// Odometer this listing would show at the end of the default horizon.
export const endMilesOf = (o, S = DEFAULT_ASSUMPTIONS) => startMilesOf(o) + S.miles * S.years;

export { perMile };
