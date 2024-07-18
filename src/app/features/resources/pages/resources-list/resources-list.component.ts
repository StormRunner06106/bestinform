import {Component, OnInit, ViewChild} from '@angular/core';
import {MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort} from '@angular/material/sort';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ResourcesService} from 'src/app/shared/_services/resources.service';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Router} from '@angular/router';
import {MatTableDataSource} from "@angular/material/table";
import {Resource} from "../../../../shared/_models/resource.model";
import {User} from "../../../../shared/_models/user.model";
import {ResourcesService as ResourceService} from "../../_services/resources.service"
import {ToastService} from "../../../../shared/_services/toast.service";
import {MatDialog} from "@angular/material/dialog";
import {SystemSettingsService} from "../../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../../shared/_models/system-setting.model";
import {StepperService} from "../../_services/stepper.service";
import {
    AddEditTicketComponent
} from "../../components/stepper-content/configurate-edit/setup/ticket-booking/add-edit-ticket/add-edit-ticket.component";
import {
    SharedExperiencesListComponent
} from "../../components/shared-experiences-list/shared-experiences-list.component";
import {
    ProviderCreateSharedExperienceComponent
} from "../../components/provider-create-shared-experience/provider-create-shared-experience.component";

@Component({
    selector: 'app-resources-list',
    templateUrl: './resources-list.component.html',
    styleUrls: ['./resources-list.component.scss'],
    providers: [NgbModal]
})
export class ResourcesListComponent implements OnInit {

    dataSource: MatTableDataSource<Resource>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    //current provider id
    providerId: string;

    isLoaded = false;

    //check if provider is accepted by staff/admin; if not, hide add button
    isProviderAccepted: boolean;

    // check the role
    isStaff: boolean;
    isProvider: boolean;
    isAdmin: boolean;
    backPath: string;
    countries = [];
    cities = [];

    //table
    resourcesList: Array<string> = [];
    displayedResourcesColumns = ['title', 'provider' , 'address', 'category', 'purchase', 'status','views', 'actions'];

    //pagination
    pageSizeArray = [10, 25, 100];
    pageSize = 10;
    // information about filters and pagination
    paginationInfo: any;
    totalElements: number;
    sorting = 'lastUpdateDate';
    dir = 'desc';
    pageNumber = 0;

    //if true, icon near title
    sharedResources: boolean;

    //filter
    isAdvanced = false;
    filterTitle: string;
    filterCountry: string;
    filterCity: string;
    filterDomain: string;
    filterCategory: string;
    filterSharedExperiences: boolean;
    filterStatus: string;
    filterStartDate: object;
    filterFinishDate: object;

    eventCategoryId: string;
    jobCategoryId: string;

    //get categories
    selectedDomain: string;
    categoriesList: Array<any> = [];

    statusInput: string;
    jobDomainId: any;
    travelDomainId: any;
    healthDomainId: any;
    cultureDomainId: any;
    educationDomainId: any;


    constructor(
        private userService: UserDataService,
        private resourcesService: ResourcesService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private modal: MatDialog,
        private resourceService: ResourceService,
        private toastService: ToastService,
        private systemService: SystemSettingsService,
        private stepperService: StepperService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.runAfterAsyncOperations();

        // this.getEventCategoryId();
        // this.getJobCategoryId();
        this.checkIfProviderAccepted();

        this.checkRole();
        // this.listChanged();
        this.getCountries();
        this.getListType();
        // this.dir='asc';
    }

    checkRole() {
        this.userService.getCurrentUser().subscribe({
            next: (userData: User) => {
                if (userData.roles.includes('ROLE_STAFF')) {
                    this.isStaff = true;
                }

                if (userData.roles.includes('ROLE_PROVIDER')) {
                    this.isProvider = true;
                }

                if (userData.roles.includes('ROLE_SUPER_ADMIN')) {
                    this.isAdmin = true;
                }
            }
        })
    }

    // getEventCategoryId() {
    //     this.systemService.getSystemSetting().subscribe({
    //         next: (resp: SystemSetting) => {
    //             this.eventCategoryId = resp.eventCategoryId;
    //             console.log('RES SETTINGS', resp);
    //             console.log('id categorie event', this.eventCategoryId)
    //
    //         }
    //     })
    // }

    getEventCategoryId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.systemService.getSystemSetting().subscribe({
                next: (resp: SystemSetting) => {
                    this.eventCategoryId = resp.eventCategoryId;
                    console.log('RES SETTINGS', resp);
                    console.log('id categorie event', this.eventCategoryId);
                    resolve(); // Resolve the promise once the operation is complete
                },
                error: err => {
                    reject(err); // Reject the promise if there's an error
                }
            });
        });
    }

    getJobCategoryId(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.resourcesService.getListOfDomains().subscribe({
                next: (domains: any) => {
                    domains.forEach(domain => {
                        if (domain.key === 'jobs') {
                            this.resourcesService.listCategoryFiltered(0, 1, null, null, {domainId: domain.id})
                                .subscribe({
                                    next: (category: any) => {
                                        this.jobCategoryId = category.content[0].id;
                                        resolve(); // Resolve the promise once the operation is complete
                                    },
                                    error: err => {
                                        reject(err); // Reject the promise if there's an error
                                    }
                                });
                        }
                        if (domain.key === 'jobs') {
                            this.jobDomainId = domain.id;
                        } else if (domain.key === 'travel') {
                            this.travelDomainId = domain.id;
                        } else if (domain.key === 'healthcare') {
                            this.healthDomainId = domain.id;
                        } else if (domain.key === ' culture') {
                            this.cultureDomainId = domain.id;
                        } else if (domain.key === 'education') {
                            this.educationDomainId = domain.id;
                        }
                    });
                }
            });
        });
    }


    // getJobCategoryId(){
    //     this.resourcesService.getListOfDomains().subscribe({
    //         next:(domains:any)=>{
    //             domains.forEach(domain => {
    //                 if(domain.key === 'jobs'){
    //                     this.resourcesService.listCategoryFiltered(0, 1,null,null,{domainId: domain.id})
    //                         .subscribe({
    //                             next:(category:any)=>{
    //                                 this.jobCategoryId = category.content[0].id;
    //                             }
    //                         })
    //                 }
    //
    //                 if(domain.key === 'jobs'){
    //                     this.jobDomainId=domain.id;
    //                 }else if(domain.key === 'travel'){
    //                     this.travelDomainId=domain.id;
    //                 }else if(domain.key === 'healthcare'){
    //                     this.healthDomainId=domain.id;
    //                 }else if(domain.key === ' culture'){
    //                     this.cultureDomainId=domain.id;
    //                 }else if(domain.key === 'education'){
    //                     this.educationDomainId=domain.id;
    //                 }
    //             })
    //         }
    //     })
    // }


    async runAfterAsyncOperations() {
        try {
            await this.getEventCategoryId();
            await this.getJobCategoryId();
            // await this.getCurrentUser();
            // await this.getTripsAndItinerariesIds();

            //  async operations are complete, you can now call the next function
            this.getListType();
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }


    checkIfProviderAccepted() {
        this.userService.getCurrentUser().subscribe((currentUser: User) => {
            if (currentUser.roles.includes('ROLE_PROVIDER') && currentUser.approvedStatus === null) {
                this.isProviderAccepted = false;
                // this.router.navigate(['/private/provider/resources/my-list']);
                // this.toastService.showToast("Error", "Nu aveti permisiunea necesară pentru a adăuga resurse. Luați legătura cu administratorul.", 'error')
            } else {
                this.isProviderAccepted = true;
            }
        })
    }

    listChanged() {
        this.resourcesService.listChangedObs.subscribe((data: boolean) => {
            // If the response is true
            if (data) {
                // Get Documents List
                this.getResourcesList();
                // this.cdr.detectChanges();

                this.resourcesService.triggerListChanges(false);
            }
        })
    }

    getListType() {
        if (this.router.url.includes('my-list')) {
            this.userService.getCurrentUser().subscribe((userData: any) => {
                this.providerId = userData.id;
                console.log('provider id my-list', userData.id);
                this.getResourcesList();
                this.backPath = '../../profile/view';
            })
        } else {
            this.route.queryParams
                .subscribe(params => {
                        if (params === null) {
                            console.log('PARAMETRU din cale', params.providerid);
                            console.log('niciun parametru');
                            this.providerId = null;
                            this.getResourcesList();
                            this.backPath = '../../manage-providers/view';

                        } else {
                            console.log('parametru provider');
                            console.log('PARAMETRU din cale', params.providerid);
                            if(params.providerId ===undefined){
                                this.providerId = params.providerid;
                            } else{
                                this.providerId = params.providerId;
                            }

                            this.getResourcesList();
                            if (params.providerid) {
                                this.backPath = '../../manage-providers/view/' + this.providerId;

                            } else if (params.providerid === undefined) {
                                this.backPath = '../../dashboard';

                            }


                        }
                    }
                );

        }
    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getResourcesList();
    }

    editResource(resourceId: string) {
        this.router.navigate(['../../resources/edit/', resourceId], {relativeTo: this.route});
        this.stepperService.step$.next(0);
    }

    getResourcesList() {
        const objFilter = {
            userId: this.providerId,
            title: this.filterTitle !== '' ? this.filterTitle : null,
            domain: this.filterDomain !== '' ? this.filterDomain : null,
            categoryId: this.filterCategory !== '' ? this.filterCategory : null,
            country: this.filterCountry !== '' ? this.filterCountry : null,
            city: this.filterCity !== '' ? this.filterCity : null,
            sharedExperience: this.filterSharedExperiences !== null ? this.filterSharedExperiences : null,
            status: this.filterStatus !== null ? this.filterStatus : null,
            excludedCategories: this.filterCategory === undefined ? [this.eventCategoryId, this.jobCategoryId] : null
        }

        // console.log('obiect de filtrare', objFilter);

        this.resourcesService.listResourceFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, objFilter).subscribe((resourcesList: any) => {
            this.dataSource = resourcesList.content;
            // console.log('RESURSELE MELE',this.dataSource);
            this.totalElements = resourcesList.totalElements;
            this.isLoaded = true;
        });
    }

    advancedClick() {
        this.isAdvanced = !this.isAdvanced;
    }

    callSubmitButton(event) {
        event.preventDefault();
        if (event.key === "Enter")
            this.applyFilter();

    }

    applyFilter(event?) {

        if (event) {
            this.dir = event.direction;

            if (event.active === 'category') {
                this.sorting = 'categoryId';
            } else if (event.active === 'purchase') {
                this.sorting = 'totalBookingNumber';
            } else if(event.active ==='provider'){
                this.sorting = 'userName';
            } else {
                this.sorting = event.active;
            }
        }
        this.paginator.firstPage();
        this.getResourcesList();

    }

    getCategories(event?) {
        this.categoriesList = [];
        this.selectedDomain = event;
        this.resourcesService.getAllResourceCategoriesByResourceDomain(this.selectedDomain).subscribe((categories: any) => {
            categories.forEach(element => {
                console.log(element.nameEn);
                console.log(element.id);
                const categoryObject = {
                    id: element.id,
                    name: element.nameEn
                }
                this.categoriesList.push(categoryObject);
            });
            // console.log('lista de categorii cu obiecte',this.categoriesList);
        })
    }

    clearfilterTitle() {
        this.filterTitle = undefined;
    }

    clearFields() {
        this.filterTitle = undefined;
        this.filterCountry = undefined;
        this.filterCity = undefined;
        this.filterDomain = undefined;
        this.filterCategory = undefined;
        this.filterSharedExperiences = undefined;
        this.filterStatus = undefined;
        this.filterStartDate = undefined;
        this.filterFinishDate = undefined;
        this.cities = [];

        this.cdr.detectChanges();

        this.getResourcesList();
    }

//TEMPORAR

    deleteResource(resourceId: string) {
        this.resourcesService.deleteResource(resourceId).subscribe({
            next: (resp: { success: boolean, reason: true }) => {
                console.log('sters cu succes', resp.success);
                if (resp.success) {
                    this.closeModal();
                    this.toastService.showToast('Success', 'Resursa a fost stearsa', "success");
                    this.getListType();
                    // this.modal.closeAll();
                }
            }
        })
    }

    openModal(modal, data?: string) {
        this.modal.open(modal);
        this.statusInput = data;
    }

    closeModal() {
        this.modal.closeAll();
    }

    openSharedExperienceListModal(resourceId) {
        this.dialog.open(SharedExperiencesListComponent, {
            width: '1000px',
            height: '750px',
            data: resourceId
        });
    }

    openSharedExperienceCreateModal(resourceId) {
        this.dialog.open(ProviderCreateSharedExperienceComponent, {
            width: '1000px',
            height: '750px',
            data: resourceId
        });
    }


    changeStatus(resourceId, status) {
        console.log('change status', resourceId, status)
        this.resourceService.changeStatusForResource(resourceId, status).subscribe({
            next: (resp: { success: boolean, reason: string }) => {
                if (resp.success) {
                    this.toastService.showToast('Success', 'Statusul resursei a fost modificat!', 'success');
                    this.getListType();
                    this.modal.closeAll();
                }
            },
            error: (err: any) => {
                console.log(err);
                if (err.error.reason === 'invalidId') {
                    this.toastService.showToast('Error', 'Această resursă nu mai există în baza de date!', "error");
                }

                if (err.error.reason === 'notLoggedIn' || err.error.reason === 'tokenExpired') {
                    this.toastService.showToast('Error', 'Pentru a finaliza această acțiune trebuie să fii logat!', "error");
                }
            }
        })
    }

    archiveResource(resourceId) {
        this.resourceService.changeStatusForResource(resourceId, "archived").subscribe({
            next: (resp: { success: boolean, reason: string }) => {
                if (resp.success) {
                    this.toastService.showToast('Success', 'Resursa a fost arhivată!', 'success');
                    this.getListType();
                    this.modal.closeAll();
                }
            },
            error: (err: any) => {
                console.log(err);
                if (err.error.reason === 'invalidId') {
                    this.toastService.showToast('Error', 'Această resursă nu mai există în baza de date!', "error");
                }

                if (err.error.reason === 'notLoggedIn' || err.error.reason === 'tokenExpired') {
                    this.toastService.showToast('Error', 'Pentru a finaliza această acțiune trebuie să fii logat!', "error");
                }
            }
        })
    }

    getCountries() {

        this.resourceService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
            }
        })
    }


    getCities(event) {
        this.filterCity = "";
        const country = {
            country: event.value ? event.value : event
        }
        this.resourceService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                // console.log(cities);
                this.cities = cities.content;
            }
        })
    }


}
