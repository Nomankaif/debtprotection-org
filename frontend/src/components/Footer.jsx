import React from 'react';
import { Link } from 'react-router-dom';

const primaryLinks = [
  { label: 'About', to: '/#about', hash: 'about' },
  { label: 'Services', to: '/#services', hash: 'services' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' },
];

const secondaryLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/privacy-policy#terms', hash: 'terms' },
  { label: 'Contact Us', to: '/contact' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-10 text-center">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/debt_protection.png" alt="Debt Protection logo" className="h-20 w-auto" />

          </Link>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
            {primaryLinks.map((link) => (
              <Link key={link.label} to={link.to} className="hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between sm:text-left">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {secondaryLinks.map((link) => (
                <Link key={link.label} to={link.to} className="hover:text-slate-700">
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-center sm:text-right">© {year} Debt Protection Co. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
