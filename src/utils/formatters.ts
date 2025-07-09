import { format } from 'date-fns';

// Format currency with proper locale and currency symbol
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

// Format date for input fields
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format large numbers with abbreviations (K, M, B)
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Format payment frequency for display
export function formatPaymentFrequency(frequency: 'monthly' | 'bi-weekly' | 'weekly'): string {
  switch (frequency) {
    case 'monthly':
      return 'Monthly';
    case 'bi-weekly':
      return 'Bi-weekly';
    case 'weekly':
      return 'Weekly';
    default:
      return frequency;
  }
}

// Format loan term for display
export function formatLoanTerm(years: number, months: number): string {
  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  }
  
  if (months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  }
  
  return parts.join(' and ') || '0 months';
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}

// Parse percentage string to number
export function parsePercentage(value: string): number {
  const cleaned = value.replace(/%/g, '');
  return parseFloat(cleaned) || 0;
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format time duration
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
} 