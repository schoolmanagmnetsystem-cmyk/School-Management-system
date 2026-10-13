import React, { useCallback, useEffect, useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Download,
  Users,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  FileText,
  Mail,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  X,
  Check,
  Send,
  Eye
} from 'lucide-react';
import { api } from '../utils/api';
import { downloadPdf, todayStamp } from '../utils/exportUtils';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const Students = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['admin', 'school_admin', 'receptionist'].includes(currentUser.role);

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' or 'roster'
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // New Student / Applicant Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    roll_number: '',
    class_name: 'Grade 9',
    section: 'Section A',
    date_of_birth: '',
    academic_year: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Admissions Pipeline candidates matching Stitch Image 3
  const candidatesData = [
    {
      id: 1,
      name: 'Maya Lin',
      admNumber: '#ADM-2025-084',
      grade: 'Gr. 9',
      gradeCohort: 'Class of 2029',
      priorSchool: 'Lakeside Middle',
      ssat: '98th %tile',
      gpa: '4.00',
      interview: '4.9 /5.0',
      aidReq: 'None',
      decision: 'Admit - Honors',
      targetBadge: 'Admit Target',
      rubricScore: '4.92 / 5.0',
      rubricRank: 'Top 2% of Pool (4 of 4 approvals)',
      dimensions: [
        { label: 'Academic Rigor & Testing', score: '5.0 / 5.0', pct: 100, note: 'SSAT Math: 99%, Verbal: 97%, Reading: 98%' },
        { label: 'Extracurriculars & Arts', score: '4.8 / 5.0', pct: 96, note: 'State Youth Symphony Cello, FIRST LEGO League Captain' },
        { label: 'Student & Family Interview', score: '4.9 / 5.0', pct: 98, note: 'Interviewer Dr. Eleanor Vance: "Thoughtful and exceptionally mature"' },
        { label: 'Confidential Recommendations', score: '5.0 / 5.0', pct: 100, note: 'Math Dept Chair & Humanities Advisor: "Highest possible endorsement"' },
      ],
      verdictTitle: 'Admitted with Distinction & STEM Fellowship',
      verdictNote: 'Includes $5,000 Annual Merit Scholarship · No Needs-based Aid Required',
      decisionRelease: 'March 21, 2025 · 5:00 PM PST',
      deliberations: [
        { author: 'Dr. Eleanor Vance (Dean)', time: 'Yesterday, 4:15 PM', note: 'Candidate brings premier chamber music experience and top-tier math logic. Strongest interview of the morning block.' },
        { author: 'Mark Callahan (Robotics Lead)', time: 'Mar 12, 10:20 AM', note: 'Vouched for FLL championship run. We must lock her in for the Upper School Innovation Lab cohort.' },
      ],
    },
    {
      id: 2,
      name: "Samuel O'Connor",
      admNumber: '#ADM-2025-112',
      grade: 'Gr. 9',
      gradeCohort: 'Class of 2029',
      priorSchool: 'Seattle Academy',
      ssat: '92nd %tile',
      gpa: '3.88',
      interview: '4.6 /5.0',
      aidReq: '$12,000',
      decision: 'Admit - Regular',
      targetBadge: 'Approved',
      rubricScore: '4.60 / 5.0',
      rubricRank: 'Top 10% of Pool',
      dimensions: [
        { label: 'Academic Rigor & Testing', score: '4.6 / 5.0', pct: 92, note: 'Strong honors prep' },
        { label: 'Extracurriculars & Arts', score: '4.5 / 5.0', pct: 90, note: 'Track & Field, Debate club' },
        { label: 'Student & Family Interview', score: '4.7 / 5.0', pct: 94, note: 'Clear passion for sciences' },
        { label: 'Confidential Recommendations', score: '4.6 / 5.0', pct: 92, note: 'Consistently engaged scholar' },
      ],
      verdictTitle: 'Admitted - General Cohort',
      verdictNote: 'Tuition Grant: $12,000 Approved',
      decisionRelease: 'March 21, 2025',
      deliberations: [],
    },
    {
      id: 3,
      name: 'Amira Patel',
      admNumber: '#ADM-2025-145',
      grade: 'Gr. 9',
      gradeCohort: 'Class of 2029',
      priorSchool: 'Open Window School',
      ssat: '89th %tile',
      gpa: '3.92',
      interview: '4.4 /5.0',
      aidReq: '$28,000 (Full)',
      decision: 'Deliberation',
      targetBadge: 'Review Pending',
      rubricScore: '4.45 / 5.0',
      rubricRank: 'Top 15% of Pool',
      dimensions: [
        { label: 'Academic Rigor & Testing', score: '4.4 / 5.0', pct: 88, note: 'Solid analytical skills' },
        { label: 'Extracurriculars & Arts', score: '4.8 / 5.0', pct: 96, note: 'Youth theater lead' },
        { label: 'Student & Family Interview', score: '4.3 / 5.0', pct: 86, note: 'Energetic candidate' },
        { label: 'Confidential Recommendations', score: '4.5 / 5.0', pct: 90, note: 'High recommendation' },
      ],
      verdictTitle: 'Under Committee Deliberation',
      verdictNote: 'Full aid consideration pending endowment allocation',
      decisionRelease: 'Pending Committee Vote',
      deliberations: [],
    },
    {
      id: 4,
      name: 'Ethan Vance-Cole',
      admNumber: '#ADM-2025-198',
      grade: 'Gr. 8',
      gradeCohort: 'Class of 2030',
      priorSchool: 'St. Thomas School',
      ssat: '95th %tile',
      gpa: '3.95',
      interview: '4.8 /5.0',
      aidReq: 'None (Legacy)',
      decision: 'Admit - Priority',
      targetBadge: 'Legacy Priority',
      rubricScore: '4.85 / 5.0',
      rubricRank: 'Top 5% of Pool',
      dimensions: [
        { label: 'Academic Rigor & Testing', score: '4.9 / 5.0', pct: 98, note: 'Top quartile math & verbal' },
        { label: 'Extracurriculars & Arts', score: '4.7 / 5.0', pct: 94, note: 'Competitive sailing' },
        { label: 'Student & Family Interview', score: '4.9 / 5.0', pct: 98, note: 'Exemplary conduct' },
        { label: 'Confidential Recommendations', score: '4.9 / 5.0', pct: 98, note: 'Unanimous faculty support' },
      ],
      verdictTitle: 'Admitted - Priority Tier',
      verdictNote: 'Heritage Endowment Match Active',
      decisionRelease: 'March 21, 2025',
      deliberations: [],
    },
    {
      id: 5,
      name: 'Lucas Wright',
      admNumber: '#ADM-2025-220',
      grade: 'Gr. 10',
      gradeCohort: 'Class of 2028',
      priorSchool: 'Eastside Catholic',
      ssat: '81st %tile',
      gpa: '3.40',
      interview: '3.6 /5.0',
      aidReq: 'None',
      decision: 'Waitlist Candidate',
      targetBadge: 'Waitlist',
      rubricScore: '3.70 / 5.0',
      rubricRank: 'Tier 3 Pool',
      dimensions: [
        { label: 'Academic Rigor & Testing', score: '3.6 / 5.0', pct: 72, note: 'Satisfactory baseline' },
        { label: 'Extracurriculars & Arts', score: '3.8 / 5.0', pct: 76, note: 'Junior varsity soccer' },
        { label: 'Student & Family Interview', score: '3.7 / 5.0', pct: 74, note: 'Standard evaluation' },
        { label: 'Confidential Recommendations', score: '3.7 / 5.0', pct: 74, note: 'Good standing' },
      ],
      verdictTitle: 'Placed on Priority Waitlist',
      verdictNote: 'Secondary review scheduled for April 15',
      decisionRelease: 'April 15, 2025',
      deliberations: [],
    },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stu, years] = await Promise.all([
        api.get('/students/'),
        api.get('/auth/academic-years/').catch(() => ({ results: [] })),
      ]);
      setStudents(stu.results || stu || []);
      setAcademicYears(years.results || years || []);
      setSelectedCandidate(candidatesData[0]);
    } catch (err) {
      setError(err.message || 'Failed to load student admissions data.');
    } finally {
      setLoading(false);
    }
    // candidatesData is static demo pipeline data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: 'student',
        academic_year: form.academic_year || (academicYears[0]?.id || 1),
        roll_number: form.roll_number,
        class_name: form.class_name,
        section: form.section,
        date_of_birth: form.date_of_birth || null,
      });

      setShowAddModal(false);
      setActionSuccess(`Student ${form.first_name} ${form.last_name} enrolled successfully.`);
      setForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        roll_number: '',
        class_name: 'Grade 9',
        section: 'Section A',
        date_of_birth: '',
        academic_year: '',
      });
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to register student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportAnalytics = () => {
    const lines = students.map((s) => {
      const name = `${s.user_detail?.first_name || ''} ${s.user_detail?.last_name || ''}`.trim();
      return `${s.roll_number || '-'} | ${name || 'Student'} | ${s.class_name || '-'} | ${s.section || '-'}`;
    });
    downloadPdf(`student-analytics-${todayStamp()}.pdf`, {
      title: 'Student Analytics Report',
      subtitle: `Matriculated students: ${students.length} · Generated ${todayStamp()}`,
      blocks: [
        {
          heading: 'Matriculated Roster',
          lines: lines.length ? lines : ['No students on record.'],
        },
      ],
    });
  };

  const activeCandidate = selectedCandidate || candidatesData[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={['H-School', 'Admissions & Enrollment', 'Admissions Pipeline & Applicant Scoring']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admissions Pipeline & Applicant Scoring
            </h1>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
              AY 2025–2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            AY 2025–2026 selective enrollment management, SSAT/ISEE testing scores, committee rubrics, and automated acceptance letter generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tab switcher: Pipeline View vs Matriculated Roster */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admissions Pipeline
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'roster'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Matriculated Roster ({students.length})
            </button>
          </div>

          <button
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics (PDF)</span>
          </button>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Applicant</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 Top Metric Cards matching Stitch Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applicants"
          badge="AY25–26"
          badgeType="primary"
          value="412 / 842"
          trend="+14% vs LV · Completed Apps"
          subtext="Capacity: 140 Incoming Seats"
        />

        <StatCard
          label="Projected Acceptance Rate"
          badge="Tier 1 Target"
          badgeType="warning"
          value="28.4%"
          subtext="Highly selective cohort · Target Yield 85%"
        />

        <StatCard
          label="Committee Evaluations"
          badge="84.5% Complete"
          badgeType="primary"
          value="348 of 412"
          subtext="64 dossiers awaiting faculty review"
          icon={Users}
        />

        <StatCard
          label="Financial Aid Requisitions"
          badge="88% Allocated"
          badgeType="success"
          value="$1.85M"
          subtext="Endowed Aid Budget: $2.10M (98 apps)"
          icon={CreditCard}
        />
      </div>

      {/* Interactive Admissions Pipeline Funnel matching Stitch Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Interactive Admissions Pipeline Funnel</span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              AY 2025 Real-Time
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Sort by Priority Stage</span>
        </div>

        {/* 6 Funnel Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            { stage: 'Stage 01', label: 'Inquiries & Tours', count: '168', sub: 'Tour Scheduled', color: 'border-slate-300' },
            { stage: 'Stage 02', label: 'Dossiers & SSAT', count: '112', sub: 'Avg SSAT: 91st %', color: 'border-indigo-400' },
            { stage: 'Stage 03', label: 'Interviews & Shadow', count: '64', sub: 'Feedback Pending', color: 'border-amber-400' },
            { stage: 'Stage 04', label: 'Committee Scored', count: '88', sub: 'Rubric ≥ 4.2 / 5.0', color: 'border-indigo-600' },
            { stage: 'Stage 05', label: 'Admitted Offers', count: '94', sub: 'Release: Mar 21', color: 'border-emerald-500' },
            { stage: 'Stage 06', label: 'Enrolled & Deposit', count: '56', sub: '$2.5k Secured', color: 'border-indigo-800' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border-l-4 bg-slate-50/70 border border-slate-200 space-y-1 ${item.color}`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>{item.stage}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              </div>
              <h4 className="font-bold text-slate-700 text-xs truncate">{item.label}</h4>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{item.count}</p>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main View: Admissions Pipeline vs Matriculated Roster */}
      {activeTab === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Candidate List Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applicant name, app #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium">
                  <option>Grade 9 (Freshman)</option>
                  <option>Grade 10 (Secondary)</option>
                  <option>Grade 11 (Junior)</option>
                </select>

                <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-medium">
                  <option>All Decisions</option>
                  <option>Admitted</option>
                  <option>Deliberation</option>
                  <option>Waitlist</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Showing {candidatesData.length} of 412 Candidates</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 3 Recommended Honors
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 1 Pending Vote
                </span>
              </div>
            </div>

            {/* Candidate Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Applicant</th>
                    <th className="py-2.5 px-2">Grade</th>
                    <th className="py-2.5 px-3">Prior School</th>
                    <th className="py-2.5 px-2">SSAT / GPA</th>
                    <th className="py-2.5 px-2">Interview</th>
                    <th className="py-2.5 px-2">Aid Req.</th>
                    <th className="py-2.5 px-3 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {candidatesData
                    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((candidate) => {
                      const isSelected = activeCandidate?.id === candidate.id;
                      return (
                        <tr
                          key={candidate.id}
                          onClick={() => setSelectedCandidate(candidate)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/40 ring-1 ring-indigo-500/20'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {candidate.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block flex items-center gap-1">
                                  {candidate.name}
                                  {candidate.decision.includes('Honors') && (
                                    <Check className="w-3 h-3 text-indigo-600" />
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {candidate.admNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {candidate.grade}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            {candidate.priorSchool}
                          </td>

                          <td className="py-3 px-2">
                            <span className="font-bold text-slate-900 block text-[11px]">
                              {candidate.ssat}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              GPA {candidate.gpa}
                            </span>
                          </td>

                          <td className="py-3 px-2">
                            <span className="font-semibold text-slate-800">
                              ⭐ {candidate.interview}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">
                            {candidate.aidReq}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <StatusPill status={candidate.decision} />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to 5 of 412 registered applicants</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">1</span>
                <span className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer">2</span>
                <span className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer">3</span>
                <span className="px-1 text-slate-400">...</span>
                <span className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer">83</span>
              </div>
            </div>
          </div>

          {/* Right Column: Candidate Dossier & Scoring Breakdown (5 cols) matching Stitch Image 3 */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Candidate Header Pill */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {activeCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {activeCandidate.name}
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Applying for {activeCandidate.grade} · {activeCandidate.gradeCohort}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Current: {activeCandidate.priorSchool}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                {activeCandidate.targetBadge}
              </span>
            </div>

            {/* Composite Rubric Score Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Overall Composite Rubric
                </span>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                  {activeCandidate.rubricScore}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded block">
                  Top 2% of Pool
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  4 of 4 faculty approvals
                </span>
              </div>
            </div>

            {/* Evaluated Dimensions Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Evaluated Dimensions</span>
                <span className="text-indigo-600 cursor-pointer hover:underline text-[11px]">View Rubric Sheet</span>
              </div>

              {activeCandidate.dimensions.map((dim, dIdx) => (
                <div key={dIdx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dim.label}</span>
                    <span className="font-bold text-indigo-600">{dim.score}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${dim.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{dim.note}</p>
                </div>
              ))}
            </div>

            {/* Admissions Committee Verdict */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Admissions Committee Verdict
              </span>
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{activeCandidate.verdictTitle}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{activeCandidate.verdictNote}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Decision Release: {activeCandidate.decisionRelease}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => alert(`Generating official acceptance letter for ${activeCandidate.name}...`)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/25"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Acceptance Letter (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert(`Opening student portal preview for ${activeCandidate.name}...`)}
                  className="py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Portal</span>
                </button>
                <button
                  onClick={() => alert(`Assigning upper school mentor for ${activeCandidate.name}...`)}
                  className="py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Assign Mentor</span>
                </button>
              </div>
            </div>

            {/* Deliberation Feed */}
            {activeCandidate.deliberations.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Deliberation Feed</span>
                  <span className="text-[11px] text-slate-400 font-normal">3 Internal Logs</span>
                </div>
                <div className="space-y-2">
                  {activeCandidate.deliberations.map((delib, lIdx) => (
                    <div key={lIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                        <span>{delib.author}</span>
                        <span className="text-slate-400 font-normal">{delib.time}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{delib.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Matriculated Student Roster Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Active Matriculated Student Ledger ({students.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registered students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Class & Section</th>
                  <th className="py-2.5 px-3">Date of Birth</th>
                  <th className="py-2.5 px-3">Contact Email</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No matriculated students found. Click "Register New Applicant" to enroll.
                    </td>
                  </tr>
                ) : (
                  students
                    .filter((s) =>
                      `${s.user_detail?.first_name || ''} ${s.user_detail?.last_name || ''} ${s.roll_number || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {student.user_detail?.first_name?.charAt(0) || 'S'}
                            </div>
                            <span className="font-bold text-slate-900">
                              {student.user_detail?.first_name} {student.user_detail?.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {student.roll_number || 'STU-2024'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {student.class_name || 'Grade 10'} · {student.section || 'A'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">
                          {student.date_of_birth || '2008-04-16'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {student.user_detail?.email || 'student@academic.edu'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <StatusPill status="Active Session" text="Enrolled" />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register New Applicant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Student / Applicant</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campus Username</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="STU-2025-001"
                    value={form.roll_number}
                    onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <input
                    type="text"
                    required
                    value={form.class_name}
                    onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {submitting ? 'Registering...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
