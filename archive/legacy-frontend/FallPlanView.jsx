import { useState } from 'react';
import '../fall-plan.css';

// ---------------------------------------------------------------------------
// FALL PLAN — the Fall 2026 family call sheet, ported from the standalone
// iddings-fall-plan.html. Same data, same markup, same CSS (now scoped under
// .fallplan in src/fall-plan.css). Sources: NBCA campus newsletter, the 2026
// Wildcat Football parents packet, Coach Alorda's NBYSA U11 email; drive times
// door to door via OpenStreetMap routing, August 2026.
// ---------------------------------------------------------------------------

// Timeline runs 7:00 AM to 8:00 PM; every block is placed as a % of that span.
const T0 = 7;
const T1 = 20;
const SPAN = T1 - T0;
const pct = (h) => ((h - T0) / SPAN) * 100;
const fmt = (h) => {
  const H = Math.floor(h);
  const M = Math.round((h - H) * 60);
  const ap = H >= 12 ? 'p' : 'a';
  let hh = H % 12;
  if (hh === 0) hh = 12;
  return hh + (M ? ':' + String(M).padStart(2, '0') : '') + ap;
};

const DAYS = [
  {
    key: 'mon',
    name: 'Monday',
    tag: 'Chelsea runs the Weston → NBCA → Weston loop',
    drivers:
      'Drop <span class="pill p-cody">Cody</span> &nbsp; Pickup <span class="pill p-chelsea">Chelsea</span> &nbsp; Evening loop <span class="pill p-chelsea">Chelsea</span>',
    rows: [
      {
        who: 'Cassius',
        c: 'var(--kid-c)',
        b: [
          { s: 7.75, e: 15.25, t: 'School', cls: 'school' },
          { s: 15.25, e: 18.25, t: 'Football practice', cls: 'act' },
          { s: 18.48, e: 18.5, t: '', cls: 'wait' },
        ],
      },
      {
        who: 'Dorothy',
        c: 'var(--kid-d)',
        b: [
          { s: 7.75, e: 15.75, t: 'School', cls: 'school' },
          { s: 16.05, e: 18.7, t: 'Home with Cody', cls: 'act d' },
        ],
      },
      {
        who: 'Sebastian',
        c: 'var(--kid-s)',
        b: [
          { s: 7.75, e: 15.17, t: 'School', cls: 'school' },
          { s: 15.17, e: 15.75, t: 'Waiting on campus', cls: 'wait' },
          { s: 16.05, e: 17.25, t: 'Home', cls: 'act s' },
          { s: 17.5, e: 18.5, t: 'AJAX @ Weston', cls: 'act s' },
        ],
      },
      {
        who: 'Chelsea',
        c: 'var(--chelsea)',
        b: [
          { s: 14.87, e: 15.17, t: 'To NBCA', sub: '17 min', cls: 'drive chelsea' },
          { s: 15.17, e: 15.75, t: 'Gap: 3:10 → 3:45', cls: 'wait' },
          { s: 15.75, e: 16.05, t: 'Home w/ D + S', sub: '16 min', cls: 'drive chelsea' },
          { s: 17.25, e: 17.47, t: 'Sebi → Weston', sub: '13 min', cls: 'drive chelsea' },
          { s: 17.53, e: 17.77, t: 'Weston → NBCA', sub: '14 min', cls: 'drive chelsea' },
          { s: 17.77, e: 18.25, t: 'Wait for Cassius', cls: 'wait' },
          { s: 18.25, e: 18.48, t: 'NBCA → Weston', sub: '14 min', cls: 'drive chelsea' },
          { s: 18.5, e: 18.7, t: 'Home, both boys', cls: 'drive chelsea' },
        ],
      },
      {
        who: 'Cody',
        c: 'var(--cody)',
        b: [
          { s: 7.42, e: 7.75, t: 'Drop all three', sub: '20 min', cls: 'drive' },
          { s: 7.75, e: 8.1, t: 'Home', cls: 'drive' },
          { s: 16.05, e: 18.7, t: 'Home with Dorothy', cls: 'ghost' },
        ],
      },
    ],
    note: 'Same shape as Cody’s Tuesday, and it chains rather than doubling back — 53 minutes of driving instead of the 58 two separate round trips would cost. <b>But the margin is one minute.</b> Cassius comes off the field at 6:15, NBCA to Weston is 14 minutes, and AJAX ends at 6:30. Any night football runs long, Sebi waits — but Cody is home, and home to Weston is 13 minutes, so a text at 6:10 solves it. Worth agreeing on that signal in advance rather than improvising it at 6:20.',
  },
  {
    key: 'tue',
    name: 'Tuesday',
    tag: 'Cody runs the Zipp → NBCA → Zipp loop',
    drivers:
      'Drop <span class="pill p-chelsea">Chelsea</span> &nbsp; Pickup <span class="pill p-chelsea">Chelsea</span> &nbsp; Evening loop <span class="pill p-cody">Cody</span>',
    rows: [
      {
        who: 'Cassius',
        c: 'var(--kid-c)',
        b: [
          { s: 7.75, e: 15.25, t: 'School', cls: 'school' },
          { s: 15.25, e: 18.25, t: 'Football practice', cls: 'act' },
          { s: 18.52, e: 19, t: 'Waits at Zipp', cls: 'wait' },
        ],
      },
      {
        who: 'Dorothy',
        c: 'var(--kid-d)',
        b: [
          { s: 7.75, e: 15.75, t: 'School', cls: 'school' },
          { s: 16.05, e: 20, t: 'Home with Chelsea', cls: 'act d' },
        ],
      },
      {
        who: 'Sebastian',
        c: 'var(--kid-s)',
        b: [
          { s: 7.75, e: 15.17, t: 'School', cls: 'school' },
          { s: 15.17, e: 15.75, t: 'Waiting on campus', cls: 'wait' },
          { s: 16.05, e: 17.3, t: 'Home', cls: 'act s' },
          { s: 17.5, e: 19, t: 'NBYSA @ Zipp', cls: 'act s' },
        ],
      },
      {
        who: 'Chelsea',
        c: 'var(--chelsea)',
        b: [
          { s: 7.42, e: 8.1, t: 'Drop + home', sub: '33 min', cls: 'drive chelsea' },
          {
            s: 14.87,
            e: 16.05,
            t: 'Pickup run, home by 4:05',
            sub: '33 min driving',
            cls: 'drive chelsea',
          },
          { s: 16.05, e: 19.12, t: 'Home with Dorothy', cls: 'ghost' },
        ],
      },
      {
        who: 'Cody',
        c: 'var(--cody)',
        b: [
          { s: 17.3, e: 17.45, t: 'Sebi → Zipp', sub: '7 min', cls: 'drive' },
          { s: 17.47, e: 17.75, t: 'Zipp → NBCA', sub: '17 min', cls: 'drive' },
          { s: 17.75, e: 18.25, t: 'Wait for Cassius', cls: 'wait' },
          { s: 18.25, e: 18.52, t: 'NBCA → Zipp', sub: '16 min', cls: 'drive' },
          { s: 18.52, e: 19, t: 'Wait for Sebi', cls: 'wait' },
          { s: 19, e: 19.12, t: 'Home, both boys', cls: 'drive' },
        ],
      },
    ],
    note: 'One car, one parent, both boys home at 7:07. Drop Sebi at 5:27, be at NBCA by 5:45, leave with Cassius at 6:15 and you are back at Zipp with half an hour to spare. Chelsea’s Tuesday is now just the two campus runs. <b>The cost is dead time:</b> 30 minutes in the NBCA lot, then Cassius waits 30 more at Zipp after a three-hour practice. Going home between the drop and the pickup instead adds only 7 minutes of driving and turns that first wait into 20 minutes at the house.',
  },
  {
    key: 'wed',
    name: 'Wednesday',
    tag: 'Same as Monday',
    drivers:
      'Drop <span class="pill p-cody">Cody</span> &nbsp; Pickup <span class="pill p-chelsea">Chelsea</span> &nbsp; Evening loop <span class="pill p-chelsea">Chelsea</span>',
    rows: [
      {
        who: 'Cassius',
        c: 'var(--kid-c)',
        b: [
          { s: 7.75, e: 15.25, t: 'School', cls: 'school' },
          { s: 15.25, e: 18.25, t: 'Football practice', cls: 'act' },
        ],
      },
      {
        who: 'Dorothy',
        c: 'var(--kid-d)',
        b: [
          { s: 7.75, e: 15.75, t: 'School', cls: 'school' },
          { s: 16.05, e: 18.7, t: 'Home with Cody', cls: 'act d' },
        ],
      },
      {
        who: 'Sebastian',
        c: 'var(--kid-s)',
        b: [
          { s: 7.75, e: 15.17, t: 'School', cls: 'school' },
          { s: 15.17, e: 15.75, t: 'Waiting on campus', cls: 'wait' },
          { s: 16.05, e: 17.25, t: 'Home', cls: 'act s' },
          { s: 17.5, e: 18.5, t: 'AJAX @ Weston', cls: 'act s' },
        ],
      },
      {
        who: 'Chelsea',
        c: 'var(--chelsea)',
        b: [
          {
            s: 14.87,
            e: 16.05,
            t: 'Pickup run, home by 4:05',
            sub: '33 min driving',
            cls: 'drive chelsea',
          },
          { s: 17.25, e: 17.47, t: 'Sebi → Weston', cls: 'drive chelsea' },
          { s: 17.53, e: 17.77, t: 'Weston → NBCA', cls: 'drive chelsea' },
          { s: 17.77, e: 18.25, t: 'Wait for Cassius', cls: 'wait' },
          { s: 18.25, e: 18.48, t: 'NBCA → Weston', cls: 'drive chelsea' },
          { s: 18.5, e: 18.7, t: 'Home, both boys', cls: 'drive chelsea' },
        ],
      },
      {
        who: 'Cody',
        c: 'var(--cody)',
        b: [
          { s: 7.42, e: 8.1, t: 'Drop + home', cls: 'drive' },
          { s: 16.05, e: 18.7, t: 'Home with Dorothy', cls: 'ghost' },
        ],
      },
    ],
    note: 'Identical to Monday, and the same one-minute margin applies. If the fall gets heavy this is still the cheapest evening to give back — AJAX is extra training on top of Sebi’s own NBYSA season, and dropping it turns Wednesday into a single 33-minute run for Cassius.',
  },
  {
    key: 'thu',
    name: 'Thursday',
    tag: 'Home, soccer drop, then the game',
    drivers:
      'Drop <span class="pill p-chelsea">Chelsea</span> &nbsp; Pickup + soccer + game <span class="pill p-cody">Cody</span> &nbsp; Home run <span class="pill p-jona">Jona</span>',
    rows: [
      {
        who: 'Cassius',
        c: 'var(--kid-c)',
        b: [
          { s: 7.75, e: 15.25, t: 'School', cls: 'school' },
          { s: 15.25, e: 17.5, t: 'Stays for JV game', cls: 'act' },
          { s: 17.5, e: 19.25, t: 'JV game', cls: 'act' },
        ],
      },
      {
        who: 'Dorothy',
        c: 'var(--kid-d)',
        b: [
          { s: 7.75, e: 15.75, t: 'School', cls: 'school' },
          { s: 16.05, e: 17.25, t: 'Home', cls: 'act d' },
          { s: 17.75, e: 19.25, t: 'At the game', cls: 'act d' },
        ],
      },
      {
        who: 'Sebastian',
        c: 'var(--kid-s)',
        b: [
          { s: 7.75, e: 15.17, t: 'School', cls: 'school' },
          { s: 15.17, e: 15.75, t: 'Waiting on campus', cls: 'wait' },
          { s: 16.05, e: 17.25, t: 'Home', cls: 'act s' },
          { s: 17.5, e: 19, t: 'NBYSA @ Zipp', cls: 'act s' },
          { s: 19.25, e: 19.55, t: 'Home, house empty', cls: 'wait' },
        ],
      },
      {
        who: 'Cody',
        c: 'var(--cody)',
        b: [
          { s: 14.87, e: 15.17, t: 'To NBCA', cls: 'drive' },
          { s: 15.17, e: 15.75, t: 'Gap: 3:10 → 3:45', cls: 'wait' },
          { s: 15.75, e: 16.05, t: 'Home w/ D + S', cls: 'drive' },
          { s: 17.25, e: 17.42, t: 'Drop Sebi at Zipp', sub: '7 min', cls: 'drive' },
          { s: 17.42, e: 17.75, t: 'Zipp → game', sub: '17 min if home', cls: 'drive' },
          { s: 19.25, e: 19.55, t: 'Home', cls: 'drive' },
        ],
      },
      {
        who: 'Chelsea',
        c: 'var(--chelsea)',
        b: [
          { s: 7.42, e: 8.1, t: 'Drop + home', cls: 'drive chelsea' },
          { s: 17.42, e: 19.25, t: 'Rides along to the game', cls: 'ghost' },
        ],
      },
      {
        who: 'Jona',
        c: 'var(--jona)',
        b: [{ s: 19, e: 19.25, t: 'Brings Sebastian home', cls: 'drive jona' }],
      },
    ],
    note: 'Same shape as the other days — home first, then out — except the soccer run does not come back for Sebi, because Jona handles that. <b>Two problems, both at the ends of the evening.</b> Going out: Zipp to Wildcat Field is 17 minutes, so a 5:25 drop puts you in the stands at 5:45 — late for the 5:30 kicks and impossible for Central Catholic at 5:00 on 9/24 or Sabinal on 9/10. Coming back: Jona delivers Sebi at 7:15 to a house nobody is in yet. Thursday is the one day the “someone is always home” rule breaks.',
  },
  {
    key: 'fri',
    name: 'Friday',
    tag: 'Varsity game day, no practice',
    drivers:
      'Drop <span class="pill p-cody">Cody</span> &nbsp; Pickup <span class="pill p-cody">Cody</span> &nbsp; Game: everyone, one car',
    rows: [
      {
        who: 'Cassius',
        c: 'var(--kid-c)',
        b: [
          { s: 7.75, e: 15.75, t: 'School', cls: 'school' },
          { s: 18.5, e: 20, t: 'Varsity game (7:00 kick)', cls: 'act' },
        ],
      },
      {
        who: 'Dorothy',
        c: 'var(--kid-d)',
        b: [{ s: 7.75, e: 15.75, t: 'School', cls: 'school' }],
      },
      {
        who: 'Sebastian',
        c: 'var(--kid-s)',
        b: [
          { s: 7.75, e: 15.17, t: 'School', cls: 'school' },
          { s: 15.17, e: 15.75, t: 'Waiting on campus', cls: 'wait' },
        ],
      },
      {
        who: 'Cody',
        c: 'var(--cody)',
        b: [
          { s: 7.42, e: 8.1, t: 'Drop + home', cls: 'drive' },
          { s: 14.87, e: 16.05, t: 'One trip, all three home', cls: 'drive' },
          { s: 18.17, e: 18.5, t: 'To the game, all five', cls: 'drive' },
        ],
      },
      {
        who: 'Chelsea',
        c: 'var(--chelsea)',
        b: [{ s: 18.17, e: 20, t: 'Rides along', cls: 'ghost' }],
      },
    ],
    note: 'No practice and no soccer. One trip collects all three at 3:45, everyone is home by 4:05, and the whole family drives to the game together around 6:10. Three round trips on one car — unless it is a road game, in which case see Section 05.',
  },
];

const LEGS = [
  { a: 'Home', b: 'NBCA campus', mi: '7.2 mi', min: 17, n: 'the long one, 4× most days' },
  { a: 'Home', b: 'Zipp', mi: '2.6 mi', min: 7, n: 'Tue / Thu soccer' },
  { a: 'Home', b: 'Weston', mi: '7.0 mi', min: 13, n: 'Mon / Wed AJAX' },
  { a: 'NBCA round trip', b: 'pickup or Cassius', mi: '14.4 mi', min: 33, n: 'the standard unit' },
  {
    a: 'Weston round trip',
    b: 'drop + stay + home',
    mi: '13.2 mi',
    min: 25,
    n: 'staying beats two trips',
  },
  { a: 'Zipp round trip', b: '×2, home in between', mi: '10.4 mi', min: 28, n: 'or 14 if you stay' },
  { a: 'Zipp', b: 'Wildcat Field', mi: '8.9 mi', min: 17, n: 'the Thursday hinge' },
  {
    a: 'Westside library',
    b: 'if you add it back',
    mi: '3.0 mi',
    min: 8,
    n: '8–10 min from everything',
  },
];

const WATCH = [
  {
    t: 'Someone is always home',
    p: 'Cody stays back Mon and Wed while Chelsea runs the loop; Chelsea is home Tuesday while Cody runs his. Dorothy has company on all three, and the parent at home is a live backstop if a loop runs late.',
    f: 'Agree on the text-me-by signal: 6:10 on Mon and Wed, when the margin is thinnest.',
  },
  {
    t: 'Take the car on road games',
    p: 'Nearly identical mileage each week — 129 miles to Chelsea’s 128 — but the truck burns $27.50 of gas to her $16.38. Over the nine road games the same trips cost $357 in the truck and $214 in the car.',
    f: 'Roughly $143 saved across the season for choosing the other keys on Friday nights.',
  },
  {
    t: 'Mon and Wed run on a one-minute margin',
    p: 'Cassius is off the field at 6:15, NBCA to Weston is 14 minutes, AJAX ends at 6:30. Tuesday’s loop has 29 minutes of slack; this one has almost none.',
    f: 'Warn Sebi’s coach that a late pickup is possible, and plan on 6:35.',
  },
  {
    t: 'The 3:10 to 3:45 gap',
    p: 'Sebi is out 35 minutes before Dorothy, every single day. Going home in between costs 33 minutes and gains nothing.',
    f: 'Wait on campus. It is the only reliably quiet half hour in the afternoon.',
  },
  {
    t: 'Four soccer evenings a week',
    p: 'AJAX Monday and Wednesday at Weston, NBYSA Tuesday and Thursday at Zipp — a 9-year-old training four nights running, plus weekend games once the league publishes.',
    f: 'Wednesday is the cheapest one to drop.',
  },
  {
    t: 'Sebi arrives home to an empty house',
    p: 'Jona drops him at 7:15. After a 5:30 home game you are back around 7:33, so he is alone 15 to 20 minutes. After an away game it is closer to two hours — a 6:30 kick at TMI puts you home near 9:00.',
    f: 'Chelsea has nothing on Thursday but the morning drop, so staying back costs the schedule nothing. Alternative: ask Jona to drop him at Wildcat Field instead, which works for 6:00 kicks but not 5:30.',
  },
  {
    t: 'Early JV kickoffs break Thursday',
    p: 'The 5:25 soccer drop puts you at a home game at 5:45. Central Catholic kicks at 5:00 on 9/24 and Sabinal is a two-hour drive for a 6:30 start on 9/10 — neither survives the drop.',
    f: 'On those two dates, split cars: one parent runs Sebi to Zipp, the other leaves early with Dorothy.',
  },
  {
    t: 'Friday 8/28, La Pryor',
    p: '129 miles each way. Leave at 4:15 for a 7:00 kick and you are home around 12:30 AM.',
    f: 'Find out whether 9th graders ride the team bus on long trips.',
  },
];

const QS = [
  {
    t: 'Does AJAX run past Aug 21?',
    p: 'Mike Abalos’ invitation covers academy training “over the next two weeks” — roughly Aug 10 to 21. Everything after that is unconfirmed.',
    f: 'Ask before you build Mondays and Wednesdays around it.',
  },
  {
    t: 'Is Cassius JV or varsity?',
    p: 'A 9th grader is JV by the program’s own philosophy, but freshmen can dress varsity. JV plays Thursdays, varsity Fridays.',
    f: 'If he does both, Thursday and Friday are game nights every week from 8/27.',
  },
  {
    t: 'Weekend soccer, still unpublished',
    p: 'NBYSA U11 games fall on Saturday or Sunday and the league has not released the schedule.',
    f: 'Saturday film and lift is 9:00–12:00 for Cassius on 8/22 and 8/29.',
  },
];

const AWAY = [
  ['8/21', 'Fri', 'Varsity', 'Hill Country Christian', 'Home', '—', '—'],
  ['8/26', 'Wed', 'MS', 'St Rose-Schulenberg', 'Away', '~78 mi', '~85 min'],
  ['8/27', 'Thu', 'JV', 'St Michael’s 9th', 'Home', '—', '—'],
  ['8/28', 'Fri', 'Varsity', 'La Pryor', 'Away', '129 mi', '145 min'],
  ['9/3', 'Thu', 'JV', 'San Antonio Christian', 'Home', '—', '—'],
  ['9/4', 'Fri', 'Varsity', 'San Antonio Christian', 'Away', '27 mi', '40 min'],
  ['9/10', 'Thu', 'JV', 'Sabinal', 'Away', '93 mi', '116 min'],
  ['9/11', 'Fri', 'Varsity', 'Sabinal (Senior Night)', 'Home', '—', '—'],
  ['9/24', 'Thu', 'JV', 'Central Catholic 9th', 'Away', '32 mi', '42 min'],
  ['9/25', 'Fri', 'Varsity', 'St Francis', 'Away', '168 mi', '188 min'],
  ['10/1', 'Thu', 'JV', 'TMI', 'Away', '38 mi', '51 min'],
  ['10/2', 'Fri', 'Varsity', 'Holy Cross', 'Home', '—', '—'],
  ['10/8', 'Thu', 'Varsity', 'JPII Corpus Christi', 'Away', '174 mi', '188 min'],
  ['10/14', 'Thu', 'JV', 'Holy Cross', 'Away', '36 mi', '49 min'],
  ['10/15', 'Thu', 'Varsity', 'Geneva', 'Home', '—', '—'],
  ['10/22', 'Thu', 'JV', 'JP2 Schertz', 'Home', '—', '—'],
  ['10/23', 'Fri', 'Varsity', 'Brazos Christian', 'Away', '136 mi', '162 min'],
  ['10/30', 'Fri', 'Varsity', 'Bay Area Christian (HOCO)', 'Home', '—', '—'],
];

const DATES = [
  [
    'Aug 12',
    'First day of school. Elementary families welcome in the gym at 8:00 for prayer. Handbook acknowledgement due today.',
    'All',
  ],
  ['Aug 14', 'Scrimmage vs TMI / Saint Mary’s Hall, 6:00 PM.', 'Cassius'],
  ['Aug 15', 'Wildcat Football family picnic at the river, 4:00–7:00 PM.', 'Family'],
  [
    'Aug 17',
    '7th & 8th grade student/parent meeting 5:30, then Meet the Wildcats 6:30 at Wildcat Stadium. Times were set so you can do both.',
    'Dorothy + Cassius',
  ],
  [
    'Aug 18',
    'First soccer practice, 5:30–7:00 at Zipp. Cleats, shin guards, size 4 ball.',
    'Sebastian',
  ],
  ['Aug 21', 'Deadline to order elementary field trip / field day shirt.', 'Sebastian'],
  ['Aug 21', 'First varsity home game, 7:00 vs Hill Country Christian.', 'Cassius'],
  ['Aug 24', '9th–11th grade student/parent meeting.', 'Cassius'],
  ['Aug 24–28', 'Fall MAP testing, all campuses.', 'All three'],
  ['Sep 3–4', 'Middle school retreat at T Bar M.', 'Dorothy'],
];

// Weekly drive budget. `d` is minutes behind the wheel, `mi` is miles.
const DAYCOL = {
  Mon: '#0C3B29',
  Tue: '#2E6F4E',
  Wed: '#4E8C6A',
  Thu: '#B4762A',
  Fri: '#8C5A1E',
};
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m}m`);

const BUDGET = [
  {
    who: 'Cody',
    mpg: 15,
    mi: { Mon: 14.4, Tue: 23.8, Wed: 14.4, Thu: 33.1, Fri: 43.2 },
    d: { Mon: 33, Tue: 47, Wed: 33, Thu: 73, Fri: 99 },
    detail: {
      Mon: 'AM drop 33',
      Tue: 'Zipp → NBCA → Zipp loop 47',
      Wed: 'AM drop 33',
      Thu: 'Pickup 33 + Zipp 7 + game 33',
      Fri: 'AM 33 + PM 33 + game 33',
    },
  },
  {
    who: 'Chelsea',
    mpg: 25,
    mi: { Mon: 42.4, Tue: 28.8, Wed: 42.4, Thu: 14.4, Fri: 0 },
    d: { Mon: 86, Tue: 66, Wed: 86, Thu: 33, Fri: 0 },
    detail: {
      Mon: 'Pickup 33 + Weston loop 53',
      Tue: 'AM drop 33 + pickup 33',
      Wed: 'Pickup 33 + Weston loop 53',
      Thu: 'AM drop 33',
      Fri: '—',
    },
  },
  {
    who: 'Jona',
    mpg: 0,
    mi: { Mon: 0, Tue: 0, Wed: 0, Thu: 2.6, Fri: 0 },
    d: { Mon: 0, Tue: 0, Wed: 0, Thu: 7, Fri: 0 },
    detail: { Mon: '—', Tue: '—', Wed: '—', Thu: 'Sebi home 7', Fri: '—' },
  },
];

// Round trips for the nine away games, worst haul first.
const ROAD = [
  ['10/8', 'Varsity', 'JPII Corpus Christi', '6h20', 348],
  ['9/25', 'Varsity', 'St Francis', '6h16', 336],
  ['10/23', 'Varsity', 'Brazos Christian', '5h24', 272],
  ['8/28', 'Varsity', 'La Pryor', '4h50', 258],
  ['9/10', 'JV', 'Sabinal', '3h55', 188],
  ['10/1', 'JV', 'TMI', '1h45', 78],
  ['10/14', 'JV', 'Holy Cross', '1h41', 74],
  ['9/24', 'JV', 'Central Catholic', '1h27', 66],
  ['9/4', 'Varsity', 'San Antonio Christian', '1h20', 54],
];

const GAS = 3.2;
const sum = (o) => Object.values(o).reduce((a, c) => a + c, 0);
const maxTot = Math.max(...BUDGET.map((b) => sum(b.d)));
const roadMiles = ROAD.reduce((a, r) => a + r[4], 0);

// Even hours only, same as the original axis.
const AXIS_HOURS = [];
for (let h = T0; h <= T1; h += 1) if (h % 2 === 0) AXIS_HOURS.push(h);

const DayPanel = ({ day, hidden }) => (
  <div className="panel" hidden={hidden}>
    <div className="dayhead">
      <h3>
        {day.name} — {day.tag}
      </h3>
      <div className="driverline" dangerouslySetInnerHTML={{ __html: day.drivers }} />
    </div>
    <div className="tl">
      <div className="tlinner">
        <div className="axis">
          {AXIS_HOURS.map((h) => (
            <span key={h} style={{ left: `${pct(h)}%` }}>
              {fmt(h)}
            </span>
          ))}
        </div>
        {day.rows.map((r) => (
          <div className="row" key={r.who}>
            <div className="rowlbl">
              <i style={{ background: r.c }} />
              {r.who}
            </div>
            <div className="track">
              {r.b.map((x, i) => {
                const w = pct(x.e) - pct(x.s);
                return (
                  <div
                    key={i}
                    className={`blk ${x.cls}`}
                    style={{ left: `${pct(x.s)}%`, width: `${w}%` }}
                    title={`${x.t} · ${fmt(x.s)}–${fmt(x.e)}`}
                  >
                    {w > 7 ? x.t : ''}
                    {x.sub && w > 13 ? <small>{x.sub}</small> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="note" dangerouslySetInnerHTML={{ __html: day.note }} />
  </div>
);

const FallPlanView = () => {
  const [active, setActive] = useState(0);

  return (
    <div className="fallplan">
      <header>
        <div className="mast">
          <div>
            <h1>
              Fall 2026
              <br />
              Family Call Sheet
            </h1>
            <div className="sub">School year begins Wed Aug 12 · New Braunfels, TX</div>
          </div>
          <div className="basebox">
            <div className="lbl">Home base</div>
            <div className="val">1933 Kalli Jo Lane</div>
            <div className="lbl" style={{ marginTop: 8 }}>
              One campus, three kids
            </div>
            <div className="val">NBCA · 220 FM 1863</div>
          </div>
        </div>
      </header>

      <div className="wrap">
        {/* ---- 01 the week ---- */}
        <section>
          <div className="eyebrow">Section 01 — The week</div>
          <h2>Who drives what</h2>
          <div className="tabs" role="tablist">
            {DAYS.map((d, i) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                className="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
              >
                {d.name}
              </button>
            ))}
          </div>
          <div>
            {DAYS.map((d, i) => (
              <DayPanel key={d.key} day={d} hidden={active !== i} />
            ))}
          </div>
        </section>

        {/* ---- 02 distances ---- */}
        <section>
          <div className="eyebrow">Section 02 — Distances</div>
          <h2>The afternoon triangle</h2>
          <div className="legs">
            {LEGS.map((l) => (
              <div className="leg" key={`${l.a}-${l.b}`}>
                <div>
                  <div className="r">
                    {l.a} → {l.b}
                  </div>
                  <div className="m">
                    {l.mi} · {l.n}
                  </div>
                </div>
                <div className="t">
                  {l.min}
                  <em> min</em>
                </div>
              </div>
            ))}
          </div>
          <div className="note">
            Free-flow driving times, door to door. Add <b>5–8 minutes</b> to anything touching the
            NBCA driveline at 7:45 AM or dismissal, and to Zipp or Weston at 5:30 PM when every team
            arrives at once. The Westside library is the pivot point of the whole afternoon — it is
            the only stop within 10 minutes of campus, both fields and home.
          </div>
        </section>

        {/* ---- 03 drive budget ---- */}
        <section>
          <div className="eyebrow">Section 03 — Time in the car</div>
          <h2>Drive budget</h2>

          <div className="bars">
            {BUDGET.map((b) => {
              const tot = sum(b.d);
              const mi = sum(b.mi);
              const cost = b.mpg ? (mi / b.mpg) * GAS : 0;
              return (
                <div className="barrow" key={b.who}>
                  <div className="nm">{b.who}</div>
                  <div className="bartrack">
                    {DAY_KEYS.filter((k) => b.d[k] > 0).map((k) => (
                      <div
                        key={k}
                        className="barseg"
                        style={{ flex: `0 0 ${(b.d[k] / maxTot) * 100}%`, background: DAYCOL[k] }}
                        title={`${k}: ${b.d[k]} min`}
                      >
                        {b.d[k] >= 40 ? (
                          <span>
                            {k} {b.d[k]}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="tot">{hm(tot)}</div>
                  <div className="mi">
                    {mi.toFixed(0)}
                    <em> mi</em>
                  </div>
                  <div className="cost">{b.mpg ? `$${cost.toFixed(2)}` : '—'}</div>
                </div>
              );
            })}
            <div className="barkey">
              {DAY_KEYS.map((k) => (
                <span key={k}>
                  <i style={{ background: DAYCOL[k] }} />
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="scroller" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  {DAY_KEYS.map((k) => (
                    <th key={k}>{k}</th>
                  ))}
                  <th>Week</th>
                  <th>Miles</th>
                  <th>Fuel</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET.map((b) => {
                  const mi = sum(b.mi);
                  return (
                    <tr key={b.who}>
                      <td>
                        <b>{b.who}</b>
                      </td>
                      {DAY_KEYS.map((k) => (
                        <td className="num" key={k}>
                          {b.d[k] ? `${b.d[k]} min` : '—'}
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: '#77817A',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              whiteSpace: 'normal',
                            }}
                          >
                            {b.detail[k]}
                          </div>
                        </td>
                      ))}
                      <td className="num" style={{ fontWeight: 600, color: 'var(--field)' }}>
                        {hm(sum(b.d))}
                      </td>
                      <td className="num">
                        {mi.toFixed(1)} mi
                        <div
                          style={{
                            fontSize: '10.5px',
                            color: '#77817A',
                            fontFamily: "'IBM Plex Sans', sans-serif",
                          }}
                        >
                          {b.mpg ? `${b.mpg} mpg` : '—'}
                        </div>
                      </td>
                      <td className="num" style={{ fontWeight: 600 }}>
                        {b.mpg ? `$${((mi / b.mpg) * GAS).toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td>
                    <b>Household</b>
                  </td>
                  <td className="num">119 min</td>
                  <td className="num">113 min</td>
                  <td className="num">119 min</td>
                  <td className="num">113 min</td>
                  <td className="num">99 min</td>
                  <td className="num" style={{ fontWeight: 600, color: 'var(--field)' }}>
                    9h23
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    256.9 mi
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    $43.88
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="note">
            Baseline week: every football game at home, AJAX running Mon and Wed, nobody stuck in the
            driveline. Assignments locked: Chelsea runs the full Weston loop Mon and Wed; Cody runs
            the full Zipp loop Tuesday and owns Thursday and Friday. Chaining each loop rather than
            making two round trips saves about 10 minutes a day. <b>Wait time is not counted:</b>{' '}
            whoever does pickup also sits 35 minutes on campus between the dismissals, and the Weston
            runs include an hour at the field. Fuel assumes the truck at 15 mpg, Chelsea’s car at 25
            mpg, and gas at $3.20.
          </div>
          <div className="note warn">
            <b>Road games are the real variable.</b> Nine away games add <b>28h33</b> and about{' '}
            <b>1,674 miles</b> on top of the baseline, almost all of it Cody’s. St Francis and Corpus
            Christi are over six hours in the car apiece.
          </div>

          <div className="scroller" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Opponent</th>
                  <th>Round trip</th>
                  <th>Miles</th>
                  <th>Fuel, truck</th>
                  <th>Fuel, car</th>
                </tr>
              </thead>
              <tbody>
                {ROAD.map((r) => (
                  <tr key={`${r[0]}-${r[2]}`}>
                    <td className="num">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td className="num">{r[3]}</td>
                    <td className={`num ${r[4] >= 250 ? 'haul-3' : r[4] >= 150 ? 'haul-2' : ''}`}>
                      {r[4]} mi
                    </td>
                    <td className="num">${((r[4] / 15) * GAS).toFixed(2)}</td>
                    <td className="num" style={{ color: 'var(--field)' }}>
                      ${((r[4] / 25) * GAS).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4}>
                    <b>All nine road games</b>
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {roadMiles} mi
                  </td>
                  <td className="num haul-3" style={{ fontWeight: 600 }}>
                    ${((roadMiles / 15) * GAS).toFixed(2)}
                  </td>
                  <td className="num" style={{ fontWeight: 600, color: 'var(--field)' }}>
                    ${((roadMiles / 25) * GAS).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="season">
            <div className="hd">
              Aug 12 → Nov 13 · 14 weeks · baseline pattern plus nine road games
            </div>
            <div className="bignums">
              <div className="bignum">
                <div className="v">
                  160<em>hrs</em>
                </div>
                <div className="k">In the car</div>
              </div>
              <div className="bignum">
                <div className="v">
                  5,132<em>mi</em>
                </div>
                <div className="k">Driven</div>
              </div>
              <div className="bignum">
                <div className="v">$942</div>
                <div className="k">Gas at $3.20</div>
              </div>
            </div>
            <div className="seasplit">
              <div>
                <b>Cody · truck</b>95h03 · 3,341 mi · $712.64
                <br />
                <span style={{ opacity: 0.7 }}>Baseline 1,805 mi + all nine road games</span>
              </div>
              <div>
                <b>Chelsea · car</b>63h14 · 1,792 mi · $229.38
                <br />
                <span style={{ opacity: 0.7 }}>Mon and Wed loops, Tue campus runs</span>
              </div>
              <div>
                <b>Road games alone</b>28h33 · 1,536 extra mi · $327.66
                <br />
                <span style={{ opacity: 0.7 }}>$196.60 if you take the car instead</span>
              </div>
            </div>
            <div className="seasnote">
              <b>What this does not include:</b> weekend NBYSA games, which the league has not
              published — a dozen Saturday or Sunday fixtures would add roughly 200 to 400 miles and
              $30 to $60. It also assumes AJAX runs all 14 weeks; if it stops on Aug 21 as the
              invitation implies, drop about <b>$95 and 640 miles</b> from Chelsea’s column. Playoff
              weeks in November are counted as normal practice weeks.
            </div>
          </div>
        </section>

        {/* ---- 04 watch list ---- */}
        <section>
          <div className="eyebrow">Section 04 — Friction points</div>
          <h2>Watch list</h2>
          <div className="cards">
            {WATCH.map((w) => (
              <div className="card" key={w.t}>
                <h4>{w.t}</h4>
                <p>{w.p}</p>
                <div className="fix">
                  <b>Move</b>
                  {w.f}
                </div>
              </div>
            ))}
            {QS.map((w) => (
              <div className="card q" key={w.t}>
                <h4>{w.t}</h4>
                <p>{w.p}</p>
                <div className="fix">
                  <b>Open</b>
                  {w.f}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 05 road games ---- */}
        <section>
          <div className="eyebrow">Section 05 — Road games</div>
          <h2>Away hauls, one way</h2>
          <div className="scroller">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Level</th>
                  <th>Opponent</th>
                  <th>Where</th>
                  <th>Distance</th>
                  <th>One way</th>
                </tr>
              </thead>
              <tbody>
                {AWAY.map((r) => {
                  const m = parseInt(r[6], 10) || 0;
                  const cls = m >= 150 ? 'haul-3' : m >= 100 ? 'haul-2' : '';
                  return (
                    <tr key={`${r[0]}-${r[2]}-${r[3]}`}>
                      <td className="num">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                      <td>{r[4]}</td>
                      <td className="num">{r[5]}</td>
                      <td className={`num ${cls}`}>{r[6]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="note warn">
            <b>Three trips are the whole evening.</b> La Pryor (8/28), Brazos Christian (10/23) and
            Bay Area Christian (10/30, if travel is required) all put you home after midnight on a
            school night&rsquo;s eve. Decide early whether Cassius rides the team bus and whether the
            younger two come.
          </div>
        </section>

        {/* ---- 06 calendar ---- */}
        <section>
          <div className="eyebrow">Section 06 — Calendar</div>
          <h2>Next four weeks</h2>
          <ul className="dates">
            {DATES.map((d, i) => (
              <li key={`${d[0]}-${i}`}>
                <span className="d">{d[0]}</span>
                <span>{d[1]}</span>
                <span className="who">{d[2]}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="sheetfoot">
          Built from the NBCA campus newsletter, the 2026 Wildcat Football parents packet, and Coach
          Alorda&rsquo;s NBYSA U11 email. Drive times computed door to door via OpenStreetMap
          routing, August 2026.
        </div>
      </div>
    </div>
  );
};

export default FallPlanView;
