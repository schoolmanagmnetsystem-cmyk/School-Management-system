import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Check,
  Calendar,
  CreditCard,
  Phone,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import BrandLogo from '../components/common/BrandLogo';

const Register = () => {
  const navigate = useNavigate();
  const [archetype, setArchetype] = useState('student'); // 'student' or 'parent'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State matching Stitch Image 1
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    roll_number: 'STU-2024-089',
    date_of_birth: '2008-04-16',
    class_name: 'Grade 10 (Secondary Certificate)',
    section: 'Section A (Pure Science & Tech)',
    agree_honor_code: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 1, label: 'Weak', color: 'bg-rose-400' };
    if (pwd.length < 6) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (pwd.length < 10) return { score: 3, label: 'Good', color: 'bg-indigo-400' };
    return { score: 4, label: 'Security: Robust', color: 'bg-indigo-600' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree_honor_code) {
      setError('Please agree to the Academic Honor Code and Acceptable Use Policies.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Connect to existing backend registration API
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: archetype,
        roll_number: formData.roll_number,
        class_name: formData.class_name,
        section: formData.section,
        date_of_birth: formData.date_of_birth,
      };

      await api.post('/auth/register/', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Registration submitted successfully. Please sign in.' },
        });
      }, 1500);
    } catch (err) {
      // If public registration requires school-staff token in strict mode, provide a friendly explanation
      setError(
        err.message ||
        'Institutional policy requires admission verification. Please contact the Registrar Helpdesk or try logging in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Header Bar */}
      <header className="max-w-4xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo subtitle="PORTAL ADMISSIONS & REGISTRY" showBadge={false} />
        <Link
          to="/login"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
        >
          <span>Already an enrolled user?</span>
          <span className="font-bold underline decoration-indigo-300">Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl w-full mx-auto px-4 pb-12">
        {/* Top Encrypted Notice Banner */}
        <div className="bg-indigo-50/60 border border-indigo-100/90 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Institutional Self-Registration</span>
                <span className="bg-indigo-100/80 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  STUDENTS & GUARDIANS ONLY
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                Staff, instructors, and faculty directors must access their operational terminals via verified Active Directory Single Sign-On (SSO).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px] shrink-0 self-start sm:self-center">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

        {/* Step 1: Select Account Archetype */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Step 1: Select Account Archetype
            </h2>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              STEP 1 OF 2
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Student Account Card */}
            <div
              onClick={() => setArchetype('student')}
              className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                archetype === 'student'
                  ? 'border-indigo-600 bg-white shadow-sm ring-4 ring-indigo-50'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                {archetype === 'student' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">Student Account</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Access class schedule, quarterly grades, digital attendance, syllabus, and exam archives.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Requires Institutional Roll No.</span>
              </div>
            </div>

            {/* Parent / Guardian Account Card */}
            <div
              onClick={() => setArchetype('parent')}
              className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                archetype === 'parent'
                  ? 'border-indigo-600 bg-white shadow-sm ring-4 ring-indigo-50'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                {archetype === 'parent' && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">Parent / Guardian Account</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monitor child attendance, live performance ledgers, discipline logs, and tuition settlement.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pairs to registered student ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Section Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-7">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Identity validated! Redirecting to sign in...</span>
            </div>
          )}

          {/* Section 1: Institutional Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Institutional Credentials
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campus Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="e.g. j.doe24"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    @
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Personal / Academic Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="student@academic.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Account Password
                </label>
                <span className="text-[11px] font-semibold text-indigo-600">
                  {strength.label}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Password strength 4-segment indicator bar */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      step <= strength.score ? 'bg-indigo-600' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Must contain minimum 8 characters, uppercase, and a numerical or symbolic token.
              </p>
            </div>
          </div>

          {/* Section 2: Student Identity Verification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {archetype === 'student' ? 'Student Identity Verification' : 'Guardian Identity Verification'}
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="Jonathan"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Official Roll Number
                  </label>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-100">
                    <Shield className="w-3 h-3" /> Card match
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="roll_number"
                    required
                    placeholder="STU-2024-089"
                    value={formData.roll_number}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Academic Placement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Academic Placement
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Academic Class
                </label>
                <select
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="Grade 10 (Secondary Certificate)">Grade 10 (Secondary Certificate)</option>
                  <option value="Grade 11 (Higher Secondary)">Grade 11 (Higher Secondary)</option>
                  <option value="Grade 12 (Advanced Placement)">Grade 12 (Advanced Placement)</option>
                  <option value="Grade 9 (Freshman Certificate)">Grade 9 (Freshman Certificate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Section / Track
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="Section A (Pure Science & Tech)">Section A (Pure Science & Tech)</option>
                  <option value="Section B (Bio-Medical Track)">Section B (Bio-Medical Track)</option>
                  <option value="Section C (Arts & Humanities)">Section C (Arts & Humanities)</option>
                  <option value="Section D (Commerce & Economics)">Section D (Commerce & Economics)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Honor Code Checkbox */}
          <div className="bg-indigo-50/30 border border-indigo-100/60 rounded-xl p-3.5 flex items-start gap-3">
            <input
              type="checkbox"
              id="honor_code"
              name="agree_honor_code"
              checked={formData.agree_honor_code}
              onChange={handleChange}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
            />
            <label htmlFor="honor_code" className="text-xs text-slate-600 leading-relaxed">
              I confirm that the submitted identity data conforms to institutional records and agree to abide by the{' '}
              <a href="#honor" className="text-indigo-600 font-semibold underline">
                Academic Honor Code
              </a>{' '}
              and{' '}
              <a href="#policies" className="text-indigo-600 font-semibold underline">
                Acceptable Use Policies
              </a>.
            </label>
          </div>

          {/* Action Button & Switch Link */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <User className="w-4 h-4" />
              <span>
                {loading
                  ? 'Verifying Record...'
                  : archetype === 'student'
                  ? 'Create Student Account'
                  : 'Create Guardian Account'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setArchetype(archetype === 'student' ? 'parent' : 'student')}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <span>
                {archetype === 'student'
                  ? 'Switch to Parent Registration'
                  : 'Switch to Student Registration'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer Support Info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Need help validating your admission roll number? Contact the{' '}
            <span className="text-indigo-600 font-medium">Registrar Helpdesk</span> or call campus extension{' '}
            <span className="text-slate-600 font-medium">+1 (800) 427-2466</span>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
