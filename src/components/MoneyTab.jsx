import { Note } from './pieces';
import {
  PATHFINDER_ROUTES,
  RBFCU_TIERS,
  VAN_PATHS,
  TRUCK_REFI,
  CASH_MOVES,
  DEAL_ORDER,
} from '../data/vehicles';

// ---------------------------------------------------------------------------
// The money side of the purchase, which the Cars tab deliberately leaves out.
// Every five-year total on that tab assumes the car is bought at the asking
// price with $10,000 down at the APR on its card. This tab is where those three
// assumptions get argued with: what the Pathfinder is actually worth and to
// whom, which financing path to take, and where a dollar of cash does the most
// good. It opens on the running order, because on the day the sequence is worth
// more than any individual figure on the page.
// ---------------------------------------------------------------------------

const MoneyTab = () => (
  <div className="notes">
    <p className="fine notesintro">
      Three transactions happen at once: the Pathfinder leaves, the van is financed, and the Silverado loan
      carries on. They interact, so they are priced together.
    </p>

    <Note title="The running order" blurb="Six steps, and the sequence is the point" open>
      <div className="tldr">
        <p style={{ fontSize: '14px', margin: '0 0 10px' }}>
          Each step below is something that gets harder, or impossible, once the step after it has happened. The
          order is worth more than any single number on this page.
        </p>
        <ol>
          {DEAL_ORDER.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    </Note>

    <Note title="Selling the Pathfinder" blurb="Ease costs about $2,500 — unless the CVT is going">
      <p className="fine swipe">Swipe the table sideways to see every column.</p>
      <div className="scroller">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Offer</th>
              <th>Tax credit</th>
              <th>Worth</th>
              <th>Effort</th>
            </tr>
          </thead>
          <tbody>
            {PATHFINDER_ROUTES.map(([route, offer, credit, worth, effort]) => (
              <tr key={route}>
                <td>{route}</td>
                <td className="n">{offer}</td>
                <td className="n">{credit}</td>
                <td className="n">{worth}</td>
                <td>{effort}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ marginTop: '12px' }}>
        <b>The trade is the worst price and the best afternoon.</b> Texas taxes the difference when you trade, so
        a $4,000 allowance also saves you $250 of sales tax &mdash; but only if the Pathfinder goes to the same
        dealer, in the same transaction, that sells you the van. A CarMax sale a week earlier does not count.
        <br />
        <br />
        <b>The break-even is 6.25%.</b> That credit is the whole of the trade&rsquo;s advantage, so a private
        sale has to beat the dealer&rsquo;s offer by more than 6.25% to be worth doing. Against a $4,000 trade
        that means clearing $4,250; against $5,000, clearing $5,313. A realistic private sale is $6,500&ndash;
        $7,500, so it clears the bar by roughly $2,500 &mdash; about $200 an hour for the work.
        <br />
        <br />
        <b>Get a CarMax or Carvana number whatever you decide.</b> It is free, it is one appointment, and you are
        not obliged to sell. Their offers run 5&ndash;15% above typical dealer trade money, and a dealer will
        often match one to keep the deal in the building. It is the cheapest leverage available.
        <br />
        <br />
        <b>But the CVT decides this, and it points at the trade.</b> A replacement is $3,000&ndash;$6,000. If the
        transmission shudders, hesitates or whines, the private buyer pool for a 100,000-mile Nissan collapses,
        you would have to disclose it, and trading hands the risk to someone who prices that risk for a living.
        If it drives clean, the $2,500 is worth chasing and a recent service record is what sells it. This is the
        one question on this page that changes the answer by more than the answer is worth.
        <br />
        <br />
        <b>These are ranges, not an appraisal.</b> Published KBB, Edmunds and CarMax figures for a 2017 at about
        100,000 miles in Texas. Trim moves them a long way &mdash; an SL or Platinum sits well above an S.
      </div>
    </Note>

    <Note title="What RBFCU actually charges" blurb="Priced on term alone: no new/used split, no age tier">
      <div className="scroller">
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>As low as</th>
              <th>Per $1,000</th>
            </tr>
          </thead>
          <tbody>
            {RBFCU_TIERS.map(([term, rate, per]) => (
              <tr key={term}>
                <td>{term}</td>
                <td className="n">{rate}</td>
                <td className="n">{per}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ marginTop: '12px' }}>
        <b>Nothing on this sheet cares how old the car is.</b> No new-versus-used split, no mileage tier, no age
        cut-off. The only thing that moves the rate is how long you borrow for, which is why every card on the
        Cars tab is priced at 4.49% whether it is a new Carnival or a 2016 Odyssey.
        <br />
        <br />
        <b>Every rate here is a floor, not a quote.</b> The same sheet runs up to 18.000%. 4.490% is the best
        case for the strongest credit, and it is worth knowing that an existing RBFCU auto loan sitting at 5.79%
        is a point and a quarter above it. If the pre-approval comes back at 5.79% rather than 4.49%, add roughly
        $1,900 to every five-year total on the Cars tab &mdash; enough to undo the used-beats-new result on the
        Sienna.
        <br />
        <br />
        <b>Past 60 months the Cars tab is optimistic.</b> Push the term slider to 72 and the real rate is 4.750%,
        not 4.490%; past 72 it is 6.000%. The model does not tier, so it understates the cost of a long loan.
        <br />
        <br />
        <b>Two auto loans is the thing most likely to move your tier.</b> Keeping the Silverado means its $360 a
        month counts against your debt-to-income when the van is underwritten. Paying it off removes that from
        the calculation, which may be worth more than the interest arithmetic below suggests.
      </div>
    </Note>

    <Note title="Which van financing path" blurb="The discounts beat Kia's 2.99% at every down payment">
      <p className="fine" style={{ marginBottom: '10px' }}>
        Carnival EX, 60 months, total cash out. RBFCU at 4.49% after the $1,500 dealer discount and $750 bonus
        cash, against Kia&rsquo;s bought-down 2.99% at full MSRP &mdash; the discounts cannot be combined with
        the cheap rate, so it is one or the other.
      </p>
      <div className="scroller">
        <table>
          <thead>
            <tr>
              <th>Down</th>
              <th>RBFCU + discounts</th>
              <th>Kia 2.99%</th>
              <th>RBFCU wins by</th>
            </tr>
          </thead>
          <tbody>
            {VAN_PATHS.map(([down, rbfcu, kia, win]) => (
              <tr key={down}>
                <td>{down}</td>
                <td className="n">{rbfcu}</td>
                <td className="n">{kia}</td>
                <td className="n">{win}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ marginTop: '12px' }}>
        <b>Take the discounts.</b> $2,250 off the price is a fixed sum; the value of a cheap rate shrinks as the
        loan shrinks. So the discounts win at every down payment and win by more the more cash you put in. Kia
        needs you to be borrowing at 6% elsewhere before 2.99% is the better deal, and you are not.
        <br />
        <br />
        <b>Ask which of the two the dealer is actually offering.</b> The $1,500 KFA Dealer Choice discount and
        the $750 Sticker Sales Event cash are separate things, and a dealer quoting the 2.99% may quietly assume
        you have given up both.
      </div>
    </Note>

    <Note title="The Silverado" blurb="50 payments left; refinance only at the same term or shorter">
      <p className="fine" style={{ marginBottom: '10px' }}>
        $15,962.55 at 5.79%, $360.08 a month. That solves to <b>50 payments</b> and <b>$2,041</b> of interest
        still to pay &mdash; a little over four years, which is longer than it feels.
      </p>
      <div className="scroller">
        <table>
          <thead>
            <tr>
              <th>Refinance over</th>
              <th>Rate</th>
              <th>Payment</th>
              <th>Interest</th>
              <th>Versus doing nothing</th>
            </tr>
          </thead>
          <tbody>
            {TRUCK_REFI.map(([term, rate, pay, int, verdict]) => (
              <tr key={term}>
                <td>{term}</td>
                <td className="n">{rate}</td>
                <td className="n">{pay}</td>
                <td className="n">{int}</td>
                <td className="n">{verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ marginTop: '12px' }}>
        <b>Every row is cheaper per month. Only the top three are cheaper.</b> That is the whole trap. Dropping
        from 5.79% to 4.49% is worth $472 if you keep the term; stretch to 72 months and the lower rate costs you
        $373 more, because you have also moved into the 4.750% tier. A $255 payment looks better than $360 right
        up until you notice it.
        <br />
        <br />
        <b>It is already an RBFCU loan, which may kill the whole idea.</b> Credit unions generally do not re-rate
        their own paper &mdash; the refinance product is aimed at loans from other lenders, and the &ldquo;cash
        out&rdquo; option on the account is a different thing. Ask directly: <i>will you re-rate my existing
        auto loan to the current 4.49%?</i> If the answer is no, the $472 disappears.
      </div>
    </Note>

    <Note title="Where the cash goes" blurb="The refinance stacks; everything else competes">
      <div className="scroller">
        <table>
          <thead>
            <tr>
              <th>Move</th>
              <th>Saves</th>
              <th>Cash needed</th>
            </tr>
          </thead>
          <tbody>
            {CASH_MOVES.map(([move, saves, cash, free]) => (
              <tr key={move}>
                <td>
                  {move}
                  {free ? ' ·' : ''}
                </td>
                <td className="n">{saves}</td>
                <td className="n">{cash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ marginTop: '12px' }}>
        <b>The refinance is free, so it is not a choice.</b> It needs no cash, which means it stacks with
        whatever you do with the money. Do it if RBFCU allows it, then decide the rest separately.
        <br />
        <br />
        <b>Truck payoff versus van down payment is a coin flip.</b> Paying the Silverado off saves $2,041; the
        same money against the van saves $1,889. That is $153 apart on a $16,000 decision &mdash; noise. Take the
        truck payoff if you want the payment gone and the debt-to-income clean, take the van if you want to keep
        the cash working somewhere you can reach it.
        <br />
        <br />
        <b>The best combination is the refinance plus cash into the van: $2,361.</b> That beats paying the truck
        off outright by $320, because the refinance costs nothing to add. If RBFCU will not re-rate the truck,
        pay the truck off instead and the answer flips back.
        <br />
        <br />
        <b>None of this is in the Cars tab.</b> Those totals assume $10,000 down at the card&rsquo;s APR and stop
        there. Nothing on this page changes which van is cheapest to own &mdash; it changes what the day costs.
      </div>
    </Note>
  </div>
);

export default MoneyTab;
