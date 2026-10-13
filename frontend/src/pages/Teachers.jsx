import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Filter,
  Mail,
  Award,
  Building2,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const emptyForm = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  department: 'Sciences',
  designation: 'Senior Faculty',
};

const Teachers = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = currentUser.role === 'admin' || currentUser.role === 'school_admin';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/teachers/');
      setTeachers(data.results || data || []);
    } catch {
      setError('Failed to load faculty records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await api.patch(`/teachers/${editId}/`, {
          department: form.department,
          designation: form.designation,
        });
        setSuccess('Faculty record updated.');
      } else {
        await api.post('/auth/register/', {
          username: form.username,
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          role: 'teacher',
          department: form.department,
          designation: form.designation,
        });
        setSuccess('Faculty member onboarded successfully.');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadTeachers();
    } catch (e) {
      setError(e.message || 'Error saving faculty member.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setForm({
      username: t.user_detail?.username || '',
      first_name: t.user_detail?.first_name || '',
      last_name: t.user_detail?.last_name || '',
      email: t.user_detail?.email || '',
      password: '',
      department: t.department || 'Sciences',
      designation: t.designation || 'Faculty',
    });
    setEditId(t.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'People', 'Faculty & Instructors']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty & Department Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified instructors, department chairs, and academic advisors.
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
            <span>Onboard Faculty</span>
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
          label="Total Instructional Faculty"
          value={teachers.length}
          subtext="Active in Academic Year 2024–25"
          icon={UserCheck}
        />
        <StatCard
          label="Academic Departments"
          value="12 Verticals"
          subtext="STEM, Humanities, Arts & Languages"
          icon={Building2}
        />
        <StatCard
          label="Average Student Ratio"
          value="1 : 16.8"
          trend="Tier 1 Standard"
          subtext="Optimal seminar cohort density"
          icon={Award}
        />
      </div>

      {/* Faculty Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Registered Faculty Roster ({teachers.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty name, department..."
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
                <th className="py-2.5 px-3">Instructor</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Academic Email</th>
                <th className="py-2.5 px-3">Status</th>
                {canManage && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="text-center py-8 text-slate-400">
                    No faculty records registered.
                  </td>
                </tr>
              ) : (
                teachers
                  .filter((t) =>
                    `${t.user_detail?.first_name || ''} ${t.user_detail?.last_name || ''} ${t.department || ''}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {t.user_detail?.first_name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {t.user_detail?.first_name} {t.user_detail?.last_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              @{t.user_detail?.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {t.department || 'General Faculty'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {t.designation || 'Instructor'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {t.user_detail?.email || 'faculty@oakridge.edu'}
                      </td>
                      <td className="py-3 px-3">
                        <StatusPill status="Active Session" text="Active Faculty" />
                      </td>
                      {canManage && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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

      {/* Onboard Faculty Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editId ? 'Update Faculty Details' : 'Onboard New Faculty Member'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {!editId && (
                <>
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
                      <label className="block font-semibold text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
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
                  {saving ? 'Saving...' : editId ? 'Update Record' : 'Onboard Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
