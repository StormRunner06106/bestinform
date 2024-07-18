import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { SettingsService } from 'src/app/shared/_services/settings.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { ResourcesService } from 'src/app/shared/_services/resources.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ModalService } from 'src/app/shared/_services/modals.service';

@Component({
  selector: 'app-client-bookings',
  templateUrl: './client-bookings.component.html',
  styleUrls: ['./client-bookings.component.scss']
})
export class ClientBookingsComponent {

  private ngUnsubscribe=new Subject<void>();
  // addedReview=new EventEmitter();
  pageItems = [15, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;
  page=0;
  pageSize= 15;
  totalActiveElements: number;
  totalPastElements: number;
  totalCancelledElements: number;


  @ViewChild(MatPaginator) paginator: MatPaginator;

  //booking list
  activeBookingList:Array<Reservation>=[];
  pastBookingList:Array<Reservation>=[];
  cancelledBookingList:Array<Reservation>=[];
  lastNotReviewedBooking:any;

  //client data
  clientId:string;

  currency:string;

  ngOnInit(): void{
    this.listChanges();
    this.getCurrentUser();
    // this.activeListChanges();
  }

  constructor(
    private reservationService: ReservationsService,
    private userService:UserDataService,
    private settingsService:SettingsService,
    private resourcesService: ResourcesService,
    private cdr: ChangeDetectorRef,
    private modalService:ModalService
  ){}

  getCurrentUser(){
    this.userService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(client:any)=>{

        this.clientId=client.id;
        if(this.clientId){
          this.getSettings();
          this.initBookingLists();
        }
      }
    });
  }

  pageChanged(event){
    this.page = event.pageIndex;
    this.pageSize = event.pageSize

    // Get All Documents List
    this.initBookingLists();
  }

  initBookingLists(){
    this.getActiveBookingList();
    this.getPastBookingList();
    this.getCancelledBookingList();
    this.getNotReviewedBookingList();
  }

  //for currency used by client
  getSettings(){
    this.settingsService.getCurrentSettings()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(settings:any)=>{
        this.currency=settings.currency === null? 'EUR' : settings.currency;
      }
    });
  }

  getNotReviewedBookingList(){
    const activeBookingsObject={
      status:'past',
      userId: this.clientId,
      bookingTypes: ["rentalBooking","menu", "ticketBooking", "culturalBooking","serviceBookingTimeSlots" ],
      recommended: "notReviewed"
    }

    this.reservationService.listReservationFiltered(0,1,'date','desc',activeBookingsObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(bookings:any)=>{
        this.lastNotReviewedBooking=bookings.content[0];
      }
    });
  }

  getActiveBookingList(){
    const activeBookingsObject={
      status:'active',
      userId: this.clientId,
      bookingTypes: ["rentalBooking","menu", "ticketBooking", "culturalBooking","serviceBookingTimeSlots" ]

    }

    this.reservationService.listReservationFiltered(this.page,this.pageSize, 'date','desc',activeBookingsObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(bookings:any)=>{
        this.totalActiveElements=bookings.totalElements;
        this.activeBookingList=bookings.content;
      }
    });
  }

  getPastBookingList(){
    const pastBookingsObject={
      status:'past',
      userId: this.clientId,
      bookingTypes: ["rentalBooking","menu", "ticketBooking", "culturalBooking","serviceBookingTimeSlots" ]

    }

    this.reservationService.listReservationFiltered(this.page,this.pageSize,'date','desc',pastBookingsObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(bookings:any)=>{
        this.pastBookingList=bookings.content;
        this.totalPastElements=bookings.totalElements;
      }
    });
  }

  getCancelledBookingList(){
    const activeBookingsObject={
      status:'canceled',
      userId: this.clientId,
      bookingTypes: ["rentalBooking","menu", "ticketBooking", "culturalBooking","serviceBookingTimeSlots" ]

    }

    this.reservationService.listReservationFiltered(this.page,this.pageSize,'date','desc',activeBookingsObject)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:(bookings:any)=>{
        this.cancelledBookingList=bookings.content;
        this.totalCancelledElements=bookings.totalElements;
      }
    });
  }

    //add review to resource
    addReviewToResource(reservationId:string, review:boolean ){
      this.resourcesService.addReviewToResource(reservationId,review).subscribe((reviewData:any)=>{
        if(reviewData.success){
          this.listChanges();
        }
      });

    }

    listChanges(){
       this.resourcesService.triggerListChanges(true);

      this.getNotReviewedBookingList();
      this.getPastBookingList();
      this.getActiveBookingList();
      this.getCancelledBookingList();

    }

    activeListChanges(){

      this.modalService.listChangedObs.subscribe((data: boolean) => {
        // If the response is true
        if (data) {
          // Get Documents List
          this.getActiveBookingList();
          this.getCancelledBookingList();
          this.cdr.detectChanges();
  
        }
      })
    
      this.modalService.listChangedObs.subscribe((data: boolean) => {
        console.log("fara data");
        // If the response is true
        if (data) {
          console.log("cu data");

          // Get Documents List
          this.getActiveBookingList();
          this.getCancelledBookingList();
           this.cdr.detectChanges();

        }
      })
    }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
