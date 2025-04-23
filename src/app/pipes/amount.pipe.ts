import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'amount'
})
export class AmountPipe implements PipeTransform {

  transform(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(value);
  }

}
