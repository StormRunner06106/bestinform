import { Component, Inject } from '@angular/core';
import { LocationsService } from '../_services/locations.service';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-archive-trip',
  templateUrl: './archive-trip.component.html',
  styleUrls: ['./archive-trip.component.scss'],
   providers: [NgbActiveModal, NgbModal]
})
export class ArchiveTripComponent {

  tripId:string;
  status:string;
  tripData:any;
  countryName:string;
  locationName:string;

  private ngUnsubscribe = new Subject<void>();


  constructor(
    private locationService: LocationsService,
    private modalService: ModalService,
    private toastService: ToastService,
    private router:Router,
    private ngbActiveModal: NgbActiveModal,
    private ngbModal:NgbModal) { }

  ngOnInit() {
    this.tripId = this.modalService.getElementId();
    this.getTripById(this.tripId);
  }

  archiveTrip(){
    this.locationService.changeTripStatus(this.tripId, 'inactive')
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:()=>{
        //anuntam ca s-a schimbat lista
        this.modalService.triggerUserListChanges(true);
        this.toastService.showToast("Success", "Trip arhivat!", "success" );
      }
    })
    this.close();
  }

  //populate the modal with trip data
  getTripById(idTrip){
    this.locationService.getTripById(idTrip)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(tripRes:any)=>{
        this.tripData=tripRes;

        //getCountryName
        this.locationService.getCountryById(this.tripData.countryId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (country:any)=>{
            this.countryName=country.name;
          }
        });

        //getLocationName
        this.locationService.getLocationById(this.tripData.locationId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (location:any)=>{
            this.locationName=location.name;
          }
        });
      }
    });
  }



  close(): void {
    this.ngbModal.dismissAll();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
