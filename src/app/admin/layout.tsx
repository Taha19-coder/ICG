'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, Settings, LogOut, Menu, X, Building, Mail, LayoutDashboard, Globe2, Camera, Briefcase, MessageCircle, MapPin, Phone, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/projects', label: 'Projects', icon: Building },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const isNavItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    let active = true;
    const verifyAuthentication = async () => {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' });
        if (!response.ok) {
          router.push('/admin/login?redirect=' + pathname);
          return;
        }
        const result = await response.json() as { user?: { email: string; name: string } };
        if (!result.user) throw new Error('The server returned an invalid admin session.');
        if (active) setAdminUser(result.user);
      } catch (error) {
        if (active) {
          setAuthError(error instanceof Error ? error.message : 'Could not verify admin session.');
        }
      } finally {
        if (active) setCheckingAuth(false);
      }
    };
    void verifyAuthentication();
    return () => { active = false; };
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      setAdminUser(null);
      router.push('/admin/login');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign out.');
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-pure-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-deep-black mb-4 animate-spin" aria-hidden="true" />
          <p className="text-medium-grey">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }
  const user = adminUser;

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-pure-white lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile admin navigation"
          >
            <div className="flex flex-col h-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-2xl font-heading font-light text-deep-black">ICG Admin</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-deep-black"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1" aria-label="Admin navigation">
                <ul className="space-y-2" role="list">
                  {adminNavItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded text-lg font-medium transition-colors',
                          isNavItemActive(pathname, item.href)
                            ? 'bg-deep-black text-pure-white'
                            : 'text-charcoal hover:bg-light-grey hover:text-deep-black'
                        )}
                      >
                        <item.icon className="w-6 h-6" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="pt-6 border-t border-light-grey">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-6 h-6" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-deep-black text-pure-white transform transition-transform duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-charcoal">
            <Link href="/admin/dashboard" className="flex items-center gap-3" aria-label="ICG Admin Home">
              <Building2 className="w-8 h-8 text-pure-white" aria-hidden="true" />
              <span className="text-xl font-heading font-light">ICG Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isNavItemActive(pathname, item.href)
                    ? 'bg-charcoal text-pure-white'
                    : 'text-pure-white/70 hover:bg-charcoal hover:text-pure-white'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-charcoal">
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center">
                <Building2 className="w-5 h-5 text-pure-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-pure-white truncate">{user.name || 'Admin User'}</p>
                <p className="text-xs text-pure-white/50 truncate">{user.email || 'admin@icg.com.pk'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-pure-white/70 hover:text-pure-white hover:bg-charcoal rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 bg-pure-white border-b border-light-grey lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-deep-black"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-heading font-medium text-deep-black">ICG Admin</span>
            <div className="w-10" />
          </div>
        </header>

        <header className="hidden lg:sticky lg:top-0 lg:z-20 bg-pure-white border-b border-light-grey">
          <div className="flex items-center justify-between h-16 px-8">
            <h1 className="text-xl font-heading font-medium text-deep-black">
              {adminNavItems.find(item => isNavItemActive(pathname, item.href))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-medium-grey">{user.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-medium-grey hover:text-deep-black transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8" role="main">
          {authError && <p className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{authError}</p>}
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-deep-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <footer className="bg-deep-black text-pure-white mt-auto">
        <div className="container-custom py-8 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div>
              <Link
                href="/admin/dashboard"
                className="block mb-4" aria-label="ICG Admin Home"
              >
                <span className="text-3xl md:text-4xl font-heading font-light tracking-tight text-pure-white">
                  ICG
                </span>
              </Link>
              <p className="text-light-grey text-base md:text-lg max-w-xs leading-relaxed">
                Building Spaces Creating Value ICG is Lahore&apos;s premier real estate and construction group,
                delivering exceptional properties and landmark developments.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-light-grey/30 hover:border-gold-accent hover:bg-gold-accent/10 transition-all duration-300"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe2 className="w-5 h-5 text-light-grey hover:text-gold-accent transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-light-grey/30 hover:border-gold-accent hover:bg-gold-accent/10 transition-all duration-300"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Camera className="w-5 h-5 text-light-grey hover:text-gold-accent transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-light-grey/30 hover:border-gold-accent hover:bg-gold-accent/10 transition-all duration-300"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Briefcase className="w-5 h-5 text-light-grey hover:text-gold-accent transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-light-grey/30 hover:border-gold-accent hover:bg-gold-accent/10 transition-all duration-300"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 text-light-grey hover:text-gold-accent transition-colors" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-light-grey mb-5">Contact</h3>
              <ul className="space-y-4 text-light-grey" role="list">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <address className="not-italic text-base leading-relaxed max-w-xs">
                    123 Main Boulevard, Gulberg III, Lahore, Pakistan
                  </address>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <a href="tel:+9242111424424" className="hover:text-gold-accent transition-colors">
                    +92 42 111 424 424
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <a href="mailto:info@icg.com.pk" className="hover:text-gold-accent transition-colors">
                    info@icg.com.pk
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Send className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="https://wa.me/923001234567"
                    className="hover:text-gold-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp: +92 300 43242532
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-charcoal">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-medium-grey text-sm">
                © 2026 ICG — Investment and Construction Group. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-medium-grey">
                <Link href="/admin/dashboard" className="hover:text-pure-white transition-colors">Dashboard</Link>
                <Link href="/admin/settings" className="hover:text-pure-white transition-colors">Settings</Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-gold-accent transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}