/**
 * DATE UTILITIES
 * Centralized date formatting functions for consistent UTC-to-local time conversion
 *
 * The database stores all timestamps in UTC (using GETUTCDATE()).
 * These utilities ensure dates are properly parsed as UTC and displayed in the user's local timezone.
 */

/**
 * Ensures a date string is parsed as UTC by appending 'Z' if no timezone indicator exists
 * @param {string} dateString - Date string from database
 * @returns {string} - Date string with timezone indicator
 */
const ensureUTC = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
    return dateString + 'Z';
  }
  return dateString;
};

/**
 * Format date for display (e.g., "Jan 15, 2024, 10:30 AM")
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Formatted date in user's local timezone
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  return new Date(utcDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date without time (e.g., "Jan 15, 2024")
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Formatted date in user's local timezone
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  return new Date(utcDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with full time (e.g., "1/15/2024, 10:30:45 AM")
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Formatted date/time in user's local timezone
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  return new Date(utcDateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date using toLocaleString() for full local representation
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Full formatted date/time in user's local timezone
 */
export const formatLocalDateTime = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  return new Date(utcDateString).toLocaleString();
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  // For dates older than a week, show the formatted date
  return formatDate(dateString);
};

/**
 * Parse a date string as UTC and return a Date object
 * @param {string} dateString - Date string from database (UTC)
 * @returns {Date|null} - Date object or null if invalid
 */
export const parseUTCDate = (dateString) => {
  if (!dateString) return null;

  const utcDateString = ensureUTC(dateString);
  const date = new Date(utcDateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format date for input fields (ISO format: YYYY-MM-DD)
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Date in YYYY-MM-DD format (local timezone)
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';

  const utcDateString = ensureUTC(dateString);
  const date = new Date(utcDateString);

  // Get local date parts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Format time only (e.g., "10:30 AM")
 * @param {string} dateString - Date string from database (UTC)
 * @returns {string} - Formatted time in user's local timezone
 */
export const formatTimeOnly = (dateString) => {
  if (!dateString) return 'N/A';

  const utcDateString = ensureUTC(dateString);
  return new Date(utcDateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  formatDate,
  formatDateOnly,
  formatDateTime,
  formatLocalDateTime,
  formatRelativeTime,
  parseUTCDate,
  formatDateForInput,
  formatTimeOnly
};
