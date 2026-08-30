import { createContext, useContext } from 'react';
import { WHY } from '../data/vehicles';
import { money } from '../lib/cost';

// ---------------------------------------------------------------------------
// Shared small pieces: the "why this number" popovers, the bar primitives, and
// the assumptions panel that the sliders live in.
// ---------------------------------------------------------------------------

export const WhyContext = createContext({ open: null, toggle: () => {} });
export const useWhy = (id) => {
  const { open, toggle } = useContext(WhyContext);
  return [open === id, () => toggle(id)];
};

export const Spec = ({ id, label, value, frac, why }) => {
  const [open, toggle] = useWhy(id);
  return (
    <>
      <div className="spec" data-why={why || undefined} onClick={why ? toggle : undefined}>
        <div className="k">{label}</div>
        <div className="v">{value}</div>
        <div className="bar">
          <i style={{ width: `${Math.max(2, Math.min(100, frac * 100)).toFixed(1)}%` }} />
        </div>
      </div>
      {why && open && <div className="whybox">{why}</div>}
    </>
  );
};

// A legend swatch that explains the cost line it stands for.
export const KeyItem = ({ id, color, label, why }) => {
  const [open, toggle] = useWhy(id);
  return (
    <>
      <span className={why ? 'q' : undefined} data-why={why || undefined} onClick={why ? toggle : undefined}>
        <i className="sw" style={{ background: `var(--${color})` }} />
        {label}
      </span>
      {why && open && <div className="whybox">{why}</div>}
    </>
  );
};

export const Slider = ({ id, label, why, out, min, max, step, value, onChange }) => {
  const [open, toggle] = useWhy(id);
  return (
    <div className="ctrl">
      <label htmlFor={id} className="q" data-why={why} onClick={toggle}>
        {label} <output>{out}</output>
      </label>
      {open && <div className="whybox">{why}</div>}
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

// Green when the candidate gains on your car, red when it loses.
export const delta = (x) =>
  x > 0.05 ? (
    <span style={{ color: 'var(--s3)' }}> +{x.toFixed(1)}</span>
  ) : x < -0.05 ? (
    <span style={{ color: 'var(--warn-text)' }}> {x.toFixed(1)}</span>
  ) : null;

export const MxBar = ({ frac, color }) => (
  <div className="mxb">
    <i
      style={{
        width: `${Math.max(3, Math.min(100, frac * 100)).toFixed(1)}%`,
        background: `var(--${color})`,
      }}
    />
  </div>
);

export const LgLine = ({ lab, base, val, max, cls, unit, frunk }) => {
  const bw = (Math.min(base, val) / max) * 100;
  const gw = (Math.max(0, val - base) / max) * 100;
  const fw = ((frunk || 0) / max) * 100;
  const gain = val - base;
  const gainVar = cls === 'r3' ? 's3' : cls === 'r4' ? 's2' : 's1';
  return (
    <div className="lgline">
      <div className="lglab">{lab}</div>
      <div className="lgtrack">
        <div className="lgbase" style={{ width: `${bw.toFixed(1)}%` }} />
        {gain > 0.05 && (
          <div className={cls ? `lggain ${cls}` : 'lggain'} style={{ left: `${bw.toFixed(1)}%`, width: `${gw.toFixed(1)}%` }} />
        )}
        {!!frunk && (
          <div
            className="lggain"
            style={{ left: `${(bw + gw).toFixed(1)}%`, width: `${fw.toFixed(1)}%`, background: 'var(--s6)' }}
          />
        )}
      </div>
      <div className="lgv">
        {val.toFixed(1)}
        {unit}
        {gain > 0.05 ? (
          <span style={{ color: `var(--${gainVar})` }}> +{gain.toFixed(1)}</span>
        ) : gain < -0.05 ? (
          <span style={{ color: 'var(--warn-text)' }}> {gain.toFixed(1)}</span>
        ) : null}
      </div>
    </div>
  );
};

export const TrophyIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" />
  </svg>
);

export const Assumptions = ({ S, setS, idp }) => {
  const set = (k, v) => setS((prev) => ({ ...prev, [k]: v }));
  return (
    <div className="card">
      <Slider
        id={`${idp}down`}
        label="Down payment"
        why={WHY.down}
        out={money(S.down)}
        min={0}
        max={25000}
        step={500}
        value={S.down}
        onChange={(v) => set('down', v)}
      />
      <Slider
        id={`${idp}miles`}
        label="Miles per year"
        why={WHY.miles}
        out={Math.round(S.miles).toLocaleString()}
        min={6000}
        max={35000}
        step={1000}
        value={S.miles}
        onChange={(v) => set('miles', v)}
      />
      <Slider
        id={`${idp}gas`}
        label="Gasoline"
        why={WHY.gas}
        out={`$${S.gas.toFixed(2)} / gal`}
        min={2}
        max={6}
        step={0.05}
        value={S.gas}
        onChange={(v) => set('gas', v)}
      />
      <Slider
        id={`${idp}kwh`}
        label="Electricity"
        why={WHY.kwh}
        out={`$${S.kwh.toFixed(3)} / kWh`}
        min={0.08}
        max={0.5}
        step={0.001}
        value={S.kwh}
        onChange={(v) => set('kwh', v)}
      />
      <Slider
        id={`${idp}elec`}
        label="Plug-in miles on battery"
        why={WHY.elec}
        out={`${Math.round(S.elec * 100)}%`}
        min={0}
        max={100}
        step={5}
        value={Math.round(S.elec * 100)}
        onChange={(v) => set('elec', v / 100)}
      />
      <Slider
        id={`${idp}chg`}
        label="Home charger install"
        why={WHY.charger}
        out={money(S.charger)}
        min={0}
        max={6000}
        step={100}
        value={S.charger}
        onChange={(v) => set('charger', v)}
      />
      <div className="ctrl">
        <label>Loan term</label>
        <div className="seg">
          {[48, 60, 72].map((t) => (
            <button key={t} type="button" aria-pressed={S.term === t} onClick={() => set('term', t)}>
              {t} mo
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
