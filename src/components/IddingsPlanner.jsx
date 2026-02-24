import React, { useState, useMemo } from 'react';
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

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n) => `${(n * 100).toFixed(1)}%`;

const IddingsPlanner = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Scenario State
  const [applicantScenario, setApplicantScenario] = useState(140000);

  // Student Data
  const students = [
    { name: 'Cassius', grade: '9th Grade', school: 'High School', aceAmount: 4000 },
    { name: 'Dorothy', grade: '7th Grade', school: 'Middle School', aceAmount: 3000 },
    { name: 'Sebastian', grade: '4th Grade', school: 'Elementary', aceAmount: 3000 }
  ];

  // Financial Data State
  const [tuition, setTuition] = useState(43505);
  const [tefaPerStudent, setTefaPerStudent] = useState(10474);
  const [includeTefa, setIncludeTefa] = useState(true);
  const [includeAce, setIncludeAce] = useState(true);

  // Voucher tiers based on income
  const voucherTiers = [
    { maxIncome: 100000, voucherPct: 1.0, label: 'Full Voucher (100%)' },
    { maxIncome: 125000, voucherPct: 0.75, label: 'Reduced Voucher (75%)' },
    { maxIncome: 150000, voucherPct: 0.50, label: 'Partial Voucher (50%)' },
    { maxIncome: 200000, voucherPct: 0.25, label: 'Minimal Voucher (25%)' }
  ];

  const baseVoucherAmount = 8000;

  // Derived calculations
  const calc = useMemo(() => {
    const tier = voucherTiers.find(t => applicantScenario <= t.maxIncome) || { voucherPct: 0, label: 'Over Income Limit' };
    const voucherPerStudent = Math.round(baseVoucherAmount * tier.voucherPct);
    const totalVoucher = voucherPerStudent * students.length;
    const totalTefa = includeTefa ? tefaPerStudent * students.length : 0;
    const totalAce = includeAce ? students.reduce((sum, s) => sum + s.aceAmount, 0) : 0;
    const totalAid = totalVoucher + totalTefa + totalAce;
    const totalTuition = tuition * students.length;
    const outOfPocket = Math.max(0, totalTuition - totalAid);
    const coveragePct = totalTuition > 0 ? Math.min(1, totalAid / totalTuition) : 0;
    const monthlyPayment = Math.round(outOfPocket / 10);

    return {
      tier,
      voucherPerStudent,
      totalVoucher,
      totalTefa,
      totalAce,
      totalAid,
      totalTuition,
      outOfPocket,
      coveragePct,
      monthlyPayment
    };
  }, [applicantScenario, tuition, tefaPerStudent, includeTefa, includeAce]);

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Gather income verification documents (W-2s, tax returns)', done: false, deadline: 'Mar 1' },
    { id: 2, text: 'Complete voucher application online', done: false, deadline: 'Mar 15' },
    { id: 3, text: 'Submit TEFA application per student', done: false, deadline: 'Apr 1' },
    { id: 4, text: 'Apply for ACE Scholarship per student', done: false, deadline: 'Apr 1' },
    { id: 5, text: 'Confirm school enrollment for all students', done: false, deadline: 'May 1' },
    { id: 6, text: 'Set up tuition payment plan', done: false, deadline: 'Jun 1' },
    { id: 7, text: 'Review award letters and finalize budget', done: false, deadline: 'Jul 15' }
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  // Timeline milestones
  const timeline = [
    { month: 'Feb', title: 'Gather Documents', desc: 'Collect tax returns, W-2s, proof of residency', icon: FileText, status: 'current' },
    { month: 'Mar', title: 'Submit Applications', desc: 'Voucher application and TEFA forms', icon: CheckSquare, status: 'upcoming' },
    { month: 'Apr', title: 'ACE Scholarships', desc: 'Complete ACE scholarship applications', icon: GraduationCap, status: 'upcoming' },
    { month: 'May', title: 'Enrollment Confirmed', desc: 'Finalize school enrollment for all students', icon: Users, status: 'upcoming' },
    { month: 'Jun', title: 'Payment Plan', desc: 'Set up 10-month tuition payment schedule', icon: CreditCard, status: 'upcoming' },
    { month: 'Jul', title: 'Budget Finalized', desc: 'Review all awards, lock in family budget', icon: CheckCircle, status: 'upcoming' }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'calculator', label: 'Calculator', icon: DollarSign },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'scenarios', label: 'Scenarios', icon: BarChart2 }
  ];

  // --- Tab Content ---

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={GraduationCap} label="Students" value={students.length} color="blue" />
        <SummaryCard icon={DollarSign} label="Total Aid" value={fmt(calc.totalAid)} color="green" />
        <SummaryCard icon={CreditCard} label="Out of Pocket" value={fmt(calc.outOfPocket)} color="orange" />
        <SummaryCard icon={Percent} label="Coverage" value={pct(calc.coveragePct)} color="purple" />
      </div>

      {/* Aid Breakdown */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" /> Aid Breakdown
        </h3>
        <div className="space-y-3">
          <BarRow label="Voucher" amount={calc.totalVoucher} max={calc.totalTuition} color="bg-blue-500" />
          <BarRow label="TEFA" amount={calc.totalTefa} max={calc.totalTuition} color="bg-emerald-500" />
          <BarRow label="ACE Scholarship" amount={calc.totalAce} max={calc.totalTuition} color="bg-violet-500" />
          <BarRow label="Out of Pocket" amount={calc.outOfPocket} max={calc.totalTuition} color="bg-orange-400" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm font-medium text-gray-600">
          <span>Total Tuition ({students.length} students)</span>
          <span className="text-gray-900">{fmt(calc.totalTuition)}</span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Voucher Tier
          </h3>
          <p className="text-2xl font-bold text-blue-700">{calc.tier.label}</p>
          <p className="text-sm text-gray-500 mt-1">Based on household income of {fmt(applicantScenario)}</p>
          <p className="text-sm text-gray-500">{fmt(calc.voucherPerStudent)} per student</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" /> Monthly Payment
          </h3>
          <p className="text-2xl font-bold text-orange-700">{fmt(calc.monthlyPayment)}<span className="text-base font-normal text-gray-500"> /mo</span></p>
          <p className="text-sm text-gray-500 mt-1">10-month payment plan</p>
          <p className="text-sm text-gray-500">Total remaining: {fmt(calc.outOfPocket)}</p>
        </div>
      </div>

      {/* Checklist Progress */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-600" /> Application Progress
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {checklist.filter(c => c.done).length} of {checklist.length} tasks completed
        </p>
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" /> Tuition & Aid Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Household Income</label>
              <input
                type="number"
                value={applicantScenario}
                onChange={e => setApplicantScenario(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Tuition (per student)</label>
              <input
                type="number"
                value={tuition}
                onChange={e => setTuition(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TEFA Amount (per student)</label>
              <input
                type="number"
                value={tefaPerStudent}
                onChange={e => setTefaPerStudent(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeTefa} onChange={() => setIncludeTefa(!includeTefa)} className="rounded" />
                Include TEFA
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeAce} onChange={() => setIncludeAce(!includeAce)} className="rounded" />
                Include ACE
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-800">Results</h4>
            <ResultRow label="Total Tuition" value={fmt(calc.totalTuition)} />
            <ResultRow label="Voucher Total" value={fmt(calc.totalVoucher)} highlight="blue" />
            <ResultRow label="TEFA Total" value={fmt(calc.totalTefa)} highlight="emerald" />
            <ResultRow label="ACE Total" value={fmt(calc.totalAce)} highlight="violet" />
            <div className="border-t border-gray-300 pt-3">
              <ResultRow label="Total Aid" value={fmt(calc.totalAid)} bold />
              <ResultRow label="Out of Pocket" value={fmt(calc.outOfPocket)} bold highlight="orange" />
              <ResultRow label="Monthly (10 mo)" value={fmt(calc.monthlyPayment)} bold />
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Tier Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" /> Voucher Tier Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-600">Max Income</th>
                <th className="text-left py-2 pr-4 text-gray-600">Tier</th>
                <th className="text-right py-2 text-gray-600">Per Student</th>
              </tr>
            </thead>
            <tbody>
              {voucherTiers.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 ${applicantScenario <= t.maxIncome && (i === 0 || applicantScenario > voucherTiers[i - 1].maxIncome) ? 'bg-blue-50 font-medium' : ''}`}
                >
                  <td className="py-2 pr-4">{fmt(t.maxIncome)}</td>
                  <td className="py-2 pr-4">{t.label}</td>
                  <td className="py-2 text-right">{fmt(Math.round(baseVoucherAmount * t.voucherPct))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" /> Student Profiles
      </h3>
      {students.map((s, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{s.name}</h4>
              <p className="text-sm text-gray-500">{s.grade} &middot; {s.school}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <MiniStat label="Tuition" value={fmt(tuition)} />
            <MiniStat label="Voucher" value={fmt(calc.voucherPerStudent)} />
            <MiniStat label="TEFA" value={includeTefa ? fmt(tefaPerStudent) : '—'} />
            <MiniStat label="ACE" value={includeAce ? fmt(s.aceAmount) : '—'} />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm font-medium">
            <span className="text-gray-600">Net Cost</span>
            <span className="text-orange-700">
              {fmt(Math.max(0, tuition - calc.voucherPerStudent - (includeTefa ? tefaPerStudent : 0) - (includeAce ? s.aceAmount : 0)))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChecklist = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-600" /> Application Checklist
        </h3>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
      <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
        {checklist.map(item => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
              {item.done && <CheckCircle className="w-4 h-4" />}
            </div>
            <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.text}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{item.deadline}</span>
          </div>
        ))}
      </div>
      {checklist.every(c => c.done) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-800 font-medium">All tasks completed! You're ready for the school year.</p>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" /> Application Timeline
      </h3>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="relative">
          {timeline.map((m, i) => {
            const Icon = m.icon;
            const isCurrent = m.status === 'current';
            return (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                {/* Vertical line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isCurrent ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{m.month}</span>
                    <h4 className={`font-semibold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>{m.title}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderScenarios = () => {
    const incomeScenarios = [100000, 123000, 140000, 160000, 200000];
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-600" /> Income Scenarios
        </h3>
        <p className="text-sm text-gray-500">Compare how different household income levels affect your aid package.</p>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-600">Income</th>
                <th className="text-right py-3 px-4 text-gray-600">Voucher</th>
                <th className="text-right py-3 px-4 text-gray-600">TEFA</th>
                <th className="text-right py-3 px-4 text-gray-600">ACE</th>
                <th className="text-right py-3 px-4 text-gray-600">Total Aid</th>
                <th className="text-right py-3 px-4 text-gray-600">Out of Pocket</th>
                <th className="text-right py-3 px-4 text-gray-600">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {incomeScenarios.map(income => {
                const tier = voucherTiers.find(t => income <= t.maxIncome) || { voucherPct: 0 };
                const v = Math.round(baseVoucherAmount * tier.voucherPct) * students.length;
                const t = includeTefa ? tefaPerStudent * students.length : 0;
                const a = includeAce ? students.reduce((s, st) => s + st.aceAmount, 0) : 0;
                const aid = v + t + a;
                const tot = tuition * students.length;
                const oop = Math.max(0, tot - aid);
                const isActive = income === applicantScenario;
                return (
                  <tr
                    key={income}
                    onClick={() => setApplicantScenario(income)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-4">{fmt(income)}</td>
                    <td className="py-3 px-4 text-right text-blue-700">{fmt(v)}</td>
                    <td className="py-3 px-4 text-right text-emerald-700">{fmt(t)}</td>
                    <td className="py-3 px-4 text-right text-violet-700">{fmt(a)}</td>
                    <td className="py-3 px-4 text-right text-green-700">{fmt(aid)}</td>
                    <td className="py-3 px-4 text-right text-orange-700">{fmt(oop)}</td>
                    <td className="py-3 px-4 text-right">{fmt(Math.round(oop / 10))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800">
            Click any row to set it as your active scenario. All other tabs will update to reflect the selected income level.
          </p>
        </div>
      </div>
    );
  };

  const tabContent = {
    dashboard: renderDashboard,
    calculator: renderCalculator,
    students: renderStudents,
    checklist: renderChecklist,
    timeline: renderTimeline,
    scenarios: renderScenarios
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">School Voucher Planner</h1>
              <p className="text-xs text-gray-500">Iddings Family &middot; 2026-2027 School Year</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {tabContent[activeTab]()}
      </main>
    </div>
  );
};

// --- Small helper components ---

const SummaryCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const BarRow = ({ label, amount, max, color }) => {
  const width = max > 0 ? (amount / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{fmt(amount)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, highlight, bold }) => (
  <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
    <span className="text-gray-600">{label}</span>
    <span className={highlight ? `text-${highlight}-700` : 'text-gray-900'}>{value}</span>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-2 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default IddingsPlanner;
