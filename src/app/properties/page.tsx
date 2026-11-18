'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, X, Filter, SlidersHorizontal, ChevronDown, MapPin, Bed, Bath, Square, Tag, ArrowRight, Home, Building2 } from 'lucide-react';
import { formatPrice, formatArea } from '@/lib/utils';
import { LAHORE_SOCIETIES, PROPERTY_TYPES, type PropertyFilters, type SortOption } from '@/lib/types';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { cn } from '@/lib/utils';

const purposeLabels: Record<string, string> = {
  buy: 'For Sale',
  rent: 'For Rent',
};

const propertyTypeLabels: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  penthouse: 'Penthouse',
  farmhouse: 'Farmhouse',
  residential_plot: 'Residential Plot',
  commercial_property: 'Commercial Property',
  commercial_plot: 'Commercial Plot',
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_desc', label: 'Largest Area' },
];

const propertiesPerPage = 3;

const priceRanges = [
  { value: 'any', label: 'Any', min: undefined, max: undefined },
  { value: 'under_50lac', label: 'Under 50 Lac', min: 0, max: 5000000 },
  { value: '50lac_1cr', label: '50 Lac - 1 Crore', min: 5000000, max: 10000000 },
  { value: '1cr_2cr', label: '1 Crore - 2 Crore', min: 10000000, max: 20000000 },
  { value: '2cr_5cr', label: '2 Crore - 5 Crore', min: 20000000, max: 50000000 },
  { value: '5cr_plus', label: '5 Crore+', min: 50000000, max: undefined },
];

const areaRanges = [
  { value: 'any', label: 'Any', min: undefined, max: undefined },
  { value: 'under_1000', label: 'Under 1000 sqft', min: 0, max: 1000 },
  { value: '1000_2000', label: '1000 - 2000 sqft', min: 1000, max: 2000 },
  { value: '2000_4000', label: '2000 - 4000 sqft', min: 2000, max: 4000 },
  { value: '4000_8000', label: '4000 - 8000 sqft', min: 4000, max: 8000 },
  { value: '8000_plus', label: '8000+ sqft', min: 8000, max: undefined },
];

function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const value = e.target.value;
  const validSorts: SortOption[] = ['newest', 'price_asc', 'price_desc', 'area_desc'];
  if (validSorts.includes(value as SortOption)) {
    handleFilterChange('sort', value as SortOption);
  }
}

function handlePropertyTypeChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const value = e.target.value;
  const validTypes = ['', 'house', 'apartment', 'penthouse', 'farmhouse', 'residential_plot', 'commercial_property', 'commercial_plot'];
  if (validTypes.includes(value)) {
    handleFilterChange('property_type', value || undefined);
  }
}

function handlePurposeChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const value = e.target.value;
  if (value === '' || value === 'buy' || value === 'rent') {
    handleFilterChange('purpose', value || undefined);
  }
}

function handlePriceRangeChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const range = priceRanges.find(r => r.value === e.target.value);
  if (range) {
    handleFilterChange('min_price', range.min);
    handleFilterChange('max_price', range.max);
  } else {
    handleFilterChange('min_price', undefined);
    handleFilterChange('max_price', undefined);
  }
}

function handleAreaRangeChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const range = areaRanges.find(r => r.value === e.target.value);
  if (range) {
    handleFilterChange('min_area', range.min);
    handleFilterChange('max_area', range.max);
  } else {
    handleFilterChange('min_area', undefined);
    handleFilterChange('max_area', undefined);
  }
}

function handleBedroomsChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const value = e.target.value;
  if (value === '') {
    handleFilterChange('bedrooms', undefined);
  } else {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      handleFilterChange('bedrooms', num);
    }
  }
}

function handleBathroomsChange(e: React.ChangeEvent<HTMLSelectElement>, handleFilterChange: (key: keyof PropertyFilters, value: any) => void) {
  const value = e.target.value;
  if (value === '') {
    handleFilterChange('bathrooms', undefined);
  } else {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      handleFilterChange('bathrooms', num);
    }
  }
}

export default function PropertiesPage() {
  const { properties, isLoading, error } = useCatalogData();
  const [filters, setFilters] = useState<PropertyFilters>({
    society: '',
    property_type: undefined,
    purpose: undefined,
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    min_area: undefined,
    max_area: undefined,
    sort: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<PropertyFilters>(filters);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allProperties = properties.filter(property => property.status === 'published');

  const filteredProperties = useMemo(() => {
    let result = [...allProperties];

    if (debouncedFilters.society) {
      result = result.filter(p => p.society === debouncedFilters.society);
    }

    if (debouncedSearchQuery) {
      result = result.filter(property => [
        property.title,
        property.description,
        property.location,
        property.society,
        property.reference_id,
        property.property_type,
        property.purpose,
      ].some(value => value.toLowerCase().includes(debouncedSearchQuery)));
    }

    if (debouncedFilters.property_type) {
      result = result.filter(p => p.property_type === debouncedFilters.property_type);
    }

    if (debouncedFilters.purpose) {
      result = result.filter(p => p.purpose === debouncedFilters.purpose);
    }

    if (debouncedFilters.min_price !== undefined) {
      result = result.filter(p => p.price >= debouncedFilters.min_price!);
    }

    if (debouncedFilters.max_price !== undefined) {
      result = result.filter(p => p.price <= debouncedFilters.max_price!);
    }

    if (debouncedFilters.bedrooms !== undefined) {
      result = result.filter(p => p.bedrooms >= debouncedFilters.bedrooms!);
    }

    if (debouncedFilters.bathrooms !== undefined) {
      result = result.filter(p => p.bathrooms >= debouncedFilters.bathrooms!);
    }

    if (debouncedFilters.min_area !== undefined) {
      result = result.filter(p => (p.covered_area || p.plot_size) >= debouncedFilters.min_area!);
    }

    if (debouncedFilters.max_area !== undefined) {
      result = result.filter(p => (p.covered_area || p.plot_size) <= debouncedFilters.max_area!);
    }

    switch (debouncedFilters.sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'area_desc':
        result.sort((a, b) => (b.covered_area || b.plot_size) - (a.covered_area || a.plot_size));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [debouncedFilters, debouncedSearchQuery, allProperties]);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const hasActiveFilters = Boolean(
    filters.society
    || filters.property_type
    || filters.purpose
    || filters.min_price !== undefined
    || filters.max_price !== undefined
    || filters.bedrooms !== undefined
    || filters.bathrooms !== undefined
    || filters.min_area !== undefined
    || filters.max_area !== undefined
    || searchQuery.trim()
  );

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setFilters({
      society: '',
      property_type: undefined,
      purpose: undefined,
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      min_area: undefined,
      max_area: undefined,
      sort: 'newest',
    });
  };

  const getPriceRangeLabel = (min?: number, max?: number) => {
    if (!min && !max) return 'Any Price';
    const range = priceRanges.find(r => r.min === min && r.max === max);
    return range?.label || 'Custom';
  };

  const getAreaRangeLabel = (min?: number, max?: number) => {
    if (!min && !max) return 'Any Area';
    const range = areaRanges.find(r => r.min === min && r.max === max);
    return range?.label || 'Custom';
  };

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
              Discover Properties
            </h1>
            <p className="text-light-grey text-lg leading-relaxed">
              Explore our curated portfolio of premium residential and commercial properties across Lahore's most prestigious locations.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-pure-white border-b border-light-grey sticky top-20 z-30 md:relative md:top-auto md:z-auto md:border-b-0 md:bg-transparent">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-grey" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by location, society, or keyword..."
                className="input-field pl-12"
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.property_type || ''}
                onChange={e => handlePropertyTypeChange(e, handleFilterChange)}
                className="input-field w-auto min-w-[160px] appearance-none select-arrow pr-10"
              >
                <option value="">Property Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filters.purpose || ''}
                onChange={e => handlePurposeChange(e, handleFilterChange)}
                className="input-field w-auto min-w-[140px] appearance-none select-arrow pr-10"
              >
                <option value="">Purpose</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>

              <select
                value={filters.min_price !== undefined || filters.max_price !== undefined ? 'custom' : ''}
                onChange={e => handlePriceRangeChange(e, handleFilterChange)}
                className="input-field w-auto min-w-[160px] appearance-none select-arrow pr-10"
              >
                <option value="">Price Range</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>

              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden btn-secondary px-4 py-3"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" aria-hidden="true" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </section>

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
                <h2 className="text-xl font-heading font-medium">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-deep-black"
                  aria-label="Close filters"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <MobileFilterSection
                  title="Society / Location"
                  filters={LAHORE_SOCIETIES.map(s => ({ value: s, label: s }))}
                  selected={filters.society || ''}
                  onChange={(v) => handleFilterChange('society', v)}
                  placeholder="All Societies"
                />
                <MobileFilterSection
                  title="Property Type"
                  filters={PROPERTY_TYPES}
                  selected={filters.property_type || ''}
                  onChange={(v) => handleFilterChange('property_type', v || undefined)}
                  placeholder="All Types"
                />
                <MobileFilterSection
                  title="Purpose"
                  filters={[{ value: 'buy', label: 'Buy' }, { value: 'rent', label: 'Rent' }]}
                  selected={filters.purpose || ''}
                  onChange={(v) => handleFilterChange('purpose', v || undefined)}
                  placeholder="All"
                />
                <MobileFilterSection
                  title="Price Range"
                  filters={priceRanges}
                  selected={priceRanges.find(r => r.min === filters.min_price && r.max === filters.max_price)?.value || 'any'}
                  onChange={(value) => {
                    const range = priceRanges.find(r => r.value === value);
                    if (range) {
                      handleFilterChange('min_price', range.min);
                      handleFilterChange('max_price', range.max);
                    } else {
                      handleFilterChange('min_price', undefined);
                      handleFilterChange('max_price', undefined);
                    }
                  }}
                  placeholder="Any Price"
                />
                <MobileFilterSection
                  title="Bedrooms"
                  filters={[
                    { value: undefined, label: 'Any' },
                    { value: 1, label: '1+' },
                    { value: 2, label: '2+' },
                    { value: 3, label: '3+' },
                    { value: 4, label: '4+' },
                    { value: 5, label: '5+' },
                  ]}
                  selected={filters.bedrooms?.toString() || ''}
                  onChange={(v) => handleFilterChange('bedrooms', v ? parseInt(v) : undefined)}
                  placeholder="Any"
                />
                <MobileFilterSection
                  title="Bathrooms"
                  filters={[
                    { value: undefined, label: 'Any' },
                    { value: 1, label: '1+' },
                    { value: 2, label: '2+' },
                    { value: 3, label: '3+' },
                    { value: 4, label: '4+' },
                  ]}
                  selected={filters.bathrooms?.toString() || ''}
                  onChange={(v) => handleFilterChange('bathrooms', v ? parseInt(v) : undefined)}
                  placeholder="Any"
                />
                <MobileFilterSection
                  title="Area (sqft)"
                  filters={areaRanges}
                  selected={areaRanges.find(r => r.min === filters.min_area && r.max === filters.max_area)?.value || 'any'}
                  onChange={(value) => {
                    const range = areaRanges.find(r => r.value === value);
                    if (range) {
                      handleFilterChange('min_area', range.min);
                      handleFilterChange('max_area', range.max);
                    } else {
                      handleFilterChange('min_area', undefined);
                      handleFilterChange('max_area', undefined);
                    }
                  }}
                  placeholder="Any Area"
                />
              </div>
              <div className="p-6 border-t border-light-grey flex gap-4">
                <button
                  onClick={clearFilters}
                  className="flex-1 btn-secondary"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="py-12 bg-off-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.span
                key={filteredProperties.length}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-medium text-charcoal"
              >
                {isLoading ? 'Loading properties...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Property' : 'Properties'} Found`}
              </motion.span>

              {hasActiveFilters && (
                <motion.button
                  onClick={clearFilters}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-medium-grey hover:text-deep-black transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  Clear Filters
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm text-medium-grey">Sort by:</label>
              <select
                id="sort"
                value={filters.sort}
                onChange={e => handleSortChange(e, handleFilterChange)}
                className="input-field w-auto min-w-[180px] appearance-none select-arrow pr-10"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="py-20 text-center text-red-700" role="alert">{error}</p>
          ) : isLoading ? (
            <p className="py-20 text-center text-medium-grey" role="status">Loading properties...</p>
          ) : filteredProperties.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {paginatedProperties.map((property, index) => (
                  <motion.article
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
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

                        <div className="flex flex-wrap items-center gap-4 text-sm text-medium-grey mb-4">
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

              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Property result pages">
                  <button
                    className="btn-secondary px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      className={cn(
                        'px-6 py-3',
                        currentPage === page ? 'btn-primary' : 'btn-secondary'
                      )}
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="btn-secondary px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Home className="w-16 h-16 mx-auto text-light-grey mb-4" aria-hidden="true" />
              <h3 className="text-xl font-heading font-light text-charcoal mb-2">No Properties Found</h3>
              <p className="text-medium-grey mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search criteria to find matching properties.'
                  : 'No properties are currently available. Please check back later.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function MobileFilterSection({
  title,
  filters,
  selected,
  onChange,
  placeholder,
}: {
  title: string;
  filters: { value: any; label: string }[];
  selected: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-3">{title}</h3>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="input-field appearance-none select-arrow pr-10"
      >
        <option value="">{placeholder}</option>
        {filters.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </div>
  );
}