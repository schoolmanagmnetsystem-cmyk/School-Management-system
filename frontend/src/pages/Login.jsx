import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Shield, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { api } from '../utils/api';
import BrandLogo from '../components/common/BrandLogo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authTab, setAuthTab] = useState('credentials'); // 'credentials' or 'sso'

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.post('/auth/login/', {
        username: form.username.trim(),
        password: form.password,
      });
      if (!data?.access || !data?.refresh || !data?.user) {
        throw new Error('The sign-in service returned an incomplete response. Please try again.');
      }
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      if (err.status === 401) {
        setError('Incorrect username/email or password. Please try again.');
      } else if (err.status === 403) {
        setError(err.message || 'Your account does not currently have access to an active school.');
      } else if (err instanceof TypeError || !err.status) {
        setError('Unable to connect to the sign-in service. Please try again.');
      } else {
        setError(err.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo subtitle="PORTAL ACCESS" showBadge={false} />
        <Link
          to="/"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
        >
          <span>Back to home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Institutional Sign In
            </h1>
            <p className="text-xs text-slate-500">
              Access H-School terminal, records, and student ledgers
            </p>
          </div>

          {/* Tab Selector: Institutional Credentials vs SSO */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthTab('credentials')}
              className={`py-2 rounded-lg transition-all ${
                authTab === 'credentials'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('sso')}
              className={`py-2 rounded-lg transition-all ${
                authTab === 'sso'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Faculty SSO
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {authTab === 'credentials' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campus Username / Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. s.jenkins or j.doe24"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Account Password
                  </label>
                  <span
                    className="text-[11px] font-semibold text-slate-400 cursor-default"
                    title="Contact your school administrator to reset your password."
                  >
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Campus ERP'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Active Directory Single Sign-On</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Staff, instructors, and faculty directors can authenticate with their campus Google or Azure AD workspace credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('credentials');
                  setError('Single Sign-On is not configured for this deployment. Please sign in with your institutional credentials.');
                }}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs flex items-center justify-center gap-2"
              >
                <span>Continue with Campus AD / Google</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Accounts are provisioned by your school administrator. Contact your school office if you
              need access.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-[11px] text-slate-400">
          <p>Protected by 256-bit TLS encryption · H-School Admissions Terminal</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
