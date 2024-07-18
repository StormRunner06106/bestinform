import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Params} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {DomainsService} from "../../../shared/_services/domains.service";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";
import {Category} from "../../../shared/_models/category.model";
import {MatTooltip} from '@angular/material/tooltip';


@Component({
    selector: 'app-edit-domain',
    templateUrl: './edit-domain.component.html',
    styleUrls: ['./edit-domain.component.scss'],
    providers: [ModalMediaService]
})

export class EditDomainComponent implements OnInit {
    isAdvanced = [];
    currentDomainId: string;
    currentDomain: any;

    categorySearch = new FormControl<string>('');

    resourcesList = [];
    resourceTypes = [];
    types = [];
    total = [];

    // information about filters and pagination
    paginationInfo: any;

    pageNumber: number;
    pageSize: number;
    pageSizeArray = [10, 25, 100];
    sorting = 'order';
    dir = 'desc';

    domainThumbnail = null
    domainIcon = null;

    resTypeForm: any;
    categoryForm: any;

    categoryToChange: Category;

    currentResTypeData: any;

    //select just one checkBox for person number and date, add-res-type modal
    nrPersIndex: number;
    dateIndex: number;

    domainImagesForm = new FormGroup({
        fileName: new FormControl(''),
        filePath: new FormControl('')
    });

    domainIconForm = new FormGroup({
        fileName: new FormControl(''),
        filePath: new FormControl('')
    });

    domainVideoForm = new FormGroup({
        fileName: new FormControl(''),
        filePath: new FormControl('')
    })

    categoryImagesForm = new FormGroup({
        fileName: new FormControl(''),
        filePath: new FormControl('')
    })

    categoryIconForm = new FormGroup({
        fileName: new FormControl(''),
        filePath: new FormControl('')
    })

    constructor(private resourceService: ResourcesService,
                private modalService: NgbModal,
                private toastService: ToastService,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private domainService: DomainsService,
                private formBuilder: FormBuilder,
                private modalMediaService: ModalMediaService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((param: Params) => {
            this.currentDomainId = param["id"];
        });
        this.pageNumber = 1;
        this.pageSize = 10;
        this.listCategories();
        this.getCurrentDomain();
        this.categoryInit();
        this.resTypeInit();
        this.modalMediaService.currentImagesArray
            .subscribe(async (array: any) => {
                if (array.length > 0) {
                    if (array[0].for === 'domain-img') {
                        this.changeDomainImage(array[0].selectedMedia);
                    } else if (array[0].for === 'domain-icon') {
                        this.changeDomainIcon(array[0].selectedMedia);
                    } else if (array[0].for === 'category-img') {
                        this.changeCategoryImage(array[0].selectedMedia);
                    } else if (array[0].for === 'category-icon') {
                        this.changeCategoryIcon(array[0].selectedMedia);
                    } else if (array[0].for === 'resType-img') {
                        this.resTypeForm.get('image').patchValue(array[0].selectedMedia);
                    } else if (array[0].for === 'resType-icn') {
                        this.resTypeForm.get('icon').patchValue(array[0].selectedMedia);
                    } else if (array[0].for === 'domain-video') {
                        this.changeDomainVideo(array[0].selectedMedia);
                    }
                }
            });
    }

    changeDomainImage(imagesObj) {
        this.domainImagesForm.setValue(imagesObj);
        const domainToSend = {
            ...this.currentDomain,
            image: this.domainImagesForm.value
        }
        this.domainService.updateDomain(this.currentDomainId, domainToSend).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Success', 'Imaginea domeniului a fost încărcată!', "success")
                }
            }, (error) => {
                this.toastService.showToast('Error', 'Imaginea domeniului nu a putut fi încărcată!', "error")
            }
        )
    }

    changeDomainVideo(videoObj) {
        this.domainVideoForm.setValue(videoObj);
        const domainToSend = {
            ...this.currentDomain,
            video: this.domainVideoForm.value
        }
        this.domainService.updateDomain(this.currentDomainId, domainToSend).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Success', 'Videoclipul domeniului a fost încărcat!', "success")
                }
            }, (error) => {
                this.toastService.showToast('Error', 'Videoclipul domeniului nu a putut fi încărcat!', "error")
            }
        )
    }

    changeDomainIcon(iconObj) {
        this.domainIconForm.setValue(iconObj);
        const domainToSend = {
            ...this.currentDomain,
            icon: this.domainIconForm.value
        }
        this.domainService.updateDomain(this.currentDomainId, domainToSend).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Success', 'Iconul domeniului a fost încărcat!', "success")
                }
            }, (error) => {
                this.toastService.showToast('Error', 'Iconul domeniului nu a putut fi încărcat!', "error")
            }
        )
    }

    changeCategoryImage(imagesObj) {
        this.categoryImagesForm.setValue(imagesObj);
        const categoryToSend = {
            ...this.categoryToChange,
            image: this.categoryImagesForm.value
        }
        console.log(categoryToSend);
        this.resourceService.updateResourceCategory(this.categoryToChange.id, categoryToSend).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Success', 'Imaginea categoriei a fost încărcată!', "success")
                }
            }, (error) => {
                this.toastService.showToast('Error', 'Imaginea categoriei nu a putut fi încărcată!', "error")
            }
        )
    }

    changeCategoryIcon(iconObj) {
        this.categoryIconForm.setValue(iconObj);
        const categoryToSend = {
            ...this.categoryToChange,
            icon: this.categoryIconForm.value
        }
        this.resourceService.updateResourceCategory(this.categoryToChange.id, categoryToSend).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Success', 'Iconul categoriei a fost încărcat!', "success")
                }
            }, (error) => {
                this.toastService.showToast('Error', 'Iconul categoriei nu a putut fi încărcat!', "error")
            }
        )
    }

    categoryInit() {
        this.categoryForm = this.formBuilder.group(
            {
                nameEn: [null, Validators.required],
                nameRo: [null, Validators.required],
                enableForList: [false]
            }
        )
    }

    resTypeInit() {
        this.resTypeForm = this.formBuilder.group({
            nameEn: [null, Validators.required],
            nameRo: [null],
            notificationHours: [0, Validators.pattern('^[0-9]\\d*$')],
            location: [false],
            adultNumber: [false],
            adultChildrenNumber: [false],
            adultChildrenAndRoomNumber: [false],
            dateAsDay: [false],
            dateInterval: [false],
            dateAsHour: [false],
            hoursInterval: [false],
            icon: this.formBuilder.group({
                fileName: [null],
                filePath: [null]
            }),
            image: this.formBuilder.group({
                fileName: [null],
                filePath: [null]
            })

        }, {
            validators: this.customCheckValidation
        })
    }

    customCheckValidation(group: FormGroup): { [key: string]: any } | null {
        let dateGroup = 0;
        let personGroup = 0;

        if (group.get('adultNumber').value) {
            personGroup++;
        }
        if (group.get('adultChildrenNumber').value) {
            personGroup++;
        }
        if (group.get('adultChildrenAndRoomNumber').value) {
            personGroup++;
        }

        if (group.get('dateAsDay').value) {
            dateGroup++;
        }

        if (group.get('dateInterval').value) {
            dateGroup++;
        }

        if (group.get('dateAsHour').value) {
            dateGroup++;
        }

        if (group.get('hoursInterval').value) {
            dateGroup++;
        }

        if (dateGroup > 1 && personGroup > 1) {
            console.log('DATE INVALID')
            return {dateInvalid: true, personInvalid: true}
        } else if (dateGroup > 1) {
            return {dateInvalid: true};
        } else if (personGroup > 1) {
            return {personInvalid: true};
        }

        return null;
    }

    getCurrentDomain() {
        // this.currentDomainImage=[];
        this.domainService.getDomainById(this.currentDomainId).subscribe((domain: any) => {
            console.log("domeniu", domain);
            // this.currentDomainImage = domain.image;
            this.currentDomain = domain;
            this.domainImagesForm.patchValue(domain.image);
            this.domainIconForm.patchValue(domain.icon);
            this.domainVideoForm.patchValue(domain.video);
            console.log(this.domainImagesForm.value);
        })


    }

    openModal(templateRef) {
        this.categoryInit();
        this.resTypeInit();
        this.modalService.open(templateRef, {centered: true});
        console.log(this.resTypeForm.value)
    }

    //open modal to edit resource type
    openModalValue(templateRef, data) {
        this.currentResTypeData = data;
        this.modalService.open(templateRef, {centered: true});
        this.resTypeForm.patchValue({
            nameEn: data.nameEn,
            nameRo: data.nameRo,
            notificationHours: data.notificationHours,
            location: data.filterOption.location,
            adultNumber: data.filterOption.adultNumber,
            adultChildrenNumber: data.filterOption.adultChildrenNumber,
            adultChildrenAndRoomNumber: data.filterOption.adultChildrenAndRoomNumber,
            dateAsDay: data.filterOption.dateAsDay,
            dateInterval: data.filterOption.dateInterval,
            dateAsHour: data.filterOption.dateAsHour,
            hoursInterval: data.filterOption.hoursInterval,
            image: data.image,
            icon: data.icon
        });
        console.log('FORM pentru nameEN/nameRO', this.resTypeForm.value);
    }


    clickMore(index, resId: string) {
        this.isAdvanced[index] = !this.isAdvanced[index];
        for (let j = 0; j < this.resourcesList.length; j++) {
            if (j !== index) {
                this.isAdvanced[j] = false;
                this.removeCategoryThumbnail();
                this.removeCategoryIcon();
            }
        }
        this.resourceService.getResourceCategoryById(resId).subscribe((category: Category) => {
            this.categoryToChange = category;
            this.categoryImagesForm.patchValue(category.image);
            this.categoryIconForm.patchValue(category.icon);
            console.log('categtochange', category);
        })
    }

    listCategories() {
        this.total = [];
        const filterObject = {
            domainId: this.currentDomainId,
            name: this.categorySearch.value !== '' ? this.categorySearch.value : null
        }


        //get pentru categorii
        // this.resourceService.getResourceByDomain(this.currentDomain).subscribe((res: any) => {
        //     console.log('LISTA 2', res);
        // });
        this.resourceService.listCategoryFiltered(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {
            this.resourcesList = res["content"];
            this.paginationInfo = res;
            console.log('LISTA CATEGORII', this.resourcesList);
            //for each pentru fiecare categorie in parte si asignarea unui index
            this.resourcesList.forEach((resource: any, index: number) => {
                //get pentru tipurile de resurse din fiecare categorie
                this.resourceService.getAllResourceTypesByResourceCategory(resource.id).subscribe((types: [object]) => {
                    //array ce contine numele si id-ul fiecarei categorii pentru adaugare tip de resurse
                    this.total.push({index: index, categoryId: resource.id, name: resource.name, resTypes: types});
                    //array cu tipurile de resurse
                    this.resourceTypes[index] = types;
                    console.log('TYPES', types);
                })
            })
        })
    }

    updateCategory(event: any, categoryId: string) {
        console.log('update category', event.target.checked);
        this.domainService.changeResourceCategoryEnableForListStatus(categoryId, event.target.checked).subscribe((resp: any) => {
            console.log(resp);
        })

    }

    //DE STERS EVENTUAL
    addNewCategory(categoryNameEn, categoryNameRo, enableForList) {
        this.categoryForm.markAllAsTouched();
        if (this.categoryForm.valid) {

            this.resourceService.getMaxOrderForCategory(this.currentDomainId).subscribe((maxOrder: any) => {

                const category = {
                    nameEn: categoryNameEn,
                    nameRo: categoryNameRo,
                    enableForList: enableForList,
                    description: "",
                    domainId: this.currentDomainId,
                    icon: {
                        fileName: "",
                        filePath: ""
                    },
                    order: Number(maxOrder.reason) + 1,
                    resourceTypes: []
                }
                console.log('OBIECT CATEGORY', category);

                this.resourceService.addResourceCategory(category).subscribe((res: any) => {
                        if (res.success) {
                            this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.DOMAIN.ADD-CATEGORY-SUCCESS"), "success");
                        }
                        this.modalService.dismissAll();
                        this.listCategories();
                    },
                    () => {
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DOMAIN.INVALID-ID"), "error");
                    }
                )
            })
        }


    }

    deleteCategory(id) {
        this.resourceService.deleteResourceCategory(id).subscribe((res: { reason: string, success: boolean }) => {
            console.log(res);
            if (res.success) {
                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.DOMAIN.DEL-CATEGORY-SUCCESS"), "success");
            }
            this.modalService.dismissAll();
            this.listCategories();
        }, (err) => {
            console.log(err);
            if (err.error.reason === 'cannotDeleteCategoryWithResources') {
                this.toastService.showToast('Error', "Nu poți șterge o categorie care este atribuită unei resurse existente!", 'error');
            } else {
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DOMAIN.INVALID-ID"), "error");

            }
        })
    }

    //select just one checkBox for person number and date, add-res-type modal
    //nr pers
    changeSelectionPersons(event, index) {
        this.nrPersIndex = event.target.checked ? index : undefined;
    }

    //date
    changeSelectionDate(event, index) {
        this.dateIndex = event.target.checked ? index : undefined;

    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.total = [];

        const filterObject = {
            domainId: this.currentDomainId,
            name: this.categorySearch.value !== '' ? this.categorySearch.value : null
        }

        //get pentru categorii
        this.resourceService.listCategoryFiltered(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {
            this.resourcesList = res["content"];
            this.paginationInfo = res;
            //for each pentru fiecare categorie in parte si asignarea unui index
            this.resourcesList.forEach((resource: object, index: number) => {
                //get pentru tipurile de resurse din fiecare categorie
                this.resourceService.getAllResourceTypesByResourceCategory(resource["id"]).subscribe((types: object) => {
                    //array ce contine numele si id-ul fiecarei categorii pentru adaugare tip de resurse
                    this.total.push({
                        index: index,
                        categoryId: resource["id"],
                        name: resource["name"],
                        resTypes: types
                    });
                    //array cu tipurile de resurse
                    this.resourceTypes[index] = types;
                })
            })
        })

    }

    //for search field
    searchCategory() {
        this.total = [];
        this.pageNumber = 1;

        const filterObject = {
            domain: this.currentDomain,
            name: this.categorySearch.value !== '' ? this.categorySearch.value : null
        }

        //get pentru categorii
        this.resourceService.listCategoryFiltered(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, filterObject).subscribe((res: object) => {
            this.resourcesList = res["content"];
            console.log('FILTRAT', this.resourcesList);
            this.paginationInfo = res;
            //for each pentru fiecare categorie in parte si asignarea unui index
            this.resourcesList.forEach((resource: object, index: number) => {
                //get pentru tipurile de resurse din fiecare categorie
                this.resourceService.getAllResourceTypesByResourceCategory(resource["id"]).subscribe((types: object) => {
                    //array ce contine numele si id-ul fiecarei categorii pentru adaugare tip de resurse
                    this.total.push({
                        index: index,
                        categoryId: resource["id"],
                        name: resource["name"],
                        resTypes: types
                    });
                    //array cu tipurile de resurse
                    this.resourceTypes[index] = types;
                })
            })
        })
    }

    addResType(categoryId: string) {
        this.resTypeForm.markAllAsTouched();
        if (this.resTypeForm.valid) {
            this.resourceService.getMaxOrderForResType(categoryId).subscribe((maxOrder: any) => {
                console.log('max order', maxOrder.reason);
                if (maxOrder.success) {
                    const resType = {
                        nameEn: this.resTypeForm.value.nameEn,
                        nameRo: this.resTypeForm.value.nameRo,
                        notificationHours: this.resTypeForm.value.notificationHours,
                        description: '',
                        categoryId: categoryId,
                        icon: this.resTypeForm.value.icon,
                        image: this.resTypeForm.value.image,
                        order: Number(maxOrder.reason) + 1,
                        filterOption: {
                            location: this.resTypeForm.value.location,
                            adultNumber: this.resTypeForm.value.adultNumber,
                            adultChildrenNumber: this.resTypeForm.value.adultChildrenNumber,
                            adultChildrenAndRoomNumber: this.resTypeForm.value.adultChildrenAndRoomNumber,
                            dateAsDay: this.resTypeForm.value.dateAsDay,
                            dateInterval: this.resTypeForm.value.dateInterval,
                            dateAsHour: this.resTypeForm.value.dateAsHour,
                            hoursInterval: this.resTypeForm.value.hoursInterval
                        }
                    }
                    this.resourceService.addResourceType(resType).subscribe((res: any) => {
                        if (res.success) {
                            this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.DOMAIN.ADD-RESTYPE-SUCCESS"), "success");
                            this.modalService.dismissAll();
                            this.listCategories();
                            this.resTypeInit();
                            console.log("din addResourceType: ", resType);
                        }
                    }, (error: any) => {
                        console.log(error.error.reason);
                        if (error.error.reason === "alreadyExists") {
                            this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DOMAIN.ADD-RESTYPE-EXISTS"), "error");
                        } else {
                            this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DOMAIN.INVALID-ID"), "error");
                        }
                    })
                }
            })
        }


    }

    deleteResType(resTypeId: string) {
        console.log(resTypeId);
        this.resourceService.deleteResourceTypeById(resTypeId).subscribe((res: any) => {
                // console.log(res);
                if (res.success) {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.DOMAIN.DEL-RESTYPE-SUCCESS"), "success");
                }
                this.modalService.dismissAll();
                this.listCategories();
            },
            (error: any) => {

                if (error.error.reason === 'cannotDeleteResourceTypeWithResources') {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), 'Nu poți șterge un tip de resursă dacă acesta este atribuit unei resurse existente.', "error");

                } else {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.DOMAIN.INVALID-ID"), "error");

                }
            })
    }

    updateResType(resTypeId: string) {
        console.log(resTypeId);
        this.resTypeForm.markAllAsTouched();
        if (this.resTypeForm.valid) {
            const resType = {
                ...this.currentResTypeData,
                nameEn: this.resTypeForm.value.nameEn,
                nameRo: this.resTypeForm.value.nameRo,
                notificationHours: this.resTypeForm.value.notificationHours,
                icon: this.resTypeForm.value.icon,
                image: this.resTypeForm.value.image,
                filterOption: {
                    location: this.resTypeForm.value.location,
                    adultNumber: this.resTypeForm.value.adultNumber,
                    adultChildrenNumber: this.resTypeForm.value.adultChildrenNumber,
                    adultChildrenAndRoomNumber: this.resTypeForm.value.adultChildrenAndRoomNumber,
                    dateAsDay: this.resTypeForm.value.dateAsDay,
                    dateInterval: this.resTypeForm.value.dateInterval,
                    dateAsHour: this.resTypeForm.value.dateAsHour,
                    hoursInterval: this.resTypeForm.value.hoursInterval
                }
            }

            this.resourceService.updateResourceType(resTypeId, resType).subscribe((res: any) => {
                console.log('DUPA UPDATE', res);
                if (res.success) {
                    this.listCategories();
                    this.modalService.dismissAll();
                }
            })

        }
    }

    clearFormControlresType(formControl) {
        this.resTypeForm.get(formControl).patchValue(null);
    }

    clearFormControlCategory(formControl) {
        this.categoryForm.get(formControl).patchValue(null);
    }


    removeDomainIcon() {
        this.domainIconForm.setValue({
            filePath: '',
            fileName: ''
        });
    }

    removeDomainThumbnail() {
        this.domainImagesForm.setValue({
            filePath: '',
            fileName: ''
        });
    }

    removeDomainVideo() {
        this.domainVideoForm.setValue({
            filePath: '',
            fileName: ''
        });
    }

    removeCategoryThumbnail() {
        this.categoryImagesForm.setValue({
            filePath: '',
            fileName: ''
        });
    }

    removeCategoryIcon() {
        this.categoryIconForm.setValue({
            filePath: '',
            fileName: ''
        });
    }

    removeResTypeThumbnail() {
        this.resTypeForm.get('image').setValue({
            filePath: '',
            fileName: ''
        })
    }

    removeResTypeIcon() {
        this.resTypeForm.get('icon').setValue({
            filePath: '',
            fileName: ''
        })
    }

    openMedia(content: any) {
        this.modalMediaService.sendImagesToService([this.domainImagesForm.value]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

}
