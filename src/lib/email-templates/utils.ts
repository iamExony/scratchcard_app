export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
  });
}