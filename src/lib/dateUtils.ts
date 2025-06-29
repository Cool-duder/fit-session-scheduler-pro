
import { parseISO, isSameDay, format, isValid } from 'date-fns';

// Centralized date parsing with proper error handling
export const safeParseDateString = (dateString: string): Date => {
  console.log('Parsing date string:', dateString);
  
  // Handle different date formats
  let parsedDate: Date;
  
  // If it's already in YYYY-MM-DD format, use parseISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    parsedDate = parseISO(dateString);
  } else {
    // Fallback to regular Date constructor for other formats
    parsedDate = new Date(dateString);
  }
  
  if (!isValid(parsedDate)) {
    console.error('Invalid date string:', dateString);
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  console.log('Parsed date result:', parsedDate);
  return parsedDate;
};

// Safe date comparison for session filtering
export const isSameDaySafe = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? safeParseDateString(date1) : date1;
    const d2 = typeof date2 === 'string' ? safeParseDateString(date2) : date2;
    
    const result = isSameDay(d1, d2);
    console.log(`Date comparison: ${format(d1, 'yyyy-MM-dd')} vs ${format(d2, 'yyyy-MM-dd')} = ${result}`);
    return result;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

// Format date for database storage (always YYYY-MM-DD)
export const formatForDatabase = (date: Date | string): string => {
  try {
    const parsedDate = typeof date === 'string' ? safeParseDateString(date) : date;
    const formatted = format(parsedDate, 'yyyy-MM-dd');
    console.log('Formatted for database:', formatted);
    return formatted;
  } catch (error) {
    console.error('Error formatting date for database:', error);
    throw error;
  }
};

// Format date for display
export const formatForDisplay = (date: Date | string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    const parsedDate = typeof date === 'string' ? safeParseDateString(date) : date;
    return format(parsedDate, formatString);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return 'Invalid Date';
  }
};

// Get today's date consistently
export const getToday = (): Date => {
  return new Date();
};

// Debug helper to log date information
export const debugDate = (label: string, date: string | Date): void => {
  try {
    const parsedDate = typeof date === 'string' ? safeParseDateString(date) : date;
    console.log(`${label}:`, {
      original: date,
      parsed: parsedDate,
      formatted: format(parsedDate, 'yyyy-MM-dd'),
      iso: parsedDate.toISOString()
    });
  } catch (error) {
    console.error(`${label} - Error debugging date:`, error);
  }
};
