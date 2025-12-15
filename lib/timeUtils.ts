// Time conversion utilities for 12-hour AM/PM format

/**
 * Converts 24-hour time (HH:MM) to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30", "09:15")
 * @returns Time in 12-hour format (e.g., "2:30 PM", "9:15 AM")
 */
export function to12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(n => parseInt(n, 10));

  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return original if invalid
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts 12-hour time with AM/PM to 24-hour format (HH:MM)
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM", "9:15 AM")
 * @returns Time in 24-hour format (e.g., "14:30", "09:15")
 */
export function to24Hour(time12: string): string {
  // Handle various input formats: "2:30 PM", "2:30PM", "2:30 pm", etc.
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);

  if (!match) {
    return time12; // Return original if invalid format
  }

  let [, hoursStr, minutesStr, period] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return time12; // Return original if invalid
  }

  // Convert to 24-hour format
  if (period.toUpperCase() === 'AM') {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return `${hours.toString().padStart(2, '0')}:${minutesStr}`;
}

/**
 * Validates 12-hour time format
 * @param time12 - Time string to validate
 * @returns true if valid 12-hour format with AM/PM
 */
export function isValid12HourTime(time12: string): boolean {
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);

  if (!match) return false;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
}
