import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarketingApp } from '@/features/marketing/components'; // Import the real MarketingApp component
import { ProjectCategory, Project } from '@/features/projects/services'; // For types

const { mockCategoriesRepoListAll, mockProjectsRepoListPublishedWithMedia } = vi.hoisted(() => {
  const listAll = vi.fn<[], Promise<ProjectCategory[]>>();
  const listPublishedWithMedia = vi.fn<[], Promise<Project[]>>();
  return {
    mockCategoriesRepoListAll: listAll,
    mockProjectsRepoListPublishedWithMedia: listPublishedWithMedia,
  };
});

vi.mock('@/features/projects/services', () => ({
  categoriesRepo: {
    listAll: mockCategoriesRepoListAll,
  },
  projectsRepo: {
    listPublishedWithMedia: mockProjectsRepoListPublishedWithMedia,
  },
}));

vi.mock('@/services', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services')>();
  return {
    ...original,
    isSupabaseConfigured: true,
    getProjectImagePublicUrl: vi.fn(() => 'https://example.com/image.jpg'),
    getProjectVideoPublicUrl: vi.fn(() => 'https://example.com/video.mp4'),
  };
});

// Improved i18n mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects: boolean }) => {
      if (options?.returnObjects) {
        // Mock specific array keys
        if (key === 'services.s1_items') return ["Conceptual design", "Architectural plans", "3D modeling", "Visualizations", "Facade design", "Space optimization"];
        if (key === 'services.s2_items') return ["Single-family homes", "Luxury residences", "Remodeling", "Beach/mountain houses", "Housing developments"];
        if (key === 'services.s3_items') return ["Corporate offices", "Retail spaces", "Restaurants", "Office buildings", "Shopping centers"];
        if (key === 'services.s4_items') return ["Interior redesign", "Facade updates", "Additions", "Space optimization"];
        if (key === 'services.s5_items') return ["Site supervision", "Quality control", "Contractor coordination", "Progress monitoring"];
        if (key === 'services.s6_items') return ["Site evaluation", "Feasibility analysis", "Project optimization", "Cost estimates"];
      }
      // Default behavior for other keys
      return key;
    },
    i18n: { language: 'en' },
  }),
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
        <MarketingApp />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Projects (mocked repos)', () => {
  beforeEach(() => {
    mockCategoriesRepoListAll.mockReset();
    mockProjectsRepoListPublishedWithMedia.mockReset();
  });

  it('shows a loading state while repos are fetching', async () => {
    mockCategoriesRepoListAll.mockReturnValue(new Promise(() => {}));
    mockProjectsRepoListPublishedWithMedia.mockReturnValue(new Promise(() => {}));

    renderAppAtRoot();

    expect(await screen.findByText('Loading projects…')).toBeInTheDocument();
  });

  it('shows an error message when repos fail', async () => {
    mockCategoriesRepoListAll.mockRejectedValue(new Error('Categories failed'));
    mockProjectsRepoListPublishedWithMedia.mockReturnValue(new Promise(() => {}));

    renderAppAtRoot();

    expect(await screen.findByText('Categories failed')).toBeInTheDocument();
  });

  it('renders project cards when repos resolve', async () => {
    const mockCategories: ProjectCategory[] = [
      { id: '1', filter_key: 'RESIDENTIAL', label: {en: 'Residential', es: 'Residencial'}, sort_order: 1 },
    ];
    mockCategoriesRepoListAll.mockResolvedValue(mockCategories);

    const mockProjects: Project[] = [
      {
        id: '1',
        slug: 'my-project',
        name: {en: 'My Project EN', es: 'My Project ES'},
        description: {en: 'Desc EN', es: 'Desc ES'},
        location: {en: 'Location EN', es: 'Location ES'},
        area: {en: 'Area EN', es: 'Area ES'},
        year: 2024,
        published: true,
        sort_order: 1,
        project_categories: { id: '1', filter_key: 'RESIDENTIAL', label: {en: 'Residential', es: 'Residencial'}, sort_order: 1 },
        project_media: [{ id: '10', kind: 'image', object_path: 'media/my.jpg', sort_order: 1 }],
      },
    ];
    mockProjectsRepoListPublishedWithMedia.mockResolvedValue(mockProjects);

    renderAppAtRoot();

    expect(await screen.findByText('My Project EN')).toBeInTheDocument();
  });
});
