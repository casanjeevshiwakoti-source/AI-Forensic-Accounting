import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CaseDetail } from './pages/CaseDetail';
import { DataIngestion } from './pages/DataIngestion';
import { Cases } from './pages/Cases';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AIAnalysis } from './pages/AIAnalysis';
import { Whitepaper } from './pages/Whitepaper';
import { Login } from './pages/Login';
import { PageTitle } from './components/PageTitle';
import { cn } from './utils/cn';
import { DataStoreProvider } from './utils/dataStore';
import { AuthProvider, useAuth } from './utils/auth';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30">
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={cn(
          'transition-all duration-300 flex flex-col min-h-screen',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:caseId" element={<CaseDetail />} />
              <Route path="/ingestion" element={<DataIngestion />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-analysis" element={<AIAnalysis />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginGate() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

function ProtectedApp() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppContent />;
}

export function App() {
  return (
    <AuthProvider>
      <DataStoreProvider>
        <PageTitle />
        <Routes>
          <Route path="/login" element={<LoginGate />} />
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </DataStoreProvider>
    </AuthProvider>
  );
}
