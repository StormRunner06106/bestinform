import { Component, Input } from '@angular/core';
import { Reservation } from 'src/app/shared/_models/reservation.model';

@Component({
  selector: 'app-cultural-booking',
  templateUrl: './cultural-booking.component.html',
  styleUrls: ['./cultural-booking.component.scss']
})
export class CulturalBookingComponent {
  @Input() reservation: Reservation;

  culturalBookingList:Array<any>;

  ngOnInit(): void {
    this.getCulturalBookingData();
  }

  getCulturalBookingData(){
    this.culturalBookingList=this.reservation.culturalBooking;
    console.log('CULTURAL BOOKING',this.reservation);
  }
}
