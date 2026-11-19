'use client';

import { motion } from 'framer-motion';
import { Building2, Home, Award, Users } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

const stats = [
  { value: '15+', label: 'Years of Excellence', icon: Award },
  { value: '200+', label: 'Properties Delivered', icon: Home },
  { value: '50+', label: 'Landmark Projects', icon: Building2 },
  { value: '1000+', label: 'Satisfied Clients', icon: Users },
];

const values = [
  { title: 'Integrity', description: 'We conduct every transaction with honesty, transparency, and ethical practices.' },
  { title: 'Excellence', description: 'We pursue the highest standards in design, construction, and client service.' },
  { title: 'Innovation', description: 'We embrace modern technologies and sustainable practices for better outcomes.' },
  { title: 'Partnership', description: 'We build lasting relationships based on trust, respect, and mutual success.' },
];

export function AboutPreview() {
  const siteConfig = useSiteSettings();

  return (
    <section className="py-20 md:py-28 lg:py-36 bg-deep-black text-pure-white overflow-x-clip" aria-labelledby="about-preview-heading">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-deep-black mb-8">
              <span className="w-1 h-1 bg-deep-black rounded-full" />
              About ICG
            </span>
            <h2 id="about-preview-heading" className="text-4xl md:text-5xl lg:text-6xl font-heading font-light tracking-tight mb-8">
              {siteConfig.company_tagline}
            </h2>
            <p className="text-light-grey text-lg leading-relaxed mb-8 max-w-xl">
              {siteConfig.company_name} is Lahore&apos;s premier real estate and construction company,
              dedicated to developing exceptional properties and landmark projects that define the city&apos;s evolving landscape.
            </p>
            <p className="text-light-grey text-lg leading-relaxed mb-10 max-w-xl">
              With a legacy of architectural excellence and market leadership, we transform visions into enduring assets —
              from luxury residences and commercial towers to integrated communities and sustainable developments.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-10">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-6 h-6 text-pure-white/50" aria-hidden="true" />
                  </div>
                  <div className="text-3xl md:text-4xl font-heading font-light text-pure-white">
                    {stat.value}
                  </div>
                  <div className="text-medium-grey text-sm mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
                alt="ICG team collaboration and architectural planning"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-deep-black/60 to-transparent" />
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
                  className="card p-5 sm:p-6 bg-charcoal/50 border border-light-grey/20"
                >
                  <motion.h3
                    whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
                    className="text-lg font-heading font-medium mb-2 group-hover:text-charcoal transition-colors"
                  >
                    {value.title}
                  </motion.h3>
                  <p className="text-light-grey text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}