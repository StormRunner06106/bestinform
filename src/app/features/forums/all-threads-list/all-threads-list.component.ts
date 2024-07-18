import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalService} from "../../../shared/_services/modals.service";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {ForumService} from "../_services/forum.service";
import {MatDialog} from "@angular/material/dialog";
import { ToastService } from 'src/app/shared/_services/toast.service';

@Component({
  selector: 'app-all-threads-list',
  templateUrl: './all-threads-list.component.html',
  styleUrls: ['./all-threads-list.component.scss'],
  providers: [NgbModal, DatePipe]
})
export class AllThreadsListComponent implements OnInit {

  // Mat Table
  displayedColumns: string[] = ['id','title', 'authors', 'category', 'date', 'comments', 'status','actions'];
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

  statusInput:string;



  constructor(private forumService: ForumService,
              private ngbModalService: NgbModal,
              private modalService:ModalService,
              private router:Router,
              private cdr: ChangeDetectorRef,
              public datepipe: DatePipe,
              public modal: MatDialog,
              public toastService:ToastService) { }

  ngOnInit(): void {
    // Initialize Data
    this.initiateData();

    // Listen to List Changes
    this.listChanges();

  }



  getDataList(){
    // Filter Data
    const filterData = {
      title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
    };

    this.forumService.listForumThreadFiltered(this.page, this.pageSize, this.sorting,this.dir, filterData).subscribe((data: object)=>{
      this.dataList=data["content"];
      console.log('Forums', this.dataList);
      this.totalElements = data["totalElements"];
    });
  }


  // Listen to data changes and refresh the user list
  listChanges() {
    this.modalService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getDataList();
        this.cdr.detectChanges();

      }
    })
  }


  applyFilter(event?){
    if (event.direction) {

      this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
      this.sorting=event.active

      // Go to first page
      this.paginator.firstPage();

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getDataList();
    }
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
    this.paginator.firstPage();
    // Get All Documents List
    this.getDataList();
  }

  // Sort List
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sorting = sortState.active;
      this.dir = sortState.direction;

      // Go to first page
      this.paginator.firstPage();

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getDataList();
    }
  }

  //initialize data
  initiateData() {
    this.getDataList();

    // Data Loaded
    this.dataLoaded = true;

    // Change Detection
    this.cdr.detectChanges();
  }


  // closeModal() {
  //   this.ngbModalService.dismissAll();
  // }

  openModal(modal, data?: string) {
    this.modal.open(modal);
    this.statusInput = data;
}

closeModal() {
    this.modal.closeAll();
}

changeStatus(threadId, status) {
    console.log('change status', threadId, status)
    this.forumService.changeThreadStatus(threadId, status).subscribe({
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

            if (err.error.reason === 'notAllowed' || err.error.reason === 'tokenExpired') {
              this.toastService.showToast('Error', 'Nu aveti rolul necesar pentru a face aceasta acțiune!', "error");
          }
        }
    })
}

}
