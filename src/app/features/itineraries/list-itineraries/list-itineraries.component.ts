import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {EditorialsListModel} from "../../editorials/_models/editorials-list.model";
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {User} from "../../../shared/_models/user.model";
import {EditorialsService} from "../../editorials/_services/editorials.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalService} from "../../../shared/_services/modals.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../../../shared/_services/toast.service";
import {DatePipe} from "@angular/common";
import {DeleteEditorialComponent} from "../../editorials/delete-editorial/delete-editorial.component";
import {
    ChangeEditorialStatusComponent
} from "../../editorials/change-editorial-status/change-editorial-status.component";
import {Resource} from "../../../shared/_models/resource.model";
import {ItinerariesService} from "../_services/itineraries.service";
import {Itinerary} from "../../../shared/_models/itinerary.model";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-list-itineraries',
    templateUrl: './list-itineraries.component.html',
    styleUrls: ['./list-itineraries.component.scss'],
    providers: [DatePipe]
})
export class ListItinerariesComponent {


    // Mat Table
    displayedColumns: string[] = ['id', 'title', 'date', 'typeOfDestination', 'typeOfJourney', 'journeyTheme', 'actions'];
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
    pageSize = 10;
    totalElements: number;


    constructor(private dataService: ItinerariesService,
                private ngbModalService: NgbModal,
                private modalService: ModalService,
                private router: Router,
                private route: ActivatedRoute,
                private cdr: ChangeDetectorRef,
                private toastService: ToastService,
                public datepipe: DatePipe,
                private modal: MatDialog) {
    }

    ngOnInit(): void {
        // Initialize Data
        this.initiateData();
    }


    getList() {
        // Filter Data
        const filterData = {
            name: this.searchFilter.value !== '' ? this.searchFilter.value : null,
            excludedStatus: "clientItinerary"
        };

        this.dataService.listItinerariesFiltered(this.page, this.pageSize, this.sorting, this.dir, filterData).subscribe((data: object) => {
            console.log(data);
            this.editorialsList = data["content"];
            this.totalElements = data["totalElements"];
            //this.totalElements=data.content.length;
            console.log(this.editorialsList);
        });

    }

    applyFilter(event?) {
        if (event.direction) {

            this.dir = (event.direction === 'desc') || (event.direction === '') ? 'asc' : 'desc';
            this.sorting = event.active

            // Go to first page
            this.paginator.firstPage();

            // Listen to layout changes
            this.cdr.detectChanges();

            // Get All Documents List
            this.getList();
        }
    }

    // Page Changer
    pageChanged(event: object) {
        this.page = event["pageIndex"];
        this.pageSize = event["pageSize"];

        // Get All Documents List
        this.getList();
    }

    // Filter List
    filterData() {
        // Go to first page
        this.paginator.firstPage();
        // Get All Documents List
        this.getList();
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
            this.getList();
        }
    }

    //initialize data
    initiateData() {
        this.getList();

        // Data Loaded
        this.dataLoaded = true;

        // Change Detection
        this.cdr.detectChanges();
    }

    goToEditItinerary(itinerary: Itinerary) {
        this.dataService.setItineraryState(itinerary);
        void this.router.navigate(['../edit', itinerary.id], {relativeTo: this.route});
    }

    deleteItinerary(element: any) {
        console.log('element', element);
        this.dataService.deleteItineraryById(element).subscribe({
            next: (resp: { success: boolean, reason: string }) => {
                if (resp.success) {
                    this.toastService.showToast('Success', 'Itinerariul a fost sters!', 'success');
                    this.closeModal();
                    this.getList();
                } else {
                    this.toastService.showToast('Error', 'Itinerariul NU a putut fi sters!', "error");
                }
            },
            error: (err: any) => {
                console.log(err);
                this.toastService.showToast('Error', 'Itinerariul NU a putut fi sters!', "error");
            }
        })
    }

    openModal(modal, data?: string) {
        this.modal.open(modal);
    }

    closeModal() {
        this.modal.closeAll();
    }


}

