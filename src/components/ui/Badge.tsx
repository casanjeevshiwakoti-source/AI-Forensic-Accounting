import React from 'react';
import { cn } from '../../utils/cn';
interface BadgeProps {
  children: React.ReactNode;
  variant?:
  'default' |
  'outline' |
  'secondary' |
  'destructive' |
  'success' |
  'warning' |
  'info';
  className?: string;
}
export function Badge({
  children,
  variant = 'default',
  className
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-100',
    outline: 'border border-slate-700 text-slate-300',
    secondary: 'bg-slate-800 text-slate-300',
    destructive: 'bg-red-500/10 text-red-400 border border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}>

      {children}
    </span>);

}