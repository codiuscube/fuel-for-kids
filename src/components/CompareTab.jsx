import { Fragment, useMemo, useState } from 'react';
import { MATRIX, PRESETS, RELIABILITY_GROUPS, SPECS } from '../data/vehicles';
import { CGMAX, LGMAX } from '../lib/cost';
import { KeyItem, LgLine, MxBar } from './pieces';

// ---------------------------------------------------------------------------
// The Compare tab: your current car versus everything else, the at-a-glance
// bar matrix, and the two reference tables. Split out of the main view so the
// Cars tab stays about finding a car.
// ---------------------------------------------------------------------------

const SUB = [
  { id: 'yours', label: 'vs yours' },
  { id: 'glance', label: 'At a glance' },
  { id: 'tables', label: 'Tables' },
];

const CompareTab = ({ base, baseSel, setBaseFromSelect, setBaseField }) => {
  const [sub, setSub] = useState('yours');
  const [mxSort, setMxSort] = useState(5);

  const matrixRows = useMemo(
    () => [...MATRIX, ['suv', `${base.name} — yours`, base.leg2 + base.leg3, base.cargo, base.mpg, 50]],
    [base],
  );

  const legroomRows = useMemo(() => {
    const rows = SPECS.filter((r) => r[1] !== base.name)
      .map((r) => [r[1] + (r[2] < 7 ? ` (${r[2]} seats)` : ''), r[3], r[4], r[5], r[7] || 0])
      .sort((x, y) => y[2] - x[2]);
    rows.push([`${base.name} — yours`, base.leg2, base.leg3, base.cargo, base.frunk || 0]);
    return rows;
  }, [base]);

  return (
    <div className="compare">
      <div className="subnav" role="tablist">
        {SUB.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={sub === s.id} onClick={() => setSub(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {sub === 'yours' && (
        <section>
          <h2>Versus your current car</h2>
    <div className="card" style={{ marginBottom: '14px' }}>
      <div className="ctrl">
        <label htmlFor="veh-baseSel">Your current car</label>
        <select
          id="veh-baseSel"
          style={{ marginTop: '6px' }}
          value={baseSel}
          onChange={(e) => setBaseFromSelect(e.target.value)}
        >
          <optgroup label="Minivans on this page">
            {SPECS.map((r, i) =>
              r[0] === 'van' ? (
                <option key={r[1]} value={`s${i}`}>
                  {r[1]}
                </option>
              ) : null,
            )}
          </optgroup>
          <optgroup label="SUVs on this page">
            {SPECS.map((r, i) =>
              r[0] === 'suv' ? (
                <option key={r[1]} value={`s${i}`}>
                  {r[1]}
                </option>
              ) : null,
            )}
          </optgroup>
          <optgroup label="Other common trade-ins">
            {PRESETS.map((p, i) => (
              <option key={p[0]} value={`p${i}`}>
                {p[0]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Manual">
            <option value="x">Custom</option>
          </optgroup>
        </select>
      </div>
      <div className="bgrid">
        <div>
          <label htmlFor="veh-b2">2nd row, in</label>
          <input
            type="number"
            id="veh-b2"
            step="0.1"
            value={base.leg2}
            onChange={(e) => setBaseField('leg2', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="veh-b3">3rd row, in</label>
          <input
            type="number"
            id="veh-b3"
            step="0.1"
            value={base.leg3}
            onChange={(e) => setBaseField('leg3', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="veh-bc">Boot, cu ft</label>
          <input
            type="number"
            id="veh-bc"
            step="0.1"
            value={base.cargo}
            onChange={(e) => setBaseField('cargo', e.target.value)}
          />
        </div>
      </div>
      <p className="fine" style={{ margin: '10px 0 0' }}>
        Pick a preset or type your own numbers. Everything below, and the &ldquo;vs yours&rdquo; figures on each
        card, update to match.
      </p>
    </div>
    <p className="fine" style={{ marginBottom: '10px' }}>
      Grey is what your {base.name} gives you today &mdash; {base.leg2.toFixed(1)}&quot; in the second row,{' '}
      {base.leg3.toFixed(1)}&quot; in the third. Colour is what you would gain.
    </p>
    <div className="lg">
      {legroomRows.map((r) => (
        <div className="lgrow" key={r[0]}>
          <div className="lgname">
            {r[0]}
            {r[4] ? ` · +${r[4].toFixed(1)} frunk` : ''}
          </div>
          <LgLine lab="2nd" base={base.leg2} val={r[1]} max={LGMAX} cls="" unit={'"'} frunk={0} />
          <LgLine lab="3rd" base={base.leg3} val={r[2]} max={LGMAX} cls="r3" unit={'"'} frunk={0} />
          <LgLine lab="boot" base={base.cargo} val={r[3]} max={CGMAX} cls="r4" unit=" cu ft" frunk={r[4]} />
        </div>
      ))}
    </div>
        </section>
      )}

      {sub === 'glance' && (
        <section>
          <h2>At a glance</h2>
    <p className="fine" style={{ marginBottom: '10px' }}>
      Longer bar is better. Tap a column heading to sort by it. Room combines second- and third-row legroom;
      Value is the share of price still there at year five.
    </p>
    <div className="key" style={{ marginBottom: '12px' }}>
      <KeyItem color="s1" label="Room" />
      <KeyItem color="s2" label="Cargo" />
      <KeyItem color="s3" label="MPG" />
      <KeyItem color="s4" label="Value kept" />
    </div>
    <div className="mx">
      <div className="mxg">
        <div className="mxh" />
        {[
          ['Room', 2],
          ['Cargo', 3],
          ['MPG', 4],
          ['Value', 5],
        ].map(([lab, k]) => (
          <button
            key={k}
            type="button"
            className="mxh"
            aria-pressed={mxSort === k}
            onClick={() => setMxSort(k)}
          >
            {lab}
          </button>
        ))}
        {['van', 'suv'].map((cat) => (
          <Fragment key={cat}>
            <div className="mxsec">{cat === 'van' ? 'Minivans' : 'SUVs'}</div>
            {matrixRows
              .filter((r) => r[0] === cat)
              .slice()
              .sort((a, b) => {
                const x = a[mxSort];
                const y = b[mxSort];
                if (x === null) return 1;
                if (y === null) return -1;
                return y - x;
              })
              .map((r) => (
                <Fragment key={r[1]}>
                  <div className="mxn">{r[1]}</div>
                  <MxBar frac={(r[2] - 62) / 18} color="s1" />
                  <MxBar frac={(r[3] - 10) / 32} color="s2" />
                  {r[4] === null ? (
                    <div className="mxe">electric</div>
                  ) : (
                    <MxBar frac={(r[4] - 14) / 26} color="s3" />
                  )}
                  <MxBar frac={(r[5] - 30) / 45} color="s4" />
                </Fragment>
              ))}
          </Fragment>
        ))}
      </div>
    </div>
        </section>
      )}

      {sub === 'tables' && (
        <>
          <section>
            <h2>Reliability, cleanability, resale</h2>
    <p className="fine" style={{ marginBottom: '8px' }}>
      Reliability follows Consumer Reports predicted ratings and recall history. Cleanability weighs wipeable
      seat material, seats that stow or remove, a low flat floor, and a built-in vacuum.
    </p>
    <p className="fine swipe">Swipe the table sideways to see every column.</p>
    <div className="scroller">
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Reliab.</th>
            <th>Clean</th>
            <th>Keeps</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {RELIABILITY_GROUPS.map((grp) => (
            <Fragment key={grp.g}>
              <tr className="grouprow">
                <td colSpan={5}>{grp.g}</td>
              </tr>
              {grp.rows.map(([name, rel, clean, keeps, note, six]) => (
                <tr key={name} className={six ? 'six' : undefined}>
                  <td>{name}</td>
                  <td className="n">{rel}</td>
                  <td className="n">{clean}</td>
                  <td className="n">{keeps}</td>
                  <td style={{ textAlign: 'left' }}>{note}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
    <p className="fine" style={{ marginTop: '8px' }}>
      Resale figures for the Sienna, Odyssey, Carnival, Pacifica and EV9 come from iSeeCars five-year
      depreciation data. The rest are my estimates from segment averages.
    </p>
          </section>
          <section>
            <h2>Every vehicle considered</h2>
    <p className="fine" style={{ marginBottom: '6px' }}>
      Inches and cubic feet, with second-row captain&rsquo;s chairs. Any of these can be set as your comparison
      car above.
    </p>
    <p className="fine swipe">Swipe the table sideways to see every column.</p>
    <div className="scroller">
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Seats</th>
            <th>2nd leg</th>
            <th>3rd leg</th>
            <th>Cargo</th>
            <th>MPG</th>
          </tr>
        </thead>
        <tbody>
          {['van', 'suv'].map((cat) => (
            <Fragment key={cat}>
              <tr className="grouprow">
                <td colSpan={6}>{cat === 'van' ? 'Minivans' : 'SUVs'}</td>
              </tr>
              {SPECS.filter((r) => r[0] === cat).map((r) => (
                <tr key={r[1]} className={r[2] < 7 ? 'six' : undefined}>
                  <td>{r[1]}</td>
                  <td className="n">{r[2]}</td>
                  <td className="n">{r[3].toFixed(1)}</td>
                  <td className="n">{r[4].toFixed(1)}</td>
                  <td className="n">{r[5].toFixed(1)}</td>
                  <td className="n">{r[6]}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CompareTab;
