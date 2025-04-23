import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputParserService {

  constructor() { }

  parseInputValue(event: Event): number {
    const inputValue = (event.target as HTMLInputElement).value;
    const numericValue = Number(inputValue.replace(/,/g, '').replace('.', ''));
    if (inputValue === '' || inputValue === '0' || numericValue <= 0) {
      return 0.00;
    } else {
      if (!isNaN(numericValue)) {
        return numericValue / 100;
      }
    }
    return 0;
  }
}
