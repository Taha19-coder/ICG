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
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(14,15,17,0.6)_100%)]" />
      </div>

      <div className="relative z-10 container-custom py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl text-center"
        >
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-light tracking-tight text-pure-white leading-[1.1] mb-8"
          >
            {siteConfig.company_tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-light-grey font-normal max-w-3xl mx-auto leading-relaxed"
          >
            Discover exceptional properties and development opportunities with Investment and Construction Group.
          </motion.p>

        </motion.div>
      </div>
    </section>
  );
}