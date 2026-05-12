# FB reply to Anonymous participant 865 (acceptance window / late-decline rate)

You're raising a fair point — the acceptance window length is a genuine unknown and it does shape queue depth. But I'd push back on the direction of the effect: a tighter window almost certainly pushes the decline rate **up**, not down, given where we are in the calendar.

Here's why:

- **Schools must confirm enrollment by July 31** for the August funding track (per the Comptroller timeline), which leaves Odyssey very little room to run a slow recycle.
- **Many Texas ISDs start in early-to-mid August** — families holding a public school seat will be days from their child's first day when a late offer lands.
- **Private schools are already collecting July tuition deposits.** A family that's written a non-refundable check isn't unwinding that on 48 hours' notice.

So if Odyssey runs a 24–72 hour window, I'd expect decline rates **above 35%**, not below — Milwaukee's 30% (ERIC ED472999) and Virginia Pre-K's 20–34% both came from less time-compressed environments. A 7–14 day window slows the cascade per your point, but it also runs straight into the July 31 verification wall, so I don't think Odyssey has the operational room to offer it.

The honest answer is we won't know until they publish the window. But the calendar pressure cuts toward higher attrition on late offers, not lower — which if anything makes the 35% assumption conservative rather than aggressive.

Two-part summary on where 35% comes from: it sits inside the historical band (Milwaukee 30%, Virginia Pre-K 20–34%, NYC Voucher Yr 3 38%), and TEFA's specific calendar — July 15 family decision, July 31 school verification, August school start — adds friction those programs didn't measure. That's the case for 35%, and the case for why a tighter Odyssey window would likely push it higher.

---

## Notes

- ~230 words — sized for a FB thread comment.
- Concedes the commenter's valid point (window length is unknown) but argues direction.
- Three concrete calendar pressure points: July 31 school verification deadline, ISD August start dates, July tuition deposits already paid.
- Source-anchored: Milwaukee 30% (ERIC ED472999), Virginia Pre-K 20–34% — matches IddingsPlanner attrition table at `src/components/IddingsPlanner.jsx:1973–1989`.
- Original FB post cited Virginia at 25–34%; corrected here to 20–34% to match internal sources.

## Fact check log

- ✅ **July 15 family deadline** — May 4 Comptroller release: "By July 15, families who receive TEFA awards must take one of the following actions: confirm enrollment in a participating private school, selecting homeschool or other (which provides $2,000 in funding), or opt out of the program."
- ✅ **July 31 school verification** — `tefa-faqs.md:419`: "August funding track: schools confirm enrollment for August-funded students."
- ✅ **Milwaukee 30% (ERIC ED472999)** — confirmed in `tefa-family-gem.md:144` and IddingsPlanner attrition table.
- ⚠️ **Virginia Pre-K 20–34%** — internal docs use 20–34%; original FB post used 25–34%. Reply uses the 20–34% canonical range.
- ✅ **D.C. Opportunity Scholarship 14.3%** — Hoover Institution, confirmed.
- ⚠️ **ISD August start dates** — softened from "first week of August" to "early-to-mid August" since most Texas ISDs start Aug 10–20; some start earlier. Avoids overclaim.

---

## Round 2: response to Anonymous 865's follow-up (what subset does 35% apply to?)

**Their challenge:** "I still do not understand what exact base figure the '35% late replacement decline' is being applied to... if 15–18% attrition is already being modeled globally, what specific subset of seats is then assumed to experience the additional 35% late-offer decline?"

### Draft reply

Yeah fair question, I should've been clearer. The 35% isn't stacked on top of the 15-18% — they apply to different things.

The 15% / 18% is the decline rate on the originally awarded families (~42,642 T1, ~51,181 T2) — the ones deciding by July 15 whether to opt in at all. When some decline, their dollars roll to the next family on the waitlist. That replacement offer is where 35% applies, and the same rate applies to each subsequent replacement offer — ~65% accept and stop, ~35% pass it down the line.

You're right that 35% as a single number papers over what's almost certainly a rising rate over time — May/June replacement offers are probably easier to accept than late July/August ones because families haven't committed yet. I don't have the granularity to model that more precisely, so I use it as a flat estimate.

Why 35% specifically? It sits inside the historical band (Milwaukee 30%, Virginia Pre-K 20–34%, NYC Voucher Yr 3 38%), and TEFA's specific calendar — July 15 family decision, July 31 school verification, August school start — adds friction those programs didn't measure. That's also why I'd argue a tighter Odyssey window pushes it higher, not lower.

On the no-reset point — you're right, Odyssey doesn't procedurally reset anything. The friction isn't structural, it's the families themselves. Each later replacement offer has fewer families able to say yes because they've already locked in elsewhere.

So I believe 35% to be a defensible anchor for replacement-offer decline, not a forecast. Window length, recycle speed, late-share of attrition — all genuinely unknown.

The post and estimates give direction to parents in tough spots trying to make tough decisions, not to be taken as a forecast or guarantee.

### Notes

- ~290 words.
- Core concession: 35% is an anchor, not a precise forecast. Engages the commenter's sharper challenge honestly.
- Core clarification: 15–18% applies to originally awarded families, 35% applies to replacement offers from the waitlist. Per `tefa-family-gem.md:317–324` personal-default model.
- Two-part "why 35% specifically" paragraph: historical band (Milwaukee/VA/NYC) + TEFA-specific calendar friction. Weaves back to the Round 1 window argument.
- Concedes "no reset" framing: Odyssey doesn't procedurally reset; the friction is the families themselves locking in elsewhere.
- Avoids "wave" jargon — uses natural language ("originally awarded families" vs "replacement offers").
- Conversational tone matched to Cody's voice rather than AI-house-style.
