'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Home, Building2, Users, Clock, MapPin, CheckCircle } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Trusted Expertise',
    description: 'Decades of combined experience in Lahore\'s premium real estate and construction market.',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Rigorous quality control at every stage — from design to delivery — ensuring lasting value.',
  },
  {
    icon: Home,
    title: 'Prime Locations',
    description: 'Exclusive access to the most sought-after societies and development zones across Lahore.',
  },
  {
    icon: Building2,
    title: 'End-to-End Service',
    description: 'Complete property lifecycle management — acquisition, development, sales, and after-sales care.',
  },
  {
    icon: Users,
    title: 'Client-Centric Approach',
    description: 'Dedicated relationship managers providing personalized guidance throughout your journey.',
  },
  {
    icon: Clock,
    title: 'Timely Delivery',
    description: 'Proven track record of completing projects on schedule without compromising quality.',
  },
  {
    icon: MapPin,
    title: 'Local Market Intelligence',
    description: 'Deep understanding of Lahore\'s neighborhoods, regulations, and investment dynamics.',
  },
  {
    icon: CheckCircle,
    title: 'Transparent Process',
    description: 'Clear communication, documented procedures, and honest pricing at every step.',
  },
];

export function WhyChooseICG() {
  return (
    <section id="why-icg" className="py-20 md:py-28 lg:py-36 bg-off-white" aria-labelledby="why-heading">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <div className="section-divider">
            <h2 id="why-heading" className="section-heading mb-6">
              Why Choose ICG?
            </h2>
          </div>
          <p className="section-subheading mx-auto">
            We combine architectural excellence, market expertise, and unwavering commitment to deliver
            exceptional value for every client.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <motion.article
              key={reason.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="card p-6 md:p-8 text-center hover:bg-off-white"
            >
              <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center bg-deep-black/5 border border-light-grey group-hover:border-deep-black group-hover:bg-deep-black/10 transition-all duration-500">
                <reason.icon className="w-7 h-7 text-deep-black group-hover:text-charcoal transition-colors duration-300" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-heading font-medium text-deep-black mb-3 group-hover:text-charcoal transition-colors">
                {reason.title}
              </h3>
              <p className="text-medium-grey leading-relaxed">
                {reason.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}