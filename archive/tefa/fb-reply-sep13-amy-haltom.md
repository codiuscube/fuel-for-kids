# FB reply — Amy Haltom, "where does Cody think it's going at this point?" (Sep 13)

*Comment reply in Cody's own Jul thread (the one with the cascade chart). Cody's voice.
Plain text on purpose — Facebook won't render markdown.*

---

Amy — here's my read as of today.

Where the line is: the Aug 27 round was officially "over 4,500" and Friday's round looks
like roughly 3,800. On the original waitlist numbering that puts the frontier somewhere
around 54,000, so the whole 30–50k band has now been offered and we're into the 50s.

What's left to move it: only awards that are still sitting unconfirmed. Every round has a
four-week clock, and nothing frees up until a clock runs out. So the next two dates fall
straight out of the calendar:

- Sept 24–25: the Aug 27 awards' windows close. That's ~4,500 awards. The last cohort
  lapsed at close to half, and each lapsed award funds a bit more than one new seat, so
  I'd expect roughly 2,000–3,000 new awards, call it 2,500.
- Around Oct 9–10: Friday's ~3,800 awards' windows close. Same math, smaller pool —
  roughly 1,700–2,500, call it 2,000.

After that each round is fed by the round before it, so they keep shrinking: maybe
1,000–1,500 in late October, a few hundred by November. Adding it up, I'd put the end of
the line somewhere around 60,000 on the original numbering, give or take a couple
thousand. If you're inside ~57k you're in good shape for the 24th; inside ~59k, I'd
watch October.

One wildcard that helps: anyone confirming after Sept 15 gets 75% of this year, and the
Comptroller only has to fund 75% per new seat too. If they size the rounds on that, the
same money goes about a third further and the October numbers come in on the high end.

(All my own math from public Comptroller releases plus what people report here — the
3,800 isn't official yet. Final calls are the Comptroller's, not mine. Happy to share
sources.)

---

## Notes

- ~330 words. Answers "where is it going" with three things: where the frontier is now,
  the next two dates with sizes, and a terminal estimate. Bands given as "inside ~57k /
  ~59k" so people can place themselves without a rank.
- **Sep 11 count (~3,800) is Cody's word from the group, not official.** The Aug 28
  release is the only official count of a post-expiry batch ("over 4,500"). Swap in the
  official number when it posts and rescale the Oct estimate proportionally.
- **Do not confuse with the June "nearly 3,800"** — that was the May 29 batch
  (3,317 opt-out/downgrade + 294 SPED). A search for "3,800 TEFA" returns it first.

## The model (Sep 13)

Inputs, all from the archive planner (`legacy-frontend/IddingsPlanner.jsx`) or official
releases already logged there:

| Item | Value | Source |
|---|---|---|
| Awarded Aug 10 | 118,441 | Aug 10 fact sheet |
| Funded Aug 13 | 101,600 | Aug 13 release |
| Pending Aug 13 | ~16,841 | derived |
| Batch 1, Aug 27 | "over 4,500" | Aug 28 release (official) |
| Active / funded, Aug 28 | "over 118,000" / "more than 109,000" | Aug 28 release |
| Batch 2, Sep 11 | ~3,800 | community (Cody) |
| Seats per full-award lapse | 1.364 | $10,474 / $7,678 blended |
| Frontier Aug 11 → Aug 27 → Sep 11 | 46,000 → 50,500 → ~54,300 | planner + batch 2 |

Measured late-cohort lapse rate. Of the ~16,841 pending on Aug 13 (mostly the Aug 10/11
Tier 3 cohort): active awards fell ~4,900 by Aug 28 (118,441 + 4,500 − ~118,000), and
batch 2's ~3,800 seats need ~2,800 more lapses. Total ≈ 7,700 lapsed of 16,841 ≈ **45%**.
Funded rose 101,600 → 109,000+ over the same span, i.e. the other ~55% confirmed. Cody's
Aug 11 "up to 50% decline" call was about right.

Seats produced per pending award: (4,500 + 3,800 − 1,280 revoked one-off) / 16,841 ≈
**0.42**, or ≈ 0.49 including the revoked money.

Forward:

| Round | Fuel | Window closes | Low | Central | High |
|---|---|---|---|---|---|
| 3 | Aug 27 cohort, ~4,500 | Sep 24 (Thu) → cut Sep 24–25 | 1,900 | 2,500 | 3,000 |
| 4 | Sep 11 cohort, ~3,800 | Oct 9 (Fri) → cut Oct 9–13 | 1,600 | 2,000 | 2,500 |
| 5 | Sep 24 cohort, ~2,500 | ~Oct 22 | 1,000 | 1,300 | 1,700 |
| 6+ | shrinking | Nov onward | — | few hundred each | — |

- Low = 0.42 seats per pending award (measured, ex-revoked). High = 55–60% lapse on a
  deeper, later cohort × 1.364. Central splits them.
- Geometric decay ratio ≈ 0.5–0.65 per round. Sum of remaining rounds from ~2,500 at
  r≈0.58 ≈ 6,000 → terminal frontier ≈ 54,300 + 6,000 ≈ **~60,000** (range ~58k–62k).
  Matches the Aug 11 post's "ceiling around 60k."
- Frontier by date (central): Sep 25 ≈ 56,800; Oct 10 ≈ 58,800; end Oct ≈ 60,000.

Upside factor, not in the central: after Sep 15 a new private award costs 75%
($7,855), so blended seat cost drops to ~$5,923 and seats per full lapse rises to ~1.77.
If the Comptroller sizes rounds on prorated cost, rounds 3+ run ~30% above the table.
Also small: confirmed-at-75% families each leave $2,618 in the program.

Downside factors: the Aug 27 cohort had Sep 15 as a hard 100% date and a text nudge, so
fence-sitters may have confirmed at a higher rate than the Aug 10 cohort; the Comptroller
may skip a beat and fold round 3 into a later, larger cut.

## Fact check log

- ✅ **"over 4,500" Aug 27** — Aug 28 official post/release, logged in planner.
- ✅ **"over 118,000 active / more than 109,000 funded"** — Aug 28 release
  ("Over 4,500 Additional TEFA Awards Issued to Tier 3 Students"), via search snippet;
  page itself not fetchable from this session.
- ⚠️ **~3,800 Sep 11** — unofficial. Replace when posted.
- ✅ **Four-week window** — Aug 13 release, verbatim.
- ✅ **Sep 15 = 100%, after = 75%, after Jan 15 = 50%** — Jun 4 Comptroller timeline /
  Odyssey timeline article; Aug 28 release repeats Sep 15 for that cycle.
- ✅ **Sep 24 is a Thursday; Oct 9 is a Friday** — calendar.
- ⚠️ **Frontier numbers are inference** — Odyssey reports gaps, not ranks. Fact-sheet
  cross-check put Aug 10 frontier at ~45,300 vs model 46,000.
