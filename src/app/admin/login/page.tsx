'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Sign in failed.');

      setLoginStatus('success');
      const requestedPath = new URLSearchParams(window.location.search).get('redirect');
      const redirectTo = requestedPath?.startsWith('/admin/') && requestedPath !== '/admin/login'
        ? requestedPath
        : '/admin/dashboard';
      setTimeout(() => router.push(redirectTo), 500);
    } catch (error) {
      setLoginStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-pure-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8" aria-label="ICG Home">
            <span className="text-4xl font-heading font-light tracking-tight text-deep-black">
              ICG
            </span>
          </Link>
          <Building2 className="w-16 h-16 mx-auto text-deep-black mb-4" aria-hidden="true" />
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-black mb-2">
            Admin Dashboard
          </h1>
          <p className="text-medium-grey">Sign in to manage properties, projects, and inquiries</p>
        </div>

        <div className="bg-pure-white border border-light-grey p-8">
          {loginStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3"
              role="alert"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span>Login successful. Redirecting...</span>
            </motion.div>
          )}

          {loginStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 flex items-center gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="label-field">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@icg.com.pk"
                  className={cn('input-field pr-12', errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={loginStatus === 'loading'}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('input-field pr-12', errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={loginStatus === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-medium-grey hover:text-deep-black transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loginStatus === 'loading'}
              className="btn-primary w-full py-4"
            >
              {loginStatus === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-medium-grey mt-8">
          <Link href="/" className="text-deep-black hover:underline">&larr; Back to Website</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}