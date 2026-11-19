'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Building2, Clock, CheckCircle, Home, ArrowLeft, ChevronLeft, ChevronRight, Expand, X, Send, Phone, Mail, MapPin as MapPinIcon, Calendar, DollarSign, Users } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { useSiteSettings } from '@/hooks/use-site-settings';

const projectStatusLabels: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  upcoming: 'Upcoming',
};

const statusColors: Record<string, string> = {
  ongoing: 'bg-blue-600',
  completed: 'bg-emerald-600',
  upcoming: 'bg-amber-500',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { projects, isLoading, error } = useCatalogData();
  const siteConfig = useSiteSettings();
  const project = projects.find(item => item.id === id && item.is_published);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (isLoading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <p className={error ? 'text-red-700' : 'text-medium-grey'} role={error ? 'alert' : 'status'}>
          {error || 'Loading project...'}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-light-grey mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-heading font-light text-charcoal mb-2">Project Not Found</h2>
          <p className="text-medium-grey mb-6">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/projects" className="btn-primary">
            Browse Projects
            <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi ICG, I'm interested in project ${project.reference_id} - ${project.title} at ${project.location}. Could you please provide more details?`
  );

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp_business_number.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-pure-white">
      <nav className="pt-10 sm:pt-28 pb-3 px-3 sm:px-4 md:px-6 lg:px-8 bg-pure-white border-b border-light-grey mb-4 sm:mb-6" aria-label="Breadcrumb">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm text-medium-grey">
            <li>
              <Link href="/" className="hover:text-deep-black transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" aria-hidden="true" />
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4" aria-hidden="true">/</span>
              <Link href="/projects" className="hover:text-deep-black transition-colors">Projects</Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4" aria-hidden="true">/</span>
              <span className="text-deep-black font-medium truncate max-w-xs sm:max-w-[200px]" aria-current="page">{project.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      <section className="relative" aria-labelledby="project-title">
        <div className="aspect-[21/9] md:aspect-[16/9] overflow-hidden bg-charcoal">
          {project.images[0]?.url && (
            <img
              src={project.images[0].url}
              alt={project.images[0].alt || project.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 container-custom min-h-[30vh] sm:min-h-[25vh] flex flex-col justify-end">
            <div className="max-w-full overflow-hidden">
              <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
                  statusColors[project.status]
                )}>
                  {projectStatusLabels[project.status]}
                </span>
                {project.progress_percentage > 0 && project.status === 'ongoing' && (
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-pure-white/10 backdrop-blur border border-pure-white/20 text-pure-white">
                    {project.progress_percentage}% Complete
                  </span>
                )}
              </div>
              <h1 id="project-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-light tracking-tight text-pure-white mb-2 sm:mb-3 leading-tight overflow-wrap break-word">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-light-grey text-xs sm:text-sm">
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <MapPinIcon className="w-3 sm:w-4 h-3 sm:h-4" aria-hidden="true" />
                  <span className="overflow-wrap break-word">{project.location}</span>
                </span>
                {project.expected_completion_date && (
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Calendar className="w-3 sm:w-4 h-3 sm:h-4" aria-hidden="true" />
                    <span className="overflow-wrap break-word">Est. Completion: {formatDate(project.expected_completion_date)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10 lg:py-12 bg-off-white">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-light tracking-tight text-deep-black mb-2 sm:mb-4">Project Overview</h2>
                <div className="prose prose-deep-black max-w-none text-medium-grey leading-relaxed overflow-wrap break-word">
                  <p>{project.description}</p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-light-grey">
                <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-light tracking-tight text-deep-black mb-2 sm:mb-4">Key Features</h2>
                <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4" role="list">
                  {project.key_features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-pure-white border border-light-grey">
                      <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-deep-black flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-medium-grey text-sm overflow-wrap break-word">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {project.images.length > 1 && (
                <div className="pt-6 sm:pt-8 border-t border-light-grey">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-light tracking-tight text-deep-black mb-2 sm:mb-4">Architectural Gallery</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => { setLightboxIndex(index); setIsLightboxOpen(true); }}
                        className="relative aspect-[4/3] overflow-hidden group"
                        aria-label={`View ${image.alt} in fullscreen`}
                      >
                        <motion.img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-deep-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Expand className="w-7 sm:w-8 h-7 sm:h-8 text-pure-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {project.status === 'ongoing' && (
                <div className="pt-8 border-t border-light-grey">
                  <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-6">Construction Progress</h2>
                  <div className="bg-pure-white border border-light-grey p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-heading font-medium text-deep-black">Overall Progress</h3>
                      <span className="text-3xl font-heading font-bold text-deep-black">{project.progress_percentage}%</span>
                    </div>
                    <div className="h-4 bg-light-grey overflow-hidden mb-8">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress_percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="h-full bg-deep-black"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <ProgressStat label="Structure" value={`${Math.min(project.progress_percentage + 10, 100)}%`} icon={Building2} />
                      <ProgressStat label="MEP Works" value={`${Math.min(project.progress_percentage, 95)}%`} icon={Users} />
                      <ProgressStat label="Finishing" value={`${Math.max(project.progress_percentage - 15, 0)}%`} icon={CheckCircle} />
                      <ProgressStat label="Handover Prep" value={`${Math.max(project.progress_percentage - 30, 0)}%`} icon={Home} />
                    </div>
                  </div>
                </div>
              )}

              {project.available_units > 0 && (
                <div className="pt-8 border-t border-light-grey">
                  <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-6">Available Units</h2>
                  <div className="bg-pure-white border border-light-grey p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-heading font-medium text-deep-black">Unit Availability</h3>
                      <span className="text-2xl font-heading font-bold text-deep-black">
                        {project.available_units} of {project.total_units}
                      </span>
                    </div>
                    <div className="h-3 bg-light-grey overflow-hidden mb-6">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(project.available_units / project.total_units) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-deep-black"
                      />
                    </div>
                    <p className="text-medium-grey">
                      {project.available_units} units currently available for booking. Contact our sales team for floor plans, pricing, and availability details.
                    </p>
                  </div>
                </div>
              )}

              {project.payment_plan && (
                <div className="pt-8 border-t border-light-grey">
                  <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-6">Payment Plan</h2>
                  <div className="bg-pure-white border border-light-grey p-8">
                    <DollarSign className="w-8 h-8 text-deep-black mb-4" aria-hidden="true" />
                    <p className="text-medium-grey leading-relaxed">{project.payment_plan}</p>
                    <p className="text-medium-grey mt-4">
                      <strong className="text-deep-black">Note:</strong> Payment plans are subject to change. Please contact our sales team for the most current schedule and terms.
                    </p>
                  </div>
                </div>
              )}

              {project.expected_completion_date && (
                <div className="pt-8 border-t border-light-grey">
                  <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-6">Timeline</h2>
                  <div className="bg-pure-white border border-light-grey p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex items-center justify-center bg-deep-black/5 border border-light-grey">
                        <Calendar className="w-8 h-8 text-deep-black" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-medium text-deep-black">Expected Completion</h3>
                        <p className="text-2xl font-heading font-semibold text-deep-black mt-1">{formatDate(project.expected_completion_date)}</p>
                        <p className="text-medium-grey mt-2">
                          {project.status === 'ongoing'
                            ? 'Construction is in progress. Timeline is indicative and subject to regulatory approvals and force majeure.'
                            : project.status === 'upcoming'
                            ? 'Project is in pre-launch phase. Timeline will be confirmed upon launch.'
                            : 'Project has been completed and handed over.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="bg-deep-black text-pure-white p-8">
                  <h3 className="text-xl font-heading font-light mb-6">Interested in This Development?</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleWhatsAppClick}
                      className="btn-whatsapp w-full justify-center"
                    >
                      <Send className="w-5 h-5" aria-hidden="true" />
                      WhatsApp Inquiry
                    </button>
                    <Link
                      href={`/contact?project=${project.reference_id}`}
                      className="btn-secondary w-full justify-center border-pure-white text-pure-white hover:bg-pure-white hover:text-deep-black"
                    >
                      <Mail className="w-5 h-5" aria-hidden="true" />
                      Contact Our Team
                    </Link>
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="btn-secondary w-full justify-center border-pure-white text-pure-white hover:bg-pure-white hover:text-deep-black"
                    >
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      Call Now
                    </a>
                  </div>
                  <p className="text-light-grey text-sm mt-6 text-center">
                    Reference: <span className="font-mono font-medium">{project.reference_id}</span>
                  </p>
                </div>

                <div className="bg-pure-white border border-light-grey p-6">
                  <h3 className="font-semibold text-deep-black mb-4">Project Summary</h3>
                  <dl className="space-y-4 text-sm" role="list">
                    <ProjectSummaryItem label="Location" value={project.location} icon={MapPinIcon} />
                    <ProjectSummaryItem label="Status" value={projectStatusLabels[project.status]} icon={Building2} />
                    {project.expected_completion_date && (
                      <ProjectSummaryItem label="Est. Completion" value={formatDate(project.expected_completion_date)} icon={Calendar} />
                    )}
                    <ProjectSummaryItem label="Total Units" value={project.total_units.toString()} icon={Home} />
                    <ProjectSummaryItem label="Available" value={project.available_units.toString()} icon={CheckCircle} />
                    <ProjectSummaryItem label="Progress" value={`${project.progress_percentage}%`} icon={Users} />
                    {project.payment_plan && (
                      <ProjectSummaryItem label="Payment Plan" value="Available" icon={DollarSign} />
                    )}
                    <ProjectSummaryItem label="Reference ID" value={project.reference_id} icon={MapPin} />
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-deep-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Project image gallery"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => Math.max(0, prev - 1)); }}
              className="absolute left-8 p-3 bg-pure-white/10 hover:bg-pure-white/20 text-pure-white rounded transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.img
              src={project.images[lightboxIndex]?.url}
              alt={project.images[lightboxIndex]?.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => Math.min(project.images.length - 1, prev + 1)); }}
              className="absolute right-8 p-3 bg-pure-white/10 hover:bg-pure-white/20 text-pure-white rounded transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-8 right-8 p-3 bg-pure-white/10 hover:bg-pure-white/20 text-pure-white rounded transition-colors"
              aria-label="Close gallery"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {project.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index); }}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    index === lightboxIndex ? 'bg-pure-white' : 'bg-pure-white/30 hover:bg-pure-white/50'
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === lightboxIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectSummaryItem({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-light-grey last:border-0">
      <Icon className="w-5 h-5 text-deep-black flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-medium-grey">{label}</dt>
        <dd className="text-deep-black font-medium truncate">{value}</dd>
      </div>
    </div>
  );
}

function ProgressStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="text-center p-4 bg-off-white">
      <Icon className="w-6 h-6 text-deep-black mx-auto mb-2" aria-hidden="true" />
      <dt className="text-xs font-medium uppercase tracking-wider text-medium-grey">{label}</dt>
      <dd className="text-xl font-heading font-bold text-deep-black mt-1">{value}</dd>
    </div>
  );
}