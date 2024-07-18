import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'travelerTypeName'
})
export class TravelerTypeNamePipe implements PipeTransform {

  transform(travelerType: 'ADULT' | 'CHILD' | 'HELD_INFANT'): string {
    switch (travelerType) {
      case "ADULT":
        return 'Adult';

      case "CHILD":
        return 'Child';

      case "HELD_INFANT":
        return 'Infant';
    }
  }

}
