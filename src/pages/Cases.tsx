import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/Pagination';
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Database,
  ArrowRight,
  FolderOpen,
  Eye,
  FileDown,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useDataStore } from '../utils/dataStore';
import { mockUsers } from '../utils/mockData';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const STATUS_OPTIONS = ['open', 'review', 'escalated', 'closed'] as const;

export function Cases() {
  const navigate = useNavigate();
  const { isDataLoaded, cases, updateCase, addCase } = useDataStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({
    title: '',
    description: '',
    type: 'Manual',
    riskLevel: 'medium' as const,
    assignee: '',
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportList = () => {
    const toExport = selectedCases.length > 0
      ? cases.filter((c) => selectedCases.includes(c.id))
      : filteredCases;
    const csv = [
      ['Case ID', 'Title', 'Type', 'Risk', 'Exposure', 'Status', 'Assignee'].join(','),
      ...toExport.map((c) =>
        [c.id, `"${c.title}"`, c.type, c.riskLevel, c.exposureAmount, c.status, c.assignee ?? ''].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCase = () => {
    if (newCaseForm.title.trim()) {
      addCase({
        title: newCaseForm.title.trim(),
        description: newCaseForm.description.trim(),
        type: newCaseForm.type,
        riskLevel: newCaseForm.riskLevel,
        assignee: newCaseForm.assignee || undefined,
      });
      setShowNewCaseModal(false);
      setNewCaseForm({ title: '', description: '', type: 'Manual', riskLevel: 'medium', assignee: '' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesStatus =
      filterStatus === 'All' ||
      c.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesRisk =
      filterRisk === 'All' ||
      c.riskLevel.toLowerCase() === filterRisk.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesRisk && matchesSearch;
  });

  const totalFiltered = filteredCases.length;
  const start = (page - 1) * pageSize;
  const paginatedCases = filteredCases.slice(start, start + pageSize);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalFiltered / pageSize));
    if (page > maxPage) setPage(1);
  }, [totalFiltered, pageSize, page]);

  // Empty state when no data is loaded
  if (!isDataLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Case Management
            </h1>
            <p className="text-slate-400 mt-1">
              Manage and track ongoing investigations.
            </p>
          </div>
        </div>

        <Card className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-5 bg-slate-800 rounded-full">
              <FolderOpen className="h-10 w-10 text-slate-500" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-200 mb-2">
            No Cases Generated
          </h2>
          <p className="text-slate-400 text-center max-w-md mb-6">
            Upload and process your financial data to automatically generate
            investigation cases based on detected fraud patterns.
          </p>

          <Button onClick={() => navigate('/ingestion')}>
            <Database className="h-4 w-4 mr-2" />
            Upload Data
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>
      </div>);

  }

  const toggleSelection = (id: string) => {
    if (selectedCases.includes(id)) {
      setSelectedCases(selectedCases.filter((c) => c !== id));
    } else {
      setSelectedCases([...selectedCases, id]);
    }
  };
  const toggleAll = () => {
    if (selectedCases.length === paginatedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(paginatedCases.map((c) => c.id));
    }
  };
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Case Management</h1>
          <p className="text-slate-400 mt-1">
            Manage and track ongoing investigations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportList} disabled={filteredCases.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Button onClick={() => setShowNewCaseModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search cases..."
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

            </div>
            <div className="flex gap-2">
              <select
                className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}>

                <option value="All">All Status</option>
                <option value="open">Open</option>
                <option value="review">Review</option>
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}>

                <option value="All">All Risks</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{filteredCases.length} cases found</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-offset-slate-900"
                    checked={
                      selectedCases.length === paginatedCases.length &&
                      paginatedCases.length > 0
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-3">Case ID</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Risk</th>
                <th className="px-6 py-3 text-right">Exposure</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assignee</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedCases.length > 0 ? (
                paginatedCases.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  'hover:bg-slate-800/50 transition-colors group',
                  selectedCases.includes(c.id) ? 'bg-blue-500/5' : ''
                )}>

                    <td className="px-6 py-4">
                      <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-offset-slate-900"
                    checked={selectedCases.includes(c.id)}
                    onChange={() => toggleSelection(c.id)} />

                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="hover:text-blue-400 hover:underline"
                      >
                        {c.id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {c.title}
                      </div>
                      <div className="text-xs text-slate-500">{c.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRiskBadgeVariant(c.riskLevel)}>
                        {c.riskLevel.toUpperCase()} ({c.riskScore})
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      ${c.exposureAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded text-xs font-medium border capitalize',
                      c.status === 'open' ?
                      'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      c.status === 'escalated' ?
                      'bg-red-500/10 text-red-400 border-red-500/20' :
                      c.status === 'closed' ?
                      'bg-slate-800 text-slate-400 border-slate-700' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>

                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {c.assignee ||
                  <span className="text-slate-600 italic">
                          Unassigned
                        </span>
                  }
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative" ref={openMenuId === c.id ? menuRef : undefined}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === c.id && (
                        <div className="absolute right-4 top-full mt-1 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px]">
                          <button
                            onClick={() => { navigate(`/cases/${c.id}`); setOpenMenuId(null); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" /> View Case
                          </button>
                          <div className="border-t border-slate-700 my-1" />
                          <div className="px-3 py-1 text-xs text-slate-500">Change Status</div>
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => { updateCase(c.id, { status: s }); setOpenMenuId(null); }}
                              className="w-full px-4 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700 capitalize"
                            >
                              {s}
                            </button>
                          ))}
                          <div className="border-t border-slate-700 my-1" />
                          <div className="px-3 py-1 text-xs text-slate-500">Assign To</div>
                          {mockUsers.slice(0, 3).map((u) => (
                            <button
                              key={u.id}
                              onClick={() => { updateCase(c.id, { assignee: u.name }); setOpenMenuId(null); }}
                              className="w-full px-4 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700"
                            >
                              {u.name}
                            </button>
                          ))}
                          <div className="border-t border-slate-700 my-1" />
                          <button
                            onClick={() => {
                              const report = { case: c, exportedAt: new Date().toISOString() };
                              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                              const a = document.createElement('a');
                              a.href = URL.createObjectURL(blob);
                              a.download = `case-${c.id}-export.json`;
                              a.click();
                              URL.revokeObjectURL(a.href);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                          >
                            <FileDown className="h-4 w-4" /> Export Case
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-slate-500">

                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 mb-3 opacity-50" />
                      <p>No cases found matching your filters.</p>
                      <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setFilterStatus('All');
                        setFilterRisk('All');
                        setSearchQuery('');
                      }}>

                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredCases.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalFiltered}
            onPageChange={(p) => {
              setPage(p);
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        )}
      </Card>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowNewCaseModal(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-100">New Case</h2>
              <button onClick={() => setShowNewCaseModal(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Case title"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newCaseForm.description}
                  onChange={(e) => setNewCaseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Case description"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={newCaseForm.type}
                  onChange={(e) => setNewCaseForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Manual">Manual</option>
                  <option value="Structuring">Structuring</option>
                  <option value="Segregation of Duties">Segregation of Duties</option>
                  <option value="Shell Vendor Risk">Shell Vendor Risk</option>
                  <option value="Behavioral Anomaly">Behavioral Anomaly</option>
                  <option value="Payment Anomaly">Payment Anomaly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Risk Level</label>
                <select
                  value={newCaseForm.riskLevel}
                  onChange={(e) => setNewCaseForm((f) => ({ ...f, riskLevel: e.target.value as typeof newCaseForm.riskLevel }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
                <select
                  value={newCaseForm.assignee}
                  onChange={(e) => setNewCaseForm((f) => ({ ...f, assignee: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {mockUsers.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowNewCaseModal(false)}>Cancel</Button>
              <Button onClick={handleCreateCase} disabled={!newCaseForm.title.trim()}>Create Case</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}