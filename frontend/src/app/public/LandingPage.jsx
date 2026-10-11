import React from 'react';
import { ShieldCheck, BookOpen, Users, BarChart3, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#241A4C] overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none custom-hero-bg" />
        
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="flex-1 space-y-8 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <span className="text-white font-bold text-sm">#1 Globally Ranked</span>
              <ShieldCheck size={16} className="text-[#3b82f6]" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Free Online <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#FFB800]">
                School Management
              </span><br/>
              Software
            </h1>

            <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Manage your school, college, or educational institution seamlessly with H-School. Everything you need, completely free for life.
            </p>

          </div>

          {/* Right: Single Image Section */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
             <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-8 border-white/10 bg-white/5 mx-auto">
               <div className="w-full h-full flex flex-col items-center justify-center text-white/40 bg-zinc-900/50">
                 {/* Place your single image here! */}
                 <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 <span className="text-sm font-bold tracking-widest uppercase">[Insert Platform Image Here]</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CORE FEATURES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to run your institution.</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16">
            A comprehensive suite of tools designed specifically for modern educators and administrators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Student Management</h3>
              <p className="text-slate-500 leading-relaxed">
                Track enrollment, admissions, attendance, and complete academic histories all in one centralized database.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-[#5B45F2]/10 rounded-xl flex items-center justify-center text-[#5B45F2] mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Academic Organization</h3>
              <p className="text-slate-500 leading-relaxed">
                Create syllabuses, manage exam schedules, log assignments, and securely record grading and report cards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Tracking</h3>
              <p className="text-slate-500 leading-relaxed">
                Automate tuition invoices, manage staff payroll, and generate intelligent financial reports in one click.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
              H<span className="text-[#5B45F2]">-School</span>
            </span>
          </div>
          
          <div className="text-slate-500 text-sm">
            © 2026 H-School Systems. Transforming education, globally.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
