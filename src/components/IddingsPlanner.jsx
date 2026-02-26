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

  // Scenario State - null means "use model's best estimate"
  const [applicantScenario, setApplicantScenario] = useState(null);

  // Student Data
  const students = [
    { name: 'Cassius', grade: '9th Grade', school: 'High School', aceAmount: 4000 },
    { name: 'Dorothy', grade: '7th Grade', school: 'Middle School', aceAmount: 3000 },
    { name: 'Sebastian', grade: '4th Grade', school: 'Elementary', aceAmount: 3000 }
  ];

  // TEFA Application Window & Data Points
  const TEFA_WINDOW = {
    startDate: new Date('2026-02-04T00:00:00'),
    endDate: new Date('2026-03-17T23:59:59'),
    totalDays: 41,
  };

  // Known data from TEA Fact Sheets — add new rows as they're released
  const TEFA_DATA_POINTS = [
    { date: '2026-02-08', day: 4,  cumulative: 76000,  source: 'TEA Fact Sheet (Feb 8)', approximate: true },
    { date: '2026-02-16', day: 12, cumulative: 101000, source: 'TEA Fact Sheet (Feb 16)', approximate: false },
    { date: '2026-02-22', day: 18, cumulative: 123743, source: 'TEA Fact Sheet (Feb 22)', approximate: false },
    { date: '2026-02-25', day: 21, cumulative: 130000, source: 'TEA Fact Sheet (Feb 25)', approximate: false },
  ];

  const PROJECTION_SCENARIOS = {
    low:  { decayRate: 0.935, surgeMultiplier: 1.3, label: 'Low' },
    mid:  { decayRate: 0.950, surgeMultiplier: 2.0, label: 'Projected' },
    high: { decayRate: 0.965, surgeMultiplier: 3.0, label: 'High' },
  };

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
    factsApp: 40,     // $40 per family
    aceApp: 0         // $0 (Waived per user update)
  };
  const totalFees = fees.nbcaApp + fees.factsApp + fees.aceApp;

  // Recurring Financial Calculations
  const totalTefa = includeTefa ? tefaPerStudent * 3 : 0;
  const totalAce = includeAce ? students.reduce((acc, s) => acc + s.aceAmount, 0) : 0;

  const totalAid = totalTefa + totalAce + nbcaAidAmount + nbcaScholarshipAmount;
  const finalCost = tuition - totalAid;
  const monthlyCost = finalCost > 0 ? finalCost / 10 : 0; // 10 month plan estimate

  // Status Tracking Data
  const appStatus = [
    { item: "NBCA Application", status: "Submitted", date: "Pending Review", type: "success", funding: "N/A" },
    { item: "NBCA Financial Aid", status: "Submitted", date: "End of March", type: "success", funding: "Tuition Credit" },
    { item: "TEFA Scholarship", status: "Submitted", date: "Early April", type: "success", funding: "Digital Wallet" },
    { item: "ACE Scholarship", status: "Submitted", date: "June", type: "success", funding: "Check to School" },
    { item: "NBCA Scholarship", status: "Submitted", date: "Unknown?", type: "success", funding: "Tuition Credit" },
    { item: "Student Assessments", status: "Scheduled", date: "Feb 20", type: "pending", funding: "N/A" },
    { item: "Family Interview", status: "Scheduled", date: "Feb 27 (Fri)", type: "pending", funding: "N/A" },
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
        { id: 'nbca-assess', text: 'Student Assessments (Scheduled Feb 20)', done: false },
        { id: 'nbca-interview', text: 'Family Interview (Scheduled Feb 27)', done: false },
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

  // Projection Engine — fits a daily rate decay model to TEA data points
  const projectTotalApplicants = () => {
    const { totalDays } = TEFA_WINDOW;
    const today = new Date();
    const currentDay = Math.min(
      totalDays,
      Math.max(1, Math.floor((today - TEFA_WINDOW.startDate) / 86400000) + 1)
    );

    // Sort data points by day
    const sorted = [...TEFA_DATA_POINTS].sort((a, b) => a.day - b.day);
    const latest = sorted[sorted.length - 1];

    const runScenario = ({ decayRate, surgeMultiplier }) => {
      const surgeStartDay = totalDays - 5; // last 5 days

      // Raw daily rate shape: exponential decay with deadline surge
      const rawRate = (t) => {
        const base = Math.pow(decayRate, t - 1);
        if (t >= surgeStartDay) {
          const progress = (t - surgeStartDay + 1) / (totalDays - surgeStartDay + 1);
          return base * (1 + (surgeMultiplier - 1) * progress);
        }
        return base;
      };

      // Scale so cumulative through anchor day matches latest data point
      let sumToAnchor = 0;
      for (let t = 1; t <= latest.day; t++) sumToAnchor += rawRate(t);
      const scale = latest.cumulative / sumToAnchor;

      // Build full daily curve
      const dailyCurve = [];
      let cumulative = 0;
      for (let t = 1; t <= totalDays; t++) {
        const daily = Math.round(rawRate(t) * scale);
        cumulative += daily;
        dailyCurve.push({ day: t, daily, cumulative, isProjected: t > latest.day });
      }

      return { total: cumulative, dailyCurve };
    };

    const low = runScenario(PROJECTION_SCENARIOS.low);
    const mid = runScenario(PROJECTION_SCENARIOS.mid);
    const high = runScenario(PROJECTION_SCENARIOS.high);

    return {
      low: low.total, mid: mid.total, high: high.total,
      lowCurve: low.dailyCurve, midCurve: mid.dailyCurve, highCurve: high.dailyCurve,
      currentDay, anchorDay: latest.day, anchorCumulative: latest.cumulative,
      daysRemaining: Math.max(0, totalDays - currentDay),
      dataPoints: sorted,
    };
  };

  const projection = projectTotalApplicants();

  // Scenario Logic
  const getScenarioAnalysis = (totalApps) => {
    // Constants from Feb 22 Fact Sheet (Window open through March 17)
    const budget = 1000000000; // $1 Billion
    const tier1_2_pct = 0.41; // 41% (11% Tier 1 + 30% Tier 2)
    const tier3_pct = 0.31;   // 31% (Your Tier: 200-500% FPL)
    const tier4_pct = 0.28;   // 28% (5% public school + 23% ≥500% FPL)

    // Costs (updated: 79% Private, 21% Homeschool)
    const privateCost = 10500;
    const homeCost = 2000;
    const weightedAvg = (privateCost * 0.79) + (homeCost * 0.21); // ~$8,715 (79% Private / 21% Homeschool)

    // Capacity
    const capacity = Math.floor(budget / weightedAvg); // ~113,636 students

    // Demand by Tier
    const demandT1_2 = Math.round(totalApps * tier1_2_pct);
    const demandT3 = Math.round(totalApps * tier3_pct);
    const demandT4 = Math.round(totalApps * tier4_pct);

    // Funding Logic (Priority Order)
    let remainingSlots = capacity;

    // Fund Tier 1 & 2
    const fundedT1_2 = Math.min(remainingSlots, demandT1_2);
    remainingSlots -= fundedT1_2;

    // Fund Tier 3 (You)
    const fundedT3 = Math.min(remainingSlots, demandT3);
    const tier3SuccessRate = (fundedT3 / demandT3) * 100;
    remainingSlots -= fundedT3;

    // Fund Tier 4 (Capped at 20% of budget anyway, but let's see slots)
    const fundedT4 = Math.min(remainingSlots, demandT4);
    const tier4SuccessRate = (fundedT4 / demandT4) * 100;

    // Sibling Rule Math for Tier 3
    // Probability of all 3 kids losing lottery
    const singleFailureRate = 1 - (tier3SuccessRate / 100);
    const allThreeFail = singleFailureRate * singleFailureRate * singleFailureRate;
    const familySuccessRate = (1 - allThreeFail) * 100;

    return {
        capacity,
        demandT3,
        fundedT3,
        tier3SuccessRate,
        familySuccessRate,
        tier4SuccessRate
    };
  };

  const effectiveScenario = applicantScenario ?? projection.mid;
  const analysis = getScenarioAnalysis(effectiveScenario);

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
    { date: 'Feb 20', day: 'Fri', event: 'Student Assessments', type: 'nbca', desc: 'Required testing for placement.', funding: 'N/A' },
    { date: 'Feb 27', day: 'Fri', event: 'Family Interview', type: 'nbca', desc: 'Final step before acceptance decision.', funding: 'N/A' },
    { date: 'Mar 14', day: 'Sat', event: 'NBCA Round 1 Notification', type: 'nbca', desc: 'Acceptance letters emailed to families.', funding: 'Decision Only' },
    { date: 'Mar 17', day: 'Tue', event: 'TEFA Application Closes', type: 'tefa', desc: 'Strict deadline. Lottery priority set by income.', funding: 'Deadline' },
    { date: 'Mar 31', day: 'Tue', event: 'NBCA Aid Award Letter', type: 'facts', desc: 'Financial aid offers sent. Must accept within 2 weeks.', funding: 'Credited to Tuition' },
    { date: 'Apr 06', day: 'Wk Of', event: 'TEFA Funding Notification', type: 'tefa', desc: 'State notifies families of voucher award status.', funding: 'Paid to Digital Wallet' },
    { date: 'Apr 15', day: 'Wed', event: 'ACE Scholarship Deadline', type: 'ace', desc: 'Closes 11:59 PM (Tax Day).', funding: 'Deadline' },
    { date: 'Jun 15', day: 'Mon', event: 'ACE Award Notification', type: 'ace', desc: 'Scholarship decisions released.', funding: 'Paid directly to School' },
    { date: 'Jul 01', day: 'Wed', event: 'TEFA Funds Available (25%)', type: 'tefa', desc: 'First tranche of funds available in account.', funding: 'Distribution' },
  ];

  // SVG Projection Chart
  const ProjectionChart = () => {
    const W = 700, H = 320;
    const pad = { top: 24, right: 55, bottom: 44, left: 65 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const maxY = Math.max(projection.high, ...projection.highCurve.map(d => d.cumulative));
    const yMax = Math.ceil(maxY / 25000) * 25000; // round up to nearest 25k

    const x = (day) => pad.left + ((day - 1) / (TEFA_WINDOW.totalDays - 1)) * plotW;
    const y = (val) => pad.top + plotH - (val / yMax) * plotH;

    const pathFromCurve = (curve, fromDay = 1) => {
      const pts = curve.filter(d => d.day >= fromDay);
      return pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.day).toFixed(1)},${y(d.cumulative).toFixed(1)}`).join(' ');
    };

    // Confidence band between low and high (projected portion only)
    const bandPath = () => {
      const from = projection.anchorDay;
      const hi = projection.highCurve.filter(d => d.day >= from);
      const lo = [...projection.lowCurve.filter(d => d.day >= from)].reverse();
      const forward = hi.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.day).toFixed(1)},${y(d.cumulative).toFixed(1)}`);
      const backward = lo.map(d => `L${x(d.day).toFixed(1)},${y(d.cumulative).toFixed(1)}`);
      return forward.join(' ') + ' ' + backward.join(' ') + ' Z';
    };

    // Y-axis ticks
    const yTicks = [];
    for (let v = 0; v <= yMax; v += 25000) yTicks.push(v);

    // X-axis date labels
    const xLabels = [
      { day: 1, label: 'Feb 4' },
      { day: 8, label: 'Feb 11' },
      { day: 15, label: 'Feb 18' },
      { day: 22, label: 'Feb 25' },
      { day: 29, label: 'Mar 4' },
      { day: 36, label: 'Mar 11' },
      { day: 41, label: 'Mar 17' },
    ];

    const capacityY = y(analysis.capacity);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="TEFA Application Projection Chart">
        {/* Grid lines */}
        {yTicks.map(v => (
          <line key={v} x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="1" />
        ))}

        {/* Capacity line */}
        <line x1={pad.left} x2={W - pad.right} y1={capacityY} y2={capacityY} stroke="#ef4444" strokeWidth="1" strokeDasharray="6,4" />
        <text x={W - pad.right + 4} y={capacityY + 4} fontSize="9" fill="#ef4444" fontWeight="bold">Capacity</text>

        {/* Confidence band */}
        <path d={bandPath()} fill="rgba(59,130,246,0.1)" />

        {/* Low curve (dashed, light) */}
        <path d={pathFromCurve(projection.lowCurve, projection.anchorDay)} fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />

        {/* High curve (dashed, light) */}
        <path d={pathFromCurve(projection.highCurve, projection.anchorDay)} fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />

        {/* Actual data line (solid) */}
        <path d={pathFromCurve(projection.midCurve.filter(d => d.day <= projection.anchorDay))} fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" />

        {/* Projected mid line (dashed) */}
        <path d={pathFromCurve(projection.midCurve, projection.anchorDay)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />

        {/* Today marker */}
        {projection.currentDay <= TEFA_WINDOW.totalDays && (
          <>
            <line x1={x(projection.currentDay)} x2={x(projection.currentDay)} y1={pad.top} y2={pad.top + plotH} stroke="#64748b" strokeWidth="1" strokeDasharray="4,3" />
            <text x={x(projection.currentDay)} y={pad.top - 6} fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="bold">Today</text>
          </>
        )}

        {/* Data point dots */}
        {projection.dataPoints.map((dp, i) => (
          <g key={i}>
            <circle cx={x(dp.day)} cy={y(dp.cumulative)} r="5" fill="#1e40af" stroke="white" strokeWidth="2" />
            <title>{dp.source}: {dp.cumulative.toLocaleString()}</title>
          </g>
        ))}

        {/* End-of-line labels */}
        <text x={W - pad.right + 4} y={y(projection.mid) + 4} fontSize="10" fill="#3b82f6" fontWeight="bold">{Math.round(projection.mid / 1000)}k</text>
        <text x={W - pad.right + 4} y={y(projection.low) + 4} fontSize="9" fill="#93c5fd">{Math.round(projection.low / 1000)}k</text>
        <text x={W - pad.right + 4} y={y(projection.high) + 4} fontSize="9" fill="#93c5fd">{Math.round(projection.high / 1000)}k</text>

        {/* Y-axis labels */}
        {yTicks.map(v => (
          <text key={v} x={pad.left - 8} y={y(v) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
            {v === 0 ? '0' : `${v / 1000}k`}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ day, label }) => (
          <text key={day} x={x(day)} y={H - pad.bottom + 18} fontSize="10" fill="#94a3b8" textAnchor="middle">{label}</text>
        ))}

        {/* Axes */}
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + plotH} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={pad.left} x2={W - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    );
  };

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
                                    <span className={`text-[10px] ${analysis.familySuccessRate > 90 ? 'bg-green-500' : analysis.familySuccessRate > 60 ? 'bg-amber-500' : 'bg-red-500'} text-white px-1.5 py-0.5 rounded uppercase tracking-wide`}>
                                        {analysis.familySuccessRate > 90 ? 'Excellent' : analysis.familySuccessRate > 60 ? 'Good' : 'Competitive'} ({analysis.familySuccessRate.toFixed(0)}%)
                                    </span>
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
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-amber-900 flex items-center gap-2">
                                <GraduationCap size={14}/> NBCA Scholarship
                                <span className="text-[10px] bg-slate-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">Unknown</span>
                            </div>
                            <div className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
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
                            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                          />
                          <div className="flex justify-between text-xs text-amber-500 mt-1 font-medium">
                            <span>$0</span>
                            <span>$15k Max</span>
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
                              <div className="flex justify-between text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
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
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Calendar /> Funding Timeline & Method
              </h2>
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-8">
                    {/* Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm
                      ${evt.type === 'nbca' ? 'bg-emerald-500' :
                        evt.type === 'tefa' ? 'bg-blue-500' :
                        evt.type === 'ace' ? 'bg-purple-500' : 'bg-yellow-500'}`}
                    />

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
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
                ))}
              </div>
          </div>
        )}

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

            {/* Projection Hero Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <TrendingUp size={18}/> Projected Total Applicants
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        Data-Driven Model
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                    Based on {projection.dataPoints.length} TEA data points.
                    Last update: {projection.dataPoints[projection.dataPoints.length - 1].source}.
                    {projection.daysRemaining > 0
                        ? ` ${projection.daysRemaining} days remaining in window.`
                        : ' Application window has closed.'}
                </p>

                {/* Low / Mid / High Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        onClick={() => setApplicantScenario(projection.low)}
                        className={`text-center p-3 rounded-lg border transition ${
                            applicantScenario === projection.low
                                ? 'bg-green-100 border-green-400 ring-2 ring-green-300'
                                : 'bg-green-50 border-green-200 hover:border-green-300'
                        }`}
                    >
                        <div className="text-[10px] text-green-600 font-bold uppercase">Low</div>
                        <div className="text-xl font-bold text-green-700">{Math.round(projection.low / 1000)}k</div>
                    </button>
                    <button
                        onClick={() => setApplicantScenario(null)}
                        className={`text-center p-3 rounded-lg border-2 transition ${
                            applicantScenario === null
                                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300'
                                : 'bg-blue-50 border-blue-300 hover:border-blue-400'
                        }`}
                    >
                        <div className="text-[10px] text-blue-600 font-bold uppercase">Best Estimate</div>
                        <div className="text-2xl font-bold text-blue-700">{Math.round(projection.mid / 1000)}k</div>
                    </button>
                    <button
                        onClick={() => setApplicantScenario(projection.high)}
                        className={`text-center p-3 rounded-lg border transition ${
                            applicantScenario === projection.high
                                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                                : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                        }`}
                    >
                        <div className="text-[10px] text-amber-600 font-bold uppercase">High</div>
                        <div className="text-xl font-bold text-amber-700">{Math.round(projection.high / 1000)}k</div>
                    </button>
                </div>

                {/* Projection Chart */}
                <div className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                    <ProjectionChart />
                    <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-blue-800"></span> Actual</span>
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-blue-400 border-b border-dashed"></span> Projected</span>
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-100 rounded-sm"></span> Range</span>
                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-red-400 border-b border-dashed"></span> Capacity</span>
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

                {/* Manual Override */}
                <details className="mt-4 pt-3 border-t border-slate-100">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none">
                        Manual override (pick your own scenario)
                    </summary>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[130000, 150000, 160000, 180000, 200000, 220000].map((count) => (
                            <button
                                key={count}
                                onClick={() => setApplicantScenario(count)}
                                className={`py-1.5 px-2 rounded text-xs font-medium border transition
                                    ${applicantScenario === count
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                            >
                                {(count / 1000).toFixed(0)}k Applicants
                            </button>
                        ))}
                    </div>
                </details>
            </div>

            {/* Prose Analysis */}
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
                            Based on {projection.dataPoints.length} TEA data points through {projection.dataPoints[projection.dataPoints.length - 1].source.match(/\((.+)\)/)?.[1] || 'latest'},
                            <strong> {projection.anchorCumulative.toLocaleString()}</strong> applications have been confirmed
                            ({projection.anchorDay} of {TEFA_WINDOW.totalDays} days elapsed). Our projection model uses daily rate decay
                            with a deadline surge, estimating a final total of <strong>~{Math.round(projection.mid / 1000)}k</strong> applicants
                            (range: {Math.round(projection.low / 1000)}k &ndash; {Math.round(projection.high / 1000)}k).
                            {projection.daysRemaining > 0
                                ? ` There are ${projection.daysRemaining} days remaining in the application window (closes March 17 at 11:59 PM CT).`
                                : ' The application window has closed.'}
                            {' '}The active scenario is <strong>{effectiveScenario.toLocaleString()}</strong> total applicants.
                        </p>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">2. Supply vs. Demand</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li><strong>Total Budget:</strong> $1 Billion</li>
                            <li><strong>Weighted Avg Cost:</strong> ~$8,715 (79% Private / 21% Homeschool mix)</li>
                            <li><strong>Estimated Capacity:</strong> ~{analysis.capacity.toLocaleString()} Students</li>
                        </ul>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">3. Tier Analysis: Who Gets Funded?</h3>
                        <p className="mb-4">With {effectiveScenario.toLocaleString()} applicants, here is how the budget drains:</p>

                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <div className="font-bold text-green-800">Tier 1 & 2 (Priority)</div>
                                <div className="text-sm text-green-700">Status: 100% FUNDED</div>
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier3SuccessRate === 100 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <div className={`font-bold ${analysis.tier3SuccessRate === 100 ? 'text-green-800' : 'text-amber-800'}`}>
                                    Tier 3 (Your Family - Middle Income)
                                </div>
                                <div className={`text-sm ${analysis.tier3SuccessRate === 100 ? 'text-green-700' : 'text-amber-700'}`}>
                                    Status: {analysis.tier3SuccessRate === 100 ? '100% FUNDED' : `${analysis.tier3SuccessRate.toFixed(1)}% Funded (Lottery)`}
                                </div>
                            </div>
                            <div className={`p-3 border rounded ${analysis.tier4SuccessRate === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`font-bold ${analysis.tier4SuccessRate === 100 ? 'text-green-800' : 'text-red-800'}`}>
                                    Tier 4 (High Income {'>'}$175k)
                                </div>
                                <div className={`text-sm ${analysis.tier4SuccessRate === 100 ? 'text-green-700' : 'text-red-700'}`}>
                                    Status: {analysis.tier4SuccessRate.toFixed(1)}% Funded
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg mb-2">4. Conclusion for Iddings Family</h3>
                        <p>
                            With a projected {effectiveScenario.toLocaleString()} total applicants, your family has a
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
