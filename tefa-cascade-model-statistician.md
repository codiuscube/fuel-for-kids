# TEFA Waitlist-Cascade Model — Estimates, Predictions & Rationale

*Prepared for statistical review. Date of analysis: 2026-06-28. All figures are for the Texas Education Freedom Act (TEFA / SB 2), Year 1 (2026–27).*

---

## 1. The question being modeled

TEFA awards education savings accounts down a **single, tier-ordered waitlist**. Our family sits at **global waitlist positions ~45,000–50,000** (Tier 3). Tier 3 funding only happens if awards **cascade down** the list as already-awarded families leave. The model estimates **how far down the list the cascade reaches by end-of-summer**, under three attrition scenarios, to answer a binary decision: *plan on a voucher this year, or not?*

The single metric is the **cascade frontier**: the deepest global waitlist position that has been funded. Tier 3 begins at position **20,383** (everyone ahead is Tier 2). Our band is **30,001–50,000**.

---

## 2. Empirical inputs (published, observed)

All from Texas Comptroller official updates (Apr 28, May 4/29, Jun 10/23) and a Jun 25 spokesperson Q&A (Travis Pillow).

### 2.1 Cascade frontier over time
Frontier = `20,383 (Tier 2 backlog at lottery) − (Tier 2 still queued)`.

| Date | Tier 2 still queued | Frontier reached |
|------|--------------------:|-----------------:|
| 2026-05-04 | 20,383 | 0 |
| 2026-05-29 | 17,066 | 3,317 |
| 2026-06-10 | 12,966 | 7,417 |
| 2026-06-23 | 7,467 | **12,916** |

Every seat freed so far has gone to **Tier 2** families (the cascade has not yet reached Tier 3).

### 2.2 Published cumulative opt-outs
| Date | Cumulative opt-outs |
|------|--------------------:|
| 2026-05-11 (portal opens) | 0 |
| 2026-05-29 | ~1,400 |
| 2026-06-10 | ~2,000 |
| 2026-06-23 | ~3,000 |

### 2.3 Budget & population (Jun 25 spokesperson)
- **~$910M** awardable in Year 1 (after ~$90M admin/startup/TEA off the $1B biennium cap).
- **~$890M** already committed to active awards; held there by backfilling as families leave.
- **~$20M** reserve held for outstanding appeals; released to the waitlist once the appeal window closes.
- **~109,327** gross awarded ("nearly 110,000"); **~107,000** active after opt-outs.

---

## 3. Key derived quantities

### 3.1 Per-seat economics
Two ESA tiers are relevant:
- **Private**: ~**$10,474** per student.
- **Homeschool / "other"**: **$2,000** per student.

A new waitlist seat is a blend of the two. We assume the marginal new-award mix is **67% private / 33% homeschool** (revised up from 23% homeschool; see §3.2), giving a **blended new-seat cost**:

```
blended = 0.67 × $10,474 + 0.33 × $2,000 = $7,678
```

Reserve seats fundable: `$20,000,000 / $7,678 ≈ 2,605`.

### 3.2 The homeschool-share revision
Observed homeschool share has risen from an **original ~23%** (at award) toward **~33%** of active awards by Jun 23, driven by **private→$2,000 downgrades** (see §4.2). We adopt 33% as the forward marginal mix. *(This input is a judgment call and a candidate for sensitivity analysis — see §7.)*

### 3.3 Two departure types, different dollars freed
A family leaving an active award frees different amounts depending on how it leaves:
- **Opt-out** (leaves program entirely): frees the full **$10,474**.
- **Downgrade** to $2,000: frees the difference, **$8,474** (= $10,474 − $2,000).

Freed dollars are recycled into new (blended) seats, so **opt-out-heavy attrition advances the frontier further per departure** than downgrade-heavy attrition.

### 3.4 Seats-per-departure, calibrated to observed ~1:1
Empirically the frontier has advanced ~**1 seat per departure**: 12,916 frontier on ~12,900 departures by Jun 23 (≈3,000 opt-outs + ~9,900 downgrades). We therefore **normalize** seats-per-departure to the observed mix, so the mechanism only shifts a scenario's terminal insofar as its *forward* departure mix differs from today's:

```
avgFreed(o, d)        = (o·$10,474 + d·$8,474) / (o + d)
OBS_AVG_FREED         = avgFreed(2.8%, 9.3%) ≈ $8,937
seatsPerDeparture(o,d)= avgFreed(o, d) / OBS_AVG_FREED       # = 1.00 at today's mix
```

(The blended new-seat cost cancels in this ratio, so seats-per-departure is driven purely by the **opt-out : downgrade split**, not by §3.1.)

### 3.5 Terminal frontier formula
```
terminal = churnRate × activeBase × seatsPerDeparture(optOutRate, churnRate − optOutRate)
           + reserveSeats
activeBase = 107,000 ,  reserveSeats = 2,605
```

---

## 4. Attrition: what we mean, and the prior research

### 4.1 Total churn ≠ opt-outs
"**Total churn / attrition**" = every departure from an active award: **opt-outs + $2,000 downgrades + Jul-15 deadline no-shows**. Published "opt-outs" are only the first slice (~2.8% as of Jun 23). The frontier (12,916 ≈ **12%** of the active base) already implies ~12% total churn — most of it *unpublished downgrades*.

### 4.2 Homeschool downgrades (the hidden driver)
- Original homeschool ≈ 23% × 109,327 ≈ **25,100**.
- Downgrades by Jun 23 ≈ frontier − opt-outs ≈ 12,916 − 3,000 ≈ **9,900**.
- Homeschool now ≈ 35,000 / 106,327 active ≈ **~33%** (basis for §3.2).

### 4.3 Prior-research benchmarks (other ESA / voucher programs, Year 1)
| Program | Attrition | Primary drivers |
|---------|----------:|-----------------|
| NYC Voucher (Yr 3) | 38% | Tuition gaps, transport |
| Milwaukee Parental Choice | 30% | School closures, logistics, no transportation |
| Virginia Pre-K Initiative | 20–34% | Lack of local capacity |
| **D.C. Opportunity Scholarship** | **14.3%** | Couldn't find suitable school, waitlist fatigue |
| Queueing-theory baseline | 8–10% | Min. renege rate in constrained waitlists |

*Sources: ERIC ED472999 (Milwaukee); AEA (NYC); Hoover Institution (D.C.); VA Budget Bills; Kanoria (queueing theory).* Utah "Fits All" corroborates a "capacity-exhaustion-with-immediate-backfill" pattern but does not disclose a transferable Y1 retention rate.

These are **total-attrition** analogs (no program publishes a clean voluntary-opt-out rate), so they bound the **churnRate**, not the opt-out slice.

### 4.4 Timing: attrition is back-loaded
No decision pressure in May. The deadlines that force decisions: **Jun 1** (July-funding opt-in), **Jun 15** (school confirmation), **Jul 1** (first disbursement — only **25%** of a private award arrives, ~$2,618 of $10,474; "sticker shock"), and **Jul 15** (hard confirm / downgrade / opt-out deadline). **Jul 15 is modeled as the single largest attrition event of Year 1.** Disbursement schedule is **25 / 25 / 50** (Jul 1 / Oct 1 / Feb 1, 2027), a distinct cash-flow attrition driver for low-income Tier 2 families.

---

## 5. The three scenarios

| Scenario | Total churn | Opt-out rate (terminal) | Downgrade rate | seats/departure | Terminal frontier | Reaches our band (30k–50k)? |
|----------|------------:|------------------------:|---------------:|----------------:|------------------:|:---:|
| **Research central** | 15% | 4% | 11% | 1.008 | **18,782** | No — doesn't even clear Tier 2 |
| **Conservative** | 24% | 6% | 18% | 1.004 | **28,392** | No — stops just short of 30k |
| **Aggressive** | 43% | 22% | 21% | 1.063 | **51,500** | Yes — covers band, just past 50k |

Opt-outs are assumed to hold at **~3% in all scenarios through Jul 15** (matching the observed 2.8%); they diverge only in how the Jul-15 deadline shakeout splits between opt-outs and downgrades.

**Rationale per scenario:**
- **Research central (15%)** — the prior-research baseline with *no* TEFA-specific adjustment (D.C.'s 14.3% anchor, inside the 8–34% range). Diagnostic value: its terminal (18,782) is **below Tier 2 clearance (20,383)**, which demonstrates the **published cascade is already running hotter than pure research** — i.e., the observed ~12% by Jun 23 (pre-deadline) is inconsistent with a 15% full-year terminal. This is the main internal tension we want a statistician's eye on (§7).
- **Conservative (24%)** — mid of the 14–34% other-state Year-1 range, and consistent with the observed hot pace continuing moderately. Treated as the central planning case. Lands ~28,400, just short of our band.
- **Aggressive (43%)** — an extreme **Jul-15 opt-in collapse** (mass no-show: speculative awards never activated, PreK/K families unable to find seats). Above any first-year program on record; opt-outs spike to ~22%, which (being opt-out-heavy) lifts seats-per-departure and pushes the terminal to ~51,500. Explicitly a **low-probability ceiling, not a forecast**.

---

## 6. Projected frontier by date (model output)

All three share the published track through Jun 23 (12,916); they differ only after.

| Scenario | Jul 1 | Jul 15 | Jul 20 | Jul 31 | Aug 15 | Aug 31 |
|----------|------:|-------:|-------:|-------:|-------:|-------:|
| **Aggressive (~43%)** | 20,000 | 22,000 | 36,000 | 46,500 | 51,500 | 51,980 |
| **Conservative (~24%)** | 16,500 | 18,800 | 23,426 | 26,500 | 28,392 | 28,872 |
| **Research central (~15%)** | 14,000 | 15,200 | 18,108 | 18,400 | 18,782 | 19,262 |

Reference levels: **Tier 3 starts = 20,383**; **our band = 30,001–50,000** (original position 45k–50k).

Curve construction: each scenario is a set of monotone waypoints anchored on the last published point (Jun 23), interpolated with **monotone cubic (Fritsch–Carlson)** splines (no overshoot, non-decreasing), then a small residual drift (~30 seats/day) after Aug 15. Waypoints encode the calendar (Tier-2 clearing → Jul 1–15 lull → Jul-15 reserve+deadline step → late-July churn → August taper).

---

## 7. Monte Carlo: from point-scenarios to a probability

The three scenarios in §5 are point estimates. To get an actual probability of reaching our band, we replace the fixed churn/opt-out inputs with **distributions** and simulate. **100,000 trials**, deterministic PRNG (reproducible), implemented in `scratchpad/montecarlo.js`.

### 7.1 Input distributions (these ARE the model — not derived)
Two variables drawn **independently** per trial, so attrition *volume* and its *mix* do not move in lockstep:

- **Total churn** ~ PERT(min 15%, mode 25%, max 48%), λ = 2.5.
  - Floor 15% sits just above the **~12% already observed by Jun 23**, *before* the Jul-15 event — final churn realistically can't land below it.
  - Mode 25% ≈ the deterministic Conservative central.
  - Max 48% a hair past Aggressive (43%). λ = 2.5 (below the standard 4) deliberately **fattens both tails**.
- **Opt-out share of churn** ~ PERT(min 20%, mode 28%, max 55%), λ = 4.
  - Anchored on Jun-23 observed share (2.8 / 12.1 ≈ 23%); spans Conservative 25% → Aggressive 51%.

Per trial: `optOut = churn × share`, `downgrade = churn × (1 − share)`, then `terminal = churn × 107,000 × seatsPerDeparture + 2,605` (§3.5).

### 7.2 Results

| Outcome | Mix-sensitive `spd` | Pinned `spd = 1.0` |
|---------|--------------------:|-------------------:|
| Terminal frontier — **median** | 32,356 | 31,842 |
| — P10 / P90 | 23,416 / 43,522 | 23,071 / 42,781 |
| **P(clear Tier 2, ≥ 20,383)** | **98.5%** | 97.9% |
| **P(reach band, ≥ 30,001)** | **61.2%** | 58.9% |
| **P(reach our seat, ≥ 45,000)** | **7.0%** | 5.7% |
| P(past 50k, ≥ 50,000) | 1.1% | 0.7% |

Three things this settles:

1. **P(reach band) ≈ 61%, not the ~18–22% asserted elsewhere.** The deterministic Conservative terminal (28,392) sits just below 30,001 *with the Jul-15 event still ahead*, so the distribution's mass straddles the threshold and more than half clears it. The earlier 18–22% figures were not derived from any simulation.
2. **The seats-per-departure friction debate is nearly immaterial to the probability.** Mix-sensitive vs. pinned-at-1.0 moves P(reach band) by only ~2.3 points (61.2% → 58.9%), because `spd` departs from 1.0 only in opt-out-heavy draws, which are a minority. The §7-old "1:1 vs 1.16" question (now Q-b below) does **not** need to be resolved to trust the headline.
3. **Band-start ≠ our actual seat.** Clearing *into* Tier 3 (≥ 30,001) is ~61%, but reaching **our** original position (45k–50k) is only **~6–7%**. The band is wide and we sit near its far end. Tier 3 very likely opens; landing *that deep* is the tail.

### 7.3 Sensitivity — the one load-bearing assumption

P(reach band) is robust to the friction question but **sensitive to the churn mode**. Sliding the mode 20% → 30% (all else fixed, mix-sensitive):

| Churn mode | Median terminal | P(clear T2) | **P(reach band)** | P(reach our seat) |
|-----------:|----------------:|------------:|------------------:|------------------:|
| 20% | 28,861 | 95.3% | 44.3% | 3.1% |
| 22% | 30,248 | 96.9% | 51.2% | 4.4% |
| 24% | 31,661 | 98.1% | 57.9% | 6.1% |
| **25%** | **32,356** | **98.5%** | **61.2%** | **7.0%** |
| 26% | 33,066 | 98.8% | 64.3% | 8.2% |
| 28% | 34,486 | 99.3% | 70.1% | 10.8% |
| 30% | 35,838 | 99.6% | 75.3% | 14.0% |

Each **+1 point of churn mode ≈ +3 points of P(reach band)**. Even at the pessimistic end (mode 20%), P(reach band) is ~44% — still well above the asserted 18–22%. **This is the single input a reviewer should argue with**; everything else is second-order.

### 7.4 Residual open questions for review
- **(a) Churn distribution shape.** We use PERT(15/25/48, λ=2.5). Is the floor (anchored to the 12% pre-deadline observation) sound? Is a fat-tailed PERT the right family, or should this be a mixture (e.g., a separate Jul-15 "collapse" component)?
- **(b) The 1:1 vs ~1.16 calibration.** The raw dollar model (freed $ ÷ blended cost) implies ~1.16 seats/departure; we normalize to the observed 1.0. Shown above to barely move the probability, but it does shift terminals — is the gap a redeployment lag, a buffer, or a mis-estimated new-seat cost?
- **(c) Benchmark transferability.** The 14–34% range (D.C./Milwaukee/NYC/Virginia) informs the churn distribution's spread. Simple range adoption, or weighted/pooled?
- **(d) Independence of churn and opt-out share.** We draw them independently. If a Jul-15 *collapse* is simultaneously higher-volume **and** more opt-out-heavy, they'd be positively correlated, fattening the upper tail of the terminal. Worth a correlated-draw variant.
- **(e) Homeschool-share (33%).** Feeds blended cost / reserve seats only; weak effect (reserve is ~2,600 of a ~32,000 terminal) but still an input.

---

## 8. Bottom line (current model)

- **The honest headline is a probability, not a yes/no.** P(Tier 3 opens at all — frontier ≥ 30,001) ≈ **61%** (range ~44–75% across plausible churn modes). Tier 3 is **more likely than not** to begin.
- **But reaching *our* seat (45k–50k) is the tail: ~6–7%.** The cascade very probably clears into Tier 3 and stops well short of us. For family planning, **plan on no voucher this year**, while recognizing the ~1-in-15 upside is real and not negligible.
- The friction/seats-per-departure debate is **not decision-relevant** (≤2.5-point swing). The **churn mode is** — it's the assumption to pressure-test.
- The deterministic three-scenario lines (§5–6) remain useful as the chart's visual envelope; the Monte Carlo (§7) is the quantitative answer.

*Model implemented in `src/components/IddingsPlanner.jsx` (`buildCascadeProjection`); Monte Carlo in `scratchpad/montecarlo.js`. Empirical anchors live in the `*_OBSERVATIONS` arrays; everything else is derived. Research benchmarks and attrition rationale: `tefa-family-gem.md` §2.*
