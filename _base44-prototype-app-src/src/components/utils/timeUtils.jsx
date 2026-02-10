import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Format a duration in minutes to human-readable format
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "-";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

// Format a time for display in 24h format (HH:mm)
export function formatTime(isoString) {
  if (!isoString) return "-";
  
  try {
    return format(parseISO(isoString), "HH:mm"); // Changed to 24h format
  } catch (error) {
    console.error("Invalid date format:", isoString);
    return "-";
  }
}

// Format display time for a timer
export function formatTimeDisplay(timeInMs) {
  const totalSeconds = Math.floor(timeInMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { hours, minutes, seconds };
}

// Get time range filters for different periods
export function getTimeRanges() {
  const now = new Date();
  
  return {
    today: {
      start: startOfDay(now).toISOString(),
      end: endOfDay(now).toISOString()
    },
    week: {
      start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      end: endOfWeek(now, { weekStartsOn: 1 }).toISOString()
    },
    month: {
      start: startOfMonth(now).toISOString(),
      end: endOfMonth(now).toISOString()
    }
  };
}