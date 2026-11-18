export type PropertyType =
  | 'house'
  | 'apartment'
  | 'penthouse'
  | 'farmhouse'
  | 'residential_plot'
  | 'commercial_property'
  | 'commercial_plot';

export type PropertyPurpose = 'buy' | 'rent';

export type PropertyStatus = 'published' | 'draft' | 'archived';

export type ProjectStatus = 'ongoing' | 'completed' | 'upcoming';

export type InquiryStatus = 'new' | 'contacted' | 'resolved';

export type InquiryType =
  | 'buying'
  | 'renting'
  | 'selling'
  | 'construction'
  | 'investment'
  | 'general';

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  location: string;
  society: string;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  floors: number;
  covered_area: number;
  plot_size: number;
  area_unit: 'sqft' | 'sqyd' | 'marla' | 'kanal';
  parking: number;
  furnishing_status: 'furnished' | 'semi_furnished' | 'unfurnished';
  features: string[];
  nearby_landmarks: string[];
  status: PropertyStatus;
  is_featured: boolean;
  reference_id: string;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ConstructionProject {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  status: ProjectStatus;
  progress_percentage: number;
  expected_completion_date: string | null;
  key_features: string[];
  payment_plan: string | null;
  available_units: number;
  total_units: number;
  reference_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images: ProjectImage[];
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  inquiry_type: InquiryType;
  message: string;
  property_id: string | null;
  project_id: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager';
  created_at: string;
  last_login: string | null;
}

export interface SiteConfig {
  company_name: string;
  company_tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string;
  whatsapp_business_number: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export const LAHORE_SOCIETIES = [
  'DHA Lahore',
  'Bahria Town Lahore',
  'Gulberg',
  'Model Town',
  'Johar Town',
  'Askari',
  'Lake City',
  'Valencia Town',
  'Raiwind Road',
  'Other Lahore Locations',
] as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'residential_plot', label: 'Residential Plot' },
  { value: 'commercial_property', label: 'Commercial Property' },
  { value: 'commercial_plot', label: 'Commercial Plot' },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
];

export const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: 'buying', label: 'Buying a Property' },
  { value: 'renting', label: 'Renting a Property' },
  { value: 'selling', label: 'Selling a Property' },
  { value: 'construction', label: 'Construction Project' },
  { value: 'investment', label: 'Investment Inquiry' },
  { value: 'general', label: 'General Inquiry' },
];

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

export interface PropertyFilters {
  society?: string;
  property_type?: PropertyType;
  purpose?: PropertyPurpose;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  sort?: SortOption;
  page?: number;
  limit?: number;
}