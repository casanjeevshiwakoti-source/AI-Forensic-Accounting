import React from 'react';
import { cn } from '../../utils/cn';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}
export function Card({
  className,
  children,
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-lg shadow-sm',
        className
      )}
      {...props}>

      <div className={cn(noPadding ? '' : 'p-6')}>{children}</div>
    </div>);

}