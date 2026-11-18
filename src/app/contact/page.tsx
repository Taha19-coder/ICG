'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Phone, Mail, Send, Building2, Home, CheckCircle, AlertCircle, Loader2, MapPin as MapPinIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  inquiry_type: z.enum(['buying', 'renting', 'selling', 'construction', 'investment', 'general']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  property_id: z.string().optional(),
  project_id: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

const inquiryTypes = [
  { value: 'buying', label: 'Buying a Property', icon: Home },
  { value: 'renting', label: 'Renting a Property', icon: Home },
  { value: 'selling', label: 'Selling a Property', icon: Home },
  { value: 'construction', label: 'Construction Project', icon: Building2 },
  { value: 'investment', label: 'Investment Inquiry', icon: Building2 },
  { value: 'general', label: 'General Inquiry', icon: MapPin },
];

function ContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteConfig = useSiteSettings();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const defaultValues: InquiryFormData = {
    name: '',
    phone: '',
    email: '',
    inquiry_type: 'general',
    message: '',
    property_id: searchParams.get('property') || undefined,
    project_id: searchParams.get('project') || undefined,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues,
  });

  const inquiryType = watch('inquiry_type');

  const onSubmit = async (data: InquiryFormData) => {
    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit inquiry');
      }

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-pure-white page-transition">
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-deep-black text-pure-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light tracking-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-light-grey text-lg leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-off-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-8">
                Contact Information
              </h2>
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-deep-black text-pure-white flex-shrink-0">
                    <MapPinIcon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-black mb-1">Office Address</h3>
                    <address className="text-medium-grey not-italic leading-relaxed">{siteConfig.address}</address>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-deep-black text-pure-white flex-shrink-0">
                    <Phone className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-black mb-1">Phone</h3>
                    <a href={`tel:${siteConfig.phone}`} className="text-medium-grey hover:text-deep-black transition-colors block mb-1">{siteConfig.phone}</a>
                    <a href={`https://wa.me/${siteConfig.whatsapp_business_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-medium-grey hover:text-deep-black transition-colors flex items-center gap-1">
                      <Send className="w-4 h-4" aria-hidden="true" />
                      WhatsApp: {siteConfig.whatsapp}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-deep-black text-pure-white flex-shrink-0">
                    <Mail className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-black mb-1">Email</h3>
                    <a href={`mailto:${siteConfig.email}`} className="text-medium-grey hover:text-deep-black transition-colors">{siteConfig.email}</a>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-light-grey">
                <h3 className="font-semibold text-deep-black mb-4">Business Hours</h3>
                <dl className="space-y-3 text-medium-grey" role="list">
                  <div className="flex justify-between">
                    <dt>Monday - Friday</dt>
                    <dd className="font-medium text-deep-black">9:00 AM - 7:00 PM</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Saturday</dt>
                    <dd className="font-medium text-deep-black">10:00 AM - 4:00 PM</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Sunday</dt>
                    <dd className="font-medium text-deep-black">Closed</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black mb-6">
                Send Us a Message
              </h2>

              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3"
                  role="alert"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Thank you for your inquiry!</p>
                    <p className="text-sm mt-1">We've received your message and will get back to you within 24 hours.</p>
                  </div>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Failed to submit inquiry</p>
                    <p className="text-sm mt-1">{errorMessage}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="label-field">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      className={cn('input-field', errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                      {...register('name')}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="label-field">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+92 XXX XXXXXXX"
                      className={cn('input-field', errors.phone && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                      {...register('phone')}
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label-field">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className={cn('input-field', errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiry_type" className="label-field">Inquiry Type *</label>
                  <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Inquiry type">
                    {inquiryTypes.map((type) => (
                      <label
                        key={type.value}
                        className={cn(
                          'relative flex items-center gap-3 p-4 border rounded transition-all cursor-pointer',
                          inquiryType === type.value
                            ? 'border-deep-black bg-deep-black/5'
                            : 'border-light-grey hover:border-medium-grey'
                        )}
                      >
                        <input
                          type="radio"
                          value={type.value}
                          className="sr-only"
                          {...register('inquiry_type')}
                          aria-invalid={errors.inquiry_type ? 'true' : 'false'}
                        />
                        <type.icon className={cn('w-5 h-5 flex-shrink-0', inquiryType === type.value ? 'text-deep-black' : 'text-medium-grey')} aria-hidden="true" />
                        <span className={cn('font-medium', inquiryType === type.value ? 'text-deep-black' : 'text-charcoal')}>{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.inquiry_type && (
                    <p className="mt-1 text-sm text-red-600" role="alert">{errors.inquiry_type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="label-field">Message *</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your requirements, preferred locations, budget range, or any specific questions..."
                    className={cn('input-field resize-none', errors.message && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    {...register('message')}
                    aria-invalid={errors.message ? 'true' : 'false'}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">{errors.message.message}</p>
                  )}
                </div>

                {defaultValues.property_id && (
                  <input type="hidden" {...register('property_id')} />
                )}
                {defaultValues.project_id && (
                  <input type="hidden" {...register('project_id')} />
                )}

                <button
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                  className="btn-primary w-full py-4"
                >
                  {submitStatus === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" aria-hidden="true" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-medium-grey mt-6">
                By submitting this form, you agree to our{' '}
                <a href="/privacy" className="text-deep-black hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" className="text-deep-black hover:underline">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-pure-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-heading font-light tracking-tight text-deep-black text-center mb-10">
            Find Us on the Map
          </h2>
          <div className="aspect-[16/9] max-w-4xl mx-auto rounded overflow-hidden border border-light-grey">
            <iframe
              src={siteConfig.google_maps_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ICG Office Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pure-white" />}>
      <ContactContent />
    </Suspense>
  );
}