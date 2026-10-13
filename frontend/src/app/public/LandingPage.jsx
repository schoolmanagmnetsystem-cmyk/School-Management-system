import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Users,
  BarChart3,
  CheckCircle2,
  Calendar,
  CreditCard,
  GraduationCap,
  Lock,
  ArrowRight,
  FileText,
  LayoutDashboard,
  LineChart,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Student Management',
    body: 'Maintain enrollment, admissions records, attendance, and complete academic histories in one centralized database.',
  },
  {
    icon: BookOpen,
    title: 'Academic Organization',
    body: 'Organize courses, sections, academic periods, exams, and gradebooks so every record stays linked and consistent.',
  },
  {
    icon: BarChart3,
    title: 'Financial Tracking',
    body: 'Issue tuition invoices, record payments, and monitor outstanding balances with clear accounts-receivable views.',
  },
  {
    icon: Calendar,
    title: 'Attendance',
    body: 'Record daily or per-period attendance and surface attendance summaries for staff, students, and guardians.',
  },
  {
    icon: FileText,
    title: 'Exams & Results',
    body: 'Record marks, compute grades, and publish approved results to the student portal when administrators release them.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    body: 'Every role — administrator, teacher, student, guardian and staff — sees only the data and actions it is permitted to use.',
  },
];

const STEPS = [
  {
    title: 'Sign in securely',
    body: 'Administrators, teachers and students sign in with institutional credentials. Access is enforced on the server for every request.',
  },
  {
    title: 'Manage day-to-day operations',
    body: 'Staff record attendance, enter results, raise invoices and keep the student registry current from a single workspace.',
  },
  {
    title: 'Students and guardians stay informed',
    body: 'Students review their attendance, published results and fee statements, while guardians follow the same records for their children.',
  },
];

const LandingPage = () => {
  return (
    <div id="top" className="flex flex-col min-h-screen bg-white">
      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 bg-[#241A4C] overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none custom-hero-bg" />

        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <ShieldCheck size={16} className="text-[#3b82f6]" />
              <span className="text-white font-semibold text-xs tracking-wide uppercase">
                Unified School Management Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
              Run your school.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#FFB800]">
                One connected portal.
              </span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              H-School brings admissions, academics, attendance, examinations and finances into a single,
              role-aware system so administrators, teachers, students and guardians all work from the same
              trusted records.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#241A4C] font-bold text-sm shadow-lg hover:bg-slate-100 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Sign in to the portal
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Explore features
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Product Preview */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-8 border-white/10 bg-[#151233]">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-[11px] font-semibold text-white/40">H-School · Dashboard</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Students', value: '—', icon: Users },
                  { label: 'Attendance', value: '—', icon: Calendar },
                  { label: 'Receivables', value: '—', icon: CreditCard },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <card.icon className="w-4 h-4 text-blue-300 mb-2" />
                    <div className="text-lg font-bold text-white">{card.value}</div>
                    <div className="text-[10px] text-white/50">{card.label}</div>
                  </div>
                ))}
                <div className="col-span-3 rounded-xl bg-white/5 border border-white/10 p-4 mt-1">
                  <div className="flex items-center gap-2 mb-3">
                    <LayoutDashboard className="w-4 h-4 text-[#FFB800]" />
                    <span className="text-xs font-semibold text-white/70">Interactive modules</span>
                  </div>
                  <div className="space-y-2">
                    {['Student registry & admissions', 'Attendance ledger', 'Results & gradebook', 'Invoices & payments'].map(
                      (row) => (
                        <div key={row} className="flex items-center gap-2 text-[11px] text-white/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {row}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="col-span-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-[#5B45F2]/20 border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <LineChart className="w-4 h-4 text-blue-300" />
                    Live operational data, scoped by role
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CORE FEATURES */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to run your institution.</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16">
            A comprehensive suite of tools designed for modern educators and administrators — with security and
            data ownership built in.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 bg-[#5B45F2]/10 rounded-xl flex items-center justify-center text-[#5B45F2] mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From institutional setup to daily use, the platform keeps every record connected.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative p-8 rounded-2xl border border-slate-200 bg-slate-50/60">
                <span className="w-10 h-10 rounded-xl bg-[#5B45F2] text-white font-bold flex items-center justify-center mb-5">
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: STUDENT PORTAL HIGHLIGHT */}
      <section id="portal" className="py-24 bg-[#241A4C] scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wide">
              <GraduationCap size={16} className="text-[#FFB800]" />
              Student &amp; Guardian Portal
            </span>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Give every learner a clear view of their progress.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Students and guardians sign in to review the records that matter to them. Access is limited to the
              authenticated user's own data, and only approved results are ever shown.
            </p>
            <ul className="space-y-3">
              {[
                'Personal attendance history with attendance summaries',
                'Published examination results and grades',
                'Fee statements, balances and payment history',
                'Downloadable receipts and reports where provided',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFB800] text-[#241A4C] font-bold text-sm hover:bg-amber-300 transition-colors"
            >
              Open the portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
            <div className="space-y-3">
              {[
                { icon: Calendar, label: 'Attendance this term', value: 'View summaries' },
                { icon: FileText, label: 'Published results', value: 'Review grades' },
                { icon: CreditCard, label: 'Fee statement', value: 'Download receipt' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                      <row.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-white/80">{row.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/50">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SUPPORT / CONTACT */}
      <section id="support" className="py-24 bg-slate-50 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Need access or support?</h2>
              <p className="text-slate-500 leading-relaxed">
                Account access, admissions records and institutional configuration are managed by your school's
                administrator. If you do not yet have credentials, contact your school office. Staff and enrolled
                users can sign in to the portal at any time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5B45F2] text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Sign in
              </Link>
              <a
                href="#top"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Back to top
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10">
            <div className="max-w-sm space-y-3">
              <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
                H<span className="text-[#5B45F2]">-School</span>
              </span>
              <p className="text-sm text-slate-500 leading-relaxed">
                A unified school management platform for admissions, academics, attendance, examinations and
                finance.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Products</span>
                <a href="#features" className="block text-slate-500 hover:text-[#5B45F2]">Student Management</a>
                <a href="#features" className="block text-slate-500 hover:text-[#5B45F2]">Academic Organization</a>
                <a href="#features" className="block text-slate-500 hover:text-[#5B45F2]">Financial Tracking</a>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Explore</span>
                <a href="#top" className="block text-slate-500 hover:text-[#5B45F2]">Overview</a>
                <a href="#portal" className="block text-slate-500 hover:text-[#5B45F2]">Student Portal</a>
                <a href="#how" className="block text-slate-500 hover:text-[#5B45F2]">How It Works</a>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Access</span>
                <Link to="/login" className="block text-slate-500 hover:text-[#5B45F2]">Sign in</Link>
                <a href="#support" className="block text-slate-500 hover:text-[#5B45F2]">Support</a>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 text-slate-500 text-sm">
            © {new Date().getFullYear()} H-School Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
