export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function shortAmount(amount: number) {
  if (Math.abs(amount) >= 100000)
    return `₹${(amount / 100000).toFixed(1)}L`
  if (Math.abs(amount) >= 1000)
    return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}
