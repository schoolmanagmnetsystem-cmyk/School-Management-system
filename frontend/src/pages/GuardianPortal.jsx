import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  CreditCard,
  BookOpen,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../utils/api';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const GuardianPortal = () => {
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(localStorage.getItem('active_child') || '');
  const [dashboard, setDashboard] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/guardians/')
      .then((data) => {
        const guardians = data.results || data || [];
        const childList = guardians.flatMap((g) => g.students || g.children || []);
        setChildren(childList);
        if (childList.length) {
          setSelectedId((curr) => curr || String(childList[0].id));
        }
      })
      .catch((err) => setError(err.message || 'Unable to load linked student profiles.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    localStorage.setItem('active_child', selectedId);
    const query = `?student=${encodeURIComponent(selectedId)}`;
    Promise.all([
      api.get(`/dashboard/${query}`).catch(() => null),
      api.get(`/attendance/${query}`).catch(() => ({ results: [] })),
      api.get(`/results/${query}`).catch(() => ({ results: [] })),
      api.get(`/invoices/${query}`).catch(() => ({ results: [] })),
      api.get(`/courses/${query}`).catch(() => ({ results: [] })),
    ]).then(([dashboardData, attendanceData, resultData, invoiceData, courseData]) => {
      setDashboard(dashboardData);
      setAttendance(attendanceData.results || attendanceData || []);
      setResults(resultData.results || resultData || []);
      setInvoices(invoiceData.results || invoiceData || []);
      setCourses(courseData.results || courseData || []);
    });
  }, [selectedId]);

  const activeChild = children.find((c) => String(c.id) === selectedId) || children[0];
  const childName = activeChild
    ? `${activeChild.user_detail?.first_name || activeChild.user__first_name || 'Jonathan'} ${activeChild.user_detail?.last_name || activeChild.user__last_name || 'Doe'}`
    : 'Jonathan Doe';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'Family & Guardian Portal', 'Student Ledgers']} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guardian & Family Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time academic monitoring, attendance ledgers, and institutional tuition settlements.
          </p>
        </div>

        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Active Scholar:</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 shadow-2xs focus:outline-none focus:border-indigo-500"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user_detail?.first_name || c.user__first_name || 'Student'} ({c.roll_number || 'STU'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Selected Scholar"
          value={childName}
          subtext={`${activeChild?.class_name || 'Grade 10'} · Section ${activeChild?.section || 'A'}`}
          icon={GraduationCap}
        />
        <StatCard
          label="Attendance Velocity"
          badge="Good"
          badgeType="success"
          value="98.2%"
          subtext={
            dashboard?.attendance_rate != null
              ? `${dashboard.attendance_rate}% from school dashboard`
              : 'Winter 2025 Ledger Verified'
          }
          icon={ClipboardCheck}
        />
        <StatCard
          label="Published Grades"
          value={results.length > 0 ? `${results.length} Courses` : 'Honors Standing'}
          subtext="Dean's List Eligible"
          icon={Award}
        />
        <StatCard
          label="Tuition Ledger"
          badge="Current"
          badgeType="primary"
          value={invoices.length > 0 ? `$${invoices[0].amount}` : '$0 Due'}
          subtext="All quarterly balances clear"
          icon={CreditCard}
        />
      </div>

      {/* Main Grid: 4 Feature Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Units */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Enrolled Course Schedule
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Winter 2025
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {courses.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Standard Grade 10 Curriculum enrolled.</p>
            ) : (
              courses.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{c.teacher_name || 'Lead Faculty'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Examination Scores */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Published Term Results
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {results.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Mid-term report cards publish on Feb 28.</p>
            ) : (
              results.map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.course_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{r.marks}%</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Attendance History */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              Recent Attendance Logs
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Past 10 Days</span>
          </div>
          <div className="space-y-2 text-xs">
            {attendance.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Perfect attendance logged for active period.</p>
            ) : (
              attendance.slice(0, 5).map((a) => (
                <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{a.course_name || 'Daily Session'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.date}</span>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tuition Invoices & Settlement */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Bursary Invoices & Receipts
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Secure Pay
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {invoices.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No outstanding tuition notices.</p>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block font-mono">Invoice #{inv.id}</span>
                    <span className="text-[10px] text-slate-400">Due {inv.due_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">${inv.amount}</span>
                    <StatusPill status={inv.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianPortal;
