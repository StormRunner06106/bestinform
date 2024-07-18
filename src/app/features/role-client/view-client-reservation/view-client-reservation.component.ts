import { Component } from '@angular/core';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { Resource } from 'src/app/shared/_models/resource.model';
import { User } from 'src/app/shared/_models/user.model';

@Component({
  selector: 'app-view-client-reservation',
  templateUrl: './view-client-reservation.component.html',
  styleUrls: ['./view-client-reservation.component.scss']
})
export class ViewClientReservationComponent {

  reservation:Reservation;
  // client:User;
  // resource:Resource;


}
