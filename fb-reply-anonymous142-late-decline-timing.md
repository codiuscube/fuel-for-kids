# FB reply to Anonymous participant 142 (when does 35% kick in / share of late vs. early attrition)

**Their challenge:** "How are you determining when the late-decline rate suddenly jumps to 35%? A lot of funds are already being released back now through regular attrition, incomplete enrollment, school placement issues, appeals resolving, etc. Those dollars would recycle well before the 'locked into public school/private deposit' stage you're describing. So what percentage of your modeled attrition are you actually treating as late replacement decline specifically?"

## Draft reply

Anonymous participant 142 — you're right, and I owe you a clearer answer. 35% isn't a switch that flips on a date. It's a flat per-replacement-offer estimate I apply across the whole recursive cascade, not a late-summer rule layered on top of the early stuff.

The decomposition you're asking about:

**Early attrition (first-wave declines on originally awarded families):** 15% on the ~44,753 T1-family awardees, 18% on the ~51,181 T2 awardees deciding by July 15. Roughly 14,400-17,300 declines — and you're right that a meaningful slice are happening *now*: appeals resolving, incomplete enrollment, school placement issues, families who never planned to use the award. Those dollars recycle fast.

**Late replacement-offer decline (per-offer, recursive):** Once those recycled dollars trigger a replacement offer, I apply 35% to every subsequent offer down the queue. ~65% accept (cascade stops there), ~35% decline (dollars roll to the next family, 35% applies again). At a 15% blended assumption the cascade generates ~16,929 total replacement offers; at 25% it generates ~31,977 — that's where the backlog reach comes from, not from extra dollars.

To your direct question: the early bucket is roughly 14-17k of one-and-done declines recycling in May-July; the 35% rate determines how deep the recycled dollars actually reach by late summer.

Why 35% specifically: it sits inside the historical band for comparable programs — Milwaukee Parental Choice 30% (ERIC ED472999), Virginia Pre-K Initiative 20-34%, NYC Voucher Yr 3 38% — and TEFA's calendar (July 15 family deadline, July 31 school verification, August ISD start, already-paid July deposits) layers on friction those programs didn't measure. May/June replacement offers probably decline below 35%, late-July/August above; 35% is the flat blended anchor because per-offer timing isn't observable yet.

Sensitivity: if realized late-decline lands at 25%, the queue clears more shallowly than my model suggests; at 40%+, it pushes deeper. 35% is a planning anchor, not an observation — Odyssey hasn't published per-wave decline data yet. Happy to revise when they do.

---

## Notes

- ~330 words.
- Concedes Anonymous 142's accurate observation directly in the opener: 35% is not a date-triggered jump.
- Decomposes early vs. late explicitly with numbers from the model:
  - Early attrition: 15%/18% × ~44,753 + ~51,181 = ~14,400-17,300 first-wave declines (recycling now through July 15).
  - Late replacement-offer decline: 35% per offer, recursive — generates ~16,929 total offers at 15% blended attrition, ~31,977 at 25%.
- Anchors 35% in the same historical band cited in the 865 sub-thread (Milwaukee 30% / Virginia Pre-K 20-34% / NYC Voucher Yr 3 38%) — restated in full because Anonymous 142 is in a different sub-thread and hasn't seen them.
- Concedes the rising-rate structure: May/June below 35%, late-July/August above; 35% is the blended flat anchor because per-offer timing isn't observable.
- Closes with sensitivity (25% → shallower clearance, 40%+ → deeper) and acknowledges 35% is a planning anchor, not an observation.

## Source map

- 15% T1-family / 18% T2 first-wave decline rates: `tefa-family-gem.md:319-320`.
- ~44,753 T1-family + 51,181 T2 originally awarded counts: `tefa-family-gem.md:326`.
- 35% per-replacement-offer decline anchored to historical band + TEFA calendar friction: `tefa-family-gem.md:331-334`.
- Recursive cascade volumes (8% → ~8,341, 15% → ~16,929, 25% → ~31,977 total replacement offers): `tefa-family-gem.md:264-266`.
- 20,383 unfunded T2 ahead of T3: `tefa-family-gem.md:260`.
- Milwaukee Parental Choice 30% (ERIC ED472999), Virginia Pre-K 20-34%, NYC Voucher Yr 3 38%: matches `fb-reply-anonymous865-window.md:15` for cross-thread consistency.
- Calendar friction stack (July 15 / July 31 / August / July deposits / locked public seats): `tefa-family-gem.md:334`.

## Fact check log

- ✅ **15% T1-family / 18% T2 first-wave decline** — matches gem line 319-320 and prior 865 reply line 46.
- ✅ **~44,753 T1-family + 51,181 T2 first-wave count** — gem line 326. Multiplies to ~14,400-17,300 declines (44,753 × 0.15 = ~6,713; 51,181 × 0.18 = ~9,213; sum ~15,926 — within the 14,400-17,300 band stated as a range to cover sensitivity).
- ✅ **~16,929 / ~31,977 recursive offer counts** — gem lines 265-266.
- ✅ **Milwaukee 30% (ERIC ED472999) / Virginia Pre-K 20-34% / NYC Voucher Yr 3 38%** — gem line 333; matches 865 reply citation exactly.
- ✅ **July 15 family deadline / July 31 school verification / August school start / already-paid July deposits** — gem line 334; matches 865 reply Round 1.
- ⚠️ **"~14,400-17,300 declines" range** — math: low end at 15% on 95,934 ≈ 14,390; high end at 18% on 95,934 ≈ 17,268. Range stated rather than point estimate to acknowledge the T1/T2 split has different rates.
- ✅ **No new claims introduced** — every number in the draft traces to either `tefa-family-gem.md` or the prior posted 865 reply.
