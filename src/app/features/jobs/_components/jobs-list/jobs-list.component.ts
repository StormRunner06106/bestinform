import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {MatLegacyPaginator} from "@angular/material/legacy-paginator";
import {PaginationResponse} from "../../../../shared/_models/pagination-response.model";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {Resource} from "../../../../shared/_models/resource.model";
import {ResourceTemplate} from "../../../../shared/_models/resource-template.model";
import {JobsStore} from "../../_services/jobs.store";
import {TranslateService} from "@ngx-translate/core";
import {takeUntil} from "rxjs/operators";
import {MatLegacySelectChange} from "@angular/material/legacy-select";
import {PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'app-jobs-list',
    templateUrl: './jobs-list.component.html',
    styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit, OnDestroy {

    @ViewChild('resourcesPaginator') resourcesPaginator: MatLegacyPaginator;

    paginationInfo: PaginationResponse = null;

    resourceType: ResourceType = null;

    resourcesList: Resource[] = [];
    resourceTemplate: ResourceTemplate = null;

    currentLanguage: string;

    // pagination
    pageNr = 0;
    pageSize = 5;
    sortByProperty: string = null;
    sortDirection: string = null;

    jobOffersState: boolean;

    private ngUnsubscribe = new Subject<void>();

    constructor(private jobsStore: JobsStore,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.jobOffersState = this.jobsStore.getMyJobOffersState();
        this.listenToResourceTemplate();
        this.listenToResourceType();
        this.getJobsList();
        this.checkLanguage();
    }

    listenToResourceTemplate() {
        this.jobsStore.resourceTemplateObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTemplate = res;
                }
            });
    }

    listenToResourceType() {
        this.jobsStore.resourceTypeObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceType = res;
                }
            });
    }

    getJobsList() {
        this.jobsStore.getJobOffers()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (this.resourcesPaginator && (this.paginationInfo?.totalElements !== res.totalElements)) {
                        this.resourcesPaginator.firstPage();
                    }
                    this.paginationInfo = res;
                    this.resourcesList = res.content;
                }
            });
    }

    checkLanguage() {
        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });
    }

    onSortChange(event: MatLegacySelectChange) {
        this.sortByProperty = event.value;
        this.sortDirection = 'asc';
        if (this.resourcesPaginator.pageIndex !== 0) {
            this.resourcesPaginator.firstPage();
            return;
        }
        this.jobsStore.updatePagination(this.pageNr, this.pageSize, this.sortByProperty, this.sortDirection);
    }

    onPaginationChange(event: PageEvent) {
        if (event.pageSize !== this.pageSize) {
            this.pageSize = event.pageSize;
            this.resourcesPaginator.firstPage();
        }
        this.pageNr = event.pageIndex;
        this.jobsStore.updatePagination(this.pageNr, this.pageSize, this.sortByProperty, this.sortDirection);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
