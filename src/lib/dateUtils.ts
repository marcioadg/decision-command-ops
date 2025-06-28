
export const getDaysAgo = (date: Date | string): string => {
  try {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to getDaysAgo:', date);
      return 'unknown';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  } catch (error) {
    console.error('Error in getDaysAgo:', error, 'Date input:', date);
    return 'unknown';
  }
};
