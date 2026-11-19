'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Home, Mail, Plus, ArrowRight, Eye } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useCatalogData } from '@/hooks/use-catalog-data';
import type { Inquiry, InquiryType } from '@/lib/types';

type DashboardInquiry = Inquiry & { property_title: string | null; project_title: string | null };

const statusColors: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-700',
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const typeLabels: Record<InquiryType, string> = {
  buying: 'Buying',
  renting: 'Renting',
  selling: 'Selling',
  construction: 'Construction',
  investment: 'Investment',
  general: 'General',
};

export default function AdminDashboardPage() {
  const { properties, projects, isLoading, error } = useCatalogData(true);
  const [recentInquiries, setRecentInquiries] = useState<DashboardInquiry[]>([]);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [inquiryError, setInquiryError] = useState('');
  useEffect(() => {
    let active = true;
    const loadInquiries = async () => {
      try {
        const response = await fetch('/api/admin/inquiries', { cache: 'no-store' });
        const result = await response.json() as { inquiries?: DashboardInquiry[]; message?: string };
        if (!response.ok) throw new Error(result.message || 'Inquiries could not be loaded.');
        if (active) {
          setRecentInquiries((result.inquiries || []).slice(0, 5));
          setInquiryCount(result.inquiries?.length || 0);
          setInquiryError('');
        }
      } catch (loadError) {
        if (active) setInquiryError(loadError instanceof Error ? loadError.message : 'Inquiries could not be loaded.');
      }
    };
    void loadInquiries();
    return () => { active = false; };
  }, []);

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/properties' },
    { label: 'Active Listings', value: properties.filter(property => property.status === 'published').length, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/properties' },
    { label: 'Total Projects', value: projects.length, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/projects' },
    { label: 'Ongoing Projects', value: projects.filter(project => project.status === 'ongoing').length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/projects' },
    { label: 'Completed Projects', value: projects.filter(project => project.status === 'completed').length, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/projects' },
    { label: 'Recent Inquiries', value: inquiryCount, icon: Mail, color: 'text-red-600', bg: 'bg-red-50', href: '/admin/inquiries' },
  ];
  const recentProperties = properties.slice(0, 5);
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-black">Dashboard</h1>
          <p className="text-medium-grey mt-1">Overview of your properties, projects, and inquiries</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/properties" className="btn-secondary">
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Property
          </Link>
          <Link href="/admin/projects" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Construction
          </Link>
        </div>
      </div>

      {error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      {inquiryError && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{inquiryError}</p>}
      {isLoading && <p className="text-sm text-medium-grey" role="status">Loading dashboard data...</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn('card p-6', stat.bg)}
          >
            <Link href={stat.href} className="block">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-deep-black">{stat.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-current/20 flex items-center justify-between">
                <span className="text-sm text-medium-grey">View details</span>
                <ArrowRight className={cn('w-4 h-4', stat.color)} aria-hidden="true" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="p-6 border-b border-light-grey flex items-center justify-between">
            <h2 className="text-xl font-heading font-medium text-deep-black">Recent Properties</h2>
            <Link href="/admin/properties" className="text-sm font-medium text-deep-black hover:text-charcoal transition-colors">
              View All
              <ArrowRight className="w-4 h-4 ml-1 inline" aria-hidden="true" />
            </Link>
          </div>
          <div className="divide-y divide-light-grey">
            {recentProperties.map((property) => (
              <Link
                key={property.id}
                href={`/admin/properties/${property.id}`}
                className="block p-4 hover:bg-off-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                    <img src={property.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-deep-black truncate">{property.title}</h3>
                    <p className="text-sm text-medium-grey">{property.society}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-deep-black">{formatPrice(property.price)}</p>
                    <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded', statusColors[property.status])}>
                      {property.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <div className="p-6 border-b border-light-grey flex items-center justify-between">
            <h2 className="text-xl font-heading font-medium text-deep-black">Recent Projects</h2>
            <Link href="/admin/projects" className="text-sm font-medium text-deep-black hover:text-charcoal transition-colors">
              View All
              <ArrowRight className="w-4 h-4 ml-1 inline" aria-hidden="true" />
            </Link>
          </div>
          <div className="divide-y divide-light-grey">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block p-4 hover:bg-off-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                    <img src={project.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-deep-black truncate">{project.title}</h3>
                    <p className="text-sm text-medium-grey">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded', statusColors[project.status])}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <p className="text-sm text-medium-grey mt-1">{project.progress_percentage}% Complete</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <div className="p-6 border-b border-light-grey flex items-center justify-between">
          <h2 className="text-xl font-heading font-medium text-deep-black">Recent Inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-medium text-deep-black hover:text-charcoal transition-colors">
            View All
            <ArrowRight className="w-4 h-4 ml-1 inline" aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-light-grey">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Inquiry</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Related</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-medium-grey">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-grey">
              {recentInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-off-white transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-deep-black">{inquiry.name}</p>
                    <p className="text-sm text-medium-grey">{inquiry.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-medium-grey">{inquiry.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-light-grey text-charcoal rounded">
                      {typeLabels[inquiry.inquiry_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-medium-grey">{inquiry.property_title || inquiry.project_title || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-block px-2 py-1 text-xs font-medium rounded', statusColors[inquiry.status])}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-grey">{formatDate(inquiry.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                    <Link href="/admin/inquiries" className="p-2 text-medium-grey hover:text-deep-black transition-colors" aria-label="View inquiries">
                        <Eye className="w-4 h-4" />
                    </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}