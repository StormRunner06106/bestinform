import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'flightDuration'
})
export class FlightDurationPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) {
            return 'Nu este mentionata durata';
        }

        const hours = value.match(/(\d+)H/)?.[1] || '0';
        const minutes = value.match(/(\d+)M/)?.[1] || '0';

        return `${hours} ore si ${minutes} minute`;
    }
}
