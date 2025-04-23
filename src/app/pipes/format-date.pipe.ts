import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: any, format: string = 'MMM dd, yyyy'): string {
    if (!value) return '';
    
    try {
      // If it's already a Date object
      if (value instanceof Date) {
        return this.datePipe.transform(value, format) || '';
      }
      
      // If it's a string with comma-separated values
      if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',').map(part => parseInt(part.trim(), 10));
        
        // Adjust month index if needed (subtract 1 because JavaScript months are 0-indexed)
        if (parts.length >= 2) {
          parts[1] = parts[1] - 1;
        }
        
        const date = new Date(parts[0], parts[1], parts[2] || 1, parts[3] || 0, parts[4] || 0, parts[5] || 0);
        if (!isNaN(date.getTime())) {
          return this.datePipe.transform(date, format) || '';
        }
      }
      
      // Try parsing as ISO string or timestamp
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        return this.datePipe.transform(parsedDate, format) || '';
      }
      
      // If nothing works, return the original value
      return value;
    } catch (error) {
      console.error('Error formatting date:', error, value);
      return value;
    }
  }
}