// ---------------------------------------------------------------------------
// Shareable URL state for the vehicle app.
//
// Filters, sort, search, the open card, the Compare tab, the comparison car
// and the assumptions all live in the query string so a link restores the
// same view. Defaults are omitted, so the empty URL is the stock page.
// ---------------------------------------------------------------------------

import { OPTIONS, PRESETS, SPECS } from '../data/vehicles';
import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_FILTERS,
  PRICE_MAX,
  PMT_MAX,
  baseFromSpec,
} from './cost';

export const TABS = ['cars', 'compare', 'notes'];
export const SORT_IDS = ['net', 'pmt', 'price', 'leg3', 'cargo', 'mpg', 'rel', 'res'];
export const MUST_IDS = ['awd', 's7', 'eff'];
export const COMPARE_SUBS = ['yours', 'glance', 'tables'];
export const MX_SORTS = [2, 3, 4, 5];

export const DEFAULT_BASE_SEL = `s${SPECS.length - 1}`;
export const defaultBase = () => baseFromSpec(SPECS[SPECS.length - 1]);

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const CARD_IDS = [];
const INDEX_BY_ID = new Map();
const ID_FOR = new WeakMap();
OPTIONS.forEach((o, i) => {
  let id = slug(`${o.n} ${o.y} ${o.sticker}`);
  if (INDEX_BY_ID.has(id)) id = `${id}-${i}`;
  CARD_IDS[i] = id;
  INDEX_BY_ID.set(id, i);
  ID_FOR.set(o, id);
});

export const cardId = (o) => ID_FOR.get(o) || slug(`${o.n} ${o.y} ${o.sticker}`);

export const defaultSnapshot = () => ({
  tab: 'cars',
  S: { ...DEFAULT_ASSUMPTIONS },
  F: { ...DEFAULT_FILTERS, gain: { ...DEFAULT_FILTERS.gain }, maxm: PMT_MAX, q: '' },
  openCard: null,
  baseSel: DEFAULT_BASE_SEL,
  base: defaultBase(),
  cmpSub: 'yours',
  mxSort: 5,
});

const num = (v, fallback) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const setIf = (p, key, value, fallback) => {
  if (value !== fallback && value !== '' && value != null) p.set(key, String(value));
};

const almost = (a, b) => Math.abs(a - b) < 1e-9;

export const parseUrl = (search) => {
  const snap = defaultSnapshot();
  const raw = (search || '').replace(/^\?/, '');
  if (!raw) return snap;
  const p = new URLSearchParams(raw);

  const tab = p.get('tab');
  if (TABS.includes(tab)) snap.tab = tab;

  const q = p.get('q');
  if (q) snap.F.q = q;

  const sort = p.get('sort');
  if (SORT_IDS.includes(sort)) snap.F.sort = sort;

  const cat = p.get('cat');
  if (cat === 'van' || cat === 'suv') snap.F.cat = cat;

  const cond = p.get('cond');
  if (cond === 'new' || cond === 'used') snap.F.cond = cond;

  MUST_IDS.forEach((id) => {
    if (p.get(id) === '1') snap.F.must[id] = true;
  });

  if (p.has('maxp')) snap.F.maxp = Math.min(PRICE_MAX, Math.max(20000, int(p.get('maxp'), PRICE_MAX)));
  if (p.has('maxm')) snap.F.maxm = Math.min(PMT_MAX, Math.max(200, int(p.get('maxm'), PMT_MAX)));

  if (p.has('g2')) snap.F.gain.leg2 = Math.max(0, num(p.get('g2'), 0));
  if (p.has('g3')) snap.F.gain.leg3 = Math.max(0, num(p.get('g3'), 0));
  if (p.has('gc')) snap.F.gain.cargo = Math.max(0, num(p.get('gc'), 0));

  const card = p.get('card');
  if (card && INDEX_BY_ID.has(card)) snap.openCard = card;

  const sub = p.get('sub');
  if (COMPARE_SUBS.includes(sub)) snap.cmpSub = sub;

  if (p.has('mx')) {
    const mx = int(p.get('mx'), 5);
    if (MX_SORTS.includes(mx)) snap.mxSort = mx;
  }

  const base = p.get('base');
  if (base && /^s\d+$/.test(base)) {
    const i = +base.slice(1);
    if (SPECS[i]) {
      snap.baseSel = base;
      snap.base = baseFromSpec(SPECS[i]);
    }
  } else if (base && /^p\d+$/.test(base)) {
    const i = +base.slice(1);
    const preset = PRESETS[i];
    if (preset) {
      snap.baseSel = base;
      snap.base = { name: preset[0], leg2: preset[1], leg3: preset[2], cargo: preset[3], mpg: preset[4], frunk: 0 };
    }
  } else if (base === 'x') {
    snap.baseSel = 'x';
    snap.base = {
      name: 'Your car',
      leg2: num(p.get('b2'), snap.base.leg2),
      leg3: num(p.get('b3'), snap.base.leg3),
      cargo: num(p.get('bc'), snap.base.cargo),
      mpg: p.has('bm') ? num(p.get('bm'), snap.base.mpg) : snap.base.mpg,
      frunk: 0,
    };
  }

  const S = snap.S;
  if (p.has('down')) S.down = Math.max(0, int(p.get('down'), S.down));
  if (p.has('mi')) S.miles = Math.max(0, int(p.get('mi'), S.miles));
  if (p.has('gas')) S.gas = Math.max(0, num(p.get('gas'), S.gas));
  if (p.has('kwh')) S.kwh = Math.max(0, num(p.get('kwh'), S.kwh));
  if (p.has('elec')) S.elec = Math.min(1, Math.max(0, num(p.get('elec'), S.elec)));
  if (p.has('chg')) S.charger = Math.max(0, int(p.get('chg'), S.charger));
  if (p.has('term')) S.term = Math.max(12, int(p.get('term'), S.term));

  return snap;
};

export const toSearch = (snap) => {
  const p = new URLSearchParams();
  const { tab, S, F, openCard, baseSel, base, cmpSub, mxSort } = snap;
  const D = DEFAULT_ASSUMPTIONS;

  setIf(p, 'tab', tab, 'cars');
  setIf(p, 'q', F.q.trim(), '');
  setIf(p, 'sort', F.sort, 'net');
  setIf(p, 'cat', F.cat, 'all');
  setIf(p, 'cond', F.cond, 'all');
  MUST_IDS.forEach((id) => {
    if (F.must[id]) p.set(id, '1');
  });
  setIf(p, 'maxp', F.maxp, PRICE_MAX);
  setIf(p, 'maxm', F.maxm, PMT_MAX);
  setIf(p, 'g2', F.gain.leg2, 0);
  setIf(p, 'g3', F.gain.leg3, 0);
  setIf(p, 'gc', F.gain.cargo, 0);
  setIf(p, 'card', openCard, null);
  setIf(p, 'sub', cmpSub, 'yours');
  setIf(p, 'mx', mxSort, 5);
  setIf(p, 'base', baseSel, DEFAULT_BASE_SEL);
  if (baseSel === 'x') {
    p.set('b2', String(base.leg2));
    p.set('b3', String(base.leg3));
    p.set('bc', String(base.cargo));
    if (base.mpg != null) p.set('bm', String(base.mpg));
  }

  if (S.down !== D.down) p.set('down', String(S.down));
  if (S.miles !== D.miles) p.set('mi', String(S.miles));
  if (!almost(S.gas, D.gas)) p.set('gas', String(S.gas));
  if (!almost(S.kwh, D.kwh)) p.set('kwh', String(S.kwh));
  if (!almost(S.elec, D.elec)) p.set('elec', String(S.elec));
  if (S.charger !== D.charger) p.set('chg', String(S.charger));
  if (S.term !== D.term) p.set('term', String(S.term));

  const qs = p.toString();
  return qs ? `?${qs}` : '';
};

export const hrefFor = (snap) => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  return `${path}${toSearch(snap)}`;
};
