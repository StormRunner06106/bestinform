import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';

import {MatLegacyPaginator as MatPaginator} from '@angular/material/legacy-paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';


import { EditorialsListModel } from '../_models/editorials-list.model';
import { EditorialsService } from '../_services/editorials.service';
import { DeleteEditorialComponent } from '../delete-editorial/delete-editorial.component';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { DatePipe } from '@angular/common';
import { ChangeEditorialStatusComponent } from '../change-editorial-status/change-editorial-status.component';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {User} from "../../../shared/_models/user.model";
import {Resource} from "../../../shared/_models/resource.model";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-editorials-list',
  templateUrl: './editorials-list.component.html',
  styleUrls: ['./editorials-list.component.scss'],
  providers: [DatePipe, NgbActiveModal]
})
export class EditorialsListComponent implements OnInit {

  // Mat Table
  displayedColumns: string[] = ['id', 'title', 'authors', 'category', 'date', 'status','actions'];
  editorialsList: EditorialsListModel[] = [];
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

  createEditorialDate: Date;
  authors=[];
  userId: string;
  userName:string;
  currentUser: User;

  constructor(private editorialsService: EditorialsService,
              private ngbModalService: MatDialog,
              private modalService:ModalService,
              private router:Router,
              private cdr: ChangeDetectorRef,
              private toastService: ToastService,
              public datepipe: DatePipe,
              private activeModal: NgbActiveModal,
              ) { }

  ngOnInit(): void {
       // Initialize Data
    this.initiateData();

    // Listen to List Changes
    this.listChanges();

    // Listen to feedback message
    this.feedbackTriggered();
  }

  // Modal - Delete Editorial
  deleteEditorialModal(elementId: string, elementInfo: string) {
    this.ngbModalService.open(DeleteEditorialComponent);
    this.modalService.setElementId(elementId);
    this.modalService.setElementInfo(elementInfo);
  }

  // Modal - Change Editorial Status
  changeStatusModal(elementId: string, elementInfo: string) {
    this.modalService.setElementId(elementId);
    this.modalService.setElementInfo(elementInfo);
    this.ngbModalService.open(ChangeEditorialStatusComponent);
  }

  getUserById(userId: string){
    this.editorialsService.getUserById(userId).subscribe((userData:User)=>{
      //console.log(userData);
      this.userName=userData.firstName+' '+userData.lastName
    });

  }


  getEditorialsList(){
    // Filter Data
    const filterEditorialData = {
      title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
    };

    this.editorialsService.listEditorialFiltered(this.page, this.pageSize, this.sorting,this.dir, filterEditorialData).subscribe((data: object)=>{
      this.editorialsList = data["content"].map(editorial => {
          return {
              ...editorial,
              date: new Date(editorial.date[0], editorial.date[1] - 1, editorial.date[2], editorial.date[3], editorial.date[4])
          };
      });
      this.totalElements = data["totalElements"];
      //this.totalElements=data.content.length;
    });

  }


    // Listen to data changes and refresh the user list
    listChanges() {
      this.modalService.listChangedObs.subscribe((data: boolean) => {
        // If the response is true
        if (data) {
          // Get Documents List
          this.getEditorialsList();
          this.cdr.detectChanges();

        }
      })
    }

      // Trigger Feedback Message Service
  feedbackTriggered() {
    this.toastService.toastEvents.subscribe((data: boolean) => {

      if (data) {
        // Scroll Top
        window.scrollTo({top: 0, behavior: 'smooth'});

        // Listen to layout changes
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
      this.getEditorialsList();
    }
  }

   // Page Changer
   pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Documents List
    this.getEditorialsList();
  }

   // Filter List
   filterData() {
    // Go to first page
    this.paginator.firstPage();
    // Get All Documents List
    this.getEditorialsList();
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
      this.getEditorialsList();
    }
  }

  //get editorial by Id

  getEditorialById(elementId:string){
    this.editorialsService.getEditorialById(elementId).subscribe((editorial: Resource)=>{
      //console.log(editorial);
      this.router.navigate(['/dashboard/editorials/edit/'+ editorial.slug]);
    });
  }

  //initialize data
  initiateData() {
    this.getEditorialsList();

    // Data Loaded
    this.dataLoaded = true;

    // Change Detection
    this.cdr.detectChanges();
  }


  closeModal() {
    this.ngbModalService.closeAll();

  }

}
