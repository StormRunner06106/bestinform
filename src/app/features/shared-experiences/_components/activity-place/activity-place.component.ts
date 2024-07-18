import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {ResourcesService} from "../../../../shared/_services/resources.service";
import {PaginationResponse} from "../../../../shared/_models/pagination-response.model";
import {Resource} from "../../../../shared/_models/resource.model";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { FormControl } from '@angular/forms';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-activity-place',
  templateUrl: './activity-place.component.html',
  styleUrls: ['./activity-place.component.scss'],
  providers: [DatePipe]
})
export class ActivityPlaceComponent implements OnInit, OnDestroy{

  searchFilter: FormControl = new FormControl('');
  chosenResource: any;
  chosenResourceTimeslots = [];
  date: string;
  slotChosen: string;
  showErrorMsg = false;

  today = new Date();

  timeslotsArray = [];

  bookingTimeslotId: string;

  private ngUnsubscribe = new Subject<void>();

  @Output() sentResource = new EventEmitter<Resource>();

  // information about filters and pagination
  paginationInfo: any;

  pageNumber: number;
  pageSize: number;
  pageSizeArray = [5, 10, 25, 100];
  sorting = 'date';
  dir = 'desc';

  resourcesArray : Array<Resource>

  constructor(private resourceService: ResourcesService,
              private modalService: NgbModal,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.pageSize = 5;
    this.pageNumber = 1;

    this.getActivityResources();
  }

  getActivityResources(){
    this.resourcesArray = [];
    const filterObj = {
      title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
      sharedExperience : true,
      availableResource: true
    }
    this.resourceService.listResourceFiltered(this.pageNumber - 1, this.pageSize,this.sorting, this.dir, filterObj)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(resources:PaginationResponse)=>{
          console.log(resources.content);
          this.paginationInfo = resources;
          this.resourcesArray = resources.content;
          }})
  }

  pageChanged(event){
    this.resourcesArray = [];
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    const filterObj = {
      title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
      sharedExperience : true,
      availableResource: true
    }
    this.resourceService.listResourceFiltered(this.pageNumber - 1, this.pageSize,this.sorting, this.dir, filterObj)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({next:(resources:PaginationResponse)=>{
            this.paginationInfo = resources;
            this.resourcesArray = resources.content;
          }})

  }

  getTimepickerForResource(resourceId){
    this.resourceService.getTimeslotsByResourceId(resourceId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next:(timeslots:any) =>{
            this.timeslotsArray = timeslots;
            console.log('toate activitatile', timeslots);
            console.log('TIMESLOTS FOR CHOSEN RS', timeslots[0]?.slotItems);
            this.bookingTimeslotId = null;
            this.date = null;
          }
        })
  }

  bookingTimeslotChanged(id){
    console.log(id);
    this.bookingTimeslotId = id;
    this.date = null;
    this.chosenResourceTimeslots = [];
  }

  sendResource(objToSend){
    this.sentResource.emit(objToSend);
  }

  dateChanged(){
    console.log(this.datePipe.transform(this.date, 'EEEE'));
    this.slotChosen = undefined;
    this.resourceService.getAvailableSlotByDate(this.bookingTimeslotId, this.datePipe.transform(this.date, 'yyyy-MM-dd'))
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next:(timeslots:any) =>{
            console.log('TIMESLOTS FOR CHOSEN RS', timeslots);
            this.chosenResourceTimeslots = timeslots;
          }
        })
  }

  confirm(){
    if(this.chosenResource !== null && this.date !== null && this.slotChosen !== undefined){
      const objToSend = {
        ...this.chosenResource,
        chosenDate: this.datePipe.transform(this.date, 'yyyy-MM-dd'),
        chosenSlot: this.slotChosen,
        bookingTimeslot: this.bookingTimeslotId
      }
      console.log(this.slotChosen)
      this.sendResource(objToSend);
      this.modalService.dismissAll();
      this.showErrorMsg = false;
    }else{
      this.showErrorMsg = true;
      return;
    }

  }

  openModal(content, resource){
    this.modalService.open(content, {centered: true, size: 'md'});
    this.getTimepickerForResource(resource.id);
    console.log(resource)
    this.chosenResource = resource;
    this.chosenResourceTimeslots = [];
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
