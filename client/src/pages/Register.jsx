import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-white relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-rose-500/25">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 font-heading">
              Start Your Story
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Create an account in 30 seconds to build cute proposal pages
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Romeo"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="romeo@love.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-rose-100 pt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
