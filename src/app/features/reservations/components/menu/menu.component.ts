import {Component, Input} from '@angular/core';
import {Reservation} from "../../../../shared/_models/reservation.model";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() reservation: Reservation;


  formatReservationTime(timeArray: any): Date {
    if (timeArray && Array.isArray(timeArray)) {
      // Create a Date object from the array components
      return new Date(timeArray[0], timeArray[1] - 1, timeArray[2], timeArray[3], timeArray[4]);
    }
    return null;
  }
}
