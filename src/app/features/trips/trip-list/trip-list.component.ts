import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LocationsService } from '../_services/locations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ArchiveTripComponent } from '../archive-trip/archive-trip.component';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  providers:[DatePipe]
})
export class TripListComponent {

  private ngUnsubscribe = new Subject<void>();

  // Mat Table
  displayedColumns: string[] = ['id','name', 'status', 'location', 'country','actions'];
  dataList = [];
  pageItems = [10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  // Mat Table - Filter Forms
  searchFilter: FormControl = new FormControl('');

  // Data Loaded
  dataLoaded: boolean;

  // Mat Table - pagination, sorting, filtering
  page = 0;
  sorting = "date";
  dir = 'desc';
  pageSize= 10;
  totalElements: number;
  

        
  constructor(private locationsService: LocationsService,
    private ngbModalService: NgbModal,
    private modalService:ModalService,
    private router:Router,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    public dialog:MatDialog,
    
    ) { }

  ngOnInit(): void {
    // Initialize Data
    this.initiateData();

    // Listen to List Changes
    this.listChanges();

  }

  initiateData(){
    this.getDataList();

    // Data Loaded
    this.dataLoaded = true;

    // Change Detection
    this.cdr.detectChanges();
  }

  listChanges(){
    this.modalService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getDataList();
        this.cdr.detectChanges();
        this.modalService.triggerUserListChanges(false);

      }
    })
  }

  getDataList(){
    const searchObj={
      name: this.searchFilter.value ? this.searchFilter.value : '',
    }
    this.locationsService.listTripsFiltered(this.page, this.pageSize, this.sorting, this.dir,searchObj)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((res:any)=>{
      console.log(res.content);
      this.dataList=res.content;
      
      this.totalElements=res.totalElements;
    });
  }

  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Documents List
    this.getDataList();
  }

   // Filter List
   filterData() {
    // Go to first page
    this.page=0;
    // Get All Documents List
    this.getDataList();
  }

  // Sort List
  applyFilter(sortState: Sort) {
    if (sortState.direction) {
      this.sorting = sortState.active;
      this.dir = sortState.direction;

      // Go to first page
      this.page=0;
      // Listen to layout changes
      this.cdr.detectChanges();

      // Get List
      this.getDataList();
    }
  }

  // Modal - request doc
  archiveTripModal(elementId: string) {
    this.ngbModalService.open(ArchiveTripComponent, {centered: true});
    this.modalService.setElementId(elementId);
}

 

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
  
}
