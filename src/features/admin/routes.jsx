import { Navigate, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const AdminLogin = lazy(() => import('@/features/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout'));
const ProtectedRoute = lazy(() => import('@/features/admin/ProtectedRoute'));
const AdminCategories = lazy(() => import('@/features/admin/AdminCategories'));
const AdminProjectsList = lazy(() => import('@/features/admin/AdminProjectsList'));
const AdminProjectEdit = lazy(() => import('@/features/admin/AdminProjectEdit'));

const suspenseFallback = null;

export const adminRoutes = (
  <>
    <Route
      path="/admin/login"
      element={
        <Suspense fallback={suspenseFallback}>
          <AdminLogin />
        </Suspense>
      }
    />

    <Route
      element={
        <Suspense fallback={suspenseFallback}>
          <ProtectedRoute />
        </Suspense>
      }
    >
      <Route
        path="/admin"
        element={
          <Suspense fallback={suspenseFallback}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Navigate to="projects" replace />} />
        <Route
          path="categories"
          element={
            <Suspense fallback={suspenseFallback}>
              <AdminCategories />
            </Suspense>
          }
        />
        <Route
          path="projects"
          element={
            <Suspense fallback={suspenseFallback}>
              <AdminProjectsList />
            </Suspense>
          }
        />
        <Route
          path="projects/:id"
          element={
            <Suspense fallback={suspenseFallback}>
              <AdminProjectEdit />
            </Suspense>
          }
        />
      </Route>
    </Route>
  </>
);

