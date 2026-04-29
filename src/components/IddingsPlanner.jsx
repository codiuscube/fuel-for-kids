import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Square,
  ExternalLink,
  DollarSign,
  Users,
  AlertCircle,
  GraduationCap,
  Clock,
  Printer,
  CreditCard,
  Percent,
  FileText,
  Copy,
  BarChart2,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Layers,
  Shield,
  Scale
} from 'lucide-react';

const VALID_TABS = ['dashboard', 'timeline', 'analysis'];

const IddingsPlanner = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = VALID_TABS.includes(tab) ? tab : 'dashboard';
  const setActiveTab = (t) => navigate(`/${t}`);

  // Scenario State - Empirical tier breakdown from the Apr 28, 2026 TEFA Lottery Update PDF,
  // superseding the Apr 8 Year 1 PDF's percentage-based estimates. Lottery-week update gives
  // hard counts: 25,400 ineligible / 27,050 T1 (awarded) / 15,592 T1 siblings (awarded) /
  // 72,927 T2 awaiting lottery / 66,119 T3 awaiting / 66,950 T4 awaiting (13,246 T4a + 53,704 T4b).
  // Sum: 274,038 total applications, 248,638 eligible. Replaces the prior 274,183 / 247,032 figures.
  const TOTAL_APPLICATIONS = 274038;
  const INELIGIBLE_APPLICATIONS = 25400;
  const ELIGIBLE_APPLICATIONS = TOTAL_APPLICATIONS - INELIGIBLE_APPLICATIONS;
  const INELIGIBILITY_RATE = INELIGIBLE_APPLICATIONS / TOTAL_APPLICATIONS;
  const [attritionRate, setAttritionRate] = useState(0.15); // Est. 15% of lottery winners don't follow through

  // Student Data
  const students = [
    { name: 'Cassius', grade: '9th Grade', school: 'High School', aceAmount: 4000, nbcaAid: 5850 },
    { name: 'Dorothy', grade: '7th Grade', school: 'Middle School', aceAmount: 3000, nbcaAid: 5600 },
    { name: 'Sebastian', grade: '4th Grade', school: 'Elementary', aceAmount: 3000, nbcaAid: 4750 }
  ];

  // Financial Data State - "Most Likely Scenario" Defaults
  const [tuition, setTuition] = useState(43505);
  const [tefaPerStudent, setTefaPerStudent] = useState(10474);

  // Default: TEFA unlikely for T3 (OFF per Comptroller Apr 3), ACE unlikely (OFF)
  const [includeTefa, setIncludeTefa] = useState(false);
  const [includeAce, setIncludeAce] = useState(false);

  // NBCA Aid - Granted: Cassius $5,850 + Dorothy $5,600 + Sebastian $4,750 = $16,200
  const nbcaAidAmount = 16200;

  // NBCA Scholarship - Depends on TEFA outcome (either/or per NBCA). Defaulting to 0.
  const [nbcaScholarshipAmount, setNbcaScholarshipAmount] = useState(0);

  // Fee Calculations (One-time)
  const fees = {
    nbcaApp: 150 * 3, // $150 per student
    nbcaEnroll: (175 + 55) * 3, // $175 + $55 additional enrollment fee per student x 3
    factsApp: 40,     // $40 per family
    aceApp: 0         // $0 (Waived per user update)
  };
  const totalFees = fees.nbcaApp + fees.nbcaEnroll + fees.factsApp + fees.aceApp;

  // Recurring Financial Calculations
  const totalTefa = includeTefa ? tefaPerStudent * 3 : 0;
  const totalAce = includeAce ? students.reduce((acc, s) => acc + s.aceAmount, 0) : 0;

  const totalAid = totalTefa + totalAce + nbcaAidAmount + nbcaScholarshipAmount;
  const finalCost = tuition - totalAid;
  const monthlyCost = finalCost > 0 ? finalCost / 10 : 0; // 10 month plan estimate

  // Status Tracking Data
  const appStatus = [
    { item: "NBCA Application", status: "Accepted (3/3)", date: "All 3 Accepted", type: "success", funding: "N/A" },
    { item: "NBCA Enrollment Fee", status: "Paid ($690)", date: "April 2", type: "success", funding: "($175 + $55) x 3" },
    { item: "NBCA Financial Aid", status: "Granted ($16,200)", date: "March 31", type: "success", funding: "Tuition Credit" },
    { item: "NBCA Scholarship", status: "Pending (depends on TEFA)", date: "End of April", type: "pending", funding: "Tuition Credit" },
    { item: "TEFA Grant (ESA)", status: "Waitlisted (Tier 3)", date: "T1 awards Apr 22–24; T3 ranked waitlist position notified by May 11", type: "pending", funding: "Odyssey ESA Account" },
  ];

  // Checklist Data
  const checklistData = {
    nbca: {
      title: "NBCA Admissions",
      color: "bg-tefa-green/10 text-tefa-green",
      items: [
        { id: 'nbca-app', text: 'Submit Online Application ($150 fee)', done: true },
        { id: 'nbca-pastor', text: 'Pastor Recommendation Form', done: true },
        { id: 'nbca-principal', text: 'Principal Recommendation Form', done: true },
        { id: 'nbca-teacher', text: 'Teacher Recommendation Form(s)', done: true },
        { id: 'nbca-math', text: 'Math Teacher Recommendation (6th-12th)', done: true },
        { id: 'nbca-report', text: 'Current Report Card / Transcript', done: true },
        { id: 'nbca-immun', text: 'Immunization Record', done: true },
        { id: 'nbca-assess', text: 'Student Assessments (Completed Feb 20)', done: true },
        { id: 'nbca-interview', text: 'Family Interview (Completed Feb 27)', done: true },
      ]
    },
    facts: {
      title: "Financial Aid & Scholarships",
      color: "bg-tefa-gold/20 text-tefa-gold",
      items: [
        { id: 'facts-app', text: 'Submit FACTS Grant & Aid App ($40 fee)', done: true },
        { id: 'nbca-schol', text: 'Submit NBCA Scholarship App (Mar 15)', done: true },
        { id: 'facts-tax', text: '2025 Tax Return (or 2024 if before May 15)', done: true },
        { id: 'facts-w2', text: '2025 W-2s', done: true },
        { id: 'facts-income', text: 'Other Income Documentation', done: true },
      ]
    },
    tefa: {
      title: "TEFA Voucher (Texas)",
      color: "bg-tefa-navy/10 text-tefa-navy",
      items: [
        { id: 'tefa-create', text: 'Create Account on TEFA Portal', done: true },
        { id: 'tefa-citizen', text: 'Proof of Citizenship/Residency', done: true },
        { id: 'tefa-eligibility', text: 'Proof of Public School Eligibility', done: true },
        { id: 'tefa-submit', text: 'Submit Application (Feb 4 - Mar 31, Extended)', done: true },
      ]
    },
    ace: {
      title: "ACE Scholarships",
      color: "bg-tefa-red/10 text-tefa-red",
      items: [
        { id: 'ace-qualify', text: 'Confirm Income Eligibility', done: true },
        { id: 'ace-school', text: 'Confirm NBCA Enrollment/Application', done: true },
        { id: 'ace-tax', text: '2025 Form 1040 Tax Return', done: true },
        { id: 'ace-sup', text: 'SNAP / Child Support Docs (if applicable)', done: true },
        { id: 'ace-submit', text: 'Submit Application (Feb 2 - Apr 15)', done: true },
      ]
    }
  };

  const [checklist, setChecklist] = useState(checklistData);

  const toggleCheck = (category, id) => {
    setChecklist(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: prev[category].items.map(item =>
          item.id === id ? { ...item, done: !item.done } : item
        )
      }
    }));
  };

  // Scenario Logic — Dual Model: Comptroller's Implementation vs Strict SB 2 Reading
  const getScenarioAnalysis = (totalApps, overrideAttrition) => {
    // === BUDGET (statutory) ===
    // SB 2, Sec. 29.3521(c-1): $1 billion cap for the 2025-2027 biennium.
    // The Comptroller committed the full $1B to Year 1 (Travis Pillow to The Texan, Apr 2 2026:
    // "$1 billion committed in year one") — administrative choice, statutorily permitted.
    const budget = 1_000_000_000;

    // === ADMINISTRATIVE OVERHEAD + APPEALS RESERVE (baked into baseline) ===
    // SB 2 §29.361(b)-(c) allows up to 3% for Comptroller administration plus
    // up to 5% for certified educational assistance organizations = $80M on
    // the $1B Year 1 program. The Apr 28 Lottery Update PDF item 5 confirms an
    // appeals reserve exists (amount not published; $5M is a conservative placeholder).
    // The model treats the full statutory admin cap plus reserve as baseline.
    const STATUTORY_ADMIN_CAP = 80_000_000;
    const APPEALS_RESERVE = 5_000_000;
    const programOverhead = STATUTORY_ADMIN_CAP + APPEALS_RESERVE;

    const attrRate = overrideAttrition !== undefined ? overrideAttrition : attritionRate;
    const eligibleApps = ELIGIBLE_APPLICATIONS;

    // === PER-STUDENT ALLOCATION (statutory) ===
    // SB 2 Sec. 29.361(a)(1): base = 85% × statewide avg M&O per ADA ≈ $10,474.
    // SB 2 Sec. 29.361(b):    SPED with active IEP = base + supplement, cap $30,000/year.
    // SB 2 Sec. 29.361(b-1):  Homeschool/other = $2,000/year.
    const perStudentBase = 10474;
    const perStudentHomeschool = 2000;

    // === FIRST-ROUND AWARDS (Apr 28, 2026 Lottery Update PDF — empirical) ===
    // The Apr 28 lottery-week PDF gives hard counts: 27,050 T1 students + 15,592 T1 siblings
    // = 42,642 first-round awards (consistent with the Apr 22 press release's "more than
    // 42,600"). The split is 63.4% T1 / 36.6% siblings.
    const fundedT1 = 27050;             // T1 proper (Apr 28 PDF — AWARDED & NOTIFIED)
    const siblingsFunded = 15592;       // Non-T1 siblings pulled in by sibling rule (Apr 28 PDF)
    const firstRoundAwards = fundedT1 + siblingsFunded; // 42,642

    // === CAPACITY (Apr 28 PDF empirical T1-family cost) ===
    // PDF item 1 — verbatim: "all eligible tier 1 applicants and siblings will qualify
    // for funding of approximately $415 million." This is the gross allocation, not
    // post-attrition. The figure is reliable because the Parent Application Guide
    // (Feb 12, 2026) establishes that the selected educational setting "locks" at the
    // end of the application period and post-lock changes can only reduce funding
    // (private → homeschool $2,000), never increase it. The program therefore knew the
    // exact per-student allocation for every T1-family awardee at lottery time.
    //
    // Why $415M is reachable while the prior derivation produced $640.7M: the Parent
    // Guide formalizes a "Prioritization Only" sub-class — a child with documented
    // disability gets T1 priority but no SPED supplement unless a current TEA-confirmed
    // IEP exists. Combined with the Apr 8 PDF's 77% private / 23% homeschool setting
    // split and 8,618 IEP-active applicants, the empirical math reconciles within ~1%:
    //   T1 IEP-active private    : 8,618 × 0.77 × $17,654 ≈ $117.1M
    //   T1 IEP-active homeschool : 8,618 × 0.23 × $2,000  ≈   $4.0M
    //   T1 priority-only private : 18,432 × 0.77 × $10,474 ≈ $148.7M
    //   T1 priority-only homesch : 18,432 × 0.23 × $2,000  ≈   $8.5M
    //   T1 siblings private      : 15,592 × 0.77 × $10,474 ≈ $125.7M
    //   T1 siblings homeschool   : 15,592 × 0.23 × $2,000  ≈   $7.2M
    //                                                          ≈ $411.2M  (PDF: ~$415M)
    const t1FamilyCost = 415_000_000;

    // === T2/T3 BLENDED COST ===
    // T2 (≤200% FPL, no disability) and T3 (200-500% FPL, no disability) carry no SPED
    // supplement by tier definition. Per-student cost depends only on educational
    // setting. Apr 8 PDF reports the overall applicant setting split as 77% private /
    // 23% homeschool — applied here to T2 (and T3 cascade) as the central estimate.
    const privateShare = 0.77;
    const perStudentT2Blended = privateShare * perStudentBase
      + (1 - privateShare) * perStudentHomeschool; // ≈ $8,525

    // T2 lottery slot count, central scenario (77/23 setting mix), with $85M
    // admin/reserve assumption baked into the baseline budget.
    // Floor sensitivity: if 100% of T2 winners select private, T2 rate drops further.
    const t2Budget = budget - t1FamilyCost - programOverhead;
    const t2LotteryCapacity = Math.floor(t2Budget / perStudentT2Blended); // ≈ 58,651
    const t2LotteryCapacityFloor = Math.floor(t2Budget / perStudentBase); // ≈ 47,737
    const capacity = firstRoundAwards + t2LotteryCapacity; // ~101,293

    // =====================================================
    // MODEL A: COMPTROLLER'S ACTUAL IMPLEMENTATION
    // (4-tier system — empirical tier counts from the Apr 28, 2026 Lottery Update PDF;
    //  no longer percentage-derived from eligibleApps)
    // =====================================================
    // T1 demand = T1 awarded (27,050) + T1 siblings (15,592) = full T1 family block.
    // Siblings are funded alongside T1 by the sibling rule, so they count as T1-family demand.
    const demandT1 = fundedT1 + siblingsFunded; // 42,642 — AWARDED & NOTIFIED per Apr 28 PDF
    const demandT2 = 72927;  // T2 awaiting lottery (Apr 28 PDF)
    const demandT3 = 66119;  // T3 awaiting lottery & waitlisting (Apr 28 PDF)
    const demandT4a = 13246; // T4a: prior public school 2024-25 (Apr 28 PDF)
    const demandT4b = 53704; // T4b: not enrolled in public school 2024-25 (Apr 28 PDF)

    // T1 + T1-siblings committed first (Apr 22 press release — fundedT1 and siblingsFunded
    // computed above). T2 lottery funds the remaining budget. T3 and T4 receive 0 from the
    // initial lottery and compete only via waitlist cascade.
    const fundedT2 = Math.min(demandT2, t2LotteryCapacity);
    const fundedT3 = 0;
    const fundedT4a = 0;
    const fundedT4b = 0;

    const tier3Rate = demandT3 > 0 ? Math.min(100, (fundedT3 / demandT3) * 100) : 100;
    const tier4Rate = (demandT4a + demandT4b) > 0
      ? Math.min(100, ((fundedT4a + fundedT4b) / (demandT4a + demandT4b)) * 100) : 100;

    // Sibling Rule (Comptroller administrative rule):
    // If ANY one child wins the lottery, all eligible siblings are automatically accepted.
    // P(family funded) = 1 - P(all 3 children lose independently)
    const singleFailRate = 1 - (tier3Rate / 100);
    const familySuccessRate = (1 - Math.pow(singleFailRate, 3)) * 100;

    // =====================================================
    // ATTRITION MODEL: Lottery winners who don't participate
    // Freed spots cascade down the waitlist (T1→T2→T3→T4)
    // T1-family attrition counts the full first-round cohort (T1 proper + pulled-in siblings);
    // if a T1 family opts out (by Jul 15 per Apr 22 press release), all their awards return
    // to the pool.
    // =====================================================
    const t1Attrition = Math.round(firstRoundAwards * attrRate);
    const t2Attrition = Math.round(fundedT2 * attrRate);

    // Freed spots first fill unfunded T2 (lottery losers within T2)
    let freedSpots = t1Attrition + t2Attrition;
    const unfundedT2 = demandT2 - fundedT2;
    const additionalT2Funded = Math.min(freedSpots, unfundedT2);
    freedSpots -= additionalT2Funded;

    // Second-round attrition from newly funded T2 students
    const additionalT2Attrition = Math.round(additionalT2Funded * attrRate);
    freedSpots += additionalT2Attrition;

    // Remaining freed spots go to T3
    const t3FromWaitlist = Math.min(freedSpots, demandT3 - fundedT3);
    freedSpots -= t3FromWaitlist;

    // T3 attrition from both initial and waitlist-funded T3
    const t3Attrition = Math.round((fundedT3 + t3FromWaitlist) * attrRate);
    freedSpots += t3Attrition;

    const effectiveFundedT3 = fundedT3 + t3FromWaitlist;
    const effectiveTier3Rate = demandT3 > 0 ? Math.min(100, (effectiveFundedT3 / demandT3) * 100) : 100;
    const effectiveSingleFail = 1 - (effectiveTier3Rate / 100);
    const effectiveFamilyRate = (1 - Math.pow(effectiveSingleFail, 3)) * 100;

    // Total attrition summary
    const totalInitialFunded = fundedT1 + fundedT2 + fundedT3 + fundedT4a + fundedT4b;
    const totalAttritionFreed = t1Attrition + t2Attrition + additionalT2Attrition + t3Attrition;

    return {
        capacity, eligibleApps,
        // Apr 28 PDF empirical calibration
        firstRoundAwards, siblingsFunded, t2LotteryCapacity, t2LotteryCapacityFloor,
        t1FamilyCost, t2Budget, perStudentT2Blended, programOverhead,
        // Model A: Comptroller's implementation (initial lottery)
        demandT1, demandT2, demandT3, demandT4a, demandT4b,
        fundedT1, fundedT2, fundedT3, fundedT4a, fundedT4b,
        tier3Rate, tier4Rate, familySuccessRate,
        // Attrition / waitlist cascade
        t1Attrition, t2Attrition, additionalT2Funded, additionalT2Attrition,
        t3FromWaitlist, t3Attrition, unfundedT2,
        effectiveFundedT3, effectiveTier3Rate, effectiveFamilyRate,
        totalInitialFunded, totalAttritionFreed,
    };
  };

  const analysis = getScenarioAnalysis(TOTAL_APPLICATIONS);

  // Scenario Outlook: Best / Most Likely / Worst (fixed ineligibility rates, current applicant count)
  // Best/worst now driven by attrition (the real uncertainty), since ineligibility is fixed.
  // All scenarios include the $85M admin/reserve assumption baked into the baseline budget.
  const scenarioOutlook = {
    best: getScenarioAnalysis(TOTAL_APPLICATIONS, 0.25),       // high attrition → more T3 cascade
    mostLikely: getScenarioAnalysis(TOTAL_APPLICATIONS, 0.15),
    worst: getScenarioAnalysis(TOTAL_APPLICATIONS, 0.08),      // low attrition
  };

  // Tier 2 funding rate for display
  const tier2FundingRate = analysis.demandT2 > 0 ? Math.min(100, (analysis.fundedT2 / analysis.demandT2) * 100) : 100;

  // Essay/Text Data
  const applicationTexts = {
    scholarshipEssays: {
        title: "Submitted Scholarship Essays (Core Values)",
        content: `TRUTH:
In our family, we believe that truth is not merely a concept or a rule to follow, but a person: Jesus Christ. Because of this, truth in the Iddings home means aligning our lives with Him. In a world that treats truth as subjective, we anchor our family in the conviction that God's Word is the ultimate standard for how we live, love, and learn. For us, the pursuit of truth is the pursuit of knowing God.

We model Christ-centered honesty primarily through a culture of transparency and repentance. Chelsea and I strive to show our children—Cassius, Sebastian, and Dorothy—that being a Christian means being honest about who we are. We openly admit when we are wrong, ask for forgiveness when we lose our patience, and demonstrate that grace is the natural response to confession. We want our home to be a place where truth is spoken in love, and where integrity means that who we are in public is who we are in private.

This practice is vital because we view our family as 'worker bees' in God's kingdom. While we are sojourners on this earth, we are called to actively participate in His work of restoration. We deeply desire for our children to bring order and light into a chaotic world; to do that, they must learn to love the truth.

We are seeking a partnership with a school that reinforces this same foundation, helping us raise children who champion the truth in every area of their lives.

EXCELLENCE:
We define excellence not as perfection, but as honoring God by fully utilizing the gifts and capacity He has given us. Paul wrote in Colossians: "Whatever you do, work heartily, as for the Lord and not for men."

Because of this, we emphasize process over outcome. We try to celebrate the discipline and effort it took to achieve something. We want our children to feel safe enough to take risks and make mistakes, knowing that their worth is secure in Christ, not in their performance. We want to raise lifelong learners who run toward difficult challenges because they view the struggle as a chance to grow, not a threat to their identity.

We already see the fruit of this approach in our home: it empowers Cassius to publish his music online without fear, inspires Dorothy to create art for others with confidence, and encourages Sebastian to channel his high energy into attempting every sport he loves.

Ultimately, we help them build internal motivation to do the hard work and steward their gifts well. We are seeking a school that shares this vision—one that holds high academic standards not for the sake of prestige, but because the pursuit of excellence is an act of worship.

COMMUNITY:
Having lived all over the world, our family has learned that community is built and fostered through intentional presence. Living with open hearts and open doors, we are preparing our children to not only navigate the world with wisdom but to lead with good character.

In our home, we cultivate a posture of hospitality. Whether it is hosting a meal or simply making our space available to those around us, we model that people are image-bearers of God and deserve to be treated with dignity and kindness. It wouldn't be surprising to see others in our home for dinner regularly or notice a family staying with us for a season.

We are deeply plugged into the life of our local body, King's Community Church. For us, church is not an event we attend, but a family we serve and serve alongside. Chelsea serves as the Worship Arts Director, using her gifts to lead others in worship, while Cody serves as a leader in Student Ministry, mentoring young teenagers and demonstrating that faith is relevant to every stage of life. Our children see us preparing, rehearsing, and showing up early—teaching them that "service" often looks like doing the hard work behind the scenes to create space for others to encounter Jesus.

Beyond our home and church, we foster responsibility by acting as stewards of our local community. We believe the restoration work of the gospel includes caring for the place we live. This looks like saying "yes" to friends when they need coffee, consistently showing up to our community group, volunteering for meal service at First Footing, getting our hands dirty maintaining trails with the Comal Trails Alliance, and more. We want to be known as a family that says "YES" to the Spirit's nudges, which often starts with saying "YES" to others.

Ultimately, we teach our children that we are "Here For Good"—active participants in our home, school, church, and neighborhood, looking for ways to serve rather than to be served.

LEADERSHIP:
Our family recently debated the definition of a leader. One child suggested it is "someone who serves," another said "someone who knows more," and a third defined it as "accepting responsibility." While these are true, we see Godly leadership as distinct from mere management. We teach our children that leadership is the courage to have vision and pursue it with integrity.

We model this by striving to live an integrated life. We don't want to be one person at church and a different person at work. Whether it is Chelsea leading worship or me navigating business decisions, we want our kids to see that we are the same people at home and outside it. We talk openly about the weight of decision-making, showing them that giving glory to God isn't just for Sunday mornings; it is for the hard work done behind the scenes. We model that true authority comes not from a title, but from honoring one's word and doing what you say you will do.

Part of this integrity is listening to the Spirit. We encourage our children to practice this through compassion with eyes to see. At King's Community Church, one of our core values is "Showing Compassion," which requires noticing needs before they are announced. We are teaching them that if they see a problem, they might be the leader God sent to solve it. As Paul wrote in Philippians 2:4: "Let each of you look not only to his own interests, but also to the interests of others."

We want them to understand that by taking responsibility, they participate in the transformation of their community. We are seeking a school that partners with us in this equipping, helping us to raise servant-leaders.`
    },
    finAid: {
      title: "Financial Aid Statement (FACTS)",
      content: `We are seeking a partnership with NBCA not just for character academic potential, but to build a cohesive family culture where all three of our children—Cassius, Dorothy, and Sebastian—can grow together in unity.

However, any of the three students to NBCA presents a significant financial barrier. Prior to this school year, NBCA has not been an option due to the high tuition costs. Now that TEFA may be an option, we have decided to pursue this school to see what doors God opens for our children. We view this investment as a matter of stewardship and are committed to doing our part; we are actively applying for the Texas Education Freedom Account (TEFA) and ACE Scholarships to cover the majority of tuition.

The contribution amount we listed represents the maximum we can sustainably budget for our family of five. We respectfully request financial aid to help bridge the remaining gap, allowing us to steward our resources wisely while securing this vital partnership for our children's future.`
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Timeline Data
  const timelineEvents = [
    { date: 'Feb 20', day: 'Fri', isoDate: '2026-02-20', event: 'Student Assessments', type: 'nbca', desc: 'Required testing for placement.', funding: 'N/A' },
    { date: 'Feb 27', day: 'Fri', isoDate: '2026-02-27', event: 'Family Interview', type: 'nbca', desc: 'Final step before acceptance decision.', funding: 'N/A' },
    { date: 'Mar 14', day: 'Sat', isoDate: '2026-03-14', event: 'NBCA Round 1 Notification', type: 'nbca', desc: 'Acceptance letters emailed to families.', funding: 'Decision Only' },
    { date: 'Mar 17', day: 'Tue', isoDate: '2026-03-17', event: 'TEFA Original Deadline (Extended)', type: 'tefa', desc: 'Original deadline. Extended by federal court order.', funding: 'Superseded' },
    { date: 'Mar 31', day: 'Tue', isoDate: '2026-03-31', event: 'TEFA Application Closes (Extended)', type: 'tefa', desc: 'New deadline per federal court order (Judge Bennett, S.D. Texas). 11:59 PM CT. After today: cannot switch homeschool/other to private school (can switch private to homeschool/other).', funding: 'Deadline' },
    { date: 'Mar 31', day: 'Tue', isoDate: '2026-03-31', event: 'NBCA Financial Aid Granted ($16,200)', type: 'nbca', desc: 'Financial aid awarded: Cassius $5,850, Dorothy $5,600, Sebastian $4,750. Credited to tuition.', funding: 'Credited to Tuition' },
    { date: 'Apr 01', day: 'Wed', isoDate: '2026-04-01', event: 'TEFA Surpasses 274,000 Applications (AFC)', type: 'tefa', desc: 'AFC press release confirms 274,000+ applications — largest school choice launch in history.', funding: 'N/A' },
    { date: 'Apr 02', day: 'Thu', isoDate: '2026-04-02', event: 'Comptroller Releases Initial TEFA Breakdown', type: 'tefa', desc: 'Initial breakdown: 274,183 total applications, 77% private / 23% homeschool.', funding: 'N/A' },
    { date: 'Apr 03', day: 'Fri', isoDate: '2026-04-03', event: 'Comptroller Confirms: Public School Priority Only Applies to Tier 4', type: 'tefa', desc: 'TEFA team email response to our inquiry confirms: per Sec. 29.3521(d), prior public school enrollment priority only applies to Tier 4 (≥500% FPL). For Tier 3 (200-500% FPL), public school history provides no priority advantage. Also confirmed: $1B spending cap for 2025-2027 biennium, 20% cap on Tier 4 spending.', funding: 'N/A' },
    { date: 'Apr 02', day: 'Thu', isoDate: '2026-04-02', event: 'NBCA Enrollment Fee Paid', type: 'nbca', desc: 'Enrolled all 3 children. Paid ($175 + $55) x 3 = $690.', funding: '$690 Paid' },
    { date: 'Apr 08', day: 'Wed', isoDate: '2026-04-08', event: 'Comptroller Publishes TEFA Application Insights: Year 1', type: 'tefa', desc: 'Official Year 1 PDF released — 274,183 applications, tier breakdown, demographics, ISD-level data.', funding: 'N/A', link: { href: '/TEFA-Application-Insights-Year-1.pdf', label: 'View PDF' } },
    { date: 'Apr 15', day: 'Wed', isoDate: '2026-04-15', event: 'ACE Scholarship Deadline', type: 'ace', desc: 'Closes 11:59 PM (Tax Day).', funding: 'Deadline' },
    { date: 'Apr 22', day: 'Wed', isoDate: '2026-04-22', event: 'TEFA Tier 1 Notifications Begin — 42,642 Awards', type: 'tefa', desc: 'Per the Apr 22 press release and the Apr 28 Lottery Update PDF: 42,642 students receive award notices Apr 22–24 — 27,050 Tier 1 students (disability + ≤500% FPL) plus 15,592 of their siblings pulled in by the sibling rule. Approximately half previously attended a public school. 30-day appeal window opens from notice receipt — adjustments only on school-district or IEP documentation.', funding: 'Award or Waitlist Position' },
    { date: 'Apr 24', day: 'Fri', isoDate: '2026-04-24', event: 'Federal Injunction Hearing', type: 'tefa', desc: 'Key hearing in Muslim schools v. Texas. Court decides whether to maintain, modify, or dissolve the injunction blocking Comptroller Hancock from excluding Islamic schools. TEFA funding timeline depends on outcome.', funding: 'Court Date' },
    { date: 'Apr 27', day: 'Mon', isoDate: '2026-04-27', event: 'TEFA Tier 2 Lottery + Waitlist Assignment', type: 'tefa', desc: 'Per Apr 22 press release: "In consultation with an independent agency, the Comptroller\'s office will conduct a lottery during the week of April 27 to determine which students in the second priority tier — students in lower-income households — will receive award notifications." The SAME lottery assigns waitlist positions to the remaining T2 students AND everyone in T3/T4. Per the Apr 28 PDF, T2 award notifications begin this week; all tiers are notified of approximate waitlist position by May 11.', funding: 'Lottery + Ranked Waitlist' },
    { date: 'May 11', day: 'Mon', isoDate: '2026-05-11', event: 'TEFA Waitlist Notifications + Opt-In Portal Opens', type: 'tefa', desc: 'Per the Apr 28 Lottery Update PDF: by May 11, the program notifies students in all tiers of their approximate waitlist position. The Odyssey portal also flips on this date to allow parents of awarded students to "opt in" to accept the award and select their participating private school. Iddings family (T3) learns their ranked waitlist position by today — the sharpest available signal before the Jun 30 NBCA withdrawal deadline.', funding: 'Waitlist Position + Portal Live' },
    { date: 'End Apr', day: 'TBD', isoDate: '2026-04-30', event: 'NBCA Scholarship Decisions (est.)', type: 'nbca', desc: 'Per NBCA (Michelle Leidy, Mar 31): scholarship amount depends on TEFA outcome — TEFA funds affect financial need calculation. Scholarship awarded only if/where TEFA doesn\'t cover.', funding: 'Credited to Tuition' },
    { date: 'May 22', day: 'Fri', isoDate: '2026-05-22', event: 'T1 Appeals Window Closes (est.)', type: 'tefa', desc: '30 days after the first Apr 22 notifications. Per the Apr 22 press release: "Parents may appeal funding determinations within 30 days of receiving their notice; however, adjustments will be made only based on school district and Individualized Education Program documentation." Narrow relevance to Iddings — would only matter if a child obtained a qualifying IEP (moving from T3 to T1).', funding: 'Appeal Deadline' },
    { date: 'Jun 01', day: 'Mon', isoDate: '2026-06-01', event: 'TEFA July-Funding Track: Family Opt-In Deadline', type: 'tefa', desc: 'Per the Apr 28 Lottery Update PDF: parents on the July 1 funding track must opt in and select their participating private school by this date. Awarded families who miss this deadline shift to the August-funding track (Jul 15 family deadline). Non-confirmations begin trickling waitlist movement — but the bulk arrives later.', funding: 'July Track Family Deadline' },
    { date: 'Jun 15', day: 'Mon', isoDate: '2026-06-15', event: 'TEFA July-Funding Track: School Confirms Enrollment', type: 'tefa', desc: 'Per the Apr 28 Lottery Update PDF: participating private schools must confirm enrollment through the program portal by this date for July 1 funding. Key trigger for waitlist cascade — the state now formally knows which Jun 1 selections were completed vs. which fell through. Waitlisted families already know their ranked position from May 11; this is when actual movement picks up.', funding: 'July Track School Lock-In' },
    { date: 'Jun 15', day: 'Mon', isoDate: '2026-06-15', event: 'ACE Award Notification', type: 'ace', desc: 'Scholarship decisions released.', funding: 'Paid directly to School' },
    { date: 'Jun 16', day: 'TBD', isoDate: '2026-06-16', event: 'TEFA Waitlist Movement Accelerates (est.)', type: 'tefa', desc: 'After Jun 15 school confirmations on the July-funding track, unfilled spots cascade down the waitlist (T2 backfill first, then T3). Waitlisted families already know their ranked position from May 11. Biggest cascade event will be post-Jul 15 opt-outs on the August-funding track.', funding: 'Waitlist Movement' },
    { date: 'Jun 30', day: 'Tue', isoDate: '2026-06-30', event: 'NBCA Withdrawal Deadline', type: 'nbca', desc: 'Can withdraw penalty-free before this date. No tuition due until July. Critical tension: June 30 falls ~2 weeks before the Jul 15 TEFA opt-out/confirmation deadline — meaning the NBCA withdrawal decision is made BEFORE the main waitlist-cascade event (Jul 15 opt-outs free the largest block of funding).', funding: 'N/A' },
    { date: 'Jul 01', day: 'Wed', isoDate: '2026-07-01', event: 'TEFA First Round Funding Available', type: 'tefa', desc: 'Per official TEFA email: "First round of funding becomes available in Odyssey\'s platform." This is when award recipients first see real dollar amounts vs. their actual tuition bill — potential sticker-shock attrition event. Families who drop here create a second wave of waitlist opportunities for those not yet called up.', funding: 'Distribution' },
    { date: 'Jul 15', day: 'Wed', isoDate: '2026-07-15', event: 'TEFA August-Funding Track: Family Opt-In Deadline', type: 'tefa', desc: 'Per the Apr 22 press release and the Apr 28 PDF: families on the August funding track have until July 15 to confirm enrollment in a participating private school, select homeschool/other ($2,000), or opt out of the program. This is the largest single attrition event of Year 1 — opt-outs cascade funding down the waitlist for both T2 and T3.', funding: 'August Track Family Deadline' },
    { date: 'Jul 31', day: 'Fri', isoDate: '2026-07-31', event: 'TEFA August-Funding Track: School Confirms Enrollment', type: 'tefa', desc: 'Per the Apr 28 Lottery Update PDF: participating private schools must confirm enrollments by this date for August funding. Back-office step — no family action required. Any subsequent attrition (mid-school-year) generates late waitlist movement.', funding: 'August Track School Lock-In' },
    { date: 'Aug 01', day: 'TBD', isoDate: '2026-08-01', event: 'TEFA Appeals Reserve → Waitlist (est.)', type: 'tefa', desc: 'Per the Apr 28 PDF item 5: the Comptroller has set aside a reserve budget for successful eligibility / priority-tier / funding-amount appeals. Once the appeals window closes and adjustments are made, any unused reserve cascades to the next-available students on the waitlist — a small upside for waitlisted T2 and T3 families. Magnitude is undisclosed; treat as a sensitivity vector, not baseline.', funding: 'Reserve Cascade' },
    { date: 'Oct 01', day: 'Thu', isoDate: '2026-10-01', event: 'TEFA Second Funding Release (50%)', type: 'tefa', desc: 'At least 50% of approved funding available. Some families may have re-enrolled in public school by now, freeing additional waitlist spots.', funding: 'Distribution' },
    { date: 'Apr 01', day: 'Thu', isoDate: '2027-04-01', event: 'TEFA Final Funding Release', type: 'tefa', desc: 'Remaining funding available in participant accounts. Unused funds roll over if child remains in TEFA program.', funding: 'Distribution' },
  ];

  return (
    <div className="min-h-screen bg-tefa-light font-sans text-tefa-body pb-12">
      {/* Header */}
      <header className="bg-tefa-navy text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Iddings Family Planner</h1>
            <p className="text-tefa-sky mt-1">NBCA Enrollment 2026-2027</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2 text-sm font-medium">
            {['dashboard', 'timeline', 'analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-[20px] transition capitalize ${activeTab === tab ? 'bg-white text-tefa-navy font-bold' : 'text-white border border-white/20 hover:text-tefa-sky'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* Status Overview Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="font-bold text-tefa-navy mb-4 flex items-center gap-2">
                        <TrendingUp size={20}/> Application Status
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-tefa-navy uppercase bg-tefa-navy/5 border-b border-tefa-navy/10">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Item</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Notification</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Funding Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {appStatus.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-tefa-light transition">
                                        <td className="px-4 py-3 font-medium text-tefa-body flex items-center gap-2">
                                            {row.type === 'success'
                                                ? <CheckSquare size={16} className="text-green-600"/>
                                                : <Square size={16} className="text-tefa-body/40"/>}
                                            {row.item}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              row.type === 'success' ? 'bg-green-100 text-green-700' :
                                              row.status === 'Scheduled' ? 'bg-tefa-navy/10 text-tefa-navy/70' :
                                              'bg-amber-100 text-tefa-red/80'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-tefa-body/70">{row.date}</td>
                                        <td className="px-4 py-3 text-xs text-tefa-body/60 font-mono">{row.funding}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                     <h3 className="font-bold text-tefa-navy mb-4 flex items-center gap-2">
                        <CreditCard size={20}/> One-Time Fees
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-tefa-body/70">NBCA Apps (3)</span>
                            <span className="font-bold">${fees.nbcaApp}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-tefa-body/70">NBCA Enrollment (3)</span>
                            <span className="font-bold">${fees.nbcaEnroll}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-tefa-body/70">FACTS Fee</span>
                            <span className="font-bold">${fees.factsApp}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-tefa-body/70">ACE Apps (3)</span>
                            <span className="font-bold">${fees.aceApp}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>${totalFees}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Funding Update Banner - Apr 28 Lottery Update */}
            <div className="bg-tefa-green/10 p-4 rounded-lg shadow-md border-2 border-tefa-green/40">
                <h2 className="text-base font-bold flex items-center gap-2 text-tefa-green mb-2">
                    <AlertCircle size={18} /> Funding Update — April 28, 2026 (TEFA Lottery Update PDF)
                </h2>
                <p className="text-sm text-tefa-body mb-2">
                    The Comptroller's Apr 28 Lottery Update gives empirical tier counts: <strong>42,642 first-round awards</strong> (27,050 Tier 1 students + 15,592 T1 siblings via the sibling rule) committed <strong>~$415M</strong> of the $1B Year 1 budget (PDF item 1, verbatim). T2 demand is <strong>72,927</strong>; T3 demand is <strong>66,119</strong>; T4 totals <strong>66,950</strong> (13,246 T4a + 53,704 T4b). After ~$85M in admin/reserve assumptions (SB 2 §29.361(b)-(c) 8% statutory admin cap + appeals reserve), <strong>~${(analysis.t2Budget / 1e6).toFixed(0)}M</strong> funds the T2 lottery — at the central 77/23 setting mix, that's ~{analysis.t2LotteryCapacity.toLocaleString()} T2 slots (~{tier2FundingRate.toFixed(0)}%).
                </p>
                <ul className="text-xs text-tefa-body/80 space-y-1 list-disc pl-5">
                    <li><strong>Week of Apr 27:</strong> T2 lottery runs; T2 award notifications begin.</li>
                    <li><strong>By May 11:</strong> all tiers (incl. Iddings/T3) notified of approximate waitlist position; Odyssey portal opens for awarded families to opt in and select a school.</li>
                    <li><strong>Jun 1 / Jun 15:</strong> family opt-in / school confirmation for the <em>July 1 funding</em> track.</li>
                    <li><strong>Jul 15 / Jul 31:</strong> family opt-in / school confirmation for the <em>August funding</em> track — Jul 15 opt-outs are the largest cascade event of Year 1.</li>
                    <li><strong>Reserve budget:</strong> the program holds funds for successful appeals; unused reserve cascades to the next available waitlisted students.</li>
                </ul>
            </div>

            {/* TEFA Program Status Card */}
            <div className="bg-tefa-light p-6 rounded-lg shadow-md border-2 border-tefa-navy">
                <h2 className="text-xl font-bold flex items-center gap-2 text-tefa-navy mb-3">
                    <Scale size={20} /> TEFA Program Status: Awaiting Notifications
                </h2>
                <p className="text-sm text-tefa-body mb-4">
                    <strong>{TOTAL_APPLICATIONS.toLocaleString()} students</strong> applied in Year 1 ({ELIGIBLE_APPLICATIONS.toLocaleString()} eligible per the Apr 28 Lottery Update PDF). <strong>{analysis.firstRoundAwards.toLocaleString()} first-round awards</strong> (T1 + siblings) committed <strong>~$415M</strong> of the $1B budget (Apr 28 PDF item 1). The remaining ~${(analysis.t2Budget / 1e6).toFixed(0)}M funds the <strong>T2 lottery (week of Apr 27)</strong> — at the central 77/23 setting mix that's ~{analysis.fundedT2.toLocaleString()} of {analysis.demandT2.toLocaleString()} T2 applicants (~{tier2FundingRate.toFixed(0)}%); a 100%-private floor scenario funds ~{analysis.t2LotteryCapacityFloor.toLocaleString()} (~{((analysis.t2LotteryCapacityFloor / analysis.demandT2) * 100).toFixed(0)}%). Tier 3 (Iddings) is <strong>waitlisted</strong> with a ranked position notified by May 11.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Total Apps</div>
                        <div className="font-bold text-tefa-navy text-lg">{TOTAL_APPLICATIONS.toLocaleString()}</div>
                        <div className="text-[10px] text-tefa-body/40">Apr 28 Lottery Update PDF</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Program Capacity</div>
                        <div className="font-bold text-tefa-navy text-lg">~{analysis.capacity.toLocaleString()}</div>
                        <div className="text-[10px] text-tefa-body/40">$415M T1-fam + $85M admin/reserve + $500M T2</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Iddings Tier</div>
                        <div className="font-bold text-tefa-gold text-lg">Tier 3</div>
                        <div className="text-[10px] text-tefa-body/40">200-500% FPL (waitlisted)</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Initial Lottery</div>
                        <div className={`font-bold text-lg ${analysis.familySuccessRate > 10 ? 'text-amber-600' : 'text-red-500'}`}>{analysis.familySuccessRate.toFixed(1)}%</div>
                        <div className="text-[10px] text-tefa-body/40">Family rate (sibling rule)</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">With Attrition ({Math.round(attritionRate * 100)}%)</div>
                        <div className={`font-bold text-lg ${analysis.effectiveFamilyRate > 50 ? 'text-amber-500' : analysis.effectiveFamilyRate > 10 ? 'text-amber-600' : 'text-red-500'}`}>{analysis.effectiveFamilyRate.toFixed(1)}%</div>
                        <div className="text-[10px] text-tefa-body/40">After waitlist cascade</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">If Accepted</div>
                        <div className="font-bold text-tefa-green text-lg">Kept for Life</div>
                        <div className="text-[10px] text-tefa-body/40">No reapplication needed</div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs text-center">
                    <div className="bg-tefa-green/10 rounded p-1.5 border border-tefa-green/20">
                        <div className="font-bold text-tefa-green">T1: {analysis.firstRoundAwards.toLocaleString()}</div>
                        <div className="text-tefa-green/70">Awarded (incl. sibs)</div>
                    </div>
                    <div className="bg-tefa-navy/10 rounded p-1.5 border border-tefa-navy/20">
                        <div className="font-bold text-tefa-navy">T2: {analysis.demandT2.toLocaleString()}</div>
                        <div className="text-tefa-navy/70">Lottery</div>
                    </div>
                    <div className="bg-tefa-gold/20 rounded p-1.5 border-2 border-tefa-gold/60">
                        <div className="font-bold text-tefa-red">T3: {analysis.demandT3.toLocaleString()}</div>
                        <div className="text-tefa-red/70">Waitlisted</div>
                    </div>
                    <div className="bg-tefa-red/10 rounded p-1.5 border border-tefa-red/20">
                        <div className="font-bold text-tefa-red">T4: {(analysis.demandT4a + analysis.demandT4b).toLocaleString()}</div>
                        <div className="text-tefa-red/70">Waitlisted</div>
                    </div>
                </div>
            </div>

            {/* Misinformation Alert Card */}
            <div className="bg-amber-50 p-6 rounded-lg shadow-md border-2 border-amber-400">
                <h2 className="text-xl font-bold flex items-center gap-2 text-amber-800 mb-2">
                    <AlertCircle size={20} /> Misinformation Alert — Circulating Figures Are Wrong
                </h2>
                <p className="text-sm text-amber-900 mb-4">
                    Emails from several Texas archdioceses and private schools (including at least one San Antonio-area Catholic high school) are circulating <strong>inaccurate tier counts and lottery rates</strong>. Corrected against the Comptroller's <em>TEFA Application Insights: Year 1</em> PDF (Apr 2026) and SB 2 statute:
                </p>
                <div className="space-y-3 text-sm">
                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <div className="text-xs uppercase font-bold text-amber-700 mb-2">Claim (VCHS / Catholic HS email)</div>
                        <p className="text-tefa-body/80 italic mb-2">"42,000 (all Tier 1) have been approved for those in special ed or below poverty level stated for Tier 1."</p>
                        <div className="text-xs uppercase font-bold text-tefa-red mb-1">What's wrong (mostly a definition problem — raw count was close)</div>
                        <ul className="list-disc ml-5 text-tefa-body/80 space-y-1 text-xs">
                            <li><strong>The 42,000 number was directionally correct.</strong> Per the Apr 28 Lottery Update PDF, <strong>{analysis.firstRoundAwards.toLocaleString()}</strong> students received first-round awards — but that is NOT "all Tier 1." It's Tier 1 (<strong>{analysis.fundedT1.toLocaleString()}</strong> students) <strong>plus their siblings</strong> ({analysis.siblingsFunded.toLocaleString()}) pulled in by the sibling rule. T1 proper is {analysis.fundedT1.toLocaleString()}, not 42,000.</li>
                            <li><strong>T1 definition is still wrong in the email.</strong> T1 = disability (active IEP) <em>AND</em> household at or below 500% FPL (SB 2 §29.3521(d)). "Below poverty level" describes <strong>Tier 2</strong> (≤200% FPL), not Tier 1.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <div className="text-xs uppercase font-bold text-amber-700 mb-2">Claim (VCHS / Catholic HS email)</div>
                        <p className="text-tefa-body/80 italic mb-2">"Tier 2 has 65,000 qualified but only 22,000 vouchers, so a lottery will determine who gets funding."</p>
                        <div className="text-xs uppercase font-bold text-tefa-red mb-1">What's wrong (severely understated)</div>
                        <ul className="list-disc ml-5 text-tefa-body/80 space-y-1 text-xs">
                            <li><strong>T2 qualified is {analysis.demandT2.toLocaleString()}</strong> per the Apr 28 Lottery Update PDF, not 65,000.</li>
                            <li><strong>Funded T2 count is ~{analysis.fundedT2.toLocaleString()} central / ~{analysis.t2LotteryCapacityFloor.toLocaleString()} floor (≈{tier2FundingRate.toFixed(0)}% central / ≈{((analysis.t2LotteryCapacityFloor / analysis.demandT2) * 100).toFixed(0)}% floor)</strong>. The 22,000 figure undercounts the T2 lottery pool by ~{Math.round(analysis.t2LotteryCapacityFloor - 22000).toLocaleString()}–{Math.round(analysis.fundedT2 - 22000).toLocaleString()} seats. The Apr 27 T2 lottery results will produce the authoritative number.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <div className="text-xs uppercase font-bold text-amber-700 mb-2">Claim (Archdiocese TEFA bulletin)</div>
                        <p className="text-tefa-body/80 italic mb-2">"Only a portion of applicants (approximately 30–40%) will receive funding at [the T2 lottery] stage."</p>
                        <div className="text-xs uppercase font-bold text-tefa-red mb-1">What's wrong (severely understated)</div>
                        <ul className="list-disc ml-5 text-tefa-body/80 space-y-1 text-xs">
                            <li>The Apr 28 PDF empirically pegs the T1-family block at <strong>~$415M</strong>; another ~$85M comes off for the SB 2 admin cap + appeals reserve, leaving <strong>~$500M</strong> for T2. At the central 77/23 setting mix, the T2 lottery funds at <strong>~{tier2FundingRate.toFixed(1)}%</strong> — well above the 30–40% range the archdiocese cited.</li>
                            <li>Even the conservative all-private floor scenario funds T2 at ~{((analysis.t2LotteryCapacityFloor / analysis.demandT2) * 100).toFixed(0)}%. The archdiocese was directionally wrong: T2 in Year 1 is overwhelmingly funded, not the other way around. Earlier versions of this planner ($640.7M T1-family derivation → 47%) also understated.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <div className="text-xs uppercase font-bold text-amber-700 mb-2">Claim (Archdiocese TEFA bulletin — since confirmed by Comptroller)</div>
                        <p className="text-tefa-body/80 italic mb-2">"All awarded families must select a school and have their enrollment confirmed by July 15."</p>
                        <div className="text-xs uppercase font-bold text-tefa-green mb-1">Archdiocese was right — superseded correction</div>
                        <ul className="list-disc ml-5 text-tefa-body/80 space-y-1 text-xs">
                            <li>The Apr 22 Comptroller press release states plainly: <em>"Students who receive awards will have until July 15 to confirm enrollment in a participating private school, select homeschool/other (which qualifies them for $2,000 in funding) or opt out of the program."</em></li>
                            <li>An earlier version of this planner claimed Jul 15 was selection-only and Jul 31 was confirmation. That was wrong — <strong>Jul 15 is the hard family-side deadline for confirm / opt-out</strong>. Jul 31 is the school-side confirmation of those selections, not a family action.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-300">
                        <div className="text-xs uppercase font-bold text-amber-700 mb-2">Claim (Archdiocese TEFA bulletin)</div>
                        <p className="text-tefa-body/80 italic mb-2">"Applicants in Priority Tiers 3 and 4 are not expected to receive funding this year."</p>
                        <div className="text-xs uppercase font-bold text-tefa-red mb-1">What's wrong (T3 is materially funded; T4 is correct)</div>
                        <ul className="list-disc ml-5 text-tefa-body/80 space-y-1 text-xs">
                            <li>For T4 in Year 1: correct — effectively 0%.</li>
                            <li>For T3: <strong>materially funded.</strong> Under the Apr 28 PDF empirical recalibration (T1-family at $415M, T2 at the 77/23 setting mix), the T2 backlog ahead of T3 collapses to ~{analysis.unfundedT2.toLocaleString()} students. Attrition cascades much faster: T3 sits at <strong>~{analysis.effectiveTier3Rate.toFixed(1)}% individual / ~{analysis.effectiveFamilyRate.toFixed(1)}% for a 3-child family at the central 15% attrition rate</strong>, rising to ~{scenarioOutlook.best.effectiveFamilyRate.toFixed(0)}% family at 25% attrition. The archdiocese guidance was correct under earlier (lower-capacity) models but the Apr 28 PDF moved the goalposts substantially.</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-amber-100 rounded-lg text-xs text-amber-900 border border-amber-300">
                    <strong>Sources:</strong> Texas Comptroller, <em>TEFA Application Insights: Year 1</em> (Apr 2026), pages 5 &amp; 8 · Comptroller Apr 2 press release · Comptroller Apr 22 press release · <strong>TEFA Lottery Update PDF (Apr 28, 2026)</strong> with empirical tier counts (27,050 T1 / 15,592 siblings / 72,927 T2 / 66,119 T3 / 13,246 T4a / 53,704 T4b), May 11 waitlist-position date, and two-track Jun 1/Jul 15 family deadlines · SB 2 §29.3521(c-1), §29.3521(d), §29.361(a)(1).
                </div>
            </div>

            {/* Enrollment Status Card */}
            <div className="bg-tefa-sky/10 p-6 rounded-lg shadow-md border border-tefa-navy/20">
                <h2 className="text-xl font-bold flex items-center gap-2 text-tefa-navy mb-4">
                    <Shield size={20} /> Enrollment Status
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-green/20">
                        <span className="text-tefa-body/60 font-medium">Enrollment</span>
                        <span className="font-bold text-tefa-green text-lg">Enrolled (3/3)</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Paid $690 on April 2</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-green/20">
                        <span className="text-tefa-body/60 font-medium">NBCA Financial Aid</span>
                        <span className="font-bold text-green-600 text-lg">$16,200 Granted</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Cassius $5,850 / Dorothy $5,600 / Sebastian $4,750</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">TEFA Notification</span>
                        <span className="font-bold text-tefa-navy text-lg">Waitlist Position: by May 11</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Iddings (T3) ranked position notified by May 11 (Apr 28 PDF)</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">NBCA Scholarship</span>
                        <span className="font-bold text-tefa-navy text-lg">End of April</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Depends on TEFA outcome</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">Withdraw penalty-free by</span>
                        <span className="font-bold text-tefa-navy text-lg">June 30</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Full refund except $690 enrollment fee</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">No tuition due until</span>
                        <span className="font-bold text-tefa-navy text-lg">July</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">First payment</span>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-tefa-navy/5 rounded-lg text-xs text-tefa-body/70">
                    <strong>Sunk cost:</strong> $690 enrollment fee (non-refundable). All other costs can be avoided by withdrawing before June 30. Per the Apr 28 Lottery Update PDF, the <strong>Jul 15 opt-in deadline</strong> for the August-funding track is the largest single attrition event of Year 1 — but it falls ~2 weeks AFTER the Jun 30 NBCA withdrawal deadline. The Iddings family knows their ranked waitlist position by May 11 (Apr 28 PDF), which is the sharpest available signal before Jun 30.
                </div>
            </div>

            {/* Cost Calculator */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-tefa-navy mb-4">
                    <DollarSign size={20} /> Financial Estimate Calculator
                    <span className="text-xs font-normal bg-tefa-navy/5 text-tefa-body/60 px-2 py-1 rounded ml-auto">
                        "Most Likely" Scenario Loaded
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {/* Tuition Input */}
                        <div>
                          <label className="text-xs font-bold text-tefa-body/50 uppercase">Gross Annual Tuition (3 Kids)</label>
                          <div className="flex items-center mt-1">
                            <span className="text-tefa-body/40 mr-2">$</span>
                            <input
                              type="number"
                              value={tuition}
                              onChange={(e) => setTuition(Number(e.target.value))}
                              className="w-full bg-tefa-light border border-gray-200 rounded p-2 font-mono font-bold text-right"
                            />
                          </div>
                        </div>

                        {/* TEFA Toggle */}
                        <div className="p-3 bg-tefa-navy/5 rounded-lg border border-tefa-navy/10 relative overflow-hidden">
                          <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="font-bold text-tefa-navy flex items-center gap-2">
                                    TEFA Voucher
                                    <span className={`text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${analysis.effectiveFamilyRate > 80 ? 'bg-green-500' : analysis.effectiveFamilyRate > 50 ? 'bg-tefa-gold' : analysis.effectiveFamilyRate > 10 ? 'bg-amber-500' : 'bg-red-500'}`}>{analysis.effectiveFamilyRate > 80 ? 'Excellent' : analysis.effectiveFamilyRate > 50 ? 'Good' : analysis.effectiveFamilyRate > 10 ? 'Possible' : 'Unlikely'} ({analysis.effectiveFamilyRate.toFixed(1)}%)</span>
                                </div>
                                <div className="text-xs text-tefa-navy/70 mt-1">3 x $10,474 (Est)</div>
                                <div className="text-[10px] text-tefa-navy/50 mt-2 flex items-center gap-1">
                                    <Briefcase size={10}/> Paid to Digital Wallet
                                </div>
                                <div className="text-[10px] text-tefa-red mt-1 flex items-center gap-1">
                                    <AlertCircle size={10}/> Tier 3 waitlisted — Apr 28 PDF lifts T3 odds materially
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" checked={includeTefa} onChange={() => setIncludeTefa(!includeTefa)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tefa-navy"></div>
                            </label>
                          </div>
                        </div>

                        {/* ACE Toggle */}
                        <div className="p-3 bg-tefa-red/5 rounded-lg border border-tefa-red/10">
                          <div className="flex items-start justify-between">
                            <div>
                                <div className="font-bold text-tefa-red flex items-center gap-2">
                                    ACE Scholarship
                                    <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Low ({'<'}10%)</span>
                                </div>
                                <div className="text-xs text-tefa-red/70 mt-1">Needs-based (~$10k Max)</div>
                                <div className="text-[10px] text-tefa-red/50 mt-2 flex items-center gap-1">
                                    <GraduationCap size={10}/> Paid to School
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" checked={includeAce} onChange={() => setIncludeAce(!includeAce)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tefa-red"></div>
                            </label>
                          </div>
                        </div>

                        {/* NBCA Financial Aid - Granted */}
                        <div className="p-3 bg-tefa-green/10 rounded-lg border border-tefa-green/30">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-tefa-green flex items-center gap-2">
                                <Percent size={14}/> NBCA Fin. Aid
                                <span className="text-[10px] bg-tefa-green text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Granted</span>
                            </div>
                            <div className="text-xs font-bold text-tefa-green bg-white px-2 py-0.5 rounded border border-tefa-green/30">
                              $16,200
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-tefa-green/80">
                            <div className="flex justify-between"><span>Cassius:</span><span className="font-bold">$5,850</span></div>
                            <div className="flex justify-between"><span>Dorothy:</span><span className="font-bold">$5,600</span></div>
                            <div className="flex justify-between"><span>Sebastian:</span><span className="font-bold">$4,750</span></div>
                          </div>
                          <div className="text-[10px] text-tefa-green/80 mt-2">
                                Credited to Tuition
                          </div>
                        </div>

                        {/* NBCA Scholarship Slider */}
                        <div className="p-3 bg-tefa-green/5 rounded-lg border border-tefa-green/10">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-tefa-green flex items-center gap-2">
                                <GraduationCap size={14}/> NBCA Scholarship
                                <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Pending End of Apr</span>
                            </div>
                            <div className="text-xs font-bold text-tefa-green/70 bg-white px-2 py-0.5 rounded border border-tefa-green/20">
                              ${nbcaScholarshipAmount.toLocaleString()}
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="15000"
                            step="100"
                            value={nbcaScholarshipAmount}
                            onChange={(e) => setNbcaScholarshipAmount(Number(e.target.value))}
                            className="w-full h-2 bg-tefa-green/20 rounded-lg appearance-none cursor-pointer accent-tefa-green"
                          />
                          <div className="flex justify-between text-xs text-tefa-green/60 mt-1 font-medium">
                            <span>$0</span>
                            <span>$15k Max</span>
                          </div>
                          <div className="text-[10px] text-tefa-green/80 mt-1">
                                Credited to Tuition
                          </div>
                          <div className="text-[10px] text-amber-600 mt-1 font-medium">
                                NBCA calculates scholarship after TEFA decision — either/or, not both
                          </div>
                        </div>

                      </div>

                      {/* Results Column */}
                      <div className="bg-tefa-light p-6 rounded-lg border border-gray-200 flex flex-col justify-center h-full">
                        <h3 className="text-tefa-body/60 font-bold uppercase text-xs mb-4">Estimated Breakdown</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-tefa-body/60">
                              <span>Tuition Total:</span>
                              <span>${tuition.toLocaleString()}</span>
                            </div>
                            {includeTefa && (
                              <div className="flex justify-between text-sm text-tefa-navy font-medium bg-tefa-navy/5 px-2 py-1 rounded">
                                <span>TEFA Credit:</span>
                                <span>-${totalTefa.toLocaleString()}</span>
                              </div>
                            )}
                            {includeAce && (
                              <div className="flex justify-between text-sm text-tefa-red font-medium bg-tefa-red/5 px-2 py-1 rounded">
                                <span>ACE Credit:</span>
                                <span>-${totalAce.toLocaleString()}</span>
                              </div>
                            )}
                             {nbcaAidAmount > 0 && (
                              <div className="flex justify-between text-sm text-tefa-green/80 font-medium bg-tefa-green/5 px-2 py-1 rounded">
                                <span>NBCA Aid:</span>
                                <span>-${nbcaAidAmount.toLocaleString()}</span>
                              </div>
                            )}
                            {nbcaScholarshipAmount > 0 && (
                              <div className="flex justify-between text-sm text-tefa-green/80 font-medium bg-tefa-green/5 px-2 py-1 rounded">
                                <span>Scholarship:</span>
                                <span>-${nbcaScholarshipAmount.toLocaleString()}</span>
                              </div>
                            )}
                        </div>

                        <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-auto">
                            <div className="flex justify-between items-end">
                              <span className="font-bold text-tefa-navy">Est. Annual Cost</span>
                              <span className={`text-3xl font-bold ${finalCost <= 5000 ? 'text-green-600' : 'text-tefa-navy'}`}>
                                ${finalCost > 0 ? finalCost.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                              </span>
                            </div>
                            <div className="text-right text-sm text-tefa-body/50 mt-1 font-medium">
                              approx ${Math.max(0, monthlyCost).toFixed(0)} / month (10-mo)
                            </div>
                            {finalCost < 0 && (
                              <div className="flex justify-between items-center mt-3 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                <span className="font-bold text-green-700 text-sm">Remainder (uniforms, supplies, etc.)</span>
                                <span className="text-lg font-bold text-green-600">${Math.abs(finalCost).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                              </div>
                            )}
                        </div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {activeTab === 'timeline' && (() => {
          const today = new Date().toISOString().slice(0, 10);
          const nextUpIdx = timelineEvents.findIndex(evt => evt.isoDate >= today);
          return (
          <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-tefa-navy flex items-center gap-2">
                <Calendar /> Funding Timeline & Method
              </h2>
              <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {timelineEvents.map((evt, idx) => {
                  const isPast = evt.isoDate < today;
                  const isNext = idx === nextUpIdx;
                  return (
                  <div key={idx} className={`relative pl-8 ${isPast ? 'opacity-50' : ''}`}>
                    {/* Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm
                      ${isPast ? 'bg-gray-300' :
                        isNext ? 'bg-tefa-navy ring-4 ring-tefa-sky/40' :
                        evt.type === 'nbca' ? 'bg-tefa-green' :
                        evt.type === 'tefa' ? 'bg-tefa-navy' :
                        evt.type === 'ace' ? 'bg-tefa-red' : 'bg-tefa-gold'}`}
                    />

                    <div className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition grid grid-cols-1 md:grid-cols-12 gap-4 ${isNext ? 'border-tefa-navy/30 ring-1 ring-tefa-sky/30' : 'border-gray-100'}`}>
                      <div className="md:col-span-3">
                        {isNext && (
                          <span className="text-[10px] font-bold bg-tefa-green text-white px-2 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">Up Next</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide block w-fit mb-1
                           ${evt.type === 'nbca' ? 'bg-tefa-green/10 text-tefa-green' :
                             evt.type === 'tefa' ? 'bg-tefa-navy/10 text-tefa-navy' :
                             evt.type === 'ace' ? 'bg-tefa-red/10 text-tefa-red' : 'bg-tefa-gold/20 text-tefa-gold'}`}>
                          {evt.type}
                        </span>
                        <span className="text-sm font-bold text-tefa-body/50">{evt.day}, {evt.date}</span>
                      </div>
                      <div className="md:col-span-6">
                        <h3 className="font-bold text-tefa-navy">{evt.event}</h3>
                        <p className="text-sm text-tefa-body/70 mt-1">{evt.desc}</p>
                        {evt.link && (
                          <a
                            href={evt.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-tefa-navy hover:text-tefa-red mt-2"
                          >
                            <ExternalLink size={12}/> {evt.link.label}
                          </a>
                        )}
                      </div>
                      <div className="md:col-span-3 flex items-center">
                         <div className="text-xs font-medium text-tefa-body/60 bg-tefa-light px-3 py-2 rounded border border-gray-100 w-full text-center">
                            <span className="block uppercase text-[10px] text-tefa-body/50 mb-1">Funding Method</span>
                            {evt.funding}
                         </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
          </div>
          );
        })()}

        {/* CHECKLIST VIEW */}
        {activeTab === 'checklist' && (
          <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-tefa-navy flex items-center gap-2">
                <CheckSquare /> Application Checklist
              </h2>

              <div className="bg-tefa-gold/10 p-4 rounded-lg border border-tefa-gold/30 text-sm text-tefa-red flex items-start gap-3 mb-6">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>
                  <strong>Note:</strong> Main applications are checked off. Focus on supporting documents (Tax returns, Recommendations).
                </p>
              </div>

              {Object.entries(checklist).map(([key, section]) => (
                <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`px-4 py-3 font-bold flex justify-between items-center ${section.color}`}>
                    {section.title}
                    <span className="text-xs bg-white/50 px-2 py-1 rounded">
                      {section.items.filter(i => i.done).length}/{section.items.length}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(key, item.id)}
                        className="p-3 flex items-start gap-3 hover:bg-tefa-light cursor-pointer transition"
                      >
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition
                          ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                          {item.done && <CheckCircle size={14} />}
                        </div>
                        <span className={`text-sm ${item.done ? 'text-tefa-body/50 line-through' : 'text-tefa-navy'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ESSAYS VIEW */}
        {activeTab === 'essays' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-tefa-navy flex items-center gap-2">
              <FileText /> Application Text & Essays
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {Object.values(applicationTexts).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-tefa-light px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-tefa-navy">{item.title}</h3>
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="text-xs flex items-center gap-1 bg-white border border-gray-200 hover:bg-tefa-light text-tefa-body/70 px-2 py-1 rounded transition"
                    >
                      <Copy size={12} /> Copy Text
                    </button>
                  </div>
                  <div className="p-4 bg-tefa-light/30">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-tefa-navy leading-relaxed">
                      {item.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYSIS VIEW */}
        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-tefa-navy flex items-center gap-2">
              <BarChart2 /> Strategic Financial Analysis Report
            </h2>

            {/* Official Applicant Figures */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-bold text-tefa-navy mb-3 flex items-center gap-2">
                    <Layers size={18}/> Official Applicant Pool (Year 1 PDF)
                </h3>
                <div className="text-sm text-tefa-body/70">
                    <strong>{TOTAL_APPLICATIONS.toLocaleString()}</strong> total applications · <strong>{ELIGIBLE_APPLICATIONS.toLocaleString()}</strong> eligible ({(INELIGIBILITY_RATE * 100).toFixed(1)}% ineligible) — per the Apr 28, 2026 TEFA Lottery Update PDF (empirical tier breakdown).
                </div>
                <div className="mt-1 text-xs text-tefa-body/50">
                    Pre-K accounts for most ineligibility (18,677 of 36,666 per the Apr 8 Year 1 PDF); K-12 ineligibility is much lower.
                </div>


                {/* Attrition / Non-Participation Rate */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-tefa-navy">Estimated Non-Participation Rate (Attrition)</label>
                        <span className="text-sm font-bold text-tefa-navy">{Math.round(attritionRate * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={Math.round(attritionRate * 100)}
                        onChange={(e) => setAttritionRate(parseInt(e.target.value) / 100)}
                        className="w-full accent-tefa-navy"
                    />
                    <div className="flex justify-between text-xs text-tefa-body/50 mt-1">
                        <span>0%</span>
                        <span>15%</span>
                        <span>30%</span>
                    </div>
                    <div className="mt-2 text-sm text-tefa-body/70">
                        Est. {Math.round(attritionRate * 100)}% of lottery winners won't follow through → freed spots cascade to waitlist
                    </div>
                    <div className="mt-1 text-xs text-tefa-body/50">
                        School choice programs typically see 10-30% non-participation. Reasons: can't afford tuition gap, no nearby school, life changes, applied "just in case." Spots freed go to waitlist in tier order.
                    </div>

                    {/* Historical Attrition Benchmarks */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-tefa-body/50 uppercase font-bold mb-2">Historical Benchmarks — Why 15% Is Conservative</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-tefa-body/50">
                                        <th className="py-2 pr-3 font-bold">Program</th>
                                        <th className="py-2 pr-3 font-bold">Attrition</th>
                                        <th className="py-2 font-bold">Primary Drivers</th>
                                    </tr>
                                </thead>
                                <tbody className="text-tefa-body/70">
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 pr-3 font-medium">Milwaukee Parental Choice</td>
                                        <td className="py-2 pr-3 font-bold text-red-600">30%</td>
                                        <td className="py-2">School closures, logistical hurdles, no transportation</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 pr-3 font-medium">NYC Voucher (Year 3)</td>
                                        <td className="py-2 pr-3 font-bold text-red-600">38%</td>
                                        <td className="py-2">Unmanageable tuition gaps, transport issues</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 pr-3 font-medium">D.C. Opportunity Scholarship</td>
                                        <td className="py-2 pr-3 font-bold text-amber-600">14.3%</td>
                                        <td className="py-2">Couldn't find suitable school, waitlist fatigue</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2 pr-3 font-medium">Virginia Pre-K Initiative</td>
                                        <td className="py-2 pr-3 font-bold text-red-600">20–34%</td>
                                        <td className="py-2">State budget forecasting rate — lack of local capacity</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-3 font-medium">Queueing Theory Baseline</td>
                                        <td className="py-2 pr-3 font-bold text-amber-600">8–10%</td>
                                        <td className="py-2">Minimum renege rate in constrained waitlist environments</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-2 text-[10px] text-tefa-body/40">
                            Sources: ERIC ED472999 (Milwaukee), AEA (NYC), Hoover Institution (D.C.), VA Budget Bills (VPI), Kanoria (queueing theory)
                        </div>
                    </div>

                    {/* Tuition Gap / Sticker Shock */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-tefa-body/50 uppercase font-bold mb-2">Tuition Gap — The "Sticker Shock" Driver</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-tefa-navy/5 rounded p-3">
                                <div className="text-tefa-body/50 mb-1">TEFA Max Award</div>
                                <div className="font-bold text-tefa-navy text-lg">$10,474</div>
                            </div>
                            <div className="bg-red-50 rounded p-3">
                                <div className="text-tefa-body/50 mb-1">NBCA Actual Cost (w/ fees)</div>
                                <div className="font-bold text-red-600 text-lg">~$14,000+</div>
                                <div className="text-[10px] text-tefa-body/40 mt-1">Tuition $12,350–$13,650 + app/tech/uniform fees</div>
                            </div>
                            <div className="bg-amber-50 rounded p-3">
                                <div className="text-tefa-body/50 mb-1">Residual Gap Per Child</div>
                                <div className="font-bold text-amber-600 text-lg">$3,000–3,500</div>
                                <div className="text-[10px] text-tefa-body/40 mt-1">~$10,000 for 3 children</div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-tefa-body/60">
                            {analysis.demandT2.toLocaleString()} Tier 2 applicants (under 200% FPL) face this gap at most private schools. Low-income families are highly price-elastic — many applied "just in case" and will renege upon discovering the residual bill. National avg private tuition: $12,790 (elementary) to $16,420 (high school). This sticker shock is the primary engine driving attrition above the 10% queueing-theory baseline.
                        </div>
                    </div>
                </div>

                {/* Scenario Result — After Attrition / Waitlist */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="text-xs text-tefa-body/50 uppercase font-bold mb-3">Projected Outcome (incl. {Math.round(attritionRate * 100)}% Attrition &amp; Waitlist Cascade)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-xs text-tefa-body/50">Per-Child (Tier 3)</div>
                            <div className={`text-2xl font-bold ${analysis.effectiveTier3Rate > 80 ? 'text-green-600' : analysis.effectiveTier3Rate > 50 ? 'text-amber-500' : analysis.effectiveTier3Rate > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                {analysis.effectiveTier3Rate.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-tefa-body/50">Family (Sibling Rule)</div>
                            <div className={`text-2xl font-bold ${analysis.effectiveFamilyRate > 80 ? 'text-green-600' : analysis.effectiveFamilyRate > 50 ? 'text-amber-500' : analysis.effectiveFamilyRate > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                {analysis.effectiveFamilyRate.toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-tefa-body/50">Program Capacity</div>
                            <div className="text-2xl font-bold text-tefa-navy">
                                ~{analysis.capacity.toLocaleString()}
                            </div>
                            <div className="text-xs text-tefa-body/60 mt-1">
                                +{analysis.t3FromWaitlist.toLocaleString()} waitlist → T3
                            </div>
                        </div>
                    </div>
                    {analysis.t3FromWaitlist > 0 && (
                        <div className="mt-3 text-xs text-tefa-body/60 bg-tefa-sky/10 rounded p-3">
                            <strong>Cascade:</strong> {analysis.t1Attrition.toLocaleString()} T1 + {analysis.t2Attrition.toLocaleString()} T2 winners don't participate
                            → {analysis.additionalT2Funded.toLocaleString()} unfunded T2 backfilled
                            → {analysis.additionalT2Attrition.toLocaleString()} of those also drop
                            → <strong>{analysis.t3FromWaitlist.toLocaleString()}</strong> spots reach T3
                        </div>
                    )}
                    {analysis.t3FromWaitlist === 0 && analysis.unfundedT2 > 0 && (
                        <div className="mt-3 text-xs text-tefa-body/60 bg-red-50 rounded p-3">
                            <strong>Cascade blocked:</strong> {(analysis.t1Attrition + analysis.t2Attrition).toLocaleString()} spots freed by T1/T2 attrition,
                            but {analysis.unfundedT2.toLocaleString()} unfunded T2 students are ahead on the waitlist and absorb all freed spots.
                            {analysis.additionalT2Attrition > 0 && ` (${analysis.additionalT2Attrition.toLocaleString()} second-round T2 attrition spots also absorbed.)`}
                        </div>
                    )}
                </div>
            </div>

            {/* Scenario Outlook Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-tefa-navy mb-2 flex items-center gap-2">
                    <TrendingUp size={18}/> Tier 3 Outlook — Iddings Family
                </h3>
                <p className="text-xs text-tefa-body/60 mb-2">
                    Eligibility is fixed at 9.9% (per PDF — official). The variable here is <strong>attrition</strong>: the percentage of T1/T2 lottery winners who don't follow through on enrollment. Their freed spots cascade: T1/T2 dropouts → backfill unfunded T2 → overflow reaches T3.
                </p>
                <div className="bg-tefa-navy/5 rounded p-3 mb-4 text-xs text-tefa-body/70">
                    <strong>Critical Threshold:</strong> only ~{scenarioOutlook.mostLikely.unfundedT2.toLocaleString()} unfunded T2 students sit ahead of T3 (central 77/23 setting mix) — a much smaller backlog than under prior capacity models. Even modest attrition cascades quickly past this threshold, which is why T3 odds jump non-trivially across all three scenarios. The cascade is still non-linear in attrition rate, but the inflection point now sits well below 8%.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-xs text-green-800 uppercase font-bold mb-1">Best Case (25% Attrition)</div>
                        <div className="text-xs text-green-700 mb-2">Timeline delays + sticker shock among low-income T2 → mass non-participation (mirrors Milwaukee 30%, Virginia 25-34%)</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-green-700">{scenarioOutlook.best.effectiveFamilyRate.toFixed(1)}%</div>
                            <div className="text-xs text-green-600">family rate</div>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            Per-child: {scenarioOutlook.best.effectiveTier3Rate.toFixed(1)}% · +{scenarioOutlook.best.t3FromWaitlist.toLocaleString()} spots reach T3
                        </div>
                        <div className="text-xs text-green-600">{scenarioOutlook.best.effectiveFundedT3.toLocaleString()} / {scenarioOutlook.best.demandT3.toLocaleString()} T3 funded</div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-300">
                        <div className="text-xs text-amber-800 uppercase font-bold mb-1">Most Likely (15% Attrition)</div>
                        <div className="text-xs text-amber-700 mb-2">Conservative baseline — D.C. Opportunity Scholarship saw 14.3%, and TEFA has greater friction (new platform, tuition gaps, CAIR delay)</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-amber-700">{scenarioOutlook.mostLikely.effectiveFamilyRate.toFixed(1)}%</div>
                            <div className="text-xs text-amber-600">family rate</div>
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                            Per-child: {scenarioOutlook.mostLikely.effectiveTier3Rate.toFixed(1)}% · +{scenarioOutlook.mostLikely.t3FromWaitlist.toLocaleString()} spots reach T3
                        </div>
                        <div className="text-xs text-amber-600">{scenarioOutlook.mostLikely.effectiveFundedT3.toLocaleString()} / {scenarioOutlook.mostLikely.demandT3.toLocaleString()} T3 funded</div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-xs text-red-800 uppercase font-bold mb-1">Worst Case (8% Attrition)</div>
                        <div className="text-xs text-red-700 mb-2">Abnormally low — most T1/T2 winners already in low-cost parochial schools, voucher merely supplants existing tuition</div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold text-red-700">{scenarioOutlook.worst.effectiveFamilyRate.toFixed(1)}%</div>
                            <div className="text-xs text-red-600">family rate</div>
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                            Per-child: {scenarioOutlook.worst.effectiveTier3Rate.toFixed(1)}% · +{scenarioOutlook.worst.t3FromWaitlist.toLocaleString()} spots reach T3
                        </div>
                        <div className="text-xs text-red-600">{scenarioOutlook.worst.effectiveFundedT3.toLocaleString()} / {scenarioOutlook.worst.demandT3.toLocaleString()} T3 funded</div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-tefa-navy/5 rounded-lg text-xs text-tefa-body/70 space-y-2">
                    <div>
                        <strong>Sibling Rule Formula:</strong>{' '}
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                            P(family) = 1 - (1 - P<sub>child</sub>)<sup>3</sup>
                        </span>
                        {' '}— three independent draws from the Tier 3 waitlist pool. One win funds all three children automatically.
                    </div>
                    <div>
                        <strong>Non-linear dynamics:</strong> Under the Apr 28 PDF empirical $415M T1-family allocation and the central 77/23 T2 setting mix, only ~{scenarioOutlook.mostLikely.unfundedT2.toLocaleString()} unfunded T2 students sit ahead of T3 — a much smaller backlog than the prior $640.7M-derivation model showed. Attrition cascades to T3 across all three scenarios; the previous "explosive non-linearity" framing is softened.
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-tefa-navy text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Iddings Family Funding Strategy</h3>
                        <p className="text-tefa-sky/70 text-sm">Dual Model Analysis — Comptroller's Rules vs. SB 2 Text — April 2026</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="prose prose-sm max-w-none text-tefa-navy">
                        <h3 className="font-bold text-tefa-navy text-lg mb-2">1. The Projection Model</h3>
                        <p className="mb-4">
                            <strong>{TOTAL_APPLICATIONS.toLocaleString()}</strong> students applied in Year 1. The Apr 28, 2026 TEFA Lottery Update PDF
                            now provides empirical tier counts (replacing the percentage-derived estimates from the Apr 8 Year 1 PDF).
                            The application window closed <strong>March 31 at 11:59 PM CT</strong> per a federal court order (Judge Bennett, S.D. Texas).
                            More than 2,300 participating schools are listed in the school finder tool, including a growing number of accredited online schools.
                        </p>
                        <p className="mb-4">
                            <strong>Not all applicants are eligible.</strong> The Apr 28 PDF reports <strong>{INELIGIBLE_APPLICATIONS.toLocaleString()}</strong> ineligible applications
                            ({(INELIGIBILITY_RATE * 100).toFixed(1)}% of total). Pre-K has the highest ineligibility rate (50%+, with 18,677 of 36,666 pre-K apps ineligible per the Apr 8 PDF),
                            while K-12 is much lower. This leaves <strong>{ELIGIBLE_APPLICATIONS.toLocaleString()}</strong> eligible applicants competing for funding.
                        </p>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">2. Supply vs. Demand</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li><strong>Statutory Budget Cap:</strong> $1 Billion for 2025–2027 biennium (SB 2, §29.3521(c-1))</li>
                            <li><strong>Year 1 Commitment:</strong> Full $1B (Comptroller administrative choice — Travis Pillow, Apr 2: "$1 billion committed in year one")</li>
                            <li><strong>Per-Student Base:</strong> $10,474 (SB 2 §29.361(a)(1) — 85% × statewide avg M&amp;O per ADA)</li>
                            <li><strong>Homeschool/other:</strong> $2,000/yr (SB 2 §29.361(b-1)). Setting <em>locks</em> at application close (Mar 31); post-lock changes can only reduce funding, never increase.</li>
                            <li><strong>SPED supplement:</strong> Up to $30,000 with a TEA-confirmed current IEP (SB 2 §29.361(b)). Note: T1 priority does NOT automatically grant SPED supplement — the Parent Application Guide formalizes a "Prioritization Only" sub-class for disability-documented students without a TEA-electronic IEP match.</li>
                            <li><strong>T4 statutory cap:</strong> 20% of program funds (Parent Guide page 4) — $200M ceiling on T4 in Year 1; not load-bearing here since T4 gets $0 anyway.</li>
                            <li><strong>First-Round Awards (Apr 28 PDF):</strong> <strong>{analysis.firstRoundAwards.toLocaleString()}</strong> (T1 family) — {analysis.fundedT1.toLocaleString()} T1 students + {analysis.siblingsFunded.toLocaleString()} T1 siblings via the sibling rule. T1-family allocation: <strong>~$415M</strong> (Apr 28 PDF item 1, verbatim).</li>
                            <li><strong>Derived Capacity (central, Apr 28–calibrated):</strong> ~{analysis.capacity.toLocaleString()} students. Floor (all-private): ~{(analysis.firstRoundAwards + analysis.t2LotteryCapacityFloor).toLocaleString()}.</li>
                            <li><strong>Eligible Applicants:</strong> {analysis.eligibleApps.toLocaleString()} of {TOTAL_APPLICATIONS.toLocaleString()} ({INELIGIBLE_APPLICATIONS.toLocaleString()} ineligible per Apr 28 PDF)</li>
                        </ul>
                        <div className="mb-4 p-3 bg-tefa-navy/5 border border-tefa-navy/20 rounded text-xs text-tefa-body/70">
                            <div className="font-bold text-tefa-navy mb-1">Capacity Derivation (Apr 28 PDF empirical T1-family + 77/23 T2 setting mix):</div>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Step 1 — T1 family block (empirical):</strong> Apr 28 PDF item 1, verbatim: <em>"all eligible tier 1 applicants and siblings will qualify for funding of approximately $415 million."</em> {analysis.firstRoundAwards.toLocaleString()} students at an avg ~${Math.round(analysis.t1FamilyCost / analysis.firstRoundAwards).toLocaleString()}/student. Reliable because the Parent Application Guide establishes that educational setting (private $10,474 vs. homeschool $2,000) <em>locks</em> at application close (Mar 31) — the program knew the exact per-student cost at lottery time.</li>
                                <li><strong>Step 2 — T2/T3 blended cost:</strong> T2 (≤200% FPL) and T3 (200-500% FPL) both have no SPED supplement by tier definition. Per-student cost depends only on setting. Apr 8 PDF reports the overall application setting split as 77% private / 23% homeschool. Blended cost = 0.77 × $10,474 + 0.23 × $2,000 ≈ <strong>${analysis.perStudentT2Blended.toLocaleString()}/student</strong>.</li>
                                <li><strong>Step 3 — Admin/reserve:</strong> SB 2 §29.361(b)-(c) allows up to 3% for Comptroller administration plus up to 5% for certified educational assistance organizations ($80M total cap); the Apr 28 PDF item 5 confirms an appeals reserve (~$5M placeholder). Both come off the top: <strong>${(analysis.programOverhead / 1e6).toFixed(0)}M total</strong>.</li>
                                <li><strong>Step 4 — T2 lottery pool:</strong> Remaining <strong>~${(analysis.t2Budget / 1e6).toFixed(0)}M</strong> ($1B − $415M − ${(analysis.programOverhead / 1e6).toFixed(0)}M) funds T2 at the blended rate → <strong>{analysis.fundedT2.toLocaleString()}</strong> T2 lottery slots (central). Floor sensitivity (100% private): {analysis.t2LotteryCapacityFloor.toLocaleString()} slots.</li>
                                <li><strong>Total capacity:</strong> {analysis.firstRoundAwards.toLocaleString()} + {analysis.fundedT2.toLocaleString()} ≈ <strong>{analysis.capacity.toLocaleString()}</strong> students central / ~{(analysis.firstRoundAwards + analysis.t2LotteryCapacityFloor).toLocaleString()} floor.</li>
                                <li><strong>Why this supersedes the prior $640.7M derivation:</strong> The earlier model assumed all 27,050 T1 students received the $17,650 IEP-blended rate. Reality (per the Parent Guide's "Prioritization Only" sub-class + the Apr 8 PDF's 8,618 IEP-active count + 77/23 setting split) reconciles the $415M PDF figure within ~1%: most T1 students receive only the base rate, and ~23% homeschool dramatically lowers the per-student cost.</li>
                                <li><strong>Appeals reserve:</strong> Per Apr 28 PDF item 5, the program holds a reserve for successful appeals. Unused reserve cascades to the waitlist — small upside vector, not baseline.</li>
                                <li><strong>Cross-check:</strong> At ~{analysis.capacity.toLocaleString()} central capacity, T1-family fully funds, T2 ({analysis.demandT2.toLocaleString()}) funds at {tier2FundingRate.toFixed(1)}% (lottery), T3 and T4 receive 0 from the initial lottery. Even the floor scenario funds T2 at ~{((analysis.t2LotteryCapacityFloor / analysis.demandT2) * 100).toFixed(0)}% — both consistent with the Apr 2 "funding exhausted within T2" framing, but with a much smaller T2 backlog ahead of T3 than the prior model showed.</li>
                            </ul>
                        </div>

                        <div className="mb-4 p-3 bg-white border border-tefa-navy/20 rounded text-xs">
                            <div className="font-bold text-tefa-navy mb-2">Capacity Sensitivity — T2 Setting Mix</div>
                            <div className="text-tefa-body/70 mb-2">
                                The model now bakes <strong>$85M of admin/reserve assumptions</strong> into the baseline ($80M statutory admin cap per SB 2 §29.361(b)-(c) + $5M appeals reserve estimate per Apr 28 PDF item 5). With the T1-family block fixed at $415M and admin/reserve of $85M, the T2 lottery pool is <strong>${(analysis.t2Budget / 1e6).toFixed(0)}M</strong>. The remaining sensitivity is the educational-setting mix among T2 winners.
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-tefa-navy/5 text-tefa-navy">
                                        <tr>
                                            <th className="px-2 py-1.5 text-left">Scenario</th>
                                            <th className="px-2 py-1.5 text-left">T2 setting mix</th>
                                            <th className="px-2 py-1.5 text-right">Per-student cost</th>
                                            <th className="px-2 py-1.5 text-right">T2 slots</th>
                                            <th className="px-2 py-1.5 text-right">T2 rate</th>
                                            <th className="px-2 py-1.5 text-right">Capacity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-tefa-body/80">
                                        <tr className="bg-tefa-gold/10 font-medium">
                                            <td className="px-2 py-1.5">Central <strong>(baseline)</strong></td>
                                            <td className="px-2 py-1.5">77% private / 23% homeschool</td>
                                            <td className="px-2 py-1.5 text-right font-mono">${analysis.perStudentT2Blended.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{analysis.t2LotteryCapacity.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{tier2FundingRate.toFixed(1)}%</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{analysis.capacity.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-2 py-1.5">Floor (all-private)</td>
                                            <td className="px-2 py-1.5">100% private / 0% homeschool</td>
                                            <td className="px-2 py-1.5 text-right font-mono">$10,474</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{analysis.t2LotteryCapacityFloor.toLocaleString()}</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{((analysis.t2LotteryCapacityFloor / analysis.demandT2) * 100).toFixed(1)}%</td>
                                            <td className="px-2 py-1.5 text-right font-mono">{(analysis.firstRoundAwards + analysis.t2LotteryCapacityFloor).toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-tefa-body/70 mt-2">
                                T2 families specifically applied for tuition support, so the realistic T2 setting mix likely sits closer to the central 77/23 estimate than to the all-private floor. Both rows include the $85M admin/reserve assumption. If actual admin or reserve usage is lower than the statutory cap assumption, capacity grows accordingly — that's an upside vector, not modeled as a separate scenario.
                            </div>
                            <div className="text-tefa-body/60 mt-2 text-[11px] italic">
                                Earlier IEP-scalar sensitivity tables ($14k / $17,650 / $22,769) have been removed — the Apr 28 PDF's empirical $415M T1-family allocation supersedes any IEP-scalar derivation.
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">3. Comptroller's Tier System (How the Lottery Will Actually Run)</h3>
                        <div className="bg-tefa-navy/5 border border-tefa-navy/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-tefa-navy mb-2">
                                <strong>Sibling Rule:</strong> Per the Comptroller's administrative rules, if <em>any one child</em> is accepted in the lottery,
                                all eligible siblings who applied during the same period are <strong>automatically accepted</strong>.
                                Your family effectively gets 3 lottery tickets — one win covers the whole household.
                            </p>
                            <p className="text-xs text-tefa-navy/70">
                                All 3 children (Cassius, Dorothy, Sebastian) are in <strong>Tier 3 (200-500% FPL)</strong> under the Comptroller's implementation,
                                The Comptroller confirmed (Apr 3 email, citing Sec. 29.3521(d)) that public school enrollment only affects Tier 4 priority — not Tiers 1-3.
                            </p>
                        </div>

                        <p className="mb-4">With {analysis.eligibleApps.toLocaleString()} eligible applicants, here is how the $1B budget drains by tier:</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 1 — Disability + ≤500% FPL (incl. siblings)</div>
                                <div className="text-sm text-green-700">
                                    {analysis.demandT1.toLocaleString()} students ({analysis.fundedT1.toLocaleString()} T1 + {analysis.siblingsFunded.toLocaleString()} siblings) — Funded first, 100% funded (Apr 28 PDF: AWARDED &amp; NOTIFIED)
                                </div>
                            </div>
                            <div className={`p-3 border rounded ${tier2FundingRate >= 100 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className={`font-bold ${tier2FundingRate >= 100 ? 'text-green-800' : 'text-amber-800'}`}>Tier 2 — ≤200% FPL</div>
                                <div className={`text-sm ${tier2FundingRate >= 100 ? 'text-green-700' : 'text-amber-700'}`}>
                                    {analysis.demandT2.toLocaleString()} applicants — {tier2FundingRate >= 100 ? '100% funded' : `${tier2FundingRate.toFixed(1)}% funded (${analysis.fundedT2.toLocaleString()} of ${analysis.demandT2.toLocaleString()} — lottery within tier)`}
                                </div>
                            </div>
                            <div className={`p-4 border-2 rounded-lg ${analysis.effectiveTier3Rate === 100 ? 'bg-green-50 border-green-300' : 'bg-tefa-gold/10 border-tefa-gold/40'}`}>
                                <div className={`font-bold text-lg ${analysis.effectiveTier3Rate === 100 ? 'text-green-800' : 'text-tefa-red'}`}>
                                    Tier 3 — 200-500% FPL — All 3 Iddings Children
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Demand</div>
                                        <div className="font-bold">{analysis.demandT3.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Funded (incl. waitlist)</div>
                                        <div className="font-bold">{analysis.effectiveFundedT3.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Per-Child Rate</div>
                                        <div className={`font-bold ${analysis.effectiveTier3Rate > 80 ? 'text-green-600' : analysis.effectiveTier3Rate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {analysis.effectiveTier3Rate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Family Rate (Sibling Rule)</div>
                                        <div className={`font-bold ${analysis.effectiveFamilyRate > 80 ? 'text-green-600' : analysis.effectiveFamilyRate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {analysis.effectiveFamilyRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-tefa-body/60">
                                    Sibling math: P(family) = 1 - P(all 3 lose) = 1 - (1 - {(analysis.effectiveTier3Rate / 100).toFixed(4)})³ = {(analysis.effectiveFamilyRate / 100).toFixed(4)}
                                </div>
                                {analysis.t3FromWaitlist > 0 && (
                                    <div className="mt-2 text-xs text-tefa-body/50">
                                        Initial lottery: {analysis.fundedT3.toLocaleString()} funded ({analysis.tier3Rate.toFixed(1)}%) + {analysis.t3FromWaitlist.toLocaleString()} from waitlist cascade
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier4Rate > 0 ? 'bg-red-50 border-red-200' : 'bg-tefa-light border-gray-200'}`}>
                                <div className={`font-bold ${analysis.tier4Rate > 50 ? 'text-tefa-red' : 'text-tefa-red'}`}>
                                    Tier 4 — ≥500% FPL{' '}
                                    <span className="text-xs font-normal text-tefa-body/60">(4a: prior public school {analysis.demandT4a.toLocaleString()} | 4b: all others {analysis.demandT4b.toLocaleString()})</span>
                                </div>
                                <div className={`text-sm ${analysis.tier4Rate > 50 ? 'text-tefa-red/80' : 'text-tefa-red/80'}`}>
                                    {(analysis.demandT4a + analysis.demandT4b).toLocaleString()} applicants — {analysis.tier4Rate.toFixed(1)}% funded
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">4. Per-Student Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {students.map((student) => (
                                <div key={student.name} className={`p-4 rounded-lg border ${analysis.effectiveFamilyRate > 80 ? 'bg-green-50 border-green-200' : analysis.effectiveFamilyRate > 50 ? 'bg-tefa-gold/10 border-tefa-gold/30' : 'bg-red-50 border-red-200'}`}>
                                    <div className="font-bold text-tefa-navy">{student.name}</div>
                                    <div className="text-xs text-tefa-body/60">{student.grade} — Tier 3</div>
                                    <div className={`text-2xl font-bold mt-2 ${analysis.effectiveTier3Rate > 80 ? 'text-green-600' : analysis.effectiveTier3Rate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {analysis.effectiveTier3Rate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-tefa-body/50 mt-1">
                                        Public school history: no effect on Tier 3 (confirmed Apr 3)
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`p-4 rounded-lg border-2 mb-6 ${analysis.effectiveFamilyRate > 80 ? 'bg-green-50 border-green-300' : analysis.effectiveFamilyRate > 50 ? 'bg-tefa-gold/10 border-tefa-gold/40' : 'bg-red-50 border-red-300'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold">Family Probability (All 3 Funded via Sibling Rule)</div>
                                    <div className="text-xs text-tefa-body/60 mt-1">1 win in Tier 3 lottery or waitlist = all 3 children automatically accepted</div>
                                </div>
                                <div className={`text-4xl font-bold ${analysis.effectiveFamilyRate > 80 ? 'text-green-600' : analysis.effectiveFamilyRate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {analysis.effectiveFamilyRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">5. Comptroller Email Exchange (Apr 3)</h3>
                        <div className="bg-tefa-sky/10 border border-tefa-sky/30 rounded-lg p-4 mb-4">
                            <p className="text-xs text-tefa-body/60 mb-3">
                                Sent to tefa@cpa.texas.gov on Apr 3 regarding SB 2 public school enrollment interpretation for Tier 3 families.
                            </p>
                            <div className="bg-white rounded p-4 border border-gray-200 text-sm text-tefa-body mb-3">
                                <div className="text-xs text-tefa-body/50 uppercase font-bold mb-2">Our Question</div>
                                <p className="text-tefa-body/70">
                                    For families in the 200-500% FPL range (Tier 3), does prior public school enrollment provide any priority advantage?
                                </p>
                            </div>
                            <div className="bg-green-50 rounded p-4 border border-green-200 text-sm text-tefa-body">
                                <div className="text-xs text-green-800 uppercase font-bold mb-2">Comptroller's Response (Apr 3, 2026)</div>
                                <ul className="text-green-700 space-y-2 text-sm">
                                    <li>Per <strong>Sec. 29.3521(d)</strong>, prior public school enrollment priority <strong>only applies to Tier 4</strong> (≥500% FPL)</li>
                                    <li>For Tier 3 (200-500% FPL), public school history provides <strong>no priority advantage</strong></li>
                                    <li>Cited Sec. 29.3521 (not 29.356) as the governing section for Tier 4 sub-prioritization</li>
                                    <li>Confirmed: $1B spending cap for 2025-2027 biennium, 20% of appropriated money cap for Tier 4 children</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">6. Federal Lawsuit & Political Conflict</h3>
                        <div className="bg-tefa-red/5 border border-tefa-red/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-tefa-red mb-3">
                                <strong>The TEFA program is caught in a federal civil rights lawsuit and a political feud.</strong> Acting
                                Comptroller Kelly Hancock blocked several Islamic private schools (including Houston Quran Academy) from participating,
                                citing alleged ties to organizations Gov. Abbott designated as terrorist organizations. Muslim families and schools
                                sued for religious discrimination. A federal judge (Judge Bennett, S.D. Texas) temporarily sided with the plaintiffs,
                                ordering the state to extend the deadline to March 31, 2026 and allow the excluded schools to submit applications.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                <div className="bg-white rounded p-3 border border-tefa-red/10">
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">The Lawsuit</div>
                                    <ul className="text-tefa-body/70 space-y-1 text-xs">
                                        <li>Hancock banned Islamic schools citing terror ties</li>
                                        <li>Federal judge sided with plaintiffs (temporary injunction)</li>
                                        <li>Deadline extended from Mar 17 to Mar 31</li>
                                        <li><strong>Permanent injunction hearing: April 24, 2026</strong></li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded p-3 border border-tefa-red/10">
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">The Political Feud</div>
                                    <ul className="text-tefa-body/70 space-y-1 text-xs">
                                        <li>Hancock blames AG Paxton for poorly defending the ban</li>
                                        <li>Hancock demanded Paxton strip school charters</li>
                                        <li>Paxton called Hancock an "incompetent loser"</li>
                                        <li>Paxton wants Gov. Abbott to fire Hancock</li>
                                        <li className="text-tefa-body/50">Backdrop: Hancock voted to impeach Paxton in 2023</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="bg-white rounded p-3 border border-tefa-red/10 mb-3">
                                <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">Impact on TEFA Funding Timeline</div>
                                <ul className="text-tefa-body/70 space-y-1 text-xs">
                                    <li>No state funds have been ordered to flow yet</li>
                                    <li>Financial side of the program is stalled until court proceedings resolve</li>
                                    <li>Internal Comptroller-AG conflict adds additional unpredictability to administration</li>
                                    <li>{TOTAL_APPLICATIONS.toLocaleString()} total applications ({ELIGIBLE_APPLICATIONS.toLocaleString()} eligible per Apr 28 PDF) to process once the legal path is clear</li>
                                </ul>
                            </div>
                            <div className="bg-amber-50 rounded p-3 border border-amber-200 mb-3">
                                <div className="text-xs text-amber-800 uppercase font-bold mb-1">Timeline Attrition — Why Delays Help Tier 3</div>
                                <ul className="text-amber-700 space-y-1 text-xs">
                                    <li>Private schools enforce early summer deadlines (June 1–30) for enrollment deposits and binding tuition contracts</li>
                                    <li>If award notifications arrive after these deadlines, lottery winners face signing $13,000+ contracts without guaranteed state funding</li>
                                    <li>Risk-averse families — especially the {analysis.demandT2.toLocaleString()} Tier 2 applicants under 200% FPL — will default to free public school rather than take on that financial exposure</li>
                                    <li>This "waitlist fatigue" drives a massive late-stage cascade of abandoned accounts directly benefiting Tier 3</li>
                                    <li>Odyssey platform is backlogged processing extended Mar 31 applications, compounding the delay</li>
                                </ul>
                            </div>
                            <div className="bg-tefa-green/5 rounded p-3 border border-tefa-green/20">
                                <div className="text-xs text-tefa-green uppercase font-bold mb-1">What This Means for Your Family</div>
                                <ul className="text-tefa-green/70 space-y-1 text-xs">
                                    <li><strong>Your application is valid</strong> — submitted before the deadline</li>
                                    <li><strong>Your lottery odds are unchanged</strong> — this lawsuit concerns which schools can participate, not family tier placement</li>
                                    <li><strong>The risk is timing, not eligibility</strong> — funds may arrive later than originally expected</li>
                                    <li><strong>Your safety valve:</strong> June 30 NBCA withdrawal deadline lets you back out if funding is delayed too long</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">7. Supply-Side Capacity Constraints</h3>
                        <div className="bg-tefa-navy/5 border border-tefa-navy/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-tefa-body/70 mb-3">
                                Even with a funded TEFA account, families must independently secure admission at a participating private school.
                                The private school market is structurally inelastic in the short term — schools cannot rapidly expand capacity to absorb
                                {TOTAL_APPLICATIONS.toLocaleString()} new applicants.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="bg-white rounded p-3 border border-gray-200">
                                    <div className="font-bold text-tefa-body/50 uppercase mb-1">Capacity Limits</div>
                                    <ul className="text-tefa-body/70 space-y-1">
                                        <li>High-performing schools (like NBCA) operate at or near max enrollment</li>
                                        <li>Growth typically limited to incremental kindergarten cohort expansions</li>
                                        <li>NBCA enforces strict admissions standards and biblical lifestyle covenants</li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded p-3 border border-gray-200">
                                    <div className="font-bold text-tefa-body/50 uppercase mb-1">Opt-Out Schools</div>
                                    <ul className="text-tefa-body/70 space-y-1">
                                        <li>Many elite private schools opted out of TEFA entirely</li>
                                        <li>Some avoid state administrative oversight</li>
                                        <li>Others charge $30,000+ — the $10,474 voucher is negligible</li>
                                        <li>Rural families face severe geographic mismatch</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-tefa-body/60">
                                Thousands of lottery winners will be unable to find a suitable, geographically accessible private school — forcing them to forfeit awards back to the waitlist pool.
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">8. Strategic Risk Management — June 30 Decision Point</h3>
                        <div className="bg-tefa-gold/10 border border-tefa-gold/30 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                <div className="bg-white rounded p-3 border border-green-200">
                                    <div className="text-xs text-green-800 uppercase font-bold mb-1">Withdraw by June 30</div>
                                    <ul className="text-green-700 space-y-1 text-xs">
                                        <li>Exit with only $690 enrollment fee lost</li>
                                        <li>No tuition liability</li>
                                        <li>Nullifies any subsequent TEFA waitlist offer</li>
                                        <li>May 11 ranked waitlist position is the sharpest signal available before this date</li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded p-3 border border-red-200">
                                    <div className="text-xs text-red-800 uppercase font-bold mb-1">Commit Past June 30</div>
                                    <ul className="text-red-700 space-y-1 text-xs">
                                        <li>Full tuition contracts bind — ~$40,950 for 3 children</li>
                                        <li>Preserves eligibility for the Jul 15 opt-out cascade (largest Year 1 attrition event, per Apr 22 press release)</li>
                                        <li>Maximum financial exposure without guaranteed funding</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="bg-white rounded p-3 border border-tefa-navy/10">
                                <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">Dual-Track Mitigation Strategy</div>
                                <ul className="text-tefa-body/70 space-y-1 text-xs">
                                    <li><strong>TEFA + NBCA FACTS Aid ($16,200 granted):</strong> If TEFA is awarded ($10,474 x 3 = $31,422) plus granted aid ($16,200), total coverage exceeds tuition — fully subsidized</li>
                                    <li><strong>NBCA Scholarship (pending):</strong> NBCA calculates scholarship after TEFA decision — designed to bridge remaining gap. Up to 35% of tuition (~$4,777/child max)</li>
                                    <li><strong>Without TEFA:</strong> NBCA Aid ($16,200) + potential scholarship reduces out-of-pocket, but significant gap remains. June 30 withdrawal is the safety valve.</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">9. Conclusion</h3>
                        <p className="mb-3">
                            Under the Comptroller's confirmed implementation, accounting for {Math.round(attritionRate * 100)}% attrition and waitlist cascade, your family has a
                            <strong> {analysis.effectiveFamilyRate.toFixed(1)}%</strong> probability of all 3 children receiving TEFA funding
                            (at the official 9.9% ineligibility rate).
                            {analysis.effectiveFamilyRate > 90
                                ? " The combination of Tier 3 placement, the sibling rule, and waitlist movement puts you in an excellent position."
                                : analysis.effectiveFamilyRate > 50
                                ? " The sibling rule significantly boosts your odds — 3 independent lottery draws with 1 win covering all. Waitlist cascade from attrition further improves your chances."
                                : analysis.effectiveFamilyRate > 10
                                ? " Odds are low but not zero — the sibling rule triples your effective lottery entries, and waitlist movement from attrition may open additional spots. The Sibling Rule is the single most powerful demographic advantage available to Tier 3 families."
                                : " The Comptroller projects funding exhausts within Tier 2. Tier 3 (Iddings) is waitlisted; whether attrition spots reach T3 depends on the size of the unfunded T2 waitlist sitting ahead of you."}
                        </p>
                        <div className="text-xs text-tefa-body/70 bg-tefa-sky/10 border border-tefa-sky/30 rounded p-3 mb-3">
                            <strong>Attrition is the sole mechanism by which Tier 3 receives funding.</strong> A 15% rate is not speculative — it represents the conservative floor supported by decades of school choice research (D.C. at 14.3%, Virginia at 20-34%, Milwaukee at 30%). TEFA's novel platform (Odyssey), unprecedented scale, tuition gaps, and active federal injunction create conditions that historically produce non-participation rates well above this baseline.
                        </div>
                        <p className="text-xs text-tefa-red/80 bg-tefa-gold/10 border border-tefa-gold/30 rounded p-3">
                            <strong>Timing caveat (updated Apr 28):</strong> Per the Apr 28 Lottery Update PDF, the locked-in timeline is: T1 awards Apr 22–24 ({analysis.firstRoundAwards.toLocaleString()} students), <strong>T2 lottery week of Apr 27</strong>, ranked waitlist position notified by <strong>May 11</strong> (portal opens for opt-in same day), then a two-track funding cascade: <strong>July funding</strong> (Jun 1 family opt-in, Jun 15 school confirmation, Jul 1 first disbursement) and <strong>August funding</strong> (Jul 15 family opt-in/opt-out, Jul 31 school confirmation).
                            The critical tension for Tier 3 families: the Iddings know their ranked waitlist position by May 11 — a sharper signal than the probabilistic model. But the biggest waitlist-cascade event is the Jul 15 opt-out deadline, which falls AFTER the Jun 30 NBCA withdrawal deadline. Withdrawing on Jun 30 means exiting before the main cascade plays out; staying past Jun 30 binds the family to ~$40,950 in tuition contracts for uncertain funding.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-tefa-navy text-white max-w-full p-6 text-center text-xs mt-8">
        <p>Created for Iddings Family | 2026-2027 Academic Year</p>
        <p className="mt-1">Disclaimer: All financial figures are estimates based on 2026 projections. Final awards are determined by respective agencies. Figures reflect the Comptroller's TEFA Application Insights: Year 1 (Apr 2026).</p>
      </footer>
    </div>
  );
};

export default IddingsPlanner;
