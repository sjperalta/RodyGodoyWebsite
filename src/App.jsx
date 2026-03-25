import { Routes, Route, Navigate } from 'react-router-dom';
import MarketingApp from './MarketingApp';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import AdminCategories from './admin/AdminCategories';
import AdminProjectsList from './admin/AdminProjectsList';
import AdminProjectEdit from './admin/AdminProjectEdit';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="projects" element={<AdminProjectsList />} />
          <Route path="projects/:id" element={<AdminProjectEdit />} />
        </Route>
      </Route>
      <Route path="/*" element={<MarketingApp />} />
    </Routes>
  );
}
