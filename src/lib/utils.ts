import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(area: number, unit: 'sqft' | 'sqyd' | 'marla' | 'kanal' = 'sqft'): string {
  const units: Record<string, string> = {
    sqft: 'sq ft',
    sqyd: 'sq yd',
    marla: 'marla',
    kanal: 'kanal',
  };
  return `${area.toLocaleString()} ${units[unit]}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function generatePropertyId(): string {
  return `ICG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function generateProjectId(): string {
  return `PRJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}