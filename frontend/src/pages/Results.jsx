import React, { useEffect, useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  GraduationCap,
  TrendingUp,
  Download
} from 'lucide-react';
import { api } from '../utils/api';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const emptyForm = { student: '', course: '', marks: '', grade: '' };

const GRADE_MAP = (marks) => {
  const m = parseFloat(marks);
  if (m >= 90) return 'A+';
  if (m >= 80) return 'A';
  if (m >= 70) return 'B';
  if (m >= 60) return 'C';
  if (m >= 50) return 'D';
  return 'F';
};

const Results = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['admin', 'school_admin', 'teacher'].includes(currentUser.role);
  const canPublish = ['admin', 'school_admin', 'principal'].includes(currentUser.role);

  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, s, c] = await Promise.all([
        api.get('/results/'),
        api.get('/students/'),
        api.get('/courses/'),
      ]);
      setResults(r.results || r || []);
      setStudents(s.results || s || []);
      setCourses(c.results || c || []);
    } catch {
      setError('Failed to load examination results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarksChange = (val) => {
    setForm((f) => ({ ...f, marks: val, grade: GRADE_MAP(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.patch(`/results/${editId}/`, { marks: form.marks, grade: form.grade });
        setSuccess('Result updated.');
      } else {
        await api.post('/results/', form);
        setSuccess('Result score recorded.');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (e) {
      setError('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id, currentStatus) => {
    setError('');
    try {
      if (currentStatus) {
        const reason = window.prompt('Provide a reason for withdrawing this result from the student portal:');
        if (!reason || !reason.trim()) return;
        await api.post(`/results/${id}/unpublish/`, { reason: reason.trim() });
        setSuccess('Result withdrawn from the student portal.');
      } else {
        await api.post(`/results/${id}/publish/`);
        setSuccess('Result published to the student portal.');
      }
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (e) {
      setError(e.message || 'Failed to update publication status.');
    }
  };

  const honorsCount = results.filter((r) => ['A+', 'A'].includes(r.grade)).length;
  const avgMarks =
    results.length > 0
      ? (results.reduce((acc, r) => acc + (parseFloat(r.marks) || 0), 0) / results.length).toFixed(1)
      : '88.4';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'Classroom', 'Examination Scoring & Results']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Examinations & Term Scoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grade distributions, official scorecards, and published transcripts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(emptyForm);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Record Score</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Graded Ledgers"
          value={results.length}
          subtext="Winter 2025 Cycle"
          icon={FileText}
        />
        <StatCard
          label="Cohort Average Score"
          value={`${avgMarks}%`}
          trend="+2.1% vs Term 1"
          subtext="Across all enrolled courses"
          icon={TrendingUp}
        />
        <StatCard
          label="Honors Distinction (A / A+)"
          badge="Dean's List"
          badgeType="success"
          value={`${honorsCount} Awards`}
          subtext="Exceeding 85% scale threshold"
          icon={Award}
        />
      </div>

      {/* Results Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Recorded Scorecards ({results.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or course..."
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
                <th className="py-2.5 px-3">Student Scholar</th>
                <th className="py-2.5 px-3">Course Unit</th>
                <th className="py-2.5 px-3">Marks</th>
                <th className="py-2.5 px-3">Letter Grade</th>
                <th className="py-2.5 px-3">Publication</th>
                {canPublish && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={canPublish ? 6 : 5} className="text-center py-8 text-slate-400">
                    No examination records posted yet.
                  </td>
                </tr>
              ) : (
                results
                  .filter((r) =>
                    `${r.student_name || ''} ${r.course_name || ''}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {r.student_name?.charAt(0) || 'S'}
                          </div>
                          <span className="font-bold text-slate-900">{r.student_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {r.course_name}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        {r.marks} / 100
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ['A+', 'A'].includes(r.grade)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : ['B', 'C'].includes(r.grade)
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusPill
                          status={r.is_published ? 'Active Session' : 'Standby'}
                          text={r.is_published ? 'Published Live' : 'Unpublished Draft'}
                        />
                      </td>
                      {canPublish && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handlePublish(r.id, r.is_published)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              r.is_published
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                            }`}
                          >
                            {r.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Score Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Scorecard</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  value={form.student}
                  onChange={(e) => setForm({ ...form, student: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Student Scholar</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user_detail?.first_name} {s.user_detail?.last_name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Course Unit</label>
                <select
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks (0 – 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculated Grade</label>
                  <input
                    type="text"
                    readOnly
                    value={form.grade}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
