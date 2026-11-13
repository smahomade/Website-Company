import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* Join class names, letting a later Tailwind class win over an earlier one (shadcn's helper) */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
