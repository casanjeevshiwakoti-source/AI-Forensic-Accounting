import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, LogIn, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../utils/auth';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <ShieldAlert className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">
          Forensic<span className="text-blue-500">AI</span>
        </h1>
        <p className="text-slate-500 text-center mb-8 text-sm">
          Sign in to access the forensic accounting platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-xs text-slate-600 text-center">
          Demo: admin / admin123 &nbsp;|&nbsp; demo / demo123
        </p>

        <Link
          to="/whitepaper"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-amber-400/90 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Read the Technical Whitepaper
        </Link>
      </div>
    </div>
  );
}
