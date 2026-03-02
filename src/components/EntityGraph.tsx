import React from 'react';
import { Card } from './ui/Card';
import { ZoomIn, ZoomOut, Maximize, Filter } from 'lucide-react';
import { cn } from '../utils/cn';
import type { CaseEntity } from '../utils/types';

interface EntityGraphProps {
  entities?: CaseEntity[];
}

export function EntityGraph({ entities = [] }: EntityGraphProps) {
  return (
    <Card
      noPadding
      className="h-[600px] flex flex-col relative overflow-hidden bg-slate-950">

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-sm z-10">
        <div className="text-xs font-medium text-slate-400 mb-2">
          Entity Types
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-xs text-slate-300">Vendor</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-xs text-slate-300">User</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            <span className="text-xs text-slate-300">Invoice</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-xs text-slate-300">Risk Signal</span>
          </div>
        </div>
      </div>

      {/* SVG Visualization - dynamic when entities provided */}
      <div className="flex-1 w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 p-8">
        {entities.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {entities.slice(0, 12).map((e, i) => (
              <div
                key={e.id}
                className={cn(
                  'px-4 py-3 rounded-lg border-2 min-w-[120px] text-center transition-all hover:scale-105',
                  e.type === 'vendor'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : e.type === 'user'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300'
                )}
              >
                <p className="font-semibold text-sm truncate">{e.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{e.type}</p>
              </div>
            ))}
          </div>
        ) : (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="w-full h-full">

          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="28"
              refY="3.5"
              orient="auto">

              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
          </defs>

          {/* Edges */}
          <g
            stroke="#475569"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
            opacity="0.6">

            <line x1="400" y1="300" x2="250" y2="150" />
            <line x1="400" y1="300" x2="550" y2="150" />
            <line x1="400" y1="300" x2="400" y2="500" />
            <line x1="250" y1="150" x2="150" y2="250" />
            <line x1="550" y1="150" x2="650" y2="250" />
            <line
              x1="400"
              y1="500"
              x2="550"
              y2="150"
              strokeDasharray="5,5"
              stroke="#ef4444"
              strokeWidth="2" />

          </g>

          {/* Nodes */}
          {/* Central Node (Vendor) */}
          <g transform="translate(400, 300)">
            <circle
              r="30"
              fill="#3b82f6"
              fillOpacity="0.2"
              stroke="#3b82f6"
              strokeWidth="2" />

            <text
              textAnchor="middle"
              dy="5"
              fill="#e2e8f0"
              fontSize="10"
              fontWeight="bold">

              TechCorp
            </text>
            <text textAnchor="middle" dy="45" fill="#94a3b8" fontSize="10">
              Vendor
            </text>
          </g>

          {/* User Node */}
          <g transform="translate(400, 500)">
            <circle
              r="25"
              fill="#10b981"
              fillOpacity="0.2"
              stroke="#10b981"
              strokeWidth="2" />

            <text
              textAnchor="middle"
              dy="5"
              fill="#e2e8f0"
              fontSize="10"
              fontWeight="bold">

              J.DOE
            </text>
            <text textAnchor="middle" dy="40" fill="#94a3b8" fontSize="10">
              User
            </text>
          </g>

          {/* Invoice Nodes */}
          <g transform="translate(250, 150)">
            <circle
              r="20"
              fill="#a855f7"
              fillOpacity="0.2"
              stroke="#a855f7"
              strokeWidth="2" />

            <text textAnchor="middle" dy="4" fill="#e2e8f0" fontSize="9">
              INV-001
            </text>
          </g>

          <g transform="translate(550, 150)">
            <circle
              r="20"
              fill="#a855f7"
              fillOpacity="0.2"
              stroke="#a855f7"
              strokeWidth="2" />

            <text textAnchor="middle" dy="4" fill="#e2e8f0" fontSize="9">
              INV-002
            </text>
          </g>

          {/* Risk Signal */}
          <g transform="translate(650, 250)">
            <circle
              r="15"
              fill="#ef4444"
              fillOpacity="0.2"
              stroke="#ef4444"
              strokeWidth="2" />

            <text textAnchor="middle" dy="4" fill="#e2e8f0" fontSize="8">
              ALERT
            </text>
          </g>
        </svg>
        )}
      </div>
    </Card>);

}