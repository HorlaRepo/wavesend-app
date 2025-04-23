import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // Add properties from the environment
  private env: any;
  
  constructor() {
    // Get environment variables from window
    this.env = (window as any).__env || {};
  }

  get(key: string, defaultValue: any = null): any {
    // Navigate nested properties using dot notation
    const parts = key.split('.');
    let value = this.env;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }
}