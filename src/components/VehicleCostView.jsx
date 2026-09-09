import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../vehicle-cost.css';

import { OPTIONS, SPECS, PRESETS, WHY } from '../data/vehicles';
import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_FILTERS,
  DEFAULT_WEIGHTS,
  PMT_MAX,
  PRICE_MAX,
  SCORE_FACTORS,
  aprLabel,
  baseFromSpec,
  bestOf,
  compute,
  covidLabel,
  covidScore,
  gcFor,
  hasAWD,
  hasCaptains,
  hasPromoFinance,
  isEff,
  money,
  normalizeWeights,
  ownFor,
  roofLabel,
  row2Meta,
  row2Of,
  weightMixLabel,
} from '../lib/cost';
import { cardId, hrefFor, parseUrl } from '../lib/urlState';
import { Assumptions, KnownIssues, Spec, TrophyIcon, WhyContext, delta } from './pieces';
import CompareTab from './CompareTab';
import NotesTab from './NotesTab';

// ---------------------------------------------------------------------------
// Three-row family vehicle comparison, rebuilt for a phone.
//
// The old page put twenty sections of reasoning above the cars. This one opens
// on the list: a sticky bar you can always reach with a thumb, a search box, a
// sort sheet and a filter sheet. Each card is five lines you can scan while
// scrolling, and everything else is one tap away. The reasoning still exists in
// full, it just lives in the Notes tab instead of in front of the results.
//
// The query string is the source of truth for sharing: tab, search, sort,
// filters, the open card, Compare (sub-tab, matrix sort, comparison car) and
// the assumptions. Opening Details pushes history so Back collapses the card
// and scrolls it into view under the sticky bar.
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'cars', label: 'Cars' },
  { id: 'compare', label: 'Compare' },
  { id: 'notes', label: 'Notes' },
];

const SORTS = [
  { id: 'net', label: 'Cheapest over 5 years', short: '5-yr cost', get: (r) => r.c.net, dir: 1 },
  { id: 'pmt', label: 'Lowest monthly payment', short: 'Payment', get: (r) => r.c.m, dir: 1 },
  { id: 'price', label: 'Lowest asking price', short: 'Price', get: (r) => r.o.sticker, dir: 1 },
  { id: 'leg3', label: 'Biggest third row', short: '3rd row', get: (r) => r.o.leg3, dir: -1 },
  { id: 'cargo', label: 'Most cargo space', short: 'Cargo', get: (r) => r.o.cargo, dir: -1 },
  { id: 'mpg', label: 'Best fuel economy', short: 'MPG', get: (r) => r.o.mpgBar || r.o.mpg || 0, dir: -1 },
  { id: 'rel', label: 'Most reliable', short: 'Reliability', get: (r) => r.o.rel, dir: -1 },
  { id: 'res', label: 'Best resale', short: 'Resale', get: (r) => r.c.res, dir: -1 },
];

const MUSTS = [
  { id: 'awd', label: 'AWD available', hint: 'Offered on the model — confirm on the listing' },
  { id: 's7', label: '7 seats' },
  {
    id: 'cap',
    label: "Captain's chairs",
    hint: 'Confirmed second-row buckets, including lounge seats. Hides benches and unverified listings.',
  },
  { id: 'eff', label: '30+ mpg' },
  { id: 'van', label: 'Minivan only' },
  { id: 'suv', label: 'SUV only' },
];

const PODIUM = [
  { label: 'Best overall', cls: 'gold' },
  { label: 'Runner-up', cls: 'silver' },
  { label: 'Bronze', cls: 'bronze' },
];

// The three "more room than yours" sliders. They filter on the gain over the
// car selected on the Compare tab — the 2017 Pathfinder until you change it —
// so the numbers stay meaningful when you swap the comparison car.
const GAINS = [
  { id: 'leg2', label: '2nd row legroom', short: '2nd row', unit: '"', step: 0.5, cap: 8 },
  { id: 'leg3', label: '3rd row legroom', short: '3rd row', unit: '"', step: 0.5, cap: 12 },
  { id: 'cargo', label: 'Cargo behind 3rd row', short: 'cargo', unit: ' cu ft', step: 1, cap: 30 },
];

// A gain of +1.5" reads better as +1.5"; +2.0 cu ft reads better as +2.
const gainLabel = (g, v) => `+${g.step < 1 ? v.toFixed(1) : Math.round(v)}${g.unit}`;

// The best gain any vehicle actually offers over your car, and the furthest the
// slider can go and still match something: that best, rounded *down* to a step.
// Anything beyond it empties the list, so the thumb never goes there — a max of
// 0 means nothing on offer beats your car on that measure.
const gainRange = (g, base) => {
  const best = Math.max(...OPTIONS.map((o) => o[g.id])) - base[g.id];
  // The 1e-9 keeps an exact 8.0" best from floating-point rounding down to 7.5".
  const stops = Math.floor(best / g.step + 1e-9);
  return { best, max: Math.max(0, Math.min(g.cap, stops * g.step)) };
};

// $58,231 reads as five separate digits on a phone; $58.2k reads as one number.
const shortMoney = (v) => (v >= 10000 ? `$${(v / 1000).toFixed(1)}k` : money(v));

const bodyLabel = (cat) => (cat === 'van' ? 'Minivan' : 'SUV');

// Everything a search box should reasonably match on: name, year, mileage,
// finance note and drivetrain text all live in different fields.
const haystack = (o) => {
  const id = row2Of(o);
  const meta = row2Meta(o);
  const aliases =
    id === 'captains'
      ? 'captains captain chairs buckets'
      : id === 'lounge'
        ? 'lounge captains captain chairs vip'
        : id === 'bench'
          ? 'bench second row'
          : 'ask second row unverified buckets';
  const covid = covidLabel(o);
  return `${o.n} ${o.y} ${o.offer} ${o.awd} ${o.cat} ${o.cond} ${meta.label} ${meta.short} ${aliases}${covid ? ` ${covid} covid` : ''}`.toLowerCase();
};

const passesFilters = (o, F, base) => {
  if (F.cat !== 'all' && o.cat !== F.cat) return false;
  if (F.cond !== 'all' && o.cond !== F.cond) return false;
  if (F.must.awd && !hasAWD(o)) return false;
  if (F.must.s7 && o.seats < 7) return false;
  if (F.must.cap && !hasCaptains(o)) return false;
  if (F.must.eff && !isEff(o)) return false;
  if (o.sticker > F.maxp) return false;
  // A hair under, to keep floating point from rejecting an exact match.
  if (GAINS.some((g) => F.gain[g.id] > 0 && o[g.id] - base[g.id] < F.gain[g.id] - 0.001)) return false;
  return true;
};

const activeFilterCount = (F) =>
  (F.cat !== 'all' ? 1 : 0) +
  (F.cond !== 'all' ? 1 : 0) +
  Object.values(F.must).filter(Boolean).length +
  (F.maxp < PRICE_MAX ? 1 : 0) +
  (F.maxm < PMT_MAX ? 1 : 0) +
  GAINS.filter((g) => F.gain[g.id] > 0).length;

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

const Icon = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

const SearchIcon = () => <Icon size={16} d={<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>} />;
const SlidersIcon = () => (
  <Icon
    size={15}
    d={
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="7" cy="18" r="2" fill="currentColor" stroke="none" />
      </>
    }
  />
);
const SortIcon = () => <Icon size={15} d={<><path d="M7 4v16M7 20l-3-3M7 20l3-3" /><path d="M14 7h7M14 12h5M14 17h3" /></>} />;
const GearIcon = () => <Icon size={16} d={<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>} />;
const CloseIcon = () => <Icon size={18} d={<path d="M6 6l12 12M18 6 6 18" />} />;
const ChevronIcon = () => <Icon size={16} d={<path d="m6 9 6 6 6-6" />} />;
const CheckIcon = () => <Icon size={16} d={<path d="M4 12.5 9 17.5 20 6.5" />} />;

// A bottom sheet. On a phone the controls belong under the thumb, not at the
// top of a scrolled page; on a wide screen it centres as an ordinary dialog.
const Sheet = ({ open, title, onClose, footer, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sheetwrap">
      <div className="scrim" onClick={onClose} role="presentation" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheetgrab" />
        <div className="sheethead">
          <h2>{title}</h2>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="sheetbody">{children}</div>
        {footer && <div className="sheetfoot">{footer}</div>}
      </div>
    </div>
  );
};

const Toggle = ({ on, label, hint, onClick }) => (
  <button type="button" className="toggle" aria-pressed={on} onClick={onClick}>
    <span className="tglab">
      {label}
      {hint && <span className="tghint">{hint}</span>}
    </span>
    <span className="tgbox">{on && <CheckIcon />}</span>
  </button>
);

const Seg = ({ value, options, onChange }) => (
  <div className="seg">
    {options.map((o) => (
      <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}>
        {o.label}
      </button>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------

const Fact = ({ value, label, tone }) => (
  <span className={tone ? `fact ${tone}` : 'fact'}>
    <b>{value}</b>
    {label}
  </span>
);

const CostCard = ({ o, c, base, rank, badge, badgeTone, open, onToggle, cid }) => {
  const seg = (v) => `${((v / c.net) * 100).toFixed(2)}%`;
  const own = ownFor(o);
  const clearance = gcFor(o);
  const roof = roofLabel(o);
  const covid = covidLabel(o);
  const key = `${o.n} ${o.y}`;
  const kept = Math.round((c.res / o.sticker) * 100);
  const row2 = row2Meta(o);

  return (
    <article className={badge ? `vcard flagged ${badgeTone || ''}` : 'vcard'} id={cid} data-card={cid}>
      {badge && <div className={badgeTone ? `vflag ${badgeTone}` : 'vflag'}>{badge}</div>}
      <button type="button" className="vhead" onClick={onToggle} aria-expanded={open}>
        <span className="vrank">{rank}</span>
        <span className="vtitle">
          <span className="vname">{o.n}</span>
          <span className="vmeta">
            {o.y.replace(/ · \$[\d,]+$/, '')}
          </span>
          <span className="vchips">
            <span className={o.cond === 'new' ? 'chip nw' : 'chip'}>{o.cond === 'new' ? 'New' : 'Used'}</span>
            <span className="chip">{bodyLabel(o.cat)}</span>
            <span className={o.seats < 7 ? 'chip warn' : 'chip'}>{o.seats} seats</span>
            <span className={`chip ${row2.chip}`}>{row2.label}</span>
            {covid && <span className="chip warn">{covid}</span>}
            {hasPromoFinance(o) && (
              <span className="chip ok">
                {aprLabel(c.apr)} · {c.term} mo
              </span>
            )}
            {hasAWD(o) && <span className="chip">AWD</span>}
          </span>
        </span>
        <span className="vcost">
          <span className="vnet">{shortMoney(c.net)}</span>
          <span className="vnetlab">5-yr cost</span>
          <span className="vask">{money(o.sticker)} ask</span>
        </span>
      </button>

      <div className="vfacts">
        <Fact value={money(c.m)} label={hasPromoFinance(o) ? `/mo · ${c.term}` : '/mo'} />
        <Fact value={o.mpgLab} label={/e$/i.test(o.mpgLab) ? '' : ' mpg'} />
        <Fact value={`${o.leg3.toFixed(1)}"`} label=" 3rd row" />
        <Fact value={o.cargo.toFixed(1)} label=" cu ft" />
        <Fact value={o.rel.toFixed(1)} label="/5 reliab." tone={o.rel <= 2 ? 'bad' : o.rel >= 4 ? 'good' : undefined} />
        <Fact value={`${kept}%`} label=" kept" />
      </div>

      <div className="stack" aria-hidden="true">
        <i style={{ width: seg(c.dep), background: 'var(--s1)' }} />
        <i style={{ width: seg(c.interest), background: 'var(--s2)' }} />
        <i style={{ width: seg(c.fuel), background: 'var(--s3)' }} />
        <i style={{ width: seg(c.ins), background: 'var(--s4)' }} />
        <i style={{ width: seg(c.mnt), background: 'var(--s5)' }} />
        {!!c.chg && <i style={{ width: seg(c.chg), background: 'var(--s6)' }} />}
      </div>

      {open && (
        <div className="vdetail">
          <div className="key">
            <span>Depreciation {money(c.dep)}</span>
            <span>Interest {money(c.interest)}</span>
            <span>Fuel {money(c.fuel)}</span>
            <span>Insurance {money(c.ins)}</span>
            <span>Maintenance {money(c.mnt)}</span>
            <span>Sell for {money(c.res)}</span>
            {!!c.chg && <span>Charger {money(c.chg)}</span>}
            {!!c.evfee && <span>TX EV fee {money(c.evfee)}</span>}
          </div>
          <p className="fine" style={{ margin: '-4px 0 12px' }}>
            {money(c.mntWear)} oil, tires, brakes · {money(c.mntRepair)} repairs after warranty
            {c.mntKnown > 0 ? ` · ${money(c.mntKnown)} known issues` : ''}
          </p>

          <KnownIssues cid={key} items={c.knownItems} total={c.mntKnown} />

          <div className="specs">
            <Spec
              id={`${key} leg2`}
              label="2nd row vs yours"
              value={
                <>
                  {o.leg2.toFixed(1)}&quot;
                  {delta(o.leg2 - base.leg2)}
                </>
              }
              frac={o.leg2 / 43.0}
              why={WHY.leg2}
            />
            <Spec
              id={`${key} leg3`}
              label="3rd row vs yours"
              value={
                <>
                  {o.leg3.toFixed(1)}&quot;
                  {delta(o.leg3 - base.leg3)}
                </>
              }
              frac={o.leg3 / 38.7}
              why={WHY.leg3}
            />
            <Spec
              id={`${key} row2`}
              label="Second row"
              value={row2.short}
              frac={row2.frac}
              why={WHY.row2}
            />
            <Spec
              id={`${key} covid`}
              label="Build year"
              value={covid || `${String(o.y).match(/^\d{4}/)?.[0] || ''} — fine`}
              frac={covidScore(o)}
              why={WHY.covid}
            />
            <Spec
              id={`${key} cargo`}
              label="Cargo vs yours"
              value={
                <>
                  {o.cargo.toFixed(1)} cu ft{delta(o.cargo - base.cargo)}
                </>
              }
              frac={o.cargo / 41.5}
              why={WHY.cargo}
            />
            <Spec
              id={`${key} mpg`}
              label="MPG combined"
              value={o.mpgLab}
              frac={Math.min(1, (o.mpgBar || o.mpg) / 40)}
              why={WHY.mpg}
            />
            <Spec
              id={`${key} res`}
              label="Resale at year 5"
              value={
                <>
                  {money(c.res)} <span className="muted">{kept}% kept</span>
                </>
              }
              frac={c.res / o.sticker / 0.72}
              why={WHY.res}
            />
            <Spec id={`${key} rel`} label="Reliability" value={`${o.rel.toFixed(1)} / 5`} frac={o.rel / 5} why={WHY.rel} />
            <Spec id={`${key} cln`} label="Easy to clean" value={`${o.cln.toFixed(1)} / 5`} frac={o.cln / 5} why={WHY.cln} />
            {own && (
              <Spec id={`${key} own`} label="Owner rating" value={`${own[1].toFixed(1)} / 5`} frac={own[1] / 5} why={WHY.own} />
            )}
            {own && (
              <Spec
                id={`${key} repairs`}
                label="Repairs per year"
                value={`$${own[2]}`}
                frac={1 - (own[2] - 450) / 900}
                why={WHY.repairs}
              />
            )}
          </div>

          <p className="vdrive">
            {o.awd}
            {clearance ? ` · ${clearance.toFixed(1)}" ground clearance` : ''}
            {roof ? ` · ${roof}` : ''} · {o.offer}
          </p>

          {o.aw && (
            <a className="award" href={o.awUrl} target="_blank" rel="noopener noreferrer">
              <TrophyIcon />
              {o.aw}
            </a>
          )}
          <a className="lnk" href={o.url} target="_blank" rel="noopener noreferrer">
            {o.lt}
          </a>
        </div>
      )}

      <button type="button" className="vmore" onClick={onToggle} aria-expanded={open}>
        {open ? 'Less' : 'Details'}
        <span className={open ? 'chev up' : 'chev'}>
          <ChevronIcon />
        </span>
      </button>
    </article>
  );
};

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

const VehicleCostView = () => {
  const boot = useMemo(
    () => parseUrl(typeof window !== 'undefined' ? window.location.search : ''),
    [],
  );
  const [tab, setTab] = useState(boot.tab);
  const [S, setS] = useState(boot.S);
  const [F, setF] = useState(boot.F);
  const [base, setBase] = useState(boot.base);
  const [baseSel, setBaseSel] = useState(boot.baseSel);
  const [why, setWhy] = useState(null);
  const [sheet, setSheet] = useState(null); // 'filters' | 'sort' | 'assume'
  const [openCard, setOpenCard] = useState(boot.openCard);
  const [showPick, setShowPick] = useState(true);
  const [cmpSub, setCmpSub] = useState(boot.cmpSub);
  const [mxSort, setMxSort] = useState(boot.mxSort);
  const [W, setW] = useState(boot.W);

  const applyingUrl = useRef(false);
  const historyMode = useRef('replace');
  const scrollMode = useRef('instant');
  const lastHref = useRef(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');

  const closeSheet = useCallback(() => setSheet(null), []);
  // Changing the sort or the filters from halfway down 40 cards should put you
  // back at the top of the new list, not leave you stranded mid-scroll.
  const toTop = useCallback(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const pushUrl = useCallback(() => {
    historyMode.current = 'push';
  }, []);
  const applySnapshot = useCallback((snap) => {
    applyingUrl.current = true;
    setTab(snap.tab);
    setS(snap.S);
    setF(snap.F);
    setBase(snap.base);
    setBaseSel(snap.baseSel);
    setOpenCard(snap.openCard);
    setCmpSub(snap.cmpSub);
    setMxSort(snap.mxSort);
    setW(snap.W);
    scrollMode.current = 'instant';
    queueMicrotask(() => {
      applyingUrl.current = false;
    });
  }, []);
  const whyCtx = useMemo(
    () => ({ open: why, toggle: (id) => setWhy((cur) => (cur === id ? null : id)) }),
    [why],
  );

  const priced = useMemo(() => OPTIONS.map((o) => ({ o, c: compute(o, S) })), [S]);

  const matching = useMemo(() => {
    const q = F.q.trim().toLowerCase();
    return priced.filter(
      (r) => passesFilters(r.o, F, base) && r.c.m <= F.maxm && (!q || haystack(r.o).includes(q)),
    );
  }, [priced, F, base]);

  const sortDef = SORTS.find((s) => s.id === F.sort) || SORTS[0];
  const rows = useMemo(
    () => matching.slice().sort((a, b) => (sortDef.get(a) - sortDef.get(b)) * sortDef.dir),
    [matching, sortDef],
  );

  // The recommendation still runs, but it is a strip above the list rather
  // than a page of its own, and it can be folded away.
  const ranked = bestOf(matching, W) || [];
  const podium = ranked.slice(0, 3);
  const podiumById = new Map(
    podium.map((item, i) => [cardId(item.r.o), PODIUM[i]]),
  );
  const cheapest = matching.length ? matching.slice().sort((a, b) => a.c.net - b.c.net)[0] : null;
  const nFilters = activeFilterCount(F);
  const mix = normalizeWeights(W);
  const mixLabel = weightMixLabel(W);

  // Swapping the comparison car moves every gain: a filter that made sense
  // against the Pathfinder can be beyond anything on the list against a
  // Suburban, so pull each slider back to what is still reachable.
  const gainRanges = useMemo(() => GAINS.map((g) => gainRange(g, base)), [base]);
  useEffect(() => {
    setF((p) => {
      const next = {};
      let changed = false;
      GAINS.forEach((g, i) => {
        const v = Math.min(p.gain[g.id], gainRanges[i].max);
        next[g.id] = v;
        if (v !== p.gain[g.id]) changed = true;
      });
      return changed ? { ...p, gain: next } : p;
    });
  }, [gainRanges]);

  const setBaseFromSelect = (v) => {
    setBaseSel(v);
    if (v[0] === 's') setBase(baseFromSpec(SPECS[+v.slice(1)]));
    else if (v[0] === 'p') {
      const p = PRESETS[+v.slice(1)];
      setBase({ name: p[0], leg2: p[1], leg3: p[2], cargo: p[3], mpg: p[4], frunk: 0 });
    }
  };
  const setBaseField = (field, raw) => {
    setBaseSel('x');
    setBase((prev) => ({ ...prev, name: 'Your car', frunk: 0, [field]: parseFloat(raw) || 0 }));
  };

  const setMust = (id) => {
    if (id === 'van' || id === 'suv') {
      setF((p) => ({ ...p, cat: p.cat === id ? 'all' : id }));
      return;
    }
    setF((p) => ({ ...p, must: { ...p.must, [id]: !p.must[id] } }));
  };
  const mustOn = (id) => (id === 'van' || id === 'suv' ? F.cat === id : !!F.must[id]);
  const resetFilters = () =>
    setF((p) => ({
      ...DEFAULT_FILTERS,
      gain: { ...DEFAULT_FILTERS.gain },
      maxm: PMT_MAX,
      q: p.q,
      sort: p.sort,
    }));
  const setGain = (id, v) => setF((p) => ({ ...p, gain: { ...p.gain, [id]: v } }));
  const setWeight = (id, v) => setW((p) => ({ ...p, [id]: v }));
  const resetWeights = () => setW({ ...DEFAULT_WEIGHTS });

  const snapshot = useMemo(
    () => ({ tab, S, F, W, openCard, baseSel, base, cmpSub, mxSort }),
    [tab, S, F, W, openCard, baseSel, base, cmpSub, mxSort],
  );

  useEffect(() => {
    if (applyingUrl.current) return;
    const href = hrefFor(snapshot);
    if (href === lastHref.current) {
      historyMode.current = 'replace';
      return;
    }
    lastHref.current = href;
    const mode = historyMode.current;
    historyMode.current = 'replace';
    if (mode === 'push') window.history.pushState(null, '', href);
    else window.history.replaceState(null, '', href);
  }, [snapshot]);

  useEffect(() => {
    const onPop = () => {
      lastHref.current = window.location.pathname + window.location.search;
      applySnapshot(parseUrl(window.location.search));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applySnapshot]);

  useEffect(() => {
    if (tab !== 'cars' || !openCard) return;
    const el = document.getElementById(openCard);
    if (!el) return;
    const behavior = scrollMode.current;
    scrollMode.current = 'smooth';
    el.scrollIntoView({ behavior, block: 'start' });
  }, [tab, openCard, rows]);

  const goTab = (id) => {
    if (id === tab) return;
    pushUrl();
    setTab(id);
  };
  const toggleCard = (id) => {
    pushUrl();
    scrollMode.current = 'smooth';
    setOpenCard((cur) => (cur === id ? null : id));
    if (tab !== 'cars') setTab('cars');
  };
  const goCmpSub = (id) => {
    if (id === cmpSub) return;
    pushUrl();
    setCmpSub(id);
  };

  return (
    <WhyContext.Provider value={whyCtx}>
      <div className="vehcost">
        <header className="apphead">
          <div className="appbar">
            <h1>Three-row family vehicle</h1>
            <button
              type="button"
              className="iconbtn"
              onClick={() => setSheet('assume')}
              aria-label="Assumptions"
            >
              <GearIcon />
            </button>
          </div>
          <nav className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => goTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'cars' && (
          <>
            <div className="toolbar">
              <div className="searchrow">
                <span className="searchico">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  className="search"
                  placeholder="Search Sienna, hybrid, 2024…"
                  value={F.q}
                  onChange={(e) => setF((p) => ({ ...p, q: e.target.value }))}
                  aria-label="Search vehicles"
                />
                {F.q && (
                  <button
                    type="button"
                    className="clearq"
                    onClick={() => setF((p) => ({ ...p, q: '' }))}
                    aria-label="Clear search"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
              <div className="ctlrow">
                <button type="button" className="ctlbtn" onClick={() => setSheet('sort')}>
                  <SortIcon />
                  {sortDef.short}
                </button>
                <button
                  type="button"
                  className={nFilters ? 'ctlbtn on' : 'ctlbtn'}
                  onClick={() => setSheet('filters')}
                >
                  <SlidersIcon />
                  Filters
                  {!!nFilters && <span className="badge">{nFilters}</span>}
                </button>
                <span className="count">
                  {rows.length} of {OPTIONS.length}
                </span>
              </div>
              {!!nFilters && (
                <div className="activefilters">
                  {F.cat !== 'all' && (
                    <button type="button" className="fpill" onClick={() => setF((p) => ({ ...p, cat: 'all' }))}>
                      {bodyLabel(F.cat)} <CloseIcon />
                    </button>
                  )}
                  {F.cond !== 'all' && (
                    <button type="button" className="fpill" onClick={() => setF((p) => ({ ...p, cond: 'all' }))}>
                      {F.cond === 'new' ? 'New' : 'Used'} <CloseIcon />
                    </button>
                  )}
                  {MUSTS.filter((m) => m.id !== 'van' && m.id !== 'suv' && F.must[m.id]).map((m) => (
                    <button key={m.id} type="button" className="fpill" onClick={() => setMust(m.id)}>
                      {m.label} <CloseIcon />
                    </button>
                  ))}
                  {F.maxp < PRICE_MAX && (
                    <button
                      type="button"
                      className="fpill"
                      onClick={() => setF((p) => ({ ...p, maxp: PRICE_MAX }))}
                    >
                      Under {money(F.maxp)} <CloseIcon />
                    </button>
                  )}
                  {F.maxm < PMT_MAX && (
                    <button type="button" className="fpill" onClick={() => setF((p) => ({ ...p, maxm: PMT_MAX }))}>
                      Under {money(F.maxm)}/mo <CloseIcon />
                    </button>
                  )}
                  {GAINS.filter((g) => F.gain[g.id] > 0).map((g) => (
                    <button key={g.id} type="button" className="fpill" onClick={() => setGain(g.id, 0)}>
                      {gainLabel(g, F.gain[g.id])} {g.short} <CloseIcon />
                    </button>
                  ))}
                  <button type="button" className="fpill clear" onClick={resetFilters}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <main className="list">
              {!!podium.length && showPick && (
                <div className="pick">
                  <div className="pickhead">
                    <span className="picklab">Podium</span>
                    <button type="button" className="picksh" onClick={() => setShowPick(false)}>
                      Hide
                    </button>
                  </div>
                  <div className="podium">
                    {podium.map((item, i) => {
                      const place = PODIUM[i];
                      const r = item.r;
                      const cid = cardId(r.o);
                      return (
                        <button
                          key={cid}
                          type="button"
                          className={`pod ${place.cls}`}
                          onClick={() => toggleCard(cid)}
                        >
                          <span className="podlab">{place.label}</span>
                          <span className="podname">{r.o.n}</span>
                          <span className="podsub">{r.o.y.replace(/ · \$[\d,]+$/, '')}</span>
                          <span className="podmeta">
                            {shortMoney(r.c.net)} over 5 years · {money(r.c.m)}/mo · {money(r.o.sticker)} ask
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="fine pickwhy">
                    Your mix: {mixLabel}, across the {matching.length} matching your filters. Tap a card to
                    open it. The numbered list is still cheapest-first unless you change the sort.
                    {cheapest && podium[0] && cheapest.o.n !== podium[0].r.o.n
                      ? ` Cheapest match is the ${cheapest.o.n} at ${shortMoney(cheapest.c.net)}.`
                      : ''}
                  </p>
                  <details className="pickmix">
                    <summary>Adjust what matters</summary>
                    {SCORE_FACTORS.map((f) => (
                      <div key={f.id} className="gainrow pickrow">
                        <label htmlFor={`w-${f.id}`}>
                          {f.label}
                          <output>{mix.sum ? `${Math.round(mix.parts[f.id] * 100)}%` : 'Off'}</output>
                        </label>
                        <input
                          id={`w-${f.id}`}
                          type="range"
                          min={0}
                          max={10}
                          step={1}
                          value={W[f.id] || 0}
                          onChange={(e) => setWeight(f.id, parseInt(e.target.value, 10))}
                        />
                      </div>
                    ))}
                    <button type="button" className="pickreset" onClick={resetWeights}>
                      Reset to your mix
                    </button>
                  </details>
                </div>
              )}

              {!rows.length && (
                <div className="empty">
                  <p>Nothing matches.</p>
                  <button type="button" className="ctlbtn" onClick={resetFilters}>
                    Clear filters
                  </button>
                </div>
              )}

              {rows.map((r, i) => {
                const key = cardId(r.o);
                const place = podiumById.get(key);
                return (
                  <CostCard
                    key={key}
                    cid={key}
                    o={r.o}
                    c={r.c}
                    base={base}
                    rank={i + 1}
                    badge={place ? place.label : null}
                    badgeTone={place ? place.cls : undefined}
                    open={openCard === key}
                    onToggle={() => toggleCard(key)}
                  />
                );
              })}

              {!!rows.length && (
                <p className="fine listfoot">
                  Costs recalculate live from your assumptions, including maintenance, which now follows the car&rsquo;s
                  age, miles and remaining warranty. Insurance and resale are still estimates, so treat any gap under
                  about $3,000 as a tie and decide on the test drive.
                </p>
              )}
            </main>
          </>
        )}

        {tab === 'compare' && (
          <main className="wrap">
            <CompareTab
              base={base}
              baseSel={baseSel}
              setBaseFromSelect={setBaseFromSelect}
              setBaseField={setBaseField}
              sub={cmpSub}
              setSub={goCmpSub}
              mxSort={mxSort}
              setMxSort={setMxSort}
            />
          </main>
        )}

        {tab === 'notes' && (
          <main className="wrap">
            <NotesTab />
          </main>
        )}

        <Sheet
          open={sheet === 'sort'}
          title="Sort by"
          onClose={closeSheet}
        >
          <div className="optlist">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="opt"
                aria-pressed={F.sort === s.id}
                onClick={() => {
                  setF((p) => ({ ...p, sort: s.id }));
                  closeSheet();
                  if (!openCard) toTop();
                }}
              >
                {s.label}
                {F.sort === s.id && <CheckIcon />}
              </button>
            ))}
          </div>
        </Sheet>

        <Sheet
          open={sheet === 'filters'}
          title="Filters"
          onClose={closeSheet}
          footer={
            <>
              <button type="button" className="ghost" onClick={resetFilters}>
                Reset
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  closeSheet();
                  if (!openCard) toTop();
                }}
              >
                Show {rows.length} {rows.length === 1 ? 'vehicle' : 'vehicles'}
              </button>
            </>
          }
        >
          <div className="fgroup">
            <h3>Condition</h3>
            <Seg
              value={F.cond}
              onChange={(v) => setF((p) => ({ ...p, cond: v }))}
              options={[
                { v: 'all', label: 'Any' },
                { v: 'new', label: 'New' },
                { v: 'used', label: 'Used' },
              ]}
            />
          </div>

          <div className="fgroup">
            <h3>Must have</h3>
            {MUSTS.map((m) => (
              <Toggle key={m.id} on={mustOn(m.id)} label={m.label} hint={m.hint} onClick={() => setMust(m.id)} />
            ))}
          </div>

          <div className="fgroup">
            <h3>More room than yours</h3>
            <p className="fine gainnote">
              Measured against the {base.name}. Change the car you are comparing to on the Compare tab.
            </p>
            {GAINS.map((g, i) => (
              <div key={g.id} className="gainrow">
                <label htmlFor={`gain-${g.id}`}>
                  {g.label}
                  <output>{F.gain[g.id] > 0 ? gainLabel(g, F.gain[g.id]) : 'Any'}</output>
                </label>
                <input
                  id={`gain-${g.id}`}
                  type="range"
                  min={0}
                  max={gainRanges[i].max || g.step}
                  step={g.step}
                  value={F.gain[g.id]}
                  disabled={!gainRanges[i].max}
                  onChange={(e) => setGain(g.id, parseFloat(e.target.value))}
                />
                <span className="fine">
                  {gainRanges[i].max
                    ? `Most on offer is ${gainLabel(g, gainRanges[i].best)}`
                    : 'Nothing on the list beats yours here'}
                </span>
              </div>
            ))}
          </div>

          <div className="fgroup">
            <h3>
              Asking price <output>{F.maxp >= PRICE_MAX ? 'Any' : `up to ${money(F.maxp)}`}</output>
            </h3>
            <input
              type="range"
              min={20000}
              max={PRICE_MAX}
              step={1000}
              value={F.maxp}
              onChange={(e) => setF((p) => ({ ...p, maxp: parseInt(e.target.value, 10) }))}
              aria-label="Maximum asking price"
            />
          </div>

          <div className="fgroup">
            <h3>
              Monthly payment <output>{F.maxm >= PMT_MAX ? 'Any' : `up to ${money(F.maxm)}`}</output>
            </h3>
            <input
              type="range"
              min={200}
              max={PMT_MAX}
              step={25}
              value={F.maxm}
              onChange={(e) => setF((p) => ({ ...p, maxm: parseInt(e.target.value, 10) }))}
              aria-label="Maximum monthly payment"
            />
            <p className="fine">
              At {money(S.down)} down over {S.term} months. The 2026 Carnival Hybrid KFA
              ladder follows that term; a few other promos keep the term on the card.
            </p>
          </div>
        </Sheet>

        <Sheet open={sheet === 'assume'} title="Your assumptions" onClose={closeSheet}>
          <p className="fine" style={{ marginTop: 0 }}>
            Every price on the list recalculates from these.
          </p>
          <Assumptions S={S} setS={setS} idp="veh-" />
          <p className="fine">
            Default is 25,000 miles a year, so 125,000 over five years. Resale is discounted for that extra wear,
            roughly 11% per additional 25,000 miles. Electricity is the GVEC marginal rate: $0.085 generation plus
            $0.0238 distribution, then the 2% franchise fee and 1.5% city tax. Charger default is a typical $1,600
            install less GVEC&rsquo;s $600 rebate.
          </p>
          <button type="button" className="ghost wide" onClick={() => setS(DEFAULT_ASSUMPTIONS)}>
            Reset to defaults
          </button>
        </Sheet>
      </div>
    </WhyContext.Provider>
  );
};

export default VehicleCostView;
