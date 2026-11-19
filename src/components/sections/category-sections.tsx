'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Building2, Home } from 'lucide-react';

const categories = [
  {
    id: 'construction',
    title: 'Construction & Development',
    description: 'Explore our ongoing and completed developments.',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80',
    href: '/projects',
    icon: Building2,
    label: 'Explore Projects',
  },
  {
    id: 'properties',
    title: 'Find Your Property',
    description: 'Explore premium residential and investment opportunities across Lahore.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    href: '/properties',
    icon: Home,
    label: 'Discover Properties',
  },
];

export function CategorySections() {
  return (
    <section className="py-20 md:py-28 lg:py-36 bg-pure-white" aria-labelledby="categories-heading">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <div className="section-divider">
            <h2 id="categories-heading" className="section-heading mb-6">
              What Are You Looking For?
            </h2>
          </div>
          <p className="section-subheading mx-auto">
            Choose your path — whether you're seeking a landmark development project or your dream property.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.article
              key={category.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card group overflow-hidden"
              whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
            >
              <Link
                href={category.href}
                className="block relative aspect-[4/3] md:aspect-[16/10] overflow-hidden"
                aria-label={`${category.title} - ${category.description}`}
              >
                <motion.img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black/90 via-deep-black/30 to-transparent" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-deep-black/10 group-hover:bg-deep-black/20 transition-colors duration-500"
                />

                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative z-10"
                  >
                    <motion.span
                      className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-pure-white/10 border border-pure-white/20 text-pure-white mb-4"
                    >
                      {category.id === 'construction' ? 'Development' : 'Residential'}
                    </motion.span>

                    <motion.h3
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-pure-white mb-4"
                    >
                      {category.title}
                    </motion.h3>

                    <p className="text-light-grey text-base md:text-lg max-w-xs mb-8 leading-relaxed">
                      {category.description}
                    </p>

                    <motion.div
                      className="inline-flex items-center gap-2 text-pure-white font-medium text-sm uppercase tracking-wider"
                      whileHover={{ x: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <span>{category.label}</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </motion.div>
                  </motion.div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}