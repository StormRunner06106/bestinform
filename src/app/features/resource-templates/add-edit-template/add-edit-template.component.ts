import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {forkJoin, Observable, of, Subject, switchMap, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {MatDialog} from "@angular/material/dialog";
import {ResourceType} from "../../../shared/_models/resource-type.model";

@Component({
    selector: 'app-add-edit-template',
    templateUrl: './add-edit-template.component.html',
    styleUrls: ['./add-edit-template.component.scss']
})
export class AddEditTemplateComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();
    isEditMode: boolean;
    showAttributField: boolean;
    customValue: any;
    isDisabled = false;

    templateForm: FormGroup;
    templateData: any;
    emptyTemplateData = {
        name: '',
        slug: ''
    }

    categoriesList: Array<object> = [];
    attributeCategoryList: any;

    // Material Chips
    separatorKeysCodes: number[] = [ENTER, COMMA];
    benefitCtrl = new FormControl('');
    benefits = [];
    filteredBenefits: Observable<string[]>;
    allBenefits: string[] = ['Parcare gratuita', 'Aer conditionat', 'Bauturi gratis', 'Cabina foto', 'Candy bar'];

    resourceTypes: ResourceType[];

    @ViewChild('benefitInput') benefitInput: ElementRef<HTMLInputElement>;

    constructor(private fb: FormBuilder,
                private resourcesService: ResourcesService,
                private templateService: TemplatesService,
                private route: ActivatedRoute,
                private toastService: ToastService,
                private translate: TranslateService,
                private router: Router,
                private modalService: MatDialog,
                private cdr: ChangeDetectorRef,) {
    }

    tabIndex = 0;
    resourcesByDomain: Array<object>;
    resTypesByResource: Array<object>;

    templatesTabName = ['general_info', 'about', 'contact', 'facilities'];
    selectedCategories = [];
    selectedAttributes = [];
    attributeCheckIndex = 0;
    attributesList: Array<object> = [];
    attributesListOnEdit: Array<object> = [];


    // key - id-ul unui resource type; value - daca este disabled
    checkboxDisabledStates: { [key: string]: boolean } = null;

    ngOnInit(): void {
        this.templateFormInit();
        this.templateService.getResourceTypes().subscribe((resp: any) => {
            this.resourceTypes = resp;
            console.log('RES TYPES', this.resourceTypes);
            this.getTemplateData();
        })
        this.getAttributeCategories();

    }

    initConfigTabs() {
        this.templatesTabName.forEach((item: string) => {
            this.addAttributeTab(item);
        })
    }

    openModal(templateRef) {
        this.modalService.open(templateRef);
    }


    /** Initialize Form */
    templateFormInit() {
        this.templateForm = this.fb.group(
            {
                name: ['', Validators.required],
                resourceTypeIds: [],
                slug: "string",
                geographicalCoordinates: false,
                timetable: false,
                serviceBookingTimeSlots: false,
                // additionalServices: false,
                rentalBooking: false,
                serviceBookingTimePicker: false,
                ticketBooking: false,
                productsList: false,
                culturalBooking: false,
                applyToJob: false,
                carBooking: false,
                noBooking: false,
                relatedResources: false,
                externalUrl: false,
                benefits: this.fb.array(['']),
                attributes: this.fb.array([]),
                bookingType: '',
                categoryId: null,
                listingSetting: this.fb.group({
                    cardType: null,
                    attributes: [],
                    reviews: false,
                    location: false
                })
            }, {validators: this.customBookingTypeValidation}
        )
    }

    customBookingTypeValidation(group: FormGroup): { [key: string]: any } | null {
        let checked = 0;
        const ticketBooking = group.get('ticketBooking')?.value;
        if(ticketBooking){
            checked++;
        }

        const rentalBooking = group.get('rentalBooking')?.value;
        if(rentalBooking){
            checked++;
        }

        const serviceBookingTimeSlots = group.get('serviceBookingTimeSlots')?.value;
        if(serviceBookingTimeSlots){
            checked++;
        }

        const serviceBookingTimePicker = group.get('serviceBookingTimePicker')?.value;
        if(serviceBookingTimePicker){
            checked++;
        }

        const productList = group.get('productsList')?.value;
        if(productList){
            checked++;
        }

        const culturalBooking = group.get('culturalBooking')?.value;
        if(culturalBooking){
            checked++;
        }

        const applyToJob = group.get('applyToJob')?.value;
        if(applyToJob){
            checked++;
        }

        const carBooking = group.get('carBooking')?.value;
        if(carBooking){
            checked++;
        }

        const noBooking = group.get('noBooking')?.value;
        if(noBooking){
            checked++;
        }


        if(checked === 0){
            return {minimumBooking: true};
        }else if(checked > 1){
            return {multipleBooking: true};
        }

        return null;
    }

    /** Initialize Data */
    getTemplateData() {
        this.route.paramMap.pipe(
            switchMap((params: any) => {
                if (params.get('id')) {
                    this.isEditMode = true;
                    return this.templateService.getTemplateById(params.get('id'));
                } else {
                    this.isEditMode = false;
                    return of(this.emptyTemplateData);
                }
            })
        ).subscribe((template: any) => {
            this.templateData = template;
            console.log('TEMPLATE DATA', this.templateData);
            console.log(this.templateData.attributes);

            this.templateForm.patchValue(template);
            console.log('TEMPLATE FORM', this.templateForm.value)

            if (template["benefits"]?.length > 0) {
                this.benefits = template["benefits"];
            }

            this.changeDomain(template["domain"]);
            this.changeResource(template["categoryId"]);

            // Only on EDIT MODE
            if (this.isEditMode) {
                this.remakeFormAttributesArrayForEditMode();
                this.checkResourceTypeForTemplate(template.id);
            } else {
                this.checkResourceTypeForTemplate();
                this.initConfigTabs();
            }

        });
    }


    attributes(): FormArray {
        return this.templateForm.get('attributes') as FormArray;
    }

    newAttributesTab(tabName: string): FormGroup {
        return this.fb.group({
            tabName: tabName,
            tabAttributes: this.fb.array([])
        });
    }

    addAttributeTab(tabName: string) {
        this.attributes().push(this.newAttributesTab(tabName));
    }

    removeAttributeTab(attrTabIndex: number) {
        this.attributes().removeAt(attrTabIndex);
    }

    tabAttributes(attrTabIndex: number): FormArray {
        return this.attributes()
            .at(attrTabIndex)
            .get('tabAttributes') as FormArray;
    }

    newTabAttribute(categoryId: string, categoryName: string): FormGroup {
        return this.fb.group({
            categoryName: categoryName,
            categoryId: categoryId,
            categoryAttributes: this.fb.array([])
        });
    }

    addTabAttribute(attrTabIndex: number, categoryId: string, categoryName: string) {
        this.tabAttributes(attrTabIndex).push(this.newTabAttribute(categoryId, categoryName));
    }

    removeTabAttribute(attrTabIndex: number, tabAttributeIndex: number) {
        this.tabAttributes(attrTabIndex).removeAt(tabAttributeIndex);
    }


    /** Get Category Attribute*/
    getCategoryAttribute(tabIndex, categoryIndex) {
        return this.tabAttributes(tabIndex)
            .at(categoryIndex)
            .get('categoryAttributes') as FormArray
    }

    /** Add Category Attribute*/
    addCategoryAttribute(tabIndex, categoryIndex, attributeId, attributeName) {
        this.getCategoryAttribute(tabIndex, categoryIndex).push(this.newCategoryAttribute(attributeId, attributeName));
    }

    /** Create New Category Attribute*/
    newCategoryAttribute(attributeId: string, attributeName: string) {
        return this.fb.group({
            id: attributeId,
            name: attributeName,
        });
    }

    /** Remove Category Attribute*/
    removeCategoryAttribute(tabIndex, categoryIndex, attributeIndex) {
        return this.getCategoryAttribute(tabIndex, categoryIndex)
            .removeAt(attributeIndex)
    }


    changeTab(event) {
        this.tabIndex = event.index;
    }


    disableCheckBox(event, i) {
        console.log('am ales', event.target.id, i);
        // this.customValue=event;
        // this.showAttributField= this.customValue === 'custom' ? true : false;
        // this.isDisabled=true;

        // this.cdr.detectChanges();
    }

    checkResourceTypeForTemplate(templateId?: string) {
        const resourceTypeIds = this.resourceTypes.map(type => type.id);

        this.templateService.checkResourceTypeForTemplate(resourceTypeIds, templateId || null)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.resourceTypes.forEach(type => {
                        this.checkboxDisabledStates = {
                            ...this.checkboxDisabledStates,
                            [type.id]: false
                        };
                    });

                    if (res && res.length > 0) {
                        res.forEach(type => {
                            this.checkboxDisabledStates = {
                                ...this.checkboxDisabledStates,
                                [type.resourceTypeId]: true
                            };
                        });

                        /*const control = this.templateForm.get('resourceTypeIds');
                        if (control.enabled && control.value.includes(resTempId)) {
                            control.setValue(control.value.filter((id: number) => id !== resTempId));
                        }*/

                        // this.toastService.showToast("Error", "Există deja un template creat pentru acest tip de resursa!", "error")
                    } else if (res.length === 0) {
                        console.log(res);
                    }
                }, error: (err: any) => {
                    console.log('verificam daca exista', err);
                }
            });
    }

    //if for listing settings, the user choose the type of card custom, the field for atribute will show up
    onCustomCardSelect(event) {
        console.log('am ales', event);
        this.customValue = event;
        this.showAttributField = this.customValue === 'custom' ? true : false;
        this.cdr.detectChanges();
    }


    clearFormControl(formControl) {
        this.templateForm.get(formControl).patchValue(null);
    }


    /** Submit Form*/
    submitForm() {

        // Mark form as touched
        this.templateForm.markAllAsTouched();

        // Check if the form is valid
        if (this.templateForm.valid) {

            if (this.templateForm.value.menuItems) {
                this.templateForm.controls.bookingType.setValue('menu')
            }

            if (this.templateForm.value.externalUrl) {
                this.templateForm.controls.bookingType.setValue('externalUrl')
            }

            if (this.templateForm.value.applyToJob) {
                this.templateForm.controls.bookingType.setValue('applyToJob')
            }

            if (this.templateForm.value.serviceBookingTimeSlots) {
                this.templateForm.controls.bookingType.setValue('serviceBookingTimeSlots')
            }

            if (this.templateForm.value.rentalBooking) {
                this.templateForm.controls.bookingType.setValue('rentalBooking')
            }

            if (this.templateForm.value.serviceBookingTimePicker) {
                this.templateForm.controls.bookingType.setValue('menu')
            }

            if (this.templateForm.value.ticketBooking) {
                this.templateForm.controls.bookingType.setValue('ticketBooking')
            }

            if (this.templateForm.value.productsList) {
                this.templateForm.controls.bookingType.setValue('productsList')
            }

            if (this.templateForm.value.culturalBooking) {
                this.templateForm.controls.bookingType.setValue('culturalBooking')
            }

            if (this.templateForm.value.carBooking) {
                this.templateForm.controls.bookingType.setValue('carBooking')
            }

            if (this.templateForm.value.noBooking) {
                this.templateForm.controls.bookingType.setValue('noBooking')
            }


            // Check if you are on editMode
            if (!this.isEditMode) {
                // Create new template
                this.addTemplate();
            } else {
                // Edit template
                this.editTemplate();
            }
        } else{
            console.log(this.templateForm)
        }

    }


    addTemplate() {

        console.log('ADAUGARE TEMPLATE', this.templateForm.value);


        // Request Data
        const requestData = {
            ...this.templateForm.value,
            attributes: this.convertAttributes()
        }

        // Add Template
        this.templateService.addTemplate(requestData).subscribe({
            next: (res: { reason: string, success: boolean }) => {
                console.log(res)
                if (res.success) {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.TEMPLATE.ADD-SUCCESS"), "success");

                    // TODO uncomment this line to redirect you to the list page
                    this.router.navigate(['../list'], {relativeTo: this.route});
                }
            },
            error: (error) => {
                console.log('EROARE', error);
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.TEMPLATE.ADD-ERROR"), "error");
            }
        })
    }

    editTemplate() {

        console.log('EDIT TEMPLATE', this.templateForm.value);


        const formToSubmit = {
            ...this.templateForm.value,
            benefits: this.benefits,
            attributes: this.convertAttributes(),
        };

        this.templateService.updateTemplate(this.templateData["id"], formToSubmit).subscribe({
            next: (resp: { reason: string, success: boolean }) => {
                console.log('DUPA UPDATE', resp);
                if (resp.success) {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.TEMPLATE.UPDATE-SUCCESS"), "success");

                    // TODO Activeaza zilina de mai jos cand ia terminat aici
                    this.router.navigate(['../../list'], {relativeTo: this.route});
                }
            },
            error: (error: { error: { reason } }) => {
                if (error.error.reason === "alreadyExistsFromThisDomain") {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.TEMPLATE.UPDATE-EXISTS"), "error");
                } else {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.TEMPLATE.UPDATE-ERROR"), "error");
                }
            }
        })
    }

    changeDomain(domain) {
        this.resourcesByDomain = [];
        this.resTypesByResource = [];
        this.resourcesService.getResourceByDomain(domain).subscribe((resources: Array<object>) => {
            this.resourcesByDomain = resources;
        })
    }

    changeResource(resource) {
        this.resTypesByResource = [];
        this.resourcesService.getAllResourceTypesByResourceCategory(resource).subscribe((resTypes: Array<object>) => {
            this.resTypesByResource = resTypes;
        })
    }

    /** Get Categories List*/
    getAttributeCategories() {
        this.templateService.getCategoryList(0, -1, "name", "cresc", {}).subscribe((list: { content }) => {
            this.attributeCategoryList = list.content.map(data => {
                return {categoryId: data.id, categoryName: data.name}
            })
            console.log('CATEGORII', this.attributeCategoryList);
        })
    }

    selectAll() {
        console.log(this.templateForm.value.categoryId);
    }


    check(isChecked: boolean, value: string, name: string, tabIndex: number) {
        console.log(isChecked + ' si ' + value);
        if (isChecked) {
            this.categoriesList.push({id: value, categoryName: name, tabIndex: tabIndex});
            console.log('dupa check', this.categoriesList);
        } else {
            let filteredArray = this.categoriesList.filter((e: { id: string, categoryName: string, tabIndex: number }) => e.id !== value);
            console.log('uncheck', filteredArray);
            this.categoriesList = filteredArray;
        }

    }


    /** Add Selected Categories*/
    confirmCategories() {

        console.log('VERIFY CATEG SELECTED', this.selectedCategories);
        // Select form attributes array by the index
        let getTabAttributesByIndex = this.templateForm.value.attributes[this.attributeCheckIndex].tabAttributes;

        // // Loop through the form value attributes
        getTabAttributesByIndex.forEach(itemCategory => {
            if (this.selectedCategories.find(item => item.categoryId === itemCategory.categoryId)) {
                console.log('FIND', this.selectedCategories.find(item => item.categoryId === itemCategory.categoryId));
                this.selectedCategories = this.selectedCategories.filter(e => e.categoryId !== itemCategory.categoryId);
                console.log('CONST', getTabAttributesByIndex);
            } else {
                // Index of the attribute
                const attrToRemoveIndex = this.templateForm.value.attributes[this.attributeCheckIndex].tabAttributes.findIndex(e => e.categoryId === itemCategory.categoryId);

                // Remove the attribute by the index from the FORM values
                this.removeTabAttribute(this.attributeCheckIndex, attrToRemoveIndex);
            }
            // Check if the itemCategory exist in the selectedCategories
            // if (this.selectedCategories.findIndex(item => item === itemCategory.categoryId) === -1) {

            // Index of the attribute
            // const attrToRemoveIndex = this.templateForm.value.attributes[this.attributeCheckIndex].tabAttributes.findIndex(e => e.categoryId === itemCategory.categoryId);

            // Remove the attribute by the index from the FORM values
            // this.removeTabAttribute(this.attributeCheckIndex, attrToRemoveIndex);
            // }
        })

        // Loop through the selectedCategories
        this.selectedCategories.forEach((category: any) => {

            // Check If category ID doesn't exist in the form values
            if (this.templateForm.value.attributes[this.attributeCheckIndex].tabAttributes.findIndex(item => item.categoryId === category) === -1) {

                // Add the category ID to the form
                this.addTabAttribute(this.attributeCheckIndex, category.categoryId, category.categoryName);
            }
        })

        this.modalService.closeAll();
    }

    /** Verify if you have any selected attributes in the opened tab*/
    verifyTabCategories(attrTabIndex: number) {

        // Empty the selected Array
        this.selectedCategories = [];

        // Store the tab index
        this.attributeCheckIndex = attrTabIndex;

        // If the selected TAB have selected categories
        // and add them to selectedCategories array
        if (this.templateForm.value.attributes[attrTabIndex].tabAttributes.length > 0) {

            // Add form value in selectedCategories
            this.templateForm.value.attributes[attrTabIndex].tabAttributes.forEach((item) => {

                // Add category from FORM value to selectedCategories
                this.selectedCategories.push({
                    categoryId: item.categoryId,
                    categoryName: item.categoryName
                });
            })
        }
    }

    /** Add Selected Attributes*/
    confirmAttributes(categoryId: string) {


        console.log('CATEG ID', categoryId)
        console.log('VERIFY - SELECTED ATTR', this.selectedAttributes);


        // Category Index
        let categoryIndex = this.templateForm.value.attributes[this.tabIndex].tabAttributes.findIndex(item => item.categoryId === categoryId);


        // #START - Remove Category Attributes - Functionality
        // Get Category Attributes
        let categoryFormAttributes = this.getCategoryAttribute(this.tabIndex, categoryIndex).value;

        // Loop through the form value attributes
        categoryFormAttributes.forEach(attribute => {

            // Check if the attribute exist in the selectedAttributes
            if (!this.selectedAttributes.includes(attribute.id)) {

                // Index of the attribute from the original array
                let attrToRemoveIndex = this.getCategoryAttribute(this.tabIndex, categoryIndex).value.indexOf(attribute.id);

                // Remove Attribute
                this.removeCategoryAttribute(this.tabIndex, categoryIndex, attrToRemoveIndex)

            }

        })


        // #START - Add Category Attributes - Functionality
        // Loop through the selectedAttr
        this.selectedAttributes.forEach((attribute: any) => {

            // Check if the attribute exist in the form value
            if (this.templateForm.value.attributes[this.tabIndex].tabAttributes[categoryIndex].categoryAttributes?.findIndex(item => item === attribute.id) === -1) {

                // Add new attribute
                this.addCategoryAttribute(this.tabIndex, categoryIndex, attribute.id, attribute.name);

            }

        })

        this.modalService.closeAll();

    }

    /** Verify if you have any selected attributes in the opened tab*/
    verifyCategAttr(categoryId: string, tabIndex) {

        // Empty the selectedAttr
        this.selectedAttributes = [];

        // Get the attributesList by the categoryId
        this.templateService.listAttributesFiltered(0, -1, null, null, null, {categoryId: categoryId}).subscribe((response: any) => {
            this.attributesList = response.content.map(data => {
                return {id: data.id, name: data.name}
            });
        })

        // Populate the selected input with the form values
        this.selectedAttributes = this.templateForm.value.attributes[tabIndex].tabAttributes.find(catId => catId.categoryId === categoryId).categoryAttributes
    }


    /** Get Categories & Attribute Names for Edit Mode */
    remakeFormAttributesArrayForEditMode() {

        let allCategoriesId = []
        let allAttributesId = []
        if (this.templateData.attributes.length === 0) {
            this.initConfigTabs();
        } else {
            this.templateData.attributes.forEach((tab, index, array) => {

                // Get all categories IDs
                tab.tabAttributes.forEach(category => {
                    allCategoriesId.push(category.categoryId)

                    // Get all attributes IDs
                    category.categoryAttributes.forEach(attributeId => {
                        allAttributesId.push(attributeId)
                    })
                })


                // Last array loop
                if (index === array.length - 1) {


                    forkJoin([
                        this.resourcesService.getAttributeCategories(allCategoriesId),
                        this.resourcesService.getAttributes(allAttributesId)
                    ]).subscribe({
                        next: (data) => {

                            // Request Data
                            let categories: any = data[0];
                            let attributes: any = data[1];


                            // Remake the attributes array
                            this.templateData = {
                                ...this.templateData,
                                attributes: this.templateData.attributes.map(attributeObject => {
                                        return {
                                            // Store the atribute Object as it is
                                            ...attributeObject,
                                            // Map through the array and modify it as you like
                                            tabAttributes: attributeObject.tabAttributes.map(tabAttribute => {

                                                // Find the specific attribute by the ID
                                                const findCategory = categories.find(
                                                    data => data.id === tabAttribute.categoryId
                                                );

                                                console.log('find categ', findCategory);

                                                if (findCategory) {
                                                    // Return object with the combined data
                                                    return {
                                                        categoryName: findCategory.name,
                                                        categoryId: tabAttribute.categoryId,
                                                        categoryAttributes: tabAttribute.categoryAttributes.map(atribute => {

                                                            const findAttribute = attributes.find(
                                                                data => data.id === atribute
                                                            );

                                                            return {
                                                                id: atribute,
                                                                name: findAttribute?.name
                                                            }

                                                        }),
                                                    };
                                                }

                                            })
                                        };
                                    }
                                )
                            }


                            // Recreate atribute for FORM data
                            this.attributesOnEdit()
                        }
                    })

                }
            })
        }


    }

    /** Update Attributes Form Values for Edit Mode */
    attributesOnEdit() {
        // Loop through the attributes data that we fetched from the GET request
        for (const attribute of this.templateData.attributes) {

            // Create a new FormArray for the tabAttributes field
            const tabAttributes: any = new FormArray([]);

            // Then loop through the tabAttributes data to create a new FormGroup for each element
            for (const tabAttribute of attribute.tabAttributes) {



                if ( tabAttribute) {

                    // Create a new FormArray for the categoryAttributes field
                    const categoryAttributes = new FormArray([]);

                    // Then loop through the categoryAttributes data and populate it with FormControl objects for each value in the categoryAttributes array
                    for (const categoryAttribute of tabAttribute.categoryAttributes) {
                        categoryAttributes.push(new FormGroup({
                            id: new FormControl(categoryAttribute.id),
                            name: new FormControl(categoryAttribute.name),
                        }));
                    }

                    // We push the new FormGroup object for the tabAttribute object to the tabAttributes FormArray,
                    // and repeat the process for each tabAttribute in the attribute.
                    tabAttributes.push(new FormGroup({
                        categoryId: new FormControl(tabAttribute.categoryId),
                        categoryName: new FormControl(tabAttribute.categoryName),
                        categoryAttributes
                    }));
                }




            }

            // Once we have finished looping through all the attributes,
            // we push the new FormGroup object for the attribute object to the attributes FormArray in the new FormGroup object we created earlier
            (this.templateForm.get('attributes') as FormArray).push(new FormGroup({
                tabName: new FormControl(attribute.tabName),
                tabAttributes
            }));
        }

        // Finally, we set the value of the original form to the value of the new FormGroup object we just created,
        // which populates the form with the data from the GET request:
        this.templateForm.setValue(this.templateForm.value);
    }

    /** Multiple Select */
    compareSelectedCategoriesObjects(o1: any, o2: any): boolean {
        return o1.categoryName === o2.categoryName && o1.categoryId === o2.categoryId;
    }

    compareSelectedAttributesObjects(o1: any, o2: any): boolean {
        return o1.name === o2.name && o1.id === o2.id;
    }

    /** Convert Tab Categories/Attributes*/
    convertAttributes() {
        // Remove the Name for Category && Atribute
        return this.templateForm.value.attributes.map(tab => {
            let tabAttributes = tab.tabAttributes.map(category => {
                let categoryAttributes = category.categoryAttributes.map(attr => attr.id);
                return {categoryId: category.categoryId, categoryAttributes};
            });
            return {tabName: tab.tabName, tabAttributes};
        });
    }

    closeModal() {
        this.modalService.closeAll();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}


