import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cairoDate',
  standalone: true,
})
export class CairoDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, mode: 'full' | 'time' | 'date' = 'full'): string {
    if (!value) {
      return '';
    }
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) {
      return '';
    }

    if (mode === 'time') {
      return new Intl.DateTimeFormat('ar-EG', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    }

    if (mode === 'date') {
      return new Intl.DateTimeFormat('ar-EG', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d);
    }

    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
}
