import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../shared/_models/user.model";
import {Resource} from "../../shared/_models/resource.model";
import {Editorial} from "../../shared/_models/editorial.model";
import {Domain} from "../../shared/_models/domain.model";
import {Category} from "../../shared/_models/category.model";
import {forkJoin, of, Subject, switchMap, take} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ResourcesService} from "../../shared/_services/resources.service";
import {DomainsService} from "../../shared/_services/domains.service";
import {ToastService} from "../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../shared/_services/auth.service";
import {EventsService} from "../../shared/_services/events.service";
import {takeUntil} from "rxjs/operators";
import {EditorialsService} from "../editorials/_services/editorials.service";
import {SystemSettingsService} from "../../shared/_services/system-settings.service";
import {SystemSetting} from "../../shared/_models/system-setting.model";
import {ResourceFilters} from "../../shared/_models/resource-filters.model";
import {GenericPagination} from "../../shared/_models/generic-pagination.model";
import {MatTabChangeEvent} from "@angular/material/tabs";

const travelAndEntertainmentId = "63bfcca765dc3f3863af755c";


@Component({
    selector: 'app-domain-listing',
    templateUrl: './domain-listing.component.html',
    styleUrls: ['./domain-listing.component.scss']
})
export class DomainListingComponent implements OnInit, OnDestroy {

    isTravelDomain = false;

    currentUser: User;
    eventsList: Resource[];
    editorialsList: Editorial[];
    eventTypeId = undefined;

    editorialTypeId = undefined;

    resourceTitle: string = null;
    resourceFiltersBody: ResourceFilters = null;

    filteredResources: GenericPagination<Resource> = null;
    fetchingFilteredResources = false;
    categoryId: string = null;

    systemSettingData: SystemSetting = null;

    currentDomain: Domain;
    listOfCategories: Category[];

    colMatrix: Array<number[]> = [];
    maxNrOfRows: number;
    indexForMatrix: number;
    previousIndexForMatrix = 1;
    equalizedMatrix: number[] = [];

    videoPath: string;
    domainLoaded = false;

    // paginare rezultate
    pageSize = 10;
    pageSizeOptions = [10, 15, 20];
    pageIndex = 0;

    private ngUnsubscribe = new Subject<void>();

    currentLanguage: string;


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private resourcesService: ResourcesService,
        private domainsService: DomainsService,
        private toastService: ToastService,
        private translate: TranslateService,
        private authService: AuthService,
        private eventsService: EventsService,
        private editorialsService: EditorialsService,
        private systemSettingsService: SystemSettingsService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        // this.domainChanges();
        this.checkForDomainId();
        this.checkLanguage();
    }


    domainChanges() {
        this.domainsService.domainChangedChangedObs.subscribe((data: boolean) => {
            // If the response is true
            if (data) {
                // this.videoPath=undefined;

                this.checkForDomainId();
                // Get Documents List
                this.cdr.detectChanges();

            }
        })
    }


    getDomainVideo() {
        this.route.paramMap
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: params => {
                    this.domainsService.getDomainById(params.get('domainId'))
                        .subscribe((res: any) => {
                            this.console.log('domeniul se schimba?', params.get('domainId'));
                            this.videoPath = res.video.filePath;
                            console.log('video din get domain video', this.videoPath);
                        });
                }
            });
    }


    setEventType(event) {
        // console.log('evenimentul');
        // console.log(event);
        this.eventTypeId = event;

        this.eventsService.listResourceFiltered(0, 10, null, null, {
            categoryId: this.systemSettingData.eventCategoryId,
            resourceTypeId: this.eventTypeId,
            status: 'active'
        })
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    console.log('lista noua', res);
                    this.eventsList = res.content;
                }
            });
    }

    setEditorialType(event) {
        // console.log('evenimentul');
        // console.log(event);
        this.editorialTypeId = event;
        // console.log('id editorial',  this.editorialTypeId);


        this.editorialsService.listEditorialFiltered(0, 10, null, null, {category: this.editorialTypeId})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    this.editorialsList = res.content;
                    // console.log('lista noua', this.editorialsList);

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


    checkForDomainId() {

        this.route.paramMap
            .pipe(
                switchMap(params => {
                    if (params.get('domainId')) {
                        // resetam filtrele pt bara de search
                        this.resourceFiltersBody = {
                            domain: params.get('domainId'),
                            status: 'active'
                        };
                        this.resourceTitle = null;
                        this.filteredResources = null;
                        this.categoryId = null;
                        if (!this.systemSettingData) {

                            return forkJoin([
                                this.domainsService.getDomainById(params.get('domainId')),
                                this.resourcesService.getAllResourceCategoriesByResourceDomain(params.get('domainId'), true),
                                this.systemSettingsService.getSystemSetting().pipe(take(1))

                            ]);
                        }

                        return forkJoin([
                            this.domainsService.getDomainById(params.get('domainId')),
                            this.resourcesService.getAllResourceCategoriesByResourceDomain(params.get('domainId'), true)
                        ]);

                    } else {
                        return this.router.navigate([`/client/domain/${travelAndEntertainmentId}`]);
                    }

                }),
                takeUntil(this.ngUnsubscribe)
            ).subscribe({
            next: res => {

                this.console.log('test', res);

                if (typeof res !== 'boolean') {
                    if (!this.systemSettingData) {
                        this.videoPath = undefined;

                        [this.currentDomain, this.listOfCategories, this.systemSettingData] = res;

                        this.videoPath = res[0].video.filePath;
                        this.cdr.detectChanges;

                        this.console.log('videoPath1', this.videoPath);

                    } else {
                        this.videoPath = undefined;

                        [this.currentDomain, this.listOfCategories] = res;
                        this.videoPath = res[0].video.filePath;
                        this.cdr.detectChanges;
                        this.console.log('videoPath2', this.videoPath);
                    }
                    this.domainLoaded = true;

                    // ascundem acel card gol de la jobs
                    if (this.currentDomain.key === 'jobs') {
                        this.listOfCategories = [];

                    }

                    if (this.currentDomain.id === travelAndEntertainmentId) {
                        this.isTravelDomain = true;
                        this.authService.getCurrentUser().pipe(
                            switchMap(user => {
                                if (!user) {
                                    return of(null);
                                }
                                this.currentUser = user;
                                return forkJoin([
                                    this.eventsService.listResourceFiltered(0, 10, null, null, {
                                        categoryId: this.systemSettingData.eventCategoryId,
                                        resourceTypeId: this.eventTypeId,
                                        status: 'active'
                                    }),
                                    this.editorialsService.listEditorialFiltered(0, 10, null, null, {})
                                ]);
                            }),
                            takeUntil(this.ngUnsubscribe)
                        ).subscribe({
                            next: (resources: unknown) => {
                                if (resources) {
                                    [this.eventsList, this.editorialsList] = [resources[0].content, resources[1].content];
                                }
                            },
                            error: () => {
                                this.toastService.showToast(
                                    this.translate.instant("TOAST.ERROR"),
                                    this.translate.instant("TOAST.SERVER-ERROR"),
                                    "error");
                            }
                        });
                    } else {
                        this.isTravelDomain = false;
                    }

                    // medical forum
                    if (this.currentDomain.key === 'healthcare' && this.systemSettingData.medicalForum.enable) {
                        this.listOfCategories.push({
                            nameRo: this.systemSettingData.medicalForum.nameRo,
                            nameEn: this.systemSettingData.medicalForum.nameEn,
                            image: this.systemSettingData.medicalForum.image,
                            nextRoute: 'forum/medical'
                        });
                    }

                    // trips
                    if (this.currentDomain.key === 'travel' && this.systemSettingData.trip.enable) {
                        this.listOfCategories.push({
                            nameRo: this.systemSettingData.trip.nameRo,
                            nameEn: this.systemSettingData.trip.nameEn,
                            image: this.systemSettingData.trip.image,
                            nextRoute: 'trips'
                        });
                    }

                    // jobs
                    if (this.currentDomain.key === 'jobs') {
                        // my CV
                        if (this.systemSettingData.jobOptions.myCv.enable) {
                            this.listOfCategories.push({
                                nameRo: this.systemSettingData.jobOptions.myCv.nameRo,
                                nameEn: this.systemSettingData.jobOptions.myCv.nameEn,
                                image: this.systemSettingData.jobOptions.myCv.image,
                                nextRoute: 'jobs/my-cv'
                            });
                        }

                        // job offers
                        if (this.systemSettingData.jobOptions.jobOffers.enable) {
                            this.listOfCategories.push({
                                nameRo: this.systemSettingData.jobOptions.jobOffers.nameRo,
                                nameEn: this.systemSettingData.jobOptions.jobOffers.nameEn,
                                image: this.systemSettingData.jobOptions.jobOffers.image,
                                nextRoute: 'jobs/job-offers'
                            });
                        }

                        // view candidates
                        if (this.systemSettingData.jobOptions.candidates.enable) {
                            this.listOfCategories.push({
                                nameRo: this.systemSettingData.jobOptions.candidates.nameRo,
                                nameEn: this.systemSettingData.jobOptions.candidates.nameEn,
                                image: this.systemSettingData.jobOptions.candidates.image,
                                nextRoute: 'jobs/candidates'
                            });
                        }

                        // my job offers
                        if (this.systemSettingData.jobOptions.myJobOffers.enable) {
                            this.listOfCategories.push({
                                nameRo: this.systemSettingData.jobOptions.myJobOffers.nameRo,
                                nameEn: this.systemSettingData.jobOptions.myJobOffers.nameEn,
                                image: this.systemSettingData.jobOptions.myJobOffers.image,
                                nextRoute: 'jobs/my-job-offers'
                            });
                        }

                    }

                    // shared experiences
                    if (this.currentDomain.key === 'travel' && this.systemSettingData.sharedExperience.enable) {
                        this.listOfCategories.push({
                            nameRo: this.systemSettingData.sharedExperience.nameRo,
                            nameEn: this.systemSettingData.sharedExperience.nameEn,
                            image: this.systemSettingData.sharedExperience.image,
                            nextRoute: 'shared-experiences'
                        });
                    }

                    if (this.listOfCategories?.length > 0) {
                        this.maxNrOfRows = this.listOfCategories.length / 4 <= 3 ? 3 : Math.ceil(this.listOfCategories.length / 4);
                        this.indexForMatrix = 2;
                        this.previousIndexForMatrix = 1;
                        this.colMatrix = [];
                        this.equalizedMatrix = [];
                        this.calculateColMatrix(this.listOfCategories.length);
                    }

                    console.log('CATEGORII', this.listOfCategories);
                }
            },
            error: () => {
                this.toastService.showToast(
                    this.translate.instant("TOAST.ERROR"),
                    this.translate.instant("TOAST.SERVER-ERROR"),
                    "error");
            }
        });
    }


    onTitleChange(event: string) {
        const inputText = event.trim();

        if (!inputText || inputText?.length === 0) {
            this.filteredResources = null;
            this.categoryId = null;
        }
    }

    myFunction(event: MatTabChangeEvent) {
        console.log(event);
    }

    searchResourcesByTitle(titleToSearch?: string) {
        console.log('se activeaza')
        this.fetchingFilteredResources = true;

        if (titleToSearch) {
            this.resourceTitle = titleToSearch.trim();
        }

        if (!this.resourceTitle) {
            this.filteredResources = null;
            this.categoryId = null;
            return;
        }

        this.resourceFiltersBody = {
            // ...this.resourceFiltersBody,
            title: this.resourceTitle,
            categoryId: this.categoryId,
            status: 'active',
        };

        console.log(this.resourceFiltersBody);

        this.resourcesService.getSearchResources(this.pageIndex, this.pageSize, this.resourceFiltersBody)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.fetchingFilteredResources = false;
                    this.filteredResources = {...res};
                }
            });
    }

    calculateColMatrix(nrOfColumns: number) {
        do {
            this.pushToMatrixRow();
            nrOfColumns--;
        } while (nrOfColumns > 0)
        console.log(this.colMatrix);
        this.equalizeMatrix();
        console.log(this.equalizedMatrix);
    }

    pushToMatrixRow() {
        // debugger;
        if (this.colMatrix.length <= this.maxNrOfRows && (this.currentMatrixLength() <= 5)) {
            for (let i = 0; i < this.maxNrOfRows; i++) {
                if (this.colMatrix[i]) {
                    if (this.colMatrix[i].length < 2) {
                        this.colMatrix[i].push(6);
                        break;
                    }
                } else {
                    this.colMatrix.push([6]);
                    break;
                }
            }
        } else {
            if ((this.listOfCategories.length - this.currentMatrixLength()) > 1) {
                if (this.indexForMatrix === 0) {
                    if (this.matrixIsFull()) {
                        this.colMatrix.push([6]);
                        this.previousIndexForMatrix = 0;
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else if (this.colMatrix[this.colMatrix.length - 1].length === 4 && this.colMatrix[this.colMatrix.length - 2].length === 3) {
                        this.colMatrix[this.colMatrix.length - 2].push(6);
                        this.previousIndexForMatrix = 0;
                        this.indexForMatrix = this.colMatrix.length - 2;
                    } else if (this.currentMatrixLength() > 12 && (this.colMatrix[this.colMatrix.length - 1].length < 4)) {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                        this.previousIndexForMatrix = 0;
                        this.indexForMatrix = this.colMatrix.length - 1;
                    }
                } else {
                    if (this.matrixIsFull()) {
                        this.colMatrix.push([6]);
                        this.previousIndexForMatrix = this.indexForMatrix;
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else if (this.colMatrix[this.indexForMatrix - 1].length === 4 && this.colMatrix[this.indexForMatrix - 2].length === 3) {
                        this.colMatrix[this.indexForMatrix - 2].push(6);
                        this.previousIndexForMatrix = this.indexForMatrix;
                        this.indexForMatrix -= 2;
                    } else if (this.currentMatrixLength() > 12 && (this.colMatrix[this.colMatrix.length - 1].length < 4)) {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else {
                        this.colMatrix[this.indexForMatrix - 1].push(6);
                        this.previousIndexForMatrix = this.indexForMatrix;
                        this.indexForMatrix--;
                    }
                    /*this.colMatrix[this.indexForMatrix-1].push(6);
                    this.previousIndexForMatrix = this.indexForMatrix;
                    this.indexForMatrix--;*/
                }
            } else {
                if (this.indexForMatrix !== 0) {
                    if (this.colMatrix[this.previousIndexForMatrix].length === 4 && this.colMatrix[this.indexForMatrix].length === 3) {
                        this.colMatrix[this.indexForMatrix].push(6);
                    } else if (this.colMatrix[this.previousIndexForMatrix].length < 4) {
                        this.colMatrix[this.previousIndexForMatrix].push(6);
                    } else if (this.currentMatrixLength() > 12 && (this.colMatrix[this.colMatrix.length - 1].length < 4)) {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else {
                        this.colMatrix.push([6]);
                    }
                } else {
                    if (this.colMatrix[this.previousIndexForMatrix].length === 4 && this.colMatrix[this.colMatrix.length - 1].length === 3) {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                    } else if (this.colMatrix[this.previousIndexForMatrix].length < 4) {
                        this.colMatrix[this.previousIndexForMatrix].push(6);
                    } else if (this.currentMatrixLength() > 12 && (this.colMatrix[this.colMatrix.length - 1].length < 4)) {
                        this.colMatrix[this.colMatrix.length - 1].push(6);
                        this.indexForMatrix = this.colMatrix.length - 1;
                    } else {
                        this.colMatrix.push([6]);
                    }
                }
            }

        }
    }

    currentMatrixLength() {
        const initialValue = 0;
        return this.colMatrix.reduce((accumulator, currentValue) => accumulator + currentValue.length,
            initialValue);
    }

    matrixIsFull(): boolean {
        return (this.currentMatrixLength() % 4 === 0) && (this.currentMatrixLength() >= 12);
    }

    equalizeMatrix(): void {
        this.colMatrix.forEach(row => {
            row.forEach(() => {
                this.equalizedMatrix.push(12 / row.length);
            });
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    protected readonly console = console;
}
