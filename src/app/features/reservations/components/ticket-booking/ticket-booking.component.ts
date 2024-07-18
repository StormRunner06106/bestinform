import { Component, Input } from '@angular/core';
import { Reservation } from 'src/app/shared/_models/reservation.model';

@Component({
  selector: 'app-ticket-booking',
  templateUrl: './ticket-booking.component.html',
  styleUrls: ['./ticket-booking.component.scss']
})
export class TicketBookingComponent {

  @Input() reservation: Reservation;

  // ngOnInit(): void {
  //   console.log('rezervare',this.reservation);
  // }

}
