import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Observable, startWith, Subject} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatLegacyChipInputEvent as MatChipInputEvent} from "@angular/material/legacy-chips";
import {
    MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent
} from "@angular/material/legacy-autocomplete";
import {map, takeUntil} from "rxjs/operators";
import {EventsService} from "../../../shared/_services/events.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";
import {MatSort} from "@angular/material/sort";
import {Locations} from "../../../shared/locations";
import {Obj} from "@popperjs/core";
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {Category} from "../../../shared/_models/category.model";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ResourceType} from "../../../shared/_models/resource-type.model";
import {TranslateService} from "@ngx-translate/core";
import {TemplateFilterModel} from "../../../shared/_models/template-filter.model";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {Template} from "../../resource-templates/_models/template.model";
import {Property} from "../../../app.models";
import {DatePipe} from "@angular/common";
import {LocationService} from "../../../shared/_services/location.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.scss'],
    providers: [Locations, DatePipe]
})
export class EventsListComponent implements OnInit {

    displayedColumns: string[] = ['id', 'name', 'date', 'location', 'status', 'views', 'actions',];
    dataSource = [];
    attributesReviewed = [];

    userName: string;
    changeStatusForm: FormGroup;

    backToDashboard: string;

    currentUserId: string;
    currentUserRole: string;

    /*@ViewChild(MatPaginator) paginator: MatPaginator;*/
    @ViewChild(MatSort) sort: MatSort;

    // initial filter numbers
    pageNumber: number;
    pageSize: number;
    pageSizeArray = [10, 25, 100];

    filterTitle: string;
    filterCountry: string;
    filterCity: string;
    filterResource: string;
    filterDressCode: string;
    filterStartDate: object;
    filterFinishDate: object;
    filterEventType: string;
    filterStatus: string;
    filterSharedExperience: boolean;
    dateTimeFilter: string;

    sorting = "lastUpdateDate";
    dir = 'desc';
    totalElements: number;

    // information about filters and pagination
    paginationInfo: any;

    eventsList = [];

    isAdvanced = false;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    benefitCtrl = new FormControl('');
    filteredBenefits: Observable<string[]>;
    benefits: string[] = [];
    allBenefits: string[] = ['Parcare gratuita', 'Aer conditionat', 'Bauturi gratis', 'Cabina foto', 'Candy bar'];

    @ViewChild('benefitInput') benefitInput: ElementRef<HTMLInputElement>;

    countries = [];
    cities = [];
    categoryEventsId: string;
    domainIdForEventCategory: string;
    resourceTypes: Array<ResourceType>;
    currentTemplateId: string;
    currentTemplate: Template;
    currentLanguage: string;
    tabs: any;
    attributesArray: Array<Property>

    attributesFilterArray: Array<{ attributeName: string, attributeValue: string }>;
    form = new FormGroup({
        title: new FormControl('')
    });


    private ngUnsubscribe = new Subject<void>();

    constructor(private eventsService: EventsService,
                private modalService: MatDialog,
                private toastService: ToastService,
                private userService: UserDataService,
                private locations: Locations,
                private systemService: SystemSettingsService,
                private resourceService: ResourcesService,
                private translate: TranslateService,
                private templateService: TemplatesService,
                private datePipe: DatePipe,
                private locationService: LocationService) {
        this.filteredBenefits = this.benefitCtrl.valueChanges.pipe(
            startWith(null),
            map((benefit: string | null) => (benefit ? this._filter(benefit) : this.allBenefits.slice())),
        );
    }

    ngOnInit(): void {
        this.getCurrentUser();
        this.attributesArray = [];

        this.pageNumber = 0;
        this.pageSize = 10;
        this.currentLanguage = this.translate.currentLang;
        this.translate.onLangChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.currentLanguage = res.lang;
                }
            });
        this.getCountries();
        // this.countries = this.locations.countries;
        // this.getEventsCategory();
        this.changeStatusFormInit();
    }

    test() {
        console.log(this.dateTimeFilter);
    }

    //get user an role, to check wich event you can edit
    getCurrentUser() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((user: User) => {
                    this.currentUserId = user.id;
                    this.currentUserRole = user.roles[0];
                    console.log('ID SI ROL', this.currentUserId, this.currentUserRole);
                    this.getEventsCategory()
                }
            );
    }

    getEventsCategory() {
        this.systemService.getSystemSetting().subscribe((settings: SystemSetting) => {
            console.log('setting', settings);
            this.categoryEventsId = settings.eventCategoryId;

            this.applyFilter();
            // this.getDomain(settings.eventCategoryId);
            this.getResourcesTypesByCategoryId(settings.eventCategoryId);


        })

    }

    getDomain(idCategory: string) {
        this.resourceService.getResourceCategoryById(idCategory).subscribe((category: Category) => {
            this.domainIdForEventCategory = category.domainId;
        })
    }

    getResourcesTypesByCategoryId(idCategory: string) {
        this.resourceService.getAllResourceTypesByResourceCategory(idCategory).subscribe((resourceTypes: Array<ResourceType>) => {
            // console.log('TIPURI DE RESURSA', resourceTypes);
            this.resourceTypes = resourceTypes;
        })
    }

    changeStatusFormInit() {
        this.changeStatusForm = new FormGroup(
            {status: new FormControl(null, Validators.required)}
        )
    }

    selectedResourceType(value) {
        console.log(value);
        const filterObj = {
            resourceTypeId: value
        }

        this.templateService.listResourceTemplateFiltered(0, -1, '', '', filterObj)
            .subscribe((template: TemplateFilterModel) => {
                    console.log('list template dupa restype', template);
                    if (template.content.length === 1) {
                        this.currentTemplateId = template.content[0].id;
                        this.currentTemplate = template.content[0];
                        console.log('list template dupa restype 2', template.content[0].id);

                        this.getTemplateData(template.content[0].id);
                    } else {
                        this.attributesArray = [];
                    }

                }
            )
    }

    getTemplateData(templateId: string) {
        this.resourceService.getAttributesFromTemplate(templateId).subscribe((attributeTabs: any) => {
            console.log('array cu taburile de atribute', attributeTabs);
            this.tabs = attributeTabs;
            attributeTabs.forEach((attributeTab: any) => {
                this.createForm(attributeTab);
            })
        })
    }

    createForm(tab) {
        // this.attributesFilterArray= [];
        for (let inputField of tab.tabAttributes) {
            console.log('inputField', inputField);
            if (inputField.usedInFiltering) {
                this.attributesArray.push(inputField);
                if (inputField.valueType === 'toggle') {
                    this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : 'false'));
                }
                this.form.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : '', inputField.propertyRequired ? Validators.required : null));

            }
        }

        console.log('form', this.form.value);
    }

    makeAttributesArrayForFilter() {
        this.attributesFilterArray = [];
        console.log(this.form);
        for (const control in this.form.controls) {
            console.log('control', this.form.get(control).value);
            if (this.form.get(control).value !== '') {
                const type = typeof this.form.get(control).value;
                this.attributesFilterArray.push({
                    attributeName: control,
                    attributeValue: (type === "object" ? this.datePipe.transform(this.form.get(control).value, "yyyy-MM-dd") : this.form.get(control).value)
                });
            }
        }

        console.log('FORM OBJ', this.attributesFilterArray);
    }

    // selectedCountry(event) {
    //     console.log('TARA', event.value);
    //     this.cities = this.locations.countries[event.value].cities;
    //     console.log(this.cities);
    // }

    advancedClick() {
        this.isAdvanced = !this.isAdvanced;
    }

    callSubmitButton(event){
        event.preventDefault();
        if(event.key==="Enter")
            this.applyFilter();

    }

    applySort(event) {
        console.log(event);
        if (event.direction) {
            this.dir = event.direction;

            if (event.active === 'location') {
                this.sorting = 'city';
            } else if (event.active === 'name') {
                this.sorting = 'title';
            } else {
                this.sorting = event.active
            }
        }
        this.applyFilter();
    }

    applyFilter(event?) {
        this.attributesFilterArray = [];
        //  this.pageNumber = 0;

        this.makeAttributesArrayForFilter();
        const filterObject = {
            title: this.filterTitle !== '' ? this.filterTitle : null,
            country: this.filterCountry !== undefined ? this.filterCountry : null,
            city: this.filterCity !== '' ? this.filterCity : null,
            categoryId: this.categoryEventsId,
            resourceTypeId: this.filterEventType !== '' ? this.filterEventType : null,
            status: this.filterStatus !== '' ? this.filterStatus : null,
            // sharedExperience: this.filterSharedExperience !== null ? this.filterSharedExperience : null,
            attributes: this.attributesFilterArray.length === 0 ? undefined : this.attributesFilterArray,
            // bookingType: 'ticketBooking',
            userId: this.currentUserRole === 'ROLE_PROVIDER' ? this.currentUserId : null
        }



        this.eventsService.listResourceFiltered(this.pageNumber, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {
            // console.log('marimea paginii din apply FIlter', this.pageSize);
            this.paginationInfo = res;
            this.totalElements=res["totalElements"];
            this.dataSource = res["content"];
            console.log('totalElements',this.totalElements);
            // console.log(this.dataSource);
        });

        // //get total number of elements
        // this.paginationInit(filterObject);

    }

    pageChanged(event) {
        console.log(event);
        this.attributesFilterArray = [];
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;

        this.makeAttributesArrayForFilter();
        // console.log('SCHIMBARE PAGINA EVENT:',event);
        // if (event) {
        //     this.dir = event.direction;
        // }
        this.applyFilter();

    }

    openModal(templateRef, idUser: string) {
        this.userName = '';
        this.modalService.open(templateRef);
        this.userService.getUserById(idUser).subscribe((data: User) => {
            this.userName = data.firstName + ' ' + data.lastName;
        })
    }

    deleteResource(resourceId: string) {
        // console.log(resourceId);

        this.eventsService.deleteResource(resourceId).subscribe((res: { success: boolean, reason: string }) => {
            // console.log(res);

            if (res.success) {
                this.toastService.showToast('Succes', 'Evenimentul a fost sters', 'success');
                this.modalService.closeAll();
                this.applyFilter();
            }
        }, () => {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
        });
    }

    openModalData(templateRef, idUser: string, rowStatus: string) {
        this.changeStatusForm.patchValue({status: rowStatus});
        this.userName = '';
        console.log(this.changeStatusForm.value.status);
        this.modalService.open(templateRef);
        this.userService.getUserById(idUser).subscribe((data: User) => {
            this.userName = data.firstName + ' ' + data.lastName;
        })
    }

    changeEventStatus(resourceId: string, status: string) {
        console.log('status de schimbat', status);
        this.eventsService.changeResourceStatus(resourceId, status).subscribe((resp: { success: boolean, reason: string }) => {
                console.log('dupa changestatus', resp);
                if (resp.success) {
                    this.toastService.showToast('Success', 'Statusul a fost modificat!', "success");
                    if (status === 'active') {
                        this.eventsService.createResourceNotification(resourceId).subscribe((res: any) => {
                            console.log('res notif', res);
                        })
                    }
                    this.applyFilter();
                    this.modalService.closeAll();
                }
            },
            (error => {
                console.log(error.error.reason);
                if (error.error.reason === "invalidId") {
                    this.toastService.showToast('Error', 'Id-ul evenimentului este invalid', 'error');
                } else if (error.error.reason === "notLoggedIn" || error.error.reason === "tokenExpired") {
                    this.toastService.showToast('Error', 'Pentru a finaliza aceasta actiune trebuie sa fiti logat!', 'error');
                } else {
                    this.toastService.showToast('Error', 'Server error!', 'error');
                }
            }))

    }


    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();


        if (value) {
            this.benefits.push(value);
        }

        // Clear the input value
        event.chipInput.clear();

        this.benefitCtrl.setValue(undefined);
    }

    remove(benefit: string): void {
        const index = this.benefits.indexOf(benefit);

        if (index >= 0) {
            this.benefits.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.benefits.push(event.option.viewValue);
        this.benefitInput.nativeElement.value = '';
        this.benefitCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allBenefits.filter(benefit => benefit.toLowerCase().includes(filterValue));
    }


    getCountries() {

        this.locationService.getAllCountries().subscribe({
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
        this.locationService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                console.log(cities);
                this.cities = cities.content;
            }
        })
    }


    clearFields() {
        this.pageNumber = 0;
        this.filterTitle = undefined;
        this.filterCountry = undefined;
        this.filterCity = undefined;
        this.filterEventType = undefined;
        this.filterStatus = undefined;
        this.filterStatus = undefined;
        this.attributesFilterArray = [];
        this.filterEventType = undefined;
        this.attributesArray = [];
        this.cities=[];


        this.applyFilter();

    }

    archiveResource(resourceId){
        this.eventsService.changeResourceStatus(resourceId, "archived").subscribe({
            next: (resp: { success: boolean, reason: string }) => {
                if (resp.success) {
                    this.toastService.showToast('Success', 'Resursa a fost arhivată!', 'success');
                    // this.getListType();
                    this.applyFilter();
                    this.modalService.closeAll();
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


    closeModal() {
        this.modalService.closeAll();
    }

}
