import { Component, Input } from '@angular/core';
import { Reservation } from 'src/app/shared/_models/reservation.model';

@Component({
  selector: 'app-car-booking',
  templateUrl: './car-booking.component.html',
  styleUrls: ['./car-booking.component.scss']
})
export class CarBookingComponent {
  @Input() reservation: Reservation;

  carRentList:any;
  // constructor(){}

  ngOnInit(): void {
    this.getCarRentData();
    console.log('rezervare',this.reservation);
  }

  getCarRentData(){
    this.carRentList=this.reservation.carRent;
  }

}
