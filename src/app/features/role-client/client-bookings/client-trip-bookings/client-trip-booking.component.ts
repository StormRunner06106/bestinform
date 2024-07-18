import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Trip } from 'src/app/shared/_models/trip.model';
import { TripsService } from 'src/app/shared/_services/trips.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';

@Component({
  selector: 'app-client-trip-bookings',
  templateUrl: './client-trip-bookings.component.html',
  styleUrls: ['./client-trip-bookings.component.scss']
})
export class ClientTripBookingsComponent {
  private ngUnsubscribe=new Subject<void>();

  //pagination
  page:number;
  size:number;
  dir='desc';
  sort='date';

  totalActiveElements:number;
  totalPastElements:number;
  totalCancelledElements:number;
  pageItems=[15,50,100];

  //userData
  currentUserId:string;

  //list
  activeTripList=[];
  pastTripList=[];
  cancelledTripList=[];

  constructor(
    private tripsService:TripsService,
    private userDataService:UserDataService
  ){}

  ngOnInit(): void{
    this.initateList();
  }

  //initiate list data
  initateList(){
    this.page=0;
    this.size=15;
    this.userDataService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (user:Trip)=>{
        this.currentUserId=user.id;
        this.getActiveTripsList();
      }
    });
  }

  //get Active List
  getActiveTripsList(){
    const filter={
      status: "active",
      userId: this.currentUserId,
    }

    this.tripsService.listTripReservationsFiltered(this.page, this.size, this.sort, this.dir, filter)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (trip:any)=>{
        this.activeTripList=trip.content;
        this.totalActiveElements=trip.totalElements;
      }
    });
  }

  //get past List
  getPastTripsList(){
    const filter={
      status: "past",
      userId: this.currentUserId,
    }

    this.tripsService.listTripReservationsFiltered(this.page, this.size, this.sort, this.dir, filter)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (trip:any)=>{
        this.pastTripList=trip.content;
        this.totalPastElements=trip.totalElements;
      }
    });
  }

    //get cancelled List
  getCancelledTripsList(){
    const filter={
      status: "canceled",
      userId: this.currentUserId,
    }

    this.tripsService.listTripReservationsFiltered(this.page, this.size, this.sort, this.dir, filter)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (trip:any)=>{
        this.cancelledTripList=trip.content;
        this.totalCancelledElements=trip.totalElements;
      }
    });
  }

  //pagination and filter
  pageChanged(event, listStatus){
    console.log(event);

    this.page=event.pageIndex;
    this.size=event.pageSize;

    if(listStatus==='active'){
    this.getActiveTripsList();
   }else if(listStatus==='past'){
    this.getPastTripsList();
   }else if(listStatus==='canceled'){
    this.getCancelledTripsList();
   }

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  

}
