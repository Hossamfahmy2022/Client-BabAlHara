import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'egp',
  standalone: true,
})
export class EgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
    return `${formatted} ج.م`;
  }
}
