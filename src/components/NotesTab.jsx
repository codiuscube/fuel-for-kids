import { Fragment } from 'react';
import { OWNER_GROUPS, FINANCE_OFFERS, CHECKS, SOURCE_ROWS } from '../data/vehicles';
import { DEFAULT_ASSUMPTIONS } from '../lib/cost';
import { FIG5, FIG15, leaseRows, overMiles } from '../lib/figures';

// ---------------------------------------------------------------------------
// Everything that used to sit between you and the cars, folded into accordions
// so the page opens as a list of headlines you can scan in a couple of
// thumb-flicks rather than a wall you have to scroll past.
//
// Every dollar figure and rank in this prose that depends on the model is
// computed from it (see src/lib/figures.js) at the default assumptions, so a
// sentence here always agrees with the card it is talking about. Prices,
// specs, statute and offers are still typed in, because they do not move
// when a slider does.
// ---------------------------------------------------------------------------

const F = FIG5;
const G = FIG15;
const N = F.named;
const N15 = G.named;
const $ = F.k;
const money = F.money;
const MI = DEFAULT_ASSUMPTIONS.miles;
const miK = `${Math.round(MI / 1000)},000`;

const ord = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const kmi = (mi) => `${Math.round(mi / 1000)},000`;
const gap = (a, b) => money(Math.abs(a - b));
const perMo = (v, years = 5) => money(v / (years * 12));

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

const leases = leaseRows();
const over = overMiles();

const NotesTab = () => (
  <div className="notes">
    <p className="fine notesintro">
      The reasoning behind the numbers. Tap a heading to open it &mdash; nothing here is needed to use the list.
      Figures in these notes are computed from the same model as the cards, at the default assumptions.
    </p>

    <Note title="What this is" blurb="The brief, the method, and what it is not">
    <div className="tldr">
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>The brief.</b> A family of five in New Braunfels replacing a 2017 Nissan Pathfinder, bought in 2022
        with about 50,000&ndash;60,000 miles and now at 100,000, with an ageing CVT. Three kids, almost 15, 12
        and 9, all likely to reach six feet. Seven seats with second-row captain&rsquo;s chairs is the starting
        point, which puts two in the middle with a walkway and one in the back. Regular runs to the Gulf Coast,
        including drive-on beaches at Port Aransas. A liking for the lifted, all-wheel-drive look.
      </p>
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>The mileage.</b> The Pathfinder has averaged about 11,000 miles a year since 2022. The model
        defaults to {miK}, a round figure with headroom for a new school run and a teen driver. An earlier
        version of this page assumed 25,000, and that one assumption did most of the work in its conclusions:
        it made fuel the deciding line and made every old car look expensive. Drag the slider back to 25,000 to
        see that world; check a year of odometer before you trust either number.
      </p>
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>Two horizons.</b> Five years sells the car at its published resale figure. Fifteen years runs it into
        the ground, which is closer to how this family has actually owned cars. The 15-year view keeps charging
        repairs on the same curve rather than buying a replacement, so a card that says &ldquo;250k mi in yr
        11&rdquo; is telling you the model is being generous to it from that year on.
      </p>
      <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
        <b>What I did.</b> Started from every three-row vehicle sold in Texas that offers second-row
        captain&rsquo;s chairs on some trim, then priced {F.count} specific listings &mdash; real cars where I
        could find them, market estimates where I could not &mdash; against ownership at your mileage, your
        electricity rate, and Texas tax and fee rules. Costs recalculate live from the sliders, so nothing here
        is a fixed answer.
      </p>
      <p style={{ fontSize: '14px', margin: 0 }}>
        <b>What it is not.</b> Not a quote. Insurance and resale are the softest inputs; maintenance is a
        formula from age, miles and remaining warranty, still an estimate. Together they move the total more
        than anything else. Treat any gap under about $3,000 over five years as a tie and decide on the test
        drive. Best overall is a mix you set. Seven seats and captain&rsquo;s chairs are weights in that mix, not
        filters, so six-seaters and benches stay on the list and are scored down rather than hidden. COVID-year
        builds (2020&ndash;2022) are demoted on the podium. The numbered list is still cheapest first until you
        change the sort.
      </p>
    </div>
    </Note>

    <Note title="What the research turned up" blurb="Cost barely separates the sensible vans; fit, safety and how long you keep it do">
    <div className="tldr">
      <ul>
        <li>
          <b>At {miK} miles a year, fuel is a tiebreaker, not the decider.</b> Five years is {kmi(F.miles)} miles.
          The spread between a 36 mpg Sienna and a 22 mpg Odyssey is {money(F.fuelGap(36, 22))}, and against a
          17 mpg Tahoe it is {money(F.fuelGap(36, 17))}. At 25,000 a year those gaps were $6,600 and $11,600, and
          the page used to say efficiency mattered 1.7 times more for you than for an average driver. At your
          real mileage it matters about as much as it does for anyone.
        </li>
        <li>
          <b>Nearly every sensible van costs about the same to own.</b> The twenty cheapest cars on the page are
          spread across {$(F.spreadTop20)} over five years, about {perMo(F.spreadTop20)} a month. Insurance
          alone could swing $4,000 either way. Cost does not pick the van for you; it tells you which four or
          five to go and sit in.
        </li>
        <li>
          <b>Fifteen years changes the question.</b> Run to the ground, a new Sienna XLE costs about{' '}
          {$(N15.siennaNew.net)}, {money(N15.siennaNew.perYear)} a year, and finishes at{' '}
          {kmi(N15.siennaNew.endMiles)} miles. A 2016 Odyssey costs {$(N15.odyssey2016.net)},{' '}
          {money(N15.odyssey2016.perYear)} a year, and finishes at {kmi(N15.odyssey2016.endMiles)} miles, having
          passed 250,000 in year {N15.odyssey2016.pastLife}. The gap is {gap(N15.siennaNew.perYear, N15.odyssey2016.perYear)}{' '}
          a year for a van nine years newer with a modern safety suite, and the model is not charging the old
          van for the replacement it would realistically need.
        </li>
        <li>
          <b>Minivans give more space per dollar than SUVs, without exception.</b> The cheapest new seven-seat SUV
          near you is a Grand Highlander Hybrid at $59,699, with five fewer inches of third-row legroom and
          thirteen fewer cubic feet than a Sienna costing $12,000 less. It lands {ord(N.grandHighlander.rank)} on
          five-year cost at {$(N.grandHighlander.net)}. The one thing an SUV wins outright is absolute boot
          space &mdash; a Suburban&rsquo;s 41.5 cu ft is the most here &mdash; and it costs about{' '}
          {gap(F.named.tahoeLTNew ? F.named.tahoeLTNew.net : 0, N.siennaNew.net)} more than a new Sienna over
          five years to get it in a new Tahoe.
        </li>
        <li>
          <b>Resale is what keeps a new Sienna in the race.</b> It loses only 29% over five years against a class
          average of 46%, which is why a new XLE at $47,504 lands at {$(N.siennaNew.net)},{' '}
          {ord(N.siennaNew.rank)} of {F.count}, within {gap(N.siennaNew.net, N.sienna2023.net)} of a 2023 hybrid
          with 67,000 miles.
        </li>
        <li>
          <b>The Carnival Hybrid &ldquo;tie&rdquo; was a bench.</b> The 2026 Carnival Hybrid EX at $42,090 lands
          at {$(N.carnivalHybEx2026.net)}, {gap(N.carnivalHybEx2026.net, N.siennaNew.net)} from a new Sienna XLE,
          but 2025&ndash;2026 EX and SX carry sliding eight-passenger seats, not captain&rsquo;s chairs. The only
          hybrid Carnival with real captains is the 2027 SX at $50,864, which lands at{' '}
          {$(N.carnivalHybSx2027cap.net)}, {gap(N.carnivalHybSx2027cap.net, N.siennaNew.net)} behind the Sienna.
          Hold the brief to captains and it is not a tie.
        </li>
        <li>
          <b>There is no government incentive on a Carnival, and there is one on a Sienna.</b> Every federal
          clean-vehicle purchase credit ended for cars acquired after 30 September 2025, and a Carnival never
          qualified regardless &mdash; it has no plug. What is left is the auto-loan interest deduction, up to
          $10,000 a year for tax years 2025&ndash;2028, and it requires final assembly in the United States. The
          Sienna is built in Princeton, Indiana. The Carnival is shipped from Gwangmyeong, South Korea.
        </li>
        <li>
          <b>No electric vehicle can give you seven seats with captain&rsquo;s chairs.</b> The EV9, Rivian R1S,
          Tesla Model X, Volvo EX90, Hyundai Ioniq 9, Cadillac Vistiq and VW ID. Buzz all pair captain&rsquo;s
          chairs with a two-seat third row; the seven-seat version of each swaps in a bench. It is a structural
          limit of the segment, not a trim choice. All seven are priced below as six-seaters and scored down for
          the missing seat, so you can see what it costs.
        </li>
        <li>
          <b>Leasing still fails, for a different reason.</b> Every offer caps you at 10,000 miles a year. At{' '}
          {miK} you end a three-year term {kmi(over)} miles over, which is {money(over * 0.15)} at
          Toyota&rsquo;s $0.15 a mile or {money(over * 0.25)} at Kia&rsquo;s $0.25 &mdash; survivable. The real
          problem is that you keep cars for nine years and a lease hands the car back at three, owning nothing.
        </li>
        <li>
          <b>Buying older is a real bet at your mileage.</b> A 2016 Odyssey at $16,590 is the cheapest thing on
          the page at {$(N.odyssey2016.net)} over five years, and it finishes at {kmi(N.odyssey2016.endMiles)}{' '}
          miles, which is ordinary for a Honda. A 2017 Sienna V6 at {$(N.sienna2017.net)} lands within{' '}
          {gap(N.sienna2017.net, N.siennaNew.net)} of a brand-new hybrid. What you give up is a decade of safety
          engineering, a warranty, and the certainty of not shopping again in a few years.
        </li>
        <li>
          <b>Cost and reliability point in opposite directions at the bottom.</b> The second-cheapest option is a
          Pacifica Hybrid at $22,990, and it is also the least reliable vehicle on the page. Its known-issue line
          carries a 6% chance of a $17,000 battery outside warranty, which the total shows as about a thousand
          dollars. Read it as a one-in-sixteen chance of writing off the van.
        </li>
      </ul>
    </div>
    </Note>

    <Note title="Three teenagers heading for six feet" blurb="What the kids' ages do to the brief">
    <div className="note">
      <b>Third-row legroom is the primary spec now, not a bonus.</b> A 32-inch third row on a Telluride,
      Palisade or Pilot is a children&rsquo;s seat. A six-foot teenager needs 36 inches or more, which on this
      page means the Sienna (38.7), Odyssey (38.1), Expedition (37.7), Suburban and Yukon XL (36.7), and the
      Navigator (36.1). The Carnival is 35.6. Sort the list by third row and the SUVs mostly disappear.
      <br />
      <br />
      <b>The seven-seat years are short.</b> Your oldest is likely out of the house around 2030, the middle one
      around 2033, the youngest around 2036. On a fifteen-year hold that is four years as a three-kid van and
      eleven as a two-to-four-person car. Two ways to read that: buy the car you would still want as
      empty-nesters, or buy a cheap capable van for the heavy years and the long-term car afterwards. The
      page does not model the two-phase plan; it is worth a conversation.
      <br />
      <br />
      <b>A teen driver arrives within a year.</b> That is the strongest argument on this page for a newer car:
      standard automatic emergency braking, blind-spot warning and a good crash record matter more with a
      16-year-old at the wheel than any line in the cost model. It also means insurance will jump regardless
      of which van you buy, and the estimate here does not include a teen on the policy.
      <br />
      <br />
      <b>Captain&rsquo;s chairs put a kid alone in the back every day.</b> With three teenagers in a seven-seater,
      one rides in row three and the boot behind it is what you get for luggage. An eight-seat bench keeps all
      three in row two and folds row three for cargo. The 2021-on Sienna eight-seater has a removable middle
      seat, which gives you both layouts in one van &mdash; confirm it on the specific trim.
      <br />
      <br />
      <b>Car seats are gone, so the checklist changed.</b> Nobody needs to climb past a booster. The test-drive
      question is whether the fifteen-year-old can sit in the third row for twenty minutes without complaint,
      and whether three tall kids can get in and out of a sliding door in a school car park.
    </div>
    </Note>

    <Note title="Car-by-car notes" blurb="The specific cars people keep asking about">
    <div className="tldr">
      <ul>
        <li>
          <b>Cheapest overall: 2016 Odyssey EX-L, $16,590</b> &mdash; about {$(N.odyssey2016.net)} over five
          years, {money(N.odyssey2016.pmt)} a month, finishing at {kmi(N.odyssey2016.endMiles)} miles. No automatic
          braking, no blind-spot warning, a nine-year-old crash structure. Cheap and honest about it.
        </li>
        <li>
          <b>Cheapest of the modern vans: 2024 Pacifica Hybrid Select, $22,990</b> &mdash; roughly{' '}
          {$(N.pacifica2024_57k.net)} over five years, {money(N.pacifica2024_57k.pmt)} a month, and the least
          reliable vehicle here. Lowest cost and highest risk are the same car.
        </li>
        <li>
          <b>Safest bet: Toyota Sienna.</b> New at $47,504 for {$(N.siennaNew.net)}, or a 2023 hybrid with 67,000
          miles at $38,990 for {$(N.sienna2023.net)}. Best resale in the segment by a wide margin, the biggest
          third row of anything on this list, and the only hybrid minivan offering AWD.
        </li>
        <li>
          <b>If you want the AWD stance: Sienna Woodland Edition, $55,750.</b> Standard AWD, 6.9 inches of
          clearance, all-weather mats included. It costs {gap(N.woodland.net, N.siennaNew.net)} more than the XLE
          over five years, {$(N.woodland.net)} in all, and still beats every new SUV on the list.
        </li>
        <li>
          <b>Your 2017 Pathfinder already has a good second row.</b> At 41.7&quot; it beats the Sienna, Odyssey,
          Carnival and Pacifica. What you are really buying is third row and boot: the Sienna adds 8.0&quot;
          behind and 17.5 cu ft, while the Telluride adds only 1.4&quot; and 5.3 cu ft.
        </li>
        <li>
          <b>The Kia EV9 seats six.</b> Cheapest to fuel by far &mdash; {money(N.ev9_2024.fuel)} over five years
          against {money(N.siennaNew.fuel)} for a Sienna &mdash; but its third row holds two and it keeps only 32%
          of its price, the worst on this page.
        </li>
        <li>
          <b>Hyundai&rsquo;s 2026 Palisade Hybrid is the value pick of the new SUVs.</b> 34 mpg, 43&quot; second
          row, captain&rsquo;s chairs standard on every seven-seat trim, {$(N.palisadeHyb.net)} over five years,
          and {gap(N.palisadeHyb.net, N.tellurideHyb2027.net)} less than the 2027 Telluride Hybrid for the same
          platform and the same 10-year powertrain warranty. Its 32.1-inch third row is the catch for your kids.
        </li>
        <li>
          <b>For the off-road look with a hybrid, the Telluride X-Line SX</b> at $56,035 pairs the lifted stance
          with 33 mpg, at {$(N.tellurideXLine.net)} over five years. Same third-row catch.
        </li>
        <li>
          <b>Honda Pilot TrailSport is the real off-road trim.</b> Standard AWD, all-terrain tyres, steel skid
          plates, and a 32.5&quot; third row. At 21 mpg it burns {gap(N.pilotTrailSport.fuel, N.siennaNew.fuel)}{' '}
          more than a Sienna over five years.
        </li>
        <li>
          <b>The 2023 Sequoias are out on cost.</b> Both used hybrids land above {$(Math.min(N.sequoiaLtd2023.net, N.sequoiaPlat2023.net))}{' '}
          over five years because they start near $68,000 and hold only 11.5 cu ft behind the third row. The two
          2016 SR5s are a different car: old body, 18.9 cu ft, about $21k&ndash;$22k to buy, 15 mpg, and a bench
          second row, so they fail the brief before the fuel bill.
        </li>
        <li>
          <b>The 2027 Telluride Hybrid</b> is $50,035 with AWD, 34 mpg, a redesigned cabin with 43&quot; of
          second-row legroom, and {$(N.tellurideHyb2027.net)} over five years, {gap(N.tellurideHyb2027.net, N.grandHighlander.net)}{' '}
          under the Grand Highlander.
        </li>
      </ul>
    </div>
    </Note>

    <Note title="Seat count and cleanability" blurb="The EV9 seats six; the Sienna is hardest to clean">
    <div className="note">
      <b>The Kia EV9 seats six, not seven.</b> Its third row holds two, so captain&rsquo;s chairs make it a
      six-seater. No three-row EV on sale gives seven seats with captain&rsquo;s chairs. Six-seaters stay on the
      list and lose half the seat-count weight in Best overall.
      <br />
      <br />
      <b>The Sienna is the hardest to clean.</b> Its second-row seats slide but don&rsquo;t come out, and
      there&rsquo;s carpet underneath. The Carnival and Odyssey both beat it: wipeable synthetic leather, third
      rows that fold into a floor well, and second rows you can remove or slide clear. With teenagers rather than
      toddlers this matters less than it did, which is why cleanability carries a small weight; beach sand is the
      reason it still carries one.
      <br />
      <br />
      <b>Check the second row on any listing.</b> Each card labels it: Captains, Captains · lounge, Bench 2nd,
      or Ask 2nd row. Wagoneer Series II ships with a bench as standard. Carnival LX and LXS are bench-only, and
      2025&ndash;2026 EX / SX are sliding eight-passenger seats, not captains. SX Prestige in those years is the
      exception: VIP lounge captain&rsquo;s chairs that do not fold or come out. 2027 is the first year EX and SX
      can option regular buckets without Prestige.
    </div>
    </Note>

    <Note title="Two traps in the older listings" blurb="COVID-year builds, V6 Siennas, and the Tahoe LS bench">
    <div className="note">
      <b>2020&ndash;2022 is a COVID-year build.</b> Factories shut, then the chip shortage hit, and a lot of
      cars left without the modules they were supposed to have. Quality control dipped across brands, though
      the documented cases are mostly GM, Ford and Stellantis, and the evidence for Toyota and Honda is thin.
      Best overall demotes 2021&ndash;2022 hardest, 2020 almost as hard, and 2023 a bit. 2019 and earlier, and
      2024+, are treated as normal. The cars stay on the list &mdash; they just should not win the podium unless
      you drag that slider down.
      <br />
      <br />
      <b>2017&ndash;2020 Sienna is the V6, not the hybrid.</b> The hybrid arrived in 2021. The older van gets 22
      mpg instead of 36, which at {miK} miles a year costs {money(F.fuelGap(36, 22))} more in fuel over five
      years. It does have <b>more</b> cargo though &mdash; 39.1 cu ft behind the third row versus 33.5 &mdash;
      and AWD was available.
      <br />
      <br />
      <b>Tahoe LS ships with a second-row bench.</b> Captain&rsquo;s chairs are an option on that trim, so
      confirm on the specific car before you get attached to it. The same applies to every Chevy and GMC
      full-size below Premier and Denali &mdash; see the GM note below.
    </div>
    </Note>

    <Note title="Everything else that was checked" blurb="The full segment sweep, and what did not make the list">
    <div className="note">
      <b>The rule for getting on this page.</b> Three rows, seven seats or six with captain&rsquo;s chairs,
      second-row captain&rsquo;s chairs available on some trim, sold in Texas, and under 100,000 miles if it is
      used. Age is not a filter: a 2016 Odyssey is here because the reviews hold up and the price is right. The
      two 2016 Sequoia SR5s are the mileage exceptions, because they are local and you asked: Third Coast New
      Braunfels, RWD, at 121,259 miles, and a San Antonio Marketplace 4x4 at 140,908. Read the cost-to-own
      figure, not the sticker. Every nameplate that clears that bar is priced below, whether or not it wins.
      <br />
      <br />
      <b>Ruled out on the second row &mdash; no captain&rsquo;s chairs at any trim.</b> Audi Q7 and Q8, whose
      second row is a fixed three-place bench. Land Rover Discovery and Defender 130. Mitsubishi Outlander.
      Ford Transit Connect and Mercedes Metris, which are commercial vans with bench seating. On the GM
      crossovers the base trims (Traverse LS and equivalents) are bench-only, so the entries below start a trim
      up.
      <br />
      <br />
      <b>Ruled out on the third row.</b> Toyota Land Cruiser, which dropped the third row from the US car
      entirely. Ineos Grenadier, a five-seater. Tesla Model Y, whose third row is for small children. Lexus GX
      550, 28.6 inches and 17 mpg. Pre-2020 Highlanders and pre-2021 Sorentos, whose third rows are under 28
      inches &mdash; the newer versions of both are on the list instead.
      <br />
      <br />
      <b>Ruled out on price.</b> Cadillac Escalade IQ and Lexus LX 700h, both past $115,000. Tahoe High Country,
      Yukon Denali Ultimate and Suburban High Country, all past $83,000 new. Their cheaper trims are here; if
      you want one of those, buy it used.
      <br />
      <br />
      <b>Ruled out on age or mileage.</b> Kia Sedona before 2018, Honda Odyssey before 2011, Toyota Sienna
      before 2011, Chrysler Town &amp; Country: at a price worth paying they all arrive past 100,000 miles, and
      on a fifteen-year hold they would be asked for 300,000. The Town &amp; Country is mechanically the Grand
      Caravan that <b>is</b> on the list, so nothing is lost.
      <br />
      <br />
      <b>The one I had wrong.</b> I first left the redesigned Armada off because I could not verify its
      figures. They check out and it is now on the list, both generations: Nissan added nearly five inches to
      the third row (28.4 to 32.9) and four cubic feet behind it (16.5 to 20.4). See the note below &mdash; it
      is the only car here holding a Texas award.
    </div>
    </Note>

    <Note title="The Armada won SUV of Texas, twice" blurb="A local award, on the one car the brief was already asking for">
    <div className="note">
      <b>The Texas Auto Writers Association named the Armada PRO-4X the 2026 SUV of Texas</b> at the 32nd Texas
      Truck Rodeo, held at Eagle Canyon Raceway in Decatur in September 2025. The 2025 PRO-4X had taken
      Full-Size SUV of Texas the year before, so it is back-to-back. Of every award on this page it is the only
      one handed out by people who drove the cars on Texas roads and dirt, which is worth more here than a
      national gong.
      <br />
      <br />
      <b>It also happens to match the brief.</b> The PRO-4X is the lifted, four-wheel-drive, off-road-trimmed
      version, with 9.6 inches of clearance &mdash; the most of any petrol car on this list &mdash; which is
      the Port Aransas beach-run answer as well as the look. And the redesign fixed the Armada&rsquo;s worst
      number: the old third row was 28.4 inches, a jump seat, and the new one is 32.9. Still short for a
      six-foot teenager.
      <br />
      <br />
      <b>What it costs you to say yes.</b> 17 mpg, and $74,300 before destination for the PRO-4X. At {miK}{' '}
      miles a year that is {money(N.armadaPro4x.fuel)} of petrol over five years and a five-year total of about{' '}
      {$(N.armadaPro4x.net)}, {ord(N.armadaPro4x.rank)} of {F.count}. The SL 4x4 is on the list too at $7,770
      less for the same body, engine and third row. As of 3 Sep 2026 Nissan is also advertising the base SV 4x2
      at $58,840 with 2.9% for 72 months, or $3,500 customer cash &mdash; not both. That is the cheapest new
      Armada on the page, and it is still rear-drive. Captain&rsquo;s chairs are an option on SV and PRO-4X, not
      standard. The award is real; so is the price.
      <br />
      <br />
      <b>Check the second row before you fall for one.</b> Captain&rsquo;s chairs are an option on the PRO-4X,
      not standard, so the seven-seat car you want is a specific build rather than a trim you can order blind.
    </div>
    </Note>

    <Note title="The Armada SV vs the EV9 fire sale" blurb="September 2026 offers, and three Carvana cars">
    <div className="note">
      <b>Nissan&rsquo;s cash does not stack with 2.9%.</b> On 3 Sep 2026 the Armada page for zip 78253 showed
      $58,840 starting MSRP, $3,500 customer cash, $2,000 NMAC loyalty, and 2.9% for 72 months. The $3,500 is
      not compatible with the special APR or the advertised lease. Loyalty only applies if you already own or
      lease a Nissan and finance with NMAC. Grad and military are $500 each on top when you qualify. The
      advertised lease is $819 a month plus $6,219 due at signing on an SV 4x2 &mdash; $35,703 pretax over 36
      months, before the 10,000-mile cap.
      <br />
      <br />
      <b>Kia is in a different incentive tier.</b> Zip 78130 showed $10,000 customer cash on a 2026 EV9, or 0%
      for 60 months plus $5,000 APR bonus cash, or $439 a month plus $3,999 down on a Light Long Range RWD.
      The 0% path is the one on the card: Light Long Range nets $52,900 over 60 months with no interest, Land
      AWD nets $63,900. Taking the full $10,000 and a bank rate costs more if you qualify for 0%. The lease
      cash-out is $19,803 over 36 months, about $15,900 under the Armada lease, and Kia charges $0.25 a mile
      over the allowance.
      <br />
      <br />
      <b>Three Carvana cars from the same shop.</b> A 2024 EV9 Land AWD at $45,990 with 15,489 miles (VIP second
      row, Ocean Blue) is new-Light money for last year&rsquo;s loaded trim &mdash; confirm in writing whether
      Kia&rsquo;s 10/100 powertrain still applies, because subsequent owners often drop to 5/60. A 2021
      Suburban Z71 at $44,990 with 82,000 miles is the real full-size boot (41.5 cu ft) with no factory warranty
      left; buckets are not guaranteed on Z71. A 2020 Expedition MAX XLT at $32,990 with 80,000 miles is the
      cheapest eight-seat hauler here by a wide margin, with $9,200 in factory options on the listing, and the
      same second-row question. Both trucks belong on a PPI, not a one-click buy.
      <br />
      <br />
      <b>These are not the same job.</b> The Armada is a body-on-frame full-size that tows 8,500 lb and seats
      eight with a bench, but it is Tahoe-sized, not Suburban-sized. The EV9 is a unibody six-seater with
      captains, 20 cu ft behind the third row, and 2,000&ndash;5,000 lb of tow depending on trim. If you need
      the truck, the $32,990 MAX is the price winner and the new Armada is the warranty winner. If you can
      charge at home and can live with six seats, the EV9 offer is the one that actually moved.
    </div>
    </Note>

    <Note title="Every Kia Carnival deal in the corridor" blurb="Austin to San Antonio, 8 Sep 2026 — and only the 2027 SX has captains">
    <div className="note">
      <b>Nine Carnivals were added, five new and four used.</b> The sweep covered Austin, New Braunfels and
      San Antonio. It starts at EX because LX and LXS ship with a second-row bench, and every single one is
      front-wheel drive &mdash; Kia has never built an all-wheel-drive Carnival, in any year, on any trim.
      <br />
      <br />
      <b>The new-car discounts are real but small.</b> Dealers in the corridor are advertising the KFA Dealer
      Choice Program at $1,500&ndash;$2,000 off, and Kia is adding $750 of Sticker Sales Event bonus cash. That
      takes a $41,190 Carnival EX to about $39,690 before the cash. On the <b>V6</b>, Kia also has a
      bought-down 2.99% for 72 months that cannot be combined with those discounts, so both paths are
      priced as separate cards, and cash plus RBFCU still wins.
      <br />
      <br />
      <b>The 2026 Hybrid keeps the dealer discount, not the Kia cash.</b> Kia Finance America is offering
      1.90% for 48 months, 2.99% for 60, 3.49% for 66, 3.99% for 72, and 5.99% for 84, through 30 September
      2026, for qualified buyers. The offer&rsquo;s own fine print says offers may not be combined except
      where specified. Dealer contribution is specified &mdash; that is the $1,500&ndash;$2,000 off already
      in the price. The $750 Sticker Sales Event cash is not counted on those cards, and neither is military
      $500. Kia&rsquo;s payment estimator will show a Military checkbox next to a 4.49% <em>sell rate</em>;
      that 4.49% is the ordinary KFA rate, the same number as RBFCU, not the 1.90% special. Tick Military
      only if you actually qualify, and only after you confirm 1.90% is still the selected program. Flip
      the slider to 48 months for the 1.90% rung. 84 months at 5.99% is worse than RBFCU, so it is not used.
      <br />
      <br />
      <b>The 2027 Hybrid is a different offer: 2.90% for 48 months.</b> That one is locked to 48 months
      on the North Austin EX and Round Rock SX. Monthly payment goes up because you pay the van off a
      year sooner; total interest goes down.
      <br />
      <br />
      <b>The cheapest Carnival is the 2026 Hybrid EX at about $42,090, and it is a bench.</b> It finishes{' '}
      {ord(N.carnivalHybEx2026.rank)} of {F.count} at roughly {$(N.carnivalHybEx2026.net)} over five years,{' '}
      {gap(N.carnivalHybEx2026.net, N.siennaNew.net)} from a new Sienna XLE. But the 2025&ndash;2026 EX and SX
      second row is a sliding eight-passenger seat. The Carnival that actually meets the brief is the 2027
      Hybrid SX with captain&rsquo;s chairs at Kia of Round Rock, $50,864, which lands {ord(N.carnivalHybSx2027cap.rank)}{' '}
      at {$(N.carnivalHybSx2027cap.net)}. Every V6 Carnival burns {money(F.fuelAt(22))} of petrol over{' '}
      {kmi(F.miles)} miles against the hybrid&rsquo;s {money(F.fuelAt(33))}, a {money(F.fuelGap(33, 22))} gap
      that a big discount on a V6 could now cover at your mileage.
      <br />
      <br />
      <b>Used is not the cheaper way into a Carnival.</b> The best used one found is a 2024 EX with 56k miles at
      $33,590, and it lands {ord(N.carnivalEx2024_56k.rank)} at {$(N.carnivalEx2024_56k.net)} &mdash;{' '}
      {gap(N.carnivalEx2024_56k.net, N.carnivalHybEx2026.net)} worse than the new hybrid, because it is a V6
      with no captains either. The used hybrids are priced almost at new-car money: $42,590 for a 2025 EX at
      Carvana against $42,090 for a brand-new 2026 with the full 10-year powertrain warranty. A 2026 Hybrid SX
      Prestige also landed on Carvana at $50,990 and 16,631 miles, plus $1,290 to ship it &mdash; more than a
      new Hybrid SX in the corridor, and the lounge second row does not fold or come out. World Car Kia New
      Braunfels has a <b>new V6</b> SX Prestige (VIN KNDNE5K30T6641260) at $52,631 after their discount and
      $1,250 Kia cash; that is lounge captains too, but it is the 22 mpg V6, not the hybrid.
      <br />
      <br />
      <b>Market context.</b> CarGurus has 2023 Carnivals averaging $34,496 around San Antonio and $30,535
      around Austin; 2024s average $30,998. Anything on this page asking more than that for a V6 is priced
      above its own market. Kia&rsquo;s CPO programme restores the 10-year / 100,000-mile powertrain warranty
      from the original in-service date, which is the one genuine reason to pay a dealer premium over Carvana.
      <br />
      <br />
      <b>The 2027s have landed and cost $100 more.</b> Every trim went up exactly $100. Kia is absorbing the
      15% tariff that every Korean-built car now carries rather than putting it on the sticker &mdash; worth
      knowing, because it is a discount that could disappear at any model-year change. 2027 is also the first
      year EX and SX can have real captain&rsquo;s chairs without Prestige lounge seats. Kia of Round Rock has
      a Hybrid SX so equipped at $50,864 (VIN KNDNE5KA3V6190973), about $4,400 over the discounted 2026 SX in
      the corridor, with the dual sunroof standard on SX, at 2.90% for 48 months. Confirm Bose on the
      window sticker; it comes with Dark Edition, not with SX by itself.
    </div>
    </Note>

    <Note title="Sienna versus Carnival, honestly" blurb="Seats, resale, AWD, a tax break, and where the Kia wins">
    <div className="note">
      <b>The app is not favouring Toyota, and it is no longer your mileage doing it either.</b> At 25,000 miles
      a year fuel and resale were the two biggest lines and the Sienna won both. At {miK} the fuel line between
      the hybrids is {money(F.fuelGap(36, 33))} over five years, noise. What separates them now is the second
      row, resale, and AWD.
      <br />
      <br />
      <b>The second row decides it before the money does.</b> The 2026 Carnival Hybrid EX and SX are sliding
      eight-passenger seats. The Prestige has lounge captains that do not fold or come out. The 2027 SX is the
      first hybrid Carnival with ordinary captain&rsquo;s chairs, and it costs $50,864 against the Sienna
      XLE&rsquo;s $47,504. Compared like for like &mdash; captains to captains &mdash; the Sienna is{' '}
      {gap(N.carnivalHybSx2027cap.net, N.siennaNew.net)} cheaper over five years.
      <br />
      <br />
      <b>Fuel is only an argument against the V6.</b> Every Sienna since 2021 is a hybrid at 36 mpg. The
      Carnival V6 gets 22. Over {kmi(F.miles)} miles at $3.00 a gallon that is {money(F.fuelAt(36))} against{' '}
      {money(F.fuelAt(22))}. The Carnival Hybrid gets 33 mpg, which costs {money(F.fuelAt(33))}, and against it
      the fuel argument is worth {money(F.fuelGap(36, 33))}.
      <br />
      <br />
      <b>Resale is the lever that does not evaporate.</b> This page has the Sienna keeping 71% of its value
      over five years and the Carnival 55% &mdash; a 16-point gap, and the widest in the minivan table.
      iSeeCars&rsquo; current study says the same thing slightly more conservatively: 38.6% depreciation for the
      Sienna against 50.1% for the Carnival. Either way it is worth several thousand dollars on a $45,000 van,
      handed back at the end. On the fifteen-year view resale shrinks to a token value for both and this
      advantage mostly disappears; what is left is reliability and safety.
      <br />
      <br />
      <b>All-wheel drive does not exist on a Carnival.</b> Not as an option, not on a trim, not in any model
      year. The Sienna offers it for $890&ndash;$2,000 at the cost of 1 mpg, and the Woodland Edition makes it
      standard with 6.9 inches of clearance. Given Port Aransas, this is the difference between the two vans
      that has nothing to do with money, and it is a want as much as a need: front-drive vans use that beach
      every weekend on the packed sand.
      <br />
      <br />
      <b>The one federal incentive left on a new car, the Carnival cannot claim.</b> See the note below on
      incentives. In short: the deduction requires final assembly in the United States. The Sienna is built in
      Princeton, Indiana. The Carnival is built in Gwangmyeong, South Korea.
      <br />
      <br />
      <b>And the powertrain is the known quantity.</b> Toyota&rsquo;s planetary-gear hybrid is the same basic
      design that has been running in Priuses for two decades and routinely clears 250,000 miles on servicing
      alone. The Carnival Hybrid&rsquo;s 1.6-litre turbo four with a six-speed automatic is a newer, more
      complex way to move a 4,700-lb van, and it has no long-mileage record yet. On a fifteen-year hold you
      would ask it for {kmi(N15.siennaNew.endMiles)} miles.
      <br />
      <br />
      <b>Where the Carnival genuinely wins, and it is not nothing.</b> It holds <b>40.2 cu ft</b> behind the
      third row against the Sienna&rsquo;s 33.5 &mdash; the most of any minivan here and 6.7 cu ft more van for
      the same footprint. Its warranty is 10 years / 100,000 miles on the powertrain against Toyota&rsquo;s
      5 / 60,000. J.D. Power scores it 76 for quality against the Sienna&rsquo;s 71, the 2025 Carnival carried
      no NHTSA recalls while the 2025 Sienna was recalled five times, and its interior is easier to clean
      &mdash; wipeable SynTex, a third row that folds into the floor, and a second row you can actually move.
      The Sienna&rsquo;s second row does not come out and there is carpet under it.
      <br />
      <br />
      <b>The honest verdict.</b> Against the <b>V6</b> Carnival the Sienna wins on cost and on the second row.
      Against the <b>Carnival Hybrid</b> with captain&rsquo;s chairs the Sienna is {gap(N.carnivalHybSx2027cap.net, N.siennaNew.net)}{' '}
      cheaper over five years, has the better third row (38.7 inches against 35.6) for three tall kids, offers
      AWD, and gets the tax deduction. The Carnival gives you 6.7 cu ft more boot, twice the warranty, and a
      dual sunroof standard on SX. Drive both, and put the fifteen-year-old in the third row of each.
    </div>
    </Note>

    <Note title="Government incentives on a new car in 2026" blurb="The EV credit is gone; one deduction is left, and it is assembly-gated">
    <div className="note">
      <b>There is no federal purchase credit on a Carnival. There never was.</b> The $7,500 clean-vehicle
      credit under section 30D only ever applied to battery electrics and plug-in hybrids, and the Carnival is
      neither &mdash; the hybrid charges itself and has no plug. The point is moot regardless: the new, used
      and leased clean-vehicle credits all ended for vehicles acquired after <b>30 September 2025</b>. Nothing
      bought in 2026 qualifies, on any vehicle, including the EV9 elsewhere on this page.
      <br />
      <br />
      <b>What is left is the auto-loan interest deduction.</b> For tax years 2025 through 2028 you may deduct up
      to <b>$10,000 a year</b> of interest on a loan for a <b>new</b>, personal-use vehicle under 14,000 lb. It
      is available whether or not you itemise. It phases out above $100,000 of modified AGI single, $200,000
      joint.
      <br />
      <br />
      <b>It requires final assembly in the United States, and that is where the Carnival loses.</b> Congress
      tied eligibility to the assembly point, not the brand. The Carnival is built at Kia&rsquo;s Gwangmyeong
      plant in South Korea and shipped over &mdash; no deduction. The Sienna is built at Toyota Motor
      Manufacturing Indiana in Princeton, and every US-market Sienna comes from there &mdash; deduction
      available. On a $47,504 Sienna at RBFCU&rsquo;s 4.49% over 60 months the card shows{' '}
      {money(N.siennaNew.c.interest)} of interest across the loan, most of it in the 2026&ndash;2028 tax years,
      worth roughly a fifth of that back at a typical marginal rate.
      <br />
      <br />
      <b>Check the actual car, not the model name.</b> The same nameplate can be built in different countries by
      trim and model year. The Monroney sticker has a &ldquo;Final Assembly Point&rdquo; line, and NHTSA&rsquo;s
      free VIN decoder confirms it. Used cars are excluded from the deduction entirely, so this only ever
      applies to a new purchase.
      <br />
      <br />
      <b>Two things this page does not model.</b> Neither the deduction nor Texas&rsquo;s trade-in tax credit is
      in the totals, because both depend on your tax situation. Both favour the Sienna and both favour buying
      new. Ask your accountant before you let a small gap decide anything.
    </div>
    </Note>

    <Note title="The GM full-size three" blurb="Tahoe, Suburban, Yukon: the most room and the highest running cost">
    <div className="note">
      <b>They are the same truck three ways.</b> Tahoe and Yukon are one vehicle with different badges &mdash;
      42.0 inches of second-row legroom, 34.9 in the third, 25.5 cu ft behind it. Suburban and Yukon XL are the
      long-wheelbase version of that same truck: the third row grows to 36.7 inches and the boot to{' '}
      <b>41.5 cu ft, the most on this page</b>. Only the Kia Carnival comes close, at 40.2, and only the
      Sienna gives the third row more legroom. For three six-foot kids, the long-wheelbase trucks are the only
      SUVs here whose third row is not a compromise.
      <br />
      <br />
      <b>Captain&rsquo;s chairs are an option, not a trim.</b> Buckets are standard on Tahoe and Suburban
      Premier and High Country, on Suburban RST, on Yukon SLT and Denali. On LS, LT and Yukon Elevation they
      are a box someone had to tick when the car was ordered, so check the specific VIN. That is why the used
      picks here sit on LT and above.
      <br />
      <br />
      <b>The running cost is the catch.</b> 17 mpg means about {money(F.fuelAt(17))} of petrol over five years
      &mdash; {money(F.fuelGap(36, 17))} more than a 36 mpg Sienna &mdash; and GM full-size repairs average $744
      a year, more than any minivan or Toyota here. A new Tahoe LT lands near {$(N.tahoeLTNew.net)} over five
      years against {$(N.siennaNew.net)} for a new Sienna. You are buying the space, and the space costs about{' '}
      {gap(N.tahoeLTNew.net, N.siennaNew.net)}.
      <br />
      <br />
      <b>The 3.0L Duramax diesel does less than you would hope.</b> It is rated 22 mpg combined in four-wheel
      drive against 17 for the 5.3 V8, but diesel is priced 22% above petrol, so 22 mpg of diesel costs nearly
      what 17 mpg of petrol does &mdash; about {gap(N.tahoeLTDuramax.fuel, N.tahoeLT2023.fuel)} saved on fuel
      across five years, which the higher asking price hands straight back. The used 2023 LT Duramax finishes
      within {gap(N.tahoeLTDuramax.net, N.tahoeLT2023.net)} of the petrol LT. Buy it for the torque and the
      towing, not the fuel bill &mdash; or, if diesel is running close to petrol when you buy, change the petrol
      price in Assumptions and look again.
      <br />
      <br />
      <b>What to skip.</b> Yukon Denali Ultimate and Tahoe High Country run past $83,000 new, which is beyond
      the price filter and well past the point where a Sequoia or Grand Highlander makes more sense. The used
      Denali below is the loaded version worth looking at.
    </div>
    </Note>

    <Note title={`The lifted AT4, and why it finishes ${ord(N.yukonAT4.rank)}`} blurb="The Facebook Yukon, priced as it actually sits">
    <div className="note">
      <b>This is the 2022 Yukon AT4 from Facebook Marketplace</b> &mdash; 87,000 miles, 6.2L V8, professionally
      lifted six inches on 35-inch tyres, $51,500. It is on the list because you asked for it, not because it
      scored its way on. Run through the same model as everything else it lands <b>{ord(N.yukonAT4.rank)} of{' '}
      {F.count} on five-year cost at {money(N.yukonAT4.net)}</b>, about {money(N.yukonAT4.pmt)} a month on the
      loan, and near the bottom of the recommendation. Here is where that comes from, because none of it is the
      lift being ugly.
      <br />
      <br />
      <b>The engine is under an open safety recall, and the fix is under investigation.</b> NHTSA campaign{' '}
      <b>25V274</b> covers 2021&ndash;2024 Yukons with the 6.2L L87 for connecting-rod and crankshaft defects
      that lead to engine failure; the remedy is an inspection, then either heavier 0W-40 oil or a whole new
      engine. In August 2026 NHTSA opened engineering analysis <b>EA26005</b> because engines were still failing
      after that remedy. This exact car, this exact engine. There is a second one too: <b>26V085</b>, a 2026
      recall on the 2022 ten-speed, where the transmission control valve can lock the rear wheels. Both are free
      to fix and both are checkable by VIN in about thirty seconds &mdash; but they are why this car carries a
      2.5 reliability score instead of the 3.0 the rest of the GM full-size group gets. The 2023 and 2024
      Denalis on the list run the same engine and carry the same 2.5.
      <br />
      <br />
      <b>One rule sets that score, instead of three judgement calls.</b> Every GM full-size here starts at
      3.0 and drops to 2.5 only where this listing&rsquo;s own engine or gearbox is named in an active federal
      investigation or a certified class action &mdash; the 2021&ndash;2024 6.2L L87 cars, and the 2019 Yukon XL
      Denali, which is named in the 8L90 class action. The money side of these defects is priced explicitly on
      every card under Known issues, so the reliability score is left to do one job: how much risk and downtime
      you are signing up for, not what it costs.
      <br />
      <br />
      <b>The lift costs mpg and it does not buy ground clearance.</b> A 4WD 6.2 is EPA-rated 16 combined; on a
      six-inch lift and 35s, 14 is the honest number, and at {miK} miles a year those two mpg are{' '}
      <b>{money(F.fuelGap(16, 14))} of petrol over five years</b>. The clearance is the part worth being clear
      about: a suspension lift raises the body and the frame, not the axles. The lowest thing under a Yukon is
      the differential, and its height is set by the tyre radius. Going from the stock 33-inch tyre to a 35
      lifts the diff about an inch. So the car sits six inches taller and clears about one inch more &mdash; 9.0
      inches against 8.0 stock, which is what the card shows. The stance is real; the capability mostly is not.
      The Armada PRO-4X offers 9.6 inches with no modifications at all.
      <br />
      <br />
      <b>The price is above market, and the lift does not add to it.</b> Kelley Blue Book puts a 2022 AT4 around
      $45,300 in resale condition at typical mileage, and 87,000 is well above typical. Modifications almost
      never return their cost on resale &mdash; they narrow the buyer pool instead &mdash; so the $51,500 is
      being asked partly for the lift, and the lift is the part the next buyer will discount. That flows
      straight into the biggest line on the card: {money(N.yukonAT4.dep)} of depreciation.
      <br />
      <br />
      <b>The mileage is the quiet one.</b> At {miK} miles a year you would hand this car back at roughly{' '}
      <b>{kmi(N.yukonAT4.endMiles)} miles</b>. The maintenance formula puts that around {money(N.yukonAT4.mnt)}{' '}
      over five years &mdash; big tyres on a lift, plus GM full-size repairs with no warranty left. 35-inch tyres
      are a $1,600&ndash;$2,000 set rather than $1,200, wearing faster because of the alignment a lift lives with.
      <br />
      <br />
      <b>What it actually costs against its own siblings.</b> The unlifted 2023 Yukon SLT, a year newer with
      32,000 fewer miles, comes in <b>{gap(N.yukonAT4.net, N.yukonSLT2023.net)} cheaper</b> over five years. A
      brand-new 2026 Yukon Elevation, with a warranty and no recall history to chase, is{' '}
      <b>{gap(N.yukonAT4.net, N.yukonElevation2026.net)} {N.yukonElevation2026.net < N.yukonAT4.net ? 'cheaper' : 'dearer'}</b>. A
      new Sienna XLE is {gap(N.yukonAT4.net, N.siennaNew.net)} cheaper. If what you want is the GM full-size,
      one of the others on this page gets you there for less.
      <br />
      <br />
      <b>Two things I could not verify from the listing.</b> It does not say whether the second row is captain&rsquo;s
      chairs or a bench &mdash; buckets are an option on the AT4, not standard equipment, so the seven-seat car
      is a specific build. I have listed it as seven seats on the assumption it has them. And the odometer: 35s
      are about 6% taller than stock, so unless the speedometer was recalibrated when the lift went on, the
      clock has been under-counting. The true mileage is higher than 87,000 by 6% of however far it has run on
      those tyres.
    </div>
    </Note>

    <Note title="Leasing, and why it fails here" blurb="Every lease caps you at 10,000 miles a year, and you keep cars for nine">
    <p className="fine" style={{ marginBottom: '10px' }}>
      Every advertised lease caps you at 10,000 miles a year. At {miK} a 36-month lease runs {kmi(over)} miles
      over. Toyota charges $0.15 a mile, Kia $0.25, Nissan about $0.20.
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
      {leases.map(([name, adv, yours]) => (
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
      Figures are due-at-signing plus payments, then plus mileage overage at {miK} miles a year. Fuel,
      insurance and tax are extra on both sides. At the end you own nothing and start again.{' '}
      <b>
        A Sienna lease runs about {money(leases[0][5] / 3)} a year in payments and overage, before fuel and
        insurance. Buying a new XLE works out to roughly {money(N.siennaNew.perYear)} a year with everything
        included over five years &mdash; and you finish holding a {money(N.siennaNew.res)} asset instead of
        nothing. Keep it fifteen years and it is {money(N15.siennaNew.perYear)} a year.
      </b>{' '}
      Leasing looks cheaper per year only because the comparison leaves out the equity, and it matches a
      three-year habit this family does not have.
    </p>
    </Note>

    <Note title="Rivian, Tesla, Land Rover, Ineos" blurb="Six-seaters, benches, and one with no third row">
    <div className="note">
      <b>Six seats stays on the list, scored down.</b> Rivian and Tesla are below, cheapest and best of each.
      Like the EV9, their third rows hold two, so captain&rsquo;s chairs make them six-seaters.
      <br />
      <br />
      <b>Rivian R1S</b> just added second-row captain&rsquo;s chairs as an option, but that makes it a
      six-seater; seven requires the bench. Third row is two seats, 17.6 cu ft behind it, and the option runs
      $4,000&ndash;$6,000 because it forces package bundling. The cheapest one here lands at{' '}
      {$(N.r1sCheapest.net)} over five years.
      <br />
      <br />
      <b>Tesla Model X</b> is the same: six with captain&rsquo;s chairs, seven with a bench. Starts around
      $89,990, and the second-row chairs don&rsquo;t fold flat. The best-value one is a 2017 at $31,590 that
      still lands at {$(N.modelX2017.net)} because of battery-age risk and repair costs.
      <br />
      <br />
      <b>Land Rover Discovery and Defender 130</b> do seat seven and eight, but with a bench second row &mdash;
      I could not find a captain&rsquo;s-chair option on either, so confirm before you fall for one. A 2023
      Defender 130 is in the list anyway, and it comes out around {$(N.defender130.net)} over five years, among
      the most expensive things here.
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
      the model over a lifetime rather than any one car. They are the starting rate for the maintenance
      formula, not the number on the card. The card adds oil, tires and brakes for the miles you will drive,
      then scales those RepairPal repairs up with age and odometer and down while warranty remains.
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
      visits far more often, which is why the formula loads about {money(N.sienna2017.mnt)} into its five-year
      maintenance line versus about {money(N.siennaNew.mnt)} for the new one. Over fifteen years those become{' '}
      {money(N15.sienna2017.mnt)} and {money(N15.siennaNew.mnt)}. Drag the miles slider and all four move. The
      sweet spot is a 3&ndash;5 year old mainstream car: past the depreciation cliff, still inside the wear
      curve, parts still cheap.
    </p>
    <p className="fine">
      <b>Where old genuinely wins:</b> no dealer-only diagnostics, no proprietary modules, no battery pack with
      an expiry date. Where it loses: on a fifteen-year hold a 2017 Sienna reaches {kmi(N15.sienna2017.endMiles)}{' '}
      miles, and that is transmission, suspension and A/C compressor territory on anything.
    </p>
    </Note>

    <Note title="Driving on the beach" blurb="Clearance, tyre pressure, salt, and the permit">
    <div className="note">
      <b>Port Aransas and Mustang Island are drive-on beaches</b>, about two and a half hours from New
      Braunfels. The packed sand near the water carries front-drive minivans every weekend; the soft dry sand
      above the tide line is where two-wheel-drive vehicles get stuck, and a tow off the sand runs
      $150&ndash;$300. AWD and clearance are a want with a practical side, not a requirement, which is why AWD
      carries no weight in Best overall unless you give it one.
      <br />
      <br />
      <b>Clearance is the number to watch, not the badge.</b> The Odyssey sits at 4.9 inches and the Pacifica at
      5.1 &mdash; both will drag on soft ruts. A standard Sienna has 6.3, the Woodland 6.9, the Carnival 6.8.
      The SUVs sit at 7.8&ndash;8.7, and the Telluride X-Pro reaches 9.1. Every card lists its figure.
      <br />
      <br />
      <b>AWD is not 4WD.</b> None of these have a low range or a locking differential. On sand that means airing
      tyres down to about 20 psi, keeping momentum, and not stopping on the soft stuff. Bring a pressure gauge
      and a way to reinflate.
      <br />
      <br />
      <b>Salt is the hidden cost.</b> Rinse the underbody after every beach trip. Salt corrosion is a leading
      reason older Gulf Coast cars fail early, and on a fifteen-year hold it is the thing most likely to end
      the car before the engine does. Nueces County also requires a beach parking permit, currently around $12
      a year.
      <br />
      <br />
      <b>Sand makes cleanability matter.</b> This is where the Woodland&rsquo;s standard all-weather floor
      and cargo mats earn their keep, and where the Sienna&rsquo;s non-removable second row with carpet
      underneath is the real drawback.
    </div>
    </Note>

    <Note title="Texas rules that change the maths" blurb="EV road fee, 6.25% tax, SPV, no Comal emissions test">
    <div className="note">
      <b>Battery EVs owe $200 a year in road-use fees.</b> Senate Bill 505, in effect since September 2023, adds
      $400 up front on a new EV&rsquo;s two-year registration and $200 at each renewal. Over five years
      that&rsquo;s $1,000, over fifteen $3,000, and it&rsquo;s built into the EV9, Rivian and Tesla figures. It
      does <b>not</b> apply to hybrids or plug-in hybrids, so the Sienna, Pacifica and CX-90 are exempt.
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

    <Note title="Financing found, September 2026" blurb="Manufacturer APR offers and used-car rates">
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
      all-weather floor and cargo mats, which helps the Sienna&rsquo;s one real weakness. $55,750 at Bryan
      College Station, the one on the list.
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
      The three softest lines are insurance, maintenance and resale, and together they move the total more
      than anything else. Treat gaps under about $3,000 over five years between two options as a tie.
    </p>
    </Note>

    <Note title="Before you decide" blurb="The long-form caveats, one at a time">
    <p className="fine">
      <b>Old and thirsty loses; old and frugal wins, and at {miK} miles a year the line between them moved.</b>{' '}
      The 2017 Expedition at $24,990 lands at roughly {$(N.expedition2017.net)} over five years because at 17
      mpg you burn {money(N.expedition2017.fuel)} in fuel alone. The 2023 Tahoe LS is worse at about{' '}
      {$(N.tahoeLS2023.net)}. But the 2016 Odyssey at $16,590 and the 2019 Grand Caravan at $19,109 come{' '}
      {ord(N.odyssey2016.rankLive)} and {ord(N.grandCaravan2019_21k.rankLive)} cheapest of the cars still for
      sale, because a $16,000 van has almost nothing left to depreciate.
    </p>
    <p className="fine">
      <b>Of the older options, the 2017 Sienna is the most defensible.</b> $26,990, a {money(N.sienna2017.pmt)}{' '}
      payment, and Toyota&rsquo;s most reliable minivan generation. It lands at {$(N.sienna2017.net)} over five
      years, within {gap(N.sienna2017.net, N.siennaNew.net)} of a brand-new hybrid. It has no automatic braking
      as standard, and that is the trade.
    </p>
    <p className="fine">
      <b>The 15-year view flatters whatever is already old.</b> It runs every car to the end of the window on
      the same repair curve and never buys the replacement. A 2016 Odyssey passes 250,000 miles in year{' '}
      {N15.odyssey2016.pastLife} and the model keeps charging it {money(N15.odyssey2016.mnt / 15)} a year in
      maintenance on average, which is optimistic for a 320,000-mile van. Read the &ldquo;250k&rdquo; chip as
      the year you would realistically be shopping again.
    </p>
    <p className="fine">
      <b>Resale is an estimate, not a promise.</b> Each card&rsquo;s year-five figure starts from published
      five-year depreciation data for that model, then discounts it about 11% per extra 25,000 miles you drive
      over the 15,000 a year those figures assume. Past year five it loses a further 11% a year, with a $1,000
      floor. Condition, accident history and colour move it further, and you will get trade-in money rather
      than retail when you sell, which takes a further tenth or so off every resale figure here.
    </p>
    <p className="fine">
      <b>Why &ldquo;value kept&rdquo; flatters used cars.</b> The percentage is measured against what <b>you</b>{' '}
      pay, not the original sticker. A used EV9 keeps a third of $37,990 because the first owner already
      absorbed the drop from $56,000. A new Sienna keeps two thirds of $47,504. Kia&rsquo;s EV9 still has the
      worst depreciation of anything here in absolute terms &mdash; roughly 63% from new over five years &mdash;
      it just doesn&rsquo;t look that way when you buy it second-hand.
    </p>
    <p className="fine">
      <b>Risk is priced as an average, and averages hide the bad day.</b> The known-issue line multiplies a
      repair by its probability. A one-in-sixteen chance of a $17,000 hybrid pack shows as about a thousand
      dollars, which is right on average and wrong on the day it happens to you. If this is the only family car,
      weight reliability higher than the default.
    </p>
    <p className="fine">
      <b>Insurance does not include a teen driver.</b> Every estimate here is for two adults. Adding a
      16-year-old typically adds a large fraction to the premium regardless of which van you pick, so it does
      not change the ranking, but it does change the budget.
    </p>
    <p className="fine">
      <b>Where this is soft.</b> Reliability and cleanability are my scores from published ratings and interior
      features, not measurements. Insurance is a type-based estimate, not a quote. Maintenance is a formula from
      age, miles and warranty, still an estimate.
    </p>
    </Note>
  </div>
);

export default NotesTab;
