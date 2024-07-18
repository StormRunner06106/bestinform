import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalService} from "../../../shared/_services/modals.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe, DecimalPipe} from "@angular/common";
import {ForumService} from "../_services/forum.service";
import {UserDataService} from "../../../shared/_services/userData.service";
@Component({
  selector: 'app-threads-list',
  templateUrl: './threads-list.component.html',
  styleUrls: ['./threads-list.component.scss'],
  providers: [DatePipe, DecimalPipe]
})
export class ThreadsListComponent {

  // Mat Table
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

  forumCategory: string;


  constructor(private forumService: ForumService,
    private ngbModalService: NgbModal,
    private modalService:ModalService,
    private router:Router,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private route: ActivatedRoute,
              private userService: UserDataService) { }

    ngOnInit(): void {
    // Initialize Data
    this.initiateData();

    // // Listen to List Changes
    // this.listChanges();
    }


    getDataList(){
      // Filter Data
      const filterData = {
        title: this.searchFilter.value !== '' ? this.searchFilter.value : null,
        category: this.forumCategory,
        status: "active"
        // userId: "string",

      };
      this.forumService.listForumThreadFiltered(this.page, this.pageSize, this.sorting,this.dir, filterData).subscribe((data: object)=>{
        this.dataList=data["content"];
        console.log('Forums', this.dataList);
        this.totalElements = data["totalElements"];
      });
    }

    initiateData(){

      this.route.params.subscribe(params => {
        if (params['category']) {
         console.log('category FORUM', params['category']);
         this.forumCategory = params['category'];
          this.getDataList();
          // Data Loaded
          this.dataLoaded = true;

          // Change Detection
          this.cdr.detectChanges();
        }
      });



    }
    //
    // listChanges(){
    //   this.modalService.listChangedObs.subscribe((data: boolean) => {
    //     // If the response is true
    //     if (data) {
    //       // Get Documents List
    //       this.getDataList();
    //       this.cdr.detectChanges();
    //     }
    //   })
    // }


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

    closeModal() {
      this.ngbModalService.dismissAll();
    }
}
