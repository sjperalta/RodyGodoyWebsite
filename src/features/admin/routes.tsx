import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom'; // Import Routes

const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminLayout = lazy(() => import('./AdminLayout'));
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));
const AdminCategories = lazy(() => import('./AdminCategories'));
const AdminProjectsList = lazy(() => import('./AdminProjectsList'));
const AdminProjectEdit = lazy(() => import('./AdminProjectEdit'));

const suspenseFallback: ReactNode = (
  <div className="flex justify-center items-center min-h-screen text-slate-500 text-sm">
    Loading admin…
  </div>
);

const AdminRoutesComponent = (): ReactNode => {
  return (
    <Routes> {/* Wrap with Routes */}
      <Route path="/" element={<Suspense fallback={suspenseFallback}><AdminLayout /></Suspense>}>
        <Route path="/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<AdminProjectsList />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="projects" element={<AdminProjectsList />} />
          <Route path="projects/:id" element={<AdminProjectEdit />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutesComponent;
