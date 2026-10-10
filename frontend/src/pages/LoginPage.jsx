import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock, LogIn, UserRound, Stethoscope, Shield } from 'lucide-react';
import Alert from '../components/common/Alert';
import { authService } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('patient');
  const [selectedAccountEmail, setSelectedAccountEmail] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!import.meta.env.DEV || selectedRole === 'admin') {
      setAccounts([]);
      setAccountsError('');
      return undefined;
    }

    let active = true;
    setAccounts([]);
    setAccountsError('');
    setAccountsLoading(true);

    authService.getLoginAccounts(selectedRole)
      .then((data) => {
        if (active) setAccounts(data.accounts || []);
      })
      .catch((err) => {
        if (active) setAccountsError(err.message || 'Could not load available accounts.');
      })
      .finally(() => {
        if (active) setAccountsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRole]);

  const redirectAfterLogin = (role) => {
    // If there was an intended route like booking a doctor, redirect there
    const from = location.state?.from;
    if (from && typeof from === 'string') {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'patient') navigate('/patient/dashboard', { replace: true });
    else if (role === 'doctor') navigate('/doctor/dashboard', { replace: true });
    else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password, selectedRole);
      if (data.success && data.user) {
        redirectAfterLogin(data.user.role);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (event) => {
    const account = accounts.find((item) => item.email === event.target.value);
    if (!account) return;

    setEmail(account.email);
    setPassword('password123');
    setSelectedAccountEmail(account.email);
    setError('');
  };

  const roles = [
    { value: 'patient', label: 'Patient/User', Icon: UserRound },
    { value: 'doctor', label: 'Doctor', Icon: Stethoscope },
    { value: 'admin', label: 'Admin', Icon: Shield },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500">
            Access your patient appointments, doctor schedule, or administrative oversight
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Choose login role">
            {roles.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSelectedRole(value);
                  setSelectedAccountEmail('');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                aria-pressed={selectedRole === value}
                className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  selectedRole === value
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {import.meta.env.DEV && selectedRole !== 'admin' && (
            <div className="space-y-2">
              <label
                htmlFor="login-account"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Select {selectedRole === 'patient' ? 'Patient/User' : 'Doctor'}
              </label>
              <select
                id="login-account"
                value={selectedAccountEmail}
                onChange={handleAccountSelect}
                disabled={accountsLoading}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 disabled:opacity-60"
              >
                <option value="" disabled>
                  {accountsLoading ? 'Loading accounts...' : 'Choose an account'}
                </option>
                {accounts.map((account) => (
                  <option key={account.email} value={account.email}>
                    {account.name}
                    {account.specialization ? ` — ${account.specialization}` : ''}
                  </option>
                ))}
              </select>
              {accountsError && <p className="text-xs text-rose-600">{accountsError}</p>}
              {!accountsLoading && !accountsError && accounts.length === 0 && (
                <p className="text-xs text-slate-500">No linked accounts are available for this role.</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
