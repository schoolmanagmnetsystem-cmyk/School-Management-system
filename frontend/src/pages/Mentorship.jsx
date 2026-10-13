import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Building2,
  Calendar,
  Clock,
  Video,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Award,
  ChevronRight,
  ExternalLink,
  Briefcase,
  FileText,
  UserPlus,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';
import { downloadPdf, todayStamp } from '../utils/exportUtils';

const Mentorship = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [activeDuoIndex, setActiveDuoIndex] = useState(0);

  const industryDistribution = [
    { label: 'Quantum & Applied AI', pct: 32, duos: '45 Duos', color: 'bg-indigo-600' },
    { label: 'Biomedical & Health Sciences', pct: 28, duos: '40 Duos', color: 'bg-indigo-500' },
    { label: 'Law & Public Policy', pct: 18, duos: '26 Duos', color: 'bg-amber-500' },
    { label: 'Arts & Architecture', pct: 12, duos: '17 Duos', color: 'bg-indigo-400' },
    { label: 'Investment Banking & VC', pct: 10, duos: '14 Duos', color: 'bg-slate-400' },
  ];

  const mentorshipDuos = [
    {
      id: 1,
      studentName: 'Julian Vance',
      studentGrade: 'Grade 10-A',
      studentBadge: 'Capstone Scholar',
      mentorName: 'Dr. Alistair Vance, Ph.D.',
      mentorClass: "'96",
      mentorRole: 'Principal Quantum Architect',
      company: 'Microsoft Quantum Lab',
      industry: 'Software & Quantum Computing',
      matchingFocus: 'Quantum Hardware',
      cadence: 'Bi-Weekly Remote + Lab',
      nextMilestone: 'Capstone Review Apr 10, 2025',
      sessionsCompleted: 8,
      sessionsTotal: 12,
      hours: 16.0,
      quote:
        'Julian presented his Q# topological braiding simulator notebook. Mathematical logic is rigorous. Connecting him with our optical cryogenic team for live hardware demonstration next Thursday.',
      almaMater: "Stanford B.S. ('00) · MIT Ph.D. ('05)",
      tenure: '8 Consecutive Years Mentorship',
    },
    {
      id: 2,
      studentName: 'Elena Rostova',
      studentGrade: 'Grade 10-B',
      studentBadge: 'Bio Scholar',
      mentorName: 'Dr. Allison Meyer',
      mentorClass: "'04",
      mentorRole: 'Senior Research Director',
      company: 'Fred Hutchinson Cancer Center',
      industry: 'Biomedical & Health Sciences',
      matchingFocus: 'Oncology & Bioinfo',
      cadence: 'Monthly Lab Shadowing',
      nextMilestone: 'Summer Fellowship Prep May 02, 2025',
      sessionsCompleted: 6,
      sessionsTotal: 10,
      hours: 14.5,
      quote:
        'Elena analyzed patient single-cell RNA-seq clustering data with impressive accuracy in R.',
      almaMater: "Johns Hopkins B.S. · Harvard M.D./Ph.D.",
      tenure: '5 Consecutive Years Mentorship',
    },
    {
      id: 3,
      studentName: 'Tariq Al-Mansoor',
      studentGrade: 'Grade 11-A',
      studentBadge: 'Robotics Lead',
      mentorName: 'Kevin Chen',
      mentorClass: "'12",
      mentorRole: 'Sr. Computer Vision Eng',
      company: 'Amazon Robotics',
      industry: 'Software & Quantum Computing',
      matchingFocus: 'Autonomous Systems',
      cadence: 'Bi-Weekly Sync',
      nextMilestone: 'Robotics Patent Draft Apr 24, 2025',
      sessionsCompleted: 7,
      sessionsTotal: 12,
      hours: 15.0,
      quote:
        'Tariq completed ROS2 nodes for SLAM navigation with our simulation platform.',
      almaMater: "Carnegie Mellon B.S. ('16)",
      tenure: '3 Consecutive Years Mentorship',
    },
    {
      id: 4,
      studentName: 'Sophia Lin',
      studentGrade: 'Grade 10-C',
      studentBadge: 'Arts Fellow',
      mentorName: 'Maestro David Vance',
      mentorClass: "'98",
      mentorRole: 'Assoc. Resident Conductor',
      company: 'Seattle Symphony',
      industry: 'Arts & Architecture',
      matchingFocus: 'Orchestral Composition',
      cadence: 'Monthly Mentorship',
      nextMilestone: 'Juilliard Audition Polish May 12, 2025',
      sessionsCompleted: 9,
      sessionsTotal: 12,
      hours: 18.0,
      quote:
        'Sophia refined orchestration dynamics for her woodwind quintet piece.',
      almaMater: "Curtis Institute of Music ('02)",
      tenure: '6 Consecutive Years Mentorship',
    },
    {
      id: 5,
      studentName: 'Marcus Sterling',
      studentGrade: 'Grade 12-A',
      studentBadge: 'Senior Analyst',
      mentorName: 'Gregory Kowalski',
      mentorClass: "'08",
      mentorRole: 'VP Hockey Analytics',
      company: 'Sterling Sports / Kraken',
      industry: 'Investment Banking & VC',
      matchingFocus: 'Sports Modeling & Stats',
      cadence: 'Weekly Case Studies',
      nextMilestone: 'Senior Presentation Dry Run Apr 04, 2025',
      sessionsCompleted: 11,
      sessionsTotal: 12,
      hours: 22.0,
      quote:
        'Marcus built an expected-goals probability model using tracking telemetry data.',
      almaMater: "Wharton School B.S. ('12)",
      tenure: '4 Consecutive Years Mentorship',
    },
  ];

  const activeDuo = mentorshipDuos[activeDuoIndex] || mentorshipDuos[0];

  const handleDownloadReport = () => {
    const duoLines = mentorshipDuos.map(
      (d) =>
        `${d.studentName} (${d.studentGrade}) -> ${d.mentorName}, ${d.mentorRole} @ ${d.company} | Sessions ${d.sessionsCompleted}/${d.sessionsTotal} | ${d.hours}h | ${d.nextMilestone}`
    );
    const industryLines = industryDistribution.map((d) => `${d.label} - ${d.pct}% (${d.duos})`);
    downloadPdf(`mentorship-report-${todayStamp()}.pdf`, {
      title: 'Alumni Career Mentorship Network Report',
      subtitle: `Cohort 2024-25 · Generated ${todayStamp()}`,
      blocks: [
        { heading: 'Mentorship Pairs', lines: duoLines.length ? duoLines : ['No mentorship pairs on record.'] },
        { heading: 'Industry Domain Distribution', lines: industryLines },
      ],
    });
  };

  const handleDownloadMatrix = () => {
    const industryLines = industryDistribution.map((d) => `${d.label}: ${d.pct}% (${d.duos})`);
    downloadPdf(`mentorship-industry-matrix-${todayStamp()}.pdf`, {
      title: 'Mentorship Industry Matrix',
      subtitle: `Cohort 2024-25 · Generated ${todayStamp()}`,
      blocks: [{ heading: 'Industry Domain Distribution', lines: industryLines }],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Breadcrumbs */}
      <BreadcrumbNav items={['H-School', 'Institutional Advancement', 'Alumni Mentorship Network']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alumni Career Mentorship & Professional Placement Network
            </h1>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Alumni Association Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-4xl">
            Connecting Upper School scholars with distinguished alumni leaders for high-impact research mentorships, clinical shadowing, and direct corporate internship pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (PDF)</span>
          </button>
          <button
            onClick={() => alert('Batch invitation wizard open.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Mentors</span>
          </button>
          <button
            onClick={() => alert('Match new mentorship pair modal.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Match New Mentorship Pair</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards matching Stitch Image 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Mentorship Pairs"
          value="142 Duos"
          trend="+28% YoY"
          subtext="Upper School Junior & Senior Scholars"
          icon={Users}
        />

        <StatCard
          label="Registered Alumni Mentors"
          value="380 Mentors"
          subtext="24 Verticals: Tech, BioTech, Law, Finance"
          icon={Award}
        />

        <StatCard
          label="Micro-Internships"
          badge="Active Cohort"
          badgeType="warning"
          value="64 Placements"
          subtext="50 Completed · 14 Pending Defense"
          icon={Briefcase}
        />

        <StatCard
          label="Career Engagement Velocity"
          value="94.6% Rating"
          subtext="⭐ 4.8 / 5.0 · 512 Logged Sessions"
          icon={Sparkles}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mentor, mentee, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="All">All Industries</option>
              <option value="Software & Quantum Computing">Software & Quantum Computing</option>
              <option value="Biomedical & Health Sciences">Biomedical & Health Sciences</option>
              <option value="Arts & Architecture">Arts & Architecture</option>
              <option value="Investment Banking & VC">Investment Banking & VC</option>
            </select>

            <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium">
              <option>Grad Cohort: All</option>
              <option>2025 Cohort</option>
              <option>2026 Cohort</option>
            </select>

            <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium">
              <option>Active Duo</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pills */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Active Filters:
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
              Industry: Software & Quantum <X className="w-3 h-3 cursor-pointer" />
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
              Status: Active Duo <X className="w-3 h-3 cursor-pointer" />
            </span>
          </div>
          <button className="text-[11px] font-semibold text-indigo-600 hover:underline">
            Save Filter Preset
          </button>
        </div>
      </div>

      {/* Main Split View: Pairing Ledger (7 cols) + Active Mentor Dossier (5 cols) matching Stitch Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pairing Ledger Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <h3 className="text-sm font-bold text-slate-900">
                Mentorship Pairing & Placement Ledger
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                5 Featured Duos
              </span>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Real-time sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Mentorship Duo</th>
                  <th className="py-2.5 px-3">Industry & Company</th>
                  <th className="py-2.5 px-2">Matching Focus</th>
                  <th className="py-2.5 px-2">Meeting Cadence</th>
                  <th className="py-2.5 px-3 text-right">Next Milestone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {mentorshipDuos
                  .filter(
                    (d) =>
                      d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.mentorName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((duo, idx) => {
                    const isSelected = activeDuo.id === duo.id;
                    return (
                      <tr
                        key={duo.id}
                        onClick={() => setActiveDuoIndex(idx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/40 ring-1 ring-indigo-500/20'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div>
                            <span className="font-bold text-slate-900 block flex items-center gap-1">
                              {duo.studentName}
                              <span className="text-[10px] font-normal text-slate-400">
                                ({duo.studentGrade})
                              </span>
                            </span>
                            <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                              → {duo.mentorName} ({duo.mentorClass})
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-800 block">{duo.company}</span>
                          <span className="text-[10px] text-slate-400">{duo.mentorRole}</span>
                        </td>

                        <td className="py-3.5 px-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                            {duo.matchingFocus}
                          </span>
                        </td>

                        <td className="py-3.5 px-2 text-slate-600 text-[11px]">
                          {duo.cadence}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded block">
                            {duo.nextMilestone}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 5 of 142 Active Institutional Pairings</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">1</span>
              <span className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer">2</span>
              <span className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer">3</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Mentor Dossier matching Stitch Image 5 */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Active Mentor Dossier
              </span>
              <h3 className="text-sm font-bold text-slate-900">{activeDuo.mentorName}</h3>
              <p className="text-[11px] text-slate-500">
                Class of {activeDuo.mentorClass} Valedictorian · {activeDuo.mentorRole}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {activeDuo.company}
              </p>
            </div>

            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
              Founder's Circle
            </span>
          </div>

          {/* Academic Background / Tenure */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Alma Mater / Academic Track</span>
              <span className="font-bold text-slate-800">{activeDuo.almaMater}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Oakridge Service Tenure</span>
              <span className="font-bold text-indigo-600">{activeDuo.tenure}</span>
            </div>
          </div>

          {/* Assigned Mentee Card */}
          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Assigned Mentee
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                {activeDuo.studentBadge}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {activeDuo.studentName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{activeDuo.studentName}</h4>
                <p className="text-[11px] text-slate-500">{activeDuo.studentGrade}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Mentorship Journey Progress</span>
                <span className="font-bold text-indigo-600">
                  {activeDuo.sessionsCompleted} of {activeDuo.sessionsTotal} Sessions (
                  {Math.round((activeDuo.sessionsCompleted / activeDuo.sessionsTotal) * 100)}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${(activeDuo.sessionsCompleted / activeDuo.sessionsTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>{activeDuo.hours} Contact Hours Logged</span>
                <span className="text-emerald-600 font-semibold">All Hours Preceptor-Verified</span>
              </div>
            </div>
          </div>

          {/* Latest Preceptor Log Quote */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" /> Latest Preceptor Log (Recorded March 28)
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "{activeDuo.quote}"
            </p>
          </div>

          {/* Action Buttons matching Stitch Image 5 */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => alert(`Launching encrypted video conference with ${activeDuo.mentorName}...`)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/25"
            >
              <Video className="w-4 h-4" />
              <span>Schedule Mentor Video Conference</span>
            </button>

            <button
              onClick={() => alert('Sending mid-term evaluation rubric form...')}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Send Mid-Term Feedback Rubric</span>
            </button>

            <button
              onClick={() => alert(`Certifying ${activeDuo.hours} hours on institutional transcript.`)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certify Experiential Learning Hours ({activeDuo.hours} hrs)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Widgets: Domain Distribution & Flagship Event Card matching Stitch Image 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Industry Domain Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Industry Domain Distribution</h4>
              <span className="text-[10px] text-slate-400">Cohort 2024–25</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {industryDistribution.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">{d.label}</span>
                  <span className="font-bold text-slate-800">{d.pct}% ({d.duos})</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Updated automatically via Alumni Portal</span>
            <button onClick={handleDownloadMatrix} className="text-indigo-600 font-bold hover:underline">Download Matrix</button>
          </div>
        </div>

        {/* Annual Symposium Flagship Card (2 cols) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-900">
                Flagship Campus Event
              </span>
              <span className="text-[11px] text-slate-300">Term 3 Milestone</span>
            </div>
            <h3 className="text-lg lg:text-xl font-extrabold tracking-tight">
              Annual Alumni Career Symposium & Capstone Exposition
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              May 16, 2025 · Oakridge Memorial Auditorium & Science Rotunda. Mentors, corporate sponsors, and graduating scholars convene for keynote talks and project showcases.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl font-black block">24</span>
              <span className="text-[10px] text-slate-300 font-medium">Keynote Panels</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl font-black block">180+</span>
              <span className="text-[10px] text-slate-300 font-medium">Visiting Mentors</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl font-black block">12</span>
              <span className="text-[10px] text-slate-300 font-medium">Lab Demos</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-300 font-medium">
              RSVP threshold: 84% met
            </span>
            <button
              onClick={() => alert('Opening Symposium floor schedule...')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
            >
              Manage Floor Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentorship;
