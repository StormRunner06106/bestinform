import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LocationsService } from 'src/app/features/trips/_services/locations.service';
import { User } from 'src/app/shared/_models/user.model';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { TripsService } from 'src/app/shared/_services/trips.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { CancelReservationModalComponent } from '../../cancel-reservation-modal/cancel-reservation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { SmartBillService } from 'src/app/shared/_services/smartbill.service';
import fileSaver from "file-saver";

@Component({
  selector: 'app-view-trip-reservation-content',
  templateUrl: './view-trip-reservation-content.component.html',
  styleUrls: ['./view-trip-reservation-content.component.scss']
})
export class ViewTripReservationContentComponent {
  @Input() reservationTripId: string;

  private ngUnsubscribe = new Subject<void>();

  // correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  dataLoaded:boolean;
  defaultImagePath = "./../../../../assets/images/others/banner-default-min.jpg";


  //trip data
  tripReservation: any;
  countryName:string;
  locationName:string;

  //user data
  userRole:string;
  userId:string;
  tripUser:any;

  //qr code
  title = 'app';
  elementType = 'url';
  value = 'o valoare random';
  reservationLink: any;
  userRoles=[];

  constructor(
    private userService: UserDataService,
    private router: Router,
    private toastService: ToastService,
    private tripReservationsService:TripsService,
    private locationService: LocationsService,
    private ngbModalService: NgbModal,
        private modalService: ModalService,
        private smartBillService: SmartBillService
) {
}

  ngOnInit(): void {
    this.getCurrentUser();
  }



  // get the role of user
  getCurrentUser() {
    this.userService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: (res: User) => {
                res.roles.forEach(element => {
                    this.userRole = element;
                });
                this.userRoles=res.roles;
                console.log('current USER', res);
                this.userId = res.id;
                this.getTripReservationById(this.reservationTripId);
                console.log('ROLUL', this.userRole);
            }
        });
  }

  getTripReservationById(tripId){
    this.tripReservationsService.getTripReservationById(tripId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        console.log('TRIPUL DIN PATH',res);
        this.tripReservation=res;

        //get country Name
        this.locationService.getCountryById(res.countryId).subscribe((country:any)=>{
          this.countryName=country.name;
        });

        //get location Name
        this.locationService.getLocationById(res.locationId).subscribe((location:any)=>{
          this.locationName=location.name;
        });

        //get client data
        this.userService.getUserById(res.userId).subscribe((user:any)=>{
          this.tripUser=user;
        });

        this.dataLoaded=true;
      }
    });
  }

  downloadBill() {
    this.smartBillService.downloadFile( this.tripReservation.bill.series, this.tripReservation.bill.number).subscribe((file: any) => {
        const fileName = 'Factura-Rezervare.pdf';
        const blob = new Blob([file], {type: 'text/json; charset=utf-8'});
        fileSaver.saveAs(blob, fileName);

    }, (error: any) => {
        console.log('download bill from trip');

    });
}

ngOnDestroy(): void {
  this.ngUnsubscribe.next();
  this.ngUnsubscribe.complete();
}
  cancelReservationModal(elementId: string) {
    console.log("Modal apelat:", elementId);

    this.ngbModalService.open(CancelReservationModalComponent, {centered: true});
    this.modalService.setElementId(elementId);

    if (this.userRole.includes('ROLE_CLIENT')) {
        this.modalService.triggerUserListChanges(true);
    }

}



  

}
