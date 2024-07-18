import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MenuService} from "../../../../../../_services/menu.service";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {ToastService} from "../../../../../../../../shared/_services/toast.service";

@Component({
    selector: 'app-add-edit-category',
    templateUrl: './add-edit-category.component.html',
    styleUrls: ['./add-edit-category.component.scss']
})
export class AddEditCategoryComponent implements OnInit {

    menu: FormGroup;
    isEditMode = false;
    thumbnailPreviews: any[] = [];

    constructor(private fb: FormBuilder,
                private menuService: MenuService,
                private resourceService: ResourcesService,
                public dialogRef: MatDialogRef<AddEditCategoryComponent>,
                private toastService: ToastService,
                @Inject(MAT_DIALOG_DATA) public categoryData: { category }) {
    }

    ngOnInit() {
        this.formInit();
        this.checkIfEdit();
    }

    formInit() {
        this.menu = this.fb.group({
            id: [this.categoryData ? undefined : Math.random().toString(36).substring(2, 17)],
            categoryName: ['', Validators.required],
            subCategories: this.fb.array([])
        })
    }

    subCategories(): FormArray {
        return this.menu.get('subCategories') as FormArray;
    }

    newSubcategory(): FormGroup {
        return this.fb.group({
            subCategoryName: [null, Validators.required],
            subCategoryItems: this.fb.array([])
        })
    }

    addSubcategory() {
        this.subCategories().push(this.newSubcategory());
    }

    removeSubcategory(index: number) {
        this.subCategories().removeAt(index);
    }


    //menu categ items
    subCategoryItems(index): FormArray {
        return this.subCategories().at(index)?.get('subCategoryItems') as FormArray;
    }


    newItem(): FormGroup {
        return this.fb.group({
            name: [null, Validators.required],
            price: [0, Validators.pattern("^[1-9]\\d*$")],
            weight: [0, Validators.pattern("^[1-9]\\d*$")],
            ingredients: '',
            allergens: '',
            nutritionalFacts: '',
            imageUrl: ''
        })
    }

    onThumbnailChange(event, subcategoryIndex, formItemIndex) {
        if (event.target.files && event.target.files[0]) {
            if(event.target.files[0].size < 2 * 1024 * 1024){

                this.resourceService.createImagesOnServer([event.target.files[0]]).subscribe((data) :void => {
                    this.subCategoryItems(subcategoryIndex).controls[formItemIndex].patchValue({
                        imageUrl: data
                    });
                });

                // Ensure thumbnailPreviews array is initialized with null values for all items
                if (!this.thumbnailPreviews[formItemIndex]) {
                    this.thumbnailPreviews[formItemIndex] = null;
                }

                // Generate preview URL
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.thumbnailPreviews[formItemIndex] = e.target.result;
                };
                reader.readAsDataURL(event.target.files[0]);
            } else {
                this.toastService.showToast('Error', 'File size is bigger than 2MB!', 'error');
                this.subCategoryItems(subcategoryIndex).controls[formItemIndex].patchValue({
                    imageUrl: null
                });

                // Clear preview URL
                this.thumbnailPreviews[formItemIndex] = null;
            }
        }
    }

    getThumbnailPreview(formItemIndex) {
        if (formItemIndex || formItemIndex === 0) { // Check if formItemIndex is truthy or zero
            return this.thumbnailPreviews[formItemIndex];
        }
    }

    addItem(index) {
        this.subCategoryItems(index).push(this.newItem());
    }

    removeItem(index: number, childIndex: number) {
        this.subCategoryItems(index).removeAt(childIndex);
    }

    onKeyDown(event: KeyboardEvent) {
        console.log(event)
        // Prevent the default behavior of enter and space keys
        if (event.key === 'Enter' || event.code === 'Space') {
            event.preventDefault();
        }
    }


    close(): void {
        this.dialogRef.close();
    }

    checkIfEdit() {
        if (this.categoryData) {
            this.isEditMode = true;
            this.menu.patchValue(this.categoryData.category);
            if (this.categoryData.category.subCategories.length > 0) {
                this.categoryData.category.subCategories.forEach((subcategory, subcategoryIndex) => {

                    this.subCategories().push(
                        this.fb.group({
                            subCategoryName: subcategory.subCategoryName,
                            subCategoryItems: this.fb.array([])
                        }) )

                    subcategory.subCategoryItems.forEach(item => {
                        this.addItem(subcategoryIndex);
                    })
                    this.subCategoryItems(subcategoryIndex).patchValue(subcategory.subCategoryItems);
                })

            }
        }
    }

    confirm() {
        this.menu.markAllAsTouched();
        if (this.menu.valid) {
            const menu = this.menu.value;
            if (this.isEditMode) {
                this.updateCategory(menu);
                this.dialogRef.close();
            } else {
                this.createCategory(menu);
                this.dialogRef.close();
            }
        } else {
            console.log('formular invalid', this.menu.value);
        }
        console.log(this.menu.value)
    }

    updateCategory(menu) {
        console.log('vr sa editez o categ');
        if (this.resourceService.resourceId$.getValue()) {
            console.log('EDIT pe EDIT resource');
            //update a categ that was added now
            if (this.categoryData.category.state === 'add') {
                // Get prod List
                const menuList = this.menuService.menuList$.getValue();

                // Find selected room by index
                const selectedIndex = menuList.findIndex(category => category.id === menu.id);

                //the state will be 'add' because this room is going to be added in the end
                menu = {
                    ...menu,
                    state: 'add'
                }

                if (selectedIndex !== -1) {
                    menuList[selectedIndex] = menu;
                    this.menuService.menuList$.next(menuList);
                    this.menuService.refreshMenuList$.next(true);
                } else {
                    console.log('menu not found');
                }
            } else {
                //the prod exists on the resource
                // Get prod List
                const menuList = this.menuService.menuList$.getValue();

                // Find selected room by index
                const selectedIndex = menuList.findIndex(category => category.id === menu.id);
                menu = {
                    ...menu,
                    state: 'update'
                }
                if (selectedIndex !== -1) {
                    menuList[selectedIndex] = menu;
                    this.menuService.menuList$.next(menuList);
                    this.menuService.refreshMenuList$.next(true);
                } else {
                    console.log('prod not found');
                }

            }
        } else {
            console.log('EDIT pe ADD resource');
            const categList = this.menuService.menuList$.getValue()

            // Find selected room by index
            const selectedCategIndex = categList.findIndex(category => category.id === menu.id);

            // Check if the room was found and update
            if (selectedCategIndex !== -1) {
                categList[selectedCategIndex] = menu;
                this.menuService.menuList$.next(categList);
            } else {
                console.log('Room not found');
            }
        }
    }

    createCategory(menu) {
        console.log('vr sa ADAUG o categ');
        if (this.resourceService.resourceId$.getValue()) {
            console.log('ADD pe EDIT resource');
            menu = {
                ...menu,
                state: 'add'
            }
            this.menuService.addCategoryToList(menu);
            this.menuService.refreshMenuList$.next(true);
            console.log('list', this.menuService.menuList$.getValue());
        } else {
            this.menuService.addCategoryToList(menu);
            console.log('list', this.menuService.menuList$.getValue());
        }

    }

}
