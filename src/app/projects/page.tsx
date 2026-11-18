'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Building2, MapPin, Clock, Filter, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { type ProjectStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCatalogData } from '@/hooks/use-catalog-data';

const projectStatusLabels: Record<ProjectStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  upcoming: 'Upcoming',
};

const statusColors: Record<ProjectStatus, string> = {
  ongoing: 'bg-blue-600',
  completed: 'bg-emerald-600',
  upcoming: 'bg-amber-500',
};

export default function ProjectsPage() {
  const { projects, isLoading, error } = useCatalogData();
  const [activeTab, setActiveTab] = useState<ProjectStatus | 'all'>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const allProjects = projects.filter(project => project.is_published);
  const ongoingProjects = allProjects.filter(project => project.status === 'ongoing');
  const completedProjects = allProjects.filter(project => project.status === 'completed');
  const upcomingProjects = allProjects.filter(project => project.status === 'upcoming');

  const filteredProjects = useMemo(() => {
    if (activeTab === 'all') return allProjects;
    return allProjects.filter(p => p.status === activeTab);
  }, [activeTab, allProjects]);

  const tabs = [
    { id: 'all', label: 'All Projects', count: allProjects.length },
    { id: 'ongoing', label: 'Ongoing', count: ongoingProjects.length },
    { id: 'completed', label: 'Completed', count: completedProjects.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingProjects.length },
  ] as const;

  return (
    <div className="min-h-screen bg-pure-white">
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-deep-black text-pure-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light tracking-tight mb-6">
              Construction Projects
            </h1>
            <p className="text-light-grey text-lg leading-relaxed">
              Explore our portfolio of landmark developments shaping Lahore&apos;s skyline — from luxury residences to commercial towers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-pure-white border-b border-light-grey sticky top-20 z-30 md:relative md:top-auto md:z-auto md:border-b-0 md:bg-transparent">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project status filters">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as ProjectStatus | 'all')}
                  className={cn(
                    'px-5 py-2.5 text-sm font-medium rounded transition-all duration-200 whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-deep-black text-pure-white shadow-sm'
                      : 'bg-off-white text-charcoal hover:bg-light-grey'
                  )}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-pure-white/50 text-deep-black rounded">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden btn-secondary px-4 py-2"
              aria-label="Open filters"
            >
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Filters
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="py-12 bg-off-white"
        >
          <div className="container-custom">
            {error ? (
              <p className="py-20 text-center text-red-700" role="alert">{error}</p>
            ) : isLoading ? (
              <p className="py-20 text-center text-medium-grey" role="status">Loading projects...</p>
            ) : filteredProjects.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredProjects.map((project, index) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="card group h-full"
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex h-full flex-col overflow-hidden"
                      aria-label={`View ${project.title} project details`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-light-grey">
                        {project.images[0]?.url && (
                          <motion.img
                            src={project.images[0].url}
                            alt={project.images[0].alt || project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className={cn(
                            'px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pure-white',
                            statusColors[project.status]
                          )}>
                            {projectStatusLabels[project.status]}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-2 text-medium-grey text-sm mb-3">
                          <MapPin className="w-4 h-4" aria-hidden="true" />
                          <span className="truncate">{project.location}</span>
                        </div>
                        <h3 className="text-xl font-heading font-medium text-deep-black mb-2 line-clamp-1 group-hover:text-charcoal transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-medium-grey text-sm leading-relaxed mb-4 line-clamp-2">
                          {project.short_description}
                        </p>

                        {project.status === 'ongoing' && (
                          <div className="space-y-2 mb-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-medium-grey">Construction Progress</span>
                                <span className="text-deep-black font-semibold">{project.progress_percentage}%</span>
                              </div>
                              <div className="h-2 bg-light-grey overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${project.progress_percentage}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                  className="h-full bg-deep-black"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 border-t border-light-grey text-sm text-medium-grey">
                          {project.expected_completion_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" aria-hidden="true" />
                              Est. Completion: {formatDate(project.expected_completion_date)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" aria-hidden="true" />
                            {project.available_units}/{project.total_units} Units Available
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Building2 className="w-16 h-16 mx-auto text-light-grey mb-4" aria-hidden="true" />
                <h3 className="text-xl font-heading font-light text-charcoal mb-2">No Projects Found</h3>
                <p className="text-medium-grey">
                  No {activeTab !== 'all' ? activeTab : ''} projects are currently available.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-pure-white md:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <div className="flex flex-col h-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-light-grey">
                <h2 className="text-xl font-heading font-medium">Filter Projects</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-deep-black"
                  aria-label="Close filters"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-3">Status</h3>
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <label key={tab.id} className="flex items-center gap-3 p-3 bg-off-white border border-light-grey cursor-pointer">
                        <input
                          type="radio"
                          name="project-status"
                          value={tab.id}
                          checked={activeTab === tab.id}
                          onChange={() => { setActiveTab(tab.id as ProjectStatus | 'all'); setIsMobileFilterOpen(false); }}
                          className="w-4 h-4 text-deep-black border-medium-grey focus:ring-deep-black"
                        />
                        <span className="font-medium text-deep-black">{tab.label}</span>
                        <span className="ml-auto text-sm text-medium-grey">{tab.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-light-grey">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn-primary w-full"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}