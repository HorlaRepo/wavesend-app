import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'localDateTime'
})
export class LocalDateTimePipe implements PipeTransform {

  transform(value: any): Date | null {
    if (Array.isArray(value)) {
      // Create a Date object with the provided values as UTC
      return new Date(Date.UTC(value[0], value[1] - 1, value[2], value[3], value[4], value[5], value[6] / 1000000));
    }
    return null;
  }
}
