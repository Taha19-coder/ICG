-- ICG Website Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN (
    'house', 'apartment', 'penthouse', 'farmhouse',
    'residential_plot', 'commercial_property', 'commercial_plot'
  )),
  purpose TEXT NOT NULL CHECK (purpose IN ('buy', 'rent')),
  price BIGINT NOT NULL,
  location TEXT NOT NULL,
  society TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  kitchens INTEGER NOT NULL DEFAULT 0,
  floors INTEGER NOT NULL DEFAULT 0,
  covered_area INTEGER NOT NULL DEFAULT 0,
  plot_size INTEGER NOT NULL DEFAULT 0,
  area_unit TEXT NOT NULL DEFAULT 'sqft' CHECK (area_unit IN ('sqft', 'sqyd', 'marla', 'kanal')),
  parking INTEGER NOT NULL DEFAULT 0,
  furnishing_status TEXT NOT NULL DEFAULT 'unfurnished' CHECK (furnishing_status IN ('furnished', 'semi_furnished', 'unfurnished')),
  features TEXT[] NOT NULL DEFAULT '{}',
  nearby_landmarks TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Property images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Construction projects table
CREATE TABLE construction_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('ongoing', 'completed', 'upcoming')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  expected_completion_date DATE,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  payment_plan TEXT,
  available_units INTEGER NOT NULL DEFAULT 0,
  total_units INTEGER NOT NULL DEFAULT 0,
  reference_id TEXT NOT NULL UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project images table
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN (
    'buying', 'renting', 'selling', 'construction', 'investment', 'general'
  )),
  message TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  project_id UUID REFERENCES construction_projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Site configuration table
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_society ON properties(society);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_purpose ON properties(purpose);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX idx_projects_status ON construction_projects(status);
CREATE INDEX idx_projects_published ON construction_projects(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_projects_created_at ON construction_projects(created_at DESC);

CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_project_images_primary ON project_images(project_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_type ON inquiries(inquiry_type);
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_project_id ON inquiries(project_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Row Level Security Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view property images for published properties" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.status = 'published'
    )
  );

CREATE POLICY "Public can view published projects" ON construction_projects
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can view project images for published projects" ON project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM construction_projects
      WHERE construction_projects.id = project_images.project_id
      AND construction_projects.is_published = TRUE
    )
  );

-- Public can submit inquiries
CREATE POLICY "Public can submit inquiries" ON inquiries
  FOR INSERT WITH CHECK (TRUE);

-- Admin full access (using service role key)
CREATE POLICY "Admin full access to properties" ON properties
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to property_images" ON property_images
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to projects" ON construction_projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to project_images" ON project_images
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to inquiries" ON inquiries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access to site_config" ON site_config
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON construction_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default site configuration
INSERT INTO site_config (key, value, description) VALUES
('company_name', '"ICG — Investment and Construction Group"', 'Company name displayed on website'),
('company_tagline', '"Building Spaces. Creating Value"', 'Company tagline'),
('phone', '"+92 42 111 424 424"', 'Business phone number'),
('whatsapp', '"+92 300 1234567"', 'WhatsApp business number'),
('email', '"info@icg.com.pk"', 'Business email address'),
('address', '"123 Main Boulevard, Gulberg III, Lahore, Pakistan"', 'Office address'),
('google_maps_url', '"https://maps.google.com/?q=ICG+Investment+Construction+Group+Lahore"', 'Google Maps embed URL'),
('whatsapp_business_number', '"+92 300 1234567"', 'WhatsApp Business API number'),
('session_timeout', '60', 'Admin session timeout in minutes'),
('social_links', '{"facebook": "", "instagram": "", "linkedin": "", "twitter": ""}', 'Social media URLs');

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES
('property-images', 'property-images', true),
('project-images', 'project-images', true);

-- Storage policies for property images
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admin can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'service_role');

CREATE POLICY "Admin can update property images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'property-images' AND auth.role() = 'service_role');

CREATE POLICY "Admin can delete property images" ON storage.objects
  FOR DELETE USING (bucket_id = 'property-images' AND auth.role() = 'service_role');

-- Storage policies for project images
CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Admin can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'service_role');

CREATE POLICY "Admin can update project images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-images' AND auth.role() = 'service_role');

CREATE POLICY "Admin can delete project images" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images' AND auth.role() = 'service_role');