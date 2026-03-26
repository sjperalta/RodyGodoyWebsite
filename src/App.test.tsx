import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.tsx';

// Mock the entire @/features/marketing module
vi.mock('@/features/marketing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/marketing')>();
  return {
    ...actual,
    MarketingApp: () => <div>MockedMarketingApp</div>,
  };
});

// Mock the entire @/features/admin/routes module
vi.mock('@/features/admin/routes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/admin/routes')>();
  return {
    ...actual,
    default: () => <div>AdminLogin</div>, // Simplified to directly render AdminLogin
  };
});

describe('App routing', () => {
  it('renders marketing app for public routes', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText('MockedMarketingApp')).toBeInTheDocument();
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
