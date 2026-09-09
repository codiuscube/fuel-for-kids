# Three-Row Family Vehicle Comparison

A single-page React app that prices one hundred and thirty-eight specific three-row
vehicles — every one available with second-row captain's chairs — over five or
fifteen years of ownership, and lets you sort and filter them on a phone.

The list is a full sweep of the segment rather than a shortlist: every nameplate
sold in Texas that can be had with captain's chairs is here, new and used, at
any age, capped at 100,000 miles for the used ones. What was checked and left
out, and why, is written down in the app's **Notes** tab.

This is the only front end in this repository. Everything else that used to
live here (the TEFA planner, the Iddings fall plan, the NBCA school paperwork)
has moved to [`archive/`](#archive), unchanged.

---

## Contents

- [Running it](#running-it)
- [How the app is laid out](#how-the-app-is-laid-out)
- [The cost model](#the-cost-model)
- [What the research found](#what-the-research-found)
- [Where every number comes from](#where-every-number-comes-from)
- [Source files](#source-files)
- [Archive](#archive)

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the build
```

Vite + React 19, no other runtime dependencies. Deploys to Vercel via
`vercel.json` (`npm run build`, output `dist/`, SPA rewrite to `index.html`).

---

## How the app is laid out

The page opens on the list of cars. Everything else is one tap away.

### Cars tab

The default view, and the one built for a phone.

| Control | What it does |
| --- | --- |
| Search | Matches name, year, mileage, drivetrain, body and condition — `sienna`, `hybrid`, `2024`, `awd` all work |
| Sort sheet | Five-year cost, monthly payment, asking price, third-row legroom, cargo, MPG, reliability, resale |
| Filter sheet | Condition, must-haves (AWD / 7 seats / 30+ mpg / minivan / SUV), **more room than yours**, max asking price, max monthly payment |
| More room than yours | Three sliders — second-row legroom, third-row legroom, cargo — each asking for a minimum *gain* over your current car rather than an absolute figure. `+5.0"` third row means five inches more than the 2017 Pathfinder, or whatever you have picked as yours on the Compare tab. Each slider stops at the biggest gain anything on the list actually offers, and greys out when nothing beats your car on that measure; swapping the comparison car pulls any filter now out of reach back down |
| Filter pills | Every active filter shows as a chip under the toolbar; tap the × to drop just that one |
| Gear icon | The assumptions — down payment, miles per year, fuel price, electricity rate, plug-in share, charger install, how long you keep it (5 or 15 years), loan term |

Each card is five scannable lines: rank, name, year and mileage, condition and
body chips, the five-year cost as a rounded figure (`$47.9k`, not `$47,932`),
the asking price, and a fact strip with payment, MPG, third row, cargo,
reliability and share of price kept. The coloured bar under it is where the
money goes. **Details** expands the full cost breakdown, the versus-your-car
specs, drivetrain and ground clearance, and the listing link.

A **Best overall** strip sits at the top of the list and can be hidden. It is
a weighted mix you can drag: captain's chairs and skipping COVID build years
lead the default, with seven seats, overall legroom, cost and reliability just
behind, then cleanability, sunroof, fuel economy and clearance. Seven seats and
captain's chairs are weights, not filters, so six-seaters and benches stay on
the list and are scored down rather than hidden.

### Compare tab

- **vs yours** — pick or type your current car's dimensions; every "vs yours"
  figure in the app follows it.
- **At a glance** — room, cargo, MPG and value-kept as sortable bars.
- **Tables** — reliability/cleanability/resale, and the full spec list.

### Notes tab

All the long-form reasoning, folded into accordions so it reads as a list of
headlines rather than a wall of text. Nothing was cut; it just stopped sitting
between you and the cars.

---

## The cost model

`src/lib/cost.js`. Five or fifteen years of ownership, recomputed live from the
assumptions:

```
net = depreciation + interest + fuel + insurance + maintenance
      + charger install + Texas EV fee
```

- **Price** is sticker plus shipping, then Texas sales tax at a flat **6.25%**
  plus **$400** in fees.
- **Loan** is price + tax − cash − down payment, amortised over the chosen term
  at the vehicle's APR. Every APR is capped at **RBFCU's 4.49% for 60 months**,
  which they quote for used cars as well as new; a manufacturer promo is only
  used where it beats that (0% EV9, 2.90% Armada, 2.99% Carnival, 3.99% Ioniq 9).
  That rate is the well-qualified one at 60 months or less — the oldest and
  highest-mileage listings may be tiered higher or declined, and are labelled to
  check.
- **Fuel** is electricity for EVs, a blend for plug-ins at your assumed share of
  electric miles, petrol otherwise (diesel priced 22% higher).
- **Resale** starts from published five-year depreciation and is discounted
  about **11% per 25,000 miles** the horizon runs past 15,000 a year. At the
  15,000 default there is no markdown. On the 15-year view it loses a further
  11% a year after year five, with a $1,000 floor.
- **Fifteen years** is "run it into the ground": no sale beyond that token
  value, insurance past year five at 75% of the annual rate as the car's value
  falls, repairs on the same age-and-odometer curve, and a chip on the card
  for the year the odometer passes 250,000 miles. The model keeps charging
  repairs rather than buying a replacement, so that chip is the year you would
  realistically be shopping again.
- **EV road fee** is $200 a year, $1,000 over five years, on battery EVs only.
  Hybrids and plug-ins are exempt.

### Defaults

| Assumption | Default | Why |
| --- | --- | --- |
| Down payment | $10,000 | |
| Miles per year | 15,000 | 75,000 over five years; the Pathfinder has averaged about 11,000 since it was bought in 2022, so this is a round figure with headroom for a new school run |
| Petrol | $3.00/gal | |
| Electricity | $0.113/kWh | GVEC marginal rate: $0.085 generation + $0.0238 distribution, then 2% franchise fee and 1.5% city tax |
| Plug-in miles on battery | 55% | |
| Charger install | $1,000 | ~$1,600 typical install less GVEC's $600 rebate |
| Loan term | 60 months | |
| Horizon | 5 years | The family's history says closer to 15; both views are one tap apart |

---

## What the research found

The brief: a family of five in New Braunfels replacing a 2017 Nissan Pathfinder
bought in 2022 with about 55,000 miles, now at 100,000, with an ageing CVT.
Three kids, almost 15, 12 and 9, all likely to reach six feet. Seven seats with
second-row captain's chairs as the starting point. About 11,000 miles a year on
the Pathfinder's own record, modelled at 15,000. Regular runs to drive-on
beaches at Port Aransas, and a liking for the lifted AWD look.

Figures below are at the defaults on 9 September 2026. The app's Notes tab
computes the same figures live, so if they disagree, the app is right.

1. **At 15,000 miles a year, fuel is a tiebreaker, not the decider.** The spread
   between a 36 mpg Sienna and a 22 mpg Odyssey is about $4,000 over five years;
   against a 17 mpg Tahoe it is $7,000. An earlier version of this page assumed
   25,000 miles a year, which made those gaps $6,600 and $11,600 and made fuel
   the deciding line. That one assumption was doing most of the work.
2. **Nearly every sensible van costs about the same to own.** The twenty
   cheapest cars span about $8,800 over five years, roughly $150 a month.
   Insurance alone could swing $4,000 either way. Cost tells you which four or
   five to sit in; it does not pick the van.
3. **Fifteen years changes the question.** Run to the ground, a new Sienna XLE
   is about $107k, $7,100 a year, finishing at 225,000 miles. A 2016 Odyssey is
   about $89k, $5,900 a year, finishing at 320,000 miles and passing 250,000 in
   year 11. That is $1,200 a year for a van nine years newer with a modern
   safety suite, and the model never charges the old van for the replacement it
   would need.
4. **Three teenagers heading for six feet make third-row legroom the primary
   spec.** A 32-inch third row on a Telluride, Palisade or Pilot is a
   children's seat. Only the Sienna (38.7"), Odyssey (38.1"), Expedition,
   Suburban and Yukon XL clear 36 inches. The seven-seat years are also short:
   the oldest is likely gone by 2030, so a fifteen-year car spends eleven years
   as a two-to-four-person vehicle.
5. **Minivans give more space per dollar than SUVs, without exception.** The
   cheapest new seven-seat SUV nearby is a Grand Highlander Hybrid at $59,699
   with five fewer inches of third-row legroom and thirteen fewer cubic feet
   than a Sienna costing $12,000 less. The only thing an SUV wins outright is
   absolute boot space, and a new Tahoe costs about $22,000 more than a new
   Sienna over five years to get it.
6. **The Carnival Hybrid "tie" was a bench.** The 2026 Carnival Hybrid EX at
   $42,090 lands within $1,400 of a new Sienna XLE, but 2025–2026 EX and SX carry
   sliding eight-passenger seats, not captain's chairs. The only hybrid Carnival
   with real captains is the 2027 SX at $50,864, about $7,000 behind the Sienna
   over five years.
7. **No federal purchase credit exists on any car bought in 2026.** The clean
   vehicle credits ended for vehicles acquired after 30 September 2025. The one
   incentive left on a new car is the OBBBA auto-loan interest deduction, up to
   $10,000 a year of interest for tax years 2025–2028, and it requires **final
   assembly in the United States**. The Sienna qualifies (Princeton, Indiana).
   The Carnival does not (Gwangmyeong, South Korea).
8. **No EV can give seven seats with captain's chairs.** EV9, Rivian R1S, Tesla
   Model X, Volvo EX90 and Ioniq 9 all have two-seat third rows. They stay on
   the list and lose half the seat-count weight.
9. **Leasing fails for a different reason now.** At 15,000 miles a year the
   overage on a three-year lease is $2,250 at Toyota's $0.15 a mile or $3,750
   at Kia's $0.25, survivable. The real problem is that this family keeps cars
   for nine years and a lease hands the car back at three, owning nothing.
10. **Buying older is a real bet at this mileage.** A 2016 Odyssey at $16,590 is
    the cheapest thing on the page at about $38.8k over five years, finishing
    at 170,000 miles. A 2017 Sienna V6 lands within $800 of a brand-new hybrid.
    What you give up is a decade of safety engineering, a warranty, and a teen
    driver's first car having automatic braking.
11. **Cost and reliability point in opposite directions at the bottom.** The
    second-cheapest option is a Pacifica Hybrid at $22,990, and it is also the
    least reliable vehicle in the set, with a 6% chance of a $17,000 battery
    outside warranty that the total shows as about a thousand dollars.

### Texas rules that change the maths

- Battery EVs owe **$200 a year** in road-use fees (SB 505, since Sept 2023):
  $400 up front on a new EV's two-year registration, $200 at renewal. Hybrids
  and plug-ins are exempt.
- Sales tax is a flat **6.25% statewide**, minus trade-in, with no county or
  city add-on. The trade-in credit needs the sale and trade in one transaction
  at a licensed dealer.
- Private-party purchases are taxed on the **higher of price or 80% of
  Standard Presumptive Value**. Dealer and Carvana purchases are taxed on the
  actual price.
- **Comal County has no emissions test.** Texas dropped annual safety
  inspections in January 2025 for a $7.50 registration fee. Emissions testing
  still applies in 17 counties, but not Comal.
- **No annual vehicle property tax.** Registration is ~$75–90 regardless of the
  car's value.

The full set of notes — beach driving, seat count and cleanability, traps in
the older listings, AWD availability, financing offers, owner ratings and
repair costs, and the long-form caveats — lives in the app's **Notes** tab.

---

## Where every number comes from

| Figure | Source | Confidence |
| --- | --- | --- |
| Used prices and links | Carvana listings, 30 Aug 2026 | Actual cars |
| Wider segment sweep | Trim MSRPs and market estimates | Trim-level, not a VIN |
| New prices and links | Dealer inventory, San Antonio to Bryan | Actual cars |
| Tahoe / Suburban / Yukon | 2026 MSRP by trim; used are market estimates | Trim-level, not a VIN |
| Legroom, cargo, clearance | Manufacturer specs | Published |
| MPG and MPGe | EPA combined ratings | Published |
| Finance offers | Kia, Toyota, GM, August 2026 | Expire 31 Aug |
| Loan rate on every card | RBFCU 4.49%/60 mo, new and used alike | Advertised, not a pre-approval |
| Carnival prices and offers | Kia MSRP, corridor dealer listings, 8 Sep 2026 | Trim-level, not a VIN |
| Used Carnival listings | Carvana San Antonio search page, 8 Sep 2026 | Listed cars, VIN not opened |
| Final assembly points | Kia Gwangmyeong; Toyota Indiana, Princeton | Manufacturer |
| Auto-loan interest deduction | OBBBA, tax years 2025–2028 | Statute, not tax advice |
| Electricity rate | GVEC bill, Aug 2026 | Actual rate |
| Charger rebate | GVEC EV charger programme | Published |
| EV road fee, sales tax | Texas SB 505, Comptroller | Statute |
| Depreciation | iSeeCars 5-year study | Model average |
| Repairs per year | RepairPal-style averages | Model average |
| Owner ratings | KBB, Edmunds, CarGurus | Model average |
| Reliability score | Consumer Reports + recalls | Judgement |
| Cleanability score | Interior features | Judgement |
| Insurance, maintenance | Type-based estimates | Estimate, not a quote |
| Resale dollars | Depreciation + mileage discount | Estimate |

**Insurance, maintenance and resale are the three softest lines**, and together
they move the five-year total more than anything else. Treat any gap under
about $3,000 as a tie and decide on the test drive.

---

## Source files

```
index.html                     entry point
vite.config.js                 Vite + React
vercel.json                    build and SPA rewrite
src/
  main.jsx                     React root
  App.jsx                      renders the one view
  index.css                    global reset
  vehicle-cost.css             all styling, scoped under .vehcost, mobile first
  data/vehicles.js             the 122 listings, spec tables, and explainer copy
  lib/cost.js                  the cost model, five or fifteen years
  lib/figures.js               the figures the Notes tab quotes, computed from the model
  components/
    VehicleCostView.jsx        app shell, Cars tab, sheets, cards
    CompareTab.jsx             vs-yours, at-a-glance, tables
    NotesTab.jsx               long-form reasoning, in accordions; numbers come from lib/figures.js
    pieces.jsx                 shared bars, popovers, assumptions panel
```

---

## Archive

Nothing was deleted. Everything not part of the vehicle app moved to
`archive/`, keeping its git history:

| Folder | What's in it |
| --- | --- |
| `archive/tefa/` | Texas Education Freedom Accounts notes: FAQs, the SB 2 text, the cascade model, family and press updates, Facebook posts and replies |
| `archive/nbca/` | New Braunfels Christian Academy paperwork: enrolment prep, ambassador form, extension request, uniform and supply lists |
| `archive/family/` | Financial-aid and payment-plan correspondence drafts |
| `archive/source-documents/` | The PDFs and spreadsheets those notes were built from — lottery updates, application insights, order receipts |
| `archive/legacy-frontend/` | The removed front end: `IddingsPlanner.jsx`, `FallPlanView.jsx`, `fall-plan.css`, and the two standalone HTML pages (`iddings-fall-plan.html`, `vehiclecostcomparison.html`) the React views were ported from |

The archived front end is kept as reference only. It is not built, not routed,
and its dependencies (Tailwind, React Router, Recharts, lucide-react) were
removed from `package.json` when it came out of the app.
