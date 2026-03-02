import React from 'react';
import { Case } from '../utils/types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from './ui/Button';
interface CaseQueueProps {
  cases: Case[];
  onCaseClick: (caseId: string) => void;
}
export function CaseQueue({ cases, onCaseClick }: CaseQueueProps) {
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      // Using blue for medium to differentiate
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  return (
    <Card noPadding className="overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Priority Case Queue
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="h-3 w-3 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowUpDown className="h-3 w-3 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Case ID</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Risk Level</th>
              <th className="px-6 py-3 text-right">Exposure</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {cases.map((c) =>
            <tr
              key={c.id}
              onClick={() => onCaseClick(c.id)}
              className="hover:bg-slate-800/50 cursor-pointer transition-colors group">

                <td className="px-6 py-4 font-mono text-slate-400">{c.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-200">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.type}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getRiskBadgeVariant(c.riskLevel)}>
                    {c.riskLevel.toUpperCase()} ({c.riskScore})
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-300">
                  {formatCurrency(c.exposureAmount)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 capitalize">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 inline-block" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>);

}