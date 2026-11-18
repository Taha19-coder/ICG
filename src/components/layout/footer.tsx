'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2, Camera, Briefcase, MessageCircle, MapPin, Phone, Mail, Send } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

const socialLinks = [
  { icon: Globe2, href: '#', label: 'Facebook' },
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
];

export function Footer() {
  const siteConfig = useSiteSettings();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-deep-black text-pure-white" role="contentinfo">
      <div className="container-custom py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 md:gap-16">
          <div>
            <Link href="/" className="block mb-6" aria-label="ICG Home">
              <span className="text-3xl md:text-4xl font-heading font-light tracking-tight">
                ICG
              </span>
            </Link>
            <p className="text-light-grey text-base md:text-lg max-w-xs mb-8 leading-relaxed">
              {siteConfig.company_tagline} ICG is Lahore&apos;s premier real estate and construction group,
              delivering exceptional properties and landmark developments.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 flex items-center justify-center border border-light-grey/30 hover:border-gold-accent hover:bg-gold-accent/10 transition-all duration-300"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5 text-light-grey hover:text-gold-accent transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-light-grey mb-5">
            Contact
          </h3>
            <ul className="space-y-4 text-light-grey" role="list">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <address className="not-italic text-base leading-relaxed max-w-xs">
                  {siteConfig.address}
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <a href={`tel:${siteConfig.phone}`} className="hover:text-pure-white transition-colors">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-pure-white transition-colors">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Send className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={`https://wa.me/${siteConfig.whatsapp_business_number.replace(/\D/g, '')}`}
                  className="hover:text-pure-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp: {siteConfig.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-charcoal">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-medium-grey text-sm">
              © 2026 {siteConfig.company_name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-medium-grey">
              <Link href="/privacy" className="hover:text-pure-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-pure-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-pure-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}