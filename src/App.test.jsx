import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('@/features/marketing/MarketingApp', () => ({
  default: () => <div>MarketingApp</div>,
}));
vi.mock('@/features/admin/AdminLogin', () => ({
  default: () => <div>AdminLogin</div>,
}));
vi.mock('@/features/admin/AdminLayout', () => ({
  default: () => <div>AdminLayout</div>,
}));
vi.mock('@/features/admin/ProtectedRoute', () => ({
  default: () => <div>ProtectedRoute</div>,
}));
vi.mock('@/features/admin/AdminCategories', () => ({
  default: () => <div>AdminCategories</div>,
}));
vi.mock('@/features/admin/AdminProjectsList', () => ({
  default: () => <div>AdminProjectsList</div>,
}));
vi.mock('@/features/admin/AdminProjectEdit', () => ({
  default: () => <div>AdminProjectEdit</div>,
}));

describe('App routing', () => {
  it('renders marketing app for public routes', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText('MarketingApp')).toBeInTheDocument();
  });

  it('renders admin login for /admin/login', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText('AdminLogin')).toBeInTheDocument();
  });
});

