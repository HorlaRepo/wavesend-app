import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDateTime'
})
export class LocalDateTimePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (!value) {
      return null;
    }
    
    // Handle array format [year, month, day, hour, minute]
    if (Array.isArray(value)) {
      try {
        // Java's months are 1-based (1=January), but JavaScript's are 0-based (0=January)
        // So subtract 1 from the month value
        const year = value[0] || 0;
        const month = (value[1] || 1) - 1; // Adjust for JavaScript's 0-based months
        const day = value[2] || 1;
        const hours = value[3] || 0;
        const minutes = value[4] || 0;
        const seconds = value[5] || 0;
        
        console.log(`Creating date from array: ${year}-${month+1}-${day} ${hours}:${minutes}:${seconds}`);
        
        return new Date(year, month, day, hours, minutes, seconds);
      } catch (error) {
        console.error('Error converting date array:', error, JSON.stringify(value));
        return null;
      }
    }
    
    // If it's already a Date, just return it
    if (value instanceof Date) {
      return value;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.error('Invalid date string:', value);
          return null;
        }
        return date;
      } catch (error) {
        console.error('Error parsing date string:', error, value);
        return null;
      }
    }
    
    console.warn('Unsupported date format:', JSON.stringify(value));
    return null;
  }
}