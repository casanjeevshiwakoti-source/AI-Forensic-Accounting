import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { ChevronLeft, ChevronRight, BookOpen, X, Menu } from 'lucide-react';
import { cn } from '../utils/cn';

const stroke = '#f59e0b';
const fill = 'rgba(245, 158, 11, 0.15)';
const text = '#94a3b8';
const box = '#1e293b';

function SolutionDiagram() {
  return (
    <svg viewBox="0 0 420 140" className="w-full max-w-md mx-auto my-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={stroke} opacity="0.7" /></marker>
      </defs>
      <rect x="10" y="45" width="70" height="50" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="45" y="72" fill={text} fontSize="9" textAnchor="middle">CSV</text>
      <text x="45" y="83" fill={text} fontSize="7" textAnchor="middle">Vendor, AP,</text>
      <text x="45" y="91" fill={text} fontSize="7" textAnchor="middle">Payment, GL</text>

      <path d="M90 70 L120 70" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.8" />
      <path d="M90 70 Q155 30 220 50" stroke={stroke} strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" opacity="0.6" />
      <path d="M90 70 Q155 110 220 90" stroke={stroke} strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#arrow)" opacity="0.6" />

      <rect x="130" y="30" width="85" height="40" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="172" y="52" fill={text} fontSize="9" textAnchor="middle">Rules Engine</text>
      <text x="172" y="63" fill={text} fontSize="7" textAnchor="middle">7 patterns</text>

      <rect x="130" y="80" width="85" height="40" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="172" y="102" fill={text} fontSize="9" textAnchor="middle">ML Model</text>
      <text x="172" y="113" fill={text} fontSize="7" textAnchor="middle">Random Forest</text>

      <path d="M225 50 L275 70" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.8" />
      <path d="M225 90 L275 70" stroke={stroke} strokeWidth="1.5" markerEnd="url(#arrow)" opacity="0.8" />

      <rect x="285" y="45" width="125" height="50" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="347" y="65" fill={text} fontSize="9" textAnchor="middle">Investigation Cases</text>
      <text x="347" y="78" fill={text} fontSize="7" textAnchor="middle">Evidence · Timeline</text>
      <text x="347" y="90" fill={text} fontSize="7" textAnchor="middle">Export Reports</text>
    </svg>
  );
}

function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 480 200" className="w-full max-w-lg mx-auto my-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <defs>
        <marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={stroke} opacity="0.7" /></marker>
      </defs>
      <rect x="20" y="20" width="90" height="45" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="65" y="42" fill={text} fontSize="8" textAnchor="middle">Data Ingestion</text>
      <text x="65" y="55" fill={text} fontSize="6" textAnchor="middle">Parse CSV · Validate</text>

      <path d="M115 42 L150 42" stroke={stroke} strokeWidth="1" markerEnd="url(#ar2)" opacity="0.8" />

      <rect x="155" y="10" width="100" height="65" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="205" y="28" fill={text} fontSize="8" textAnchor="middle">Feature</text>
      <text x="205" y="40" fill={text} fontSize="8" textAnchor="middle">Engineering</text>
      <text x="205" y="55" fill={text} fontSize="6" textAnchor="middle">7 features/record</text>
      <text x="205" y="68" fill={text} fontSize="6" textAnchor="middle">vendor lookup</text>

      <path d="M260 42 L295 42" stroke={stroke} strokeWidth="1" markerEnd="url(#ar2)" opacity="0.8" />

      <rect x="300" y="20" width="85" height="45" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="342" y="40" fill={text} fontSize="8" textAnchor="middle">Rule-Based</text>
      <text x="342" y="55" fill={text} fontSize="6" textAnchor="middle">Case Gen</text>

      <path d="M342 70 L342 95" stroke={stroke} strokeWidth="1" markerEnd="url(#ar2)" opacity="0.8" />

      <rect x="20" y="115" width="90" height="45" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="65" y="132" fill={text} fontSize="8" textAnchor="middle">Train Model</text>
      <text x="65" y="145" fill={text} fontSize="6" textAnchor="middle">(optional)</text>

      <path d="M115 137 L195 137 L195 82" stroke={stroke} strokeWidth="1" strokeDasharray="3,2" markerEnd="url(#ar2)" opacity="0.6" />

      <rect x="155" y="120" width="100" height="50" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="205" y="138" fill={text} fontSize="8" textAnchor="middle">ml-random-forest</text>
      <text x="205" y="152" fill={text} fontSize="6" textAnchor="middle">localStorage</text>

      <path d="M260 145 L320 145 L320 70" stroke={stroke} strokeWidth="1" markerEnd="url(#ar2)" opacity="0.6" />

      <rect x="265" y="105" width="120" height="70" rx="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="325" y="128" fill={text} fontSize="9" textAnchor="middle">Cases & Evidence</text>
      <text x="325" y="142" fill={text} fontSize="6" textAnchor="middle">Timeline · Transactions</text>
      <text x="325" y="155" fill={text} fontSize="6" textAnchor="middle">Entities · Export</text>
    </svg>
  );
}

function DeploymentDiagram() {
  return (
    <svg viewBox="0 0 400 170" className="w-full max-w-md mx-auto my-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <defs>
        <marker id="ar3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={stroke} opacity="0.7" /></marker>
      </defs>
      <rect x="30" y="30" width="100" height="50" rx="6" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="80" y="52" fill={text} fontSize="8" textAnchor="middle">GitHub</text>
      <text x="80" y="65" fill={text} fontSize="6" textAnchor="middle">Repo</text>

      <path d="M135 55 L175 55" stroke={stroke} strokeWidth="1.5" markerEnd="url(#ar3)" opacity="0.8" />

      <rect x="180" y="20" width="100" height="70" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="230" y="42" fill={text} fontSize="9" textAnchor="middle">Vercel</text>
      <text x="230" y="58" fill={text} fontSize="7" textAnchor="middle">Build → dist/</text>
      <text x="230" y="72" fill={text} fontSize="7" textAnchor="middle">Static CDN</text>
      <text x="230" y="84" fill={text} fontSize="6" textAnchor="middle">No backend</text>

      <path d="M285 55 L325 55" stroke={stroke} strokeWidth="1.5" markerEnd="url(#ar3)" opacity="0.8" />

      <rect x="330" y="25" width="50" height="60" rx="6" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="355" y="45" fill={text} fontSize="7" textAnchor="middle">Browser</text>
      <text x="355" y="58" fill={text} fontSize="6" textAnchor="middle">React</text>
      <text x="355" y="70" fill={text} fontSize="6" textAnchor="middle">+ ML</text>

      <rect x="60" y="115" width="280" height="40" rx="4" fill={box} stroke={stroke} strokeWidth="1" />
      <text x="200" y="132" fill={text} fontSize="7" textAnchor="middle">Data never leaves client · localStorage for model</text>
      <text x="200" y="145" fill={text} fontSize="6" textAnchor="middle">Privacy-first · Zero server processing</text>
    </svg>
  );
}

const SLIDES = [
  {
    id: 'cover',
    section: '0',
    title: 'Technical Whitepaper',
    subtitle: 'AI Forensic Accounting Platform',
    content: (
      <div className="space-y-8 text-center max-w-2xl mx-auto">
        <p className="text-amber-400/90 text-lg font-light tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          In-Browser Machine Learning for Financial Fraud Detection
        </p>
        <p className="text-slate-400 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Version 1.0 · {new Date().getFullYear()}
        </p>
      </div>
    ),
  },
  {
    id: '1',
    section: '1.0',
    title: 'Executive Summary',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p>
          <strong className="text-slate-100">Financial fraud</strong> costs organizations billions annually. Traditional forensic accounting relies on manual review, rule-based scripts, and expensive enterprise tools—creating barriers for mid-market firms and audit teams.
        </p>
        <p>
          The <strong className="text-amber-400/90">AI Forensic Accounting Platform</strong> delivers automated fraud pattern detection through an in-browser machine learning pipeline. Users upload CSV exports (vendor master, AP invoices, payments, GL entries), and the system identifies structuring, self-approval violations, shell vendor risks, weekend payments, off-hours journal entries, and round-dollar anomalies—with optional ML scoring that adapts to their data.
        </p>
        <p className="text-amber-400/80 font-medium">
          Key takeaway: Zero backend, full deployment on Vercel, train-your-own model—enabling forensic-grade analysis without infrastructure cost.
        </p>
      </div>
    ),
  },
  {
    id: '2',
    section: '2.0',
    title: 'Introduction',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <h4 className="text-slate-100 font-semibold text-lg">Background</h4>
        <p>
          Forensic accounting combines accounting, auditing, and investigative skills to detect financial misconduct. Automation has historically required on-premises software, cloud APIs, or Python backends—limiting adoption for smaller teams.
        </p>
        <h4 className="text-slate-100 font-semibold text-lg mt-6">Objective & Scope</h4>
        <p>
          This whitepaper describes a <span className="text-amber-400/90 font-mono text-sm">client-side-only</span> forensic platform that (a) performs rule-based red-flag detection, (b) trains a Random Forest classifier in the browser using ml-random-forest, and (c) scores transactions for fraud risk without transmitting data to external servers. Scope: vendor, AP invoice, payment, and general ledger data in CSV format.
        </p>
      </div>
    ),
  },
  {
    id: '3',
    section: '3.0',
    title: 'Problem Statement',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <h4 className="text-slate-100 font-semibold text-lg">Industry Pain Points</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Manual review of thousands of transactions is error-prone and slow</li>
          <li>Threshold evasion (invoices just below approval limits) is easy to miss</li>
          <li>Self-approvals, duplicate bank accounts, and shell vendors require cross-dataset correlation</li>
          <li>Legacy tools are costly and often require IT integration</li>
        </ul>
        <h4 className="text-slate-100 font-semibold text-lg mt-6">Limitations of Existing Methods</h4>
        <p>
          Spreadsheet-based checks lack scalability. Enterprise GRC platforms require contracts and deployment. Cloud ML services raise data residency and privacy concerns. There is a gap for <strong className="text-slate-200">portable, privacy-preserving, and cost-free</strong> forensic analysis.
        </p>
      </div>
    ),
  },
  {
    id: '4',
    section: '4.0',
    title: 'Proposed Solution',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p>
          The platform combines <strong className="text-amber-400/90">deterministic rules</strong> with <strong className="text-amber-400/90">in-browser ML</strong>. Rule-based logic detects known patterns (e.g., amount in [$9,800, $10,000), same creator/approver). An optional Random Forest model trains on user data using these rules as weak labels and then scores new records for fraud probability.
        </p>
        <h4 className="text-slate-100 font-semibold text-lg">Key Benefits</h4>
        <ul className="space-y-2">
          <li className="flex gap-2"><span className="text-amber-400">→</span> <strong>Privacy-first:</strong> Data never leaves the user&apos;s browser</li>
          <li className="flex gap-2"><span className="text-amber-400">→</span> <strong>Zero infrastructure:</strong> Deployable as a static site on Vercel</li>
          <li className="flex gap-2"><span className="text-amber-400">→</span> <strong>Adaptive:</strong> Model learns from each organization&apos;s data</li>
          <li className="flex gap-2"><span className="text-amber-400">→</span> <strong>Audit trail:</strong> Cases, evidence tables, and exportable reports</li>
        </ul>
        <p className="text-slate-500 text-xs mt-4 text-center">Solution overview</p>
        <SolutionDiagram />
      </div>
    ),
  },
  {
    id: '5',
    section: '5.0',
    title: 'Technical Architecture',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <h4 className="text-slate-100 font-semibold text-lg">Stack</h4>
        <p>
          <span className="font-mono text-amber-400/90 bg-slate-800/80 px-2 py-1 rounded text-sm">React 18</span>, <span className="font-mono text-amber-400/90 bg-slate-800/80 px-2 py-1 rounded text-sm">TypeScript</span>, <span className="font-mono text-amber-400/90 bg-slate-800/80 px-2 py-1 rounded text-sm">Vite</span>, <span className="font-mono text-amber-400/90 bg-slate-800/80 px-2 py-1 rounded text-sm">Tailwind CSS</span>, <span className="font-mono text-amber-400/90 bg-slate-800/80 px-2 py-1 rounded text-sm">ml-random-forest</span>.
        </p>
        <h4 className="text-slate-100 font-semibold text-lg">Feature Engineering</h4>
        <p>
          Seven normalized features per record: <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">amount_log</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">threshold_evasion</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">self_approval</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">round_dollar</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">vendor_risk</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">weekend_payment</code>, <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">off_hours_entry</code>. Model: Random Forest (50 trees, 0.8 max features, balanced classes). Trained on 80% of data; tested on 20%. Persisted via <code className="text-xs font-mono text-slate-400 bg-slate-800 px-1 rounded">localStorage</code>.
        </p>
        <h4 className="text-slate-100 font-semibold text-lg mt-4">Data flow</h4>
        <p className="text-sm">CSV Upload → Parse & Validate → Rule-Based Cases → (if AI on) Feature Extract → Model Predict → AI-Detected Case Creation → Evidence Builder → Export.</p>
        <p className="text-slate-500 text-xs mt-2 text-center">Technical architecture</p>
        <ArchitectureDiagram />
      </div>
    ),
  },
  {
    id: '6',
    section: '6.0',
    title: 'Implementation & Deployment',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <h4 className="text-slate-100 font-semibold text-lg">Deployment</h4>
        <p>
          <code className="text-amber-400/90 font-mono text-sm">npm run build</code> produces a static <code className="text-slate-400 font-mono text-sm">dist/</code> folder. Import into Vercel; no serverless functions or environment variables required for core operation.
        </p>
        <p className="text-slate-500 text-xs mt-2 text-center">Deployment architecture</p>
        <DeploymentDiagram />
        <h4 className="text-slate-100 font-semibold text-lg mt-4">Use Cases</h4>
        <ul className="space-y-2 text-slate-400">
          <li>Internal audit teams screening AP before year-end</li>
          <li>CFOs reviewing vendor risk without external tools</li>
          <li>Consultants running client data in a sandbox</li>
          <li>Education and training on forensic patterns</li>
        </ul>
      </div>
    ),
  },
  {
    id: '7',
    section: '7.0',
    title: 'Evaluation & Comparative Analysis',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p>
          <strong className="text-slate-100">vs. Manual review:</strong> 10–100× faster; consistent rule application. <strong className="text-slate-100">vs. Enterprise GRC:</strong> No license fee; no data egress. <strong className="text-slate-100">vs. Cloud ML APIs:</strong> No API cost; data stays local.
        </p>
        <p>
          <strong className="text-slate-100">Validation:</strong> Rule-based labels provide weak supervision. Test accuracy is reported in Settings post-training. Feature importance is computed from mean-difference with label when the library does not expose it. Thresholds ($5k, $10k, $25k, off-hours window) are configurable per organization.
        </p>
      </div>
    ),
  },
  {
    id: '8',
    section: '8.0',
    title: 'Conclusion',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p>
          The AI Forensic Accounting Platform demonstrates that <strong className="text-amber-400/90">substantial forensic automation</strong> can run entirely in the browser—no backend, no data upload, no vendor lock-in. Rule-based detection ensures interpretability; optional ML adds adaptive risk scoring. The result is a deployable, privacy-preserving tool suitable for audits, investigations, and risk reviews.
        </p>
        <p className="text-amber-400/90 font-medium">
          We recommend adoption for teams seeking lightweight, cost-free fraud screening with the flexibility to train and refine models on their own data.
        </p>
      </div>
    ),
  },
  {
    id: '9',
    section: '9.0',
    title: 'References',
    content: (
      <div className="space-y-4 text-slate-400 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <p>[1] Association of Certified Fraud Examiners. <em>Report to the Nations: 2022 Global Study on Occupational Fraud and Abuse.</em></p>
        <p>[2] ml-random-forest. <em>Random Forest for Classification and Regression.</em> <a href="https://github.com/mljs/random-forest" className="text-amber-400/80 hover:underline" target="_blank" rel="noopener noreferrer">github.com/mljs/random-forest</a></p>
        <p>[3] ACFE. <em>Fraud Examiners Manual.</em> Detection of fraud schemes—vendor fraud, billing schemes, expense reimbursement.</p>
        <p>[4] Vercel. <em>Static Site Deployment.</em> <a href="https://vercel.com" className="text-amber-400/80 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
      </div>
    ),
  },
  {
    id: '10',
    section: '10.0',
    title: 'Appendices',
    content: (
      <div className="space-y-5 text-slate-300 leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <h4 className="text-slate-100 font-semibold text-lg">A. CSV Schema</h4>
        <p className="text-xs font-mono text-slate-400 bg-slate-900/80 p-4 rounded overflow-x-auto">
          Vendor: vendor_id, vendor_name, bank_account_last4, risk_flag_internal<br />
          Invoices: invoice_id, vendor_id, amount, created_by_user_id, approved_by_user_id, invoice_date<br />
          Payments: payment_id, vendor_id, amount, payment_date<br />
          GL: gl_entry_id, posting_date, debit_amount, credit_amount, created_by_user_id
        </p>
        <h4 className="text-slate-100 font-semibold text-lg mt-4">B. Rule Thresholds (defaults)</h4>
        <p>Threshold evasion: $4,900–5k, $9,800–10k, $24,800–25k. Off-hours: &lt;6:00 or &gt;22:00. Round dollar: ≥$1,000 and amount mod 1000 = 0. Min count for round-dollar case: 4.</p>
      </div>
    ),
  },
];

export function Whitepaper() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(i, SLIDES.length - 1));
    setSlideIndex(next);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        go(slideIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(slideIndex - 1);
      } else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(SLIDES.length - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [slideIndex, go]);

  const slide = SLIDES[slideIndex]!;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0c10] overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.08), transparent), linear-gradient(180deg, #0a0c10 0%, #0f1320 50%, #0a0c10 100%)`,
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 h-14 z-10 flex items-center justify-between px-6 border-b border-amber-500/10 bg-[#0a0c10]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800/80 transition-colors"
            title="Close whitepaper"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            className="flex items-center gap-2 text-slate-400 hover:text-amber-400/90 transition-colors"
          >
          <Menu className="h-5 w-5" />
          <span className="text-sm font-medium">Table of Contents</span>
        </button>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-500/70" />
          <span className="text-sm text-slate-500">ForensicAI Technical Whitepaper</span>
        </div>
      </header>

      {/* TOC overlay */}
      {tocOpen && (
        <div
          className="absolute inset-0 z-20 bg-[#0a0c10]/95 backdrop-blur-md flex flex-col items-center justify-center p-8"
          onClick={() => setTocOpen(false)}
        >
          <div className="max-w-md w-full space-y-1" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-amber-400/90 text-lg font-semibold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Contents
            </h3>
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSlideIndex(i); setTocOpen(false); }}
                className={cn(
                  'w-full text-left py-2.5 px-3 rounded-lg transition-colors text-sm',
                  i === slideIndex ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                )}
              >
                <span className="text-slate-500 mr-2 tabular-nums">{s.section}</span>
                {s.title}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTocOpen(false)}
            className="mt-8 text-slate-500 hover:text-slate-300 text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Slide area */}
      <main className="h-full pt-14 pb-24 px-6 sm:px-12 flex flex-col items-center justify-center">
        <article className="w-full max-w-3xl">
          <p className="text-amber-500/70 text-sm font-medium tracking-wider mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {slide.section}
          </p>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-slate-100 mb-8 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {slide.title}
          </h1>
          <div className="prose prose-invert max-w-none">
            {slide.content}
          </div>
        </article>
      </main>

      {/* Bottom nav */}
      <footer className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-between px-6 border-t border-amber-500/10 bg-[#0a0c10]/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => go(slideIndex - 1)}
          disabled={slideIndex === 0}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-400/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Previous</span>
        </button>
        <div className="flex items-center gap-1">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlideIndex(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === slideIndex ? 'bg-amber-500 w-6' : 'bg-slate-600 hover:bg-slate-500'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(slideIndex + 1)}
          disabled={slideIndex === SLIDES.length - 1}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-400/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </footer>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-amber-500/50 transition-all duration-300"
        style={{ width: `${((slideIndex + 1) / SLIDES.length) * 100}%` }}
      />

      {/* Keyboard hint */}
      <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[10px] text-slate-600">
        ← → or Space to navigate
      </p>
    </div>
  );
}
