import { createContext, Fragment, useContext, useMemo, useState } from 'react';
import '../vehicle-cost.css';

// ---------------------------------------------------------------------------
// VEHICLE — the three-row family vehicle comparison, ported from the standalone
// vehiclecostcomparison.html. Same data, same markup, same CSS (now scoped
// under .vehcost in src/vehicle-cost.css). Prices are real listings near 78130
// as of 30 Aug 2026: Carvana for used, dealer inventory for new. Legroom, cargo
// and MPG are manufacturer/EPA figures; insurance, maintenance and resale are
// estimates, which is why the page says to treat sub-$3,000 gaps as ties.
//
// The one thing that is not a straight port: the sticky "Assumptions" bar was
// inert in the standalone file (nothing ever filled #stickv or bound #stickb).
// Here it shows the live assumptions and opens the same controls as the
// Assumptions section further down the page.
// ---------------------------------------------------------------------------

const OPTIONS=[
 {n:"Toyota Sienna XLE",y:"2026 \u00b7 $47,504",cat:"van",cond:"new",seats:7,sticker:47504,cash:0,apr:.060,offer:"North Park Toyota, 42 mi",
  awd:"AWD +$1,000",mpg:36,mpgLab:"36",ins:12500,mnt:3000,res:32000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.northparktoyota.com/new-inventory/index.htm?model=Sienna",lt:"View this listing"},
 {n:"Sienna Woodland Edition",y:"2026 \u00b7 lifted, AWD standard \u00b7 $55,750",cat:"van",cond:"new",seats:7,sticker:55750,cash:0,apr:.060,offer:"Bryan College Station, 124 mi",
  awd:"AWD standard, 6.9\" clearance",mpg:35,mpgLab:"35",ins:13000,mnt:3000,res:38000,rel:4.0,cln:3.5,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.bcstoyota.com/new-inventory/index.htm?model=Sienna",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2025 \u00b7 59k mi \u00b7 $40,499",cat:"van",cond:"used",seats:7,sticker:40499,cash:0,apr:.075,offer:"Bank loan",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:11500,mnt:4000,res:24000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4683855",lt:"View this listing"},
 {n:"Pacifica Hybrid Select",y:"2024 \u00b7 68k mi \u00b7 $21,990",cat:"van",cond:"used",seats:7,sticker:21990,cash:0,apr:.075,offer:"Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,mnt:7500,res:9500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4401364",lt:"View this listing"},
 {n:"Pacifica Hybrid Touring L",y:"2023 \u00b7 31k mi \u00b7 $28,590",cat:"van",cond:"used",seats:7,sticker:28590,cash:0,apr:.075,offer:"Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,mnt:6000,res:12500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4660545",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2022 \u00b7 63k mi \u00b7 $31,590",cat:"van",cond:"used",seats:7,sticker:31590,cash:0,apr:.075,offer:"Bank loan",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:11000,mnt:4200,res:15000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4651723",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2023 \u00b7 60k mi \u00b7 $31,590",cat:"van",cond:"used",seats:7,sticker:31590,cash:0,apr:.075,offer:"Bank loan",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:11000,mnt:4500,res:12500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4357538",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2024 \u00b7 20k mi \u00b7 $38,590",cat:"van",cond:"used",seats:7,sticker:38590,cash:0,apr:.075,offer:"Bank loan",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:11500,mnt:3800,res:17500,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4673591",lt:"View this listing"},
 {n:"Kia Carnival Hybrid SX",y:"2025 \u00b7 17k mi \u00b7 $48,590",cat:"van",cond:"used",seats:7,sticker:48590,cash:0,apr:.075,offer:"Most reliable minivan",
  awd:"No AWD offered",mpg:33,mpgLab:"33",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",ins:12500,mnt:3500,res:22000,rel:4.5,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4691317",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2017 \u00b7 62k mi \u00b7 V6, not hybrid",cat:"van",cond:"used",seats:7,sticker:27590,ship:590,cash:0,apr:.085,offer:"Older-car rate",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:9000,mnt:9000,res:11000,rel:4.5,cln:3.0,leg2:37.6,leg3:36.3,cargo:39.1,
  url:"https://www.carvana.com/vehicle/4517273",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2020 \u00b7 75k mi \u00b7 V6, not hybrid",cat:"van",cond:"used",seats:7,sticker:32990,cash:0,apr:.080,offer:"Older-car rate",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:9500,mnt:8500,res:12500,rel:4.5,cln:3.0,leg2:37.6,leg3:36.3,cargo:39.1,
  url:"https://www.carvana.com/vehicle/4578369",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2019 \u00b7 37k mi",cat:"van",cond:"used",seats:7,sticker:31990,cash:0,apr:.080,offer:"Older-car rate",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:9500,mnt:9500,res:13000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4651600",lt:"View this listing"},
 {n:"Toyota Sienna XLE",y:"2023 \u00b7 67k mi \u00b7 hybrid",cat:"van",cond:"used",seats:7,sticker:39590,cash:0,apr:.075,offer:"Bank loan",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:11500,mnt:4500,res:22000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4554451",lt:"View this listing"},
 {n:"Toyota Sienna XSE",y:"2022 \u00b7 32k mi \u00b7 20\" wheels",cat:"van",cond:"used",seats:7,sticker:45990,cash:0,apr:.075,offer:"Sport trim",
  awd:"AWD if optioned",mpg:36,mpgLab:"36",ins:12000,mnt:4500,res:24000,rel:4.0,cln:3.0,leg2:39.9,leg3:38.7,cargo:33.5,
  url:"https://www.carvana.com/vehicle/4485668",lt:"View this listing"},
 {n:"Pacifica Hybrid Select",y:"2024 \u00b7 57k mi",cat:"van",cond:"used",seats:7,sticker:22990,cash:0,apr:.075,offer:"Plug-in",
  awd:"FWD only on hybrid",mpg:30,mpgLab:"82 MPGe",mpgBar:40,kwh100:41,phev:true,charger:true,
  aw:"2017 N. American Utility of the Year",awUrl:"https://www.torquenews.com/106/chrysler-pacifica-wins-first-ever-north-american-utility-year-award",ins:11500,mnt:7000,res:10500,rel:1.5,cln:4.0,
  leg2:39.0,leg3:36.5,cargo:32.3,url:"https://www.carvana.com/vehicle/4418299",lt:"View this listing"},
 {n:"Kia Carnival EX",y:"2025 \u00b7 33k mi",cat:"van",cond:"used",seats:7,sticker:38990,cash:0,apr:.075,offer:"Bank loan",
  awd:"No AWD offered",mpg:22,mpgLab:"22",aw:"#1 minivan, J.D. Power 2026 quality",awUrl:"https://www.kiamedia.com/us/en/media/sitesection/3461/awards",
  ins:11500,mnt:3600,res:19000,rel:3.0,cln:4.0,leg2:40.5,leg3:35.6,cargo:40.2,
  url:"https://www.carvana.com/vehicle/4611470",lt:"View this listing"},
 {n:"Honda Odyssey EX-L",y:"2024 \u00b7 34k mi",cat:"van",cond:"used",seats:7,sticker:37590,cash:0,apr:.075,offer:"Bank loan",
  awd:"No AWD offered",mpg:22,mpgLab:"22",ins:11500,mnt:3800,res:19000,rel:3.0,cln:4.0,leg2:40.9,leg3:38.1,cargo:32.8,
  url:"https://www.carvana.com/vehicle/4674135",lt:"View this listing"},
 {n:"Grand Highlander Hybrid Ltd",y:"2026 \u00b7 $59,699",cat:"suv",cond:"new",seats:7,sticker:59699,cash:0,apr:.0499,offer:"Toyota of Cedar Park, 62 mi",
  awd:"AWD available",mpg:36,mpgLab:"36",ins:13000,mnt:3000,res:35000,rel:4.5,cln:3.5,leg2:39.5,leg3:33.5,cargo:20.6,
  url:"https://www.toyotacedarpark.com/new-inventory/index.htm?model=Grand+Highlander+Hybrid",lt:"View this listing"},
 {n:"Honda Pilot TrailSport",y:"2026 \u00b7 AWD, skid plates \u00b7 ~$50,000",cat:"suv",cond:"new",seats:7,sticker:50000,cash:0,apr:.060,offer:"All-terrain tires std",
  awd:"AWD standard",mpg:21,mpgLab:"21",ins:12500,mnt:3000,res:28000,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://automobiles.honda.com/pilot",lt:"Build and find one"},
 {n:"Honda Pilot TrailSport",y:"2023 \u00b7 used \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:39000,cash:0,apr:.075,offer:"Bank loan",
  awd:"AWD standard",mpg:21,mpgLab:"21",ins:11500,mnt:4200,res:18000,rel:4.0,cln:3.5,leg2:40.8,leg3:32.5,cargo:18.6,
  url:"https://www.carvana.com/cars/honda-pilot",lt:"Browse listings"},
 {n:"Telluride X-Line SX Hybrid",y:"2027 \u00b7 AWD, rugged trim \u00b7 $56,035",cat:"suv",cond:"new",seats:7,sticker:56035,cash:0,apr:.0449,offer:"Hybrid + off-road look",
  awd:"AWD standard",mpg:33,mpgLab:"33",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:13500,mnt:3000,res:32000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:21.3,
  url:"https://www.kia.com/us/en/telluride",lt:"Build and find one"},
 {n:"Mazda CX-90 PHEV Preferred",y:"2026 \u00b7 AWD std \u00b7 ~$51,000",cat:"suv",cond:"new",seats:7,sticker:51000,cash:0,apr:.060,offer:"26 mi electric",
  awd:"AWD standard",mpg:25,mpgLab:"56 MPGe",mpgBar:38,kwh100:48,phev:true,charger:true,
  ins:13000,mnt:3500,res:26000,rel:3.0,cln:3.5,leg2:39.4,leg3:30.4,cargo:14.9,
  url:"https://www.mazdausa.com/vehicles/cx-90-phev",lt:"Build and find one"},
 {n:"Subaru Ascent Onyx",y:"2026 \u00b7 AWD std \u00b7 ~$45,000",cat:"suv",cond:"new",seats:7,sticker:45000,cash:0,apr:.060,offer:"Rugged trim",
  awd:"AWD standard",mpg:22,mpgLab:"22",ins:12000,mnt:3200,res:24000,rel:3.5,cln:3.5,leg2:38.6,leg3:31.7,cargo:17.6,
  url:"https://www.subaru.com/vehicles/ascent",lt:"Build and find one"},
 {n:"Highlander Hybrid XLE",y:"2026 \u00b7 AWD \u00b7 ~$48,000",cat:"suv",cond:"new",seats:7,sticker:48000,cash:0,apr:.0499,offer:"36 mpg, tiny 3rd row",
  awd:"AWD available",mpg:35,mpgLab:"35",ins:12500,mnt:3000,res:28000,rel:4.5,cln:3.5,leg2:41.0,leg3:27.7,cargo:16.0,
  url:"https://www.toyota.com/highlanderhybrid/",lt:"Build and find one"},
 {n:"Palisade Hybrid SEL",y:"2026 \u00b7 FWD \u00b7 $45,660",cat:"suv",cond:"new",seats:7,sticker:45660,cash:0,apr:.0449,offer:"34 mpg, 10yr warranty",
  awd:"AWD +$2,000",mpg:34,mpgLab:"34",ins:13000,mnt:3000,res:26000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:19.1,
  url:"https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid",lt:"Build and find one"},
 {n:"Palisade Hybrid SEL AWD",y:"2026 \u00b7 AWD \u00b7 $47,660",cat:"suv",cond:"new",seats:7,sticker:47660,cash:0,apr:.0449,offer:"30 mpg with AWD",
  awd:"AWD standard on this build",mpg:30,mpgLab:"30",ins:13000,mnt:3000,res:27000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:19.1,
  url:"https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid",lt:"Build and find one"},
 {n:"Hyundai Palisade SEL",y:"2023 \u00b7 used \u00b7 market estimate",cat:"suv",cond:"used",seats:7,sticker:31500,cash:0,apr:.075,offer:"Telluride twin",
  awd:"AWD if optioned",mpg:22,mpgLab:"22",ins:11500,mnt:4200,res:14500,rel:3.5,cln:3.5,leg2:42.4,leg3:31.4,cargo:18.0,
  url:"https://www.carvana.com/cars/hyundai-palisade",lt:"Browse listings"},
 {n:"Kia Telluride S",y:"2025 \u00b7 36k mi \u00b7 $32,590",cat:"suv",cond:"used",seats:7,sticker:32590,cash:0,apr:.075,offer:"Bank loan",
  awd:"AWD available",mpg:22,mpgLab:"22",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:11500,mnt:4200,res:15500,rel:3.5,cln:3.5,leg2:42.4,leg3:31.4,cargo:21.0,
  url:"https://www.carvana.com/vehicle/4650636",lt:"View this listing"},
 {n:"Kia Telluride Hybrid EX",y:"2027 \u00b7 AWD \u00b7 $50,035",cat:"suv",cond:"new",seats:7,sticker:50035,cash:0,apr:.0449,offer:"Redesigned, 35 mpg",
  awd:"AWD standard on this trim",mpg:34,mpgLab:"34",aw:"2020 N. American Utility of the Year",awUrl:"https://www.kia.com/sd/en/util/news/Kia-Telluride-wins-Triple-Crown.html",
  ins:13000,mnt:3000,res:29000,rel:3.5,cln:3.5,leg2:43.0,leg3:32.1,cargo:21.3,
  url:"https://www.kia.com/us/en/telluride",lt:"Build and find one"},
 {n:"Toyota Sequoia Limited",y:"2023 \u00b7 17k mi \u00b7 $67,990",cat:"suv",cond:"used",seats:7,sticker:67990,cash:0,apr:.075,offer:"Hybrid V6",
  awd:"4WD available",mpg:21,mpgLab:"21",ins:14000,mnt:4500,res:36000,rel:3.5,cln:3.0,leg2:39.2,leg3:33.7,cargo:11.5,
  url:"https://www.carvana.com/vehicle/4665017",lt:"View this listing"},
 {n:"Toyota Sequoia Platinum",y:"2023 \u00b7 34k mi \u00b7 $69,990",cat:"suv",cond:"used",seats:7,sticker:69990,cash:0,apr:.075,offer:"Hybrid V6",
  awd:"4WD available",mpg:21,mpgLab:"21",ins:14000,mnt:4500,res:36500,rel:3.5,cln:3.0,leg2:39.2,leg3:33.7,cargo:11.5,
  url:"https://www.carvana.com/vehicle/4658098",lt:"View this listing"},
 {n:"Kia EV9 Light LR",y:"2024 \u00b7 27k mi \u00b7 +$1,290 shipping",cat:"suv",cond:"used",seats:6,sticker:37990,cash:0,apr:.075,offer:"Bank loan",
  awd:"RWD \u2014 AWD starts at Wind",kwh100:34.5,mpgLab:"88 MPGe",mpgBar:40,ship:1290,ev:true,charger:true,aw:"2024 World Car of the Year",awUrl:"https://www.kbb.com/car-news/the-kia-ev9-is-the-2024-world-car-of-the-year",ins:13500,mnt:2200,res:15500,rel:1.5,cln:4.0,
  leg2:42.8,leg3:32.0,cargo:20.2,url:"https://www.carvana.com/cars/kia-ev9",lt:"Browse EV9 listings"},
 {n:"Ford Expedition Limited",y:"2017 \u00b7 70k mi \u00b7 old body style",cat:"suv",cond:"used",seats:7,sticker:24990,ship:990,cash:0,apr:.085,offer:"Older-car rate",
  awd:"4WD available",mpg:17,mpgLab:"17",ins:9500,mnt:12000,res:9000,rel:2.5,cln:3.0,leg2:39.1,leg3:37.7,cargo:18.6,
  url:"https://www.carvana.com/vehicle/4629379",lt:"View this listing"},
 {n:"Chevy Tahoe LS",y:"2023 \u00b7 64k mi \u00b7 check 2nd row",cat:"suv",cond:"used",seats:7,sticker:39990,ship:1890,cash:0,apr:.075,offer:"LS ships with a bench",
  awd:"4WD available",mpg:17,mpgLab:"17",ins:12500,mnt:9000,res:18000,rel:3.0,cln:3.0,leg2:42.0,leg3:34.9,cargo:25.5,
  url:"https://www.carvana.com/vehicle/4434231",lt:"View this listing"},
 {n:"Rivian R1S Adventure",y:"2023 \u00b7 63k mi \u00b7 $60,590",cat:"suv",cond:"used",seats:6,sticker:60590,cash:0,apr:.075,offer:"Quad-motor",
  awd:"AWD standard",kwh100:49,mpgLab:"69 MPGe",mpgBar:34,ev:true,charger:true,ins:16000,mnt:4500,res:16000,rel:2.0,cln:4.0,
  leg2:37.6,leg3:32.8,cargo:17.7,url:"https://www.carvana.com/vehicle/4549163",lt:"View this listing"},
 {n:"Rivian R1S Dual Standard",y:"2024 \u00b7 33k mi \u00b7 $63,590",cat:"suv",cond:"used",seats:6,sticker:63590,cash:0,apr:.075,offer:"Longer range",
  awd:"AWD standard",kwh100:49,mpgLab:"69 MPGe",mpgBar:34,ev:true,charger:true,ins:16000,mnt:4000,res:18000,rel:2.0,cln:4.0,
  leg2:37.6,leg3:32.8,cargo:17.7,url:"https://www.carvana.com/vehicle/4460885",lt:"View this listing"},
 {n:"Tesla Model X 100D",y:"2017 \u00b7 47k mi \u00b7 $31,590",cat:"suv",cond:"used",seats:6,sticker:31590,cash:0,apr:.085,offer:"Older-car rate",
  awd:"AWD standard",kwh100:34,mpgLab:"100 MPGe",mpgBar:40,ev:true,charger:true,ins:14000,mnt:8000,res:6000,rel:2.5,cln:4.0,
  leg2:38.5,leg3:32.2,cargo:15.0,url:"https://www.carvana.com/vehicle/4672369",lt:"View this listing"},
 {n:"Tesla Model X Long Range",y:"2020 \u00b7 56k mi \u00b7 $39,590",cat:"suv",cond:"used",seats:6,sticker:39590,cash:0,apr:.080,offer:"Falcon doors",
  awd:"AWD standard",kwh100:34,mpgLab:"100 MPGe",mpgBar:40,ev:true,charger:true,ins:15000,mnt:6000,res:9000,rel:2.5,cln:4.0,
  leg2:38.5,leg3:32.2,cargo:15.0,url:"https://www.carvana.com/vehicle/4662079",lt:"View this listing"},
 {n:"Land Rover Defender 130 S",y:"2025 \u00b7 12k mi \u00b7 bench 2nd row",cat:"suv",cond:"used",seats:8,sticker:74990,cash:0,apr:.075,offer:"No captain's chairs",
  awd:"4WD standard",mpg:17,mpgLab:"17",ins:16000,mnt:14000,res:26000,rel:1.5,cln:3.0,
  leg2:39.1,leg3:32.0,cargo:15.7,url:"https://www.carvana.com/vehicle/4632072",lt:"View this listing"},
 {n:"Jeep Wagoneer Series II",y:"2024 \u00b7 76k mi \u00b7 $31,590",cat:"suv",cond:"used",seats:7,sticker:31590,cash:0,apr:.075,offer:"Bank loan",
  awd:"4WD available",mpg:20,mpgLab:"20",ins:13000,mnt:9000,res:12000,rel:2.0,cln:2.5,leg2:42.7,leg3:36.6,cargo:27.4,
  url:"https://www.carvana.com/vehicle/4676383",lt:"View this listing"}
];

const MATRIX=[
 ["van","Toyota Sienna",78.6,33.5,36,71],
 ["van","Honda Odyssey",79.0,32.8,22,60],
 ["van","Kia Carnival",76.1,40.2,22,55],
 ["van","Pacifica Hybrid",75.5,32.3,82,45],
 ["suv","Grand Highlander Hyb",73.0,20.6,36,62],
 ["suv","Toyota Sequoia",72.9,11.5,21,58],
 ["suv","Chevy Tahoe / Yukon",76.9,25.5,17,57],
 ["suv","Telluride Hyb (2027)",75.1,21.3,35,55],
 ["suv","Chevy Suburban",78.7,41.5,17,55],
 ["suv","Kia Telluride (2024)",73.8,21.0,22,55],
 ["suv","Palisade Hybrid (2026)",75.1,19.1,34,57],
 ["suv","Honda Pilot TrailSport",73.3,18.6,21,55],
 ["suv","Subaru Ascent Onyx",70.3,17.6,22,52],
 ["suv","Mazda CX-90 PHEV",69.8,14.9,56,45],
 ["suv","Highlander Hybrid",68.7,16.0,35,58],
 ["suv","Ford Expedition",77.6,20.9,19,48],
 ["suv","Land Rover Defender 130",71.1,15.7,17,45],
 ["suv","Jeep Wagoneer",79.3,27.4,20,42],
 ["suv","Nissan Armada",69.4,16.5,16,42],
 ["suv","Rivian R1S",70.4,17.7,null,40],
 ["suv","Tesla Model X",70.7,15.0,null,38],
 ["suv","Kia EV9",74.8,20.2,null,37]
];

const SPECS=[
 ["van","Toyota Sienna",7,39.9,38.7,33.5,"36",0],
 ["van","Honda Odyssey",7,40.9,38.1,32.8,"22",0],
 ["van","Pacifica Hybrid",7,39.0,36.5,32.3,"82e",0],
 ["van","Kia Carnival",7,40.5,35.6,40.2,"22",0],
 ["suv","Chevy Suburban",7,42.0,36.7,41.5,"17",0],
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
 ["suv","Nissan Armada",7,41.0,28.4,16.5,"16",0],
 ["suv","Nissan Pathfinder 2024",7,35.5,28.0,16.6,"23",0],
 ["suv","Honda Pilot TrailSport",7,40.8,32.5,18.6,"21",0],
 ["suv","Subaru Ascent Onyx",7,38.6,31.7,17.6,"22",0],
 ["suv","Mazda CX-90 PHEV",7,39.4,30.4,14.9,"56e",0],
 ["suv","Highlander Hybrid",7,41.0,27.7,16.0,"35",0],
 ["suv","Nissan Pathfinder 2017",7,41.7,30.7,16.0,"20",0]
];

const GC=[[/Woodland/,6.9],[/Sienna/,6.3],[/Odyssey/,4.9],[/Pacifica/,5.1],[/Carnival/,6.8],
 [/Telluride X-Line/,8.4],[/Telluride Hybrid/,8.0],[/Telluride/,8.4],[/Palisade/,7.9],
 [/Grand Highlander/,8.0],[/Pilot TrailSport/,8.3],[/Ascent/,8.7],[/CX-90/,8.0],
 [/Highlander Hybrid/,8.0],[/EV9/,7.8],[/R1S/,9.9],[/Model X/,5.4],[/Defender/,8.5],
 [/Wagoneer/,8.3],[/Tahoe|Suburban|Yukon/,8.0],[/Sequoia/,8.6],[/Expedition/,8.6],[/Pathfinder/,7.0]];
const OWN=[[/Woodland|Sienna/,4.4,600],[/Odyssey/,4.3,550],[/Pacifica/,3.8,690],[/Carnival Hybrid/,4.5,520],
 [/Carnival/,4.3,520],[/Telluride/,4.1,520],[/Palisade/,4.2,550],[/Grand Highlander/,4.5,510],
 [/Highlander Hybrid/,4.4,490],[/Pilot/,4.4,540],[/Ascent/,4.2,590],[/CX-90/,3.9,640],
 [/EV9/,4.6,450],[/R1S/,4.3,900],[/Model X/,4.0,950],[/Defender/,3.6,1250],
 [/Wagoneer/,2.7,1150],[/Tahoe|Suburban|Yukon/,3.4,744],[/Sequoia/,4.2,650],[/Expedition/,3.7,861],
 [/Pathfinder/,3.9,542]];

const PRESETS=[
 ["Honda Pilot 2016-2022",38.4,31.9,16.5,22],
 ["Toyota Highlander 2020-2024",41.0,27.7,16.0,24],
 ["Chevy Traverse 2018-2023",38.4,33.5,23.0,21],
 ["Ford Explorer 2020-2025",39.0,32.2,18.2,24],
 ["Kia Sorento 2021-2025",41.7,29.6,12.6,26]
];

// Static tables. These were literal markup in the standalone file; here they are
// data so the JSX below stays readable.
const OWNER_GROUPS = [
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
      ['Tahoe / Suburban', '3.4', '$744', 'Severe when it goes'],
      ['Ford Expedition', '3.7', '$861', 'EcoBoost turbos'],
      ['Rivian R1S', '4.3', '$900', 'Loved, but few shops'],
      ['Tesla Model X', '4.0', '$950', 'Falcon doors, air suspension'],
      ['Jeep Wagoneer', '2.7', '$1,150', 'Worst owner score here'],
      ['Land Rover Defender', '3.6', '$1,250', 'Dealer-only work'],
    ],
  },
];

const RELIABILITY_GROUPS = [
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
      ['Chevy Tahoe / Yukon', '3.0', '3.0', '57%', 'Solid, thirsty'],
      ['Kia Telluride', '3.5', '3.5', '55%', 'Small third row'],
      ['Ford Expedition', '2.5', '3.0', '48%', 'Big 3rd row, small boot'],
      ['Jeep Wagoneer', '2.0', '2.5', '42%', 'Carpet, weak record'],
      ['Kia EV9', '1.5', '4.0', '37%', "Kia's least reliable", true],
    ],
  },
];

const FINANCE_OFFERS = [
  ['Kia EV9', '0% / 60 mo', 'Or $10,000 cash back.'],
  ['Kia Carnival', '4.49% / 60 mo', '1.9–3.99% at 48 months.'],
  ['Grand Highlander', '4.99% / 60 mo', 'Also at 72 months.'],
  ['Chevy Suburban', '5.9% / 60 mo', 'No cash back.'],
  ['Toyota Sienna', 'No APR special', 'Lease offer only.'],
  ['Used, any brand', '7.0–10.5%', 'Credit unions lowest.'],
];

const LEASES = [
  ['Sienna LE, $319/mo', '$15,483', '$22,233'],
  ['Grand Highlander XLE, $439/mo', '$19,803', '$26,553'],
  ['Carnival LX, $399/mo', '$18,363', '$29,613'],
  ['Kia EV9 LR, $419/mo (24 mo)', '$14,055', '$21,555'],
];

// The pre-purchase checklist, grouped as it is on the page.
const CHECKS = [
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
      'Second row: captain’s chairs or a bench? Especially Wagoneer Series II, Carnival LX and LXS, Tahoe LS.',
      'Accident history, number of owners, and how much factory warranty remains.',
      'Tyre and brake life — a set of tyres on any of these runs $900–$1,400.',
      'Open recalls, free to check by VIN at nhtsa.gov.',
    ],
  },
  {
    g: 'At a dealer',
    items: [
      'Ask for the out-the-door price in writing by email before visiting. Refuse to discuss monthly payment.',
      'Ask what add-ons are on the car. Paint protection, VIN etching and market adjustments are where $2,000–$4,000 hides.',
      'Ask whether taking the promotional APR forfeits a cash rebate. On the EV9 you must choose one.',
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

const SOURCE_ROWS = [
  ['Used prices and links', 'Carvana listings, 30 Aug 2026', 'Actual cars'],
  ['New prices and links', 'Dealer inventory, San Antonio to Bryan', 'Actual cars'],
  ['Legroom, cargo, clearance', 'Manufacturer specs', 'Published'],
  ['MPG and MPGe', 'EPA combined ratings', 'Published'],
  ['Finance offers', 'Kia, Toyota, GM, August 2026', 'Expire 31 Aug'],
  ['Electricity rate', 'Your GVEC bill, Aug 2026', 'Your actual rate'],
  ['Charger rebate', 'GVEC EV charger programme', 'Published'],
  ['EV road fee, sales tax', 'Texas SB 505, Comptroller', 'Statute'],
  ['Depreciation', 'iSeeCars 5-year study', 'Model average'],
  ['Repairs per year', 'RepairPal-style averages', 'Model average'],
  ['Owner ratings', 'KBB, Edmunds, CarGurus', 'Model average'],
  ['Reliability score', 'Consumer Reports + recalls', 'My judgement'],
  ['Cleanability score', 'Interior features', 'My judgement'],
  ['Insurance, maintenance', 'Type-based estimates', 'Estimate, not a quote'],
  ['Resale dollars', 'Depreciation + mileage discount', 'Estimate'],
];

// ---------------------------------------------------------------------------
// The model
// ---------------------------------------------------------------------------

const TAX = 0.0625;
const FEES = 400;

const DEFAULT_ASSUMPTIONS = {
  down: 10000,
  miles: 25000,
  gas: 3.0,
  kwh: 0.113,
  elec: 0.55,
  charger: 1000,
  term: 60,
};
const DEFAULT_FILTERS = { cat: 'all', cond: 'all', must: {}, sort: 'net', maxp: 80000 };

const money = (v) => '$' + Math.round(v).toLocaleString();

const pmt = (principal, apr, n) => {
  if (principal <= 0) return 0;
  if (apr === 0) return principal / n;
  const r = apr / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
};

// Fuel cost per mile: electricity for EVs, a blend for plug-ins, petrol otherwise.
const perMile = (o, S) => {
  const g = o.diesel ? S.gas * 1.22 : S.gas;
  if (o.ev) return (o.kwh100 / 100) * S.kwh;
  if (o.phev) return S.elec * ((o.kwh100 / 100) * S.kwh) + (1 - S.elec) * (g / o.mpg);
  return g / o.mpg;
};

// Five-year running total. Resale is marked down about 11% for every extra
// 25,000 miles a year beyond the 15,000-a-year the published figures assume.
const compute = (o, S) => {
  const price = o.sticker + (o.ship || 0);
  const tax = price * TAX + FEES;
  const loan = Math.max(0, price + tax - o.cash - S.down);
  const m = pmt(loan, o.apr, S.term);
  const interest = m * S.term - loan;
  const wear = Math.max(0.45, Math.min(1.15, 1 - 0.11 * ((S.miles * 5 - 75000) / 25000)));
  const res = o.res * wear;
  const fuel = S.miles * 5 * perMile(o, S);
  const dep = price + tax - o.cash - res;
  const chg = o.charger ? S.charger : 0;
  const evfee = o.ev ? 1000 : 0;
  return {
    net: dep + interest + fuel + o.ins + o.mnt + chg + evfee,
    evfee,
    dep,
    interest,
    fuel,
    ins: o.ins,
    mnt: o.mnt,
    chg,
    m,
    res,
  };
};

const ownFor = (o) => OWN.find((r) => r[0].test(o.n)) || null;
const gcFor = (o) => {
  const hit = GC.find((r) => r[0].test(o.n));
  return hit ? hit[1] : null;
};

const hasAWD = (o) => !/No AWD|FWD only|RWD/i.test(o.awd);
const isEff = (o) => !!(o.ev || o.phev || (o.mpg && o.mpg >= 30));

const passes = (o, F) => {
  if (F.cat !== 'all' && o.cat !== F.cat) return false;
  if (F.cond !== 'all' && o.cond !== F.cond) return false;
  if (F.must.awd && !hasAWD(o)) return false;
  if (F.must.s7 && o.seats < 7) return false;
  if (F.must.eff && !isEff(o)) return false;
  if (o.sticker > F.maxp) return false;
  return true;
};

const sortRows = (F) => (a, b) => {
  if (F.sort === 'pmt') return a.c.m - b.c.m;
  if (F.sort === 'leg3') return b.o.leg3 - a.o.leg3;
  if (F.sort === 'cargo') return b.o.cargo - a.o.cargo;
  if (F.sort === 'res') return b.c.res - a.c.res;
  return a.c.net - b.c.net;
};

// Recommendation score: cost is a third of it, the rest is what the car is like
// to live with. Weights are spelled out on the card itself.
const scoreRow = (r, lo, hi) => {
  const cost = hi > lo ? 1 - (r.c.net - lo) / (hi - lo) : 1;
  const own = ownFor(r.o) ? ownFor(r.o)[1] / 5 : 0.7;
  return (
    cost * 0.35 +
    (r.o.rel / 5) * 0.2 +
    own * 0.1 +
    Math.min(1, r.o.leg3 / 38.7) * 0.15 +
    Math.min(1, r.o.cargo / 41.5) * 0.15 +
    (r.o.cln / 5) * 0.05
  );
};
const bestOf = (list) => {
  if (!list.length) return null;
  let lo = Infinity;
  let hi = -Infinity;
  list.forEach((r) => {
    if (r.c.net < lo) lo = r.c.net;
    if (r.c.net > hi) hi = r.c.net;
  });
  return list
    .map((r) => ({ r, s: scoreRow(r, lo, hi) }))
    .sort((a, b) => b.s - a.s);
};
const rowLabel = (r) => `${r.o.n} — ${money(r.o.sticker)}, ${money(r.c.net)} over 5 yrs`;

const specMpg = (v) => {
  const n = parseFloat(v);
  return /e$/.test(v) ? null : Number.isNaN(n) ? null : n;
};
const baseFromSpec = (r) => ({
  name: r[1],
  leg2: r[3],
  leg3: r[4],
  cargo: r[5],
  mpg: specMpg(r[6]),
  frunk: r[7] || 0,
});

const LGMAX = 43.5;
const CGMAX = 45;

// ---------------------------------------------------------------------------
// "Why this number" popovers. One is open at a time, as in the original.
// ---------------------------------------------------------------------------

const WhyContext = createContext({ open: null, toggle: () => {} });
const useWhy = (id) => {
  const { open, toggle } = useContext(WhyContext);
  return [open === id, () => toggle(id)];
};

const WHY = {
  leg2:
    'Manufacturer second-row legroom, measured with the seat all the way back. Green is the gain over your comparison car, red a loss. Bar is scaled against the roomiest here, the 43-inch Telluride and Palisade.',
  leg3:
    "Third-row legroom. This is the figure that separates a usable back seat from a jump seat. Under about 31 inches is children only; the Sienna's 38.7 is the most on this page.",
  cargo:
    'Cubic feet behind the third row with all seats up. Frunks are not counted here; the three EVs add 3.2 to 11.1 cu ft up front, shown in the comparison chart above.',
  mpg:
    'EPA combined rating. MPGe for electrics and plug-ins is not comparable to petrol mpg, so the fuel cost in the bar above uses your actual electricity and petrol prices instead.',
  res:
    'Starts from iSeeCars five-year depreciation for the model, then discounts about 11% per extra 25,000 miles a year. Percentage is against what you pay, so used cars look better than new ones on this line.',
  rel:
    'My score from Consumer Reports predicted reliability plus recall history. 4.5 means CR rates it above average; 1.5 means bottom of its class. This is a judgement, not a measurement.',
  cln:
    'Weighs wipeable synthetic leather over cloth, seats that fold into the floor or come out, a low flat load floor, a built-in vacuum, and standard all-weather mats. The Sienna loses points because its second row cannot be removed and there is carpet underneath.',
  own:
    'Averaged consumer scores from Kelley Blue Book, Edmunds and CarGurus. Owners rate how much they enjoy the car, which is why the EV9 scores 4.6 despite poor reliability data.',
  repairs:
    'RepairPal-style average for unscheduled repairs and maintenance across all model years of the model. It describes the nameplate over a lifetime, not this particular car. Longer bar is cheaper.',
  dep:
    'Asking price plus 6.25% Texas sales tax and $400 of title and registration fees, minus what the car should be worth at year five. Usually the biggest single number on this page.',
  interest:
    'Total interest over the loan term at the APR shown on each card. New cars often get manufacturer rates of 0-5%; used cars run 7-10.5% from a bank or credit union.',
  fuel:
    'Your miles per year times five, at the petrol or electricity price you set in Assumptions. Plug-ins blend the two using the battery-share slider.',
  ins:
    'Five-year estimate scaled by vehicle type and value, not a quote. Texas rates run above the national average, and EVs and large SUVs cost more to insure.',
  mnt:
    'Five-year estimate reflecting the car’s age and the mileage you will add. Older and higher-mileage cars carry much larger figures because repair frequency climbs with wear.',
  chg:
    "One-time Level 2 charger installation, charged only to the electrics and the plug-in Pacifica. Default is a typical $1,600 job less GVEC's $600 rebate.",
  evfee:
    'Texas Senate Bill 505 charges battery EVs $200 a year in road-use fees, $1,000 over five years. Hybrids and plug-in hybrids are exempt.',
  down:
    'Cash you put in on day one. It reduces the loan and therefore the interest, but not the total cost of the car. Your Pathfinder sale should fund most of this.',
  miles:
    'Drives fuel cost and the resale discount. At 25,000 a year you cover 125,000 miles in five years, which is why efficient cars pull ahead and older cars fall behind.',
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

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

// A labelled figure with a scaled bar, and an optional tap-to-open explanation.
const Spec = ({ id, label, value, frac, why }) => {
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
const KeyItem = ({ id, color, label, why }) => {
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

const Slider = ({ id, label, why, out, min, max, step, value, onChange }) => {
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
const delta = (x) =>
  x > 0.05 ? (
    <span style={{ color: 'var(--s3)' }}> +{x.toFixed(1)}</span>
  ) : x < -0.05 ? (
    <span style={{ color: 'var(--warn-text)' }}> {x.toFixed(1)}</span>
  ) : null;

const MxBar = ({ frac, color }) => (
  <div className="mxb">
    <i
      style={{
        width: `${Math.max(3, Math.min(100, frac * 100)).toFixed(1)}%`,
        background: `var(--${color})`,
      }}
    />
  </div>
);

const LgLine = ({ lab, base, val, max, cls, unit, frunk }) => {
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

const TrophyIcon = () => (
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

const Assumptions = ({ S, setS, idp }) => {
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

const CostCard = ({ o, c, base, isBest, cat }) => {
  const seg = (v) => `${((v / c.net) * 100).toFixed(2)}%`;
  const own = ownFor(o);
  const clearance = gcFor(o);
  const key = `${o.n} ${o.y}`;
  return (
    <div className={isBest ? 'card best' : 'card'}>
      {isBest && <div className="tag">Best {cat === 'van' ? 'minivan' : 'SUV'} on cost</div>}
      <div className="head">
        <div>
          <div className="nm">
            {o.n}
            <span className={o.seats < 7 ? 'pill six' : 'pill'}>{o.seats} seats</span>
            <span className={o.cond === 'new' ? 'cond nw' : 'cond'}>{o.cond.toUpperCase()}</span>
          </div>
          <div className="meta">
            {o.y} · {o.offer} · {money(c.m)}/mo
          </div>
        </div>
        <div>
          <div className="net">{money(o.sticker)}</div>
          <div className="netlab">{money(c.net)} over 5 yrs</div>
        </div>
      </div>
      <div className="stack">
        <i style={{ width: seg(c.dep), background: 'var(--s1)' }} />
        <i style={{ width: seg(c.interest), background: 'var(--s2)' }} />
        <i style={{ width: seg(c.fuel), background: 'var(--s3)' }} />
        <i style={{ width: seg(c.ins), background: 'var(--s4)' }} />
        <i style={{ width: seg(c.mnt), background: 'var(--s5)' }} />
        {!!c.chg && <i style={{ width: seg(c.chg), background: 'var(--s6)' }} />}
      </div>
      <div className="key">
        <span>Depreciation {money(c.dep)}</span>
        <span>Interest {money(c.interest)}</span>
        <span>Fuel {money(c.fuel)}</span>
        <span>Sell for {money(c.res)}</span>
        {!!c.chg && <span>Charger {money(c.chg)}</span>}
        {!!c.evfee && <span>TX EV fee {money(c.evfee)}</span>}
      </div>
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
              {money(c.res)}{' '}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {Math.round((c.res / o.sticker) * 100)}% kept
              </span>
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
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px' }}>
        Drive: {o.awd}
        {clearance ? ` · ${clearance.toFixed(1)}" clearance` : ''}
      </div>
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
  );
};

// ---------------------------------------------------------------------------

const VehicleCostView = () => {
  const [S, setS] = useState(DEFAULT_ASSUMPTIONS);
  const [F, setF] = useState(DEFAULT_FILTERS);
  const [base, setBase] = useState(() => baseFromSpec(SPECS[SPECS.length - 1]));
  const [baseSel, setBaseSel] = useState(`s${SPECS.length - 1}`);
  const [mxSort, setMxSort] = useState(5);
  const [why, setWhy] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const whyCtx = useMemo(
    () => ({ open: why, toggle: (id) => setWhy((cur) => (cur === id ? null : id)) }),
    [why],
  );

  const priced = useMemo(() => OPTIONS.map((o) => ({ o, c: compute(o, S) })), [S]);
  const matching = useMemo(() => priced.filter((r) => passes(r.o, F)), [priced, F]);

  const groups = ['van', 'suv'].map((cat) => {
    const rows = matching.filter((r) => r.o.cat === cat).sort(sortRows(F));
    const best = Math.max(0, rows.findIndex((r) => r.o.seats >= 7));
    return { cat, rows, best };
  });
  const matchCount = groups[0].rows.length + groups[1].rows.length;

  // The overview matrix carries your current car as an extra row.
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

  // Recommendation, and what it would have been without the AWD requirement.
  const ranked = bestOf(matching);
  const top = ranked ? ranked[0].r : null;
  const runnerUp = ranked && ranked[1] ? ranked[1].r : null;
  const cheapest = matching.length ? matching.slice().sort((a, b) => a.c.net - b.c.net)[0] : null;
  const awdOn = !!F.must.awd;
  const wideRanked = awdOn
    ? bestOf(priced.filter((r) => passes(r.o, { ...F, must: { ...F.must, awd: false } })))
    : null;
  const awdAlt = wideRanked && top && wideRanked[0].r.o.n !== top.o.n ? wideRanked[0].r : null;

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

  const toggleFilter = (f, v) => {
    if (f === 'must') setF((prev) => ({ ...prev, must: { ...prev.must, [v]: !prev.must[v] } }));
    else setF((prev) => ({ ...prev, [f]: v }));
  };
  const segBtn = (f, v, label, extra) => (
    <button
      key={v}
      type="button"
      data-why={extra || undefined}
      aria-pressed={f === 'must' ? !!F.must[v] : F[f] === v}
      onClick={() => toggleFilter(f, v)}
    >
      {label}
    </button>
  );

  return (
    <WhyContext.Provider value={whyCtx}>
      <div className="vehcost">
        <div className="wrap">
          <div className="stick">
            <div className="stickin">
              <div className="stickv">
                {Math.round(S.miles).toLocaleString()} mi/yr · ${S.gas.toFixed(2)}/gal · {money(S.down)} down ·{' '}
                {S.term} mo
              </div>
              <button
                className="stickb"
                type="button"
                aria-expanded={panelOpen}
                onClick={() => setPanelOpen((v) => !v)}
              >
                Assumptions
              </button>
            </div>
            {panelOpen && (
              <div className="panel">
                <Assumptions S={S} setS={setS} idp="sticky-" />
              </div>
            )}
          </div>

          <h1 style={{ marginTop: '20px' }}>Three-row family vehicle</h1>
          <p className="sub">
            Seven seats with second-row captain&rsquo;s chairs, priced against real listings near 78130. Minivans and
            SUVs kept separate throughout.
          </p>

          <section>
            <h2>What this is</h2>
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
          </section>

          <section>
            <h2>Seven things the research turned up</h2>
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
          </section>

          <section>
            <h2>The short version</h2>
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
          </section>

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
              Grey is what your 2024 Pathfinder gives you today — 35.5&quot; in the second row, 28.0&quot; in the third.
              Colour is what you would gain.
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

          <section>
            <h2>Seat count and cleanability</h2>
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
          </section>

          <section>
            <h2>Two traps in the older listings</h2>
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
          </section>

          <section>
            <h2>Your assumptions</h2>
            <Assumptions S={S} setS={setS} idp="veh-" />
            <p className="fine" style={{ marginTop: '10px' }}>
              Default is 25,000 miles a year, so 125,000 miles over five years. Resale is discounted for that extra
              wear, roughly 11% per additional 25,000 miles. Electricity is your GVEC marginal rate: $0.085 generation
              plus $0.0238 distribution, then the 2% franchise fee and 1.5% city tax. The $25 service charge is fixed,
              so it isn&rsquo;t counted. Charger default is a typical $1,600 install less GVEC&rsquo;s $600 rebate.
            </p>
          </section>

          <section>
            <h2>Leasing, and why it fails here</h2>
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
          </section>

          <section>
            <h2>Rivian, Tesla, Land Rover, Ineos</h2>
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
          </section>

          <section>
            <h2>What owners say, and what repairs cost</h2>
            <p className="fine" style={{ marginBottom: '10px' }}>
              Owner ratings are averaged from Kelley Blue Book, Edmunds and CarGurus consumer scores. Repair figures are
              RepairPal-style averages for unscheduled repairs and maintenance across all model years, so they describe
              the model over a lifetime rather than any one car.
            </p>
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
          </section>

          <section>
            <h2>Driving on the beach</h2>
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
          </section>

          <section>
            <h2>Texas rules that change the maths</h2>
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
          </section>

          <section>
            <h2>Financing found, August 2026</h2>
            <div className="offers">
              {FINANCE_OFFERS.map(([brand, rate, note]) => (
                <div className="offer" key={brand + rate}>
                  <b>{brand}</b>
                  <em>{rate}</em>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Five-year cost</h2>
            <p className="fine" style={{ marginBottom: '10px' }}>
              Large figure is the asking price. Underneath it is the net five-year cost after you sell. Each card also
              shows what it should be worth at year five, adjusted for your mileage. The bar shows where each dollar
              goes.
            </p>
            <div className="key" style={{ marginBottom: '8px' }}>
              <KeyItem id="key-dep" color="s1" label="Depreciation + tax" why={WHY.dep} />
              <KeyItem id="key-int" color="s2" label="Interest" why={WHY.interest} />
              <KeyItem id="key-fuel" color="s3" label="Fuel" why={WHY.fuel} />
              <KeyItem id="key-ins" color="s4" label="Insurance" why={WHY.ins} />
              <KeyItem id="key-mnt" color="s5" label="Maintenance" why={WHY.mnt} />
              <KeyItem id="key-chg" color="s6" label="Charger" why={WHY.chg} />
              <KeyItem id="key-evfee" color="s5" label="TX EV fee" why={WHY.evfee} />
            </div>

            <div className="card" style={{ marginBottom: '12px', border: '2px solid var(--border-strong)', padding: '15px' }}>
              {!top ? (
                <>
                  <div className="nm">Nothing matches</div>
                  <div className="meta">Loosen a filter above.</div>
                </>
              ) : (
                <>
                  <div className="tag">Best overall{awdOn ? ' with AWD' : ''}</div>
                  <div className="nm">{top.o.n}</div>
                  <div className="meta">
                    {top.o.y} · {money(top.c.m)}/mo · {money(top.c.net)} over five years
                  </div>
                  <div className="specs" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
                    <Spec id="reco-leg3" label="3rd row" value={`${top.o.leg3.toFixed(1)}"`} frac={top.o.leg3 / 38.7} />
                    <Spec
                      id="reco-cargo"
                      label="Cargo"
                      value={`${top.o.cargo.toFixed(1)} cu ft`}
                      frac={top.o.cargo / 41.5}
                    />
                    <Spec id="reco-rel" label="Reliability" value={`${top.o.rel.toFixed(1)} / 5`} frac={top.o.rel / 5} />
                    <Spec
                      id="reco-mpg"
                      label="MPG"
                      value={top.o.mpgLab}
                      frac={Math.min(1, (top.o.mpgBar || top.o.mpg) / 40)}
                    />
                  </div>
                  <p className="fine" style={{ margin: '12px 0 0' }}>
                    Scored 35% on five-year cost, 20% reliability, 15% third row, 15% cargo, 10% owner rating, 5%
                    cleanability, across the {matching.length} vehicles matching your filters.
                  </p>
                  {runnerUp && (
                    <p className="fine" style={{ margin: '6px 0 0' }}>
                      <b>Runner-up:</b> {rowLabel(runnerUp)}
                    </p>
                  )}
                  {cheapest && cheapest.o.n !== top.o.n && (
                    <p className="fine" style={{ margin: '6px 0 0' }}>
                      <b>Cheapest that matches:</b> {rowLabel(cheapest)}
                    </p>
                  )}
                  {awdAlt ? (
                    <p className="fine" style={{ margin: '6px 0 0' }}>
                      <b>Drop the AWD requirement</b> and the pick becomes {rowLabel(awdAlt)}.
                    </p>
                  ) : awdOn ? (
                    <p className="fine" style={{ margin: '6px 0 0' }}>
                      Dropping the AWD requirement would not change the pick.
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="ctrl">
                <label>Body</label>
                <div className="seg">
                  {segBtn('cat', 'all', 'All')}
                  {segBtn('cat', 'van', 'Minivan')}
                  {segBtn('cat', 'suv', 'SUV')}
                </div>
              </div>
              <div className="ctrl">
                <label>Condition</label>
                <div className="seg">
                  {segBtn('cond', 'all', 'All')}
                  {segBtn('cond', 'new', 'New')}
                  {segBtn('cond', 'used', 'Used')}
                </div>
              </div>
              <div className="ctrl">
                <label>Must have</label>
                <div className="seg">
                  {segBtn('must', 'awd', 'AWD', WHY.awdFilter)}
                  {segBtn('must', 's7', '7 seats')}
                  {segBtn('must', 'eff', '30+ mpg')}
                </div>
              </div>
              <div className="ctrl">
                <label htmlFor="veh-maxp">
                  Max asking price <output>{F.maxp >= 80000 ? 'Any' : money(F.maxp)}</output>
                </label>
                <input
                  type="range"
                  id="veh-maxp"
                  min={20000}
                  max={80000}
                  step={1000}
                  value={F.maxp}
                  onChange={(e) => setF((prev) => ({ ...prev, maxp: parseInt(e.target.value, 10) }))}
                />
              </div>
              <div className="ctrl">
                <label>Sort by</label>
                <div className="seg">
                  {segBtn('sort', 'net', '5-yr cost')}
                  {segBtn('sort', 'pmt', 'Payment')}
                  {segBtn('sort', 'leg3', '3rd row')}
                  {segBtn('sort', 'cargo', 'Cargo')}
                  {segBtn('sort', 'res', 'Resale')}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '0.5px solid var(--border)',
                }}
              >
                <span className="fine">
                  {matchCount} of {OPTIONS.length} {matchCount === 1 ? 'vehicle' : 'vehicles'} match
                </span>
                <button className="stickb" type="button" onClick={() => setF(DEFAULT_FILTERS)}>
                  Reset
                </button>
              </div>
            </div>

            {groups.map(({ cat, rows, best }) =>
              rows.length ? (
                <Fragment key={cat}>
                  <h3>{cat === 'van' ? 'Minivans' : 'SUVs'}</h3>
                  {rows.map((r, i) => (
                    <CostCard
                      key={`${r.o.n} ${r.o.y}`}
                      o={r.o}
                      c={r.c}
                      base={base}
                      isBest={i === best}
                      cat={cat}
                    />
                  ))}
                </Fragment>
              ) : null,
            )}
          </section>

          <section>
            <h2>All-wheel drive</h2>
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
          </section>

          <section>
            <h2>Reliability, cleanability, resale</h2>
            <p className="fine" style={{ marginBottom: '8px' }}>
              Reliability follows Consumer Reports predicted ratings and recall history. Cleanability weighs wipeable
              seat material, seats that stow or remove, a low flat floor, and a built-in vacuum.
            </p>
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

          <section>
            <h2>What to check before you buy</h2>
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
          </section>

          <section>
            <h2>Where every number comes from</h2>
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
          </section>

          <section>
            <h2>Before you decide</h2>
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
          </section>
        </div>
      </div>
    </WhyContext.Provider>
  );
};

export default VehicleCostView;
