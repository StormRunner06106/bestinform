import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/shared/_models/user.model';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';

import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import {takeUntil} from "rxjs/operators";
import { Subject } from 'rxjs';
import { TripsService } from 'src/app/shared/_services/trips.service';

@Component({
  selector: 'app-view-trip-reservation',
  templateUrl: './view-trip-reservation.component.html',
  styleUrls: ['./view-trip-reservation.component.scss']
})
export class ViewTripReservationComponent {

  public downloadAsPDF() {
    const DATA: any = document.getElementById('htmlData');
    html2canvas(DATA, {scale: 2}).then((canvas) => {
        const fileWidth = 208;
        const fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        const PDF = new jsPDF('p', 'mm', 'a4');
        const position = 5;
        PDF.addImage(FILEURI, 'PNG', 5, position, fileWidth - 7, fileHeight);
        PDF.save('Rezervare-Bestinform-' + this.reservationNumber + '.pdf');
    });
}


private ngUnsubscribe = new Subject<void>();

//reservation id
reservationTripId: string;
reservation: any;

//client Data
clientId: string;
clientData: User;

reservationNumber: string;

//resource data
resourceId: string;
resourceData: any;
defaultImagePath = "./../../../../assets/images/others/banner-default-min.jpg";
status = 'Pending';

constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService
) {
}

ngOnInit(): void {
    this.getTripReservationId();
}

//get reservation id from path
getTripReservationId() {
    this.route.params
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(params => {
        this.reservationTripId = params['tripReservationId'];
        console.log('GET PARAMS', this.reservationTripId);

        this.tripsService.getTripReservationById(this.reservationTripId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((resp: any) => {
            console.log(resp);
            this.reservationNumber = resp.reservationNumber;
        })
    });
}

ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

}
