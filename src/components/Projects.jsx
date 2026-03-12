import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import projectsData from '../data/projects_index.json';
import { fadeInUp, staggerContainer, fadeScale } from '../styles/animations';

const Projects = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('ALL'); // Internal filter key in English
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Prepare projects data once
  const preparedProjects = projectsData.map((project, index) => {
    return {
      ...project,
      index: String(index + 1).padStart(2, '0'),
      // Use language-specific fields
      localizedName: project.name[i18n.language] || project.name['es'],
      localizedCategory: (project.category[i18n.language] || project.category['es']).toUpperCase(),
      localizedDescription: project.description[i18n.language] || project.description['es'],
      localizedLocation: project.location[i18n.language] || project.location['es'],
      localizedArea: project.area[i18n.language] || project.area['es'],
      // The first file is used as the cover
      coverIsVideo: project.files[0].endsWith('.mp4'),
      cover: `${import.meta.env.BASE_URL}projects_assets/${project.files[0]}`
    };
  });

  const categories = [
    { key: 'ALL', label: t('projects.filter_all') },
    { key: 'RESIDENTIAL', label: t('projects.filter_residential') },
    { key: 'COMMERCIAL', label: t('projects.filter_commercial') },
    { key: 'INTERIOR DESIGN', label: t('projects.filter_interior') }
  ];

  const filteredProjects = filter === 'ALL' 
    ? preparedProjects 
    : preparedProjects.filter(p => p.category.en.toUpperCase() === filter);

  const openProject = (project) => {
    setSelectedProject(project);
    setCurrentMediaIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % selectedProject.files.length);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + selectedProject.files.length) % selectedProject.files.length);
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
          {t('projects.title').split(' ')[0]} <br /> <span className="italic">{t('projects.title').split(' ').slice(1).join(' ')}</span>
        </motion.h2>

        {/* Filters */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-wrap border-b border-accent-line/30 gap-8 overflow-x-auto pb-px"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
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

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
      >
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id || project.name.es}
              layout
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ 
                duration: 0.8, 
                delay: idx % 2 * 0.1,
                ease: [0.33, 1, 0.68, 1] 
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
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
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
                      e.target.src = 'https://images.unsplash.com/photo-1481026469463-66327c86e544?q=80&w=1816&auto=format&fit=crop';
                    }}
                  />
                )}
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex justify-between items-center">
                   <span className="text-white text-xs font-bold tracking-widest uppercase">{t('projects.view_project')}</span>
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

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
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
              {/* Close Button */}
              <button 
                onClick={closeProject}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-bg-dark text-white rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 hover:rotate-90"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Media Gallery */}
                <div className="lg:col-span-8 bg-black relative aspect-[16/10] lg:aspect-auto flex items-center min-h-[400px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMediaIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="w-full h-full"
                    >
                      {selectedProject.files[currentMediaIndex].endsWith('.mp4') ? (
                        <video 
                          src={`${import.meta.env.BASE_URL}projects_assets/${selectedProject.files[currentMediaIndex]}`}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay
                        />
                      ) : (
                        <img 
                          src={`${import.meta.env.BASE_URL}projects_assets/${selectedProject.files[currentMediaIndex]}`}
                          alt={`${selectedProject.name} visual ${currentMediaIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {selectedProject.files.length > 1 && (
                    <>
                      <button 
                        onClick={prevMedia}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={nextMedia}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      {/* Counter */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white tracking-widest uppercase mb-4">
                        {currentMediaIndex + 1} / {selectedProject.files.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
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
                    <div className="w-16 h-[2px] bg-primary mb-10"></div>
                    <p className="text-slate-600 font-light leading-relaxed mb-12 overflow-y-auto max-h-60 pr-4 custom-scrollbar text-lg">
                      {selectedProject.localizedDescription}
                    </p>
                    
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-primary underline underline-offset-8 decoration-1">{t('projects.details_title')}</p>
                      <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">{t('projects.location')}</p>
                          <p className="text-sm font-medium text-bg-dark">{selectedProject.localizedLocation}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">{t('projects.year')}</p>
                          <p className="text-sm font-medium text-bg-dark">{selectedProject.year}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">{t('projects.area')}</p>
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
};

export default Projects;
