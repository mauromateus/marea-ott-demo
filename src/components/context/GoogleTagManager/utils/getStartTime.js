/**
 * Get start time rounded to the nearest half hour for analytics (same as the real product).
 * e.g. 3:05 -> 3:00, 3:48 -> 4:00
 * @param {Date} [date]
 * @returns {string} HH:mm:ss
 */
export default function getStartTime (date) {
  const now = date instanceof Date ? date : new Date()
  let hour = now.getHours()
  const minutes = now.getMinutes()

  let roundedMinutes
  if (minutes < 15) {
    roundedMinutes = '00'
  } else if (minutes < 45) {
    roundedMinutes = '30'
  } else {
    roundedMinutes = '00'
    hour = (hour + 1) % 24
  }
  return `${hour.toString().padStart(2, '0')}:${roundedMinutes}:00`
}
