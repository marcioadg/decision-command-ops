
// Network utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryRequest = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for database operation`);
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  throw new Error('Max retries exceeded');
};

export const handleNetworkError = (error: any): Error => {
  console.error('Network error:', error);
  
  // Check if it's a network error
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return new Error('Network connection failed. Please check your internet connection and try again.');
  }
  
  return error;
};
