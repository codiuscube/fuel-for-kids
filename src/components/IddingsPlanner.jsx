import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';

const IddingsPlanner = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Scenario State - Default to 120k based on current trend
  const [applicantScenario, setApplicantScenario] = useState(200000);
  const [ineligibilityRate, setIneligibilityRate] = useState(0.10); // ~10% default

  // Student Data
  const students = [
    { name: 'Cassius', grade: '9th Grade', school: 'High School', aceAmount: 4000 },
    { name: 'Dorothy', grade: '7th Grade', school: 'Middle School', aceAmount: 3000 },
    { name: 'Sebastian', grade: '4th Grade', school: 'Elementary', aceAmount: 3000 }
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
    { item: "TEFA Scholarship", status: "Waiting", date: "Early April", type: "pending", funding: "Digital Wallet" },
  ];

  // Checklist Data
  const checklistData = {
    nbca: {
      title: "NBCA Admissions",
      color: "bg-emerald-100 text-emerald-800",
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
      color: "bg-yellow-100 text-yellow-800",
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
      color: "bg-blue-100 text-blue-800",
      items: [
        { id: 'tefa-create', text: 'Create Account on TEFA Portal', done: true },
        { id: 'tefa-citizen', text: 'Proof of Citizenship/Residency', done: true },
        { id: 'tefa-eligibility', text: 'Proof of Public School Eligibility', done: true },
        { id: 'tefa-submit', text: 'Submit Application (Feb 4 - Mar 17)', done: true },
      ]
    },
    ace: {
      title: "ACE Scholarships",
      color: "bg-purple-100 text-purple-800",
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

  // Scenario Logic
  const getScenarioAnalysis = (totalApps) => {
    // Constants from Mar 16 Fact Sheet (Window closed March 17)
    const budget = 1000000000; // $1 Billion

    // Ineligibility reduces the pool competing for funding
    const eligibleApps = Math.round(totalApps * (1 - ineligibilityRate));

    // 5-tier breakdown from Mar 16 Fact Sheet
    const tier1_pct = 0.12;  // 12% Tier 1 (Disability + ≤500% FPL)
    const tier2_pct = 0.30;  // 30% Tier 2 (≤200% FPL)
    const tier3_pct = 0.30;  // 30% Tier 3 (200-500% FPL — Iddings family)
    const tier4a_pct = 0.05; // 5% Tier 4a (≥500% FPL + public school)
    const tier4b_pct = 0.23; // 23% Tier 4b (≥500% FPL)

    // Costs (updated: 78% Private, 22% Homeschool — Mar 16 Fact Sheet)
    const privateCost = 10500;
    const homeCost = 2000;
    const weightedAvg = (privateCost * 0.78) + (homeCost * 0.22); // ~$8,630 (78% Private / 22% Homeschool)

    // Capacity
    const capacity = Math.floor(budget / weightedAvg); // ~115,874 students

    // Demand by Tier (based on eligible applicants)
    const demandT1 = Math.round(eligibleApps * tier1_pct);
    const demandT2 = Math.round(eligibleApps * tier2_pct);
    const demandT3 = Math.round(eligibleApps * tier3_pct);
    const demandT4a = Math.round(eligibleApps * tier4a_pct);
    const demandT4b = Math.round(eligibleApps * tier4b_pct);

    // Funding Logic (Priority Order)
    let remainingSlots = capacity;

    // Fund Tier 1
    const fundedT1 = Math.min(remainingSlots, demandT1);
    remainingSlots -= fundedT1;

    // Fund Tier 2
    const fundedT2 = Math.min(remainingSlots, demandT2);
    remainingSlots -= fundedT2;

    // Fund Tier 3 (You)
    const fundedT3 = Math.min(remainingSlots, demandT3);
    const tier3SuccessRate = demandT3 > 0 ? (fundedT3 / demandT3) * 100 : 0;
    remainingSlots -= fundedT3;

    // Fund Tier 4a (public school + ≥500% FPL)
    const fundedT4a = Math.min(remainingSlots, demandT4a);
    remainingSlots -= fundedT4a;

    // Fund Tier 4b (≥500% FPL)
    const fundedT4b = Math.min(remainingSlots, demandT4b);
    const tier4SuccessRate = (demandT4a + demandT4b) > 0
      ? ((fundedT4a + fundedT4b) / (demandT4a + demandT4b)) * 100 : 0;

    // Sibling Rule Math for Tier 3
    // Probability of all 3 kids losing lottery
    const singleFailureRate = 1 - (tier3SuccessRate / 100);
    const allThreeFail = singleFailureRate * singleFailureRate * singleFailureRate;
    const familySuccessRate = (1 - allThreeFail) * 100;

    return {
        capacity,
        eligibleApps,
        demandT1,
        demandT2,
        demandT3,
        demandT4a,
        demandT4b,
        fundedT1,
        fundedT2,
        fundedT3,
        tier3SuccessRate,
        familySuccessRate,
        tier4SuccessRate
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
    { date: 'Mar 17', day: 'Tue', isoDate: '2026-03-17', event: 'TEFA Application Closes', type: 'tefa', desc: 'Strict deadline. Lottery priority set by income.', funding: 'Deadline' },
    { date: 'Mar 31', day: 'Mon', isoDate: '2026-03-31', event: 'NBCA Aid & Scholarship Decisions', type: 'facts', desc: 'Financial aid and scholarship offers sent. Must accept within 2 weeks.', funding: 'Credited to Tuition' },
    { date: 'Apr 06', day: 'Mon', isoDate: '2026-04-06', event: 'NBCA Enrollment Fee Due', type: 'nbca', desc: 'Pay $175 x 3 ($525) by EOD to secure spots. 9th = 5 left, 7th = 3 left, 4th = plenty.', funding: '$525 One-Time' },
    { date: 'Apr 06', day: 'Wk Of', isoDate: '2026-04-06', event: 'TEFA Funding Notification', type: 'tefa', desc: 'State notifies families of voucher award status.', funding: 'Paid to Digital Wallet' },
    { date: 'Apr 15', day: 'Wed', isoDate: '2026-04-15', event: 'ACE Scholarship Deadline', type: 'ace', desc: 'Closes 11:59 PM (Tax Day).', funding: 'Deadline' },
    { date: 'Jun 15', day: 'Mon', isoDate: '2026-06-15', event: 'ACE Award Notification', type: 'ace', desc: 'Scholarship decisions released.', funding: 'Paid directly to School' },
    { date: 'Jun 30', day: 'Tue', isoDate: '2026-06-30', event: 'NBCA Withdrawal Deadline', type: 'nbca', desc: 'Can withdraw penalty-free before this date. No tuition due until July.', funding: 'N/A' },
    { date: 'Jul 01', day: 'Wed', isoDate: '2026-07-01', event: 'TEFA Funds Available (25%)', type: 'tefa', desc: 'First tranche of funds available in account.', funding: 'Distribution' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-emerald-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Iddings Family Planner</h1>
            <p className="text-emerald-200 mt-1">NBCA Enrollment 2026-2027</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2 text-sm font-medium">
            {['dashboard', 'timeline', 'checklist', 'essays', 'analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full transition capitalize ${activeTab === tab ? 'bg-white text-emerald-900' : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'}`}
              >
                {tab === 'essays' ? 'App Text' : tab}
              </button>
            ))}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-emerald-800 text-emerald-100 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* Status Overview Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <TrendingUp size={20}/> Application Status
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Item</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Notification</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Funding Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appStatus.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                            {row.status === 'Submitted' ? <CheckCircle size={16} className={row.type === 'success' ? 'text-green-600' : 'text-amber-500'}/> :
                                             row.status === 'Scheduled' ? <Calendar size={16} className="text-blue-600"/> :
                                             <Clock size={16} className="text-amber-500"/>
                                            }
                                            {row.item}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              row.type === 'success' ? 'bg-green-100 text-green-700' :
                                              row.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                              'bg-amber-100 text-amber-700'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{row.date}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{row.funding}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <CreditCard size={20}/> One-Time Fees
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">NBCA Apps (3)</span>
                            <span className="font-bold">${fees.nbcaApp}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">NBCA Enrollment (3)</span>
                            <span className="font-bold">${fees.nbcaEnroll}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">FACTS Fee</span>
                            <span className="font-bold">${fees.factsApp}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">ACE Apps (3)</span>
                            <span className="font-bold">${fees.aceApp}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>${totalFees}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Calculator */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700 mb-4">
                    <DollarSign size={20} /> Financial Estimate Calculator
                    <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-1 rounded ml-auto">
                        "Most Likely" Scenario Loaded
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {/* Tuition Input */}
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">Gross Annual Tuition (3 Kids)</label>
                          <div className="flex items-center mt-1">
                            <span className="text-slate-400 mr-2">$</span>
                            <input
                              type="number"
                              value={tuition}
                              onChange={(e) => setTuition(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono font-bold text-right"
                            />
                          </div>
                        </div>

                        {/* TEFA Toggle */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 relative overflow-hidden">
                          <div className="flex items-start justify-between relative z-10">
                            <div>
                                <div className="font-bold text-blue-900 flex items-center gap-2">
                                    TEFA Voucher
                                    <span className={`text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${analysis.familySuccessRate > 80 ? 'bg-green-500' : analysis.familySuccessRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}>{analysis.familySuccessRate > 90 ? 'Excellent' : analysis.familySuccessRate > 70 ? 'Good' : analysis.familySuccessRate > 50 ? 'Fair' : 'Low'} ({analysis.familySuccessRate.toFixed(1)}%)</span>
                                </div>
                                <div className="text-xs text-blue-700 mt-1">3 x $10,474 (Est)</div>
                                <div className="text-[10px] text-blue-500 mt-2 flex items-center gap-1">
                                    <Briefcase size={10}/> Paid to Digital Wallet
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" checked={includeTefa} onChange={() => setIncludeTefa(!includeTefa)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* ACE Toggle */}
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="flex items-start justify-between">
                            <div>
                                <div className="font-bold text-purple-900 flex items-center gap-2">
                                    ACE Scholarship
                                    <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Low ({'<'}10%)</span>
                                </div>
                                <div className="text-xs text-purple-700 mt-1">Needs-based (~$10k Max)</div>
                                <div className="text-[10px] text-purple-500 mt-2 flex items-center gap-1">
                                    <GraduationCap size={10}/> Paid to School
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input type="checkbox" checked={includeAce} onChange={() => setIncludeAce(!includeAce)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* NBCA Financial Aid Slider */}
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-emerald-900 flex items-center gap-2">
                                <Percent size={14}/> NBCA Fin. Aid
                                <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Moderate</span>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
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
                            className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <div className="flex justify-between text-xs text-emerald-500 mt-1 font-medium">
                            <span>$0</span>
                            <span>$15k Max</span>
                          </div>
                           <div className="text-[10px] text-emerald-600 mt-1">
                                Credited to Tuition
                           </div>
                        </div>

                        {/* NBCA Scholarship Slider */}
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-emerald-900 flex items-center gap-2">
                                <GraduationCap size={14}/> NBCA Scholarship
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Pending Mar 31</span>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
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
                            className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <div className="flex justify-between text-xs text-emerald-500 mt-1 font-medium">
                            <span>$0</span>
                            <span>$15k Max</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 mt-1">
                                Credited to Tuition
                          </div>
                        </div>

                      </div>

                      {/* Results Column */}
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-center h-full">
                        <h3 className="text-slate-500 font-bold uppercase text-xs mb-4">Estimated Breakdown</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-slate-500">
                              <span>Tuition Total:</span>
                              <span>${tuition.toLocaleString()}</span>
                            </div>
                            {includeTefa && (
                              <div className="flex justify-between text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                <span>TEFA Credit:</span>
                                <span>-${totalTefa.toLocaleString()}</span>
                              </div>
                            )}
                            {includeAce && (
                              <div className="flex justify-between text-sm text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                                <span>ACE Credit:</span>
                                <span>-${totalAce.toLocaleString()}</span>
                              </div>
                            )}
                             {nbcaAidAmount > 0 && (
                              <div className="flex justify-between text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                                <span>NBCA Aid:</span>
                                <span>-${nbcaAidAmount.toLocaleString()}</span>
                              </div>
                            )}
                            {nbcaScholarshipAmount > 0 && (
                              <div className="flex justify-between text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                                <span>Scholarship:</span>
                                <span>-${nbcaScholarshipAmount.toLocaleString()}</span>
                              </div>
                            )}
                        </div>

                        <div className="border-t-2 border-dashed border-slate-300 pt-4 mt-auto">
                            <div className="flex justify-between items-end">
                              <span className="font-bold text-slate-700">Est. Annual Cost</span>
                              <span className={`text-3xl font-bold ${finalCost <= 5000 ? 'text-green-600' : 'text-slate-800'}`}>
                                ${finalCost > 0 ? finalCost.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                              </span>
                            </div>
                            <div className="text-right text-sm text-slate-400 mt-1 font-medium">
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
             <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Calendar /> Funding Timeline & Method
              </h2>
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {timelineEvents.map((evt, idx) => {
                  const isPast = evt.isoDate < today;
                  const isNext = idx === nextUpIdx;
                  return (
                  <div key={idx} className={`relative pl-8 ${isPast ? 'opacity-50' : ''}`}>
                    {/* Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm
                      ${isPast ? 'bg-slate-300' :
                        isNext ? 'bg-emerald-500 ring-4 ring-emerald-200' :
                        evt.type === 'nbca' ? 'bg-emerald-500' :
                        evt.type === 'tefa' ? 'bg-blue-500' :
                        evt.type === 'ace' ? 'bg-purple-500' : 'bg-yellow-500'}`}
                    />

                    <div className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition grid grid-cols-1 md:grid-cols-12 gap-4 ${isNext ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-100'}`}>
                      <div className="md:col-span-3">
                        {isNext && (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">Up Next</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide block w-fit mb-1
                           ${evt.type === 'nbca' ? 'bg-emerald-100 text-emerald-800' :
                             evt.type === 'tefa' ? 'bg-blue-100 text-blue-800' :
                             evt.type === 'ace' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {evt.type}
                        </span>
                        <span className="text-sm font-bold text-slate-400">{evt.day}, {evt.date}</span>
                      </div>
                      <div className="md:col-span-6">
                        <h3 className="font-bold text-slate-800">{evt.event}</h3>
                        <p className="text-sm text-slate-600 mt-1">{evt.desc}</p>
                      </div>
                      <div className="md:col-span-3 flex items-center">
                         <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded border border-slate-100 w-full text-center">
                            <span className="block uppercase text-[10px] text-slate-400 mb-1">Funding Method</span>
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
              <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <CheckSquare /> Application Checklist
              </h2>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-800 flex items-start gap-3 mb-6">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>
                  <strong>Note:</strong> Main applications are checked off. Focus on supporting documents (Tax returns, Recommendations).
                </p>
              </div>

              {Object.entries(checklist).map(([key, section]) => (
                <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className={`px-4 py-3 font-bold flex justify-between items-center ${section.color}`}>
                    {section.title}
                    <span className="text-xs bg-white/50 px-2 py-1 rounded">
                      {section.items.filter(i => i.done).length}/{section.items.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(key, item.id)}
                        className="p-3 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition
                          ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                          {item.done && <CheckCircle size={14} />}
                        </div>
                        <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
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
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <FileText /> Application Text & Essays
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {Object.values(applicationTexts).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">{item.title}</h3>
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="text-xs flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-2 py-1 rounded transition"
                    >
                      <Copy size={12} /> Copy Text
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50/30">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
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
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <BarChart2 /> Strategic Financial Analysis Report
            </h2>

            {/* Scenario Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Layers size={18}/> Select Applicant Volume Scenario
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[180000, 200000, 220000, 250000].map((count) => (
                        <button
                            key={count}
                            onClick={() => setApplicantScenario(count)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition
                                ${applicantScenario === count
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                        >
                            {(count / 1000).toFixed(0)}k Applicants
                        </button>
                    ))}
                </div>

                {/* Ineligibility Rate */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Estimated Ineligibility Rate</label>
                        <span className="text-sm font-bold text-slate-800">{Math.round(ineligibilityRate * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={Math.round(ineligibilityRate * 100)}
                        onChange={(e) => setIneligibilityRate(parseInt(e.target.value) / 100)}
                        className="w-full accent-slate-700"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0%</span>
                        <span>10%</span>
                        <span>20%</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                        Total Applicants: <strong>{applicantScenario.toLocaleString()}</strong> → Eligible: <strong>{analysis.eligibleApps.toLocaleString()}</strong> ({Math.round(ineligibilityRate * 100)}% ineligible)
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                        Comptroller reported ~10% overall ineligibility (~50% for pre-K, much lower for K-12)
                    </div>
                </div>

                {/* Scenario Result */}
                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Tier 3 (Your) Probability</div>
                        <div className={`text-2xl font-bold ${analysis.familySuccessRate > 80 ? 'text-green-600' : analysis.familySuccessRate > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {analysis.familySuccessRate.toFixed(1)}% <span className="text-sm font-normal text-slate-400">(Family)</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Individual Child Chance: {analysis.tier3SuccessRate.toFixed(1)}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Program Status</div>
                        <div className="text-sm text-slate-700 mt-1">
                            Capacity: <strong>~{analysis.capacity.toLocaleString()}</strong> students
                        </div>
                        <div className="text-sm text-slate-700">
                            Tier 4 Funding: <strong>{analysis.tier4SuccessRate.toFixed(1)}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Iddings Family Funding Strategy</h3>
                        <p className="text-slate-300 text-sm">Funding Probability Assessment (2026-2027)</p>
                    </div>
                </div>
                <div className="p-8">
                    <div className="prose prose-sm max-w-none text-slate-700">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">1. The Projection Model</h3>
                        <p className="mb-4">
                            As of March 16th, <strong>200,003</strong> applications have been submitted (per the updated fact sheet). The application window
                            closes <strong>March 17 at 11:59 PM CT</strong>. Acting Comptroller Hancock: "We're expecting to sell out in year one."
                            More than 2,200 schools have signed up. The waitlist will be reported to the Texas Legislature to determine funding for future years.
                            With the window nearly closed, <strong>200,003</strong> represents the near-final total. The current scenario is set to <strong>{applicantScenario.toLocaleString()}</strong> total applicants.
                        </p>
                        <p className="mb-4">
                            <strong>Not all applicants are eligible.</strong> The Comptroller reported that approximately 18,000 of 184,000 applicants
                            reviewed at an earlier count were ineligible — roughly 10% overall. Pre-K applications had ~50% ineligibility,
                            while K-12 was much lower. This model accounts for ineligibility (currently set to {Math.round(ineligibilityRate * 100)}%),
                            reducing the eligible pool to <strong>{analysis.eligibleApps.toLocaleString()}</strong> applicants competing for funding.
                        </p>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">2. Supply vs. Demand</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li><strong>Total Budget:</strong> $1 Billion</li>
                            <li><strong>Weighted Avg Cost:</strong> ~$8,630 (78% Private / 22% Homeschool mix)</li>
                            <li><strong>Estimated Capacity:</strong> ~{analysis.capacity.toLocaleString()} Students</li>
                            <li><strong>Eligible Applicants:</strong> ~{analysis.eligibleApps.toLocaleString()} (after {Math.round(ineligibilityRate * 100)}% ineligibility)</li>
                        </ul>
                        <p className="mb-4 text-xs text-slate-500">
                            Note: Eligible pre-K students also draw from the same $1B budget pool. Pre-K vouchers are $10,500 (if free public pre-K criteria are met) or $2,000, consuming meaningful budget before K-12 tiers are funded.
                        </p>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">3. Tier Analysis: Who Gets Funded?</h3>
                        <p className="mb-4">With {analysis.eligibleApps.toLocaleString()} eligible applicants (of {applicantScenario.toLocaleString()} total), here is how the budget drains:</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 1 — Disability + ≤500% FPL (12%)</div>
                                <div className="text-sm text-green-700">
                                    {analysis.demandT1.toLocaleString()} applicants → 100% FUNDED
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 2 — ≤200% FPL (30%)</div>
                                <div className="text-sm text-green-700">
                                    {analysis.demandT2.toLocaleString()} applicants → 100% FUNDED
                                </div>
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier3SuccessRate === 100 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className={`font-bold ${analysis.tier3SuccessRate === 100 ? 'text-green-800' : 'text-amber-800'}`}>
                                    Tier 3 — 200-500% FPL (30%) — Your Family
                                </div>
                                <div className={`text-sm ${analysis.tier3SuccessRate === 100 ? 'text-green-700' : 'text-amber-700'}`}>
                                    {analysis.demandT3.toLocaleString()} applicants → {analysis.tier3SuccessRate === 100 ? '100% FUNDED' : `${analysis.tier3SuccessRate.toFixed(1)}% Funded (Lottery)`}
                                </div>
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier4SuccessRate === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`font-bold ${analysis.tier4SuccessRate === 100 ? 'text-green-800' : 'text-red-800'}`}>
                                    Tier 4a — ≥500% FPL + Public School (5%) & Tier 4b — ≥500% FPL (23%)
                                </div>
                                <div className={`text-sm ${analysis.tier4SuccessRate === 100 ? 'text-green-700' : 'text-red-700'}`}>
                                    {(analysis.demandT4a + analysis.demandT4b).toLocaleString()} applicants → {analysis.tier4SuccessRate.toFixed(1)}% Funded
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">4. Conclusion for Iddings Family</h3>
                        <p>
                            With a projected {applicantScenario.toLocaleString()} total applicants, your family has a
                            <strong> {analysis.familySuccessRate.toFixed(1)}% </strong> statistical probability of securing funding.
                            {analysis.familySuccessRate > 90
                                ? " You are in the 'Safe Zone'. The budget is sufficient to cover your tier."
                                : " You are in a competitive lottery, but the 'Sibling Rule' gives you a massive mathematical advantage."}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        )}

      </main>

      <footer className="max-w-6xl mx-auto p-6 text-center text-slate-400 text-xs mt-8">
        <p>Created for Iddings Family | 2026-2027 Academic Year</p>
        <p className="mt-1">Disclaimer: All financial figures are estimates based on 2026 projections. Final awards are determined by respective agencies.</p>
      </footer>
    </div>
  );
};

export default IddingsPlanner;
