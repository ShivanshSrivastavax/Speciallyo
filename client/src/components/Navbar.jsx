import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, PlusCircle, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not show full navbar on public recipient proposal views
  if (location.pathname.startsWith('/p/')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-rose-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent font-heading">
                LoveLink
              </span>
              <span className="text-[10px] -mt-1 font-medium text-rose-400 tracking-wider uppercase">
                Interactive Proposals
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === '/dashboard'
                      ? 'text-rose-600 bg-rose-50 font-semibold'
                      : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/create"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 transition-all transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Proposal</span>
                </Link>

                <div className="h-5 w-px bg-rose-200 mx-2" />

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-full border border-rose-200">
                    {user?.name || 'Creator'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-lg border-b border-rose-100 shadow-lg animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold text-rose-600 bg-rose-50"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Proposal</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout ({user?.name})</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-rose-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Free Proposal</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
