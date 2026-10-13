import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  Users,
  Search,
  Download,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  BookOpen,
  UserCheck,
  SlidersHorizontal,
  X,
  Check,
  RefreshCw,
} from 'lucide-react';
import { api } from '../utils/api';
import { downloadCsv, todayStamp } from '../utils/exportUtils';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav,
} from '../components/common/StitchUI';

const ATTENDANCE_STATUSES = ['present', 'late', 'absent'];

const safeUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const Attendance = () => {
  const currentUser = safeUser();
  const canManage = ['admin', 'school_admin', 'teacher'].includes(currentUser.role);

  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [showLiveSheet, setShowLiveSheet] = useState(false);
  const [attendanceStatuses, setAttendanceStatuses] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [att, stu, cou, years, termRes, enrollRes] = await Promise.all([
        api.get('/attendance/'),
        api.get('/students/'),
        api.get('/courses/'),
        api.get('/auth/academic-years/').catch(() => []),
        api.get('/auth/terms/').catch(() => []),
        api.get('/courses/enrollments/').catch(() => []),
      ]);

      const asList = (res) => (Array.isArray(res) ? res : res?.results || []);

      const cList = asList(cou);
      setRecords(asList(att));
      setStudents(asList(stu));
      setCourses(cList);
      setEnrollments(asList(enrollRes));
      setAcademicYears(asList(years));
      setTerms(asList(termRes));

      setSelectedCourseId((prev) => prev || (cList[0]?.id ?? ''));
    } catch (err) {
      setError(err.message || 'Unable to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedYearId && academicYears.length > 0) {
      const active = academicYears.find((y) => y.is_active) || academicYears[0];
      if (active) setSelectedYearId(String(active.id));
    }
  }, [academicYears, selectedYearId]);

  const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));

  const gradeOptions = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.class_name || s.section) {
        set.add(`${s.class_name || ''}${s.section ? ` - Section ${s.section}` : ''}`.trim());
      }
    });
    return Array.from(set);
  }, [students]);

  const attendanceForDate = records.filter((r) => String(r.date || '').slice(0, 10) === selectedDate);
  const presentToday = attendanceForDate.filter((r) => r.status === 'present').length;
  const absentToday = attendanceForDate.filter((r) => r.status === 'absent').length;
  const lateToday = attendanceForDate.filter((r) => r.status === 'late').length;
  const attendanceRate = attendanceForDate.length
    ? ((presentToday / attendanceForDate.length) * 100).toFixed(1)
    : null;
  const loggedCourseIds = new Set(attendanceForDate.map((r) => r.course));
  const totalCourses = courses.length;

  const enrolledIdsForCourse = (courseId) =>
    enrollments
      .filter((e) => String(e.course) === String(courseId) && e.is_active !== false)
      .map((e) => e.student);

  const filteredCourses = courses.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.code || '').toLowerCase().includes(term) ||
      (c.teacher_name || '').toLowerCase().includes(term)
    );
  });

  const viewerRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.course_name || '').toLowerCase().includes(term) ||
      (r.student_name || '').toLowerCase().includes(term) ||
      (r.status || '').toLowerCase().includes(term)
    );
  });

  const rosterForModal = useMemo(() => {
    const enrolledIds = enrollments
      .filter((e) => String(e.course) === String(selectedCourseId) && e.is_active !== false)
      .map((e) => e.student);
    if (enrolledIds.length > 0) {
      return students.filter((s) => enrolledIds.includes(s.id));
    }
    if (selectedGrade) {
      return students.filter(
        (s) => `${s.class_name || ''}${s.section ? ` - Section ${s.section}` : ''}`.trim() === selectedGrade
      );
    }
    return students;
  }, [students, enrollments, selectedCourseId, selectedGrade]);

  const handleOpenSessionSheet = (course) => {
    const courseId = course?.id ?? selectedCourseId;
    setSelectedCourseId(String(courseId));
    const initial = {};
    const roster = enrollments.some((e) => String(e.course) === String(courseId))
      ? students.filter((s) => enrolledIdsForCourse(courseId).includes(s.id))
      : students;
    roster.forEach((stu) => {
      const existing = records.find(
        (r) =>
          String(r.student) === String(stu.id) &&
          String(r.course) === String(courseId) &&
          String(r.date || '').slice(0, 10) === selectedDate
      );
      initial[stu.id] = existing ? existing.status : 'present';
    });
    setAttendanceStatuses(initial);
    setShowLiveSheet(true);
  };

  const handleSaveSession = async () => {
    if (!selectedCourseId) {
      setError('Select a course before saving attendance.');
      return;
    }
    setSavingAttendance(true);
    setError('');
    try {
      const entries = Object.entries(attendanceStatuses);
      const results = await Promise.allSettled(
        entries.map(([studentId, status]) => {
          const existing = records.find(
            (r) =>
              String(r.student) === String(studentId) &&
              String(r.course) === String(selectedCourseId) &&
              String(r.date || '').slice(0, 10) === selectedDate
          );
          const body = { student: Number(studentId), course: Number(selectedCourseId), date: selectedDate, status };
          return existing ? api.patch(`/attendance/${existing.id}/`, body) : api.post('/attendance/', body);
        })
      );

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        const first = failures[0].reason;
        setError(`${failures.length} of ${entries.length} entries could not be saved. ${first?.message || ''}`);
      } else {
        setActionSuccess('Attendance saved.');
        setTimeout(() => setActionSuccess(''), 3000);
        setShowLiveSheet(false);
      }
      await loadData();
    } catch (err) {
      setError(err.message || 'Error persisting attendance records.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [['Date', 'Student', 'Course', 'Status']];
    records.forEach((r) => {
      rows.push([r.date || '', r.student_name || '', r.course_name || '', r.status || '']);
    });
    downloadCsv(`attendance-ledger-${todayStamp()}.csv`, rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'Classroom', 'Attendance']} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {canManage
              ? 'Record and review attendance ledgers for course periods and academic dates.'
              : 'Review the attendance records available to your account.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => handleOpenSessionSheet(selectedCourse)}
              disabled={!selectedCourseId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>Take Attendance</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Course Units
            </span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalCourses}
          </div>
          <div className="mt-3 text-[11px] text-slate-500">Active courses available to record</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sessions Logged
            </span>
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {loggedCourseIds.size} <span className="text-xs font-normal text-slate-400">/ {totalCourses} courses</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${totalCourses ? (loggedCourseIds.size / totalCourses) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              On {selectedDate}
            </div>
          </div>
        </div>

        <StatCard
          label="Attendance Rate"
          value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
          subtext={
            attendanceForDate.length
              ? `${presentToday} present of ${attendanceForDate.length} recorded`
              : 'No records for selected date'
          }
          icon={UserCheck}
        />

        <StatCard
          label="Absences"
          value={absentToday}
          subtext={`${lateToday} marked late on ${selectedDate}`}
          icon={Users}
        />
      </div>

      {/* Session Launcher (managers only) */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              01
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Attendance Session</h3>
              <p className="text-xs text-slate-400">
                Choose the academic date, year, term, section and course period to mark.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Academic Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-400" /> Academic Year
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {academicYears.length > 0 ? (
                  academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}{year.is_active ? ' (Active)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="">Not configured</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Term
              </label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {terms.length > 0 ? (
                  terms
                    .filter((t) => !selectedYearId || String(t.academic_year) === String(selectedYearId))
                    .map((term) => (
                      <option key={term.id} value={term.id}>{term.name}</option>
                    ))
                ) : (
                  <option value="">Not configured</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" /> Section
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All students</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" /> Course Period
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} · {c.name}</option>
                  ))
                ) : (
                  <option value="">No courses available</option>
                )}
              </select>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {selectedCourse ? `${selectedCourse.code} · ${selectedCourse.name}` : 'No course selected'}
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                    {rosterForModal.length} students
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assigned instructor: {selectedCourse?.teacher_name || 'Not assigned'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSessionSheet(selectedCourse)}
              disabled={!selectedCourseId}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/25 disabled:opacity-60 shrink-0"
            >
              <span>Open Attendance Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {canManage ? 'Course Ledgers' : 'Attendance Records'}
            </h3>
            <p className="text-xs text-slate-400">
              {canManage ? `Status for ${selectedDate}` : 'Your available attendance history'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by course, student, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {canManage ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Course Unit</th>
                  <th className="py-3 px-3">Assigned Faculty</th>
                  <th className="py-3 px-3">Enrolled</th>
                  <th className="py-3 px-3">Logged</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">No courses found.</td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => {
                    const logged = attendanceForDate.filter((r) => String(r.course) === String(course.id)).length;
                    const enrolled = enrolledIdsForCourse(course.id).length;
                    const status = logged > 0 ? 'Completed' : 'Pending';
                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 block font-mono text-[11px]">{course.code}</span>
                          <span className="text-[11px] text-slate-500">{course.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-800">{course.teacher_name || '—'}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{enrolled || '—'}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{logged}</td>
                        <td className="py-3.5 px-3"><StatusPill status={status} /></td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenSessionSheet(course)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            {logged > 0 ? 'Review' : 'Take Attendance'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {viewerRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">No attendance records available.</td>
                  </tr>
                ) : (
                  viewerRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-slate-700">{String(r.date || '').slice(0, 10)}</td>
                      <td className="py-3.5 px-3 text-slate-800">{r.course_name}</td>
                      <td className="py-3.5 px-3"><StatusPill status={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Live Attendance Marking Sheet Modal */}
      {showLiveSheet && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Attendance Sheet: {selectedCourse?.name || 'Course'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCourse?.code || ''} · Date: {selectedDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveSheet(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {rosterForModal.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No enrolled students found for this course.
                </div>
              ) : (
                rosterForModal.map((student) => {
                  const currentStatus = attendanceStatuses[student.id] || 'present';
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                          {student.user_detail?.first_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {student.user_detail?.first_name} {student.user_detail?.last_name || student.roll_number}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {student.roll_number || '—'} · {student.class_name || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {ATTENDANCE_STATUSES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAttendanceStatuses({ ...attendanceStatuses, [student.id]: st })}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                              currentStatus === st
                                ? st === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Changes are recorded to the audit trail.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLiveSheet(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingAttendance}
                  onClick={handleSaveSession}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingAttendance ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
