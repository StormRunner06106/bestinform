import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
  standalone: true
})
export class IncludesPipe implements PipeTransform {

  transform(array: unknown[], itemToFind: unknown): boolean {
    if (!array.length) return false;
    return array.includes(itemToFind);
  }

}
