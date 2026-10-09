const INDIA_TZ = "Asia/Kolkata";

/** Calendar date in India as YYYY-MM-DD. Gym dates follow this timezone. */
export function indiaDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
