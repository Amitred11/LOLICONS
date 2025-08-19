/**
 * A utility function to format a date string into a human-readable, relative time string.
 * Examples: "Today", "Yesterday", "5 days ago", or "Jan 1, 2024".
 * @param {string} dateString - The ISO date string to format.
 * @returns {string} The formatted, user-friendly date string.
 */
export const formatChapterDate = (dateString) => {
  // Return an empty string for invalid or missing input.
  if (!dateString) return '';

  const releaseDate = new Date(dateString);
  // Check if the parsed date is valid.
  if (isNaN(releaseDate.getTime())) return '';

  const today = new Date();
  // Normalize both dates to midnight to ensure accurate day-based comparisons.
  today.setHours(0, 0, 0, 0);
  releaseDate.setHours(0, 0, 0, 0);

  // Calculate the difference in time and convert it to days.
  const diffTime = today.getTime() - releaseDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Return "Today" if the release was on the same day.
  if (diffDays === 0) {
    return 'Today';
  }
  // Return "Yesterday" if the release was one day ago.
  if (diffDays === 1) {
    return 'Yesterday';
  }
  // Return "X days ago" if the release was within the last two weeks.
  if (diffDays <= 14) {
    return `${diffDays} days ago`;
  }
  
  // For dates older than two weeks, return a standard formatted date (e.g., "Jan 20, 2024").
  return releaseDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};