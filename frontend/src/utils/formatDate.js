export function formatDateDDShortMonthNameYY(dateString) {
  if(!dateString) return ''
  const date = new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })
  return date
}