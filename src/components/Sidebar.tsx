import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import {
  LayoutDashboard,
  FileSearch,
  Upload,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  User,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cases', path: '/cases', label: 'Cases', icon: FileSearch },
  { id: 'ai-analysis', path: '/ai-analysis', label: 'AI Analysis', icon: Cpu },
  { id: 'ingestion', path: '/ingestion', label: 'Data Ingestion', icon: Upload },
  { id: 'reports', path: '/reports', label: 'Reports', icon: FileText },
  { id: 'whitepaper', path: '/whitepaper', label: 'Whitepaper', icon: BookOpen },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout, userName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <ShieldAlert className="h-8 w-8 text-blue-500 flex-shrink-0" />
        {isOpen && (
          <span className="ml-3 font-bold text-lg text-slate-100 tracking-tight">
            Forensic<span className="text-blue-500">AI</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCasesRoute = item.path === '/cases';
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={!isCasesRoute}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center px-3 py-2.5 rounded-md transition-colors group',
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  {isOpen && (
                    <>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className={cn('flex items-center', isOpen ? 'justify-start' : 'justify-center')}>
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
            <User className="h-5 w-5" />
          </div>
          {isOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{userName ?? 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Lead Auditor</p>
            </div>
          )}
          {isOpen && (
            <button
              onClick={handleLogout}
              className="ml-auto text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
