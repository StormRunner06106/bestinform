import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {UserDataService} from "../../shared/_services/userData.service";
import {TranslateModule} from "@ngx-translate/core";
import {MatLegacyPaginator as MatPaginator, MatLegacyPaginatorModule} from "@angular/material/legacy-paginator";
import {MatSort} from "@angular/material/sort";
import {DashboardHeaderComponent} from "../dashboard-header/dashboard-header.component";
import {MatTableResponsiveDirective} from "../../shared/mat-table-responsive/mat-table-responsive.directive";
import {MatLegacyTableModule} from "@angular/material/legacy-table";
import {User} from "../../shared/_models/user.model";
import { MatDialog } from '@angular/material/dialog';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

@Component({
    selector: 'app-clients-list',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, TranslateModule, MatLegacyPaginatorModule, MatLegacyTableModule, DashboardHeaderComponent, MatSelectModule, FormsModule, MatTooltipModule, ReactiveFormsModule, MatSlideToggleModule],
    templateUrl: './clients-list.component.html',
    styleUrls: ['./clients-list.component.scss'],
    providers: [MatTableResponsiveDirective, NgbModal, DatePipe]
})
export class ClientsListComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    private ngUnsubscribe = new Subject<void>();

    displayedColumns = ['id', 'name', 'registrationDate','email', 'package' ,'status', 'approvedStatus', 'actions'];
    pageSizeArray = [ 10, 25, 100];
    pageSize = 25;
    totalElements: number;
    sorting = 'registrationDate';
    dir = 'desc';
    pageNumber = 0;
    dataSource = [];

    isAdmin = false;
    isStaff = false;

    statusInput:string;


    constructor(private userService: UserDataService,
        public modal: MatDialog,
        public toastService: ToastService,
        public modalService: ModalService,
        private cdr: ChangeDetectorRef,

        ) {
    }

    ngOnInit() {
        this.getClients();
        this.getCurrentUserRole();
        this.listChanged();
    }

    listChanged(){
        this.modalService.listChangedObs.subscribe((data: boolean) => {
            // If the response is true
            if (data) {
              // Get Documents List
              this.getClients();
              this.cdr.detectChanges();

            }
          })
          this.modalService.triggerUserListChanges(false);

    }

    getClients() {
        const filter = {
            roles: ["ROLE_CLIENT"]
        }
        this.userService.listUsersFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filter)
            .subscribe({
                next: (usersList: any) => {
                    this.dataSource = usersList.content;
                    this.totalElements = usersList.totalElements;
                }
            })
    }


    getCurrentUserRole() {
        this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                if (user.roles.includes('ROLE_SUPER_ADMIN')) {
                    this.isAdmin = true;
                    this.isStaff = false;
                }

                if (user.roles.includes('ROLE_STAFF')) {
                    this.isAdmin = false;
                    this.isStaff = true;
                }
            }
        })
    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getClients();
    }

    changeStatus(elementId: string, status: boolean) {
       console.log(elementId, status);

       this.userService.changeActiveStatus(elementId, status)
       .pipe(takeUntil(this.ngUnsubscribe))
       .subscribe({
        next: ()=>{
            this.toastService.showToast("Success", "Statusul clientului a fost schimbat!", "success");
            this.modalService.triggerUserListChanges(true);
        },
        error: ()=>{
            this.toastService.showToast("Error", "A aparut o eroare!", "error");
        }
        });

       //close the modal
       this.closeModal()
    }

    openModal(modal, data?: string) {
        this.modal.open(modal);
        this.statusInput = data;
    }

    closeModal() {
        this.modal.closeAll();
    }

    updateApprovedStatus(id: string, event: Event) {
        console.log('id: ', id, ' event: ', event["checked"]);
        const approvedStatus = event["checked"] ? 'approved' : 'pending';
        this.userService.changeUserStatus(id, approvedStatus).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: ()=>{
                    this.toastService.showToast("Success", "Statusul clientului a fost schimbat!", "success");
                    this.modalService.triggerUserListChanges(true);
                },
                error: ()=>{
                    this.toastService.showToast("Error", "A aparut o eroare!", "error");
                }
            });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }


}
