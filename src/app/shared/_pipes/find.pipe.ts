import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'find',
    standalone: true
})
export class FindPipe implements PipeTransform {

    transform(list: Array<unknown>, callback): string | number {
        if (list && list.length > 0) {
            let foundValue: string | number;
            list.forEach( element => {
                if (callback(element)) {
                    foundValue = callback(element);
                }
            });
            return foundValue;
        } else {
            return null;
        }

    }
}