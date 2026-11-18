'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Building2, Clock } from 'lucide-react';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { formatDate } from '@/lib/utils';

export function OngoingProjects() {
  const { projects: catalogProjects, isLoading, error } = useCatalogData();
  const projects = catalogProjects
    .filter(project => project.status === 'ongoing' && project.is_published)
    .slice(0, 2);

  return (
    <section className="py-20 md:py-28 lg:py-36 bg-pure-white" aria-labelledby="projects-heading">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="section-divider">
              <h2 id="projects-heading" className="section-heading mb-4">
                Ongoing Construction Projects
              </h2>
            </div>
            <p className="section-subheading">
              Witness the progress of our landmark developments shaping Lahore&apos;s skyline.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-deep-black hover:text-charcoal transition-colors"
            >
              View All Projects
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {error && <p className="mb-6 text-sm text-red-700" role="alert">{error}</p>}
        {isLoading && <p className="mb-6 text-sm text-medium-grey" role="status">Loading construction projects...</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card group overflow-hidden h-full"
            >
              <Link
                href={`/projects/${project.id}`}
                className="flex h-full flex-col overflow-hidden"
                aria-label={`View ${project.title} project details`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                  {project.images[0]?.url && (
                    <motion.img
                      src={project.images[0].url}
                      alt={project.images[0].alt || project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent" />
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
                            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="h-full bg-deep-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 border-t border-light-grey text-sm text-medium-grey">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      Est. Completion: {project.expected_completion_date ? formatDate(project.expected_completion_date) : 'TBA'}
                    </span>
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

        {!isLoading && !error && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <Building2 className="w-16 h-16 mx-auto text-light-grey mb-4" aria-hidden="true" />
            <h3 className="text-xl font-heading font-light text-charcoal mb-2">No Ongoing Projects</h3>
            <p className="text-medium-grey">Check back soon for new developments.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}