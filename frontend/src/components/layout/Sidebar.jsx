import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  ClipboardCheck,
  Award,
  CreditCard,
  Receipt,
  Layers,
  Sparkles,
  ShieldAlert,
  LogOut,
  Briefcase
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { canAccessRoute } from '../../utils/roleAccess';

const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = currentUser.role || 'school_admin';

  const roleNameMap = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    admin: 'School Admin',
    principal: 'Principal',
    accountant: 'Accountant',
    receptionist: 'Receptionist',
    teacher: 'Faculty Lead',
    student: 'Student',
    parent: 'Guardian',
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Structured navigation categories matching Stitch UI
  const getNavSections = () => {
    if (role === 'super_admin') {
      return [
        {
          group: 'PLATFORM OPERATIONS',
          items: [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Schools & Tenancy', path: '/platform', icon: Layers },
          ],
        },
      ];
    }

    if (role === 'student') {
      return [
        {
          group: 'OVERVIEW',
          items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          group: 'ACADEMICS',
          items: [
            { name: 'Class Schedule', path: '/courses', icon: BookOpen },
            { name: 'Digital Attendance', path: '/attendance', icon: ClipboardCheck },
            { name: 'Exams & Results', path: '/results', icon: Award },
          ],
        },
        {
          group: 'FINANCE',
          items: [{ name: 'Tuition & Invoices', path: '/finance', icon: CreditCard }],
        },
        {
          group: 'OPPORTUNITIES',
          items: [{ name: 'Alumni Mentorship', path: '/mentorship', icon: Sparkles }],
        },
      ];
    }

    if (role === 'teacher') {
      return [
        {
          group: 'OVERVIEW',
          items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          group: 'CLASSROOM',
          items: [
            { name: 'Students', path: '/students', icon: GraduationCap },
            { name: 'Courses & Units', path: '/courses', icon: BookOpen },
            { name: 'Attendance Sessions', path: '/attendance', icon: ClipboardCheck },
            { name: 'Results & Scoring', path: '/results', icon: Award },
          ],
        },
        {
          group: 'CAREER & NETWORK',
          items: [{ name: 'Alumni Mentorship', path: '/mentorship', icon: Briefcase }],
        },
      ];
    }

    if (role === 'parent') {
      return [
        {
          group: 'OVERVIEW',
          items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
        },
        {
          group: 'FAMILY PORTAL',
          items: [
            { name: 'Student Ledgers', path: '/guardians', icon: Users },
            { name: 'Attendance Records', path: '/attendance', icon: ClipboardCheck },
            { name: 'Academic Results', path: '/results', icon: Award },
            { name: 'Invoices & Payments', path: '/finance', icon: CreditCard },
          ],
        },
      ];
    }

    // Default: School Admin, Principal, Teacher, Accountant, Receptionist
    const sections = [
      {
        group: 'OVERVIEW',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        group: 'PEOPLE',
        items: [
          { name: 'Students', path: '/students', icon: GraduationCap },
          ...(role !== 'accountant' ? [{ name: 'Teachers', path: '/teachers', icon: UserCheck }] : []),
          { name: 'Parents & Guardians', path: '/guardians', icon: Users },
          ...(role === 'school_admin' || role === 'admin' ? [{ name: 'Users & Roles', path: '/platform', icon: ShieldAlert }] : []),
        ],
      },
      {
        group: 'ACADEMICS',
        items: [
          { name: 'Academic Years', path: '/academic-periods', icon: Calendar },
          { name: 'Courses & Units', path: '/courses', icon: BookOpen },
        ],
      },
      {
        group: 'CLASSROOM',
        items: [
          { name: 'Attendance Sessions', path: '/attendance', icon: ClipboardCheck },
          { name: 'Results & Scoring', path: '/results', icon: Award },
        ],
      },
      {
        group: 'FINANCE',
        items: [
          { name: 'Invoices', path: '/finance', icon: Receipt },
          { name: 'Fee Operations', path: '/finance-operations', icon: CreditCard },
        ],
      },
      {
        group: 'CAREER & NETWORK',
        items: [
          { name: 'Alumni Mentorship', path: '/mentorship', icon: Briefcase },
        ],
      },
    ];

    return sections;
  };

  const navSections = getNavSections()
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => canAccessRoute(item.path, role)),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Top Brand Header */}
      <div className="h-18 px-5 border-b border-slate-100 flex items-center justify-between">
        <BrandLogo
          subtitle={currentUser.school_name || 'H-School'}
          role={roleNameMap[role] || 'School Admin'}
        />
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {sec.group}
            </h3>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path + item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info & Sign out */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between px-2 py-1.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-600">Active AY 2024–25</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
