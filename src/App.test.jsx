import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./MarketingApp', () => ({
  default: () => <div>MarketingApp</div>,
}));
vi.mock('./admin/AdminLogin', () => ({
  default: () => <div>AdminLogin</div>,
}));
vi.mock('./admin/AdminLayout', () => ({
  default: () => <div>AdminLayout</div>,
}));
vi.mock('./admin/ProtectedRoute', () => ({
  default: () => <div>ProtectedRoute</div>,
}));
vi.mock('./admin/AdminCategories', () => ({
  default: () => <div>AdminCategories</div>,
}));
vi.mock('./admin/AdminProjectsList', () => ({
  default: () => <div>AdminProjectsList</div>,
}));
vi.mock('./admin/AdminProjectEdit', () => ({
  default: () => <div>AdminProjectEdit</div>,
}));

describe('App routing', () => {
  it('renders marketing app for public routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('MarketingApp')).toBeInTheDocument();
  });

  it('renders admin login for /admin/login', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('AdminLogin')).toBeInTheDocument();
  });
});

