'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Bed, Bath, Square, Home, Building2, Tag, Share2, Heart, MapPin as MapPinIcon, Phone, Mail, Send, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, X, Check } from 'lucide-react';
import { formatPrice, formatArea, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { useSiteSettings } from '@/hooks/use-site-settings';

const propertyTypeLabels: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  penthouse: 'Penthouse',
  farmhouse: 'Farmhouse',
  residential_plot: 'Residential Plot',
  commercial_property: 'Commercial Property',
  commercial_plot: 'Commercial Plot',
};

const purposeLabels: Record<string, string> = {
  buy: 'For Sale',
  rent: 'For Rent',
};

const furnishingLabels: Record<string, string> = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-Furnished',
  unfurnished: 'Unfurnished',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { properties, isLoading, error } = useCatalogData();
  const siteConfig = useSiteSettings();
  const property = properties.find(item => item.id === id);
  const similarProperties = property
    ? properties
        .filter(p => p.status === 'published' && p.id !== id && (p.society === property.society || p.property_type === property.property_type))
        .slice(0, 3)
    : [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (isLoading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <p className={error ? 'text-red-700' : 'text-medium-grey'} role={error ? 'alert' : 'status'}>
          {error || 'Loading property...'}
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <div className="text-center">
          <Home className="w-16 h-16 mx-auto text-light-grey mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-heading font-light text-charcoal mb-2">Property Not Found</h2>
          <p className="text-medium-grey mb-6">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/properties" className="btn-primary">
            Browse Properties
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi ICG, I'm interested in property ${property.reference_id} - ${property.title} at ${property.location}. Could you please provide more details?`
  );

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp_business_number.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-pure-white">
      <nav className="pt-28 pb-6 px-4 md:px-6 lg:px-8 bg-pure-white border-b border-light-grey" aria-label="Breadcrumb">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm text-medium-grey">
            <li>
              <Link href="/" className="hover:text-deep-black transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" aria-hidden="true" />
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <Link href="/properties" className="hover:text-deep-black transition-colors">Properties</Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <Link href={`/properties?society=${property.society}`} className="hover:text-deep-black transition-colors">{property.society}</Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <span className="text-deep-black font-medium overflow-wrap break-word" aria-current="page">{property.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      <section className="py-6 sm:py-8 lg:py-12" aria-labelledby="property-title">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="relative">
                <div className="relative aspect-[16/9] rounded-none overflow-hidden bg-light-grey">
                  {property.images[currentImageIndex]?.url && (
                    <>
                      <motion.img
                        src={property.images[currentImageIndex].url}
                        alt={property.images[currentImageIndex].alt || property.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => { setLightboxIndex(currentImageIndex); setIsLightboxOpen(true); }}
                        className="absolute top-4 right-4 p-2 bg-pure-white/90 backdrop-blur text-deep-black hover:bg-pure-white rounded transition-colors"
                        aria-label="Open fullscreen gallery"
                      >
                        <Expand className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {property.images.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-4">
                    {property.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          'relative flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all',
                          currentImageIndex === index
                            ? 'border-deep-black'
                            : 'border-transparent hover:border-medium-grey'
                        )}
                        aria-label={`View image ${index + 1}`}
                        aria-current={currentImageIndex === index ? 'true' : 'false'}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={cn(
                        'px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                        property.purpose === 'buy'
                          ? 'bg-deep-black text-pure-white'
                          : 'bg-emerald-600 text-pure-white'
                      )}>
                        {purposeLabels[property.purpose]}
                      </span>
                      {property.is_featured && (
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-amber-500 text-pure-white">
                          Featured
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium uppercase tracking-wider bg-light-grey text-charcoal">
                        {propertyTypeLabels[property.property_type]}
                      </span>
                    </div>
                    <h1 id="property-title" className="text-3xl md:text-4xl font-heading font-light tracking-tight text-deep-black mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-medium-grey">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-pure-white border border-light-grey hover:border-deep-black hover:text-deep-black transition-colors" aria-label="Share property">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-pure-white border border-light-grey hover:border-deep-black hover:text-deep-black transition-colors" aria-label="Save property">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-light-grey">
                  <div className="text-center w-full sm:w-auto">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold text-deep-black">
                      {formatPrice(property.price)}
                    </div>
                    {property.purpose === 'rent' && (
                      <div className="text-medium-grey text-sm">/ month</div>
                    )}
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-light-grey self-stretch sm:self-auto" aria-hidden="true" />
                  <div className="flex-1 grid sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    {property.bedrooms > 0 && (
                      <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-off-white">
                        <Bed className="w-5 sm:w-6 h-5 sm:h-6 text-deep-black" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-medium text-deep-black">{property.bedrooms}</span>
                        <span className="text-[10px] sm:text-xs text-medium-grey">Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-off-white">
                        <Bath className="w-5 sm:w-6 h-5 sm:h-6 text-deep-black" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-medium text-deep-black">{property.bathrooms}</span>
                        <span className="text-[10px] sm:text-xs text-medium-grey">Bathrooms</span>
                      </div>
                    )}
                    {(property.covered_area > 0 || property.plot_size > 0) && (
                      <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-off-white">
                        <Square className="w-5 sm:w-6 h-5 sm:h-6 text-deep-black" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-medium text-deep-black overflow-wrap break-word">
                          {property.covered_area > 0
                            ? formatArea(property.covered_area, property.area_unit)
                            : formatArea(property.plot_size, property.area_unit)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-medium-grey">Total Area</span>
                      </div>
                    )}
                    {(property.kitchens > 0 || property.floors > 0 || property.parking > 0) && (
                      <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-off-white">
                        <Home className="w-5 sm:w-6 h-5 sm:h-6 text-deep-black" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-medium text-deep-black overflow-wrap break-word">
                          {property.kitchens > 0 ? `${property.kitchens} Kitchen` :
                           property.floors > 0 ? `${property.floors} Floor` :
                           `${property.parking} Parking`}
                        </span>
                        <span className="text-[10px] sm:text-xs text-medium-grey">
                          {property.kitchens > 0 ? 'Kitchens' : property.floors > 0 ? 'Floors' : 'Parking'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-light-grey">
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-medium text-deep-black mb-2 sm:mb-4">Description</h2>
                  <p className="text-medium-grey leading-relaxed whitespace-normal overflow-wrap break-word">{property.description}</p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-medium text-deep-black mb-2 sm:mb-4">Property Features</h2>
                  <ul className="grid sm:grid-cols-2 gap-2 sm:gap-3" role="list">
                    {property.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1 sm:gap-2 text-medium-grey text-sm">
                        <Check className="w-4 sm:w-5 h-4 sm:h-5 text-deep-black flex-shrink-0" aria-hidden="true" />
                        <span className="overflow-wrap break-word">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-light-grey">
                <h2 className="text-lg sm:text-xl font-heading font-medium text-deep-black mb-2 sm:mb-4">Property Details</h2>
                <dl className="grid sm:grid-cols-2 gap-2 sm:gap-4" role="list">
                  <PropertyDetailItem label="Reference ID" value={property.reference_id} />
                  <PropertyDetailItem label="Property Type" value={propertyTypeLabels[property.property_type]} />
                  <PropertyDetailItem label="Purpose" value={purposeLabels[property.purpose]} />
                  <PropertyDetailItem label="Society / Location" value={property.society} />
                  <PropertyDetailItem label="Bedrooms" value={property.bedrooms > 0 ? property.bedrooms.toString() : 'N/A'} />
                  <PropertyDetailItem label="Bathrooms" value={property.bathrooms > 0 ? property.bathrooms.toString() : 'N/A'} />
                  <PropertyDetailItem label="Kitchens" value={property.kitchens > 0 ? property.kitchens.toString() : 'N/A'} />
                  <PropertyDetailItem label="Floors" value={property.floors > 0 ? property.floors.toString() : 'N/A'} />
                  <PropertyDetailItem
                    label="Covered Area"
                    value={property.covered_area > 0 ? formatArea(property.covered_area, property.area_unit) : 'N/A'}
                  />
                  <PropertyDetailItem
                    label="Plot Size"
                    value={property.plot_size > 0 ? formatArea(property.plot_size, property.area_unit) : 'N/A'}
                  />
                  <PropertyDetailItem label="Parking Spaces" value={property.parking > 0 ? property.parking.toString() : 'N/A'} />
                  <PropertyDetailItem label="Furnishing Status" value={furnishingLabels[property.furnishing_status]} />
                  <PropertyDetailItem label="Status" value={property.status.charAt(0).toUpperCase() + property.status.slice(1)} />
                  <PropertyDetailItem label="Listed On" value={formatDate(property.created_at)} />
                </dl>
              </div>

              {property.nearby_landmarks.length > 0 && (
                <div className="pt-6 sm:pt-8 border-t border-light-grey">
                  <h2 className="text-lg sm:text-xl font-heading font-medium text-deep-black mb-2 sm:mb-4">Nearby Landmarks</h2>
                  <ul className="flex flex-wrap gap-2 sm:gap-3" role="list">
                    {property.nearby_landmarks.map((landmark, index) => (
                      <li key={index} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-off-white border border-light-grey">
                        <MapPinIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-medium-grey" aria-hidden="true" />
                        <span className="text-xs sm:text-sm text-medium-grey overflow-wrap break-word">{landmark}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {similarProperties.length > 0 && (
                <div className="pt-8 border-t border-light-grey">
                  <h2 className="text-xl font-heading font-medium text-deep-black mb-6">Similar Properties</h2>
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                    {similarProperties.map((similarProp, index) => (
                      <motion.article
                        key={similarProp.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="card group"
                      >
                        <Link
                          href={`/properties/${similarProp.id}`}
                          className="block overflow-hidden"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-light-grey">
                            {similarProp.images[0]?.url && (
                              <motion.img
                                src={similarProp.images[0].url}
                                alt={similarProp.images[0].alt || similarProp.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute top-3 left-3">
                              <span className={cn(
                                'px-2 py-1 text-xs font-semibold uppercase tracking-wider',
                                similarProp.purpose === 'buy'
                                  ? 'bg-deep-black text-pure-white'
                                  : 'bg-emerald-600 text-pure-white'
                              )}>
                                {purposeLabels[similarProp.purpose]}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-medium-grey text-sm mb-2">
                              <MapPin className="w-4 h-4" aria-hidden="true" />
                              <span>{similarProp.society}</span>
                            </div>
                            <h3 className="font-medium text-deep-black mb-2 line-clamp-1 group-hover:text-charcoal transition-colors">
                              {similarProp.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-heading font-semibold text-deep-black">
                                {formatPrice(similarProp.price)}
                              </span>
                              <span className="text-xs font-medium uppercase tracking-wider bg-light-grey text-charcoal px-2 py-1">
                                {propertyTypeLabels[similarProp.property_type]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="bg-deep-black text-pure-white p-8">
                  <h3 className="text-xl font-heading font-light mb-6">Interested in This Property?</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleWhatsAppClick}
                      className="btn-whatsapp w-full justify-center"
                    >
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Contact on WhatsApp
                    </button>
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="btn-secondary w-full justify-center border-pure-white text-pure-white hover:bg-pure-white hover:text-deep-black"
                    >
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      Call Now
                    </a>
                    <Link
                      href={`/contact?property=${property.reference_id}`}
                      className="btn-secondary w-full justify-center border-pure-white text-pure-white hover:bg-pure-white hover:text-deep-black"
                    >
                      <Mail className="w-5 h-5" aria-hidden="true" />
                      Send Inquiry
                    </Link>
                  </div>
                  <p className="text-light-grey text-sm mt-6 text-center">
                    Reference: <span className="font-mono font-medium">{property.reference_id}</span>
                  </p>
                </div>

                <div className="bg-pure-white border border-light-grey p-6">
                  <h3 className="font-semibold text-deep-black mb-4">Quick Facts</h3>
                  <dl className="space-y-3 text-sm" role="list">
                    <QuickFact label="Society" value={property.society} />
                    <QuickFact label="Type" value={propertyTypeLabels[property.property_type]} />
                    <QuickFact label="Purpose" value={purposeLabels[property.purpose]} />
                    <QuickFact label="Price" value={formatPrice(property.price) + (property.purpose === 'rent' ? '/mo' : '')} />
                    <QuickFact label="Bedrooms" value={property.bedrooms > 0 ? property.bedrooms.toString() : 'N/A'} />
                    <QuickFact label="Bathrooms" value={property.bathrooms > 0 ? property.bathrooms.toString() : 'N/A'} />
                    <QuickFact label="Area" value={property.covered_area > 0 ? formatArea(property.covered_area, property.area_unit) : (property.plot_size > 0 ? formatArea(property.plot_size, property.area_unit) : 'N/A')} />
                    <QuickFact label="Parking" value={property.parking > 0 ? property.parking.toString() : 'N/A'} />
                    <QuickFact label="Furnishing" value={furnishingLabels[property.furnishing_status]} />
                    <QuickFact label="Reference" value={property.reference_id} />
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
            aria-label="Property image gallery"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => Math.max(0, prev - 1)); }}
              className="absolute left-8 p-3 bg-pure-white/10 hover:bg-pure-white/20 text-pure-white rounded transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.img
              src={property.images[lightboxIndex]?.url}
              alt={property.images[lightboxIndex]?.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => Math.min(property.images.length - 1, prev + 1)); }}
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
              {property.images.map((_, index) => (
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

function PropertyDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-off-white">
      <dt className="text-xs font-medium uppercase tracking-wider text-medium-grey">{label}</dt>
      <dd className="text-deep-black font-medium">{value}</dd>
    </div>
  );
}

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-light-grey last:border-0">
      <dt className="text-medium-grey">{label}</dt>
      <dd className="text-deep-black font-medium text-right max-w-[60%] truncate">{value}</dd>
    </div>
  );
}