import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LoadingScreen } from '@/components/ui/loading-screen';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ICG — Investment and Construction Group | Premium Real Estate & Development Lahore',
    template: '%s | ICG',
  },
  description: 'Discover exceptional properties and development opportunities with Investment and Construction Group. Premium real estate, construction projects, and investment opportunities across Lahore, Pakistan.',
  keywords: ['real estate Lahore', 'property investment Pakistan', 'construction companies Lahore', 'DHA Lahore properties', 'Bahria Town properties', 'luxury villas Lahore', 'commercial property Lahore'],
  authors: [{ name: 'ICG - Investment and Construction Group' }],
  creator: 'ICG',
  publisher: 'ICG',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://icg.com.pk',
    siteName: 'ICG - Investment and Construction Group',
    title: 'ICG — Investment and Construction Group',
    description: 'Discover exceptional properties and development opportunities with Investment and Construction Group.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ICG - Investment and Construction Group',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ICG — Investment and Construction Group',
    description: 'Discover exceptional properties and development opportunities with Investment and Construction Group.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0F11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-pure-white text-deep-black antialiased">
        <Providers>
          <LoadingScreen />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}