import { Component, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ForumService } from '../_services/forum.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { disable } from 'ol/rotationconstraint';

@Component({
  selector: 'app-thread-comments-list',
  templateUrl: './thread-comments-list.component.html',
  styleUrls: ['./thread-comments-list.component.scss'],
  providers:[DatePipe]
})
export class ThreadCommentsListComponent {

  private ngUnsubscribe = new Subject<void>();

  displayedColumns: string[] = ['id', 'userName', 'date', 'content','disable' ,'actions'];
  dataList = [];
  pageItems = [10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  @Input() threadId:string;
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
    // const filterData = {
    //   title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
    // };

    this.forumService.listAllThreadComments(this.threadId, this.page, this.pageSize, this.sorting,this.dir)
    .subscribe((data: object)=>{
      this.dataList=data["content"];
      console.log('Forums', this.dataList);
      this.totalElements = data["totalElements"];
    });
  }

  // Listen to data changes and refresh the user list
  listChanges() {
    this.forumService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getDataList();
      }
    })
    this.forumService.triggerUserListChanges(false);

  }

  applyFilter(event?){
    if (event.direction) {

      this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
      this.sorting=event.active

      // Go to first page
      this.page=0;      

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

    this.page=0;
    this.getDataList();
  }

  // Sort List
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.sorting = sortState.active;
      this.dir = sortState.direction;

      this.page=0;

      // Get All Documents List
      this.getDataList();
    }
  }

  //initialize data
  initiateData() {
    this.getDataList();

    // Data Loaded
    this.dataLoaded = true;
  }

  disableComment(commentId:string, disable:boolean){

    this.forumService.disableThreadComment(commentId, disable)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next:( res: {success: string, reason:string})=>{
        this.toastService.showToast('Success', 'Comentariul a fost dezactivat!', 'success');
        this.forumService.triggerUserListChanges(true);
        this.closeModal();

      }, error:(err: {success: string, reason:string})=>{
        this.toastService.showToast('Error', 'A aparut o eroare!', 'error');
        console.log(err.reason);
      }
    });
  }

  openModal(modal, data?: string) {
    this.modal.open(modal, { maxWidth: 720});
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
