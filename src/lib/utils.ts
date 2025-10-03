import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `REF_${timestamp}_${random}`.toUpperCase();
}