'use client';

import { motion } from 'framer-motion';
import { Search, Lightbulb, Hammer, Key } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover & Understand',
    description: 'We begin by listening — understanding your vision, requirements, budget, and timeline. Our consultants conduct comprehensive needs assessments and market analysis to identify the best opportunities.',
  },
  {
    number: '02',
    icon: Lightbulb,
    title: 'Strategize & Plan',
    description: 'Our experts develop tailored strategies — whether property acquisition, investment portfolio, or construction development. We present curated options with detailed feasibility studies and financial projections.',
  },
  {
    number: '03',
    icon: Hammer,
    title: 'Execute with Excellence',
    description: 'From construction management to transaction coordination, our experienced teams handle every detail. We maintain rigorous quality standards, transparent communication, and proactive problem-solving.',
  },
  {
    number: '04',
    icon: Key,
    title: 'Deliver & Support',
    description: 'Completion is just the beginning. We ensure smooth handover, documentation, and ongoing support — property management, rental services, maintenance, and future investment guidance.',
  },
];

export function OurApproach() {
  return (
    <section id="approach" className="py-20 md:py-28 lg:py-36 bg-pure-white" aria-labelledby="approach-heading">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <h2 id="approach-heading" className="section-heading mb-6">
            Our Approach
          </h2>
          <p className="section-subheading mx-auto">
            A refined four-step methodology ensuring clarity, confidence, and exceptional outcomes for every client.
          </p>
        </motion.div>

        <div className="relative">
          <div className="space-y-16 md:space-y-20">
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={cn(
                  'relative flex gap-8 md:gap-12',
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'relative flex-shrink-0 w-20 md:w-28 flex items-center justify-center z-10',
                  index % 2 === 1 ? 'md:self-end' : 'md:self-start'
                )}>
                  <div className="relative z-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-deep-black flex items-center justify-center text-pure-white font-heading font-medium text-2xl md:text-3xl">
                      {step.number}
                    </div>
                  </div>
                </div>

                <div className={cn(
                  'flex-1 pt-4 md:pt-0',
                  index % 2 === 1 ? 'text-right md:pr-8' : 'md:pl-8'
                )}>
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto md:mx-0 flex items-center justify-center bg-deep-black/5 border border-light-grey mb-6">
                    <step.icon className="w-7 h-7 text-deep-black" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-heading font-medium text-deep-black mb-4">
                    {step.title}
                  </h3>
                  <p className="text-medium-grey text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}