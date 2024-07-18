import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {forkJoin, Observable, startWith} from "rxjs";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {map} from "rxjs/operators";
import {MatChipEditedEvent, MatChipInputEvent} from "@angular/material/chips";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {Attribute} from "../../../shared/_models/attribute.model";
import {TranslateService} from "@ngx-translate/core";
import {ToastService} from "../../../shared/_services/toast.service";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";

@Component({
    selector: 'app-properties',
    templateUrl: './properties.component.html',
    styleUrls: ['./properties.component.scss'],
    providers: [ModalMediaService]
})
export class PropertiesComponent implements OnInit {


    propertiesForm: FormGroup;
    categories: [object];
    attribute: object;
    categList = [];
    maxOrderByCategory = [];

    // Mat Table - Filter Forms
    searchFilter: FormControl = new FormControl('');

    displayedColumns: string[] = ['id','icon', 'alias', 'valueType', 'visibleInList', 'category', 'actions'];
    dataSource = [];
    myDataSource = [];
    paginationInfo : any;

    imgPath:string;

    // initial filter numbers
    pageNumber=0;
    // pageSize: number;
    pageSize=10;
    pageSizeArray = [10, 25, 100];
    sorting = 'categoryId';
    sort2 = 'order';
    dir = 'asc';

    listOfObservables$: Observable<any>[];

    loaded: boolean;

    // Material Chips
    separatorKeysCodes: number[] = [ENTER, COMMA];
    optionCtrl = new FormControl('');
    options = [];
    filteredOptions: Observable<string[]>;
    allOptions: string[] = [];

    resourceTypes: Array<object>;
    resourceTypesToSend: Array<object>;

    constructor(private fb: FormBuilder,
                private modalService: NgbModal,
                private templatesService: TemplatesService,
                private translate: TranslateService,
                private toastService: ToastService,
                private modalMediaService: ModalMediaService,
                private cdr: ChangeDetectorRef
    ) {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allOptions.slice())),
        );
    }

    ngOnInit(): void {
        this.pageNumber = 1;
        // this.pageSize = 5;

        this.formInit();
        this.listAttributes();
        this.getAllCategories();
        this.getResourceTypes();
        this.imgPath="./assets/images/others/icon.png";
        this.getIcon();
    }

    getIcon(){
        this.modalMediaService.currentImagesArray
            .subscribe(async (array: any) => {
                if (array.length > 0) {
                    if (array[0].for === 'attr-icon') {
                        this.propertiesForm.get('icon').patchValue(array[0].selectedMedia);
                        this.imgPath = array[0].selectedMedia.filePath;
                        this.cdr.detectChanges();
                    }
                }
            });
    }

    formInit() {
        this.imgPath="./assets/images/others/icon.png";
        this.options=[];
        this.propertiesForm = this.fb.group({
            id: [null],
            name: [null, Validators.required],
            alias: [null, Validators.required], //public info
            categoryId: [null, Validators.required],
            description: [null],
            valueType: ['text', Validators.required],
            order: [null],
            offset: [null],
            size: [null],
            valuePlaceholder: [null],
            visibleInList: [null],
            visibleInForm: true,
            propertyRequired: [null],
            uniqueValue: [null],
            icon: this.fb.group({
                fileName:[null],
                filePath:[null]
            }),
            valueOptions: [],
            // featured: [null],
            usedInFiltering: true,
            resourceTypeIds: [],
            enrollment: true

        })
    }

    display(event){
        this.resourceTypesToSend = event.value;
        console.log(this.propertiesForm.value.resourceTypeIds);
    }

    getAllCategories(){
        this.templatesService.getCategoryList(0, -1, this.sorting, this.dir, {}).subscribe((categories: object)=>{
            // console.log('CATEGORII', categories);
            this.categories= categories["content"];
        })
    }

    getMaxOrderByCategory(){
        this.templatesService.getCategoryList(0, -1, this.sorting, this.dir, {}).subscribe((categories: object)=>{
            // console.log('CATEGORII', categories);
            categories["content"].forEach((categ:any)=>{
                this.templatesService.getMaxOrderByCategory(categ.id).subscribe((order:{success: boolean, reason: string})=>{
                    this.maxOrderByCategory.push({categoryId: categ.id, maxOrder: Number(order.reason)});
                })
            })
        })
    }

    listAttributes(){
        this.getMaxOrderByCategory();
        this.loaded = false;
        this.categList= [];
        // this.maxOrderByCategory=[];
        this.listOfObservables$=[];
        this.templatesService.listAttributesFiltered(this.pageNumber - 1,this.pageSize, this.sorting, this.sort2, this.dir, {}).subscribe((attributes:object)=>{
            this.paginationInfo= attributes;

            attributes["content"].forEach((attribute: Attribute)=>{

                this.categList.push( {id: attribute.id, alias: attribute.alias, icon: attribute.icon, categoryId: attribute.categoryId, categoryName: '' , valueType: attribute.valueType, visibleInList: attribute.visibleInList, order: attribute.order, maxOrderCategory: 0 });
                this.listOfObservables$.push(this.templatesService.getAttributeCategoryById(attribute.categoryId));

            })

            forkJoin(this.listOfObservables$).subscribe((res:any)=>{
                // console.log('OBS',res);
                res.forEach((category: any,index: number)=>{
                        this.categList[index].categoryName=category?.name;
                    this.maxOrderByCategory.forEach((categoryMaxOrder:{categoryId: string, maxOrder: number})=>{
                        if(this.categList[index].categoryId === categoryMaxOrder.categoryId){
                            this.categList[index].maxOrderCategory = categoryMaxOrder.maxOrder;
                        }
                    })
                })
                this.loaded = true;
                // console.log('categ list cu maxorder', this.categList);
                // console.log('maxOrderByCategory ce e asta?',this.maxOrderByCategory);
            })

            this.dataSource = attributes["content"];

        })
    }

    pageChanged(event) {
        this.getMaxOrderByCategory();
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;

        const filters ={
            name: this.searchFilter.value !== '' ? this.searchFilter.value : null
        };

        this.loaded = false;
        this.categList= [];
        this.listOfObservables$=[];
        this.templatesService.listAttributesFiltered(this.pageNumber - 1,this.pageSize, this.sorting, this.sort2, this.dir, filters).subscribe((attributes:object)=>{
            this.paginationInfo= attributes;

            attributes["content"].forEach((attribute: Attribute)=>{

                this.categList.push( {id: attribute.id, alias: attribute.alias, icon: attribute.icon, categoryId: attribute.categoryId, categoryName: '' , valueType: attribute.valueType, visibleInList: attribute.visibleInList, order: attribute.order, maxOrderCategory: 0 });
                this.listOfObservables$.push(this.templatesService.getAttributeCategoryById(attribute.categoryId));

            })

            forkJoin(this.listOfObservables$).subscribe((res:any)=>{
                // console.log('OBS',res);
                res.forEach((category: any,index: number)=>{
                    this.categList[index].categoryName=category?.name;
                    this.maxOrderByCategory.forEach((categoryMaxOrder:{categoryId: string, maxOrder: number})=>{
                        if(this.categList[index].categoryId === categoryMaxOrder.categoryId){
                            this.categList[index].maxOrderCategory = categoryMaxOrder.maxOrder;
                        }
                    })
                })
                this.loaded = true;
                console.log('categ list cu maxorder', this.categList);
            })

            this.dataSource = attributes["content"];

        })
    }

    searchProperties(){
        this.loaded = false;
        this.categList= [];
        this.listOfObservables$=[];
        this.pageNumber = 1;
        this.getMaxOrderByCategory();

        const filters ={
            name: this.searchFilter.value !== '' ? this.searchFilter.value : null
        };

        this.templatesService.listAttributesFiltered(this.pageNumber - 1, this.pageSize, this.sorting, this.sort2, this.dir, filters).subscribe((attributes:object)=>{
            this.paginationInfo= attributes;
            this.dataSource = attributes["content"];
             console.log('FILTER', attributes);
            if(this.dataSource.length === 0){
                console.log('gol');
                this.loaded=true;
            }else{
                attributes["content"].forEach((attribute: Attribute)=>{

                    this.categList.push( {id: attribute.id, alias: attribute.alias, icon: attribute.icon, categoryId: attribute.categoryId, categoryName: '' , valueType: attribute.valueType, visibleInList: attribute.visibleInList, order: attribute.order, maxOrderCategory: 0 });
                    this.listOfObservables$.push(this.templatesService.getAttributeCategoryById(attribute.categoryId));

                })

                forkJoin(this.listOfObservables$).subscribe((res:any)=>{
                    // console.log('OBS',res);
                    res.forEach((category: any,index: number)=>{
                        this.categList[index].categoryName=category.name;
                        this.maxOrderByCategory.forEach((categoryMaxOrder:{categoryId: string, maxOrder: number})=>{
                            if(this.categList[index].categoryId === categoryMaxOrder.categoryId){
                                this.categList[index].maxOrderCategory = categoryMaxOrder.maxOrder;
                            }
                        })
                    })
                    this.loaded = true;
                    console.log('categ list cu maxorder', this.categList);
                })
            }
        })

    }

    clearFormControl(formControl) {
        this.propertiesForm.get(formControl).patchValue(null);
    }

    openModal(templateRef) {
        this.modalService.open(templateRef, {centered: true});
    }

    onSaveClick(){
        this.propertiesForm.markAllAsTouched();
        if(this.propertiesForm.valid){

            if(this.propertiesForm.value.id !== null) {
                this.propertiesForm.get('valueOptions').setValue(this.options);
                // const formToSubmit = {
                //     ...this.attribute,
                //     ...this.propertiesForm.value
                // };
                this.templatesService.updateAttribute(this.propertiesForm.value.id, this.propertiesForm.value).subscribe((update: {success: boolean, reason: string})=>{
                    // console.log("DUPA UPDATE", update);
                    if(update.success){
                        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Proprietatea a fost editata!", "success");
                        this.listAttributes();
                        this.formInit();
                    }

                },
                    (error)=>{
                    if(error.error.message==="notUnique"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), "Aceasta proprietate exista deja!", "error");
                    }else if(error.error.message === "notLoggedIn" || error.error.message === "tokenExpired"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), "Trebue sa fii logat pentru aceasta actiune!", "error");

                    }else if( error.error.message === "orderNotUniqueForCategory"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), "Există deja un atribut cu același număr de ordine!", "error");

                    } else {
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.SERVER-ERROR"), "error");
                    }
                    })
            }else{
                this.templatesService.getMaxOrderByCategory(this.propertiesForm.value.categoryId).subscribe((maxOrder: {success: boolean, reason: string})=>{
                    this.propertiesForm.get('valueOptions').setValue(this.options);
                    this.propertiesForm.get('order').setValue(Number(maxOrder.reason)+1);

                    this.templatesService.addAttribute(this.propertiesForm.value).subscribe((add : {success: boolean, reason: string})=>{
                        // console.log('DUPA ADD', add);
                        if(add.success){
                            this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Proprietatea a fost adaugata!", "success");
                            this.listAttributes();
                            this.formInit();
                        }

                    },
                        (error)=>{
                            if(error.error.message==="notUnique"){
                                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), "Aceasta proprietate exista deja!", "error");
                            }else if(error.error.message === "notLoggedIn" || error.error.message === "tokenExpired"){
                                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), "Trebue sa fii logat pentru aceasta actiune!", "error");

                            } else {
                                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.SERVER-ERROR"), "error");
                            }
                        })

                })

            }

        }
    }

    onEditClick(id : string){
        window.scrollTo({top: 0, behavior: 'smooth'});
        this.templatesService.getAttributeById(id).subscribe((attribute:Attribute)=>{
            console.log('MERGE EDIT', attribute);
            this.attribute = attribute;
            this.propertiesForm.patchValue(attribute);
            this.propertiesForm.value.id = id;
            this.options = attribute.valueOptions;
            this.imgPath = attribute.icon.filePath ? attribute.icon.filePath : "./assets/images/others/icon.png";
        })

    }

    getResourceTypes(){
        this.templatesService.getResourceTypes().subscribe((res:Array<object>)=>{
            console.log(res);
            this.resourceTypes=res.sort((a, b) => a["nameRo"].localeCompare(b["nameRo"]));
            console.log('res types', this.resourceTypes)
        })
    }

    deleteAttribute(id: string){
        this.templatesService.deleteAttribute(id).subscribe((del: {success: boolean, reason: string})=>{
            console.log(del);
            if(del.success){
                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Proprietatea a fost stearsa!", "success");
                this.modalService.dismissAll();
                this.listAttributes();
            }
        },
            ()=>{
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.SERVER-ERROR"), "error");
            })
    }

    decrementOrder(order:number, id: string){
        console.log("order si id la decrement", order, id);
        if(order > 0){
            const newOrder = order -1;
            this.templatesService.changeAttributeOrder(id, newOrder).subscribe((dec : {success: boolean, reason: string})=>{
                console.log(dec);
                this.listAttributes();
            })
        }
    }

    incrementOrder(categoryId:string, order: number, attributeId:string){
        console.log('id categorie: '+categoryId + ' order: '+order +' attributeId '+attributeId )
        this.listAttributes();
        this.templatesService.getMaxOrderByCategory(categoryId).subscribe((maxOrder: {success: boolean, reason: string})=>{
            if(order < Number(maxOrder.reason)){
                const newOrder = order + 1;
                this.templatesService.changeAttributeOrder(attributeId, newOrder).subscribe((res : {success: boolean, reason: string})=>{
                    this.listAttributes();
                })
            }
        })
    }

    removeOption(option: string): void {
        const index = this.options.indexOf(option);

        if (index >= 0) {
            this.options.splice(index, 1);
        }
    }

    addOption(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our benefit
        if (value) {
            this.options.push(value);
        }

        // Clear the input value
        event.chipInput!.clear();

        this.optionCtrl.setValue(null);
    }

    editOption(option, event: MatChipEditedEvent) {
        const value = event.value.trim();

        // Remove fruit if it no longer has a name
        if (!value) {
            this.removeOption(option);
            return;
        }

        // Edit existing fruit
        const index = this.options.indexOf(option);
        if (index >= 0) {
            this.options[index] = value;
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allOptions.filter(benefit => benefit.toLowerCase().includes(filterValue));
    }


    // uploadAvatar(event){
    //     const reader = new FileReader();
    //     const file:File=event.target.files[0];
    //     //console.log('event',file);
    //     if(file){
    //         const formData = new FormData();
    //         formData.append("file", file);
    //         reader.readAsDataURL(file);
    //
    //         reader.onload = () => {
    //
    //             this.imgPath = reader.result as string;
    //         };
    //     }
    // }

    deleteIcon(){
        this.imgPath="./assets/images/others/icon.png";
        this.propertiesForm.get('icon').setValue({
            fileName: null,
            filePath: null
        })
    }

    openMedia(content: any) {
        this.modalMediaService.sendImagesToService([this.propertiesForm.value.icon]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }


}
