import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Award,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const emptyForm = { name: '', code: '', teacher: '' };

const Courses = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = currentUser.role === 'admin' || currentUser.role === 'school_admin';

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
      const [c, t] = await Promise.all([api.get('/courses/'), api.get('/teachers/')]);
      setCourses(c.results || c || []);
      setTeachers(t.results || t || []);
    } catch {
      setError('Failed to load courses data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name, code: form.code, teacher: form.teacher || null };
      if (editId) {
        await api.patch(`/courses/${editId}/`, payload);
        setSuccess('Course updated successfully.');
      } else {
        await api.post('/courses/', payload);
        setSuccess('Course created successfully.');
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

  const handleEdit = (c) => {
    setForm({ name: c.name, code: c.code, teacher: c.teacher || '' });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}/`);
      setSuccess('Course removed.');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch {
      setError('Failed to delete course.');
    }
  };

  const assignedCount = courses.filter((c) => c.teacher).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'Academics', 'Courses & Classes']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Courses & Instructional Units
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental curriculum codes, syllabus distribution, and faculty assignments.
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
            <span>Add Course</span>
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
          label="Total Course Units"
          value={courses.length}
          subtext="Active in Winter 2025"
          icon={BookOpen}
        />
        <StatCard
          label="Assigned Lead Faculty"
          value={`${assignedCount} of ${courses.length}`}
          trend={`${courses.length > 0 ? Math.round((assignedCount / courses.length) * 100) : 100}% Staffed`}
          subtext="Full instructional coverage"
          icon={Users}
        />
        <StatCard
          label="Registered Teachers"
          value={teachers.length}
          subtext="Available faculty pool"
          icon={Award}
        />
      </div>

      {/* Course List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Active Course Catalog ({courses.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code or title..."
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
                <th className="py-2.5 px-3">Course Code</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Lead Faculty</th>
                <th className="py-2.5 px-3">Status</th>
                {canManage && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="text-center py-8 text-slate-400">
                    No courses registered yet.
                  </td>
                </tr>
              ) : (
                courses
                  .filter((c) =>
                    `${c.name} ${c.code} ${c.teacher_name || ''}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {c.code}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-bold">
                        {c.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {c.teacher_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                              {c.teacher_name.charAt(0)}
                            </span>
                            <span>{c.teacher_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <StatusPill status="Active Session" text="Curriculum Active" />
                      </td>
                      {canManage && (
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(c)}
                              title="Edit"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Delete"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editId ? 'Edit Course Unit' : 'Create Course Unit'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHY-401"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP Physics C (Mechanics)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Lead Faculty</label>
                <select
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Instructor (Optional)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user_detail?.first_name} {t.user_detail?.last_name} ({t.department || 'General'})
                    </option>
                  ))}
                </select>
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
                  {saving ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
