import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ProvidersService} from 'src/app/shared/_services/providers.service';
import {ProvidersModel} from '../_models/providers.model';
import {ChangeDetectorRef} from '@angular/core';
import {MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort} from '@angular/material/sort';
import {ProviderRequestComponent} from '../provider-request/provider-request.component';
import {ModalService} from 'src/app/shared/_services/modals.service';
import {ChangeStatusProviderComponent} from '../change-status-provider/change-status-provider.component';
import {Router} from '@angular/router';
import {PageEvent} from "@angular/material/paginator";
import {DomainsService} from "../../../shared/_services/domains.service";
import {CreateResourceService} from "../../../shared/_services/createResource.service";
import {StatusProviderComponent} from "../status-provider/status-provider.component";
import {MatDialog} from "@angular/material/dialog";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-list-providers',
    templateUrl: './list-providers.component.html',
    styleUrls: ['./list-providers.component.scss'],
    providers: [NgbActiveModal]
})
export class ListProvidersComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    //table
    displayedColumns: string[] = ['id', 'title', 'email', 'cui', 'country', 'city', 'domain', 'approvedStatus', 'actions'];
    dataSource = [];
    providersList: ProvidersModel[] = [];
    dataLoaded: boolean

    // initial pagination numbers
    pageNumber = 0;
    pageSize = 25;
    pageSizeArray = [ 10, 25, 100];
    totalElements: number;

    isApprovedStatus = ['draft', 'pending', 'active', 'inactive', 'refused', 'archived'];
    isActive: boolean;
    sorting = "registrationDate";
    dir = 'desc';

    isAdmin:boolean;
    isStaff:boolean;

    selectedTabIndex: number;



    constructor(private providersServices: ProvidersService,
                private cdr: ChangeDetectorRef,
                private modalService: ModalService,
                private ngbModalService: MatDialog,
                private router: Router,
                private domainService: DomainsService,
                private createResourceService: CreateResourceService,
                private activeModal: NgbActiveModal,
                ) {
    }

    // Mat Table - Filter Forms
    searchFilter: FormControl = new FormControl('');

    ngOnInit(): void {

        // console.log('RUTA', this.router.url);
        if (this.router.url.includes('active')) {
            this.isApprovedStatus = ['draft', 'pending', 'active', 'inactive', 'refused', 'archived'];
            this.initiateData();


        } else if (this.router.url.includes('pending')) {
            this.isApprovedStatus = ["new"];
            this.displayedColumns = ['id', 'title', 'email', 'cui', 'country', 'city',  'domain', 'activeStatus' ,'approvedStatus', 'actions'];

            this.initiateData();
        }

        // Listen to List Changes
        this.listChanges();

        //this.getActiveProvidersList();
        this.selectedTabIndex = 0;
    }



    //initialize data
    initiateData() {

        const filters = {
            roles: ['ROLE_PROVIDER'],
            approvedStatuses: this.isApprovedStatus,
            companyName: this.searchFilter.value !== '' ? this.searchFilter.value : null
        };

        this.providersServices.listProvidersFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filters).subscribe((activeProvidersList: object) => {
            this.providersList = activeProvidersList["content"];
            this.totalElements = activeProvidersList["totalElements"];
            this.cdr.detectChanges();


            console.log('CONTENT', activeProvidersList["content"])
            //VARIANTA PROVIZORIE PENTRU INLOCUIREA NUMELUI LA DOMENII
            // this.providersList.forEach((provider: ProvidersModel, index: number) => {
            //     this.domainService.getDomainById(provider.domain).subscribe((domainName) => {
            //         this.providersList[index].domain = domainName?.nameEn;
            //     })
            // })
        });

        // Data Loaded
        this.dataLoaded = true;

        // Change Detection
        this.cdr.detectChanges();
    }

    // Listen to data changes and refresh the user list
    listChanges() {
        this.modalService.listChangedObs.subscribe((data: boolean) => {

            // console.log('schimbaree');

            // If the response is true
            if (data) {
                // Get Documents List
                this.initiateData();
                this.cdr.detectChanges();

                // Reset Obs Trigger
                this.modalService.triggerUserListChanges(false);
            }
        })
    }

    //search filter
    filterData() {
        // Go to first page
        this.paginator.firstPage();
        this.initiateData();
    }

    //sorting
    applyFilter(event?) {
        if (event.direction) {
            console.log(event);
            this.dir = event.direction;
            // this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : '';

            this.sorting = (event.active === 'title') ? 'companyName' : event.active;

            // Go to first page
            this.paginator.firstPage();

            // Listen to layout changes
            this.cdr.detectChanges();

            // Get All Documents List
            this.initiateData();
        }
    }

    //changed page
    pageChanged(event: PageEvent) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;

        // Listen to layout changes
        this.cdr.detectChanges();

        // Get All Documents List
       this.initiateData();
    }


    //change status
    changeStatusModal(elementId: string, elementInfo: string) {
        console.log(elementInfo)
        this.modalService.setElementId(elementId);
        this.modalService.setElementInfo(elementInfo);
        this.ngbModalService.open(ChangeStatusProviderComponent);

    }

    // Modal - Provider Request doc
    providerRequest(elementId: string) {
        this.ngbModalService.open(ProviderRequestComponent);
        this.modalService.setElementId(elementId);
    }

    // Modal - blocare
    blockProvider(elementId: string) {
        const modalRef = this.ngbModalService.open(StatusProviderComponent);
        modalRef.componentInstance.actionType = 'archived';
        this.modalService.setElementId(elementId);

    }

    sendProviderData(providerId: string, companyName: string, cui: string){
        const providerData ={
            providerId: providerId,
            companyName: companyName,
            cui: cui
        }

        this.createResourceService.providerData$.next(providerData);
    }


}
