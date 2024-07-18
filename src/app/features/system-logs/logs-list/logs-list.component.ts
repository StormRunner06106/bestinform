import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {ForumService} from "../../forums/_services/forum.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalService} from "../../../shared/_services/modals.service";
import {Router} from "@angular/router";
import {DatePipe} from "@angular/common";
import {LogsService} from "../_services/logs.service";

@Component({
  selector: 'app-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss'],
  providers: [NgbModal, DatePipe]
})

export class LogsListComponent implements OnInit {

  // Mat Table
  displayedColumns: string[] = ['date', 'action', 'user'];
  dataList = [];
  pageItems = [10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  // Mat Table - Filter Forms
  filterName: string;
  filterActionType: string = undefined;

  // Data Loaded
  dataLoaded: boolean;

  // Mat Table - pagination, sorting, filtering
  page = 0;
  sorting = "date";
  dir = 'desc';
  pageSize= 10;
  totalElements: number;

   actionTypes: { value: string, title: string }[] = [
    { value: 'create', title: 'creare' },
    { value: 'update', title: 'actualizare' },
    { value: 'delete', title: 'ștergere' },
    { value: 'changeAttributeOrder', title: 'schimbare ordine atribut' },
    { value: 'changeMediaStatus', title: 'schimbare status media' },
    { value: 'deleteProductAttachment', title: 'ștergere atașament produs' },
    { value: 'buySubscription', title: 'cumpărare subscribtie' },
    { value: 'cancelSubscription', title: 'anulare subscribtie' },
    { value: 'changePurchasedSubscriptionStatus', title: 'schimbare status subscribtie' },
    { value: 'makeAutoRenewTrue', title: 'activare reînnoire automată subscribtie' },
    { value: 'changeValidityStatus', title: 'schimbare status validitate' },
    { value: 'changeReservationStatus', title: 'schimbare status rezervare' },
    { value: 'updateReservation', title: 'actualizare rezervare' },
    { value: 'changeResourceStatus', title: 'schimbare status resursa' },
    { value: 'changeResourceCategoryEnableForListStatus', title: 'schimbare status de vizibilitate in listă pentru categorie de resurse' },
    { value: 'deleteResourceFeatureImage', title: 'ștergere imagine reprezentativă resursă' },
    { value: 'deleteParticipantFromSharedExperience', title: 'ștergere participant din shared experience' },
    { value: 'leaveSharedExperience', title: 'părăsire shared experience' },
    { value: 'changeStatus', title: 'schimbare status' },
    { value: 'disableThreadComment', title: 'dezactivare postarea de comentarii în thread' },
    { value: 'changeTripStatus', title: 'schimbare status trip' },
    { value: 'addUser', title: 'adăugare user' },
    { value: 'updateUser', title: 'actualizare user' },
    { value: 'changeUserPassword', title: 'schimbare parolă utilizator' },
    { value: 'changeUserStatus', title: 'schimbare status utilizator' },
    { value: 'changeActiveStatus', title: 'schimbare status cont' },
    { value: 'updateUserPreferences', title: 'schimbare preferinte utilizator' },
  ];


  constructor(private logsService: LogsService,
              private ngbModalService: NgbModal,
              private modalService:ModalService,
              private router:Router,
              private cdr: ChangeDetectorRef,
              public datepipe: DatePipe) { }

  ngOnInit(): void {
    // Initialize Data
    this.initiateData();

    // Listen to List Changes
    this.listChanges();

  }



  getDataList(){

    const filterObj = {
      activityTpe: this.filterActionType,
      userName: this.filterName
    }

    this.logsService.listLogsFiltered(this.page, this.pageSize, this.sorting,this.dir, filterObj).subscribe((data: object)=>{
      this.dataList=data["content"];
      console.log('Logs', this.dataList);
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

    console.log('apply filter', event);

    if (event?.direction) {

      this.dir = (event.direction === 'desc') || (event.direction === '') ? 'desc' : 'asc';
      this.sorting=event.active

      // Go to first page
      this.paginator.firstPage();

      // Listen to layout changes
      this.cdr.detectChanges();

      // Get All Documents List
      this.getDataList();
    } else {
      this.paginator.firstPage();
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


  closeModal() {
    this.ngbModalService.dismissAll();
  }

  clearfilterName() {
    this.filterName = undefined;
  }

  clearFields() {
    this.filterName = undefined;
    this.filterActionType = undefined;
    this.paginator.firstPage();
    this.getDataList();
  }
}

