import { useState, useMemo, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import projectsData from '@/app/data/projects_index.json';
import { isSupabaseConfigured, getProjectImagePublicUrl, getProjectVideoPublicUrl } from '@/services/supabase/client';
import { pickLocalized } from '@/shared/lib'; // Updated import
import { categoriesRepo, projectsRepo, type ProjectCategory, type Project as RemoteProject, type ProjectMedia as RemoteProjectMedia } from '@/features/projects/services';
import { fadeInUp, staggerContainer, fadeScale } from '@/app/styles/animations';

const useStaticProjects: boolean = import.meta.env.VITE_USE_STATIC_PROJECTS === 'true';

/** Passed to getProjectImagePublicUrl; applied only if VITE_SUPABASE_IMAGE_TRANSFORMS=true (Pro+). */
const THUMB_TRANSFORM = { width: 900, height: 560, resize: 'cover' };
const GRID_COVER_TRANSFORM = { width: 900, height: 560, resize: 'cover' };
const MODAL_IMAGE_TRANSFORM = { width: 1600, height: 1200, resize: 'contain' };

interface LocalizedString {
  en: string;
  es: string;
}

interface StaticProjectData {
  id?: string;
  slug: string;
  name: LocalizedString;
  category: LocalizedString;
  description: LocalizedString;
  location: LocalizedString;
  area: LocalizedString;
  year: number;
  files: string[];
}

interface MediaItem {
  url: string;
  isVideo: boolean;
  thumbUrl?: string;
}

interface PreparedProject {
  id?: string;
  slug: string;
  name: LocalizedString;
  year: number;
  filterKey: string;
  index: string;
  localizedName: string;
  localizedCategory: string;
  localizedDescription: string;
  localizedLocation: string;
  localizedArea: string;
  coverIsVideo: boolean;
  cover: string;
  mediaItems: MediaItem[];
}

function prepareStaticProject(project: StaticProjectData, index: number, language: string): PreparedProject {
  const base = import.meta.env.BASE_URL;
  const mediaItems: MediaItem[] = (project.files || []).map((rel) => {
    const isVideo = rel.endsWith('.mp4');
    return {
      url: `${base}projects_assets/${rel}`,
      isVideo,
    };
  });
  const first = mediaItems[0];
  return {
    ...project,
    index: String(index + 1).padStart(2, '0'),
    filterKey: project.category?.en?.toUpperCase().replace(/\s+/g, ' ') ?? '',
    localizedName: pickLocalized(project.name, language),
    localizedCategory: pickLocalized(project.category, language).toUpperCase(),
    localizedDescription: pickLocalized(project.description, language),
    localizedLocation: pickLocalized(project.location, language),
    localizedArea: pickLocalized(project.area, language),
    coverIsVideo: first?.isVideo ?? false,
    cover: first?.url ?? '',
    mediaItems,
  };
}

function prepareRemoteProject(row: RemoteProject, index: number, language: string): PreparedProject {
  const cat = row.project_categories;
  const filterKey = cat ? cat.filter_key : '';
  const label = cat ? { en: cat.label.en, es: cat.label.es } : { en: '', es: '' }; // Assuming label exists as a localized object
  const mediaSorted = [...(row.project_media || [])].sort((a, b) => a.sort_order - b.sort_order);
  const mediaItems: MediaItem[] = mediaSorted.map((m: RemoteProjectMedia) => {
    const isVideo = m.kind === 'video';
    return {
      url: isVideo
        ? getProjectVideoPublicUrl(m.object_path)
        : getProjectImagePublicUrl(m.object_path, MODAL_IMAGE_TRANSFORM),
      thumbUrl: isVideo
        ? getProjectVideoPublicUrl(m.object_path)
        : getProjectImagePublicUrl(m.object_path, GRID_COVER_TRANSFORM),
      isVideo,
    };
  });
  const first = mediaItems[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name as LocalizedString, // Type assertion for localized object
    year: row.year,
    filterKey,
    index: String(index + 1).padStart(2, '0'),
    localizedName: pickLocalized(row.name as LocalizedString, language),
    localizedCategory: (pickLocalized(label, language) || filterKey).toUpperCase(),
    localizedDescription: pickLocalized(row.description as LocalizedString, language),
    localizedLocation: pickLocalized(row.location as LocalizedString, language),
    localizedArea: pickLocalized(row.area as LocalizedString, language),
    coverIsVideo: first?.isVideo ?? false,
    cover: first
      ? first.isVideo
        ? first.thumbUrl ?? ''
        : getProjectImagePublicUrl(mediaSorted[0].object_path, THUMB_TRANSFORM)
      : '',
    mediaItems,
  };
}

interface FilterCategory {
  key: string;
  label: string;
}

const STATIC_FILTER_CATEGORIES = [
  { key: 'ALL', labelKey: 'projects.filter_all' },
  { key: 'RESIDENTIAL', labelKey: 'projects.filter_residential' },
  { key: 'COMMERCIAL', labelKey: 'projects.filter_commercial' },
  { key: 'INTERIOR DESIGN', labelKey: 'projects.filter_interior' },
];

export function Projects() {
  const { t, i18n } = useTranslation();
  const supabaseConfigError: string =
    !useStaticProjects && !isSupabaseConfigured ? t('projects.supabase_not_configured') : '';
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<PreparedProject | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);

  const shouldFetchRemote: boolean = !useStaticProjects && isSupabaseConfigured;

  const categoriesQuery = useQuery<ProjectCategory[]>(
    {
      queryKey: ['project_categories'],
      queryFn: () => categoriesRepo.listAll(),
      enabled: shouldFetchRemote,
    }
  );

  const projectsQuery = useQuery<RemoteProject[]>(
    {
      queryKey: ['projects_published_with_media'],
      queryFn: () => projectsRepo.listPublishedWithMedia(),
      enabled: shouldFetchRemote,
    }
  );

  const remoteProjects = projectsQuery.data ?? null;
  const remoteCategories = categoriesQuery.data ?? null;

  const loadError: string =
    !useStaticProjects && shouldFetchRemote
      ? categoriesQuery.error?.message || projectsQuery.error?.message || '': '';

  const dataLoading: boolean = shouldFetchRemote ? categoriesQuery.isLoading || projectsQuery.isLoading : false;

  const filterCategories: FilterCategory[] = useMemo(() => {
    if (useStaticProjects) {
      return STATIC_FILTER_CATEGORIES.map((c) => ({
        key: c.key,
        label: t(c.labelKey),
      }));
    }
    if (remoteCategories === null) {
      return [{ key: 'ALL', label: t('projects.filter_all') }];
    }
    return [
      { key: 'ALL', label: t('projects.filter_all') },
      ...remoteCategories.map((c) => ({
        key: c.filter_key,
        label: (pickLocalized(c.label as LocalizedString, i18n.language) || c.filter_key).toUpperCase(),
      })),
    ];
  }, [remoteCategories, i18n.language, t]);

  const preparedProjects: PreparedProject[] = useMemo(() => {
    const lang = i18n.language;
    if (useStaticProjects) {
      return (projectsData as StaticProjectData[]).map((p, i) => prepareStaticProject(p, i, lang));
    }
    if (!remoteProjects) return [];
    return remoteProjects.map((row, i) => prepareRemoteProject(row, i, lang));
  }, [remoteProjects, i18n.language]);

  const filteredProjects: PreparedProject[] =
    filter === 'ALL' ? preparedProjects : preparedProjects.filter((p) => p.filterKey === filter);

  const openProject = (project: PreparedProject) => {
    setSelectedProject(project);
    setCurrentMediaIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const nextMedia = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!selectedProject?.mediaItems?.length) return;
    setCurrentMediaIndex((prev) => (prev + 1) % selectedProject.mediaItems.length);
  };

  const prevMedia = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!selectedProject?.mediaItems?.length) return;
    setCurrentMediaIndex(
      (prev) => (prev - 1 + selectedProject.mediaItems.length) % selectedProject.mediaItems.length
    );
  };

  return (
    <section id="proyectos" className="section-padding bg-bg-light overflow-hidden">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="mb-16"
      >
        <motion.span
          variants={fadeInUp}
          className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
        >
          {t('projects.subtitle')}
        </motion.span>
        <motion.h2
          variants={fadeInUp}
          className="text-4xl md:text-6xl font-light font-serif leading-tight mb-12"
        >
          {t('projects.title').split(' ')[0]} <br />{' '}
          <span className="italic">{t('projects.title').split(' ').slice(1).join(' ')}</span>
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap border-b border-accent-line/30 gap-8 overflow-x-auto pb-px"
        >
          {filterCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilter(cat.key)}
              className={`flex flex-col items-center justify-center border-b-2 pb-4 pt-2 transition-all duration-300 group relative ${
                filter === cat.key
                  ? 'border-primary text-slate-900 font-bold'
                  : 'border-transparent text-slate-400 hover:text-primary'
              }`}
            >
              <p className="text-xs font-bold tracking-widest uppercase">{cat.label}</p>
              {filter === cat.key && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {!useStaticProjects && dataLoading && (
        <p className="text-slate-500 text-sm mb-8">Loading projects…</p>
      )}
      {!useStaticProjects && (supabaseConfigError || loadError) && (
        <p className="text-red-600 text-sm mb-8">{supabaseConfigError || loadError}</p>
      )}

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id || project.slug || project.localizedName}
              layout
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.8,
                delay: (idx % 2) * 0.1,
                ease: [0.33, 1, 0.68, 1],
              }}
              className="group cursor-pointer"
              onClick={() => openProject(project)}
            >
              <div className="relative overflow-hidden aspect-[16/10] bg-neutral-soft mb-6">
                {project.coverIsVideo ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-200">
                    <video
                      src={project.cover}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      muted
                      loop
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => {
                        (e.target as HTMLVideoElement).pause();
                        (e.target as HTMLVideoElement).currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={project.cover}
                    alt={project.localizedName}
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1481026469463-66327c86e544?q=80&w=1816&auto=format&fit=crop';
                    }}
                  />
                )}

                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex justify-between items-center">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {t('projects.view_project')}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white transform rotate-[-45deg] group-hover:rotate-0 transition-transform duration-500 shadow-lg">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-accent-line/30 pb-4">
                <div>
                  <p className="text-primary text-[10px] font-bold tracking-widest uppercase mb-1">
                    {project.index} / {project.localizedCategory}
                  </p>
                  <h3 className="text-2xl font-serif font-medium group-hover:text-primary transition-colors duration-300">
                    {project.localizedName}
                  </h3>
                </div>
                <ArrowRight className="text-slate-300 group-hover:translate-x-2 group-hover:text-primary transition-all duration-300" />
              </div>
              <p className="mt-4 text-sm text-slate-500 font-light line-clamp-2 leading-relaxed">
                {project.localizedDescription}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedProject && selectedProject.mediaItems?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-bg-dark/95 backdrop-blur-md"
            onClick={closeProject}
          >
            <motion.div
              variants={fadeScale}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-6xl max-h-full overflow-y-auto relative rounded-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeProject}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-bg-dark text-white rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 hover:rotate-90"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8 bg-black relative aspect-[16/10] lg:aspect-auto flex items-center min-h-[400px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMediaIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="w-full h-full"
                    >
                      {selectedProject.mediaItems[currentMediaIndex].isVideo ? (
                        <video
                          src={selectedProject.mediaItems[currentMediaIndex].url}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay
                        />
                      ) : (
                        <img
                          src={selectedProject.mediaItems[currentMediaIndex].url}
                          alt={`${selectedProject.localizedName} visual ${currentMediaIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {selectedProject.mediaItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevMedia}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={nextMedia}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                      >
                        <ChevronRight size={24} />
                      </button>

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white tracking-widest uppercase mb-4">
                        {currentMediaIndex + 1} / {selectedProject.mediaItems.length}
                      </div>
                    </>
                  )}
                </div>

                <div className="lg:col-span-4 p-8 md:p-12 flex flex-col justify-center bg-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
                      {selectedProject.localizedCategory}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-light mb-6 leading-tight">
                      {selectedProject.localizedName}
                    </h2>
                    <div className="w-16 h-[2px] bg-primary mb-10" />
                    <p className="text-slate-600 font-light leading-relaxed mb-12 overflow-y-auto max-h-60 pr-4 custom-scrollbar text-lg">
                      {selectedProject.localizedDescription}
                    </p>

                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-primary underline underline-offset-8 decoration-1">
                        {t('projects.details_title')}
                      </p>
                      <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">
                            {t('projects.location')}
                          </p>
                          <p className="text-sm font-medium text-bg-dark">{selectedProject.localizedLocation}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">
                            {t('projects.year')}
                          </p>
                          <p className="text-sm font-medium text-bg-dark">{selectedProject.year}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">
                            {t('projects.area')}
                          </p>
                          <p className="text-sm font-medium text-bg-dark">{selectedProject.localizedArea}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
