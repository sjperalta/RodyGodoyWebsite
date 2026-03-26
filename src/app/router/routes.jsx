import { Routes, Route } from 'react-router-dom';
import MarketingApp from '@/features/marketing/MarketingApp';
import { adminRoutes } from '@/features/admin/routes';

export default function AppRoutes() {
  return (
    <Routes>
      {adminRoutes}
      <Route path="/*" element={<MarketingApp />} />
    </Routes>
  );
}

