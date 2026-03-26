import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MarketingApp } from '@/features/marketing';

const AdminRoutesLazy = lazy(() => import('@/features/admin/routes'));

const AdminFallback = (
  <div className="flex justify-center items-center min-h-screen text-slate-500 text-sm">
    Loading admin...
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={AdminFallback}><AdminRoutesLazy /></Suspense>} />
      <Route path="/*" element={<MarketingApp />} />
    </Routes>
  );
}
