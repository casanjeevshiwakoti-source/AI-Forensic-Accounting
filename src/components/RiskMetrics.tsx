import React from 'react';
import { Metric } from '../../utils/types';
import { Card } from './ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  DollarSign,
  ShieldCheck } from
'lucide-react';
import { cn } from '../utils/cn';
interface RiskMetricsProps {
  metrics: Metric[];
}
export function RiskMetrics({ metrics }: RiskMetricsProps) {
  const getIcon = (label: string) => {
    switch (label) {
      case 'Active Cases':
        return AlertTriangle;
      case 'Total Exposure':
        return DollarSign;
      case 'Detection Rate':
        return Activity;
      case 'Data Quality':
        return ShieldCheck;
      default:
        return Activity;
    }
  };
  const getColor = (label: string) => {
    switch (label) {
      case 'Active Cases':
        return 'text-amber-500';
      case 'Total Exposure':
        return 'text-red-500';
      case 'Detection Rate':
        return 'text-blue-500';
      case 'Data Quality':
        return 'text-emerald-500';
      default:
        return 'text-slate-400';
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = getIcon(metric.label);
        const colorClass = getColor(metric.label);
        return (
          <Card
            key={index}
            className="relative overflow-hidden group hover:border-slate-700 transition-colors">

            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                  {metric.value}
                </h3>
              </div>
              <div className={cn('p-2 rounded-lg bg-slate-800/50', colorClass)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center text-xs">
              {metric.status === 'positive' ?
              <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" /> :

              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              }
              <span
                className={cn(
                  'font-medium mr-1',
                  metric.status === 'positive' ?
                  'text-emerald-500' :
                  'text-red-500'
                )}>

                {metric.trend}%
              </span>
              <span className="text-slate-500">{metric.trendLabel}</span>
            </div>

            {/* Decorative gradient glow */}
            <div
              className={cn(
                'absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity',
                labelToBgColor(metric.label)
              )} />

          </Card>);

      })}
    </div>);

}
function labelToBgColor(label: string) {
  switch (label) {
    case 'Active Cases':
      return 'bg-amber-500';
    case 'Total Exposure':
      return 'bg-red-500';
    case 'Detection Rate':
      return 'bg-blue-500';
    case 'Data Quality':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-500';
  }
}