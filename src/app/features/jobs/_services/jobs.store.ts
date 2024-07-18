import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, firstValueFrom, Observable, shareReplay, Subject, switchMap, tap} from "rxjs";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {PaginationResponse} from "../../../shared/_models/pagination-response.model";
import {ResourceTemplate} from "../../../shared/_models/resource-template.model";
import {Resource} from "../../../shared/_models/resource.model";
import {ActivatedRoute} from "@angular/router";
import {Attribute} from "../../../shared/_models/attribute.model";
import {TemplatePagination} from "../../../shared/_models/template-pagination.model";
import {takeUntil} from "rxjs/operators";
import {ResourceFilters} from "../../../shared/_models/resource-filters.model";
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";

@Injectable()
export class JobsStore implements OnDestroy {

    // resource type state
    private resourceTypeState = new BehaviorSubject<ResourceType>(null);
    public resourceTypeObs$ = this.resourceTypeState.asObservable();

    // resource template state
    private resourceTemplateState = new BehaviorSubject<ResourceTemplate>(null);
    public resourceTemplateObs$ = this.resourceTemplateState.asObservable();

    // resources pagination and filters state
    private resourceListState = new BehaviorSubject<PaginationResponse>(null);
    public resourceListObs$ = this.resourceListState.asObservable();
    private myJobOffers = false;

    // selected resource state
    private resourceState = new BehaviorSubject<Resource>(null);
    public resourceObs$ = this.resourceState.asObservable();

    private readonly domainId: string = null;

    private userId: string = null;

    // filters
    private filtersObj: ResourceFilters = {};

    // pagination
    pageNr = 0;
    pageSize = 5;
    sortBy: string = 'lastUpdateDate';
    sortDirection: string = 'desc';

    private ngUnsubscribe = new Subject<void>();

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private userDataService: UserDataService) {
        // initializarea serviciului se face in job-offers
        this.domainId = this.route.snapshot.params.domainId;

        if (this.route.snapshot.data?.myJobOffers) {
            this.myJobOffers = true;
        }

        this.filtersObj = {...this.filtersObj, domain: this.domainId, status: this.myJobOffers ? null : 'active'};

    }

    getMyJobOffersState(): boolean {
        return this.myJobOffers;
    }

    // initializarea state-ului se face in jobs-sidebar
    getFilterAttributesFromTemplate() {
        return this.http.get<ResourceType[]>('/bestinform/getResourceTypesByDomainId?domainId=' + this.domainId)
            .pipe(
                switchMap( resourceTypes => {
                    if (resourceTypes) {
                        this.resourceTypeState.next(resourceTypes[0]);
                        console.log(resourceTypes[0]);
                        return this.http.post<TemplatePagination>('/bestinform/listResourceTemplateFiltered?page=0&size=1', {resourceTypeId: this.resourceTypeState.value.id})
                            .pipe(
                                switchMap( resourceTemplate => {
                                    if (resourceTemplate) {
                                        this.resourceTemplateState.next(resourceTemplate.content[0]);
                                        return this.http.get<Attribute[]>('/bestinform/getFilterAttributeFromTemplate?templateId=' + this.resourceTemplateState.value.id);
                                    }
                                })
                            )
                    }
                })
            );
    }

    // initializarea state-ului se face in jobs-list
    getJobOffers(): Observable<PaginationResponse> {
        if (this.myJobOffers) {
            if (this.userId) {
                return this.listResourceFiltered();
            } else {
                return this.userDataService.getCurrentUser()
                    .pipe(
                        tap( user => this.userId = user.id),
                        switchMap( user => {
                            if (user) {
                                this.filtersObj = {...this.filtersObj, userId: this.userId};
                                return this.listResourceFiltered();
                            }
                        })
                    );
            }
        } else {
            return this.listResourceFiltered();
        }
    }

    private listResourceFiltered() {
        return this.http.post<PaginationResponse>('/bestinform/listResourceFiltered?page=' + this.pageNr + '&size=' + this.pageSize + '&sort=' + this.sortBy + '&dir=' + this.sortDirection, this.filtersObj)
            .pipe(
                switchMap( resources => {
                    if (resources) {
                        this.resourceListState.next(resources);
                        return this.resourceListObs$;
                    }
                })
            );
    }

    updateFilters(newFilters: ResourceFilters) {
        this.filtersObj = {...this.filtersObj, ...newFilters};
        void firstValueFrom(this.getJobOffers());
    }

    updatePagination(pageNr: number, pageSize: number, sortByProperty: string, sortDirection: string) {
        this.pageNr = pageNr;
        this.pageSize = pageSize;
        this.sortBy = sortByProperty;
        this.sortDirection = sortDirection;
        void  firstValueFrom(this.getJobOffers());
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
