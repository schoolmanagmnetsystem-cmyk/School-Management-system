import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  Receipt,
  Download,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { api } from '../utils/api';
import { downloadPdf, todayStamp } from '../utils/exportUtils';
import {
  StatCard,
  StatusPill,
  BreadcrumbNav
} from '../components/common/StitchUI';

const emptyForm = { student: '', amount: '', due_date: '' };

const Finance = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canManage = currentUser.role === 'accountant';

  const loadData = async () => {
    try {
      setLoading(true);
      const [inv, stu, sum] = await Promise.all([
        api.get('/invoices/').catch(() => ({ results: [] })),
        canManage ? api.get('/students/').catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
        api.get('/invoices/summary/').catch(() => null),
      ]);
      setInvoices(inv.results || inv || []);
      setStudents(stu.results || stu || []);
      setSummary(sum);
    } catch (e) {
      setError(e.message || 'Unable to load financial invoices.');
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
      await api.post('/invoices/', form);
      setSuccess('Invoice created successfully.');
      setForm(emptyForm);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (e) {
      setError(e.message || 'Error creating invoice.');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (invoice) => {
    const balance = parseFloat(invoice.balance_due ?? invoice.amount ?? 0);
    if (!(balance > 0)) {
      setError('This invoice has no outstanding balance to settle.');
      return;
    }
    setError('');
    try {
      await api.post('/invoices/payments/', {
        invoice: invoice.id,
        amount: balance,
        method: 'cash',
        reference: `Settlement for invoice #INV-${invoice.id}`,
      });
      setSuccess('Payment recorded and invoice settled.');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (e) {
      setError(e.message || 'Error recording payment.');
    }
  };

  const handleReceipt = (inv) => {
    downloadPdf(`receipt-INV-${inv.id}.pdf`, {
      title: 'H-School Tuition Receipt',
      subtitle: `Invoice #INV-${inv.id}${inv.due_date ? ` · Due ${inv.due_date}` : ''}`,
      blocks: [
        { heading: 'Student', lines: [inv.student_name || 'Enrolled Student'] },
        {
          heading: 'Charges',
          lines: [
            `Billed amount: $${parseFloat(inv.amount || 0).toFixed(2)}`,
            `Paid amount: $${parseFloat(inv.paid_amount || 0).toFixed(2)}`,
            `Balance due: $${parseFloat(inv.balance_due || 0).toFixed(2)}`,
          ],
        },
        {
          heading: 'Status',
          lines: [`Status: ${inv.status || 'pending'}`, `Generated: ${todayStamp()}`],
        },
      ],
    });
  };

  // Financial calculations (void invoices excluded; backend is source of truth when available)
  const activeInvoices = invoices.filter((i) => (i.status || '').toLowerCase() !== 'void');
  const totalBilled = activeInvoices.reduce((acc, inv) => acc + (parseFloat(inv.amount) || 0), 0);
  const paidInvoices = activeInvoices.filter((i) => (i.status || '').toLowerCase() === 'paid');
  const pendingInvoices = activeInvoices.filter((i) => (i.status || '').toLowerCase() !== 'paid');
  const totalPaid = activeInvoices.reduce((acc, inv) => acc + (parseFloat(inv.paid_amount) || 0), 0);
  const totalOutstanding = activeInvoices.reduce((acc, inv) => acc + (parseFloat(inv.balance_due) || 0), 0);
  const realizedPct = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans" aria-busy={loading}>
      <BreadcrumbNav items={['H-School', 'Finance & Bursary', 'Institutional Invoices & Tuition']} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Invoices & Tuition Ledgers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enrollment billing schedules, payment receipts, and accounts receivable tracking.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
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
          label="Total Billed Receivables"
          value={`$${parseFloat(summary?.total_amount ?? totalBilled).toLocaleString()}`}
          subtext={`${summary?.total_invoices ?? activeInvoices.length} Registered Invoices`}
          icon={Receipt}
        />
        <StatCard
          label="Settled & Paid"
          badge={`${realizedPct}% Realized`}
          badgeType="success"
          value={`$${parseFloat(summary?.total_collected ?? totalPaid).toLocaleString()}`}
          trend={`${summary?.paid_invoices ?? paidInvoices.length} Settled`}
          subtext="Processed via Tuition Gateway"
          icon={ShieldCheck}
        />
        <StatCard
          label="Outstanding Balance"
          value={`$${parseFloat(summary?.unpaid_amount ?? totalOutstanding).toLocaleString()}`}
          subtext={`${summary?.outstanding_invoices ?? pendingInvoices.length} Invoices Pending Settlement`}
          icon={CreditCard}
        />
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Tuition Ledger Records ({invoices.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice or student..."
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
                <th className="py-2.5 px-3">Billed Amount</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No active invoices found.
                  </td>
                </tr>
              ) : (
                invoices
                  .filter((i) =>
                    `${i.student_name || ''} ${i.amount || ''}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((inv) => {
                    const isPaid = (inv.status || '').toLowerCase() === 'paid';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {inv.student_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {inv.student_name || 'Enrolled Student'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #INV-2025-{inv.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900 font-mono text-[13px]">
                          ${parseFloat(inv.amount || 0).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600">
                          {inv.due_date || '2025-04-15'}
                        </td>

                        <td className="py-3 px-3">
                          <StatusPill
                            status={isPaid ? 'Active Session' : 'Pending'}
                            text={isPaid ? 'Settled' : 'Pending Payment'}
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => handleReceipt(inv)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          ) : canManage ? (
                            <button
                              onClick={() => handlePay(inv)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                            >
                              Settle Invoice
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">Pending Payment</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Generate Student Invoice</h3>
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
                  <option value="">Select Enrolled Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user_detail?.first_name} {s.user_detail?.last_name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tuition / Fee Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1500.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
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
                  {saving ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
