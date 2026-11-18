'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { formatPrice, formatArea } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

export function FeaturedProperties() {
  const { properties: catalogProperties, isLoading, error } = useCatalogData();
  const properties = catalogProperties
    .filter(property => property.is_featured && property.status === 'published')
    .slice(0, 3);

  return (
    <section className="py-20 md:py-28 lg:py-36 bg-off-white" aria-labelledby="featured-heading">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 id="featured-heading" className="section-heading mb-4">
              Featured Properties
            </h2>
            <p className="section-subheading">
              Handpicked premium listings showcasing the finest properties in our portfolio.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-sm font-semibold text-deep-black hover:text-charcoal transition-colors"
            >
              View All Properties
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {error && <p className="mb-6 text-sm text-red-700" role="alert">{error}</p>}
        {isLoading && <p className="mb-6 text-sm text-medium-grey" role="status">Loading featured properties...</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property, index) => (
            <motion.article
              key={property.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card group"
            >
              <Link
                href={`/properties/${property.id}`}
                className="block overflow-hidden"
                aria-label={`View details for ${property.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-light-grey">
                  {property.images[0]?.url && (
                    <motion.img
                      src={property.images[0].url}
                      alt={property.images[0].alt || property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  {property.images.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 text-xs font-medium bg-pure-white/90 backdrop-blur text-deep-black rounded">
                        +{property.images.length - 1} more
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      'px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                      property.purpose === 'buy'
                        ? 'bg-deep-black text-pure-white'
                        : 'bg-emerald-600 text-pure-white'
                    )}>
                      {purposeLabels[property.purpose]}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-medium-grey text-sm mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{property.society}</span>
                  </div>

                  <h3 className="text-xl font-heading font-medium text-deep-black mb-2 group-hover:text-charcoal transition-colors line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-medium-grey mb-4">
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" aria-hidden="true" />
                        {property.bedrooms} Bed
                      </span>
                    )}
                    {property.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" aria-hidden="true" />
                        {property.bathrooms} Bath
                      </span>
                    )}
                    {(property.covered_area > 0 || property.plot_size > 0) && (
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4" aria-hidden="true" />
                        {property.covered_area > 0
                          ? formatArea(property.covered_area, property.area_unit)
                          : formatArea(property.plot_size, property.area_unit)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-light-grey">
                    <div>
                      <span className="text-2xl font-heading font-semibold text-deep-black">
                        {formatPrice(property.price)}
                      </span>
                      {property.purpose === 'rent' && (
                        <span className="text-medium-grey text-sm ml-2">/month</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium uppercase tracking-wider bg-light-grey text-charcoal">
                      {propertyTypeLabels[property.property_type]}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        {!isLoading && !error && properties.length === 0 && (
          <p className="py-12 text-center text-medium-grey">No featured properties are available right now.</p>
        )}
      </div>
    </section>
  );
}