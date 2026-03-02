import React from 'react';
import { TimelineEvent } from '../utils/types';
import { Card } from './ui/Card';
import {
  FileText,
  CreditCard,
  CheckCircle,
  AlertOctagon,
  FileDigit } from
'lucide-react';
import { cn } from '../utils/cn';
interface TimelineViewerProps {
  events: TimelineEvent[];
}
export function TimelineViewer({ events }: TimelineViewerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return FileText;
      case 'payment':
        return CreditCard;
      case 'approval':
        return CheckCircle;
      case 'alert':
        return AlertOctagon;
      case 'gl_entry':
        return FileDigit;
      default:
        return FileText;
    }
  };
  const getColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'payment':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'approval':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'alert':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };
  return (
    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-slate-800">
      {events.map((event) => {
        const Icon = getIcon(event.type);
        const colorClass = getColor(event.type);
        return (
          <div key={event.id} className="relative group">
            {/* Dot on timeline */}
            <div
              className={cn(
                'absolute left-0 top-1 -ml-[22px] h-3 w-3 rounded-full border-2 border-slate-950 ring-4 ring-slate-950',
                event.riskLevel === 'high' || event.riskLevel === 'critical' ?
                'bg-red-500' :
                'bg-slate-600'
              )} />


            <Card className="hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={cn('p-2 rounded-lg border', colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-slate-200">
                        {event.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                      <span className="flex items-center">
                        <span className="font-medium text-slate-400 mr-1">
                          Actor:
                        </span>
                        {event.actor}
                      </span>
                      {event.amount &&
                      <span className="flex items-center">
                          <span className="font-medium text-slate-400 mr-1">
                            Amount:
                          </span>
                          <span className="font-mono text-slate-300">
                            ${event.amount.toLocaleString()}
                          </span>
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>);

      })}
    </div>);

}