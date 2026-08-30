# FB reply — "Is there an update when they will release more funds?" (Aug 26 thread)

*Reply to Morgan Blackwell's thread, where Katy (1,001–2,000), Sarah (2–3k) and Jayne
(1–1,000) all report their band hasn't moved since ~Aug 12. Cody's voice. Plain text on
purpose — Facebook won't render markdown.*

---

Short answer: yes, there are estimated dates, and they're not really about "releasing funds"
— they're about the four-week clock on awards already issued.

The mechanic is in the Aug 13 press release: once a student gets an award, the parents have
four weeks to opt in and confirm enrollment. Nothing frees up until a window closes. So the
dates fall out of when the last two batches went out:

- The Jul 29 batch — window closed around Aug 26. That's today, so a small pocket should be
  shaking loose right now.
- The Aug 10/11 batch (the ~15,000 Tier 3 awards) — window closes around Sep 7.

Sep 7 is the real one. Brittany's instinct about a bigger chunk in early September looks right
on timing to me.

The reason nobody's band has moved since Aug 12 is exactly this: those 15,000 awards are
sitting on the money until their windows expire. It's not that the program went quiet, it's
that the clock hasn't run out yet.

On size, and this is the part I'd temper expectations on. The Aug 13 release put funded at
101,600 against 118,441 awarded on the Aug 10 fact sheet. That leaves about 16,800 unresolved
awards — that's the entire pool that can free anything, and 86% of awards issued have already
converted to funded. Families are claiming these at a high rate. If 15% of that pool lets the
window lapse, a lapsed award frees the full $10,474 against a blended ~$7,678 seat, so it
moves the line roughly 3,400 spots. A pessimistic 8% is ~1,800; Milwaukee-level 30% is ~6,900.

So for Jayne at 1–1,000 ahead and Katy at 1,001–2,000 — you're inside even the pessimistic
case. Sarah at 2–3k is inside the middle case. I'd feel genuinely good about early September
for all three of you.

One thing worth knowing: the number Odyssey gives you is how many families are ahead of you,
not your rank, and the buckets are 1,000 wide. The line can move several hundred spots and
your bucket won't change. So "no movement" between two support tickets isn't proof of nothing
happening.

Usual caveat — this is my own math off the public Comptroller releases, not an official
projection, and nobody outside the program has published a cascade depth. Happy to share
sources, and I'll correct anything that turns out to be off.

---

## Notes

- ~380 words. Longer than a one-liner because the thread has three people asking the same
  thing with different numbers — this answers all of them in one comment.
- **Framing decision:** the Aug 11 post said "this will be my last update on the waitlist."
  This is written as a *comment reply* in someone else's thread, not a new post, which keeps
  that consistent. If you'd rather not re-enter the forecasting business at all, the first
  three paragraphs alone (dates + why nothing moved) answer the question without the
  projection.
- Leads with the mechanic, not the model — the question is "when", and the honest answer is
  "when the four-week windows close," which needs no forecast.
- Names the three commenters' specific bands, since all three are inside the modeled wave.
- The "gaps not ranks, buckets are 1,000 wide" point is the single most useful correction in
  the thread — everyone is reading a static bucket as a stalled line.

## Fact check log

- ✅ **Four-week opt-in window** — Aug 13 press release, verbatim: "Once a student receives an
  award, their parents have four weeks to opt in to the program and confirm their child's
  enrollment… before a child can receive funding in their account and count as a participant."
  (`100000 students - aug13.txt`)
- ✅ **101,600 funded / 118,441 awarded** — Aug 13 release (funded) and Aug 10 fact sheet
  (awarded). `IddingsPlanner.jsx:218,272`. Pending = 16,841 (`PENDING_NOW`).
- ✅ **85.8% conversion** — `CONVERSION_TO_DATE`, `IddingsPlanner.jsx:326`. Rounded to 86%.
- ✅ **~15,000 Tier 3 awards on Aug 11** — Comptroller news update, cited in
  `facebook-post-aug11-odyssey-band.md`.
- ✅ **Window close dates** — Jul 29 + 4wk = Aug 26; Aug 10 + 4wk = Sep 7. Matches
  `IddingsPlanner.jsx:436` ("Jul 29's ~Aug 26 and Aug 10's ~Sep 7").
- ✅ **$10,474 freed / $7,678 blended → 1.364 seats per lapse** — `SEATS_PER_LAPSE`,
  `IddingsPlanner.jsx:474-476`.
- ✅ **Wave sizes** — 16,841 × rate × 1.364, using `LAPSE_RATE` {8% / 15% / 30%}
  (`IddingsPlanner.jsx:468-472`): 1,838 / 3,446 / 6,891. Rounded to 1,800 / 3,400 / 6,900.
- ✅ **Benchmark attributions** — 15% ≈ D.C. Opportunity Scholarship 14.3% (Hoover); 30% =
  Milwaukee Parental Choice (ERIC ED472999). Only Milwaukee is named in the reply.
- ✅ **Odyssey reports gaps, not ranks** — `IddingsPlanner.jsx:140` and the Aug 11 post's
  "honest caveat" section.
- ⚠️ **"today" = Aug 26** — if this is posted on a later date, change "That's today" to "that
  window has now closed."
- ⚠️ **Seat estimates are offer depth, not funded seats.** Kept vague in the reply ("moves the
  line roughly 3,400 spots") on purpose; don't sharpen it into a funded-seat promise.
