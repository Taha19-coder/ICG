'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

const heroImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
];

export function HeroSection() {
  const siteConfig = useSiteSettings();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-0 z-0">
        <motion.img
          src={heroImages[0]}
          alt="Modern luxury villa architecture in Lahore"
          className="w-full h-full object-cover animate-kenburns"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/85 via-deep-black/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,11,13,0.7)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,11,13,0.8)_100%)]" />
      </div>

      <div className="relative z-10 container-custom py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 text-pure-white text-sm font-semibold uppercase tracking-[0.2em] mb-8 animate-float"
          >
            <span className="w-1 h-1 bg-deep-black rounded-full animate-pulse-slow" />
            <span>Investment & Construction Group</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-light tracking-tight text-pure-white leading-[1.1] mb-8"
          >
            {siteConfig.company_tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-light-grey font-normal max-w-2xl mx-auto leading-relaxed tracking-wide"
          >
            Discover exceptional properties and development opportunities with Investment and Construction Group.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="btn-primary flex items-center gap-2"
            >
              Explore Properties
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="btn-secondary flex items-center gap-2"
            >
              View Projects
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 flex items-center justify-center gap-6 animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-deep-black/10 flex items-center justify-center border border-pure-white/10">
              <span className="text-pure-white font-semibold">15+</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-deep-black/10 flex items-center justify-center border border-pure-white/10">
              <span className="text-pure-white font-semibold">200+</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-deep-black/10 flex items-center justify-center border border-pure-white/10">
              <span className="text-pure-white font-semibold">50+</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}