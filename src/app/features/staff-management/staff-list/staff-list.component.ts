import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import { ModalService } from 'src/app/shared/_services/modals.service';
import {PageEvent} from "@angular/material/paginator";
import {StaffService} from "../../../shared/_services/staff.service";

@Component({
  selector: 'app-staff-dashboard-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;


  usersLoaded = false;

  // initial filter numbers
  pageNumber: number;
  pageSize: number;
  pageSizeArray = [6, 9, 12];

  //searched name
  searchText: string;

  // information about filters and pagination
  paginationInfo: object;

  // users on current page
  usersList = [];

  constructor(private staffService: StaffService,
    private cdr:ChangeDetectorRef,
    private modalService:ModalService,
    ) { }

  ngOnInit(): void {
    this.pageNumber = 1;
    this.pageSize = 6;
    this.getUsers();
       // Listen to List Changes
   this.listChanges();
  }

    //changed page
    pageChanged(event: PageEvent){

      this.pageNumber = event.pageIndex;
      this.pageSize = event.pageSize;

      console.log(event);


      const activeFilter = {
        firstName: this.searchText,
          roles: ["ROLE_STAFF"]
      };

      // Get All Documents List
      this.staffService.listUsersFiltered(this.pageNumber,this.pageSize,'','',activeFilter).subscribe( (res: object) => {
        console.log(res);
        this.paginationInfo = res;
        this.usersList = res["content"];
        console.log(this.usersList);
        console.log("din page changed",res);
        this.usersLoaded = true;
      });

      // Listen to layout changes
      this.cdr.detectChanges();
    }


       // Listen to data changes and refresh the user list
       listChanges() {
        this.modalService.listChangedObs.subscribe((data: boolean) => {
          // If the response is true
          if (data) {
            // Get Documents List
            this.getUsers();

            // Reset Obs Trigger
            this.modalService.triggerUserListChanges(false);
          }
        })
      }

  getUsers() {
    this.pageNumber=1;
    const activeFilter ={
      firstName: this.searchText,
        roles: ["ROLE_STAFF"]
    };

    this.staffService.listUsersFiltered(this.pageNumber - 1,this.pageSize,'','',activeFilter).subscribe( (res: object) => {
      console.log(res);
      this.paginationInfo = res;
      this.usersList = res["content"];
      console.log(this.usersList);
      console.log("despre paginare",res);
      this.usersLoaded = true;
    });

     // Listen to layout changes
     this.cdr.detectChanges();
  }

  onPageChange() {
    this.getUsers();
  }

  search(text: string, event?) {
    // console.log(event);
    if (event && event.key === 'Enter' || event) {
      console.log(text);
      this.searchText=text;
      console.log(this.searchText);
      this.getUsers();
    }
    if (!event) {
      console.log(text);
      this.searchText=text;
      console.log(this.searchText);
    }
  }

  ngAfterViewInit(){
    document.getElementById('preloader').classList.add('hide');
  }

}
