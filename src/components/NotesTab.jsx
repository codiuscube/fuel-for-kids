import { Fragment } from 'react';
import { OWNER_GROUPS, FINANCE_OFFERS, LEASES, CHECKS, SOURCE_ROWS } from '../data/vehicles';

// ---------------------------------------------------------------------------
// Everything that used to sit between you and the cars. Same words, now folded
// into accordions so the page opens as a list of headlines you can scan in a
// couple of thumb-flicks rather than a wall you have to scroll past.
// ---------------------------------------------------------------------------

const Chevron = () => (
  <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Note = ({ title, blurb, children }) => (
  <details className="acc">
    <summary>
      <span className="acctxt">
        <span className="acct">{title}</span>
        <span className="accb">{blurb}</span>
      </span>
      <Chevron />
    </summary>
    <div className="accbody">{children}</div>
  </details>
);

const NotesTab = () => (
  <div className="notes">
    <p className="fine notesintro">
      The reasoning behind the numbers. Tap a heading to open it &mdash; nothing here is needed to use the list.
    </p>

    <Note title="What this is" blurb="The brief, the method, and what it is not">
    <div className="tldr">
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>The brief.</b> A family of five in New Braunfels replacing a 2017 Nissan Pathfinder with 100,000
        miles and an ageing CVT. Three kids, so seven seats with second-row captain&rsquo;s chairs, which puts
        two in the middle with a walkway and one in the back. Roughly 25,000 miles a year. Regular runs to the
        Gulf Coast, including drive-on beaches at Port Aransas. A liking for the lifted, all-wheel-drive look.
      </p>
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>What I did.</b> Started from every three-row vehicle that offers second-row captain&rsquo;s chairs,
        then priced 40 specific configurations &mdash; real listings where I could find them, market estimates
        where I could not &mdash; against five years of ownership at your actual mileage, your actual
        electricity rate, and Texas tax and fee rules. Costs recalculate live from the sliders, so nothing here
        is a fixed answer.
      </p>
      <p style={{ fontSize: '14px', margin: 0 }}>
        <b>What it is not.</b> Not a quote. Insurance, maintenance and resale are the three softest inputs and
        together they move the total more than anything else. Treat any gap under about $3,000 as a tie and
        decide on the test drive.
      </p>
    </div>
    </Note>

    <Note title="Seven things the research turned up" blurb="Fuel decides it; minivans win on space per dollar">
    <div className="tldr">
      <ul>
        <li>
          <b>At 25,000 miles a year, fuel is the deciding variable.</b> Five years is 125,000 miles. The spread
          between a 36 mpg Sienna and a 22 mpg Odyssey is about $6,600, and against a 17 mpg Tahoe it is
          $11,600. Efficiency matters roughly 1.7 times more for you than for an average driver.
        </li>
        <li>
          <b>Minivans give more space per dollar than SUVs, without exception.</b> The cheapest seven-seat SUV
          near you starts at $59,699 and offers five fewer inches of third-row legroom and thirteen fewer cubic
          feet than a Sienna costing $12,000 less. No SUV on this page beats a Sienna on five-year cost.
        </li>
        <li>
          <b>Resale is the largest single lever, bigger than price.</b> The Sienna loses only 29% over five
          years against a class average of 46%. That is why a $47,504 new Sienna costs less to own than a
          $40,499 used one over the same period.
        </li>
        <li>
          <b>No electric vehicle can give you seven seats with captain&rsquo;s chairs.</b> The EV9, Rivian R1S,
          Tesla Model X, Volvo EX90 and Ionic 9 all have two-seat third rows, so captain&rsquo;s chairs cap them
          at six. It is a structural limit of the segment, not a trim choice.
        </li>
        <li>
          <b>Leasing does not work at your mileage.</b> Every offer caps you at 10,000 miles a year. At 25,000
          you end a three-year term 45,000 miles over, costing $6,750 in penalties at Toyota&rsquo;s $0.15 a
          mile or $11,250 at Kia&rsquo;s $0.25 &mdash; and you finish owning nothing.
        </li>
        <li>
          <b>Buying older does not save money here.</b> A 2017 Sienna at $27,590 costs about $4,000 more over
          five years than a 2025 at $40,499, because 22 mpg and $9,000 of maintenance on a van heading to
          187,000 miles consume the entire saving.
        </li>
        <li>
          <b>Cost and reliability point in opposite directions at the bottom.</b> The cheapest option here is a
          Pacifica Hybrid at $21,990, and it is also the least reliable vehicle on the page. That is one
          sentence, not two.
        </li>
      </ul>
    </div>
    </Note>

    <Note title="The short version" blurb="Every finding, in one list">
    <div className="tldr">
      <ul>
        <li>
          <b>At 25,000 miles a year, fuel decides it.</b> 36 mpg versus 22 mpg is about $6,600 over five years.
          That knocks the Odyssey and gas Carnival out of contention despite their low prices.
        </li>
        <li>
          <b>Cheapest overall: 2024 Pacifica Hybrid Select, $21,990</b> — roughly $47.9k over five years, $276 a
          month. It is also the least reliable vehicle here, at 68,000 miles heading to 190,000. Lowest cost and
          highest risk are the same car.
        </li>
        <li>
          <b>Safest pick: Toyota Sienna.</b> New at $47,504 or a 2025 with 59k miles at $40,499. Best resale in
          the segment by a wide margin, average-or-better reliability, the biggest third row of anything on this
          list, and the only hybrid minivan offering AWD.
        </li>
        <li>
          <b>If you want the AWD stance: Sienna Woodland Edition, $55,750.</b> Standard AWD, 6.9 inches of
          clearance, matte-black wheels, and all-weather mats included, which fixes the Sienna&rsquo;s one real
          weakness.
        </li>
        <li>
          <b>SUVs cost more and give less.</b> The cheapest seven-seat SUV near you is a Grand Highlander Hybrid
          Limited at $59,699 — more money than any minivan here, with five fewer inches of third-row legroom and
          thirteen fewer cubic feet of cargo.
        </li>
        <li>
          <b>Your 2017 Pathfinder already has a good second row.</b> At 41.7&quot; it beats the Sienna, Odyssey,
          Carnival and Pacifica. What you&rsquo;re really buying is third row and boot: the Sienna adds
          8.0&quot; behind and 17.5 cu ft, while the Telluride adds only 1.4&quot; and 5.3 cu ft.
        </li>
        <li>
          <b>Going older doesn&rsquo;t pay here.</b> A 2017 Sienna at $27,590 costs about $61.5k over five years
          &mdash; more than a 2025 at $40,499 &mdash; because 22 mpg, higher interest, and $9,000 of maintenance
          on a 187,000-mile van eat the whole saving. Your mileage is what makes cheap old cars expensive.
        </li>
        <li>
          <b>The Kia EV9 seats six.</b> Cheapest to fuel by far, but its third row holds two people and it keeps
          only 32% of its price, the worst on this page.
        </li>
        <li>
          <b>Leasing doesn&rsquo;t work at your mileage.</b> Every lease caps you at 10,000 miles a year. At
          25,000 you finish a three-year term 45,000 miles over, which is $6,750 in penalties on a Toyota and
          $11,250 on a Kia &mdash; and you end owning nothing.
        </li>
        <li>
          <b>Rivian and Tesla are in as six-seaters, and both are expensive.</b> The cheapest R1S is $60,590 and
          lands near $92k over five years; the best-value Model X is a 2017 at $31,590 and still hits $63k
          because of battery-age risk and repair costs. The Land Rover Defender 130 is $126k over five years and
          uses a bench second row anyway. The Ineos Grenadier has no third row at all.
        </li>
        <li>
          <b>Hyundai&rsquo;s 2026 Palisade Hybrid is the value pick of the new SUVs.</b> 34 mpg, 43&quot; second
          row, captain&rsquo;s chairs standard on every seven-seat trim, and about $4,400 less than the Telluride
          Hybrid for the same platform and the same 10-year powertrain warranty.
        </li>
        <li>
          <b>For the off-road look with a hybrid, look at the Telluride X-Line SX.</b> $56,035, AWD standard,
          rugged styling, 33 mpg. It is the only vehicle here that pairs the lifted stance you want with
          efficiency that survives 25,000 miles a year, other than the Sienna Woodland.
        </li>
        <li>
          <b>Honda Pilot TrailSport is the real off-road trim.</b> Standard AWD, all-terrain tires, steel skid
          plates, and a 32.5&quot; third row. But 21 mpg costs you $6,700 more in fuel than a Sienna over five
          years.
        </li>
        <li>
          <b>If you drive on the beach, the minivans need care.</b> The Odyssey at 4.9&quot; and Pacifica at
          5.1&quot; of clearance are the wrong tool for soft sand. A Sienna Woodland has 6.9&quot; and standard
          AWD; the Telluride X-Line has 8.4&quot;. Both work; neither has a low range.
        </li>
        <li>
          <b>Texas charges EVs $200 a year.</b> That is $1,000 over five years on the EV9, Rivian and Tesla, now
          included below. Hybrids and plug-ins are exempt.
        </li>
        <li>
          <b>Sequoia is out on cost.</b> Both used ones land above $93k over five years — the highest here by
          $12,000 — because they start near $68,000 and hold only 11.5 cu ft behind the third row.
        </li>
        <li>
          <b>The 2027 Telluride Hybrid is the most interesting new option.</b> $50,035 with AWD, 34 mpg, a
          redesigned cabin with 43&quot; of second-row legroom, and about $63k over five years. It beats the
          Grand Highlander by $7,000.
        </li>
      </ul>
    </div>
    </Note>

    <Note title="Seat count and cleanability" blurb="The EV9 seats six; the Sienna is hardest to clean">
    <div className="note">
      <b>The Kia EV9 seats six, not seven.</b> Its third row holds two, so captain&rsquo;s chairs make it a
      six-seater. No three-row EV on sale gives seven seats with captain&rsquo;s chairs.
      <br />
      <br />
      <b>The Sienna is the hardest to clean.</b> Its second-row seats slide but don&rsquo;t come out, and
      there&rsquo;s carpet underneath. The Carnival and Odyssey both beat it: wipeable synthetic leather, third
      rows that fold into a floor well, and second rows you can remove or slide clear.
      <br />
      <br />
      <b>Check the second row on any listing.</b> Wagoneer Series II ships with a bench as standard. Carnival LX
      and LXS are bench-only, so you need EX or above. Carnival SX Prestige lounge seats don&rsquo;t fold or
      remove, which cancels its cargo advantage.
    </div>
    </Note>

    <Note title="Two traps in the older listings" blurb="Pre-2021 Siennas are V6; the Tahoe LS has a bench">
    <div className="note">
      <b>2017&ndash;2020 Sienna is the V6, not the hybrid.</b> The hybrid arrived in 2021. The older van gets 22
      mpg instead of 36, which at 25,000 miles a year costs $6,600 more in fuel over five years. It does have{' '}
      <b>more</b> cargo though &mdash; 39.1 cu ft behind the third row versus 33.5 &mdash; and AWD was
      available.
      <br />
      <br />
      <b>Tahoe LS ships with a second-row bench.</b> Captain&rsquo;s chairs are an option on that trim, so
      confirm on the specific car before you get attached to it.
    </div>
    </Note>

    <Note title="Leasing, and why it fails here" blurb="Every lease caps you at 10,000 miles a year">
    <p className="fine" style={{ marginBottom: '10px' }}>
      Every advertised lease caps you at 10,000 miles a year. You drive 25,000, so a 36-month lease runs
      45,000 miles over. Toyota charges $0.15 a mile, Kia $0.25.
    </p>
    <div className="card" style={{ padding: '14px 16px' }}>
      <div className="lgline" style={{ gridTemplateColumns: '1fr 92px 92px', marginBottom: '8px' }}>
        <div className="lglab">36-month lease</div>
        <div className="lgv" style={{ textAlign: 'right' }}>
          Advertised
        </div>
        <div className="lgv" style={{ textAlign: 'right' }}>
          Your miles
        </div>
      </div>
      {LEASES.map(([name, adv, yours]) => (
        <div className="lgline" style={{ gridTemplateColumns: '1fr 92px 92px' }} key={name}>
          <div style={{ fontSize: '13px' }}>{name}</div>
          <div className="lgv">{adv}</div>
          <div className="lgv" style={{ color: 'var(--warn-text)' }}>
            {yours}
          </div>
        </div>
      ))}
    </div>
    <p className="fine" style={{ marginTop: '10px' }}>
      Figures are due-at-signing plus payments, then plus mileage overage at 25,000 miles a year. Fuel,
      insurance and tax are extra on both sides. At the end you own nothing and start again.{' '}
      <b>
        A Sienna lease runs about $7,400 a year in payments and overage, before fuel and insurance. Buying works
        out to roughly $11,700 a year with everything included &mdash; and you finish holding a $25,000 asset
        instead of nothing.
      </b>{' '}
      Leasing looks cheaper per year only because the comparison leaves out the equity.
    </p>
    </Note>

    <Note title="Rivian, Tesla, Land Rover, Ineos" blurb="Six-seaters, benches, and one with no third row">
    <div className="note">
      <b>Six seats is fine, so Rivian and Tesla are in.</b> Both are below, cheapest and best of each. Like the
      EV9, their third rows hold two, so captain&rsquo;s chairs make them six-seaters.
      <br />
      <br />
      <b>Rivian R1S</b> just added second-row captain&rsquo;s chairs as an option, but that makes it a
      six-seater; seven requires the bench. Third row is two seats, 17.6 cu ft behind it, and the option runs
      $4,000&ndash;$6,000 because it forces package bundling.
      <br />
      <br />
      <b>Tesla Model X</b> is the same: six with captain&rsquo;s chairs, seven with a bench. Starts around
      $89,990, and the second-row chairs don&rsquo;t fold flat.
      <br />
      <br />
      <b>Land Rover Discovery and Defender 130</b> do seat seven and eight, but with a bench second row &mdash;
      I could not find a captain&rsquo;s-chair option on either, so confirm before you fall for one. A 2025
      Defender 130 S is in the list below anyway, and it comes out around $126k over five years, by far the most
      expensive thing here.
      <br />
      <br />
      <b>The British Land Rover lookalike is the Ineos Grenadier</b> &mdash; built by a chemicals company to
      replace the old Defender. It&rsquo;s a five-seater with no third row at all, so it&rsquo;s out on the
      first filter.
    </div>
    </Note>

    <Note title="What owners say, and what repairs cost" blurb="Owner scores and yearly repair bills, by model">
    <p className="fine" style={{ marginBottom: '10px' }}>
      Owner ratings are averaged from Kelley Blue Book, Edmunds and CarGurus consumer scores. Repair figures are
      RepairPal-style averages for unscheduled repairs and maintenance across all model years, so they describe
      the model over a lifetime rather than any one car.
    </p>
    <p className="fine swipe">Swipe the table sideways to see every column.</p>
    <div className="scroller">
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Owners</th>
            <th>Repairs/yr</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {OWNER_GROUPS.map((grp) => (
            <Fragment key={grp.g}>
              <tr className="grouprow">
                <td colSpan={4}>{grp.g}</td>
              </tr>
              {grp.rows.map(([name, owners, repairs, note]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="n">{owners}</td>
                  <td className="n">{repairs}</td>
                  <td style={{ textAlign: 'left' }}>{note}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
    <p className="fine" style={{ marginTop: '10px' }}>
      <b>Older isn&rsquo;t automatically cheaper.</b> An older car has cheap parts and any independent shop can
      work on it, but the repair <b>frequency</b> climbs. A 2017 Sienna costs less per visit than a 2026 one and
      visits far more often, which is why I load $9,000 into its five-year maintenance line versus $3,000 for
      the new one. The sweet spot is a 3&ndash;5 year old mainstream car: past the depreciation cliff, still
      inside the wear curve, parts still cheap.
    </p>
    <p className="fine">
      <b>Where old genuinely wins:</b> no dealer-only diagnostics, no proprietary modules, no battery pack with
      an expiry date. Where it loses at your mileage: you reach 187,000 miles in five years, and that is
      transmission, suspension and A/C compressor territory on anything.
    </p>
    </Note>

    <Note title="Driving on the beach" blurb="Clearance, tyre pressure, salt, and the permit">
    <div className="note">
      <b>Port Aransas and Mustang Island are drive-on beaches</b>, about two and a half hours from New
      Braunfels. Soft dry sand above the tide line is where two-wheel-drive vehicles get stuck, and a tow off
      the sand runs $150&ndash;$300. That makes AWD and ground clearance a real requirement rather than a
      styling preference.
      <br />
      <br />
      <b>Clearance is the number to watch, not the badge.</b> The Odyssey sits at 4.9 inches and the Pacifica at
      5.1 &mdash; both will drag on soft ruts. A standard Sienna has 6.3, the Woodland 6.9, the Carnival 6.8.
      The SUVs sit at 7.8&ndash;8.7, and the Telluride X-Pro reaches 9.1. Every card below now lists its figure.
      <br />
      <br />
      <b>AWD is not 4WD.</b> None of these have a low range or a locking differential. On sand that means airing
      tyres down to about 20 psi, keeping momentum, and not stopping on the soft stuff. Bring a pressure gauge
      and a way to reinflate.
      <br />
      <br />
      <b>Salt is the hidden cost.</b> Rinse the underbody after every beach trip. Salt corrosion is a leading
      reason older Gulf Coast cars fail inspection early, and it will show up in your resale figure. Nueces
      County also requires a beach parking permit, currently around $12 a year.
      <br />
      <br />
      <b>Sand makes cleanability matter more.</b> This is where the Woodland&rsquo;s standard all-weather floor
      and cargo mats earn their keep, and where the Sienna&rsquo;s non-removable second row with carpet
      underneath is the real drawback.
    </div>
    </Note>

    <Note title="Texas rules that change the maths" blurb="EV road fee, 6.25% tax, SPV, no Comal emissions test">
    <div className="note">
      <b>Battery EVs owe $200 a year in road-use fees.</b> Senate Bill 505, in effect since September 2023, adds
      $400 up front on a new EV&rsquo;s two-year registration and $200 at each renewal. Over five years
      that&rsquo;s $1,000, and it&rsquo;s now built into the EV9, Rivian and Tesla figures below. It does{' '}
      <b>not</b> apply to hybrids or plug-in hybrids, so the Sienna, Pacifica and CX-90 are exempt.
      <br />
      <br />
      <b>Sales tax is a flat 6.25% statewide, minus your trade-in.</b> No county or city add-on, unlike ordinary
      Texas sales tax. The trade-in credit only applies when the sale and the trade happen in the same
      transaction at a licensed dealer.
      <br />
      <br />
      <b>Buying from a private seller? Watch the SPV rule.</b> Tax is charged on the higher of what you paid or
      80% of the state&rsquo;s Standard Presumptive Value. Agreeing on a low price with a private seller
      doesn&rsquo;t lower your tax bill. Dealer and Carvana purchases are taxed on the actual price.
      <br />
      <br />
      <b>Comal County has no emissions test.</b> Texas dropped annual safety inspections in January 2025,
      replacing them with a $7.50 fee at registration. Emissions testing still applies in 17 counties &mdash;
      Travis and Bexar among them, but not Comal. If you register in New Braunfels you skip it entirely.
      <br />
      <br />
      <b>No annual vehicle property tax.</b> Registration runs about $75&ndash;$90 a year regardless of what the
      car is worth, so an expensive car costs no more to keep on the road than a cheap one.
    </div>
    </Note>

    <Note title="Financing found, August 2026" blurb="Manufacturer APR offers and used-car rates">
    <div className="offers">
      {FINANCE_OFFERS.map(([brand, rate, note]) => (
        <div className="offer" key={brand + rate}>
          <b>{brand}</b>
          <em>{rate}</em>
          <span>{note}</span>
        </div>
      ))}
    </div>
    </Note>

    <Note title="All-wheel drive" blurb="It narrows the minivans to one">
    <div className="note">
      <b>AWD narrows the minivans to one.</b> The Sienna is the only hybrid minivan offering it, at
      $890&ndash;$2,000 depending on trim and costing 1 mpg. Carnival and Odyssey are front-drive only. The
      Pacifica offers AWD but <b>not</b> on the plug-in hybrid, so you&rsquo;d give up the electric range to get
      it.
      <br />
      <br />
      <b>The Woodland Edition is the one to look at.</b> Standard AWD, 6.9 inches of ground clearance instead of
      6.3, matte-black wheels, black badging, roof rails, and a 3,500-lb tow hitch. It also comes standard with
      all-weather floor and cargo mats, which helps the Sienna&rsquo;s one real weakness. $52,695 new.
      <br />
      <br />
      Every SUV here offers AWD or 4WD. On the EV9, the base Light is rear-drive &mdash; AWD starts at the Wind
      trim, which is also where the price climbs.
    </div>
    </Note>

    <Note title="What to check before you buy" blurb="The questions that move the decision most">
    <div className="tldr">
      {CHECKS.map((grp, i) => (
        <Fragment key={grp.g}>
          <p className="fine" style={{ margin: '0 0 8px' }}>
            <b>{grp.g}</b>
          </p>
          <ul style={i === CHECKS.length - 1 ? { margin: 0 } : { marginBottom: '14px' }}>
            {grp.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
    </Note>

    <Note title="Where every number comes from" blurb="Source and confidence for each figure">
    <p className="fine swipe">Swipe the table sideways to see every column.</p>
    <div className="scroller">
      <table>
        <thead>
          <tr>
            <th>Figure</th>
            <th>Source</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {SOURCE_ROWS.map(([figure, source, confidence]) => (
            <tr key={figure}>
              <td>{figure}</td>
              <td style={{ textAlign: 'left' }}>{source}</td>
              <td style={{ textAlign: 'left' }}>{confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="fine" style={{ marginTop: '10px' }}>
      The three softest lines are insurance, maintenance and resale, and together they move the five-year total
      more than anything else. Treat gaps under about $3,000 between two options as a tie.
    </p>
    </Note>

    <Note title="Before you decide" blurb="The long-form caveats, one at a time">
    <p className="fine">
      <b>Older cars lose on your mileage.</b> The 2017 Expedition at $24,990 has the second-lowest payment on
      this page at $369, and lands at roughly $68.7k over five years &mdash; $10,000 worse than a brand-new
      Sienna. At 17 mpg and 125,000 miles you&rsquo;d burn $22,059 in fuel alone. The 2023 Tahoe LS is worse
      still at about $81.5k. Cheap purchase price stops mattering when you drive this much.
    </p>
    <p className="fine">
      <b>Of the older options, the 2017 Sienna is the only defensible one.</b> $27,590, an $417 payment, and
      Toyota&rsquo;s most reliable minivan generation. It still costs $4,000 more over five years than a 2025
      hybrid, but if the monthly number is what matters, that&rsquo;s the one to look at.
    </p>
    <p className="fine">
      <b>25,000 miles a year changes the question.</b> That&rsquo;s 125,000 miles in five years, which does two
      things: fuel becomes the dominant running cost, and every car&rsquo;s resale takes a hit for the mileage.
      Efficiency now matters roughly 1.7x more than it did at 15,000, and the gap between a 36 mpg Sienna and a
      22 mpg Odyssey widens to about $8,900 in fuel alone.
    </p>
    <p className="fine">
      <b>The new Grand Highlander is pricier than I modeled.</b> Local inventory starts at $59,699 for the
      Limited, which is the cheapest trim with captain&rsquo;s chairs &mdash; not the $50,000 base I used. That
      pushes the best SUV well clear of every minivan.
    </p>
    <p className="fine">
      <b>The used Pacifica Hybrids are far cheaper than I assumed.</b> A 2024 Select with 68k miles is listed at
      $21,990 &mdash; roughly $10,000 under my earlier estimate. That makes it the cheapest thing on the list at
      about $42k net, with a $276 payment. It is also the least reliable vehicle here, at 68,000 miles heading
      to 143,000, which is why I raised its maintenance line to $7,500. This is the highest-risk, lowest-cost
      option and you should treat those as the same sentence.
    </p>
    <p className="fine">
      <b>Resale reorders everything.</b> The Sienna loses only 29% over five years, best in the segment by a
      wide margin, so a $47,000 new one is worth roughly $32,000 when you sell. That makes the new Sienna the
      cheapest thing on this list despite the highest sticker and no factory financing.
    </p>
    <p className="fine">
      <b>If you want the AWD stance, the Woodland Edition is the answer.</b> It costs about $3,700 more over
      five years than the plain XLE and still beats every SUV on the list. You get the lifted look, standard
      all-weather mats, and a tow hitch, and you keep the Sienna&rsquo;s resale and reliability.
    </p>
    <p className="fine">
      <b>No SUV beats a minivan here.</b> The best SUV on five-year cost is the new Grand Highlander Hybrid, and
      it still trails both Siennas while offering 5 fewer inches of third-row legroom and 13 fewer cubic feet of
      cargo.
    </p>
    <p className="fine">
      <b>The EV9 is the opposite bet from the Sienna.</b> It depreciates 63% in five years, the worst here, and
      Consumer Reports rates it Kia&rsquo;s least reliable model. Cheap to run, expensive to own, six seats.
    </p>
    <p className="fine">
      <b>The Pacifica Hybrid is the risk you&rsquo;d take for a low payment.</b> Cheapest monthly, great to
      clean, best fuel cost of the seven-seaters, and dead last in CR&rsquo;s minivan reliability on powertrain
      and electronics. The $5,500 maintenance figure may be optimistic.
    </p>
    <p className="fine">
      <b>The cheap Wagoneers stay a trap.</b> Best room of anything here and a low payment, but 70,000 miles at
      20 mpg, a weak record, carpet everywhere, and 42% retention put them last.
    </p>
    <p className="fine">
      <b>The Carnival Hybrid is the reliability winner but not the value one.</b> A 2025 SX with 17k miles is
      listed at $48,590 &mdash; Consumer Reports&rsquo; top-rated minivan, but you pay nearly new-car money for
      a used one, and it comes out around $61k. Worth watching as prices fall.
    </p>
    <p className="fine">
      <b>Resale is an estimate, not a promise.</b> Each card&rsquo;s year-five figure starts from published
      five-year depreciation data for that model, then discounts it about 11% per extra 25,000 miles you drive.
      At 25,000 a year everything here is marked down 22% from what it would fetch at normal mileage. Condition,
      accident history and colour move it further.
    </p>
    <p className="fine">
      <b>Why &ldquo;value kept&rdquo; flatters used cars.</b> The percentage is measured against what <b>you</b>{' '}
      pay, not the original sticker. A used EV9 keeps 32% of $37,990 because the first owner already absorbed
      the drop from $56,000. A new Sienna keeps 53% of $47,504. Kia&rsquo;s EV9 still has the worst depreciation
      of anything here in absolute terms &mdash; roughly 63% from new over five years &mdash; it just
      doesn&rsquo;t look that way when you buy it second-hand.
    </p>
    <p className="fine">
      <b>Where this is soft.</b> Reliability and cleanability are my scores from published ratings and interior
      features, not measurements. Insurance and maintenance are type-based estimates, not quotes.
    </p>
    </Note>
  </div>
);

export default NotesTab;
