import React, { useState } from 'react';
import { Transaction } from '../utils/types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Download, Filter } from 'lucide-react';
import { Button } from './ui/Button';
import { Pagination } from './Pagination';

interface EvidenceTableProps {
  transactions: Transaction[];
  pageSize?: number;
}

const hasAiScores = (txs: Transaction[]) => txs.some((t) => t.aiScore !== undefined);

function exportToCSV(transactions: Transaction[]) {
  const withAi = hasAiScores(transactions);
  const headers = withAi ? ['Date', 'Type', 'Reference', 'Vendor', 'Amount', 'User', 'AI Risk', 'Flags'] : ['Date', 'Type', 'Reference', 'Vendor', 'Amount', 'User', 'Flags'];
  const rows = transactions.map((t) => {
    const base = [t.date, t.type, t.reference, t.vendor, t.amount, t.user];
    if (withAi) {
      const s = t.aiScore;
      base.push(typeof s === 'number' && Number.isFinite(s) ? `${Math.round(Math.max(0, Math.min(100, s * 100)))}%` : '');
    }
    base.push(t.flags.join('; '));
    return base;
  });
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evidence-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function EvidenceTable({ transactions, pageSize: initialPageSize = 10 }: EvidenceTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const start = (page - 1) * pageSize;
  const paginatedTransactions = transactions.slice(start, start + pageSize);
  const showAiRisk = hasAiScores(transactions);

  return (
    <Card noPadding>
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200">Transaction Evidence</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-3 w-3 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(transactions)}
            disabled={transactions.length === 0}
          >
            <Download className="h-3 w-3 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3">User</th>
              {showAiRisk && <th className="px-6 py-3 text-right">AI Risk</th>}
              <th className="px-6 py-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginatedTransactions.map((tx) => {
              const raw = tx.aiScore;
              const pct =
                typeof raw === 'number' && Number.isFinite(raw)
                  ? Math.round(Math.max(0, Math.min(100, raw * 100)))
                  : null;
              const riskLevel = pct != null ? (pct >= 80 ? 'high' : pct >= 65 ? 'medium' : 'low') : null;
              return (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 text-slate-400">{tx.date}</td>
                  <td className="px-6 py-3 text-slate-300">{tx.type}</td>
                  <td className="px-6 py-3 font-mono text-slate-400">{tx.reference}</td>
                  <td className="px-6 py-3 text-slate-300">{tx.vendor}</td>
                  <td className="px-6 py-3 text-right font-mono text-slate-200">${tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-3 text-slate-400">{tx.user}</td>
                  {showAiRisk && (
                    <td className="px-6 py-3 text-right">
                      {pct != null ? (
                        <span
                          className={riskLevel === 'high' ? 'text-red-400 font-medium' : riskLevel === 'medium' ? 'text-amber-400' : 'text-slate-400'}
                          title="Model fraud risk score"
                        >
                          {pct}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  <td className="px-6 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {tx.flags.map((flag, i) => (
                        <Badge key={i} variant="destructive" className="text-[10px]">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {transactions.length > pageSize && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={transactions.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </Card>
  );
}