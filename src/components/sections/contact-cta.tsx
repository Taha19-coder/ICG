'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

export function ContactCTA() {
  const siteConfig = useSiteSettings();

  return (
    <section className="py-20 md:py-28 lg:py-36 bg-off-white overflow-x-clip" aria-labelledby="contact-heading">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 id="contact-heading" className="section-heading mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="section-subheading mb-10">
              Whether you're looking for your dream home, an investment property, or a development partner,
              our team is here to guide you every step of the way.
            </p>

            <div className="space-y-6 mb-10">
              <div className="card flex items-start gap-4 p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-deep-black/5 border border-light-grey flex-shrink-0">
                  <Phone className="w-6 h-6 text-deep-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-black mb-1">Call Us</h3>
                  <a href={`tel:${siteConfig.phone}`} className="text-medium-grey hover:text-deep-black transition-colors">
                    {siteConfig.phone}
                  </a>
                </div>
              </div>

              <div className="card flex items-start gap-4 p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-deep-black/5 border border-light-grey flex-shrink-0">
                  <Mail className="w-6 h-6 text-deep-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-black mb-1">Email Us</h3>
                  <a href={`mailto:${siteConfig.email}`} className="text-medium-grey hover:text-deep-black transition-colors">
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="card flex items-start gap-4 p-6">
                <div className="w-12 h-12 flex items-center justify-center bg-deep-black/5 border border-light-grey flex-shrink-0">
                  <MapPin className="w-6 h-6 text-deep-black" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-deep-black mb-1">Visit Our Office</h3>
                  <address className="text-medium-grey not-italic leading-relaxed">
                    {siteConfig.address}
                  </address>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="btn-primary"
              >
                Send an Inquiry
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsapp_business_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <Send className="w-5 h-5" aria-hidden="true" />
                WhatsApp Us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative aspect-[4/3] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80"
              alt="ICG modern office interior with team collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-deep-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-pure-white/10 backdrop-blur border border-pure-white/20">
              <h3 className="text-xl font-heading font-light text-pure-white mb-2">
                Schedule a Consultation
              </h3>
              <p className="text-light-grey text-sm mb-4">
                Book a private consultation with our property advisors at your convenience.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-pure-white hover:text-light-grey transition-colors"
              >
                Book Appointment
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}