export function formatDateDDShortMonthNameYY(dateString) {
  if(!dateString) return ''
  const date = new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })
  return date
}

export function formatDateWithTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return `  ${day}-${month}-${year}, ${time}`;
}