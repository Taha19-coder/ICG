# ICG — Investment and Construction Group Website

A premium, modern, fully responsive real estate and construction website for ICG (Investment and Construction Group), Lahore, Pakistan.

## Features

- **Multi-page website**: Home, Properties, Property Details, Projects, Project Details, About, Contact, Admin Dashboard
- **Premium Design**: Luxury architectural aesthetic with black, grey, and white color palette
- **Property Discovery**: Search, filter, and sort properties by Lahore societies
- **Construction Projects**: Showcase ongoing, completed, and upcoming developments
- **Admin Dashboard**: Database-backed management of properties and construction projects
- **WhatsApp Integration**: Direct inquiry via WhatsApp with property/project context
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **SEO Ready**: Meta tags, Open Graph, sitemap, robots.txt
- **Supabase Backend**: Database, authentication, and storage ready

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Server-validated admin login with HTTP-only sessions
- **Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd icg-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with Supabase and admin credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_unique_strong_password
ADMIN_SESSION_SECRET=your_long_random_secret
```

Keep the service-role key and admin credentials server-side. Never prefix them with `NEXT_PUBLIC_`.

5. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the contents of `supabase-schema.sql`

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

### Admin Access

- URL: `/admin/login`
- Credentials are read from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Property and construction-project records are stored in Supabase; uploaded images use the configured public storage buckets.

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── dashboard/         # Overview dashboard
│   │   ├── properties/        # Property management
│   │   ├── projects/          # Project management
│   │   ├── inquiries/         # Inquiry management
│   │   ├── settings/          # Site settings
│   │   └── login/             # Admin authentication
│   ├── api/
│   │   └── inquiries/         # Inquiry submission API
│   ├── properties/
│   │   ├── page.tsx           # Properties listing
│   │   └── [id]/page.tsx      # Property detail
│   ├── projects/
│   │   ├── page.tsx           # Projects listing
│   │   └── [id]/page.tsx      # Project detail
│   ├── about/page.tsx         # About page
│   ├── contact/page.tsx       # Contact page
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── sitemap.ts             # Sitemap generation
│   └── robots.ts              # Robots.txt
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── sections/              # Homepage sections
│   ├── ui/                    # Reusable UI components
│   └── providers.tsx          # Context providers
├── lib/
│   ├── demo-data.ts           # Demo data for development
│   ├── supabase.ts            # Supabase client
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utility functions
└── supabase-schema.sql        # Database schema
```

## Customization

### Colors

Edit `src/app/globals.css` to customize the color palette:

```css
@theme {
  --color-deep-black: #0E0F11;
  --color-charcoal: #292B2E;
  --color-medium-grey: #6E7378;
  --color-light-grey: #DCDDDE;
  --color-off-white: #F2F2F0;
  --color-pure-white: #FFFFFF;
}
```

### Site Configuration

Update site settings in the admin dashboard at `/admin/settings` or modify the default values in `supabase-schema.sql`.

### Demo Data

Replace demo data in `src/lib/demo-data.ts` with real data from your Supabase database.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Setup

1. Create a new Supabase project
2. Run the schema from `supabase-schema.sql`
3. Enable Storage and create buckets: `property-images`, `project-images`
4. Configure RLS policies
5. Add Supabase URL and keys to environment variables

## Admin Dashboard Features

- **Dashboard**: Overview stats, recent properties, projects, and inquiries
- **Properties**: CRUD operations, image upload, filtering, status management
- **Projects**: CRUD operations, progress tracking, unit management
- **Inquiries**: View, respond, status updates (new/contacted/resolved)
- **Settings**: General, contact, social, notifications, security

## SEO Features

- Dynamic meta tags per page
- Open Graph and Twitter cards
- Sitemap.xml generation
- Robots.txt
- Semantic HTML structure
- Proper heading hierarchy
- Image alt texts

## Performance

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Framer Motion animations respect `prefers-reduced-motion`
- Optimized bundle with `optimizePackageImports`

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- ARIA labels and roles
- Focus management
- Color contrast ratios
- Reduced motion support

## License

Private - All rights reserved by ICG - Investment and Construction Group.