import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, LogOut, User, Building2 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Path mapping for breadcrumb context
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[0] || 'Dashboard';
  const formatSection = currentSection.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const displayName = currentUser.first_name && currentUser.last_name
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : (currentUser.username || 'Administrator');

  const roleLabel = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    admin: 'School Admin',
    principal: 'Principal',
    accountant: 'Accountant',
    receptionist: 'Receptionist',
    teacher: 'Faculty Lead',
    student: 'Student',
    parent: 'Guardian',
  }[currentUser.role] || 'School Admin';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 flex items-center justify-between px-6 lg:px-8 fixed top-0 right-0 left-64 z-20">
      {/* Left Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentUser.school_name || 'H-School'}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800">{formatSection}</span>
      </div>

      {/* Middle & Right Search + Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, students, assets..."
            className="w-full pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </span>
        </div>

        {/* Notifications Icon with unread badge matching Stitch */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {roleLabel}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800">{displayName}</p>
                <p className="text-[11px] text-slate-400">{currentUser.email || 'user@oakridge.edu'}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
