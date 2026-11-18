import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero';
import { CategorySections } from '@/components/sections/category-sections';
import { FeaturedProperties } from '@/components/sections/featured-properties';
import { OngoingProjects } from '@/components/sections/ongoing-projects';
import { WhyChooseICG } from '@/components/sections/why-choose-icg';
import { OurApproach } from '@/components/sections/our-approach';
import { AboutPreview } from '@/components/sections/about-preview';
import { ContactCTA } from '@/components/sections/contact-cta';

export const metadata: Metadata = {
  title: 'Building Spaces. Creating Value.',
  description: 'Discover exceptional properties and development opportunities with Investment and Construction Group. Premium real estate, construction projects, and investment opportunities across Lahore, Pakistan.',
};

export default function HomePage() {
  return (
    <div className="page-transition">
      <HeroSection />
      <CategorySections />
      <FeaturedProperties />
      <OngoingProjects />
      <WhyChooseICG />
      <OurApproach />
      <AboutPreview />
      <ContactCTA />
    </div>
  );
}