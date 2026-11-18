'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/projects', label: 'Construction Projects' },
  { href: '/contact', label: 'Contact' },
];

function ThemeToggleButton() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('icg-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Unable to save the theme preference.', error);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full p-2 text-pure-white transition-colors hover:bg-pure-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pure-white"
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
    >
      <Moon className="theme-icon-dark w-5 h-5" aria-hidden="true" />
      <Sun className="theme-icon-light hidden w-5 h-5" aria-hidden="true" />
    </button>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const siteConfig = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

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
        className="fixed top-3 left-0 right-0 z-50 px-3 md:top-4 md:px-6"
      >
        <nav
          className={cn(
            'mx-auto max-w-7xl rounded-full border backdrop-blur-lg transition-all duration-300',
            isScrolled
              ? 'border-pure-white/20 bg-deep-black/70 shadow-xl'
              : 'border-pure-white/15 bg-deep-black/45 shadow-lg'
          )}
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-16 px-5 md:px-7">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl md:text-3xl font-heading font-light tracking-tight text-pure-white hover:opacity-80 transition-opacity"
              aria-label="ICG Home"
            >
              <span className="font-semibold">ICG</span>
              <span className="hidden sm:inline text-pure-white/75 font-normal text-base">
                {siteConfig.company_name.replace(/^ICG\s*[—-]\s*/, '')}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 lg:gap-9">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-2 text-sm font-medium transition-colors duration-200',
                    pathname === item.href
                      ? 'text-pure-white'
                      : 'text-pure-white/75 hover:text-pure-white'
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggleButton />
              <button
                className="md:hidden p-2 text-pure-white"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
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
            className="fixed inset-0 z-40 bg-deep-black/95 text-pure-white backdrop-blur-xl md:hidden"
            onClick={closeMobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col h-full p-8 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <Link
                  href="/"
                  className="text-3xl font-heading font-light tracking-tight text-pure-white"
                  onClick={closeMobileMenu}
                >
                  ICG
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-pure-white"
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
                          pathname === item.href ? 'text-pure-white' : 'text-pure-white/70 hover:text-pure-white'
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

              </nav>

              <div className="mt-8 space-y-4 text-pure-white/65 text-sm">
                <p>{siteConfig.company_name}</p>
                <p>{siteConfig.address}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}