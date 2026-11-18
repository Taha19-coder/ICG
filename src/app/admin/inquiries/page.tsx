'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Trash2, Mail, Phone, MapPin, Building2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Inquiry, InquiryStatus, InquiryType } from '@/lib/types';

type AdminInquiry = Inquiry & {
  property_title: string | null;
  project_title: string | null;
};

const statusColors: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const typeLabels: Record<InquiryType, string> = {
  buying: 'Buying a Property',
  renting: 'Renting a Property',
  selling: 'Selling a Property',
  construction: 'Construction Project',
  investment: 'Investment Inquiry',
  general: 'General Inquiry',
};

const typeIcons: Record<InquiryType, React.ComponentType<{ className?: string }>> = {
  buying: MapPin,
  renting: MapPin,
  selling: MapPin,
  construction: Building2,
  investment: Building2,
  general: Mail,
};

const inquiriesPerPage = 4;

function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>, setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'new' | 'contacted' | 'resolved'>>) {
  const value = e.target.value;
  if (value === 'all' || value === 'new' || value === 'contacted' || value === 'resolved') {
    setStatusFilter(value);
  }
}

function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>, setTypeFilter: React.Dispatch<React.SetStateAction<string>>) {
  const value = e.target.value;
  const validTypes = ['all', 'buying', 'renting', 'selling', 'construction', 'investment', 'general'];
  if (validTypes.includes(value)) {
    setTypeFilter(value);
  }
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    const loadInquiries = async () => {
      try {
        const response = await fetch('/api/admin/inquiries', { cache: 'no-store' });
        const result = await response.json() as { inquiries?: AdminInquiry[]; message?: string };
        if (!response.ok) throw new Error(result.message || 'Inquiries could not be loaded.');
        if (active) {
          setInquiries(result.inquiries || []);
          setLoadError('');
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Inquiries could not be loaded.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadInquiries();
    return () => { active = false; };
  }, []);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inquiry => {
      const matchesSearch = inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.phone.includes(searchQuery) ||
        inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.inquiry_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (inquiry.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
      const matchesType = typeFilter === 'all' || inquiry.inquiry_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [inquiries, searchQuery, statusFilter, typeFilter]);

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all';
  const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * inquiriesPerPage,
    currentPage * inquiriesPerPage
  );
  const firstVisibleInquiry = filteredInquiries.length === 0
    ? 0
    : (currentPage - 1) * inquiriesPerPage + 1;
  const lastVisibleInquiry = Math.min(currentPage * inquiriesPerPage, filteredInquiries.length);

  const updateInquiryStatus = async (inquiry: AdminInquiry, status: InquiryStatus) => {
    setActionError('');
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiry.id, status }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Inquiry status could not be updated.');
      setInquiries(current => current.map(item => item.id === inquiry.id ? { ...item, status } : item));
      setSelectedInquiry(current => current?.id === inquiry.id ? { ...current, status } : current);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Inquiry status could not be updated.');
    }
  };

  const deleteInquiry = async (inquiry: AdminInquiry) => {
    if (!window.confirm(`Delete the inquiry from ${inquiry.name}? This cannot be undone.`)) return;
    setActionError('');
    try {
      const response = await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inquiry.id }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Inquiry could not be deleted.');
      setInquiries(current => current.filter(item => item.id !== inquiry.id));
      setSelectedInquiry(current => current?.id === inquiry.id ? null : current);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Inquiry could not be deleted.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-black">Inquiries</h1>
          <p className="text-medium-grey mt-1">Manage and respond to customer inquiries</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-medium-grey">
          <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColors.new)}>New</span>
          <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColors.contacted)}>Contacted</span>
          <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColors.resolved)}>Resolved</span>
        </div>
      </div>

      <div className="card">
        {loadError && <p className="m-6 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{loadError}</p>}
        {actionError && <p className="mx-6 mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{actionError}</p>}
        <div className="p-6 border-b border-light-grey">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-grey" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="input-field pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn('btn-secondary whitespace-nowrap', hasActiveFilters && 'border-deep-black text-deep-black')}
            >
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Filters
              {hasActiveFilters && <span className="ml-2 px-2 py-0.5 text-xs bg-deep-black text-pure-white rounded">2</span>}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <select
                value={statusFilter}
                onChange={e => {
                  setCurrentPage(1);
                  handleStatusChange(e, setStatusFilter);
                }}
                className="input-field appearance-none select-arrow pr-10"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => {
                  setCurrentPage(1);
                  handleTypeChange(e, setTypeFilter);
                }}
                className="input-field appearance-none select-arrow pr-10"
              >
                <option value="all">All Types</option>
                <option value="buying">Buying a Property</option>
                <option value="renting">Renting a Property</option>
                <option value="selling">Selling a Property</option>
                <option value="construction">Construction Project</option>
                <option value="investment">Investment Inquiry</option>
                <option value="general">General Inquiry</option>
              </select>

              <button
                onClick={() => {
                  setCurrentPage(1);
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-light-grey bg-off-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Related</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Message Preview</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-medium-grey">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-medium-grey">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-grey">
              {paginatedInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-off-white transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-deep-black">{inquiry.name}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-medium-grey">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" aria-hidden="true" />{inquiry.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" aria-hidden="true" />{inquiry.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-light-grey text-charcoal rounded">
                      {(() => {
                      const Icon = typeIcons[inquiry.inquiry_type] || Mail;
                        return <Icon className="w-3 h-3" aria-hidden="true" />;
                      })()}
                    {typeLabels[inquiry.inquiry_type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-grey">
                    {inquiry.property_title || inquiry.project_title || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-medium-grey line-clamp-2 max-w-xs">{inquiry.message}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={inquiry.status}
                      onChange={e => updateInquiryStatus(inquiry, e.target.value as InquiryStatus)}
                      className={cn('px-2 py-1 text-xs font-medium rounded border', statusColors[inquiry.status], 'border-transparent bg-transparent appearance-none cursor-pointer')}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-grey">{formatDate(inquiry.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="p-2 text-medium-grey hover:text-deep-black transition-colors"
                        aria-label="View inquiry details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteInquiry(inquiry)} className="p-2 text-medium-grey hover:text-red-600 transition-colors" aria-label={`Delete inquiry from ${inquiry.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-medium-grey" role="status">Loading inquiries...</div>
        ) : filteredInquiries.length === 0 && !loadError && (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-light-grey mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No Inquiries Found</h3>
            <p className="text-medium-grey mb-4">
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No customer inquiries have been received yet.'}
            </p>
          </div>
        )}

        <div className="p-6 border-t border-light-grey flex items-center justify-between">
          <p className="text-sm text-medium-grey">
            Showing <span className="font-medium text-deep-black">{firstVisibleInquiry}–{lastVisibleInquiry}</span> of <span className="font-medium text-deep-black">{filteredInquiries.length}</span> matching inquiries
          </p>
          {totalPages > 1 && (
            <nav className="flex gap-2" aria-label="Inquiry result pages">
              <button
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                <button
                  key={page}
                  className={cn(
                    'px-4 py-2',
                    currentPage === page ? 'btn-primary' : 'btn-secondary'
                  )}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>

      {selectedInquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-black/50"
          onClick={() => setSelectedInquiry(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Inquiry details"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-pure-white rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-light-grey flex items-center justify-between sticky top-0 bg-pure-white z-10">
              <h2 className="text-xl font-heading font-medium text-deep-black">Inquiry Details</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-medium-grey hover:text-deep-black transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-heading font-medium text-deep-black">{selectedInquiry.name}</h3>
                    <span className={cn('px-2 py-1 text-xs font-medium rounded', statusColors[selectedInquiry.status])}>
                      {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-medium-grey">
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" aria-hidden="true" />{selectedInquiry.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" aria-hidden="true" />{selectedInquiry.phone}</span>
                  </div>
                </div>
                <span className="text-xs text-medium-grey font-mono">{selectedInquiry.id}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-light-grey">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-medium-grey block mb-1">Inquiry Type</label>
                  <p className="text-deep-black">{typeLabels[selectedInquiry.inquiry_type]}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-medium-grey block mb-1">Date</label>
                  <p className="text-deep-black">{formatDate(selectedInquiry.created_at)}</p>
                </div>
                {selectedInquiry.property_title && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-medium-grey block mb-1">Property</label>
                    <p className="text-deep-black">{selectedInquiry.property_title}</p>
                  </div>
                )}
                {selectedInquiry.project_title && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-medium-grey block mb-1">Project</label>
                    <p className="text-deep-black">{selectedInquiry.project_title}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-light-grey">
                <label className="text-xs font-medium uppercase tracking-wider text-medium-grey block mb-2">Message</label>
                <div className="bg-off-white p-4 rounded whitespace-pre-line text-medium-grey leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-light-grey">
                <a href={`mailto:${selectedInquiry.email}`} className="btn-primary flex-1 text-center">Reply via Email</a>
                <a href={`tel:${selectedInquiry.phone}`} className="btn-whatsapp flex-1">
                  <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                  Call
                </a>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => updateInquiryStatus(selectedInquiry, 'resolved')}
                  disabled={selectedInquiry.status === 'resolved'}
                >
                  {selectedInquiry.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}