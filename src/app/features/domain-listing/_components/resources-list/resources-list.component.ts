import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject, take, tap} from "rxjs";
import {ResourceFilterService} from "../../../../shared/_services/resource-filter.service";
import {takeUntil} from "rxjs/operators";
import {Resource} from "../../../../shared/_models/resource.model";
import {PaginationResponse} from "../../../../shared/_models/pagination-response.model";
import {PageEvent} from "@angular/material/paginator";
import {MatLegacySelectChange} from "@angular/material/legacy-select";
import {MatLegacyPaginator} from "@angular/material/legacy-paginator";
import {ResourceTemplate} from "../../../../shared/_models/resource-template.model";
import {ResourceType} from "../../../../shared/_models/resource-type.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-resources-list',
    templateUrl: './resources-list.component.html',
    styleUrls: ['./resources-list.component.scss']
})
export class ResourcesListComponent implements OnInit, OnDestroy {

    @ViewChild('resourcesPaginator') resourcesPaginator: MatLegacyPaginator;

    paginationInfo: PaginationResponse = null;

    resourceType: ResourceType = null;

    resourceListObs$: Observable<PaginationResponse> = this.resourceFilterService.resourceListObs$
        .pipe(
            tap(resourceList => {
                this.paginationInfo = resourceList;
            })
        );
    resourcesList: Resource[] = [];
    resourceTemplate: ResourceTemplate = null;

    currentLanguage: string;

    screenWidth: number;

    // pagination
    pageNr = 0;
    pageSize = 10;
    sortByProperty: string = null;
    sortDirection: string = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private resourceFilterService: ResourceFilterService,
                private translate: TranslateService) {
        this.onResize();
    }

    ngOnInit(): void {
        this.listenToResourceTemplate();
        this.listenToResourceType();
        // this.getResourcesList();
        this.checkLanguage();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.screenWidth = window.innerWidth;
    }


    listenToResourceTemplate() {
        this.resourceFilterService.resourceTemplateObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTemplate = res;
                }
            });
    }

    listenToResourceType() {
        this.resourceFilterService.resourceTypeObs$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceType = res;
                }
            });
    }

    getResourcesList() {
        console.log('1111111111111')
        this.resourceFilterService.listResourceFiltered(this.pageNr, this.pageSize, this.sortByProperty, this.sortDirection)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    if (this.resourcesPaginator && (this.paginationInfo?.totalElements !== res.totalElements)) {
                        this.resourcesPaginator.firstPage();
                    }
                    this.paginationInfo = res;
                    this.resourcesList = res.content;
                    console.log('lista resuressss',this.resourcesList );
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
        console.log('SORTARE DUPA:', event);
        if(event.value === 'titleAsc'){
            this.sortByProperty = 'title';
            this.sortDirection = 'asc';
        }else if(event.value === 'titleDesc'){
            this.sortByProperty = 'title';
            this.sortDirection = 'desc';
        }
        // this.sortByProperty = event.value;
        // this.sortDirection = 'asc';
        if (this.resourcesPaginator.pageIndex !== 0) {
            this.resourcesPaginator.firstPage();
            return;
        }
        this.getResourcesList();
    }

    onPaginationChange(event: PageEvent) {
        if (event.pageSize !== this.pageSize) {
            this.pageSize = event.pageSize;
            this.resourcesPaginator.firstPage();
        }
        this.pageNr = event.pageIndex;
        this.getResourcesList();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}
