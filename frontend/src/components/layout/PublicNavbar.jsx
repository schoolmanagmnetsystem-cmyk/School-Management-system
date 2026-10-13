import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, Lock } from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Products',
    items: [
      { label: 'Student Management', href: '#features' },
      { label: 'Academic Organization', href: '#features' },
      { label: 'Financial Tracking', href: '#features' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { label: 'Overview', href: '#top' },
      { label: 'Student Portal', href: '#portal' },
      { label: 'How It Works', href: '#how' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Documentation', href: '#support' },
      { label: 'Contact', href: '#support' },
    ],
  },
];

const PublicNavbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 right-0 left-0 h-[80px] z-50 px-6 lg:px-8 flex items-center justify-between bg-white w-full shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
          H<span className="text-primary">-School</span>
        </span>
      </Link>

      <nav className="hidden md:flex flex-1 items-center justify-center gap-10">
        {NAV_SECTIONS.map((section) => (
          <div
            key={section.label}
            className="relative"
            onMouseEnter={() => setOpenMenu(section.label)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === section.label ? null : section.label)}
              className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
              aria-haspopup="true"
              aria-expanded={openMenu === section.label}
            >
              {section.label}
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${openMenu === section.label ? 'rotate-180' : ''}`}
              />
            </button>
            {openMenu === section.label && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56">
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                  {section.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="flex items-center gap-2 px-5 py-2 rounded-lg border-2 border-primary/20 text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Login
        </Link>
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-[80px] left-0 right-0 bg-white border-t border-slate-100 shadow-lg px-6 py-4 space-y-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.label}
              </span>
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
