import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'All Posts', path: '/admin/posts', icon: DocumentTextIcon },
    { name: 'Create Post', path: '/admin/posts/create', icon: PlusCircleIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all"></div>
                <img 
                  src="/images/debt_protection.png" 
                  alt="Logo" 
                  className="h-14 w-auto relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-4 py-2.5 rounded-xl font-semibold text-sm
                    transition-all duration-300 flex items-center space-x-2
                    ${isActive(link.path)
                      ? 'text-white bg-white/20 shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl border-2 border-white/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition-all backdrop-blur-sm">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Search</span>
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all backdrop-blur-sm">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <img
                  src={user?.avatar || 'https://cdn.vectorstock.com/i/500p/46/76/gray-male-head-placeholder-vector-23804676.jpg'}
                  alt="Profile"
                  className="h-9 w-9 rounded-full ring-2 ring-white/50"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-white">
                    {user?.firstName || 'Admin'} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-white/70 capitalize">{user?.role || 'Admin'}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                  >
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b">
                      <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <UserCircleIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">My Profile</span>
                      </Link>
                      <Link
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <HomeIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Visit Site</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white/10 backdrop-blur-lg border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl font-medium
                      transition-all
                      ${isActive(link.path)
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AdminNavbar;

