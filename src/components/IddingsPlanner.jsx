import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
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

  // Scenario State - Updated to 256k+ per March 30 Comptroller email (last day before deadline)
  const [applicantScenario, setApplicantScenario] = useState(270000);
  const [ineligibilityRate, setIneligibilityRate] = useState(0.10); // ~10% default
  const [publicSchoolPct, setPublicSchoolPct] = useState(0.24); // TCVT data: ~24% were in public school last year

  // Student Data
  const students = [
    { name: 'Cassius', grade: '9th Grade', school: 'High School', aceAmount: 4000, wasInPublicSchool: false },
    { name: 'Dorothy', grade: '7th Grade', school: 'Middle School', aceAmount: 3000, wasInPublicSchool: true },
    { name: 'Sebastian', grade: '4th Grade', school: 'Elementary', aceAmount: 3000, wasInPublicSchool: true }
  ];

  // Financial Data State - "Most Likely Scenario" Defaults
  const [tuition, setTuition] = useState(43505);
  const [tefaPerStudent, setTefaPerStudent] = useState(10474);

  // Default: TEFA is likely (ON), ACE is unlikely (OFF)
  const [includeTefa, setIncludeTefa] = useState(true);
  const [includeAce, setIncludeAce] = useState(false);

  // NBCA Aid - Defaulting to modest amount ($500/kid) as "Likely"
  const [nbcaAidAmount, setNbcaAidAmount] = useState(1500);

  // NBCA Scholarship Slider - Defaulting to 0 (Unknown)
  const [nbcaScholarshipAmount, setNbcaScholarshipAmount] = useState(0);

  // Fee Calculations (One-time)
  const fees = {
    nbcaApp: 150 * 3, // $150 per student
    nbcaEnroll: 175 * 3, // $175 per student x 3 accepted
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
    { item: "NBCA Enrollment Fee", status: "Due by April 6", date: "$175 x 3 = $525", type: "pending", funding: "One-Time" },
    { item: "NBCA Financial Aid", status: "Waiting", date: "March 31", type: "pending", funding: "Tuition Credit" },
    { item: "NBCA Scholarship", status: "Waiting", date: "March 31", type: "pending", funding: "Tuition Credit" },
    { item: "TEFA Scholarship", status: "Waiting", date: "May (est.)", type: "pending", funding: "Digital Wallet" },
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
  const getScenarioAnalysis = (totalApps) => {
    const budget = 1000000000; // $1 Billion
    const eligibleApps = Math.round(totalApps * (1 - ineligibilityRate));

    // Cost model (77% Private, 23% Homeschool — Mar 29 Fact Sheet, intended 2026-27 enrollment)
    const privateCost = 10500;
    const homeCost = 2000;
    const weightedAvg = (privateCost * 0.77) + (homeCost * 0.23); // ~$8,545
    const capacity = Math.floor(budget / weightedAvg); // ~115,874 students

    // =====================================================
    // MODEL A: COMPTROLLER'S ACTUAL IMPLEMENTATION
    // (4-tier system from website — Tier 4 sub-prioritizes public school within ≥500% FPL)
    // =====================================================
    const tier1_pct = 0.12;  // Disability + ≤500% FPL
    const tier2_pct = 0.31;  // ≤200% FPL (updated per Mar 29 fact sheet)
    const tier3_pct = 0.30;  // 200-500% FPL (Iddings family — ALL 3 kids)
    const tier4a_pct = 0.05; // ≥500% FPL + public school
    const tier4b_pct = 0.22; // ≥500% FPL (updated per Mar 29 fact sheet)

    const demandT1 = Math.round(eligibleApps * tier1_pct);
    const demandT2 = Math.round(eligibleApps * tier2_pct);
    const demandT3 = Math.round(eligibleApps * tier3_pct);
    const demandT4a = Math.round(eligibleApps * tier4a_pct);
    const demandT4b = Math.round(eligibleApps * tier4b_pct);

    let remaining = capacity;
    const fundedT1 = Math.min(remaining, demandT1); remaining -= fundedT1;
    const fundedT2 = Math.min(remaining, demandT2); remaining -= fundedT2;
    const fundedT3 = Math.min(remaining, demandT3); remaining -= fundedT3;
    const fundedT4a = Math.min(remaining, demandT4a); remaining -= fundedT4a;
    const fundedT4b = Math.min(remaining, demandT4b);

    const tier3Rate = demandT3 > 0 ? Math.min(100, (fundedT3 / demandT3) * 100) : 100;
    const tier4Rate = (demandT4a + demandT4b) > 0
      ? Math.min(100, ((fundedT4a + fundedT4b) / (demandT4a + demandT4b)) * 100) : 100;

    // Sibling Rule (Comptroller administrative rule):
    // If ANY one child wins the lottery, all eligible siblings are automatically accepted.
    // P(family funded) = 1 - P(all 3 children lose independently)
    const singleFailRate = 1 - (tier3Rate / 100);
    const familySuccessRate = (1 - Math.pow(singleFailRate, 3)) * 100;

    // =====================================================
    // MODEL B: STRICT SB 2 READING (Legal Risk Scenario)
    // (If a court enforces §29.356(b) public school requirement)
    // =====================================================
    const incomeOrDisabilityRate = 0.75; // ~72% ≤500% FPL + ~3% disabled above
    const priorityDemand = Math.round(eligibleApps * publicSchoolPct * incomeOrDisabilityRate);
    const priorityCapacity = Math.floor(capacity * 0.80);
    const priorityFunded = Math.min(priorityCapacity, priorityDemand);
    const priorityRate = priorityDemand > 0 ? Math.min(100, (priorityFunded / priorityDemand) * 100) : 100;

    const generalDemand = eligibleApps - priorityDemand;
    const generalCapacity = capacity - priorityFunded;
    const generalRate = generalDemand > 0 ? Math.min(100, (Math.min(generalCapacity, generalDemand) / generalDemand) * 100) : 100;

    // Under strict reading with sibling rule:
    // Dorothy & Sebastian → priority pool, Cassius → general pool
    // P(family) = 1 - P(D loses) * P(S loses) * P(C loses)
    const strictFamilyRate = (1 - (1 - priorityRate / 100) * (1 - priorityRate / 100) * (1 - generalRate / 100)) * 100;

    return {
        capacity, eligibleApps,
        // Model A: Comptroller's implementation
        demandT1, demandT2, demandT3, demandT4a, demandT4b,
        fundedT1, fundedT2, fundedT3, fundedT4a, fundedT4b,
        tier3Rate, tier4Rate, familySuccessRate,
        // Model B: Strict SB 2
        priorityDemand, priorityCapacity, priorityFunded, priorityRate,
        generalDemand, generalCapacity, generalRate, strictFamilyRate,
    };
  };

  const analysis = getScenarioAnalysis(applicantScenario);

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
    { date: 'Mar 31', day: 'Tue', isoDate: '2026-03-31', event: 'NBCA Aid & Scholarship Decisions', type: 'facts', desc: 'Financial aid and scholarship offers sent. Must accept within 2 weeks.', funding: 'Credited to Tuition' },
    { date: 'Apr 06', day: 'Mon', isoDate: '2026-04-06', event: 'NBCA Enrollment Fee Due', type: 'nbca', desc: 'Pay $175 x 3 ($525) by EOD to secure spots. 9th = 5 left, 7th = 3 left, 4th = plenty.', funding: '$525 One-Time' },
    { date: 'Apr 15', day: 'Wed', isoDate: '2026-04-15', event: 'ACE Scholarship Deadline', type: 'ace', desc: 'Closes 11:59 PM (Tax Day).', funding: 'Deadline' },
    { date: 'Apr 24', day: 'Fri', isoDate: '2026-04-24', event: 'Federal Injunction Hearing', type: 'tefa', desc: 'Key hearing in Muslim schools v. Texas. Court decides whether to maintain, modify, or dissolve the injunction blocking Comptroller Hancock from excluding Islamic schools. TEFA funding timeline depends on outcome.', funding: 'Court Date' },
    { date: 'May (est.)', day: 'TBD', isoDate: '2026-05-01', event: 'TEFA Funding Notification (est.)', type: 'tefa', desc: 'Comptroller said notifications "in April, most likely not the first week" (Mar 26 email) — but likely delayed until after Apr 24 federal hearing. 256k+ applications to process. Tier-based awards with lottery for oversubscribed tiers.', funding: 'Paid to Digital Wallet' },
    { date: 'Jun 01', day: 'Mon', isoDate: '2026-06-01', event: 'TEFA School Selection Deadline', type: 'tefa', desc: 'Select a participating school by this date to receive initial funding on July 1. More schools joining on a rolling basis.', funding: 'Required for Jul 1 Funding' },
    { date: 'Jun 15', day: 'Mon', isoDate: '2026-06-15', event: 'ACE Award Notification', type: 'ace', desc: 'Scholarship decisions released.', funding: 'Paid directly to School' },
    { date: 'Jun 30', day: 'Tue', isoDate: '2026-06-30', event: 'NBCA Withdrawal Deadline', type: 'nbca', desc: 'Can withdraw penalty-free before this date. No tuition due until July.', funding: 'N/A' },
    { date: 'Jul 01', day: 'Wed', isoDate: '2026-07-01', event: 'TEFA Funds Available (25%)', type: 'tefa', desc: 'First tranche of funds available in account.', funding: 'Distribution' },
    { date: 'Jul 15', day: 'Wed', isoDate: '2026-07-15', event: 'TEFA Final School Selection', type: 'tefa', desc: 'Final deadline to select a school for initial funding in mid-August.', funding: 'Required for Aug Funding' },
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
                                            {row.status === 'Submitted' ? <CheckCircle size={16} className={row.type === 'success' ? 'text-green-600' : 'text-amber-500'}/> :
                                             row.status === 'Scheduled' ? <Calendar size={16} className="text-tefa-navy"/> :
                                             <Clock size={16} className="text-amber-500"/>
                                            }
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

            {/* TEFA Program Status Card */}
            <div className="bg-tefa-light p-6 rounded-lg shadow-md border-2 border-tefa-navy">
                <h2 className="text-xl font-bold flex items-center gap-2 text-tefa-navy mb-3">
                    <Scale size={20} /> TEFA Program Status: In Holding Pattern
                </h2>
                <p className="text-sm text-tefa-body mb-4">
                    The TEFA program is stalled due to a federal civil rights lawsuit and a political feud between
                    Comptroller Hancock and AG Paxton. Your application is submitted and valid — the uncertainty
                    is about <strong>when</strong> funds will flow, not <strong>whether</strong> you are eligible.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Applications</div>
                        <div className="font-bold text-tefa-navy text-lg">256,700</div>
                        <div className="text-[10px] text-tefa-body/40">As of Mar 29</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Deadline</div>
                        <div className="font-bold text-tefa-navy text-lg">Mar 31</div>
                        <div className="text-[10px] text-tefa-body/40">Court-ordered extension</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Next Hearing</div>
                        <div className="font-bold text-tefa-red text-lg">Apr 24</div>
                        <div className="text-[10px] text-tefa-body/40">Federal injunction</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Private School</div>
                        <div className="font-bold text-tefa-navy text-lg">77%</div>
                        <div className="text-[10px] text-tefa-body/40">of applicants</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Homeschool</div>
                        <div className="font-bold text-tefa-navy text-lg">23%</div>
                        <div className="text-[10px] text-tefa-body/40">of applicants</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-tefa-navy/10 text-center">
                        <div className="text-xs text-tefa-body/50 font-medium">Funds Flowing</div>
                        <div className="font-bold text-tefa-red text-lg">No</div>
                        <div className="text-[10px] text-tefa-body/40">Pending court ruling</div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs text-center">
                    <div className="bg-tefa-green/10 rounded p-1.5 border border-tefa-green/20">
                        <div className="font-bold text-tefa-green">T1: 12%</div>
                        <div className="text-tefa-green/70">Disability</div>
                    </div>
                    <div className="bg-tefa-navy/10 rounded p-1.5 border border-tefa-navy/20">
                        <div className="font-bold text-tefa-navy">T2: 31%</div>
                        <div className="text-tefa-navy/70">≤200% FPL</div>
                    </div>
                    <div className="bg-tefa-gold/20 rounded p-1.5 border border-tefa-gold/40">
                        <div className="font-bold text-tefa-red">T3: 30%</div>
                        <div className="text-tefa-red/70">200-500%</div>
                    </div>
                    <div className="bg-tefa-red/10 rounded p-1.5 border border-tefa-red/20">
                        <div className="font-bold text-tefa-red">T4: 27%</div>
                        <div className="text-tefa-red/70">≥500% FPL</div>
                    </div>
                </div>
            </div>

            {/* Enrollment Decision Risk Card */}
            <div className="bg-tefa-sky/10 p-6 rounded-lg shadow-md border border-tefa-navy/20">
                <h2 className="text-xl font-bold flex items-center gap-2 text-tefa-navy mb-4">
                    <Shield size={20} /> Enrollment Decision
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">At risk today</span>
                        <span className="font-bold text-tefa-navy text-lg">$525</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Enrollment fee for 3 kids</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">NBCA Aid & Scholarship</span>
                        <span className="font-bold text-tefa-navy text-lg">March 31</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Decisions released</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">TEFA Notification</span>
                        <span className="font-bold text-tefa-navy text-lg">May (est.)</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Depends on Apr 24 federal hearing</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">Withdraw penalty-free by</span>
                        <span className="font-bold text-tefa-navy text-lg">June 30</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">Full refund except enrollment fee</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">No tuition due until</span>
                        <span className="font-bold text-tefa-navy text-lg">July</span>
                        <span className="text-xs text-tefa-body/40 hidden sm:block">First payment</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:gap-1 bg-white rounded-lg p-3 border border-tefa-navy/10">
                        <span className="text-tefa-body/60 font-medium">Spots available</span>
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-xs font-semibold bg-tefa-navy/10 text-tefa-navy px-2 py-0.5 rounded">9th: 5</span>
                            <span className="text-xs font-semibold bg-tefa-gold/20 text-tefa-red px-2 py-0.5 rounded">7th: 3</span>
                            <span className="text-xs font-semibold bg-tefa-green/10 text-tefa-green px-2 py-0.5 rounded">4th: plenty</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 bg-tefa-red/5 border border-tefa-red/20 rounded-lg p-4 text-sm text-tefa-body">
                    <strong className="flex items-center gap-1 mb-2">⚠️ New Timeline Gap — You'll commit $525 before knowing TEFA status</strong>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                        <li><strong>April 6:</strong> Enrollment fee due ($525) — <strong>no TEFA answer yet</strong></li>
                        <li><strong>May (est.):</strong> TEFA notification — likely delayed until after Apr 24 federal hearing</li>
                        <li><strong>June 30:</strong> Withdraw penalty-free if funding doesn't work out</li>
                    </ul>
                    <strong>Bottom line:</strong> You're committing $525 blind on TEFA, but the June 30 safety net means you still have ~2 months after TEFA notification to back out with no tuition owed.
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
                                    <span className={`text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${analysis.familySuccessRate > 80 ? 'bg-green-500' : analysis.familySuccessRate > 50 ? 'bg-tefa-gold/100' : 'bg-red-500'}`}>{analysis.familySuccessRate > 90 ? 'Excellent' : analysis.familySuccessRate > 70 ? 'Good' : analysis.familySuccessRate > 50 ? 'Fair' : 'Low'} ({analysis.familySuccessRate.toFixed(1)}%)</span>
                                </div>
                                <div className="text-xs text-tefa-navy/70 mt-1">3 x $10,474 (Est)</div>
                                <div className="text-[10px] text-tefa-navy/50 mt-2 flex items-center gap-1">
                                    <Briefcase size={10}/> Paid to Digital Wallet
                                </div>
                                <div className="text-[10px] text-tefa-red mt-1 flex items-center gap-1">
                                    <AlertCircle size={10}/> Program stalled — Apr 24 hearing
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

                        {/* NBCA Financial Aid Slider */}
                        <div className="p-3 bg-tefa-green/5 rounded-lg border border-tefa-green/10">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-tefa-green flex items-center gap-2">
                                <Percent size={14}/> NBCA Fin. Aid
                                <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Moderate</span>
                            </div>
                            <div className="text-xs font-bold text-tefa-green/70 bg-white px-2 py-0.5 rounded border border-tefa-green/20">
                              ${nbcaAidAmount.toLocaleString()}
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="15000"
                            step="100"
                            value={nbcaAidAmount}
                            onChange={(e) => setNbcaAidAmount(Number(e.target.value))}
                            className="w-full h-2 bg-tefa-green/20 rounded-lg appearance-none cursor-pointer accent-tefa-green"
                          />
                          <div className="flex justify-between text-xs text-tefa-green/60 mt-1 font-medium">
                            <span>$0</span>
                            <span>$15k Max</span>
                          </div>
                           <div className="text-[10px] text-tefa-green/80 mt-1">
                                Credited to Tuition
                           </div>
                        </div>

                        {/* NBCA Scholarship Slider */}
                        <div className="p-3 bg-tefa-green/5 rounded-lg border border-tefa-green/10">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-tefa-green flex items-center gap-2">
                                <GraduationCap size={14}/> NBCA Scholarship
                                <span className="text-[10px] bg-tefa-green text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Pending Mar 31</span>
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

            {/* Scenario Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-bold text-tefa-navy mb-4 flex items-center gap-2">
                    <Layers size={18}/> Select Applicant Volume Scenario
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[256000, 270000, 290000, 310000].map((count) => (
                        <button
                            key={count}
                            onClick={() => setApplicantScenario(count)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition
                                ${applicantScenario === count
                                ? 'bg-tefa-navy text-white border-tefa-navy'
                                : 'bg-white text-tefa-navy border-tefa-navy/30 hover:border-tefa-navy'}`}
                        >
                            {(count / 1000).toFixed(0)}k Applicants
                        </button>
                    ))}
                </div>

                {/* Ineligibility Rate */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-tefa-navy">Estimated Ineligibility Rate</label>
                        <span className="text-sm font-bold text-tefa-navy">{Math.round(ineligibilityRate * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={Math.round(ineligibilityRate * 100)}
                        onChange={(e) => setIneligibilityRate(parseInt(e.target.value) / 100)}
                        className="w-full accent-tefa-navy"
                    />
                    <div className="flex justify-between text-xs text-tefa-body/50 mt-1">
                        <span>0%</span>
                        <span>10%</span>
                        <span>20%</span>
                    </div>
                    <div className="mt-2 text-sm text-tefa-body/70">
                        Total Applicants: <strong>{applicantScenario.toLocaleString()}</strong> → Eligible: <strong>{analysis.eligibleApps.toLocaleString()}</strong> ({Math.round(ineligibilityRate * 100)}% ineligible)
                    </div>
                    <div className="mt-1 text-xs text-tefa-body/50">
                        Comptroller reported ~10% overall ineligibility (~50% for pre-K, much lower for K-12)
                    </div>
                </div>

                {/* Prior Public School Rate */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-tefa-navy">Prior Public School Enrollment Rate</label>
                        <span className="text-sm font-bold text-tefa-navy">{Math.round(publicSchoolPct * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="60"
                        step="1"
                        value={Math.round(publicSchoolPct * 100)}
                        onChange={(e) => setPublicSchoolPct(parseInt(e.target.value) / 100)}
                        className="w-full accent-tefa-navy"
                    />
                    <div className="flex justify-between text-xs text-tefa-body/50 mt-1">
                        <span>10%</span>
                        <span>24% (TCVT)</span>
                        <span>60%</span>
                    </div>
                    <div className="mt-2 text-sm text-tefa-body/70">
                        Est. {Math.round(publicSchoolPct * 100)}% of applicants were enrolled in public school last year
                    </div>
                    <div className="mt-1 text-xs text-tefa-body/50">
                        SB 2 §29.356(b)(1) requires prior public school enrollment for the 80% priority pool. TCVT data suggests ~24% of applicants qualify. The Comptroller has not published this breakdown.
                    </div>
                </div>

                {/* Scenario Result */}
                <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="text-xs text-tefa-body/50 uppercase font-bold">Per-Child (Tier 3)</div>
                        <div className={`text-2xl font-bold ${analysis.tier3Rate > 80 ? 'text-green-600' : analysis.tier3Rate > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {analysis.tier3Rate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-tefa-body/60 mt-1">
                            Individual lottery odds
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-tefa-body/50 uppercase font-bold">Family (Sibling Rule)</div>
                        <div className={`text-2xl font-bold ${analysis.familySuccessRate > 80 ? 'text-green-600' : analysis.familySuccessRate > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {analysis.familySuccessRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-tefa-body/60 mt-1">
                            1 win = all 3 funded
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-tefa-body/50 uppercase font-bold">Program Capacity</div>
                        <div className="text-2xl font-bold text-tefa-navy">
                            ~{analysis.capacity.toLocaleString()}
                        </div>
                        <div className="text-xs text-tefa-body/60 mt-1">
                            Tier 4 odds: {analysis.tier4Rate.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-tefa-navy text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Iddings Family Funding Strategy</h3>
                        <p className="text-tefa-sky/70 text-sm">Dual Model Analysis — Comptroller's Rules vs. SB 2 Text — March 2026</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="prose prose-sm max-w-none text-tefa-navy">
                        <h3 className="font-bold text-tefa-navy text-lg mb-2">1. The Projection Model</h3>
                        <p className="mb-4">
                            As of March 30th, more than <strong>256,000</strong> students have applied (per the Comptroller's email). The application window
                            closes <strong>March 31 at 11:59 PM CT</strong> per a federal court order (Judge Bennett, S.D. Texas).
                            More than 2,300 participating schools are listed in the school finder tool, including a growing number of accredited online schools.
                            The current scenario is set to <strong>{applicantScenario.toLocaleString()}</strong> total applicants
                            to account for final-day applications.
                        </p>
                        <p className="mb-4">
                            <strong>Not all applicants are eligible.</strong> An earlier Comptroller review found ~10% ineligibility (18,000 of 184,000 reviewed).
                            Pre-K has the highest ineligibility (~50%), while K-12 is much lower. With 256,700 total applications as of March 29,
                            this model accounts for ineligibility (currently set to {Math.round(ineligibilityRate * 100)}%),
                            reducing the eligible pool to <strong>{analysis.eligibleApps.toLocaleString()}</strong> applicants competing for funding.
                        </p>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">2. Supply vs. Demand</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li><strong>Total Budget:</strong> $1 Billion</li>
                            <li><strong>Weighted Avg Cost:</strong> ~$8,545 (77% Private / 23% Homeschool — Mar 29 Fact Sheet enrollment mix)</li>
                            <li><strong>Estimated Capacity:</strong> ~{analysis.capacity.toLocaleString()} Students</li>
                            <li><strong>Eligible Applicants:</strong> ~{analysis.eligibleApps.toLocaleString()} (after {Math.round(ineligibilityRate * 100)}% ineligibility)</li>
                        </ul>
                        <p className="mb-4 text-xs text-tefa-body/60">
                            Note: The 77/23 split is from the Comptroller's Mar 29 "Educational Setting" chart, which shows where applicants <em>plan to enroll</em> for 2026-27, not where they attended previously. Pre-K students also draw from the same $1B pool.
                        </p>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">3. Comptroller's Tier System (How the Lottery Will Actually Run)</h3>
                        <div className="bg-tefa-navy/5 border border-tefa-navy/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-tefa-navy mb-2">
                                <strong>Sibling Rule:</strong> Per the Comptroller's administrative rules, if <em>any one child</em> is accepted in the lottery,
                                all eligible siblings who applied during the same period are <strong>automatically accepted</strong>.
                                Your family effectively gets 3 lottery tickets — one win covers the whole household.
                            </p>
                            <p className="text-xs text-tefa-navy/70">
                                All 3 children (Cassius, Dorothy, Sebastian) are in <strong>Tier 3 (200-500% FPL)</strong> under the Comptroller's implementation,
                                which does not enforce the public school attendance requirement for Tiers 1-3.
                            </p>
                        </div>

                        <p className="mb-4">With {analysis.eligibleApps.toLocaleString()} eligible applicants, here is how the $1B budget drains by tier:</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 1 — Disability + ≤500% FPL (12%)</div>
                                <div className="text-sm text-green-700">
                                    {analysis.demandT1.toLocaleString()} applicants — Funded first, 100% funded
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 2 — ≤200% FPL (31%)</div>
                                <div className="text-sm text-green-700">
                                    {analysis.demandT2.toLocaleString()} applicants — 100% funded
                                </div>
                            </div>
                            <div className={`p-4 border-2 rounded-lg ${analysis.tier3Rate === 100 ? 'bg-green-50 border-green-300' : 'bg-tefa-gold/10 border-tefa-gold/40'}`}>
                                <div className={`font-bold text-lg ${analysis.tier3Rate === 100 ? 'text-green-800' : 'text-tefa-red'}`}>
                                    Tier 3 — 200-500% FPL (30%) — All 3 Iddings Children
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Demand</div>
                                        <div className="font-bold">{analysis.demandT3.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Funded</div>
                                        <div className="font-bold">{analysis.fundedT3.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Per-Child Rate</div>
                                        <div className={`font-bold ${analysis.tier3Rate > 80 ? 'text-green-600' : analysis.tier3Rate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {analysis.tier3Rate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-tefa-body/50">Family Rate (Sibling Rule)</div>
                                        <div className={`font-bold ${analysis.familySuccessRate > 80 ? 'text-green-600' : analysis.familySuccessRate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {analysis.familySuccessRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-tefa-body/60">
                                    Sibling math: P(family) = 1 - P(all 3 lose) = 1 - (1 - {(analysis.tier3Rate / 100).toFixed(4)})³ = {(analysis.familySuccessRate / 100).toFixed(4)}
                                </div>
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier4Rate > 0 ? 'bg-red-50 border-red-200' : 'bg-tefa-light border-gray-200'}`}>
                                <div className={`font-bold ${analysis.tier4Rate > 50 ? 'text-tefa-red' : 'text-tefa-red'}`}>
                                    Tier 4 — ≥500% FPL (27%){' '}
                                    <span className="text-xs font-normal text-tefa-body/60">(4a: public school 5% | 4b: all others 22%)</span>
                                </div>
                                <div className={`text-sm ${analysis.tier4Rate > 50 ? 'text-tefa-red/80' : 'text-tefa-red/80'}`}>
                                    {(analysis.demandT4a + analysis.demandT4b).toLocaleString()} applicants — {analysis.tier4Rate.toFixed(1)}% funded
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">4. Per-Student Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {students.map((student) => (
                                <div key={student.name} className={`p-4 rounded-lg border ${analysis.familySuccessRate > 80 ? 'bg-green-50 border-green-200' : analysis.familySuccessRate > 50 ? 'bg-tefa-gold/10 border-tefa-gold/30' : 'bg-red-50 border-red-200'}`}>
                                    <div className="font-bold text-tefa-navy">{student.name}</div>
                                    <div className="text-xs text-tefa-body/60">{student.grade} — Tier 3</div>
                                    <div className={`text-2xl font-bold mt-2 ${analysis.tier3Rate > 80 ? 'text-green-600' : analysis.tier3Rate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {analysis.tier3Rate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-tefa-body/50 mt-1">
                                        {student.wasInPublicSchool ? 'Was in public school last year' : 'Was not in public school last year'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`p-4 rounded-lg border-2 mb-6 ${analysis.familySuccessRate > 80 ? 'bg-green-50 border-green-300' : analysis.familySuccessRate > 50 ? 'bg-tefa-gold/10 border-tefa-gold/40' : 'bg-red-50 border-red-300'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold">Family Probability (All 3 Funded via Sibling Rule)</div>
                                    <div className="text-xs text-tefa-body/60 mt-1">1 win in Tier 3 lottery = all 3 children automatically accepted</div>
                                </div>
                                <div className={`text-4xl font-bold ${analysis.familySuccessRate > 80 ? 'text-green-600' : analysis.familySuccessRate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {analysis.familySuccessRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">5. Legal Risk: Comptroller vs. SB 2 Text</h3>
                        <div className="bg-tefa-gold/10 border border-tefa-gold/30 rounded-lg p-4 mb-4">
                            <p className="text-sm text-tefa-body mb-3">
                                <strong>The Comptroller is not enforcing SB 2's public school requirement.</strong> The law (§29.356(b)(1)) mandates that 80% of positions
                                be reserved for children who attended public school last year AND are low-income/disabled. The Comptroller's website only applies
                                this requirement to Tier 4 (≥500% FPL), ignoring it entirely for Tiers 1-3. This benefits your family
                                (Cassius stays in Tier 3) but creates legal vulnerability if challenged.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-white rounded p-3 border border-tefa-gold/20">
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">Comptroller's Rules (Current Reality)</div>
                                    <div className="text-tefa-body/70">All 3 kids in Tier 3 (same pool)</div>
                                    <div className={`text-xl font-bold mt-1 ${analysis.familySuccessRate > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {analysis.familySuccessRate.toFixed(1)}% Family Rate
                                    </div>
                                </div>
                                <div className="bg-white rounded p-3 border border-tefa-gold/20">
                                    <div className="text-xs text-tefa-body/50 uppercase font-bold mb-1">If SB 2 Text Enforced (Legal Risk)</div>
                                    <div className="text-tefa-body/70">D&S in priority pool, Cassius in general</div>
                                    <div className={`text-xl font-bold mt-1 ${analysis.strictFamilyRate > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {analysis.strictFamilyRate.toFixed(1)}% Family Rate
                                    </div>
                                    <div className="text-xs text-tefa-body/50 mt-1">
                                        Priority: {analysis.priorityRate.toFixed(1)}% (D&S) | General: {analysis.generalRate.toFixed(1)}% (Cassius)
                                    </div>
                                </div>
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
                                    <li>256,700+ applications to process once the legal path is clear</li>
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

                        <h3 className="font-bold text-tefa-navy text-lg mb-2">7. Conclusion</h3>
                        <p className="mb-3">
                            Under the Comptroller's actual implementation, your family has a
                            <strong> {analysis.familySuccessRate.toFixed(1)}%</strong> probability of all 3 children receiving TEFA funding.
                            {analysis.familySuccessRate > 90
                                ? " The combination of Tier 3 placement and the sibling rule puts you in an excellent position."
                                : analysis.familySuccessRate > 70
                                ? " The sibling rule significantly boosts your odds — 3 independent lottery draws with 1 win covering all."
                                : " While individual odds are competitive, the sibling rule provides a meaningful boost."}
                        </p>
                        <p className="text-xs text-tefa-body/60 mb-3">
                            Even under the stricter SB 2 reading, the sibling rule still applies — and Dorothy & Sebastian's near-certain priority placement
                            would pull Cassius through regardless. Either way, your family's position is strong.
                        </p>
                        <p className="text-xs text-tefa-red/80 bg-tefa-gold/10 border border-tefa-gold/30 rounded p-3">
                            <strong>Timing caveat:</strong> The federal lawsuit and Comptroller-AG political conflict have introduced significant timing uncertainty.
                            While your lottery odds remain strong, the program is in a holding pattern until at least the April 24 hearing. Plan for the
                            possibility that TEFA funds may not arrive until late May or later. The June 30 NBCA withdrawal deadline remains your key decision point —
                            if funding is not confirmed by then, you can still walk away with only the $525 enrollment fee at risk.
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-tefa-navy text-white max-w-full p-6 text-center text-xs mt-8">
        <p>Created for Iddings Family | 2026-2027 Academic Year</p>
        <p className="mt-1">Disclaimer: All financial figures are estimates based on 2026 projections. Final awards are determined by respective agencies.</p>
      </footer>
    </div>
  );
};

export default IddingsPlanner;
