// ---------------------------------------------------------------------------
// Data for the three-row family vehicle comparison.
//
// Prices are real listings near 78130 as of 30 Aug 2026: Carvana for used,
// dealer inventory for new. Legroom, cargo and MPG are manufacturer/EPA
// figures; insurance, maintenance and resale are estimates, which is why the
// page says to treat sub-$3,000 gaps as ties.
// ---------------------------------------------------------------------------

export const OPTIONS=[
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

export const MATRIX=[
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

export const SPECS=[
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

export const GC=[[/Woodland/,6.9],[/Sienna/,6.3],[/Odyssey/,4.9],[/Pacifica/,5.1],[/Carnival/,6.8],
 [/Telluride X-Line/,8.4],[/Telluride Hybrid/,8.0],[/Telluride/,8.4],[/Palisade/,7.9],
 [/Grand Highlander/,8.0],[/Pilot TrailSport/,8.3],[/Ascent/,8.7],[/CX-90/,8.0],
 [/Highlander Hybrid/,8.0],[/EV9/,7.8],[/R1S/,9.9],[/Model X/,5.4],[/Defender/,8.5],
 [/Wagoneer/,8.3],[/Tahoe|Suburban|Yukon/,8.0],[/Sequoia/,8.6],[/Expedition/,8.6],[/Pathfinder/,7.0]];
export const OWN=[[/Woodland|Sienna/,4.4,600],[/Odyssey/,4.3,550],[/Pacifica/,3.8,690],[/Carnival Hybrid/,4.5,520],
 [/Carnival/,4.3,520],[/Telluride/,4.1,520],[/Palisade/,4.2,550],[/Grand Highlander/,4.5,510],
 [/Highlander Hybrid/,4.4,490],[/Pilot/,4.4,540],[/Ascent/,4.2,590],[/CX-90/,3.9,640],
 [/EV9/,4.6,450],[/R1S/,4.3,900],[/Model X/,4.0,950],[/Defender/,3.6,1250],
 [/Wagoneer/,2.7,1150],[/Tahoe|Suburban|Yukon/,3.4,744],[/Sequoia/,4.2,650],[/Expedition/,3.7,861],
 [/Pathfinder/,3.9,542]];

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
      ['Tahoe / Suburban', '3.4', '$744', 'Severe when it goes'],
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
      ['Chevy Tahoe / Yukon', '3.0', '3.0', '57%', 'Solid, thirsty'],
      ['Kia Telluride', '3.5', '3.5', '55%', 'Small third row'],
      ['Ford Expedition', '2.5', '3.0', '48%', 'Big 3rd row, small boot'],
      ['Jeep Wagoneer', '2.0', '2.5', '42%', 'Carpet, weak record'],
      ['Kia EV9', '1.5', '4.0', '37%', "Kia's least reliable", true],
    ],
  },
];

export const FINANCE_OFFERS = [
  ['Kia EV9', '0% / 60 mo', 'Or $10,000 cash back.'],
  ['Kia Carnival', '4.49% / 60 mo', '1.9–3.99% at 48 months.'],
  ['Grand Highlander', '4.99% / 60 mo', 'Also at 72 months.'],
  ['Chevy Suburban', '5.9% / 60 mo', 'No cash back.'],
  ['Toyota Sienna', 'No APR special', 'Lease offer only.'],
  ['Used, any brand', '7.0–10.5%', 'Credit unions lowest.'],
];

export const LEASES = [
  ['Sienna LE, $319/mo', '$15,483', '$22,233'],
  ['Grand Highlander XLE, $439/mo', '$19,803', '$26,553'],
  ['Carnival LX, $399/mo', '$18,363', '$29,613'],
  ['Kia EV9 LR, $419/mo (24 mo)', '$14,055', '$21,555'],
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

export const SOURCE_ROWS = [
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


// "Why this number" copy, shown when a figure is tapped.
export const WHY = {
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
