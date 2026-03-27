import { Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom'; // Import Routes

import { AdminLogin } from '@/features/admin/components/AdminLogin';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import ProtectedRoute from '@/features/admin/guards/ProtectedRoute';
import { AdminCategories, AdminProjectEdit, AdminProjectsList, AdminSiteSettings } from '@/features/admin/components';

const suspenseFallback: ReactNode = (
  <div className="flex justify-center items-center min-h-screen text-slate-500 text-sm">
    Loading admin…
  </div>
);

const AdminRoutesComponent = (): ReactNode => {
  return (
    <Routes> {/* Wrap with Routes */}
      <Route element={<Suspense fallback={suspenseFallback}><AdminLayout /></Suspense>}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<AdminProjectsList />} />
          <Route path="site" element={<AdminSiteSettings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="projects" element={<AdminProjectsList />} />
          <Route path="projects/:id" element={<AdminProjectEdit />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutesComponent;
