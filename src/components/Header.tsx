import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
interface HeaderProps {
  onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 mr-4 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md lg:hidden">

          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search cases, entities, or transactions..."
            className="block w-full pl-10 pr-3 py-1.5 border border-slate-700 rounded-md leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors" />

        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
        </button>

        <div className="h-8 w-px bg-slate-800 mx-2" />

        <div className="flex items-center">
          <span className="text-xs font-medium text-slate-500 mr-2 uppercase tracking-wider hidden sm:block">
            Organization Admin
          </span>
        </div>
      </div>
    </header>);

}