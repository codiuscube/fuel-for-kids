// ---------------------------------------------------------------------------
// Data for the three-row family vehicle comparison.
//
// Prices are real listings near 78130 as of 30 Aug 2026: Carvana for used,
// dealer inventory for new. The Armada SV, new EV9 incentives, and three
// Carvana VINs were added 3 Sep 2026 from manufacturer offer pages (zips
// 78253 / 78130) and the listings linked from those offers. Nine Kia Carnivals
// were added 8 Sep 2026 from a sweep of Austin, New Braunfels and San Antonio
// stock; those carry search-page links rather than VIN links, because the
// individual cars were read from listing summaries and not opened. A 2016
// Sequoia SR5 2WD at Third Coast New Braunfels was added 8 Sep 2026: 121,259
// miles, $20,900 from the dealer's sellingPrice field (the VDP hides it). A
// second 2016 Sequoia SR5 4x4 in San Antonio was added the same day from
// Facebook Marketplace: 140,908 miles, $22,114, Magnetic Gray Metallic. A
// 2026 Carnival Hybrid SX Prestige on Carvana (vehicle 4725390) was added
// 8 Sep 2026: 16,631 miles, $50,990, plus Carvana's $1,290 shipping, $495 in
// factory upgrades. A new 2026 Carnival SX Prestige V6 at World Car Kia New
// Braunfels was added the same evening: VIN KNDNE5K30T6641260, Aurora Black
// Pearl, sale price $52,631 after dealer discount and $1,250 Kia cash (KFA and
// military conditionals not applied). A 2027 Carnival Hybrid SX with captain's
// chairs at Kia of Round Rock was added the same day: VIN KNDNE5KA3V6190973,
// Ceramic Silver, $50,864.
//
// APRs are capped at RBFCU's 4.49% for 60 months, new or used alike, since that
// is the buyer's actual financing. Manufacturer promos below it (0%, 2.90%,
// 2.99%, 3.99%) are left alone because they still beat it, and they keep the
// advertised term (48 or 72 months) instead of following the slider. Note
// RBFCU quotes 4.49% for well-qualified borrowers at 60 months or less; the
// oldest and highest-mileage cars here may be tiered higher or declined
// outright, so the pre-2020 listings are labelled to check. Legroom, cargo
// and MPG are manufacturer/EPA figures; insurance and resale are estimates.
// On 9 Sep 2026 every Carvana VIN listing on this page was re-checked against
// the live page. Seven had sold (2025 Sienna XLE, both 2024 Pacifica Hybrid
// Selects, the 2023 Pacifica Hybrid Touring L, the 2019 Odyssey EX-L, the 2017
// Model X 100D and the 2024 Wagoneer Series II) and are left in place, marked
// here rather than silently deleted; twenty-two more had dropped in price and
// were corrected. The Defender entry pointed at a 2023 110 S at $42,990, not
// the 130 S it described, and now points at a real 2023 130 SE in San Antonio.
//
// The same day, cars.com was swept for the Austin-San Antonio corridor (zip
// 78130, 75 miles, which reaches Austin, Kyle, Buda, San Marcos, New Braunfels
// and San Antonio): 2,805 listings across 54 nameplates, 2,608 of them inside
// the corridor. Eleven were added below. Only those eleven could be confirmed
// to have second-row captain’s chairs from the seller’s own listing text, which
// is the bar this page sets; cars.com does not carry second-row configuration
// as structured data, and 126 of 154 candidates said nothing either way.
//
// Maintenance is computed from age, odometer, remaining warranty and the miles
// slider (see maintenanceFor in src/lib/cost.js), which is why the page says
// to treat sub-$3,000 gaps as ties.
// ---------------------------------------------------------------------------

// 2026 Carnival Hybrid KFA, through 30 Sep 2026. Dealer discount stays (Kia
// calls that dealer contribution). Kia bonus cash and military are not counted
// with the cheap APR — "offers may not be combined except where specified."
// 66-month 3.49% and 84-month 5.99% exist; 84 is worse than RBFCU, and the
// slider is 48 / 60 / 72 only.
export const KFA_CARNIVAL_HYBRID_2026 = { 48: 0.019, 60: 0.0299, 72: 0.0399 };

export const OPTIONS=[
 {n:"Toyota Sienna XLE",y:"2026 \u00b7 $47,504",cat:"van",cond:"new",seats:7,sticker:47504,cash:0,apr:.0449,offer:"North Park Toyota, 42 mi",
  awd:"AWD +$1,000",mpg:36,mpgLab:"36",ins:12500,res:32000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.northparktoyota.com/new-inventory/index.htm?model=Sienna",lt:"View this listing"},
 {n:"Sienna Woodland Edition",y:"2026 \u00b7 lifted, AWD standard \u00b7 $55,750",cat:"van",cond:"new",seats:7,sticker:55750,cash:0,apr:.0449,offer:"Bryan College Station, 124 mi",
  awd:"AWD standard, 6.9\" clearance",mpg:35,mpgLab:"35",ins:13000,res:38000,rel:4.0,cln:3.5,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.bcstoyota.com/new-inventory/index.htm?model=Sienna",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2025 \u00b7 59k mi \u00b7 $40,499",cat:"van",cond:"used",seats:7,sticker:40499,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was RBFCU 4.49%",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:11500,res:24000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4683855",lt:"View this listing"},
 {n:"Pacifica Hybrid Select",y:"2024 \u00b7 68k mi \u00b7 $21,990",cat:"van",cond:"used",seats:7,sticker:21990,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,res:9500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4401364",lt:"View this listing"},
 {n:"Pacifica Hybrid Touring L",y:"2023 \u00b7 31k mi \u00b7 $28,590",cat:"van",cond:"used",seats:7,sticker:28590,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,res:12500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4660545",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2022 \u00b7 63k mi \u00b7 $30,990",cat:"van",cond:"used",seats:7,sticker:30990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:11000,res:15000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4651723",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2023 \u00b7 60k mi \u00b7 $30,990",cat:"van",cond:"used",seats:7,row2:"bench",sticker:30990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:11000,res:12500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4357538",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2024 \u00b7 20k mi \u00b7 $38,590",cat:"van",cond:"used",seats:7,row2:"bench",sticker:38590,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:11500,res:17500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4673591",lt:"View this listing"},
 {n:"Kia Carnival Hybrid SX",y:"2025 \u00b7 17k mi \u00b7 $48,590",cat:"van",cond:"used",seats:7,row2:"bench",sticker:48590,cash:0,apr:.0449,offer:"Most reliable minivan",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:12500,res:22000,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4691317",lt:"View this listing"},
 {n:"Kia Carnival Hybrid SX Prestige",y:"2026 \u00b7 16,631 mi \u00b7 lounge 2nd row \u00b7 $50,990",cat:"van",cond:"used",seats:7,row2:"lounge",sticker:50990,ship:1290,cash:0,apr:.0449,offer:"Carvana \u2014 $495 upgrades, lounge stays put",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:13000,res:23500,rel:4.5,cln:3.5,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4725390",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2017 \u00b7 62k mi \u00b7 V6, not hybrid",cat:"van",cond:"used",seats:7,sticker:26990,ship:590,cash:0,apr:.0449,offer:"RBFCU \u2014 check age limit",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:9000,res:11000,rel:4.5,cln:3.0,leg2:37.6,leg3:36.3,cargo:39.1,
  url:"https://www.carvana.com/vehicle/4517273",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2020 \u00b7 75k mi \u00b7 V6, not hybrid",cat:"van",cond:"used",seats:7,sticker:31990,cash:0,apr:.0449,offer:"RBFCU \u2014 check age limit",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:9500,res:12500,rel:4.5,cln:3.0,leg2:37.6,leg3:36.3,cargo:39.1,
  url:"https://www.carvana.com/vehicle/4578369",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2019 \u00b7 37k mi",cat:"van",cond:"used",seats:7,sticker:31990,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was RBFCU \u2014 check age limit",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:9500,res:13000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4651600",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2023 \u00b7 67k mi \u00b7 hybrid",cat:"van",cond:"used",seats:7,sticker:38990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:11500,res:22000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4554451",lt:"View this listing"},
 {n:"Toyota Sienna XSE",y:"2022 \u00b7 32k mi \u00b7 20\" wheels",cat:"van",cond:"used",seats:7,sticker:45590,cash:0,apr:.0449,offer:"Sport trim",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:12000,res:24000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4485668",lt:"View this listing"},
 {n:"Pacifica Hybrid Select",y:"2024 \u00b7 57k mi",cat:"van",cond:"used",seats:7,sticker:22990,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,
  aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,res:10500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4418299",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2025 \u00b7 33k mi",cat:"van",cond:"used",seats:7,row2:"bench",sticker:38990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:11500,res:19000,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4611470",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2024 \u00b7 34k mi",cat:"van",cond:"used",seats:7,sticker:36990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:11500,res:19000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4674135",lt:"View this listing"},
 {n:"Grand Highlander Hybrid Ltd",y:"2026 \u00b7 $59,699",cat:"suv",cond:"new",seats:7,sticker:59699,cash:0,apr:.0449,offer:"Toyota of Cedar Park, 62 mi",
  awd:"AWD available",mpg:36,mpgLab:"36",ins:13000,res:35000,rel:4.5,cln:3.5,leg2:39.5,leg3:33.5,cargo:20.6,
  url:"https://www.toyotacedarpark.com/new-inventory/index.htm?model=Grand+Highlander+Hybrid",lt:"View this listing"},
 {n:"Honda Pilot TrailSport",y:"2026 \u00b7 AWD, skid plates \u00b7 ~$50,000",cat:"suv",cond:"new",seats:7,sticker:50000,cash:0,apr:.0449,offer:"All-terrain tires std",
  awd:"AWD standard",mpg:21,mpgLab:"21",ins:12500,res:28000,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://automobiles.honda.com/pilot",lt:"Build and find one"},
 {n:"Honda Pilot TrailSport",y:"2023 \u00b7 used \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:39000,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"AWD standard",mpg:21,mpgLab:"21",ins:11500,res:18000,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://www.carvana.com/cars/honda-pilot",lt:"Browse listings"},
 {n:"Telluride X-Line SX Hybrid",y:"2027 \u00b7 AWD, rugged trim \u00b7 $56,035",cat:"suv",cond:"new",seats:7,sticker:56035,cash:0,apr:.0449,offer:"Hybrid + off-road look",
  awd:"AWD standard",mpg:33,mpgLab:"33",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:13500,res:32000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:21.3,
  url:"https://www.kia.com/us/en/telluride",lt:"Build and find one"},
 {n:"Mazda CX-90 PHEV Preferred",y:"2026 \u00b7 AWD std \u00b7 ~$51,000",cat:"suv",cond:"new",seats:7,sticker:51000,cash:0,apr:.0449,offer:"26 mi electric",
  awd:"AWD standard",mpg:25,mpgLab:"56 MPGe",mpgBar:38,kwh100:48,phev:true,charger:true,
  ins:13000,res:26000,rel:3.0,cln:3.5,leg2:39.4,leg3:30.4,cargo:14.9,
  url:"https://www.mazdausa.com/vehicles/cx-90-phev",lt:"Build and find one"},
 {n:"Subaru Ascent Onyx",y:"2026 \u00b7 AWD std \u00b7 ~$45,000",cat:"suv",cond:"new",seats:7,sticker:45000,cash:0,apr:.0449,offer:"Rugged trim",
  awd:"AWD standard",mpg:22,mpgLab:"22",ins:12000,res:24000,rel:3.5,cln:3.5,leg2:38.6,leg3:31.7,cargo:17.6,
  url:"https://www.subaru.com/vehicles/ascent",lt:"Build and find one"},
 {n:"Highlander Hybrid XLE",y:"2026 \u00b7 AWD \u00b7 ~$48,000",cat:"suv",cond:"new",seats:7,sticker:48000,cash:0,apr:.0449,offer:"36 mpg, tiny 3rd row",
  awd:"AWD available",mpg:35,mpgLab:"35",ins:12500,res:28000,rel:4.5,cln:3.5,leg2:41.0,leg3:27.7,cargo:16.0,
  url:"https://www.toyota.com/highlanderhybrid/",lt:"Build and find one"},
 {n:"Palisade Hybrid SEL",y:"2026 \u00b7 FWD \u00b7 $45,660",cat:"suv",cond:"new",seats:7,sticker:45660,cash:0,apr:.0449,offer:"34 mpg, 10yr warranty",
  awd:"AWD +$2,000",mpg:34,mpgLab:"34",ins:13000,res:26000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:19.1,
  url:"https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid",lt:"Build and find one"},
 {n:"Palisade Hybrid SEL AWD",y:"2026 \u00b7 AWD \u00b7 $47,660",cat:"suv",cond:"new",seats:7,sticker:47660,cash:0,apr:.0449,offer:"30 mpg with AWD",
  awd:"AWD standard on this build",mpg:30,mpgLab:"30",ins:13000,res:27000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:19.1,
  url:"https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid",lt:"Build and find one"},
 {n:"Hyundai Palisade SEL",y:"2023 \u00b7 used \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:31500,cash:0,apr:.0449,offer:"Telluride twin",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:11500,res:14500,rel:3.5,cln:3.5,leg2:42.4,leg3:31.4,cargo:18.0,
  url:"https://www.carvana.com/cars/hyundai-palisade",lt:"Browse listings"},
 {n:"Kia Telluride S",y:"2025 \u00b7 36k mi \u00b7 $31,990",cat:"suv",cond:"used",seats:7,sticker:31990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"AWD available",mpg:22,mpgLab:"22",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:11500,res:15500,rel:3.5,cln:3.5,leg2:42.4,leg3:31.4,cargo:21.0,
  url:"https://www.carvana.com/vehicle/4650636",lt:"View this listing"},
 {n:"Kia Telluride Hybrid EX",y:"2027 \u00b7 AWD \u00b7 $50,035",cat:"suv",cond:"new",seats:7,sticker:50035,cash:0,apr:.0449,offer:"Redesigned, 35 mpg",
  awd:"AWD standard on this trim",mpg:34,mpgLab:"34",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:13000,res:29000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:21.3,
  url:"https://www.kia.com/us/en/telluride",lt:"Build and find one"},
 {n:"Toyota Sequoia Limited",y:"2023 \u00b7 17k mi \u00b7 $67,590",cat:"suv",cond:"used",seats:7,sticker:67590,cash:0,apr:.0449,offer:"Hybrid V6",
  awd:"4WD available",mpg:21,mpgLab:"21",ins:14000,res:36000,rel:3.5,cln:3.0,leg2:39.2,leg3:33.7,cargo:11.5,
  url:"https://www.carvana.com/vehicle/4665017",lt:"View this listing"},
 {n:"Toyota Sequoia Platinum",y:"2023 \u00b7 34k mi \u00b7 $68,990",cat:"suv",cond:"used",seats:7,sticker:68990,cash:0,apr:.0449,offer:"Hybrid V6",
  awd:"4WD available",mpg:21,mpgLab:"21",ins:14000,res:36500,rel:3.5,cln:3.0,leg2:39.2,leg3:33.7,cargo:11.5,
  url:"https://www.carvana.com/vehicle/4658098",lt:"View this listing"},
 {n:"Kia EV9 Light LR",y:"2024 \u00b7 27k mi \u00b7 +$1,290 shipping",cat:"suv",cond:"used",seats:6,sticker:37990,cash:0,apr:.0449,offer:"RBFCU 4.49%",
  awd:"RWD \u2014 AWD starts at Wind",kwh100:34.5,mpgLab:"88 MPGe",mpgBar:40,ship:1290,ev:true,charger:true,aw:"2024 World Car of the Year",awUrl:"https://www.kbb.com/car-news/the-kia-ev9-is-the-2024-world-car-of-the-year",ins:13500,res:15500,rel:1.5,cln:4.0,
  leg2:42.8,leg3:32.0,cargo:20.2,url:"https://www.carvana.com/cars/kia-ev9",lt:"Browse EV9 listings"},
 // Sep 2026 EV9 fire sale and a loaded used Land. 0% + $5,000 is the financed
 // path; $10,000 cash does not stack with it. Land is six seats with captains.
 {n:"Kia EV9 Light LR",y:"2026 \u00b7 0% + $5k \u00b7 $57,900",cat:"suv",cond:"new",seats:6,sticker:57900,cash:5000,apr:0,offer:"0% / 60 mo + $5,000 \u00b7 or $10,000 cash",
  awd:"RWD \u2014 AWD starts at Wind",kwh100:32.7,mpgLab:"97 MPGe",mpgBar:40,ev:true,charger:true,aw:"2024 World Car of the Year",awUrl:"https://www.kbb.com/car-news/the-kia-ev9-is-the-2024-world-car-of-the-year",ins:13500,res:21500,rel:1.5,cln:4.0,
  leg2:42.8,leg3:32.0,cargo:20.2,url:"https://www.kia.com/us/en/ev9",lt:"Build and find one"},
 {n:"Kia EV9 Land AWD",y:"2026 \u00b7 0% + $5k \u00b7 $68,900",cat:"suv",cond:"new",seats:6,sticker:68900,cash:5000,apr:0,offer:"0% / 60 mo + $5,000 \u00b7 or $10,000 cash",
  awd:"AWD standard",kwh100:35.6,mpgLab:"88 MPGe",mpgBar:40,ev:true,charger:true,aw:"2024 World Car of the Year",awUrl:"https://www.kbb.com/car-news/the-kia-ev9-is-the-2024-world-car-of-the-year",ins:14000,res:25500,rel:1.5,cln:4.0,
  leg2:42.8,leg3:32.0,cargo:20.2,url:"https://www.kia.com/us/en/ev9",lt:"Build and find one"},
 {n:"Kia EV9 Land AWD",y:"2024 \u00b7 15k mi \u00b7 $45,990",cat:"suv",cond:"used",seats:6,row2:"lounge",sticker:45990,cash:0,apr:.0449,offer:"VIP 2nd row \u00b7 Carvana",
  awd:"AWD standard",kwh100:35.6,mpgLab:"88 MPGe",mpgBar:40,ev:true,charger:true,aw:"2024 World Car of the Year",awUrl:"https://www.kbb.com/car-news/the-kia-ev9-is-the-2024-world-car-of-the-year",ins:13500,res:20000,rel:1.5,cln:4.0,
  leg2:42.8,leg3:32.0,cargo:20.2,url:"https://www.carvana.com/vehicle/4709411",lt:"View this listing"},
 {n:"Ford Expedition Limited",y:"2017 \u00b7 70k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:24990,ship:990,cash:0,apr:.0449,offer:"RBFCU \u2014 check age limit",
  awd:"4WD available",mpg:17,mpgLab:"17",ins:9500,res:9000,rel:2.5,cln:3.0,leg2:39.1,leg3:37.7,cargo:18.6,
  url:"https://www.carvana.com/vehicle/4629379",lt:"View this listing"},
 {n:"Chevy Tahoe LS",y:"2023 \u00b7 64k mi \u00b7 check 2nd row",cat:"suv",cond:"used",seats:7,row2:"bench",sticker:39590,ship:1890,cash:0,apr:.0449,offer:"LS ships with a bench",
  awd:"4WD available",mpg:17,mpgLab:"17",ins:12500,res:18000,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/vehicle/4434231",lt:"View this listing"},
 // GM full-size SUVs. The body-on-frame trio the list was missing: Tahoe, its
 // long-wheelbase Suburban twin, and the GMC Yukon / Yukon XL versions of both.
 // Used picks are all under four years old and under 70k miles, on trims where
 // the second row is captain's chairs rather than the base bench.
 {n:"Chevy Tahoe LT 4WD",y:"2023 \u00b7 ~57k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:45590,ship:1290,cash:0,apr:.0449,offer:"Check for buckets",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:12500,res:20500,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/cars/chevrolet-tahoe",lt:"Browse listings"},
 {n:"Chevy Tahoe LT Duramax",y:"2023 \u00b7 ~66k mi \u00b7 3.0L diesel",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:46990,ship:1290,cash:0,apr:.0449,offer:"Diesel, 22 mpg",
  awd:"4WD standard on this build",mpg:22,mpgLab:"22",diesel:true,ins:12500,res:21500,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/cars/chevrolet-tahoe",lt:"Browse listings"},
 {n:"Chevy Tahoe Premier 4WD",y:"2024 \u00b7 ~44k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:54590,cash:0,apr:.0449,offer:"Captain's chairs standard",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:13000,res:25500,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/cars/chevrolet-tahoe",lt:"Browse listings"},
 {n:"Chevy Suburban LT 4WD",y:"2023 \u00b7 ~62k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:47990,ship:1290,cash:0,apr:.0449,offer:"Most cargo on this page",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:12500,res:21500,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.carvana.com/cars/chevrolet-suburban",lt:"Browse listings"},
 {n:"Chevy Suburban RST 4WD",y:"2024 \u00b7 ~47k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:55590,cash:0,apr:.0449,offer:"Buckets standard on RST",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:13000,res:26000,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.carvana.com/cars/chevrolet-suburban",lt:"Browse listings"},
 {n:"Chevy Suburban Z71",y:"2021 \u00b7 82k mi \u00b7 $44,590",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:44590,cash:0,apr:.0449,offer:"Check for buckets \u00b7 Carvana",
  awd:"4WD standard on Z71",mpg:16,mpgLab:"16",ins:12000,res:14000,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.carvana.com/vehicle/4684382",lt:"View this listing"},
 {n:"GMC Yukon SLT 4WD",y:"2023 \u00b7 ~55k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:48590,ship:1290,cash:0,apr:.0449,offer:"Captain's chairs standard",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:12500,res:22000,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/cars/gmc-yukon",lt:"Browse listings"},
 {n:"GMC Yukon XL SLT 4WD",y:"2023 \u00b7 ~68k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:49590,ship:1290,cash:0,apr:.0449,offer:"Suburban in a GMC suit",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:12500,res:22000,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.carvana.com/cars/gmc-yukon-xl",lt:"Browse listings"},
 {n:"GMC Yukon Denali 4WD",y:"2024 \u00b7 ~41k mi \u00b7 6.2L V8",cat:"suv",cond:"used",seats:7,sticker:61590,cash:0,apr:.0449,offer:"Air ride, 16 mpg",
  awd:"4WD standard on this build",mpg:16,mpgLab:"16",ins:13500,res:29000,rel:2.5,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/cars/gmc-yukon",lt:"Browse listings"},
 // A real Facebook Marketplace car. Priced, rated and fuelled as it actually
 // sits: 6.2L L87 under recall 25V274,
 // 87k miles on the clock, and a 6" lift on 35s that costs mpg and resale
 // rather than adding either. See the note "The lifted AT4" for the working.
 {n:"GMC Yukon AT4 4WD",y:"2022 \u00b7 87k mi \u00b7 6\" lift on 35s \u00b7 $51,500",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:51500,cash:0,apr:.0449,offer:"Private seller \u00b7 check for buckets",
  awd:"4WD standard on AT4",mpg:14,mpgLab:"14",ins:13500,res:15000,rel:2.5,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.facebook.com/marketplace/item/1037812272478124/",lt:"View this listing"},
 {n:"Chevy Tahoe LT 4WD",y:"2026 \u00b7 4WD, buckets optional \u00b7 $68,995",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:68995,cash:0,apr:.0449,offer:"GM 5.9% for 60 months",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:13500,res:39000,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.chevrolet.com/suvs/tahoe",lt:"Build and find one"},
 {n:"Chevy Tahoe Z71",y:"2026 \u00b7 4WD std \u00b7 $72,995",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:72995,cash:0,apr:.0449,offer:"Off-road trim, 2-speed 4WD",
  awd:"4WD standard",mpg:17,mpgLab:"17",ins:13500,res:41500,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.chevrolet.com/suvs/tahoe",lt:"Build and find one"},
 {n:"Chevy Suburban LT 4WD",y:"2026 \u00b7 4WD, 41.5 cu ft \u00b7 $71,695",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:71695,cash:0,apr:.0449,offer:"41.5 cu ft behind row three",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:13500,res:40500,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.chevrolet.com/suvs/suburban",lt:"Build and find one"},
 {n:"GMC Yukon Elevation 4WD",y:"2026 \u00b7 4WD, buckets optional \u00b7 $75,395",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:75395,cash:0,apr:.0449,offer:"Check for buckets",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:14000,res:43000,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.gmc.com/suvs/yukon",lt:"Build and find one"},
 {n:"GMC Yukon XL Elevation 4WD",y:"2026 \u00b7 4WD, longest body \u00b7 $78,395",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:78395,cash:0,apr:.0449,offer:"Longest body here",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:14000,res:44500,rel:3.0,cln:3.0,leg2:42.0,leg3:36.7,cargo:41.5,
  url:"https://www.gmc.com/suvs/yukon-xl",lt:"Build and find one"},
 {n:"Rivian R1S Adventure",y:"2023 \u00b7 63k mi \u00b7 $59,590",cat:"suv",cond:"used",seats:6,sticker:59590,cash:0,apr:.0449,offer:"Quad-motor",
  awd:"AWD standard",kwh100:49,mpgLab:"69 MPGe",mpgBar:34,ev:true,charger:true,ins:16000,res:16000,rel:2.0,cln:4.0,
  leg2:37.6,leg3:32.8,cargo:17.7,url:"https://www.carvana.com/vehicle/4549163",lt:"View this listing"},
 {n:"Rivian R1S Dual Standard",y:"2024 \u00b7 33k mi \u00b7 $62,590",cat:"suv",cond:"used",seats:6,sticker:62590,cash:0,apr:.0449,offer:"Longer range",
  awd:"AWD standard",kwh100:49,mpgLab:"69 MPGe",mpgBar:34,ev:true,charger:true,ins:16000,res:18000,rel:2.0,cln:4.0,
  leg2:37.6,leg3:32.8,cargo:17.7,url:"https://www.carvana.com/vehicle/4460885",lt:"View this listing"},
 {n:"Tesla Model X 100D",y:"2017 \u00b7 47k mi \u00b7 $31,590",cat:"suv",cond:"used",seats:6,sticker:31590,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was RBFCU \u2014 check age limit",
  awd:"AWD standard",kwh100:34,mpgLab:"100 MPGe",mpgBar:40,ev:true,charger:true,ins:14000,res:6000,rel:2.5,cln:4.0,
  leg2:38.5,leg3:32.2,cargo:15.0,url:"https://www.carvana.com/vehicle/4672369",lt:"View this listing"},
 {n:"Tesla Model X Long Range",y:"2020 \u00b7 56k mi \u00b7 $38,990",cat:"suv",cond:"used",seats:6,sticker:38990,cash:0,apr:.0449,offer:"Falcon doors",
  awd:"AWD standard",kwh100:34,mpgLab:"100 MPGe",mpgBar:40,ev:true,charger:true,ins:15000,res:9000,rel:2.5,cln:4.0,
  leg2:38.5,leg3:32.2,cargo:15.0,url:"https://www.carvana.com/vehicle/4662079",lt:"View this listing"},
 {n:"Defender 130 SE",y:"2023 \u00b7 28k mi \u00b7 bench 2nd row",cat:"suv",cond:"used",seats:8,row2:"bench",sticker:52713,cash:0,apr:.0449,offer:"San Antonio, 38 mi \u2014 no captain’s chairs",
  awd:"4WD standard",mpg:17,mpgLab:"17",ins:16000,res:20000,rel:1.5,cln:3.0,
  leg2:39.1,leg3:32.0,cargo:15.7,url:"https://www.cars.com/vehicledetail/98adb02f-e784-4474-909b-c4f388ec8aa5/",lt:"View this listing"},
 {n:"Jeep Wagoneer Series II",y:"2024 \u00b7 76k mi \u00b7 $31,590",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:31590,cash:0,apr:.0449,offer:"SOLD 9 Sep 2026 \u2014 was RBFCU 4.49%",
  awd:"4WD available",mpg:20,mpgLab:"20",ins:13000,res:12000,rel:2.0,cln:2.5,leg2:42.7,leg3:36.6,cargo:27.4,
  url:"https://www.carvana.com/vehicle/4676383",lt:"View this listing"},
// Minivans the list was missing. The gas Pacifica is the only minivan besides
// the Sienna you can get with all-wheel drive; the Voyager is the same van on a
// cheaper trim; the Grand Caravan is the floor of the whole segment.
 {n:"Pacifica Touring L AWD",y:"2023 \u00b7 ~55k mi \u00b7 petrol, not hybrid",cat:"van",cond:"used",seats:7,sticker:29590,ship:1290,cash:0,apr:.0449,offer:"The other AWD minivan",
  awd:"AWD standard on this build",mpg:20,mpgLab:"20",ins:11000,res:12500,rel:2.0,cln:4.0,leg2:39.0,leg3:36.5,cargo:32.3,
  url:"https://www.carvana.com/cars/chrysler-pacifica",lt:"Browse listings"},
 {n:"Pacifica Select AWD",y:"2026 \u00b7 AWD, petrol \u00b7 $48,635",cat:"van",cond:"new",seats:7,sticker:48635,cash:0,apr:.0449,offer:"AWD, and it stows away",
  awd:"AWD standard on this build",mpg:20,mpgLab:"20",ins:11500,res:22000,rel:2.0,cln:4.0,leg2:39.0,leg3:36.5,cargo:32.3,
  url:"https://www.chrysler.com/pacifica.html",lt:"Build and find one"},
 {n:"Chrysler Voyager LX",y:"2023 \u00b7 ~62k mi \u00b7 market estimate",cat:"van",cond:"used",seats:7,row2:"ask",sticker:23990,ship:1290,cash:0,apr:.0449,offer:"Cheapest new-ish van",
  awd:"No AWD on this trim",mpg:22,mpgLab:"22",ins:10500,res:9500,rel:2.0,cln:3.5,leg2:39.0,leg3:36.5,cargo:32.3,
  url:"https://www.carvana.com/cars/chrysler-voyager",lt:"Browse listings"},
 {n:"Dodge Grand Caravan SXT",y:"2019 \u00b7 ~92k mi \u00b7 Stow 'n Go buckets",cat:"van",cond:"used",seats:7,sticker:16590,ship:1290,cash:0,apr:.0449,offer:"The cheapest way in",
  awd:"No AWD offered",mpg:20,mpgLab:"20",ins:8500,res:5000,rel:2.0,cln:3.5,leg2:36.5,leg3:32.7,cargo:33.0,
  url:"https://www.carvana.com/cars/dodge-grand-caravan",lt:"Browse listings"},
 {n:"VW ID. Buzz Pro S Plus",y:"2025 \u00b7 ~26k mi \u00b7 6 seats, AWD",cat:"van",cond:"used",seats:6,sticker:52590,cash:0,apr:.0449,offer:"Biggest third row here",
  awd:"AWD standard on this build",mpgLab:"80 MPGe",kwh100:43,mpgBar:36,ev:true,charger:true,ins:13500,res:22000,rel:2.5,cln:4.0,leg2:39.9,leg3:42.4,cargo:18.6,
  url:"https://www.carvana.com/cars/volkswagen-id-buzz",lt:"Browse listings"},
 {n:"VW ID. Buzz Pro S Plus",y:"2026 \u00b7 6 seats, AWD \u00b7 $67,995",cat:"van",cond:"new",seats:6,sticker:67995,cash:0,apr:.0449,offer:"Biggest third row here",
  awd:"AWD standard on this build",mpgLab:"80 MPGe",kwh100:43,mpgBar:36,ev:true,charger:true,ins:14000,res:33000,rel:2.5,cln:4.0,leg2:39.9,leg3:42.4,cargo:18.6,
  url:"https://www.vw.com/en/models/id-buzz.html",lt:"Build and find one"},
// Mainstream three-row SUVs. Every nameplate sold near you with second-row
// captain's chairs available, whether or not it ends up competitive.
 {n:"Chevy Traverse LT AWD",y:"2024 \u00b7 ~48k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:34590,ship:1290,cash:0,apr:.0449,offer:"Buckets standard above LS",
  awd:"AWD available",mpg:21,mpgLab:"21",ins:11500,res:15500,rel:3.0,cln:3.5,leg2:38.4,leg3:33.5,cargo:22.9,
  url:"https://www.carvana.com/cars/chevrolet-traverse",lt:"Browse listings"},
 {n:"Chevy Traverse RS AWD",y:"2026 \u00b7 AWD \u00b7 $50,395",cat:"suv",cond:"new",seats:7,sticker:50395,cash:0,apr:.0449,offer:"GM 5.9% for 60 months",
  awd:"AWD standard on this build",mpg:21,mpgLab:"21",ins:12500,res:26000,rel:3.0,cln:3.5,leg2:38.4,leg3:33.5,cargo:22.9,
  url:"https://www.chevrolet.com/suvs/traverse",lt:"Build and find one"},
 {n:"Chevy Traverse LT",y:"2021 \u00b7 ~78k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:24590,ship:1290,cash:0,apr:.0449,offer:"RBFCU \u2014 check age limit",
  awd:"AWD if optioned",mpg:21,mpgLab:"21",ins:10500,res:9000,rel:2.5,cln:3.5,leg2:38.4,leg3:33.5,cargo:23.0,
  url:"https://www.carvana.com/cars/chevrolet-traverse",lt:"Browse listings"},
 {n:"GMC Acadia AT4 AWD",y:"2024 \u00b7 ~44k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:40590,ship:1290,cash:0,apr:.0449,offer:"Bigger since the 2024 redesign",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:11500,res:18500,rel:3.0,cln:3.5,leg2:41.5,leg3:32.1,cargo:23.0,
  url:"https://www.carvana.com/cars/gmc-acadia",lt:"Browse listings"},
 {n:"Buick Enclave Avenir AWD",y:"2024 \u00b7 ~39k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:44590,cash:0,apr:.0449,offer:"Quietest of the GM three",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:12000,res:20000,rel:3.0,cln:3.5,leg2:41.5,leg3:32.1,cargo:22.9,
  url:"https://www.carvana.com/cars/buick-enclave",lt:"Browse listings"},
 {n:"VW Atlas SEL 4Motion",y:"2024 \u00b7 ~45k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:33590,ship:1290,cash:0,apr:.0449,offer:"Roomy third row for the money",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:11500,res:14000,rel:2.5,cln:3.5,leg2:37.6,leg3:33.7,cargo:20.6,
  url:"https://www.carvana.com/cars/volkswagen-atlas",lt:"Browse listings"},
 {n:"VW Atlas SEL 4Motion",y:"2026 \u00b7 AWD \u00b7 $48,995",cat:"suv",cond:"new",seats:7,sticker:48995,cash:0,apr:.0449,offer:"33.7in third row, 20.6 cu ft",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:12000,res:23000,rel:2.5,cln:3.5,leg2:37.6,leg3:33.7,cargo:20.6,
  url:"https://www.vw.com/en/models/atlas.html",lt:"Build and find one"},
 {n:"Ford Explorer ST-Line AWD",y:"2023 \u00b7 ~58k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:31590,ship:1290,cash:0,apr:.0449,offer:"Buckets optional, check it",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:11500,res:13500,rel:2.5,cln:3.5,leg2:39.0,leg3:32.2,cargo:18.2,
  url:"https://www.carvana.com/cars/ford-explorer",lt:"Browse listings"},
 {n:"Ford Explorer Platinum AWD",y:"2026 \u00b7 AWD \u00b7 $53,595",cat:"suv",cond:"new",seats:7,sticker:53595,cash:0,apr:.0449,offer:"Buckets standard on Platinum",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:12500,res:26000,rel:2.5,cln:3.5,leg2:39.0,leg3:32.2,cargo:18.2,
  url:"https://www.ford.com/suvs/explorer/",lt:"Build and find one"},
 {n:"Expedition MAX Limited 4WD",y:"2023 \u00b7 ~61k mi \u00b7 long wheelbase",cat:"suv",cond:"used",seats:7,sticker:52590,cash:0,apr:.0449,offer:"36 cu ft behind row three",
  awd:"4WD standard on this build",mpg:18,mpgLab:"18",ins:13000,res:23000,rel:2.5,cln:3.0,leg2:41.5,leg3:36.1,cargo:36.0,
  url:"https://www.carvana.com/cars/ford-expedition-max",lt:"Browse listings"},
 {n:"Expedition MAX XLT",y:"2020 \u00b7 80k mi \u00b7 $32,990",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:32990,cash:0,apr:.0449,offer:"$9,200 factory options \u00b7 check buckets",
  awd:"4WD if optioned",mpg:18,mpgLab:"18",ins:11000,res:11000,rel:2.5,cln:3.0,leg2:41.5,leg3:36.1,cargo:36.0,
  url:"https://www.carvana.com/vehicle/4714436",lt:"View this listing"},
 {n:"Expedition MAX Active 4WD",y:"2026 \u00b7 redesigned \u00b7 $75,690",cat:"suv",cond:"new",seats:7,sticker:75690,cash:0,apr:.0449,offer:"37.4 cu ft, 36.5in third row",
  awd:"4WD standard on this build",mpg:18,mpgLab:"18",ins:13500,res:41000,rel:3.0,cln:3.0,leg2:41.5,leg3:36.5,cargo:37.4,
  url:"https://www.ford.com/suvs/expedition/",lt:"Build and find one"},
 {n:"Grand Cherokee L Limited",y:"2023 \u00b7 ~57k mi \u00b7 4x4",cat:"suv",cond:"used",seats:7,sticker:33590,ship:1290,cash:0,apr:.0449,offer:"Small third row",
  awd:"4WD standard on this build",mpg:21,mpgLab:"21",ins:11500,res:14000,rel:2.0,cln:3.0,leg2:38.5,leg3:30.3,cargo:17.2,
  url:"https://www.carvana.com/cars/jeep-grand-cherokee-l",lt:"Browse listings"},
 {n:"Dodge Durango R/T AWD",y:"2023 \u00b7 ~52k mi \u00b7 5.7 V8",cat:"suv",cond:"used",seats:7,sticker:38590,ship:1290,cash:0,apr:.0449,offer:"Tows 8,700 lb",
  awd:"AWD standard on this build",mpg:17,mpgLab:"17",ins:12500,res:16500,rel:2.5,cln:3.0,leg2:38.6,leg3:33.5,cargo:17.2,
  url:"https://www.carvana.com/cars/dodge-durango",lt:"Browse listings"},
 {n:"Mazda CX-9 Signature AWD",y:"2022 \u00b7 ~63k mi \u00b7 last of the CX-9s",cat:"suv",cond:"used",seats:7,sticker:28590,ship:1290,cash:0,apr:.0449,offer:"Nicest cabin under $30k",
  awd:"AWD standard on this build",mpg:23,mpgLab:"23",ins:11000,res:12000,rel:3.5,cln:3.5,leg2:39.4,leg3:29.7,cargo:14.4,
  url:"https://www.carvana.com/cars/mazda-cx-9",lt:"Browse listings"},
 {n:"CX-90 Turbo Premium AWD",y:"2024 \u00b7 ~41k mi \u00b7 petrol, not plug-in",cat:"suv",cond:"used",seats:7,sticker:38590,cash:0,apr:.0449,offer:"25 mpg without the plug",
  awd:"AWD standard on this build",mpg:25,mpgLab:"25",ins:12000,res:17500,rel:3.0,cln:3.5,leg2:39.4,leg3:30.4,cargo:14.9,
  url:"https://www.carvana.com/cars/mazda-cx-90",lt:"Browse listings"},
 {n:"Nissan Armada SL 4WD",y:"2023 \u00b7 ~59k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:41590,cash:0,apr:.0449,offer:"Thirstiest thing here",
  awd:"4WD standard on this build",mpg:15,mpgLab:"15",ins:12500,res:17000,rel:2.5,cln:3.0,leg2:41.0,leg3:28.4,cargo:16.5,
  url:"https://www.carvana.com/cars/nissan-armada",lt:"Browse listings"},
 // The redesigned Armada. Nissan added nearly five inches to the third row and
 // four cubic feet behind it, and the PRO-4X took SUV of Texas two years running.
 {n:"Nissan Armada SV 4x2",y:"2026 \u00b7 advertised offer \u00b7 $58,840",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:58840,cash:0,apr:.029,offer:"2.9% / 72 mo \u00b7 $3,500 cash does not stack",
  awd:"RWD on this build \u2014 4x4 extra",mpg:18,mpgLab:"18",aw:"2026 SUV of Texas, Texas Auto Writers",awUrl:"https://usa.nissannews.com/en-US/releases/nissan-armada-pro-4x-named-2026-suv-of-texas",ins:13000,res:26500,rel:2.5,cln:3.0,leg2:39.2,leg3:32.9,cargo:20.4,
  url:"https://www.nissanusa.com/vehicles/crossovers-suvs/armada/deals-incentives-offers.html",lt:"View this offer"},
 {n:"Nissan Armada PRO-4X",y:"2026 \u00b7 4WD std \u00b7 $76,490",cat:"suv",cond:"new",seats:7,row2:"ask",sticker:76490,cash:0,apr:.029,offer:"2.9% / 72 mo \u00b7 check for buckets",
  awd:"4WD standard",mpg:17,mpgLab:"17",aw:"2026 SUV of Texas, Texas Auto Writers",awUrl:"https://usa.nissannews.com/en-US/releases/nissan-armada-pro-4x-named-2026-suv-of-texas",ins:13500,res:34500,rel:2.5,cln:3.0,leg2:39.2,leg3:32.9,cargo:20.4,
  url:"https://www.nissanusa.com/vehicles/crossovers-suvs/armada.html",lt:"Build and find one"},
 {n:"Nissan Armada SL 4x4",y:"2026 \u00b7 4WD \u00b7 $68,720",cat:"suv",cond:"new",seats:7,sticker:68720,cash:0,apr:.029,offer:"2.9% / 72 mo \u00b7 $7,770 under the PRO-4X",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",aw:"2026 SUV of Texas, Texas Auto Writers",awUrl:"https://usa.nissannews.com/en-US/releases/nissan-armada-pro-4x-named-2026-suv-of-texas",ins:13500,res:31000,rel:2.5,cln:3.0,leg2:39.2,leg3:32.9,cargo:20.4,
  url:"https://www.nissanusa.com/vehicles/crossovers-suvs/armada.html",lt:"Build and find one"},
 {n:"Nissan Armada SL 4x4",y:"2025 \u00b7 ~31k mi \u00b7 redesigned body",cat:"suv",cond:"used",seats:7,sticker:52590,cash:0,apr:.0449,offer:"The redesign, used",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",aw:"2026 SUV of Texas, Texas Auto Writers",awUrl:"https://usa.nissannews.com/en-US/releases/nissan-armada-pro-4x-named-2026-suv-of-texas",ins:13000,res:21000,rel:2.5,cln:3.0,leg2:39.2,leg3:32.9,cargo:20.4,
  url:"https://www.carvana.com/cars/nissan-armada",lt:"Browse listings"},
 {n:"Nissan Pathfinder SL 4WD",y:"2023 \u00b7 ~54k mi \u00b7 yours, but new",cat:"suv",cond:"used",seats:7,sticker:31590,ship:1290,cash:0,apr:.0449,offer:"Your car, seven years on",
  awd:"4WD standard on this build",mpg:22,mpgLab:"22",ins:11000,res:13000,rel:3.0,cln:3.5,leg2:35.5,leg3:28.0,cargo:16.6,
  url:"https://www.carvana.com/cars/nissan-pathfinder",lt:"Browse listings"},
 {n:"Grand Highlander XLE",y:"2024 \u00b7 ~43k mi \u00b7 petrol, not hybrid",cat:"suv",cond:"used",seats:7,sticker:43590,cash:0,apr:.0449,offer:"Same body, no hybrid premium",
  awd:"AWD if optioned",mpg:24,mpgLab:"24",ins:12000,res:21000,rel:4.0,cln:3.5,leg2:39.5,leg3:33.5,cargo:20.6,
  url:"https://www.carvana.com/cars/toyota-grand-highlander",lt:"Browse listings"},
 {n:"Grand Highlander XLE AWD",y:"2026 \u00b7 petrol AWD \u00b7 $50,995",cat:"suv",cond:"new",seats:7,sticker:50995,cash:0,apr:.0449,offer:"$8,700 under the hybrid Ltd",
  awd:"AWD standard on this build",mpg:24,mpgLab:"24",ins:12500,res:30000,rel:4.0,cln:3.5,leg2:39.5,leg3:33.5,cargo:20.6,
  url:"https://www.toyota.com/grandhighlander/",lt:"Build and find one"},
 {n:"Toyota Highlander XLE AWD",y:"2023 \u00b7 ~56k mi \u00b7 petrol, not hybrid",cat:"suv",cond:"used",seats:7,sticker:33590,ship:1290,cash:0,apr:.0449,offer:"Tiny third row, big record",
  awd:"AWD standard on this build",mpg:24,mpgLab:"24",ins:11500,res:15500,rel:4.5,cln:3.5,leg2:41.0,leg3:27.7,cargo:16.0,
  url:"https://www.carvana.com/cars/toyota-highlander",lt:"Browse listings"},
 {n:"Honda Pilot EX-L AWD",y:"2023 \u00b7 ~51k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:34590,ship:1290,cash:0,apr:.0449,offer:"TrailSport space, less money",
  awd:"AWD standard on this build",mpg:21,mpgLab:"21",ins:11500,res:15500,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://www.carvana.com/cars/honda-pilot",lt:"Browse listings"},
 {n:"Honda Pilot EX-L AWD",y:"2026 \u00b7 AWD \u00b7 $46,595",cat:"suv",cond:"new",seats:7,sticker:46595,cash:0,apr:.0449,offer:"$3,400 under TrailSport",
  awd:"AWD standard on this build",mpg:21,mpgLab:"21",ins:12000,res:26000,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://automobiles.honda.com/pilot",lt:"Build and find one"},
 {n:"Santa Fe Calligraphy AWD",y:"2024 \u00b7 ~42k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:35590,cash:0,apr:.0449,offer:"Third row for kids only",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:11500,res:16000,rel:3.5,cln:3.5,leg2:41.7,leg3:30.0,cargo:14.6,
  url:"https://www.carvana.com/cars/hyundai-santa-fe",lt:"Browse listings"},
 {n:"Kia Sorento SX-Prestige",y:"2023 \u00b7 ~49k mi \u00b7 AWD",cat:"suv",cond:"used",seats:7,sticker:30590,ship:1290,cash:0,apr:.0449,offer:"Smallest boot on this page",
  awd:"AWD standard on this build",mpg:24,mpgLab:"24",ins:11000,res:13500,rel:3.5,cln:3.5,leg2:41.7,leg3:29.6,cargo:12.6,
  url:"https://www.carvana.com/cars/kia-sorento",lt:"Browse listings"},
// Older than four years, kept in because the reviews are good and the price is
// right. The rest of this block is under 100,000 miles; the two 2016 Sequoia
// SR5s are the exception, because they are local and you asked. Third Coast's
// is RWD at 121k; the San Antonio Marketplace 4x4 is at 141k. Both have a
// second-row bench, not captain's chairs.
// The cost model still charges them for the mileage you will add, so read the
// five-year figure, not the sticker.
 {n:"Kia Sedona SX",y:"2020 \u00b7 ~79k mi \u00b7 the Carnival before it",cat:"van",cond:"used",seats:7,row2:"lounge",sticker:20590,ship:1290,cash:0,apr:.0449,offer:"Lounge seats, cheap",
  awd:"No AWD offered",mpg:21,mpgLab:"21",ins:9500,res:7500,rel:3.0,cln:3.5,leg2:40.4,leg3:31.5,cargo:33.9,
  url:"https://www.carvana.com/cars/kia-sedona",lt:"Browse listings"},
 {n:"Honda Pilot EX-L AWD",y:"2021 \u00b7 ~78k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:26590,ship:1290,cash:0,apr:.0449,offer:"RBFCU \u2014 check age limit",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:10500,res:9500,rel:4.0,cln:3.5,leg2:38.4,leg3:31.9,cargo:16.5,
  url:"https://www.carvana.com/cars/honda-pilot",lt:"Browse listings"},
 {n:"Toyota Sequoia Platinum",y:"2019 \u00b7 ~88k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:38590,cash:0,apr:.0449,offer:"Bulletproof, and drinks it",
  awd:"4WD available",mpg:15,mpgLab:"15",ins:11500,res:14000,rel:4.5,cln:3.0,leg2:40.9,leg3:35.3,cargo:18.9,
  url:"https://www.carvana.com/cars/toyota-sequoia",lt:"Browse listings"},
 {n:"Toyota Sequoia SR5",y:"2016 \u00b7 121k mi \u00b7 bench 2nd row \u00b7 $20,900",cat:"suv",cond:"used",seats:8,row2:"bench",sticker:20900,cash:0,apr:.0449,offer:"Third Coast NB \u2014 no captains",
  awd:"RWD on this build",mpg:15,mpgLab:"15",ins:10000,res:8500,rel:4.5,cln:3.0,leg2:40.9,leg3:35.3,cargo:18.9,
  url:"https://www.thirdcoastautos.com/vehicle-details/used-2016-toyota-sequoia-sr5-5-7l-2wd-new-braunfels-tx-id-63154060",lt:"View this listing"},
 {n:"Toyota Sequoia SR5",y:"2016 \u00b7 141k mi \u00b7 bench 2nd row \u00b7 $22,114",cat:"suv",cond:"used",seats:8,row2:"bench",sticker:22114,cash:0,apr:.0449,offer:"Private seller SA \u2014 no captains",
  awd:"4WD on this build",mpg:15,mpgLab:"15",ins:10000,res:7500,rel:4.5,cln:3.0,leg2:40.9,leg3:35.3,cargo:18.9,
  url:"https://www.facebook.com/marketplace/item/2012120399440562/",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2016 \u00b7 ~95k mi \u00b7 old body style",cat:"van",cond:"used",seats:7,sticker:16590,ship:1290,cash:0,apr:.0449,offer:"Most van per dollar here",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:8500,res:5500,rel:3.0,cln:3.5,leg2:40.9,leg3:38.1,cargo:38.4,
  url:"https://www.carvana.com/cars/honda-odyssey",lt:"Browse listings"},
 {n:"Chevy Tahoe LT 4WD",y:"2018 \u00b7 ~94k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:27590,ship:1290,cash:0,apr:.0449,offer:"24.8in third row, the trap",
  awd:"4WD standard on this build",mpg:17,mpgLab:"17",ins:10500,res:10000,rel:3.0,cln:3.0,leg2:39.7,leg3:24.8,cargo:15.3,
  url:"https://www.carvana.com/cars/chevrolet-tahoe",lt:"Browse listings"},
 {n:"Ford Flex Limited AWD",y:"2019 \u00b7 ~86k mi \u00b7 last model year",cat:"suv",cond:"used",seats:7,sticker:22590,ship:1290,cash:0,apr:.0449,offer:"A box, and owners love it",
  awd:"AWD standard on this build",mpg:19,mpgLab:"19",ins:9500,res:7500,rel:3.0,cln:3.5,leg2:44.3,leg3:33.3,cargo:20.0,
  url:"https://www.carvana.com/cars/ford-flex",lt:"Browse listings"},
// The luxury end. Included so the list is complete, not because the running
// costs make sense: every one of these carries a dealer-only repair bill.
 {n:"Escalade ESV Premium Lux",y:"2022 \u00b7 ~68k mi \u00b7 long wheelbase",cat:"suv",cond:"used",seats:7,sticker:63590,cash:0,apr:.0449,offer:"Suburban in a dinner jacket",
  awd:"4WD standard on this build",mpg:16,mpgLab:"16",ins:15000,res:26000,rel:2.5,cln:3.0,leg2:41.7,leg3:34.9,cargo:41.5,
  url:"https://www.carvana.com/cars/cadillac-escalade-esv",lt:"Browse listings"},
 {n:"Navigator L Reserve 4x4",y:"2022 \u00b7 ~64k mi \u00b7 long wheelbase",cat:"suv",cond:"used",seats:7,sticker:58590,cash:0,apr:.0449,offer:"Best big-SUV interior",
  awd:"4WD standard on this build",mpg:18,mpgLab:"18",ins:14500,res:23000,rel:2.5,cln:3.0,leg2:41.5,leg3:36.1,cargo:34.3,
  url:"https://www.carvana.com/cars/lincoln-navigator-l",lt:"Browse listings"},
 {n:"Grand Wagoneer Series II",y:"2022 \u00b7 ~71k mi \u00b7 6.4 V8",cat:"suv",cond:"used",seats:7,sticker:52590,cash:0,apr:.0449,offer:"15 mpg, worst owner score",
  awd:"4WD standard on this build",mpg:15,mpgLab:"15",ins:14500,res:18000,rel:2.0,cln:2.5,leg2:42.7,leg3:36.6,cargo:27.4,
  url:"https://www.carvana.com/cars/jeep-grand-wagoneer",lt:"Browse listings"},
 {n:"Infiniti QX80 Sensory 4WD",y:"2022 \u00b7 ~66k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:44590,cash:0,apr:.0449,offer:"Cheap for the size",
  awd:"4WD standard on this build",mpg:15,mpgLab:"15",ins:13500,res:16000,rel:3.0,cln:3.0,leg2:41.0,leg3:28.5,cargo:16.6,
  url:"https://www.carvana.com/cars/infiniti-qx80",lt:"Browse listings"},
 {n:"Infiniti QX60 Sensory AWD",y:"2023 \u00b7 ~51k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:36590,ship:1290,cash:0,apr:.0449,offer:"Buckets standard on Sensory",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:12000,res:15000,rel:3.0,cln:3.5,leg2:38.7,leg3:27.8,cargo:14.5,
  url:"https://www.carvana.com/cars/infiniti-qx60",lt:"Browse listings"},
 {n:"Acura MDX Advance SH-AWD",y:"2022 \u00b7 ~57k mi \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:37590,ship:1290,cash:0,apr:.0449,offer:"Drives best of this group",
  awd:"AWD standard on this build",mpg:22,mpgLab:"22",ins:12500,res:15500,rel:3.5,cln:3.5,leg2:38.5,leg3:29.1,cargo:16.3,
  url:"https://www.carvana.com/cars/acura-mdx",lt:"Browse listings"},
 {n:"Lexus TX 350 Premium AWD",y:"2024 \u00b7 ~38k mi \u00b7 6 seats",cat:"suv",cond:"used",seats:6,sticker:50590,cash:0,apr:.0449,offer:"Sienna bones, Lexus badge",
  awd:"AWD standard on this build",mpg:23,mpgLab:"23",ins:13000,res:25000,rel:4.5,cln:3.5,leg2:39.4,leg3:33.5,cargo:20.2,
  url:"https://www.carvana.com/cars/lexus-tx",lt:"Browse listings"},
 {n:"Lexus TX 350 Premium AWD",y:"2026 \u00b7 6 seats, AWD \u00b7 $60,140",cat:"suv",cond:"new",seats:6,sticker:60140,cash:0,apr:.0449,offer:"Best-reviewed thing here",
  awd:"AWD standard on this build",mpg:23,mpgLab:"23",ins:13500,res:36000,rel:4.5,cln:3.5,leg2:39.4,leg3:33.5,cargo:20.2,
  url:"https://www.lexus.com/models/TX",lt:"Build and find one"},
 {n:"Volvo XC90 B6 Inscription",y:"2022 \u00b7 ~58k mi \u00b7 6 seats",cat:"suv",cond:"used",seats:6,sticker:36590,ship:1290,cash:0,apr:.0449,offer:"Small third row, big bills",
  awd:"AWD standard on this build",mpg:23,mpgLab:"23",ins:13000,res:14000,rel:2.5,cln:3.5,leg2:37.0,leg3:31.9,cargo:15.8,
  url:"https://www.carvana.com/cars/volvo-xc90",lt:"Browse listings"},
 {n:"BMW X7 xDrive40i",y:"2022 \u00b7 ~62k mi \u00b7 6 seats",cat:"suv",cond:"used",seats:6,sticker:48590,cash:0,apr:.0449,offer:"12.8 cu ft behind row three",
  awd:"AWD standard on this build",mpg:23,mpgLab:"23",ins:15000,res:18000,rel:2.5,cln:3.0,leg2:37.6,leg3:33.3,cargo:12.8,
  url:"https://www.carvana.com/cars/bmw-x7",lt:"Browse listings"},
 {n:"Mercedes GLS 450 4Matic",y:"2022 \u00b7 ~60k mi \u00b7 buckets optional",cat:"suv",cond:"used",seats:7,row2:"ask",sticker:52590,cash:0,apr:.0449,offer:"Check for the buckets",
  awd:"AWD standard on this build",mpg:21,mpgLab:"21",ins:15000,res:20000,rel:2.5,cln:3.0,leg2:41.9,leg3:34.6,cargo:17.4,
  url:"https://www.carvana.com/cars/mercedes-benz-gls",lt:"Browse listings"},
// The three-row electrics. Like the EV9, Rivian and Model X already here, every
// one of them seats six once you fit captain's chairs.
 {n:"Hyundai Ioniq 9 Calligraphy",y:"2026 \u00b7 6 seats, AWD \u00b7 $60,555",cat:"suv",cond:"new",seats:6,sticker:60555,cash:0,apr:.0399,offer:"EV9's roomier cousin",
  awd:"AWD standard on this build",mpgLab:"85 MPGe",kwh100:39,mpgBar:38,ev:true,charger:true,ins:13500,res:30000,rel:2.5,cln:4.0,leg2:42.8,leg3:32.0,cargo:21.9,
  url:"https://www.hyundaiusa.com/us/en/vehicles/ioniq-9",lt:"Build and find one"},
 {n:"Cadillac Vistiq Luxury 1",y:"2026 \u00b7 6 seats, AWD \u00b7 $79,090",cat:"suv",cond:"new",seats:6,sticker:79090,cash:0,apr:.0449,offer:"Newest thing on the page",
  awd:"AWD standard on this build",mpgLab:"80 MPGe",kwh100:43,mpgBar:36,ev:true,charger:true,ins:15000,res:38000,rel:2.0,cln:3.5,leg2:40.2,leg3:30.6,cargo:15.2,
  url:"https://www.cadillac.com/electric/vistiq",lt:"Build and find one"},
 {n:"Volvo EX90 Twin Motor Plus",y:"2025 \u00b7 ~24k mi \u00b7 6 seats",cat:"suv",cond:"used",seats:6,sticker:54590,cash:0,apr:.0449,offer:"Smallest boot on this page",
  awd:"AWD standard on this build",mpgLab:"79 MPGe",kwh100:43,mpgBar:35,ev:true,charger:true,ins:14500,res:20000,rel:1.5,cln:3.5,leg2:36.5,leg3:31.9,cargo:12.9,
  url:"https://www.carvana.com/cars/volvo-ex90",lt:"Browse listings"},
// ---------------------------------------------------------------------------
// Kia Carnival sweep, 8 Sep 2026. Every Carnival offered between Austin, New
// Braunfels and San Antonio, new and used. LX and LXS are bench-only, so the
// list starts at EX. 2025–2026 EX and SX are sliding eight-passenger seats, not
// captain's chairs. SX Prestige in those years is VIP lounge captains. The 2026
// V6 Prestige at World Car New Braunfels and the Carvana Hybrid Prestige are
// both lounge. The 2027 Round Rock Hybrid SX is confirmed regular captains.
// Every one is front-wheel drive; Kia has never built an
// AWD Carnival. New prices are MSRP less the dealer discounts advertised in
// the corridor (KFA Dealer Choice $1,500-$2,000) and Kia's $750 Sticker Sales
// Event bonus cash. The 2026 Carnival Hybrid KFA ladder (1.90% / 48, 2.99% / 60,
// 3.99% / 72, through 30 Sep 2026) keeps the dealer discount — Kia's own
// disclosure allows dealer contribution — but not the $750 bonus cash or
// military $500. Fine print: offers may not be combined except where specified.
// The Kia payment estimator's 4.49% "sell rate" is the ordinary KFA rate, not
// the cheap APR, and that is why Military appears as a separate tick. The
// 2.99%/72 V6 rate cannot be combined with discounts, so it is priced as its
// own card at full MSRP. New 2027 Carnival Hybrids carry Kia's 2.90% for 48
// months (qualified) at the listed price. Used cars are Carvana San Antonio
// stock; mileage is from the listing, the exact VIN was not opened, so the
// link is the search page.
// ---------------------------------------------------------------------------
 {n:"Kia Carnival EX",y:"2026 \u00b7 $1,500 off + $750 \u00b7 $39,690",cat:"van",cond:"new",seats:7,row2:"bench",sticker:39690,cash:750,apr:.0449,offer:"World Car Kia, New Braunfels",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12000,res:20500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.worldcarkianorth.com/search/new-kia-carnival-san-antonio-tx/?cy=78201&md=10821&tp=new",lt:"Browse New Braunfels / SA stock"},
 {n:"Kia Carnival EX",y:"2026 \u00b7 2.99% / 72 mo \u00b7 $41,190",cat:"van",cond:"new",seats:7,row2:"bench",sticker:41190,cash:0,apr:.0299,term:72,offer:"Cheap rate, no discounts stack",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12000,res:20500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.worldcarkianorth.com/search/new-kia-carnival-san-antonio-tx/?cy=78201&md=10821&tp=new",lt:"Browse New Braunfels / SA stock"},
 {n:"Kia Carnival Hybrid EX",y:"2026 \u00b7 $1,500 off \u00b7 KFA \u00b7 $42,090",cat:"van",cond:"new",seats:7,row2:"bench",sticker:42090,cash:0,apr:.0299,aprByTerm:KFA_CARNIVAL_HYBRID_2026,offer:"KFA 1.90–3.99% + dealer off, no Kia cash \u00b7 World Car",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12500,res:23000,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.kiaworldcar.com/search/new-kia-carnival-hybrid-san-antonio-tx/?cy=78201&md=22648&tp=new",lt:"Browse hybrid stock"},
 {n:"Kia Carnival Hybrid SX",y:"2026 \u00b7 $2,000 off \u00b7 KFA \u00b7 $46,490",cat:"van",cond:"new",seats:7,row2:"bench",sticker:46490,cash:0,apr:.0299,aprByTerm:KFA_CARNIVAL_HYBRID_2026,offer:"KFA 1.90–3.99% + dealer off, no Kia cash \u00b7 World Car South",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12500,res:25500,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.kiaworldcar.com/search/new-kia-carnival-hybrid-san-antonio-tx/?cy=78201&md=22648&tp=new",lt:"Browse hybrid stock"},
 {n:"Kia Carnival SX Prestige",y:"2026 \u00b7 V6, lounge 2nd \u00b7 $52,631",cat:"van",cond:"new",seats:7,row2:"lounge",sticker:52631,cash:0,apr:.0449,offer:"World Car Kia New Braunfels",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:13000,res:29000,rel:3.0,cln:3.5,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.worldcarkiaonline.com/auto/new-2026-kia-carnival-mpv-sx-prestige-new-braunfels-tx/120474272/",lt:"View this listing"},
 {n:"Kia Carnival Hybrid EX",y:"2027 \u00b7 2.90% / 48 mo \u00b7 $43,690",cat:"van",cond:"new",seats:7,row2:"ask",sticker:43690,cash:0,apr:.029,term:48,offer:"2.90% / 48 mo \u00b7 Kia of North Austin, \u224865 mi",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12500,res:23500,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.kianorthaustin.com/new-kia/carnival-north-austin-tx.htm",lt:"Browse Austin stock"},
 {n:"Kia Carnival Hybrid SX",y:"2027 \u00b7 captains \u00b7 2.90% / 48 \u00b7 $50,864",cat:"van",cond:"new",seats:7,row2:"captains",sticker:50864,cash:0,apr:.029,term:48,offer:"2.90% / 48 mo \u00b7 Kia of Round Rock, \u224860 mi",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:13000,res:27000,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.cargurus.com/details/454878506",lt:"View this listing"},
 {n:"Kia Carnival SX",y:"2023 \u00b7 28k mi \u00b7 $38,590",cat:"van",cond:"used",seats:7,row2:"bench",sticker:38590,cash:0,apr:.0449,offer:"Carvana San Antonio",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:11500,res:16000,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/cars/kia-carnival-in-san-antonio-tx",lt:"Browse San Antonio listings"},
 {n:"Kia Carnival EX",y:"2024 \u00b7 56k mi \u00b7 $33,590",cat:"van",cond:"used",seats:7,row2:"bench",sticker:33590,cash:0,apr:.0449,offer:"Cheapest EX in the corridor",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:11000,res:13500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/cars/kia-carnival-in-san-antonio-tx",lt:"Browse San Antonio listings"},
 {n:"Kia Carnival SX",y:"2024 \u00b7 61k mi \u00b7 $37,990",cat:"van",cond:"used",seats:7,row2:"bench",sticker:37990,cash:0,apr:.0449,offer:"Carvana San Antonio",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:11500,res:14000,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/cars/kia-carnival-in-san-antonio-tx",lt:"Browse San Antonio listings"},
 {n:"Kia Carnival Hybrid EX",y:"2025 \u00b7 hybrid \u00b7 $42,590",cat:"van",cond:"used",seats:7,row2:"bench",sticker:42590,cash:0,apr:.0449,offer:"Mileage not shown \u2014 ask",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:12000,res:20000,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/cars/kia-carnival-in-san-antonio-tx",lt:"Browse San Antonio listings"},
// --- Corridor listings, cars.com sweep 9 Sep 2026 (zip 78130, 75 mi).
// Second-row captain’s chairs confirmed in each seller’s own listing text;
// the confirming phrase is noted beside each. Specs, insurance, reliability
// and cleanability are inherited from the matching model already on the list;
// resale is that model’s figure scaled to this car’s price.
 // Ford Explorer XLT — “ActiveX Captain's Chairs”
 {n:"Ford Explorer XLT",y:"2022 \u00b7 87k mi \u00b7 $20,964",cat:"suv",cond:"used",seats:7,sticker:20964,cash:0,apr:.0449,offer:"Austin, 39 mi \u00b7 captains confirmed",
  awd:"RWD on this listing",mpg:22,mpgLab:"22",ins:11500,res:9000,rel:2.5,cln:3.5,
  leg2:39,leg3:32.2,cargo:18.2,url:"https://www.cars.com/vehicledetail/8b390f02-f52b-48b7-8fbe-460da3715d80/",lt:"View this listing"},
 // Nissan Armada SL — “Captain's Chairs Package”
 {n:"Nissan Armada SL",y:"2023 \u00b7 50k mi \u00b7 $36,145",cat:"suv",cond:"used",seats:7,sticker:36145,cash:0,apr:.0449,offer:"Boerne, 39 mi \u00b7 captains confirmed",
  awd:"RWD on this listing",mpg:15,mpgLab:"15",ins:12500,res:15000,rel:2.5,cln:3,
  leg2:41,leg3:28.4,cargo:16.5,url:"https://www.cars.com/vehicledetail/18b505ca-33f4-4815-ab35-e2275420620e/",lt:"View this listing"},
 // Subaru Ascent Touring — “Second Row Captain's Chairs”
 {n:"Subaru Ascent Touring",y:"2024 \u00b7 39k mi \u00b7 $33,868",cat:"suv",cond:"used",seats:7,sticker:33868,cash:0,apr:.0449,offer:"Austin, 51 mi \u00b7 captains confirmed",
  awd:"AWD standard",mpg:22,mpgLab:"22",ins:12000,res:18000,rel:3.5,cln:3.5,
  leg2:38.6,leg3:31.7,cargo:17.6,url:"https://www.cars.com/vehicledetail/912a0020-ac50-416b-84f4-2ed39ee70558/",lt:"View this listing"},
 // Navigator L Black Label — “Htd/Ventilated Captain's Chairs (B)”
 {n:"Navigator L Black Label",y:"2021 \u00b7 57k mi \u00b7 $46,725",cat:"suv",cond:"used",seats:7,sticker:46725,cash:0,apr:.0449,offer:"San Antonio, 29 mi \u00b7 captains confirmed",
  awd:"4WD on this listing",mpg:18,mpgLab:"18",ins:14500,res:18500,rel:2.5,cln:3,
  leg2:41.5,leg3:36.1,cargo:34.3,url:"https://www.cars.com/vehicledetail/345d5ba9-7463-4015-83d6-fffa77529777/",lt:"View this listing"},
 // BMW X7 xDrive40i — “Second-Row Captain's Chairs”
 {n:"BMW X7 xDrive40i",y:"2019 \u00b7 89k mi \u00b7 $27,478",cat:"suv",cond:"used",seats:6,sticker:27478,cash:0,apr:.0449,offer:"Lakeway, 47 mi \u00b7 captains confirmed",
  awd:"AWD standard",mpg:23,mpgLab:"23",ins:15000,res:10000,rel:2.5,cln:3,
  leg2:37.6,leg3:33.3,cargo:12.8,url:"https://www.cars.com/vehicledetail/f25563dc-bb43-47c1-9210-e6010e77c7ca/",lt:"View this listing"},
 // BMW X7 xDrive40i — “2nd-row captain's chairs”
 {n:"BMW X7 xDrive40i",y:"2024 \u00b7 19k mi \u00b7 $61,215",cat:"suv",cond:"used",seats:6,sticker:61215,cash:0,apr:.0449,offer:"Austin, 55 mi \u00b7 captains confirmed",
  awd:"AWD standard",mpg:23,mpgLab:"23",ins:15000,res:22500,rel:2.5,cln:3,
  leg2:37.6,leg3:33.3,cargo:12.8,url:"https://www.cars.com/vehicledetail/e7f97a86-a88b-4d41-9a19-3c6983b685a4/",lt:"View this listing"},
 // Lexus TX 350 Luxury — “heated & ventilated 2nd row captain's chairs”
 {n:"Lexus TX 350 Luxury",y:"2026 \u00b7 3k mi \u00b7 $69,215",cat:"suv",cond:"used",seats:6,sticker:69215,cash:0,apr:.0449,offer:"Austin, 55 mi \u00b7 captains confirmed",
  awd:"AWD on this listing",mpg:23,mpgLab:"23",ins:13000,res:34000,rel:4.5,cln:3.5,
  leg2:39.4,leg3:33.5,cargo:20.2,url:"https://www.cars.com/vehicledetail/f1e1cf84-2e58-4b80-96b9-426e10295bc7/",lt:"View this listing"},
 // Kia Carnival SX Prestige — “2nd Row Power VIP Lounge Seats”
 {n:"Kia Carnival SX Prestige",y:"2027 \u00b7 51 mi \u00b7 $55,623",cat:"van",cond:"used",seats:7,row2:"lounge",sticker:55623,cash:0,apr:.0449,offer:"Austin, 55 mi \u00b7 captains confirmed",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:13000,res:30500,rel:3,cln:3.5,
  leg2:40.5,leg3:35.6,cargo:40.2,url:"https://www.cars.com/vehicledetail/c380ad5e-2a17-4f6f-b793-084cfd07f6cd/",lt:"View this listing"},
 // Dodge Grand Caravan SE — “2nd Row Stow 'N Go Bucket Seats”
 {n:"Dodge Grand Caravan SE",y:"2019 \u00b7 21k mi \u00b7 $19,109",cat:"van",cond:"used",seats:7,sticker:19109,cash:0,apr:.0449,offer:"San Antonio, 34 mi \u00b7 captains confirmed",
  awd:"No AWD offered",mpg:20,mpgLab:"20",ins:8500,res:6000,rel:2,cln:3.5,
  leg2:36.5,leg3:32.7,cargo:33,url:"https://www.cars.com/vehicledetail/91f81586-5885-44d0-a541-54895d26db11/",lt:"View this listing"},
 // GMC Yukon Denali — “Power Release 2nd Row Bucket Seats”
 {n:"GMC Yukon Denali",y:"2023 \u00b7 76k mi \u00b7 $48,523",cat:"suv",cond:"used",seats:7,sticker:48523,cash:0,apr:.0449,offer:"Austin, 54 mi \u00b7 captains confirmed",
  awd:"RWD on this listing",mpg:16,mpgLab:"16",ins:13500,res:23000,rel:2.5,cln:3,
  leg2:42,leg3:34.9,cargo:25.5,url:"https://www.cars.com/vehicledetail/70264cc3-cd36-41e3-a4c0-9076b68af616/",lt:"View this listing"},
 // GMC Yukon XL Denali — “Power Release 2nd Row Bucket Seats”
 {n:"GMC Yukon XL Denali",y:"2019 \u00b7 97k mi \u00b7 $31,741",cat:"suv",cond:"used",seats:7,sticker:31741,cash:0,apr:.0449,offer:"Austin, 43 mi \u00b7 captains confirmed",
  awd:"4WD on this listing",mpg:17,mpgLab:"17",ins:12500,res:14000,rel:2.5,cln:3,
  leg2:42,leg3:36.7,cargo:41.5,url:"https://www.cars.com/vehicledetail/5a9739f9-5b6d-4115-89dd-3207e0e24961/",lt:"View this listing"},
];

export const MATRIX=[
 ["van","Toyota Sienna",78.6,33.5,36,71],
 ["van","Honda Odyssey",79.0,32.8,22,60],
 ["van","Kia Carnival",76.1,40.2,22,55],
 ["van","Pacifica Hybrid",75.5,32.3,82,45],
 ["suv","Grand Highlander Hyb",73.0,20.6,36,62],
 ["suv","Toyota Sequoia",72.9,11.5,21,58],
 ["suv","Chevy Tahoe / Yukon",76.9,25.5,17,57],
 ["suv","Telluride Hyb (2027)",75.1,21.3,35,55],
 ["suv","Suburban / Yukon XL",78.7,41.5,17,55],
 ["suv","Kia Telluride (2024)",73.8,21.0,22,55],
 ["suv","Palisade Hybrid (2026)",75.1,19.1,34,57],
 ["suv","Honda Pilot TrailSport",73.3,18.6,21,55],
 ["suv","Subaru Ascent Onyx",70.3,17.6,22,52],
 ["suv","Mazda CX-90 PHEV",69.8,14.9,56,45],
 ["suv","Highlander Hybrid",68.7,16.0,35,58],
 ["suv","Ford Expedition",77.6,20.9,19,48],
 ["suv","Land Rover Defender 130",71.1,15.7,17,45],
 ["suv","Jeep Wagoneer",79.3,27.4,20,42],
 ["suv","Nissan Armada 2021-24",69.4,16.5,16,42],
 ["suv","Nissan Armada (2025+)",72.1,20.4,17,45],
 ["suv","Rivian R1S",70.4,17.7,null,40],
 ["suv","Tesla Model X",70.7,15.0,null,38],
 ["suv","Kia EV9",74.8,20.2,null,37],
 ["van","Pacifica AWD (petrol)",75.5,32.3,20,45],
 ["van","Chrysler Voyager",75.5,32.3,22,40],
 ["van","Odyssey 2011-2017",79.0,38.4,22,32],
 ["van","Dodge Grand Caravan",69.2,33.0,20,30],
 ["van","VW ID. Buzz",82.3,18.6,null,40],
 ["suv","Expedition MAX (2025)",78.0,37.4,18,50],
 ["suv","Cadillac Escalade ESV",76.6,41.5,16,48],
 ["suv","Lincoln Navigator L",77.6,34.3,18,42],
 ["suv","GMC Yukon XL",78.7,41.5,17,56],
 ["suv","Grand Wagoneer",79.3,27.4,15,38],
 ["suv","Sequoia 2008-2022",76.2,18.9,15,50],
 ["suv","Mercedes GLS",76.5,17.4,21,42],
 ["suv","Ford Flex",77.6,20.0,19,35],
 ["suv","Hyundai Ioniq 9",74.8,21.9,null,40],
 ["suv","GMC Acadia (2024)",73.6,23.0,22,50],
 ["suv","Buick Enclave (2024)",73.6,22.9,22,48],
 ["suv","Lexus TX",72.9,20.2,23,58],
 ["suv","Grand Highlander (petrol)",73.0,20.6,24,60],
 ["suv","Dodge Durango",72.1,17.2,17,44],
 ["suv","Chevy Traverse",71.9,22.9,21,52],
 ["suv","Hyundai Santa Fe",71.7,14.6,22,52],
 ["suv","VW Atlas",71.3,20.6,22,45],
 ["suv","Kia Sorento",71.3,12.6,24,50],
 ["suv","Ford Explorer",71.2,18.2,22,47],
 ["suv","BMW X7",70.9,12.8,23,42],
 ["suv","Cadillac Vistiq",70.8,15.2,null,38],
 ["suv","Infiniti QX80",69.5,16.6,15,40],
 ["suv","Mazda CX-9",69.1,14.4,23,46],
 ["suv","Volvo XC90",68.9,15.8,23,40],
 ["suv","Grand Cherokee L",68.8,17.2,21,45],
 ["suv","Highlander (petrol)",68.7,16.0,24,58],
 ["suv","Volvo EX90",68.4,12.9,null,35],
 ["suv","Acura MDX",67.6,16.3,22,50],
 ["suv","Infiniti QX60",66.5,14.5,22,45],
 ["suv","Tahoe 2015-2020",64.5,15.3,17,45],
 ["van","Kia Sedona",71.9,33.9,21,35],
 ["suv","Honda Pilot 2016-2022",70.3,16.5,22,48]
];

export const SPECS=[
 ["van","Toyota Sienna",7,39.9,38.7,33.5,"36",0],
 ["van","Honda Odyssey",7,40.9,38.1,32.8,"22",0],
 ["van","Pacifica Hybrid",7,39.0,36.5,32.3,"82e",0],
 ["van","Kia Carnival",7,40.5,35.6,40.2,"22",0],
 ["suv","Chevy Suburban",7,42.0,36.7,41.5,"17",0],
 ["suv","GMC Yukon XL",7,42.0,36.7,41.5,"17",0],
 ["suv","Jeep Wagoneer",7,42.7,36.6,27.4,"20",0],
 ["suv","Ford Expedition",7,41.5,36.1,20.9,"19",0],
 ["suv","GMC Yukon",7,42.0,34.9,25.5,"17",0],
 ["suv","Chevy Tahoe",7,42.0,34.9,25.5,"17",0],
 ["suv","Toyota Sequoia",7,39.2,33.7,11.5,"21",0],
 ["suv","Grand Highlander",7,39.5,33.5,20.6,"36",0],
 ["suv","Palisade Hybrid 2026",7,43.0,32.1,19.1,"34",0],
 ["suv","Telluride Hybrid 2027",7,43.0,32.1,21.3,"35",0],
 ["suv","Kia Telluride 2024",7,42.4,31.4,21.0,"22",0],
 ["suv","Kia EV9",6,42.8,32.0,20.2,"88e",3.2],
 ["suv","Rivian R1S",6,37.6,32.8,17.7,"69e",11.1],
 ["suv","Tesla Model X",6,38.5,32.2,15.0,"100e",6.5],
 ["suv","Defender 130 (bench)",8,39.1,32.0,15.7,"17",0],
 ["suv","Nissan Armada (2025+)",7,39.2,32.9,20.4,"17",0],
 ["suv","Nissan Armada 2021-24",7,41.0,28.4,16.5,"16",0],
 ["suv","Nissan Pathfinder 2024",7,35.5,28.0,16.6,"23",0],
 ["suv","Honda Pilot TrailSport",7,40.8,32.5,18.6,"21",0],
 ["suv","Subaru Ascent Onyx",7,38.6,31.7,17.6,"22",0],
 ["suv","Mazda CX-90 PHEV",7,39.4,30.4,14.9,"56e",0],
 ["suv","Highlander Hybrid",7,41.0,27.7,16.0,"35",0],
 ["van","Pacifica AWD (petrol)",7,39.0,36.5,32.3,"20",0],
 ["van","Chrysler Voyager",7,39.0,36.5,32.3,"22",0],
 ["van","Odyssey 2011-2017",7,40.9,38.1,38.4,"22",0],
 ["van","Dodge Grand Caravan",7,36.5,32.7,33.0,"20",0],
 ["van","VW ID. Buzz",6,39.9,42.4,18.6,"80e",0],
 ["suv","Expedition MAX (2025)",7,41.5,36.5,37.4,"18",0],
 ["suv","Expedition MAX (2018-24)",7,41.5,36.1,36.0,"18",0],
 ["suv","Cadillac Escalade ESV",7,41.7,34.9,41.5,"16",0],
 ["suv","Lincoln Navigator L",7,41.5,36.1,34.3,"18",0],
 ["suv","Grand Wagoneer",7,42.7,36.6,27.4,"15",0],
 ["suv","Sequoia 2008-2022",7,40.9,35.3,18.9,"15",0],
 ["suv","Mercedes GLS",7,41.9,34.6,17.4,"21",0],
 ["suv","Ford Flex",7,44.3,33.3,20.0,"19",0],
 ["suv","Lexus TX",6,39.4,33.5,20.2,"23",0],
 ["suv","Grand Highlander (petrol)",7,39.5,33.5,20.6,"24",0],
 ["suv","Chevy Traverse",7,38.4,33.5,22.9,"21",0],
 ["suv","VW Atlas",7,37.6,33.7,20.6,"22",0],
 ["suv","Dodge Durango",7,38.6,33.5,17.2,"17",0],
 ["suv","BMW X7",6,37.6,33.3,12.8,"23",0],
 ["suv","GMC Acadia (2024)",7,41.5,32.1,23.0,"22",0],
 ["suv","Buick Enclave (2024)",7,41.5,32.1,22.9,"22",0],
 ["suv","Ford Explorer",7,39.0,32.2,18.2,"22",0],
 ["suv","Hyundai Ioniq 9",6,42.8,32.0,21.9,"85e",0],
 ["suv","Volvo XC90",6,37.0,31.9,15.8,"23",0],
 ["suv","Cadillac Vistiq",6,40.2,30.6,15.2,"80e",0],
 ["suv","Volvo EX90",6,36.5,31.9,12.9,"79e",0],
 ["suv","Grand Cherokee L",7,38.5,30.3,17.2,"21",0],
 ["suv","Hyundai Santa Fe",7,41.7,30.0,14.6,"22",0],
 ["suv","Mazda CX-9",7,39.4,29.7,14.4,"23",0],
 ["suv","Kia Sorento",7,41.7,29.6,12.6,"24",0],
 ["suv","Acura MDX",7,38.5,29.1,16.3,"22",0],
 ["suv","Infiniti QX80",7,41.0,28.5,16.6,"15",0],
 ["suv","Infiniti QX60",7,38.7,27.8,14.5,"22",0],
 ["suv","Tahoe 2015-2020",7,39.7,24.8,15.3,"17",0],
 ["van","Kia Sedona",7,40.4,31.5,33.9,"21",0],
 ["suv","Honda Pilot 2016-2022",7,38.4,31.9,16.5,"22",0],
 ["suv","Nissan Pathfinder 2017",7,41.7,30.7,16.0,"20",0]
];

export const GC=[[/Woodland/,6.9],[/Sienna/,6.3],[/Odyssey/,4.9],[/Pacifica/,5.1],[/Carnival/,6.8],
 [/Pacifica.*AWD/,6.5],[/Voyager/,5.1],[/Grand Caravan/,5.0],[/ID\. Buzz/,6.4],
 [/Telluride X-Line/,8.4],[/Telluride Hybrid/,8.0],[/Telluride/,8.4],[/Palisade/,7.9],
 [/Grand Highlander/,8.0],[/Pilot TrailSport/,8.3],[/Ascent/,8.7],[/CX-90/,8.0],
 [/Highlander Hybrid/,8.0],[/EV9/,7.8],[/R1S/,9.9],[/Model X/,5.4],[/Defender/,8.5],
 [/Grand Wagoneer/,8.3],[/Wagoneer/,8.3],[/Yukon AT4/,9.0],[/Tahoe|Suburban|Yukon/,8.0],[/Sequoia/,8.6],[/Expedition/,8.6],[/Pathfinder/,7.0],
 [/CX-9/,8.8],[/Traverse/,7.6],[/Acadia/,8.0],[/Enclave/,7.6],[/Atlas/,8.0],[/Explorer/,8.2],
 [/Grand Cherokee/,8.5],[/Durango/,8.1],[/Armada PRO-4X/,9.6],[/Armada/,9.2],[/Santa Fe/,8.2],[/Sorento/,8.2],[/Flex/,5.9],
 [/Escalade/,8.0],[/Navigator/,9.0],[/QX80/,9.2],[/QX60/,7.0],[/MDX/,7.3],[/Lexus TX/,8.0],
 [/XC90/,8.5],[/X7/,8.7],[/GLS/,8.1],[/Ioniq 9/,6.5],[/Vistiq/,7.0],[/EX90/,8.0],
 [/Pilot/,7.3],[/Highlander/,8.0],[/Sedona/,6.9]];
// Documented big-ticket failures, matched on nameplate and model-year range.
// These are named patterns rather than bad luck: a certified class action, a
// manufacturer special-coverage extension, a TSB, or an NHTSA complaint
// cluster. The smooth RepairPal curve in `maintenanceFor` cannot express "this
// drivetrain has a $4,000 failure with a known odometer window", so these sit
// alongside it.
//
//   c    the component, as it appears on the card
//   at   odometer band the failure tends to land in, thousands of miles
//   usd  Texas independent-shop price, parts and labour
//   p    share of these cars that ever need it
//   pt   true if factory powertrain coverage would pay for it
//   cov  optional [years, miles]: this component has its own coverage window,
//        longer than the powertrain warranty (a hybrid pack, for instance)
//   eng  optional: only applies where this matches the name and year blob,
//        for a failure tied to one engine or trim rather than the whole
//        nameplate
//   not  optional: never applies where this matches, for the same reason
//   src  what makes it a pattern and not an anecdote
//
// `p` is a judgement calibrated to complaint volume — the same kind of call as
// the `rel` score, not a measurement. A well-kept example may never need one.
// The cost model charges only the slice of each band you will actually drive
// through, so buying at 97,000 miles is not billed for a 70,000-mile failure.
// It cannot know whether a used car has already had the work done; a service
// record showing the repair is a genuine reason to discount these.
//
// Every entry a listing matches contributes its items, so a nameplate-wide
// pattern and a year- or engine-specific one can both apply.
//
// A recall is deliberately not priced here. The remedy is free, so its cost is
// zero and its weight belongs in the `rel` score instead. What does get priced
// is a failure that lands after the free remedy — see the L87 entry.
export const KNOWN=[
 // --- GM full-size: Tahoe / Suburban / Yukon ---
 {m:/Tahoe|Suburban|Yukon/,y:[2015,2020],items:[
  {c:"8L90 torque converter",at:[60,150],usd:4200,p:.40,pt:true,
   src:"Certified class action over 8L45/8L90 shudder and hard shifts, naming 2015\u20132019 Yukon, Yukon XL and Yukon Denali XL"},
  {c:"AFM lifter and camshaft",at:[90,180],usd:4500,p:.20,pt:true,
   src:"Cylinder deactivation on the 5.3 and 6.2 L8x collapses lifters; about $3,000 at a dealer, $7,000 and up once the camshaft is scored"},
  {c:"A/C condenser",at:[50,120],usd:1200,p:.45,pt:false,
   src:"GM Special Coverage 17336 \u2014 thermal cycling cracks the condenser at the bracket weld"},
 ]},
 {m:/Tahoe|Suburban|Yukon/,y:[2021,2026],items:[
  {c:"L87 6.2L engine, second failure",at:[30,150],usd:13000,p:.015,pt:true,eng:/6\.2|Denali|AT4|High Country/i,
   src:"Recall 25V274 re-oils or replaces L87s built Mar 2021 \u2013 May 2024 free; NHTSA opened EA26005 on 20 Aug 2026 over 499 complaints of engines failing again after that remedy. Priced here is the second failure, not the first \u2014 GM pays for the first"},
  {c:"DFM lifter and camshaft",at:[60,160],usd:4500,p:.15,pt:true,not:/Duramax|diesel/i,
   src:"Cylinder deactivation carried over to the L84 5.3 and L87 6.2; the same collapsed-lifter pattern as the previous generation"},
  {c:"A/C condenser",at:[50,130],usd:1300,p:.30,pt:false,
   src:"Condenser leaks continue on the 2019\u20132025 platform with TSBs but no special-coverage extension, so this one is yours to pay"},
 ]},

 // --- Chrysler minivans: Pacifica / Voyager ---
 {m:/Pacifica|Voyager/,y:[2017,2026],items:[
  {c:"948TE nine-speed transmission",at:[60,150],usd:5500,p:.16,pt:true,
   src:"Repeated software updates do not fix the underlying hardware, and owners report full replacements from the 60,000-mile mark; 2017\u20132023 vans also carry a defective internal transmission wiring harness that can shut the engine down while driving"},
 ]},
 {m:/Pacifica Hybrid/,y:[2017,2026],items:[
  {c:"High-voltage battery pack",at:[80,200],usd:17000,p:.06,pt:true,cov:[10,100000],
   src:"RepairPal puts the pack at roughly $17,000, and owners report battery and power-control-module failures from 22,000 miles up; Chrysler's 10-year / 100,000-mile hybrid warranty is what stands between you and that bill, and at 25,000 miles a year you pass the mileage half of it in four years"},
 ]},

 // --- Honda ---
 {m:/Odyssey/,y:[2011,2026],items:[
  {c:"Power sliding door motor",at:[60,160],usd:1400,p:.40,pt:false,
   src:"RepairPal puts a single door motor at $1,127\u20131,669 and it is the Odyssey's signature out-of-warranty repair; there are two doors"},
 ]},
 {m:/Odyssey/,y:[2018,2019],items:[
  {c:"ZF nine-speed transmission",at:[50,140],usd:6500,p:.15,pt:true,
   src:"Class action over the ZF 9HP in 2018\u20132019 Odyssey for harsh and delayed shifting; one documented internal gear failure at 71,000 miles cost $7,619 out of pocket"},
 ]},
 {m:/Pilot/,y:[2016,2022],items:[
  {c:"ZF nine-speed transmission",at:[50,140],usd:6500,p:.15,pt:true,eng:/Touring|Elite/i,
   src:"Same ZF 9HP class action covers 2016\u20132022 Pilot, but only the Touring and Elite trims carried the nine-speed \u2014 EX and EX-L used the six-speed, so no Pilot currently on this list is exposed"},
 ]},

 // --- Ford ---
 {m:/Expedition/,y:[2018,2024],items:[
  {c:"10R80 clutch drum bushing",at:[70,170],usd:6500,p:.15,pt:true,
   src:"A P2705 on a 2018\u20132023 Expedition is normally the CDF clutch drum bushing, which means a rebuild or replacement at $5,000\u20139,500; documented in Ford TSBs and the subject of several class actions"},
 ]},
 {m:/Expedition/,y:[2018,2020],items:[
  {c:"3.5 EcoBoost cam phasers",at:[60,150],usd:3000,p:.30,pt:true,
   src:"Second-generation 3.5 EcoBoost VCT units rattle on cold start and all four get replaced; Ford's Customer Satisfaction Program 21N03 covered this and expired on 1 January 2023, so it is now out of pocket"},
 ]},
 {m:/Explorer/,y:[2020,2025],items:[
  {c:"10R80 clutch drum bushing",at:[70,170],usd:6500,p:.13,pt:true,
   src:"Same 10R80 gearbox and the same harsh-shift and internal-failure TSBs and class actions as the Expedition"},
 ]},
 {m:/Flex/,y:[2009,2019],items:[
  {c:"Internal water pump",at:[80,180],usd:4000,p:.35,pt:true,
   src:"The 3.5 Duratec's water pump sits inside the engine driven off a chain, so replacing it means opening the engine: $3,000\u20135,000, and a great deal more if the failure has already put coolant into the oil. Ford was sued over it, with failures across the Duratec V6 estimated near 100,000 units"},
 ]},

 // --- Nissan ---
 {m:/Armada/,y:[2017,2024],items:[
  {c:"Radiator coolant into the gearbox",at:[70,160],usd:5000,p:.14,pt:true,
   src:"The factory radiator lets coolant into the transmission cooler circuit on the RE5R05A / RE7R01A, which takes out the valve body and often the whole gearbox; replacement runs $4,500\u20139,500"},
 ]},

 // --- Toyota ---
 {m:/Toyota Highlander/,y:[2020,2024],items:[
  {c:"UA80 eight-speed transmission",at:[60,150],usd:8000,p:.08,pt:true,not:/Hybrid/i,
   src:"NHTSA complaints of complete transmission failure at highway speed on the 2020\u20132024 V6, with replacements quoted at $8,000\u201312,000. The hybrids use an eCVT instead and are not exposed"},
 ]},
];

// Nameplates checked for the same kind of documented pattern and found not to
// have one that belongs in the cost model, so an empty Known issues panel on
// these means "looked at", not "not looked at yet". Anything matching neither
// KNOWN nor CLEAR simply has not been reviewed, and the card says so rather
// than implying a clean bill of health.
export const CLEAR=[
 {m:/Carnival|Sedona/,note:"Recalls only \u2014 fuel pipe, roof moulding, sliding-door auto-reverse, tow-hitch harness \u2014 and every one of them is a free fix checkable by VIN. Owner complaints cluster on electrical and trim, not on a big-ticket mechanical failure."},
 {m:/Sienna|Woodland/,note:"No named big-ticket pattern. The 2021-on vans are hybrid-only with an eCVT, which has a strong record; the earlier V6 has scattered transmission complaints but nothing that reads as a defect population."},
 {m:/Sequoia/,note:"No named big-ticket pattern found on either the old 5.7 or the 2023-on i-Force Max."},
 {m:/Pathfinder/,note:"The CVT that gives the Pathfinder its reputation was dropped after 2021. The 2022-on cars use a conventional nine-speed and are not exposed to it."},
 {m:/Pilot/,note:"The ZF nine-speed class action only reaches 2016\u20132022 Touring and Elite trims; the EX-L here is the six-speed, and the 2023-on cars are a new ten-speed."},
 {m:/Grand Highlander|Highlander Hybrid/,note:"The 2020\u20132024 eight-speed failures are a V6 problem. These are hybrids on an eCVT, and the Grand Highlander's own complaints are shift quality rather than failure."},
 {m:/Telluride|Palisade/,note:"The 3.8 V6 does consume oil, carbon on the piston rings, and there is a transmission-cooler coolant leak on 2020\u20132022 Palisades under TSB 23-EM-003H. Neither has a repair cost or failure rate I could source well enough to price, and the 2023\u20132024 oil-pump recall is free. Worth an oil-consumption check on a test drive."},
 {m:/EV9/,note:"The ICCU failure is real and will strand the car, but Kia service campaign SC327Y covers it and the pack carries 10 years / 100,000 miles, so the expected bill is close to zero."},
 {m:/Traverse|Acadia|Enclave/,note:"The 3.6's timing-chain stretch belongs to the 2007\u20132012 engines, well before any of these."},
];

export const OWN=[[/Woodland|Sienna/,4.4,600],[/Odyssey/,4.3,550],[/Pacifica/,3.8,690],[/Carnival Hybrid/,4.5,520],
 [/Carnival/,4.3,520],[/Telluride/,4.1,520],[/Palisade/,4.2,550],[/Grand Highlander/,4.5,510],
 [/Highlander Hybrid/,4.4,490],[/Pilot/,4.4,540],[/Ascent/,4.2,590],[/CX-90/,3.9,640],
 [/EV9/,4.6,450],[/R1S/,4.3,900],[/Model X/,4.0,950],[/Defender/,3.6,1250],
 [/Grand Wagoneer/,2.9,1200],[/Wagoneer/,2.7,1150],[/Tahoe|Suburban|Yukon/,3.4,744],[/Sequoia/,4.2,650],
 [/Expedition/,3.7,861],[/Pathfinder/,3.9,542],
 [/Voyager/,3.7,690],[/Grand Caravan/,3.9,670],[/ID\. Buzz/,4.2,700],
 [/CX-9/,4.4,553],[/Traverse/,4.2,656],[/Acadia/,4.1,734],[/Enclave/,4.3,720],[/Atlas/,4.0,700],
 [/Explorer/,4.1,732],[/Grand Cherokee/,4.2,666],[/Durango/,4.3,675],[/Armada/,4.2,731],
 [/Santa Fe/,4.3,515],[/Sorento/,4.2,533],[/Flex/,4.5,716],
 [/Escalade/,4.2,1000],[/Navigator/,4.4,1089],[/QX80/,4.3,819],[/QX60/,4.2,640],[/MDX/,4.4,571],
 [/Lexus TX/,4.5,550],[/XC90/,4.1,851],[/X7/,4.4,1150],[/GLS/,4.3,1100],
 [/Ioniq 9/,4.5,450],[/Vistiq/,4.3,650],[/EX90/,3.8,900],
 [/Highlander/,4.4,500],[/Sedona/,4.2,570]];

export const PRESETS=[
 ["Honda Pilot 2016-2022",38.4,31.9,16.5,22],
 ["Toyota Highlander 2020-2024",41.0,27.7,16.0,24],
 ["Chevy Traverse 2018-2023",38.4,33.5,23.0,21],
 ["Ford Explorer 2020-2025",39.0,32.2,18.2,24],
 ["Kia Sorento 2021-2025",41.7,29.6,12.6,26]
];

// Static tables. These were literal markup in the standalone file; here they are
// data so the JSX below stays readable.
export const OWNER_GROUPS = [
  {
    g: 'Cheapest to keep running',
    rows: [
      ['Kia EV9', '4.6', '$450', 'No oil, no belts, no exhaust'],
      ['Highlander Hybrid', '4.4', '$490', 'Toyota hybrid, simple'],
      ['Grand Highlander', '4.5', '$510', 'Owners rate it highly'],
      ['Kia Carnival', '4.3', '$520', '10yr powertrain warranty'],
      ['Kia Telluride', '4.1', '$520', 'Same warranty'],
      ['Honda Pilot', '4.4', '$540', 'Parts everywhere'],
      ['Nissan Pathfinder', '3.9', '$542', 'Your car; CVT is the risk'],
      ['Honda Odyssey', '4.3', '$550', 'Sliding door motors fail'],
      ['Hyundai Palisade', '4.2', '$550', 'Mixed early reviews'],
      ['Toyota Sienna', '4.4', '$600', '$6,500–7,500 over 10 yrs'],
    ],
  },
  {
    g: 'Gets expensive',
    rows: [
      ['Toyota Sequoia', '4.2', '$650', 'Big parts, big tyres'],
      ['Pacifica Hybrid', '3.8', '$690', 'Powertrain + electronics'],
      ['Tahoe / Yukon / Suburban', '3.4', '$744', 'Severe when it goes'],
      ['Ford Expedition', '3.7', '$861', 'EcoBoost turbos'],
      ['Rivian R1S', '4.3', '$900', 'Loved, but few shops'],
      ['Tesla Model X', '4.0', '$950', 'Falcon doors, air suspension'],
      ['Jeep Wagoneer', '2.7', '$1,150', 'Worst owner score here'],
      ['Land Rover Defender', '3.6', '$1,250', 'Dealer-only work'],
    ],
  },
];

export const RELIABILITY_GROUPS = [
  {
    g: 'Minivans',
    rows: [
      ['Toyota Sienna', '4.0', '3.0', '71%', "2nd row won't come out"],
      ['Honda Odyssey', '3.0', '4.0', '60%', 'Best minivan resale'],
      ['Kia Carnival', '3.0', '4.0', '55%', 'SynTex vinyl, seats stow'],
      ['Carnival Hybrid', '4.5', '4.0', '55%', "CR's top minivan, 2025+"],
      ['Pacifica Hybrid', '1.5', '4.0', '45%', 'Last in class, CR'],
    ],
  },
  {
    g: 'SUVs',
    rows: [
      ['Grand Highlander Hyb', '4.5', '3.5', '62%', 'Toyota hybrid, SofTex'],
      ['Tahoe / Yukon / Suburban', '3.0', '3.0', '57%', 'Solid, thirsty'],
      ['Kia Telluride', '3.5', '3.5', '55%', 'Small third row'],
      ['Ford Expedition', '2.5', '3.0', '48%', 'Big 3rd row, small boot'],
      ['Jeep Wagoneer', '2.0', '2.5', '42%', 'Carpet, weak record'],
      ['Kia EV9', '1.5', '4.0', '37%', "Kia's least reliable", true],
    ],
  },
];

export const FINANCE_OFFERS = [
  ['Kia EV9', '0% / 60 mo + $5,000', 'Or $10,000 cash. Do not stack.'],
  ['Nissan Armada', '2.9% / 72 mo', 'Or $3,500 cash. Loyalty $2,000 with NMAC.'],
  ['Carnival Hybrid 2026', '1.90–3.99% KFA', 'Dealer off stays. Not the $750 Kia cash or military. Through 30 Sep.'],
  ['Carnival Hybrid 2027', '2.90% / 48 mo', 'Kia Finance, qualified. Separate 2027 offer.'],
  ['Carnival V6', '2.99% / 72 mo', 'Bought down — does not stack. Cash + RBFCU still wins on the V6.'],
  ['Carnival, discount path', '$1,500–$2,000 off + $750', 'KFA Dealer Choice + bonus cash. Bank / KFA 4.49% sell rate.'],
  ['Grand Highlander', '4.99% / 60 mo', 'Also at 72 months.'],
  ['Chevy / GMC full-size', '5.9% / 60 mo', 'Tahoe, Suburban, Yukon. No cash back.'],
  ['Toyota Sienna', 'No APR special', 'Lease offer only — so RBFCU 4.49%.'],
  ['Used, any brand', 'RBFCU 4.49%', 'Same rate new or used, 60 mo or less.'],
];

export const LEASES = [
  ['Sienna LE, $319/mo', '$15,483', '$22,233'],
  ['Grand Highlander XLE, $439/mo', '$19,803', '$26,553'],
  ['Carnival Hybrid LXS, $459/mo', '$20,523', '$31,773'],
  ['Kia EV9 Light LR, $439/mo', '$19,803', '$31,053'],
  ['Armada SV 4x2, $819/mo', '$35,703', '$44,703'],
];

// The pre-purchase checklist, grouped as it is on the page.
export const CHECKS = [
  {
    g: 'Answer these first — they move the decision most',
    items: [
      'Is that 2025 Sienna XLE at $40,499 actually all-wheel drive? It tops the list and the drivetrain is unverified.',
      'Get three real insurance quotes. I used $11,500–$13,500 over five years as a type-based estimate; a real Texas number could swing $4,000 either way, which is more than the gap between your top three.',
      'Does the Pathfinder’s CVT shudder, hesitate or whine? That is the difference between $8,000 of car and $2,000 of car.',
      'Check your odometer against a year ago. If it is 15,000 miles a year rather than 25,000, the whole ranking compresses and older cars come back.',
    ],
  },
  {
    g: 'On any used listing',
    items: [
      'Drivetrain: front-wheel or all-wheel? Do not trust the trim name.',
      'Second row: captain’s chairs or a bench? Especially Wagoneer Series II, Carnival LX and LXS, and any Tahoe, Suburban or Yukon below Premier / Denali — GM sells buckets as an option, not a trim.',
      'Accident history, number of owners, and how much factory warranty remains.',
      'Tyre and brake life — a set of tyres on any of these runs $900–$1,400.',
      'Open recalls, free to check by VIN at nhtsa.gov. On the 2022 Yukon AT4 there are two that matter: 25V274, the 6.2L L87 engine, and 26V085, the ten-speed transmission. Ask the seller for proof both were done.',
      '2020–2022 is a COVID-year build: factory shutdowns, then the chip shortage. Cars left without modules, and QC dipped. Best overall demotes those years; 2023 is a lighter hit. Prefer 2019 and earlier, or 2024+.',
    ],
  },
  {
    g: 'On a lifted or modified car',
    items: [
      'Ask for the invoice for the lift. Who fitted it, when, and at what mileage.',
      'Was the speedometer recalibrated for the taller tyres? If not the odometer under-reads by about 6%, and the car has more miles on it than the clock says.',
      'Tell your insurer about the modification before you buy, not after. Undeclared aftermarket parts are a common reason a claim gets reduced.',
      'Check ball joints, wheel bearings, CV boots and tyre wear pattern. A lift loads all four harder, and uneven wear on a $1,600 set of tyres is the tell.',
      'Ask what remains of the factory powertrain warranty, and whether the dealer has ever pushed back on a claim because of the lift.',
    ],
  },
  {
    g: 'At a dealer',
    items: [
      'Ask for the out-the-door price in writing by email before visiting. Refuse to discuss monthly payment.',
      'Ask what add-ons are on the car. Paint protection, VIN etching and market adjustments are where $2,000–$4,000 hides.',
      'Ask whether taking the promotional APR forfeits a cash rebate. On the EV9, the Armada and the Carnival V6 you must choose one. On the 2026 Carnival Hybrid, dealer discount can sit next to KFA 1.90–3.99%; Kia bonus cash and military $500 are not counted unless the contract shows them.',
      'On a new car, read the Final Assembly Point line on the window sticker. It decides whether your loan interest is deductible, and it varies by trim and model year — check the actual car, not the model name.',
      'Walk in with a credit union pre-approval. It costs nothing and it is the only leverage that reliably works.',
    ],
  },
  {
    g: 'On the test drive — bring the car seats and all three kids',
    items: [
      'Can a child reach the third row with a car seat still installed in the second? This is the most useful thing you will learn all day.',
      'Does your actual stroller fit behind the third row with every seat up?',
      'Sit in the third row yourself for five minutes.',
      'Open the doors in a tight space. Sliding versus hinged is a daily thing you will either love or resent.',
    ],
  },
];

export const SOURCE_ROWS = [
  ['Used prices and links', 'Carvana listings, 30 Aug 2026; three VINs added 3 Sep', 'Actual cars'],
  ['New prices and links', 'Dealer inventory, San Antonio to Bryan', 'Actual cars'],
  ['2026 Armada SV / EV9 offers', 'Nissan USA zip 78253 and Kia zip 78130, 3 Sep 2026', 'Manufacturer specials'],
  ['Tahoe / Suburban / Yukon', '2026 MSRP by trim; used are market estimates', 'Trim-level, not a VIN'],
  ['2022 Yukon AT4', 'The Facebook Marketplace listing, as posted', 'One actual car'],
  ['Recalls 25V274, 26V085', 'NHTSA recall API, by make/model/year', 'Federal record'],
  ['Legroom, cargo, clearance', 'Manufacturer specs', 'Published'],
  ['MPG and MPGe', 'EPA combined ratings', 'Published'],
  ['Finance offers', 'Kia, Nissan, Toyota, GM, September 2026', 'EV9 and Armada checked 3 Sep'],
  ['Loan rate on every card', 'RBFCU 4.49%/60 mo, new and used alike', 'Advertised, not a pre-approval'],
  ['Carnival prices and offers', 'Kia MSRP, corridor dealer listings, 8 Sep 2026', 'Trim-level, not a VIN'],
  ['Used Carnival listings', 'Carvana San Antonio search page, 8 Sep 2026', 'Listed cars, VIN not opened'],
  ['2026 Carnival Hybrid SX Prestige', 'Carvana vehicle 4725390, 8 Sep 2026', 'Actual car; 16,631 mi, $50,990 + $1,290 ship'],
  ['2026 Carnival SX Prestige V6', 'World Car Kia New Braunfels, VIN KNDNE5K30T6641260, 8 Sep 2026', 'Actual car; sale $52,631, lounge 2nd'],
  ['2027 Carnival Hybrid SX captains', 'Kia of Round Rock / CarGurus 454878506, 8 Sep 2026', 'Actual car; VIN KNDNE5KA3V6190973, $50,864'],
  ['2016 Sequoia SR5 2WD', 'Third Coast New Braunfels VDP, 8 Sep 2026', 'Actual car; $20,900 from dealer data'],
  ['2016 Sequoia SR5 4x4', 'Facebook Marketplace SA, 8 Sep 2026', 'Actual car; 140,908 mi, $22,114'],
  ['Carnival vs Sienna depreciation', 'iSeeCars: 50.1% vs 38.6% over five years', 'Model average'],
  ['Final assembly points', 'Kia Gwangmyeong; Toyota Indiana, Princeton', 'Manufacturer'],
  ['Auto-loan interest deduction', 'OBBBA, tax years 2025–2028', 'Statute, not tax advice'],
  ['Electricity rate', 'Your GVEC bill, Aug 2026', 'Your actual rate'],
  ['Charger rebate', 'GVEC EV charger programme', 'Published'],
  ['EV road fee, sales tax', 'Texas SB 505, Comptroller', 'Statute'],
  ['Depreciation', 'iSeeCars 5-year study', 'Model average'],
  ['Repairs per year', 'RepairPal-style averages', 'Model average, formula input'],
  ['Five-year maintenance', 'Wear items by miles + repairs by age, odometer, warranty', 'Formula, not a quote'],
  ['Owner ratings', 'KBB, Edmunds, CarGurus', 'Model average'],
  ['Reliability score', 'Consumer Reports + recalls', 'My judgement'],
  ['Cleanability score', 'Interior features', 'My judgement'],
  ['Insurance', 'Type-based estimate', 'Estimate, not a quote'],
  ['Resale dollars', 'Depreciation + mileage discount', 'Estimate'],
];


// "Why this number" copy, shown when a figure is tapped.
export const WHY = {
  leg2:
    'Manufacturer second-row legroom, measured with the seat all the way back. Green is the gain over your comparison car, red a loss. Bar is scaled against the roomiest here, the 44.3-inch Ford Flex, with the 43-inch Telluride and Palisade just behind it.',
  leg3:
    "Third-row legroom. This is the figure that separates a usable back seat from a jump seat. Under about 31 inches is children only. The VW ID. Buzz's published 42.4 is the most on this page and the one figure here worth measuring yourself, since its second row slides a long way; the Sienna's 38.7 is the best of the conventional vans.",
  cargo:
    'Cubic feet behind the third row with all seats up. Frunks are not counted here; the EV9, Rivian and Model X add 3.2 to 11.1 cu ft up front, shown in the comparison chart above. The newer electrics have little or no front boot.',
  mpg:
    'EPA combined rating. MPGe for electrics and plug-ins is not comparable to petrol mpg, so the fuel cost in the bar above uses your actual electricity and petrol prices instead.',
  res:
    'Starts from iSeeCars five-year depreciation for the model, then discounts about 11% per extra 25,000 miles a year. Percentage is against what you pay, so used cars look better than new ones on this line.',
  rel:
    'My score from Consumer Reports predicted reliability plus recall history. 4.5 means CR rates it above average; 1.5 means bottom of its class. This is a judgement, not a measurement.',
  cln:
    'Weighs wipeable synthetic leather over cloth, seats that fold into the floor or come out, a low flat load floor, a built-in vacuum, and standard all-weather mats. The Sienna loses points because its second row cannot be removed and there is carpet underneath.',
  row2:
    "Whether this listing has second-row captain’s chairs. Captains and lounge both put two in the middle with a walkthrough; lounge seats on Carnival Prestige, Sedona SX and the EV9 VIP do not fold or come out. Bench is a confirmed three-across second row. Ask means the trim can go either way and this car was not verified — GM LT / Elevation, 2027 Carnival EX, Wagoneer Series II.",
  covid:
    '2020–2022 factory years: shutdowns, then the chip shortage, cars shipped without modules, and a documented QC dip. 2021–2022 score worst. 2023 is a lighter hangover. 2019 and earlier, and 2024+, are treated as normal builds. This is a Best overall demotion, not a ban.',
  own:
    'Averaged consumer scores from Kelley Blue Book, Edmunds and CarGurus. Owners rate how much they enjoy the car, which is why the EV9 scores 4.6 despite poor reliability data.',
  repairs:
    'RepairPal-style annual average for the nameplate, used as the unscheduled-repair input to the five-year maintenance formula. It is not the maintenance line on the card. Longer bar is cheaper.',
  dep:
    'Asking price plus 6.25% Texas sales tax and $400 of title and registration fees, minus what the car should be worth at year five. Usually the biggest single number on this page.',
  interest:
    "Total interest over the loan term at the APR shown on each card. Every card here is capped at RBFCU's 4.49% for 60 months, which they quote for used cars as well as new; a manufacturer promo is only used where it beats that. The 2026 Carnival Hybrid follows the KFA ladder (1.90% at 48, 2.99% at 60, 3.99% at 72) on the dealer-discounted price, without the $750 Kia cash. The 2027 Hybrid is 2.90% locked to 48 months. Kia's 4.49% sell rate is the ordinary KFA rate — same as RBFCU — and is why the payment estimator still shows a Military checkbox. The 0% EV9 and the 2.99%/72 Carnival V6 keep their advertised terms. Two caveats: 4.49% is the well-qualified rate at 60 months or less, and the oldest, highest-mileage cars on this page may be tiered higher or declined, so treat those totals as optimistic until you have the pre-approval in writing.",
  fuel:
    'Your miles per year times five, at the petrol or electricity price you set in Assumptions. Plug-ins blend the two using the battery-share slider.',
  ins:
    'Five-year estimate scaled by vehicle type and value, not a quote. Texas rates run above the national average, and EVs and large SUVs cost more to insure.',
  mnt:
    'Five-year total of two pieces. Wear items (oil, tires, brakes) scale with the miles slider and with tire size — a Sequoia costs more per mile than a Sienna, and a 6-inch lift on 35s costs more still. Unscheduled repairs start from the RepairPal annual for the model, then rise with age and odometer and fall while bumper or powertrain coverage is still in force. A new Kia still has 10/100 powertrain; a used one typically does not. Drag miles down and this number drops.',
  chg:
    "One-time Level 2 charger installation, charged only to the electrics and the plug-in Pacifica. Default is a typical $1,600 job less GVEC's $600 rebate.",
  evfee:
    'Texas Senate Bill 505 charges battery EVs $200 a year in road-use fees, $1,000 over five years. Hybrids and plug-in hybrids are exempt.',
  down:
    'Cash you put in on day one. It reduces the loan and therefore the interest, but not the total cost of the car. Your Pathfinder sale should fund most of this.',
  miles:
    'Drives fuel cost, the resale discount, and maintenance. At 25,000 a year you cover 125,000 miles in five years, which is why efficient cars pull ahead and why an old car finishing past 200,000 miles is charged for that wear.',
  gas:
    'Price per gallon of regular. Diesel is calculated at 22% above this. Texas averages below the national figure.',
  kwh:
    'Your GVEC marginal rate from the August bill: $0.085 generation plus $0.0238 distribution, then the 2% franchise fee and 1.5% city tax. The $25 service charge is fixed so it is excluded.',
  elec:
    'Applies to the Pacifica and CX-90 plug-in hybrids only. With 26-32 miles of electric range, this is the share of your driving that never touches petrol. Drag it to zero to see them as ordinary hybrids.',
  charger:
    "Level 2 install runs $1,200-1,800 typically, or $3,000-6,000 if your panel needs upgrading. GVEC rebates 50% up to $600. The federal 30C credit expired 30 June 2026.",
  awdFilter:
    'AWD is optional here. Turn it on and the recommendation above recalculates, and tells you what you would have picked without it. Note this matches cars where AWD is available, not necessarily fitted — check each used listing.',
};
