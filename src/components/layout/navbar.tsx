'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/projects', label: 'Construction Projects' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-pure-white/95 backdrop-blur-md shadow-sm border-b border-light-grey'
            : 'bg-transparent'
        )}
      >
        <nav className="container-custom" aria-label="Main navigation">
          <div className="flex items-center justify-between h-20 md:h-24">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black hover:opacity-80 transition-opacity"
              aria-label="ICG Home"
            >
              <span className="font-semibold">ICG</span>
              <span className="hidden sm:inline text-medium-grey font-normal text-base">Investment & Construction Group</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-2 text-sm font-medium transition-colors duration-200',
                    pathname === item.href
                      ? 'text-deep-black'
                      : 'text-charcoal hover:text-deep-black'
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-deep-black"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/properties"
                className="btn-primary text-sm px-6 py-2.5"
              >
                Explore Properties
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-deep-black"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-pure-white md:hidden"
            onClick={closeMobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col h-full p-8 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <Link
                  href="/"
                  className="text-3xl font-heading font-light tracking-tight text-deep-black"
                  onClick={closeMobileMenu}
                >
                  ICG
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-deep-black"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <nav className="flex-1" aria-label="Mobile navigation">
                <ul className="space-y-6">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'block text-2xl font-heading font-light tracking-tight transition-colors duration-200',
                          pathname === item.href ? 'text-deep-black' : 'text-charcoal hover:text-deep-black'
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 pt-8 border-t border-light-grey">
                  <Link
                    href="/properties"
                    onClick={closeMobileMenu}
                    className="btn-primary w-full text-center py-4 text-lg"
                  >
                    Explore Properties
                  </Link>
                </div>
              </nav>

              <div className="mt-8 space-y-4 text-medium-grey text-sm">
                <p>ICG — Investment and Construction Group</p>
                <p>Lahore, Pakistan</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}