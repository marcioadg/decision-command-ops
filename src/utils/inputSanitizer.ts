
// Utility for input sanitization to prevent XSS attacks
export class InputSanitizer {
  // Remove potentially dangerous HTML/JS content
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
      .replace(/on\w+='[^']*'/gi, '') // Remove inline event handlers (single quotes)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
      .trim();
  }

  // Sanitize text input (more aggressive)
  static sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets entirely
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:/gi, '') // Remove data: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: URLs
      .trim();
  }

  // Validate and sanitize decision title
  static sanitizeDecisionTitle(title: string): string {
    const sanitized = this.sanitizeText(title);
    
    if (sanitized.length < 3) {
      throw new Error('Decision title must be at least 3 characters long');
    }
    
    if (sanitized.length > 200) {
      throw new Error('Decision title cannot exceed 200 characters');
    }
    
    return sanitized;
  }

  // Validate and sanitize decision notes
  static sanitizeDecisionNotes(notes: string): string {
    if (!notes) return '';
    
    const sanitized = this.sanitizeHtml(notes);
    
    if (sanitized.length > 5000) {
      throw new Error('Decision notes cannot exceed 5000 characters');
    }
    
    return sanitized;
  }

  // Validate confidence value
  static validateConfidence(confidence: number): number {
    const numValue = Number(confidence);
    
    if (isNaN(numValue) || numValue < 1 || numValue > 100) {
      throw new Error('Confidence must be a number between 1 and 100');
    }
    
    return Math.round(numValue);
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email address format');
    }
    
    return sanitized;
  }
}
