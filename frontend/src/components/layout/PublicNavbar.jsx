import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const PublicNavbar = () => {
  return (
    <header className="absolute top-0 right-0 left-0 h-[80px] z-50 px-8 flex items-center justify-between bg-white w-full shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold opacity-0 invisible" />
        <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
          H<span className="text-primary">-School</span>
        </span>
      </div>

      <nav className="hidden md:flex flex-1 items-center justify-center gap-10">
        <div className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
          Products <ChevronDown size={16} className="text-slate-400" />
        </div>
        <div className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
          Explore <ChevronDown size={16} className="text-slate-400" />
        </div>
        <div className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
          Support <ChevronDown size={16} className="text-slate-400" />
        </div>
      </nav>

      <div className="flex items-center gap-4">
        <Link 
          to="/login"
          className="flex items-center gap-2 px-6 py-2 rounded-lg border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Login
        </Link>
      </div>
    </header>
  );
};

export default PublicNavbar;
