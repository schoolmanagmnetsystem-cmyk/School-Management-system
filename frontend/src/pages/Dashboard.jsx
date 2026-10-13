import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  CreditCard,
  BookOpen,
  Shield,
  ArrowRight,
  Plus,
  Sparkles,
  Building2,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../utils/api';
import {
  StatCard,
  ProtocolBanner,
  BreadcrumbNav,
} from '../components/common/StitchUI';

const DASH = '—';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const loadDashboard = () =>
    api.get('/dashboard/')
      .then((data) => {
        setStats(data);
        setError('');
      })
      .catch((err) => setError(err.message || 'Unable to load dashboard data.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadDashboard();
  }, []);

  const role = user.role;
  const payload = stats || {};
  const schoolLabel = payload.school_name || user.school_name || 'H-School';

  const attendanceRate = payload.attendance_summary && payload.attendance_summary.total
    ? ((payload.attendance_summary.present / payload.attendance_summary.total) * 100).toFixed(1)
    : null;

  // ---- Role-specific metric cards (same layout/styling, real values only) ----
  const metricCards = [];
  const push = (card) => metricCards.push(card);

  if (role === 'super_admin') {
    push({ label: 'Institutions', value: payload.total_schools ?? DASH, subtext: 'Schools on the platform', icon: Building2 });
    push({ label: 'Active Schools', value: payload.active_schools ?? DASH, subtext: 'Enabled institutions', icon: Users });
    push({ label: 'Active Users', value: payload.active_users ?? DASH, subtext: 'Enabled accounts', icon: Shield });
  } else if (['admin', 'school_admin', 'principal', 'receptionist'].includes(role)) {
    push({ label: 'Enrolled Students', value: payload.total_students ?? DASH, subtext: 'Active student records', icon: GraduationCap });
    push({ label: 'Faculty & Instructors', value: payload.total_teachers ?? DASH, subtext: 'Registered teaching staff', icon: Users });
    push({ label: 'Course Units', value: payload.total_courses ?? DASH, subtext: 'Active courses', icon: BookOpen });
    push({
      label: 'Recorded Attendance',
      value: attendanceRate !== null ? `${attendanceRate}%` : DASH,
      subtext: payload.attendance_summary
        ? `${payload.attendance_summary.present} of ${payload.attendance_summary.total} present`
        : 'No attendance recorded',
      icon: ClipboardCheck,
    });
  } else if (role === 'accountant') {
    push({ label: 'Total Invoices', value: payload.total_invoices ?? DASH, subtext: 'Issued invoices', icon: CreditCard });
    push({ label: 'Outstanding', value: payload.outstanding_fees ?? DASH, subtext: 'Unpaid or pending', icon: CreditCard });
    push({ label: 'Paid Invoices', value: payload.paid_invoices ?? DASH, subtext: 'Settled invoices', icon: CreditCard });
    push({ label: 'Overdue', value: payload.overdue_invoices ?? DASH, subtext: 'Past due date', icon: Calendar });
  } else if (role === 'teacher') {
    push({ label: 'Assigned Classes', value: payload.assigned_classes ?? DASH, subtext: 'Courses you teach', icon: BookOpen });
    push({ label: "Today's Attendance", value: payload.today_attendance ?? DASH, subtext: 'Entries recorded today', icon: ClipboardCheck });
    push({ label: 'Absences Today', value: payload.pending_attendance ?? DASH, subtext: 'Marked absent today', icon: Calendar });
    push({ label: 'Results Recorded', value: payload.pending_marking_results ?? DASH, subtext: 'Across your courses', icon: GraduationCap });
  } else if (role === 'student') {
    push({ label: 'Current Class', value: payload.current_class || DASH, subtext: payload.current_section ? `Section ${payload.current_section}` : 'Enrolled class', icon: GraduationCap });
    push({
      label: 'Attendance',
      value: attendanceRate !== null ? `${attendanceRate}%` : DASH,
      subtext: payload.attendance_summary
        ? `${payload.attendance_summary.present} of ${payload.attendance_summary.total} present`
        : 'No attendance recorded',
      icon: ClipboardCheck,
    });
    push({ label: 'Pending Fees', value: payload.pending_fees ?? DASH, subtext: 'Unpaid invoices', icon: CreditCard });
    push({ label: 'Latest Results', value: Array.isArray(payload.recent_results) ? payload.recent_results.length : DASH, subtext: 'Recently published', icon: BookOpen });
  } else if (role === 'parent') {
    push({ label: 'Linked Children', value: Array.isArray(payload.children) ? payload.children.length : DASH, subtext: 'Students on your account', icon: Users });
    push({ label: 'Attendance Records', value: payload.attendance_records ?? DASH, subtext: 'Logged entries', icon: ClipboardCheck });
    push({ label: 'Published Results', value: payload.published_results ?? DASH, subtext: 'Released to guardians', icon: BookOpen });
    push({ label: 'Invoices', value: payload.invoices ?? DASH, subtext: 'Fee records', icon: CreditCard });
  }

  if (metricCards.length < 4) {
    push({ label: 'Session', value: 'Protected', subtext: 'Authenticated access enforced', icon: Shield });
  }

  // ---- Attendance breakdown chart (real data only; honest empty state otherwise) ----
  const attendanceBreakdown = payload.attendance_summary
    ? [
        { name: 'Present', count: payload.attendance_summary.present ?? 0 },
        { name: 'Absent', count: payload.attendance_summary.absent ?? 0 },
        { name: 'Late', count: payload.attendance_summary.late ?? 0 },
      ]
    : null;
  const hasAttendanceChart = attendanceBreakdown && payload.attendance_summary.total > 0;

  // ---- Records summary rows (real values, role-aware) ----
  const summaryRows = (() => {
    if (role === 'super_admin') {
      return [
        { label: 'Institutions', value: payload.total_schools ?? DASH },
        { label: 'Active schools', value: payload.active_schools ?? DASH },
        { label: 'Active users', value: payload.active_users ?? DASH },
        { label: 'Recent audit events', value: Array.isArray(payload.recent_audit_events) ? payload.recent_audit_events.length : DASH },
      ];
    }
    if (['admin', 'school_admin', 'principal', 'receptionist'].includes(role)) {
      return [
        { label: 'Students', value: payload.total_students ?? DASH },
        { label: 'Faculty', value: payload.total_teachers ?? DASH },
        { label: 'Courses', value: payload.total_courses ?? DASH },
        { label: 'Unpaid invoices', value: payload.unpaid_invoices ?? DASH },
      ];
    }
    if (role === 'accountant') {
      return [
        { label: 'Total invoices', value: payload.total_invoices ?? DASH },
        { label: 'Outstanding', value: payload.outstanding_fees ?? DASH },
        { label: 'Paid', value: payload.paid_invoices ?? DASH },
        { label: 'Overdue', value: payload.overdue_invoices ?? DASH },
      ];
    }
    if (role === 'teacher') {
      return [
        { label: 'Assigned classes', value: payload.assigned_classes ?? DASH },
        { label: 'Attendance entries today', value: payload.today_attendance ?? DASH },
        { label: 'Absences today', value: payload.pending_attendance ?? DASH },
        { label: 'Results recorded', value: payload.pending_marking_results ?? DASH },
      ];
    }
    if (role === 'student') {
      return [
        { label: 'Class', value: payload.current_class || DASH },
        { label: 'Section', value: payload.current_section || DASH },
        { label: 'Pending fees', value: payload.pending_fees ?? DASH },
        { label: 'Recent results', value: Array.isArray(payload.recent_results) ? payload.recent_results.length : DASH },
      ];
    }
    if (role === 'parent') {
      return [
        { label: 'Linked children', value: Array.isArray(payload.children) ? payload.children.length : DASH },
        { label: 'Attendance records', value: payload.attendance_records ?? DASH },
        { label: 'Published results', value: payload.published_results ?? DASH },
        { label: 'Invoices', value: payload.invoices ?? DASH },
      ];
    }
    return [];
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={[schoolLabel, 'Operations', 'Dashboard']} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.first_name || user.username || 'there'} 👋
            </h1>
            {payload.current_academic_year && (
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Active AY {payload.current_academic_year}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {schoolLabel} · Operational overview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadDashboard();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Students</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <StatCard
            key={`${card.label}-${index}`}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Safeguard Alert Banner */}
      <ProtocolBanner
        title="Academic Records & Session Policy"
        description={`Attendance, published results and finance records are stored per academic term. Manage the active cycle from the academic calendar.${payload.school_name ? ` Institution: ${payload.school_name}.` : ''}`}
        buttonText="View Academic Calendar"
        onAction={() => { window.location.href = '/academic-periods'; }}
      />

      {/* Analytics Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Attendance breakdown (real data) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recorded Attendance</h3>
              <p className="text-xs text-slate-400">Present, absent and late entries</p>
            </div>
            {attendanceRate !== null && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {attendanceRate}% present
              </span>
            )}
          </div>

          {hasAttendanceChart ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val) => [val, 'Entries']}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center text-slate-400">
              <ClipboardCheck className="w-8 h-8 mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No attendance data available</p>
              <p className="text-xs mt-1">Attendance entries will appear here once recorded.</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Scoped to your access level</span>
            <Link to="/attendance" className="font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <span>Open attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Records summary (real data) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Records Summary</h3>
              <p className="text-xs text-slate-400">Live figures for your role</p>
            </div>
          </div>

          {summaryRows.length > 0 ? (
            <div className="space-y-3">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-medium text-slate-500">{row.label}</span>
                  <span className="text-sm font-bold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400">
              <BookOpen className="w-8 h-8 mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No summary available</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <Link to="/results" className="font-bold text-indigo-600 hover:underline flex items-center gap-1 text-xs">
              <span>View results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Hub & Quick Action Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Quick Actions & Workflows
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <Link
            to="/students"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Students</span>
            <span className="text-[10px] text-slate-400 block">Registry</span>
          </Link>

          <Link
            to="/attendance"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Attendance</span>
            <span className="text-[10px] text-slate-400 block">Daily Log</span>
          </Link>

          <Link
            to="/academic-periods"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Academic Years</span>
            <span className="text-[10px] text-slate-400 block">Manage Terms</span>
          </Link>

          <Link
            to="/courses"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Courses</span>
            <span className="text-[10px] text-slate-400 block">Class Units</span>
          </Link>

          <Link
            to="/finance"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Finance</span>
            <span className="text-[10px] text-slate-400 block">Invoices & Fees</span>
          </Link>

          <Link
            to="/results"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-center space-y-1.5 block group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 flex items-center justify-center mx-auto transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 group-hover:text-indigo-700 block">Results</span>
            <span className="text-[10px] text-slate-400 block">Exams & Grades</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
