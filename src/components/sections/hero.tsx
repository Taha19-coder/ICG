'use client';

import { motion } from 'framer-motion';
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
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: 'linear' }}
          style={{ animation: 'kenburns 20s ease-in-out infinite alternate' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/85 via-deep-black/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,11,13,0.7)_100%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0%,rgba(197,160,89,0.15)_25%,transparent_50%,rgba(197,160,89,0.15)_75%,transparent_100%)]" />
      </div>

      <div className="relative z-10 container-custom py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 text-gold-accent text-xs font-semibold uppercase tracking-[0.2em] mb-8"
          >
            <span className="w-1 h-1 bg-gold-accent rounded-full" />
            <span>Investment & Construction Group</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-light tracking-tight text-pure-white leading-[1.05] mb-8"
          >
            {siteConfig.company_tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl lg:text-2xl text-light-grey font-normal max-w-2xl mx-auto leading-relaxed tracking-wide"
          >
            Discover exceptional properties and development opportunities with Investment and Construction Group.
          </motion.p>

        </motion.div>
      </div>
    </section>
  );
}