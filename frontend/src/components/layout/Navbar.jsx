import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Search,
  LayoutDashboard,
  Clock,
  Shield,
  Hospital,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-medium transition-colors duration-150 px-3 py-1.5 rounded-lg ${
      isActive(path)
        ? 'text-emerald-700 bg-emerald-50 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const mobileLinkClass = (path) =>
    `block text-base font-medium px-4 py-2.5 rounded-lg transition-colors ${
      isActive(path)
        ? 'text-emerald-700 bg-emerald-50 font-semibold'
        : 'text-slate-700 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                Reaching the Unreached
              </span>
              <span className="text-xs text-emerald-600 font-medium block">
                Rural & Community Health Initiative
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Public Links */}
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/doctors" className={linkClass('/doctors')}>
              Find Doctors
            </Link>
            <Link to="/hospitals" className={linkClass('/hospitals')}>
              Hospitals & Beds
            </Link>

            {/* Role-Specific Links */}
            {isAuthenticated && user?.role === 'patient' && (
              <>
                <Link to="/appointments" className={linkClass('/appointments')}>
                  My Appointments
                </Link>
                <Link to="/patient/dashboard" className={linkClass('/patient/dashboard')}>
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'doctor' && (
              <>
                <Link to="/doctor/dashboard" className={linkClass('/doctor/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/appointments" className={linkClass('/appointments')}>
                  Appointments
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  Admin Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm inline-block mt-0.5 bg-slate-100 text-slate-600">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/')}
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/doctors')}
          >
            Find Doctors
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/hospitals')}
          >
            Hospitals & Beds
          </Link>

          {isAuthenticated && user?.role === 'patient' && (
            <>
              <Link
                to="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/appointments')}
              >
                My Appointments
              </Link>
              <Link
                to="/patient/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/patient/dashboard')}
              >
                Patient Dashboard
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'doctor' && (
            <>
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/doctor/dashboard')}
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/appointments')}
              >
                Appointments
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass('/admin/dashboard')}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role} • {user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
