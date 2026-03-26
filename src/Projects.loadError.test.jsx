import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx';

// Set by each test after dynamically importing the real Projects component.
let ProjectsComponent = null;

const listAllMock = vi.fn();
const listPublishedWithMediaMock = vi.fn();

vi.mock('@/services/repos/categoriesRepo', () => ({
  categoriesRepo: {
    listAll: listAllMock,
  },
}));

vi.mock('@/services/repos/projectsRepo', () => ({
  projectsRepo: {
    listPublishedWithMedia: listPublishedWithMediaMock,
  },
}));

vi.mock('@/services/supabase/client', () => ({
  isSupabaseConfigured: true,
  getProjectImagePublicUrl: vi.fn(() => 'https://example.com/image.jpg'),
  getProjectVideoPublicUrl: vi.fn(() => 'https://example.com/video.mp4'),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

// Ensure route "/" renders `Projects` (via MarketingApp's slot).
vi.mock('@/features/marketing/MarketingApp', () => ({
  default: () => (ProjectsComponent ? <ProjectsComponent /> : null),
}));

function renderAppAtRoot() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Projects (mocked repos)', () => {
  beforeEach(() => {
    ProjectsComponent = null;
    listAllMock.mockReset();
    listPublishedWithMediaMock.mockReset();
  });

  it('shows a loading state while repos are fetching', async () => {
    listAllMock.mockReturnValue(new Promise(() => {}));
    listPublishedWithMediaMock.mockReturnValue(new Promise(() => {}));

    const mod = await import('@/features/projects/Projects');
    ProjectsComponent = mod.default;

    renderAppAtRoot();

    expect(await screen.findByText('Loading projects…')).toBeInTheDocument();
  });

  it('shows an error message when repos fail', async () => {
    listAllMock.mockRejectedValue(new Error('Categories failed'));
    listPublishedWithMediaMock.mockReturnValue(new Promise(() => {}));

    const mod = await import('@/features/projects/Projects');
    ProjectsComponent = mod.default;

    renderAppAtRoot();

    expect(await screen.findByText('Categories failed')).toBeInTheDocument();
  });

  it('renders project cards when repos resolve', async () => {
    listAllMock.mockResolvedValue([
      { filter_key: 'RESIDENTIAL', label: { en: 'Residential', es: 'Residencial' } },
    ]);

    listPublishedWithMediaMock.mockResolvedValue([
      {
        id: 1,
        slug: 'my-project',
        name: { en: 'My Project EN', es: 'Mi Proyecto ES' },
        description: { en: 'Desc EN', es: 'Desc ES' },
        location: { en: 'Location EN', es: 'Location ES' },
        area: { en: 'Area EN', es: 'Area ES' },
        year: 2024,
        sort_order: 1,
        project_categories: {
          filter_key: 'RESIDENTIAL',
          label: { en: 'Residential', es: 'Residencial' },
        },
        project_media: [{ id: 10, kind: 'image', object_path: 'media/my.jpg', sort_order: 1 }],
      },
    ]);

    const mod = await import('@/features/projects/Projects');
    ProjectsComponent = mod.default;

    renderAppAtRoot();

    expect(await screen.findByText('My Project EN')).toBeInTheDocument();
  });
});

