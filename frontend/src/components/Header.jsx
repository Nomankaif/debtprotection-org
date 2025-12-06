import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Blogs', to: '/resources' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
];

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (item) => {
    if (item.hash) {
      return location.pathname === '/' && location.hash === `#${item.hash}`;
    }
    if (item.to === '/resources') {
      return location.pathname.startsWith('/resources') || location.pathname.startsWith('/blog');
    }
    return location.pathname === item.to;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/debt_protection.png" alt="Debt Protection logo" className="h-15 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`inline-flex items-center ${isActive(item) ? 'text-slate-900' : 'hover:text-slate-900'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/contact"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get Started
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-white shadow-sm transition hover:bg-blue-700 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            {navigation.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`rounded-md px-4 py-2 text-sm font-medium ${isActive(item) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
