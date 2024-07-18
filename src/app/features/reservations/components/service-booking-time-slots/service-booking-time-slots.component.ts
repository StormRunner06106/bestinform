import { Component, Input } from '@angular/core';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';

@Component({
  selector: 'app-service-booking-time-slots',
  templateUrl: './service-booking-time-slots.component.html',
  styleUrls: ['./service-booking-time-slots.component.scss']
})
export class ServiceBookingTimeSlotsComponent {
  @Input() reservation: Reservation;
  
  reservationData:Reservation;

  ngOnInit(){
    this.reservationData=this.reservation;
  }

}
