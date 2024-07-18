import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {ToastService} from "../../../shared/_services/toast.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatLegacyPaginator} from "@angular/material/legacy-paginator";
import {MatSort} from "@angular/material/sort";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";

@Component({
    selector: 'app-prop-categories',
    templateUrl: './prop-categories.component.html',
    styleUrls: ['./prop-categories.component.scss'],
    providers: [ModalMediaService]
})
export class PropCategoriesComponent implements OnInit {

    @ViewChild('matPaginator') matPaginator: MatLegacyPaginator;
    @ViewChild(MatSort) sort: MatSort;

    categoryForm: FormGroup;

    // iconFile: Blob;

    categories: [object];

    // Mat Table - Filter Forms
    searchFilter: FormControl = new FormControl('');

    displayedColumns: string[] = ['icon', 'name', 'actions'];
    dataSource = [];
    myDataSource = [];
    paginationInfo: any;

    // initial filter numbers
    pageNumber: number;
    pageSize: number;
    pageSizeArray = [10, 25, 100];
    sorting = 'name';
    dir = 'desc';

    constructor(private modalService: NgbModal,
                private fb: FormBuilder,
                private templateService: TemplatesService,
                private toastService: ToastService,
                private translate: TranslateService,
                private modalMediaService: ModalMediaService,
                private cdr: ChangeDetectorRef) {
    }


    ngOnInit(): void {
        this.pageNumber = 1;
        this.pageSize = 10;

        this.formInit();
        this.listAttributeCategories();
        this.getImage();
    }

    formInit() {
        this.categoryForm = this.fb.group({
            id: [null],
            name: [null, Validators.required],
            zone: [null],
            description: [null],
            icon: this.fb.group({
                fileName: [null],
                filePath: [null]
            })
        })
    }

    onSaveClick() {
        this.categoryForm.markAllAsTouched();

        if (this.categoryForm.valid) {

            const formToSend = {
                name: this.categoryForm.value.name,
                description: this.categoryForm.value.description,
                zone: this.categoryForm.value.zone,
                // icon: {
                //     fileName: this.icon.fileName,
                //     filePath: ''
                // }
            }

            if (this.categoryForm.value.id !== null) {
                console.log('EDIT');
                console.log(this.categoryForm.value);
                this.templateService.updateAttributeCategory(this.categoryForm.value.id, this.categoryForm.value).subscribe((update: { success: boolean, reason: string }) => {
                    console.log('UPDATE', update);
                    if (update.success) {
                        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Categoria a fost modificată!", "success");
                        this.listAttributeCategories();
                        this.formInit();
                    }

                })
            } else {
                console.log('ADD');
                this.templateService.addAttributeCategory(this.categoryForm.value).subscribe((add: { success: boolean, reason: string }) => {
                    if (add.success) {
                        this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Categoria a fost adăugată!", "success");
                        this.listAttributeCategories();
                        this.formInit();


                    }
                })

            }


        }
    }

    removeIcon() {
        this.categoryForm.get('icon').setValue({
            filePath: null,
            fileName: null
        });
    }

    listAttributeCategories() {
        this.templateService.getCategoryList(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, {}).subscribe((res: object) => {
            this.paginationInfo = res;

            this.dataSource = res["content"];
            console.log('CONTENT', this.dataSource);
        })
    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;

        this.templateService.getCategoryList(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, {}).subscribe((res: object) => {
            console.log('ATTRIBUTES', res);
            this.paginationInfo = res;

            this.dataSource = res["content"];
        })
    }

    searchCategory() {
        this.pageNumber = 1;
        const filters = {
            name: this.searchFilter.value !== '' ? this.searchFilter.value : null
        };
        this.templateService.getCategoryList(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, filters).subscribe((res: object) => {
            this.paginationInfo = res;

            this.dataSource = res["content"];
            this.matPaginator.firstPage();
            console.log('CONTENT', this.dataSource);
        })
    }

    onEditClick(id: string) {
        window.scrollTo({top: 0, behavior: 'smooth'});
        this.templateService.getAttributeCategoryById(id).subscribe((category: object) => {
            console.log('MERGE EDIT', category);
            this.categoryForm.patchValue(category);
            this.categoryForm.value.id = id;
        })

    }

    getImage() {
        this.modalMediaService.currentImagesArray
            .subscribe(async (array: any) => {
                if (array.length > 0) {
                    if (array[0].for === 'attr-categ-icon') {
                        this.categoryForm.get('icon').patchValue(array[0].selectedMedia);
                        console.log('am adus img');
                    }
                }
            });
    }

    deleteAttributeCategory(id: string) {
        console.log(id);
        this.templateService.deleteAttributeCategory(id).subscribe((res: { success: boolean, reason: string }) => {
            if (res.success) {
                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), "Categoria a fost ștearsă!", "success");
                this.listAttributeCategories();
                this.formInit();
                this.modalService.dismissAll();
            }

        })
    }


    openModal(templateRef) {
        this.modalService.open(templateRef, {centered: true});
    }

    clearFormControl(formControl) {
        this.categoryForm.get(formControl).patchValue(null);
    }

    // uploadAvatar(event){
    //   this.imgName= null;
    //   const reader = new FileReader();
    //   const file:File=event.target.files[0];
    //   console.log('event',file);
    //   if(file){
    //     const formData = new FormData();
    //     formData.append("file", file);
    //     reader.readAsDataURL(file);
    //
    //     reader.onload = () => {
    //
    //       this.imgPath = reader.result as string;
    //       this.imgName = file.name;
    //     };
    //
    //
    //     // console.log(formData);
    //   //   this.userData.uploadAvatar(formData).subscribe((res: {reason: string, success: true})=>{
    //   //         if(res.success===true){
    //   //           this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.UPLOAD-AVATAR.SUCCESS"),"success");
    //   //         }else{
    //   //           this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.UPLOAD-AVATAR.ERROR"),"error")
    //   //         }
    //   //       },
    //   //       () => {this.imgPath=this.oldImage;})
    //   } else if(file=== undefined){
    //     this.imgName = '';
    //   }
    //
    // }

    // uploadAvatar(event) {
    //     if (event.target.files && event.target.files[0]) {
    //         this.icon.fileName = event.target.files[0].name;
    //         this.iconFile = event.target.files[0];
    //
    //         const reader = new FileReader();
    //         reader.onload = () => this.icon.filePath = reader.result;
    //         reader.readAsDataURL(this.iconFile);
    //     }
    //
    //     console.log('POZICA', this.icon);
    // }

    openMedia(content) {
        this.modalMediaService.sendImagesToService([this.categoryForm.value.image]);
        this.modalService.open(content, {centered: true, size: 'xl'});
    }

}
