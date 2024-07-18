import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'minutesToHours'
  })
  export class MinutesToHours implements PipeTransform {
    transform(value: number): string {
        const hours = Math.floor(value / 60);
        const minutes = Math.floor(value % 60);
        return hours + ' : ' + (minutes==0 ? '00' : minutes);
    }
  }