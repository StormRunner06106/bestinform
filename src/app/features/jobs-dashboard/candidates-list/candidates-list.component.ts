import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {PageEvent} from "@angular/material/paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {Subject, takeUntil} from "rxjs";
import {FormControl} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ModalService} from "../../../shared/_services/modals.service";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {UserDataService} from "../../../shared/_services/userData.service";
import {MatDialog} from "@angular/material/dialog";
import {ToastService} from "../../../shared/_services/toast.service";
import {JobService} from "../../jobs/_services/job.service";
import {MatLegacyPaginator as MatPaginator} from '@angular/material/legacy-paginator';

@Component({
  selector: 'app-candidates-list',
  templateUrl: './candidates-list.component.html',
  styleUrls: ['./candidates-list.component.scss'],
  providers: [DatePipe, NgbModal]

})
export class CandidatesListComponent {

  // Mat Table
  displayedColumns: string[] = ['id', 'name', 'isPublic', 'actions'];
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
  sorting = "date";
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
      private toastService:ToastService,
      private jobService: JobService
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
            this.getData();
            // Data Loaded
            this.dataLoaded = true;

            // Change Detection
            this.cdr.detectChanges();
          }
        })
  }


  getData(){
    const filterObj={
      name: this.searchFilter.value === '' ? null :this.searchFilter.value
    }

    this.jobService.getListCvFilteredpage(this.page, this.pageSize, this.sorting, this.dir,filterObj).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (resp: any)=>{
            this.dataList=resp.content;
            this.totalElements=resp.totalElements;

            console.log('obiectul',filterObj);

          }});
  }


  // Listen to data changes and refresh the user list
  listChanges() {
    this.modalService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get All Job List
        this.getData();
        this.cdr.detectChanges();
        this.modalService.triggerUserListChanges(false);

      }
    })
  }

  // Filter List
  filterData() {
    // Go to first page
    this.paginator.firstPage();
    // this.page=0;

    // Get All Job List
    this.getData();
  }

  // Sort List
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sorting = sortState.active;
      this.dir = sortState.direction;

      // Go to first page
      this.paginator.firstPage();
      // this.page=0;


      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All job List
      this.getData();
    }
  }

  applyFilter(event?){
    if (event.direction) {

      this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
      this.sorting=event.active

      // Go to first page
      this.paginator.firstPage();
      // this.page=0;

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getData();
    }
  }

  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Job List
    this.getData();
  }

  changeStatus(elementId, status) {
    console.log('change status', elementId, status)

    this.resourcesService.changeStatusForResource(elementId, status).subscribe({
      next: (resp: { success: boolean, reason: string }) => {
        if (resp.success) {
          this.modalService.triggerUserListChanges(true);

          this.toastService.showToast('Success', 'Vizibilitatea CV-ului a fost modificată!', 'success');
          this.modal.closeAll();
        }
      },
      error: (err: any) => {
        console.log(err);
        this.toastService.showToast('Error', 'Vizibilitatea CV-ului NU a fost modificată!', "error");

      }
    })
  }

  deleteElement(elementId: string) {
    console.log('test', elementId);
    this.jobService.deleteCvById(elementId).subscribe({
      next: (resp: { success: boolean, reason: string }) => {
        if (resp.success) {
          this.modalService.triggerUserListChanges(true);

          this.toastService.showToast('Success', 'CV-ul a fost sters!', 'success');
          this.modal.closeAll();
        }
      },
      error: (err: any) => {
        console.log(err);
        this.toastService.showToast('Error', 'CV-ul NU a putut fi sters!', "error");
      }
    })
  }

  downloadCv(cv: any){
    console.log('cv', cv)
    const link = document.createElement('a');
    link.href = cv.filePath;
    link.download = cv.fileName;
    link.target = '_blank';
    link.click();
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

