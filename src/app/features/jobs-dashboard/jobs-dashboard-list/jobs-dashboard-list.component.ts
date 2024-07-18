import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { Resource } from 'src/app/shared/_models/resource.model';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ResourcesService } from 'src/app/shared/_services/resources.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {MatDialog} from "@angular/material/dialog";
import { ToastComponent } from 'src/app/theme/components/toast/toast.component';
import { ToastService } from 'src/app/shared/_services/toast.service';

@Component({
  selector: 'app-jobs-dashboard-list',
  templateUrl: './jobs-dashboard-list.component.html',
  styleUrls: ['./jobs-dashboard-list.component.scss'],
  providers: [DatePipe, NgbModal]
})
export class JobsDashboardListComponent {

    // Mat Table
  displayedColumns: string[] = ['id', 'title', 'provider', 'date&hour', 'status', 'views', 'actions'];
  dataList:Array<any>=[];
  myList = [];
  pageItems = [10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  //on destroy component
  ngUnsubscribe= new Subject<void>();

  // Mat Table - Filter Forms
  searchFilter: FormControl = new FormControl('');

  // Data Loaded
  dataLoaded: boolean;

  // Mat Table - pagination, sorting, filtering
  page = 0;
  sorting = "lastUpdateDate";
  dir = 'desc';
  pageSize= 10;
  totalElements: number;
  jobDomainId:string;

  providerName:string;
  statusInput: string;


  constructor(
    private ngbModalService: NgbModal,
    private resourcesService:ResourcesService,
    private modalService:ModalService,
    private router:Router,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private userService: UserDataService,
    private modal: MatDialog,
    private toastService:ToastService
    ) { }

    ngOnInit(): void {
      // Initialize Data
      this.initiateData();

    // Listen to List Changes
    this.listChanges();
    }

    initiateData(){
      this.resourcesService.getListOfDomains()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (domain:any)=>{

          domain.forEach(element => {
            if(element.key === 'jobs'){
              this.jobDomainId=element.id;
            }

          });
          console.log('id job', this.jobDomainId);
          this.getJobList();
           // Data Loaded
          this.dataLoaded = true;

          // Change Detection
          this.cdr.detectChanges();
        }
      })
    }

   
    getJobList(){
      const filterObj={
        title: this.searchFilter.value === '' ? null :this.searchFilter.value,
        domain: this.jobDomainId
      }

      this.resourcesService.listResourceFiltered(this.page, this.pageSize, this.sorting, this.dir,filterObj )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (jobList: any)=>{
          this.dataList=jobList.content;
          this.totalElements=jobList.totalElements;
     
          console.log('din job list, obiectul',filterObj);

     }});
    }

    // Listen to data changes and refresh the user list
  listChanges() {
    this.modalService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
    // Get All Job List
    this.getJobList();
        this.cdr.detectChanges();
        this.modalService.triggerUserListChanges(false);

      }
    })
  }

   // Filter List
   filterData() {
    // Go to first page
    // this.paginator.firstPage();
    this.page=0;

    // Get All Job List
    this.getJobList();
  }

  // Sort List
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sorting = sortState.active;
      this.dir = sortState.direction;

      // Go to first page
      // this.paginator.firstPage();
      this.page=0;


      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All job List
      this.getJobList();
    }
  }

  applyFilter(event?){
    if (event.direction) {

      this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
      if(event.active === 'provider'){
        this.sorting='userId';

      }else if(event.active === 'date&hour'){
        this.sorting='date';
      }else{
        this.sorting=event.active
      }

      // Go to first page
      // this.paginator.firstPage();
      this.page=0;

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getJobList();
    }
  }

  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Job List
    this.getJobList();
  }

    changeStatus(jobId, status) {
      console.log('change status', jobId, status)

      this.resourcesService.changeStatusForResource(jobId, status).subscribe({
          next: (resp: { success: boolean, reason: string }) => {
              if (resp.success) {
                this.modalService.triggerUserListChanges(true);

                  this.toastService.showToast('Success', 'Statusul resursei a fost modificat!', 'success');
                  this.modal.closeAll();
              }
          },
          error: (err: any) => {
              console.log(err);
              if (err.error.reason === 'invalidId') {
                  this.toastService.showToast('Error', 'Această resursă nu mai există în baza de date!', "error");
              }

              if (err.error.reason === 'notLoggedIn' || err.error.reason === 'tokenExpired') {
                  this.toastService.showToast('Error', 'Pentru a finaliza această acțiune trebuie să fii logat!', "error");
              }
          }
      })
  }

  openModal(modal, data?: string) {
    this.modal.open(modal);
    this.statusInput = data;
}

    closeModal() {
      this.modal.closeAll();
  }

    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  
}
