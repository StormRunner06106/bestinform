import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {PageEvent} from "@angular/material/paginator";
import {ReservationsService} from "../../../shared/_services/reservations.service";
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";

@Component({
  selector: 'app-flight-reservations-list',
  templateUrl: './flight-reservations-list.component.html',
  styleUrls: ['./flight-reservations-list.component.scss']
})
export class FlightReservationsListComponent implements OnInit, OnDestroy{

  private ngUnsubscribe = new Subject<void>();

  displayedColumns = ['id', 'route','dateDeparture' ,'dateReturn', 'flightType'];
  pageSizeArray = [ 10, 25, 50, 100];
  pageSize = 10;
  totalElements: number;
  sorting = 'date';
  dir = 'desc';
  pageNumber = 0;
  dataSource = [];

  isAdmin = false;
  isStaff = false;

  constructor(private reservationsService: ReservationsService,
              private userDataService: UserDataService) {
  }

  ngOnInit() {
    this.getCurrentUser();
    this.getFlights();
  }

  getFlights(){
    this.reservationsService.getFlights(this.pageSize, this.pageNumber, this.sorting, this.dir)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (flightsList: any) => {
            this.dataSource = flightsList.content;
            this.totalElements = flightsList.totalElements;
            console.log('TOTAL ELEMENTS NUMBER', flightsList.totalElements)
          }
        })
  }

  getCurrentUser(){
    this.userDataService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (currentUser: User) => {
            if(currentUser.roles.includes('ROLE_STAFF')){
              this.isStaff = true;
              this.isAdmin = false;
            }else if(currentUser.roles.includes('ROLE_SUPER_ADMIN')){
              this.isAdmin = true;
              this.isStaff = false;
            }
          }
        })
  }

  pageChanged(event: PageEvent){
    this.pageNumber = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getFlights();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
