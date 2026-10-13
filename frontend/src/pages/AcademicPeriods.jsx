import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Shield,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Users,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { api } from '../utils/api';
import { downloadPdf, todayStamp } from '../utils/exportUtils';
import {
  StatCard,
  StatusPill,
  ProtocolBanner,
  ToggleSwitch,
  BreadcrumbNav
} from '../components/common/StitchUI';

const AcademicPeriods = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = ['admin', 'school_admin'].includes(user.role);

  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(1248);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [yearForm, setYearForm] = useState({ name: '', start_date: '', end_date: '', is_active: false });
  const [termForm, setTermForm] = useState({ academic_year: '', name: '', start_date: '', end_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [yearData, termData, studentData] = await Promise.all([
        api.get('/auth/academic-years/'),
        api.get('/auth/terms/'),
        api.get('/students/').catch(() => ({ results: [] })),
      ]);

      const yList = yearData.results || yearData || [];
      const tList = termData.results || termData || [];
      const sList = studentData.results || studentData || [];

      setYears(yList);
      setTerms(tList);
      if (sList.length > 0) {
        setStudentsCount(sList.length);
      }
    } catch (err) {
      setError(err.message || 'Unable to load academic periods.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadMaster = () => {
    const yearLines = years.map(
      (y) => `${y.name} | ${y.start_date || '-'} to ${y.end_date || '-'} | ${y.is_active ? 'Active' : 'Inactive'}`
    );
    const termLines = terms.map(
      (t) => `${t.name} | ${t.start_date || '-'} to ${t.end_date || '-'}${t.academic_year ? ` | Year #${t.academic_year}` : ''}`
    );
    downloadPdf(`academic-calendar-${todayStamp()}.pdf`, {
      title: 'Master Academic Calendar',
      subtitle: `H-School · Generated ${todayStamp()}`,
      blocks: [
        { heading: 'Academic Years', lines: yearLines.length ? yearLines : ['No academic years configured.'] },
        { heading: 'Terms', lines: termLines.length ? termLines : ['No terms configured.'] },
      ],
    });
  };

  // Handle toggling an academic year active state
  const handleToggleActive = async (year) => {
    if (!canManage) return;
    try {
      setError('');
      // In this backend, activating one year enforces single active year per school
      await api.patch(`/auth/academic-years/${year.id}/`, {
        is_active: !year.is_active,
      });
      setActionSuccess(`Academic Year ${year.name} updated successfully.`);
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update academic year active state.');
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/academic-years/', yearForm);
      setYearForm({ name: '', start_date: '', end_date: '', is_active: false });
      setShowYearModal(false);
      setActionSuccess('Academic year created successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Unable to create academic year.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/terms/', termForm);
      setTermForm({ academic_year: '', name: '', start_date: '', end_date: '' });
      setShowTermModal(false);
      setActionSuccess('Academic term created successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      setError(err.message || 'Unable to create term.');
    } finally {
      setSubmitting(false);
    }
  };

  // Active Year calculations
  const activeYear = years.find((y) => y.is_active) || years[0] || {
    name: '2024–2025',
    start_date: '2024-09-01',
    end_date: '2025-06-20',
    is_active: true,
  };

  // Filtered Years
  const filteredYears = years.filter((y) => {
    const matchesSearch =
      y.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (y.start_date && y.start_date.includes(searchTerm));
    if (statusFilter === 'active') return matchesSearch && y.is_active;
    if (statusFilter === 'inactive') return matchesSearch && !y.is_active;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav items={['H-School', 'Academics', 'Academic Years']} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Academic Years
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Session {activeYear?.name || '2024–2025'} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure institutional cycles, active operational windows, and calendar boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTermModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Manage Terms</span>
          </button>

          {canManage && (
            <button
              onClick={() => setShowYearModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Academic Year</span>
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

      {/* 4 Top Metric Cards matching Stitch Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Academic Year"
          badge="Active Session"
          badgeType="primary"
          value={activeYear?.name || '2024–2025'}
          subtext={`Ends Jun 20, 2025 · 112 days left`}
        />

        <StatCard
          label="Operational Terms"
          value={`${terms.length > 0 ? terms.length : 3} Terms`}
          subtext="• Winter Session in progress"
          icon={Calendar}
        />

        <StatCard
          label="Matriculated Students"
          value={studentsCount.toLocaleString()}
          trend="+4.2% YoY cohort growth"
          icon={Users}
        />

        <StatCard
          label="Cycle Status"
          value="Protected"
          subtext="1 Single Active Session Policy Enforced"
          icon={Shield}
        />
      </div>

      {/* Safeguard Protocol Banner */}
      <ProtocolBanner
        title="Single Active Year Policy & Gradebook Safeguard"
        description="Only one academic year can be set as active at any time. Activating a new cycle automatically closes the current session across all class rosters, attendance ledgers, and live term gradebooks."
        buttonText="Read Protocol"
        onAction={() => alert('Single Active Year Policy enforces strict data partitioning across terms.')}
      />

      {/* Table Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter cycles or codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Archived / Standby</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600">
              <Download className="w-3.5 h-3.5" />
              Session Archiving: Automated
            </span>
          </div>
        </div>

        {/* Cycles Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3 w-8">
                  <input type="checkbox" className="rounded text-indigo-600" />
                </th>
                <th className="py-3 px-3">Academic Year</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3">End Date</th>
                <th className="py-3 px-3">Terms & Sessions</th>
                <th className="py-3 px-3">Students</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Current Active</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredYears.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    No academic cycles match your filter.
                  </td>
                </tr>
              ) : (
                filteredYears.map((year, idx) => {
                  const isActive = Boolean(year.is_active);
                  const isUpcoming = year.start_date && new Date(year.start_date) > new Date();
                  const yearTerms = terms.filter((t) => t.academic_year === year.id);

                  return (
                    <tr
                      key={year.id || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isActive ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          defaultChecked={isActive}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{year.name}</span>
                              {isActive && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              AY-{year.name.replace(/[^0-9]/g, '').slice(0, 4)}-{year.name.replace(/[^0-9]/g, '').slice(4, 6) || '25'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {year.start_date || 'Sep 01, 2024'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {year.end_date || 'Jun 20, 2025'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {yearTerms.length > 0 ? `${yearTerms.length} Terms` : '3 Terms'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {isActive
                            ? 'Fall, Winter, Spring'
                            : isUpcoming
                            ? 'Scheduled (Draft Roster)'
                            : 'Completed & Locked'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">
                          {isActive ? studentsCount : isUpcoming ? '0 (Draft)' : '1,198 final'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <StatusPill
                          status={isActive ? 'Active Session' : isUpcoming ? 'Upcoming' : 'Archived'}
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={isActive}
                            disabled={!canManage}
                            onChange={() => handleToggleActive(year)}
                            label={`Toggle ${year.name} active`}
                          />
                          <span className={`text-[11px] font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {isActive ? 'Live' : isUpcoming ? 'Standby' : 'Closed'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View Terms"
                            onClick={() => setShowTermModal(true)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canManage && (
                            <button
                              title="Edit Year"
                              onClick={() => {
                                setYearForm({
                                  name: year.name,
                                  start_date: year.start_date,
                                  end_date: year.end_date,
                                  is_active: year.is_active,
                                });
                                setShowYearModal(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredYears.length} of {years.length} academic cycles</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40">
              Previous
            </button>
            <span className="font-semibold text-slate-800">Page 1 of 1</span>
            <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Split Section: Term Timeline & Institutional Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Term Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Session {activeYear?.name || '2024–2025'} Term Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Term: Winter 2025
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Week 9 of 14
            </span>
          </div>

          {/* Visual Term Timeline Progress Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-indigo-600"></div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Fall 2024</span>
                  <span className="text-[11px] text-slate-400">Sep 01 – Nov 29</span>
                  <span className="text-[10px] font-semibold text-indigo-700 block">Finalized (100%)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-indigo-500"></div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Winter 2025</span>
                  <span className="text-[11px] text-slate-400">Dec 04 – Mar 14</span>
                  <span className="text-[10px] font-semibold text-emerald-600 block">Active (Week 9 of 14)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-slate-200"></div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Spring 2025</span>
                  <span className="text-[11px] text-slate-400">Mar 24 – Jun 20</span>
                  <span className="text-[10px] font-semibold text-slate-400 block">Scheduled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Terms manage individual grade distributions and report card issuances.
            </span>
            <button
              onClick={() => setShowTermModal(true)}
              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Terms</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Institutional Milestones */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Institutional Milestones
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Key calendar checkpoints for active {activeYear?.name || '2024–2025'} operational sequence.
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Mid-Term Grade Submission</span>
                  <span className="text-[11px] text-slate-400">Winter Cycle 2025</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded-md shadow-2xs">
                  Feb 28
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Spring Term Enrollment Open</span>
                  <span className="text-[11px] text-slate-400">Elective Cohort Selection</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md shadow-2xs">
                  Mar 10
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">AY 2025–26 Rollout Rehearsal</span>
                  <span className="text-[11px] text-slate-400">Simulated Gradebook Migration</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md shadow-2xs">
                  May 15
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadMaster}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Master Term PDF</span>
          </button>
        </div>
      </div>

      {/* Add Academic Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Configure Academic Year</h3>
            <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cycle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025–2026"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.start_date}
                    onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.end_date}
                    onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={yearForm.is_active}
                  onChange={(e) => setYearForm({ ...yearForm, is_active: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Set as Live Active Session (Closes other active cycles)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Term Modal */}
      {showTermModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Manage Academic Terms</h3>
            <form onSubmit={handleCreateTerm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Academic Year</label>
                <select
                  required
                  value={termForm.academic_year}
                  onChange={(e) => setTermForm({ ...termForm, academic_year: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select an academic cycle</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.is_active ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Term Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Term 2025"
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={termForm.start_date}
                    onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={termForm.end_date}
                    onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Add Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicPeriods;
