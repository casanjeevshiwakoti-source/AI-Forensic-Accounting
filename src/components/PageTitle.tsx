import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard | ForensicAI',
  '/dashboard': 'Dashboard | ForensicAI',
  '/ingestion': 'Data Ingestion | ForensicAI',
  '/cases': 'Case Management | ForensicAI',
  '/reports': 'Reports & Exports | ForensicAI',
  '/settings': 'Settings | ForensicAI',
  '/login': 'Sign In | ForensicAI',
};

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/$/, '') || '/';
    const match = Object.keys(ROUTE_TITLES).find((r) => path === r || path.startsWith(r + '/'));
    const title = match ? ROUTE_TITLES[match] : ROUTE_TITLES['/'];
    document.title = title;
  }, [pathname]);

  return null;
}
