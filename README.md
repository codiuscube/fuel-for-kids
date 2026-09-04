# Three-Row Family Vehicle Comparison

A single-page React app that prices one hundred and thirteen specific three-row
vehicles — every one available with second-row captain's chairs — over five
years of ownership, and lets you sort and filter them on a phone.

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
| Gear icon | The assumptions — down payment, miles per year, fuel price, electricity rate, plug-in share, charger install, loan term |

Each card is five scannable lines: rank, name, year and mileage, condition and
body chips, the five-year cost as a rounded figure (`$47.9k`, not `$47,932`),
the asking price, and a fact strip with payment, MPG, third row, cargo,
reliability and share of price kept. The coloured bar under it is where the
money goes. **Details** expands the full cost breakdown, the versus-your-car
specs, drivetrain and ground clearance, and the listing link.

A **Best overall** strip sits at the top of the list and can be hidden. It is
scored 35% five-year cost, 20% reliability, 15% third row, 15% cargo, 10% owner
rating, 5% cleanability, across whatever currently matches your filters.

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

`src/lib/cost.js`. Five years of ownership, recomputed live from the
assumptions:

```
net = depreciation + interest + fuel + insurance + maintenance
      + charger install + Texas EV fee
```

- **Price** is sticker plus shipping, then Texas sales tax at a flat **6.25%**
  plus **$400** in fees.
- **Loan** is price + tax − cash − down payment, amortised over the chosen term
  at the vehicle's APR.
- **Fuel** is electricity for EVs, a blend for plug-ins at your assumed share of
  electric miles, petrol otherwise (diesel priced 22% higher).
- **Resale** starts from published five-year depreciation and is discounted
  about **11% per extra 25,000 miles a year** beyond the 15,000 those figures
  assume. At the 25,000 default everything is marked down 22%.
- **EV road fee** is $200 a year, $1,000 over five years, on battery EVs only.
  Hybrids and plug-ins are exempt.

### Defaults

| Assumption | Default | Why |
| --- | --- | --- |
| Down payment | $10,000 | |
| Miles per year | 25,000 | 125,000 over five years |
| Petrol | $3.00/gal | |
| Electricity | $0.113/kWh | GVEC marginal rate: $0.085 generation + $0.0238 distribution, then 2% franchise fee and 1.5% city tax |
| Plug-in miles on battery | 55% | |
| Charger install | $1,000 | ~$1,600 typical install less GVEC's $600 rebate |
| Loan term | 60 months | |

---

## What the research found

The brief: a family of five in New Braunfels replacing a 2017 Nissan Pathfinder
with 100,000 miles and an ageing CVT. Three kids, so seven seats with
second-row captain's chairs. Roughly 25,000 miles a year, with regular runs to
drive-on beaches at Port Aransas, and a liking for the lifted AWD look.

1. **At 25,000 miles a year, fuel is the deciding variable.** The spread
   between a 36 mpg Sienna and a 22 mpg Odyssey is about $6,600 over five
   years; against a 17 mpg Tahoe it is $11,600. Efficiency matters roughly 1.7
   times more for this family than for an average driver.
2. **Minivans give more space per dollar than SUVs, without exception.** The
   cheapest seven-seat SUV nearby starts at $59,699 with five fewer inches of
   third-row legroom and thirteen fewer cubic feet than a Sienna costing
   $12,000 less. The only thing an SUV wins outright is absolute boot space —
   the Suburban and Yukon XL hold 41.5 cu ft behind the third row, the most
   here — and a used one asks about $16,000 more than a used Carnival for that
   one extra cubic foot.
3. **Resale is the largest single lever, bigger than price.** The Sienna loses
   only 29% over five years against a class average of 46% — which is why a
   $47,504 new Sienna costs less to own than a $40,499 used one.
4. **No EV can give seven seats with captain's chairs.** EV9, Rivian R1S, Tesla
   Model X, Volvo EX90 and Ioniq 9 all have two-seat third rows. It is a
   structural limit of the segment.
5. **Leasing does not work at this mileage.** Every offer caps at 10,000 miles a
   year. At 25,000 you end a three-year term 45,000 miles over — $6,750 in
   penalties at Toyota's $0.15/mile, $11,250 at Kia's $0.25 — and own nothing.
6. **Buying older only saves money right at the bottom.** A 2017 Sienna at
   $27,590 still costs about $4,000 more over five years than a 2025 at
   $40,499. But a 2016 Odyssey at $16,590 wins outright at about $55.8k,
   cheaper than any Sienna, because there is almost no depreciation left to
   pay — and it finishes the five years at 220,000 miles with $13,000 budgeted
   for repairs. Old and thirsty loses; old and frugal wins.
7. **Cost and reliability point in opposite directions at the bottom.** The
   cheapest option is a Pacifica Hybrid at $21,990, and it is also the least
   reliable vehicle in the set.

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
  data/vehicles.js             the 113 listings, spec tables, and explainer copy
  lib/cost.js                  the five-year cost model
  components/
    VehicleCostView.jsx        app shell, Cars tab, sheets, cards
    CompareTab.jsx             vs-yours, at-a-glance, tables
    NotesTab.jsx               long-form reasoning, in accordions
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
