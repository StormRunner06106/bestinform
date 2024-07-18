import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {ProductListService} from "../../../../../../_services/product-list.service";

@Component({
    selector: 'app-add-edit-product',
    templateUrl: './add-edit-product.component.html',
    styleUrls: ['./add-edit-product.component.scss']
})
export class AddEditProductComponent implements OnInit {

    thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    thumbnailFile: Blob;

    attachmentUrl = {
        fileName: undefined,
        filePath: undefined
    }

    attachmentFile: Blob;

    productForm: FormGroup;
    isEditMode = false;

    constructor(public dialogRef: MatDialogRef<AddEditProductComponent>,
                private fb: FormBuilder,
                private resourceService: ResourcesService,
                private productService: ProductListService,
                @Inject(MAT_DIALOG_DATA) public productData: { product }) {
    }

    ngOnInit() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };

        this.thumbnailFile = undefined;

        this.attachmentUrl = {
            fileName: undefined,
            filePath: undefined
        };

        this.attachmentFile = undefined;
        this.formInit();
        this.checkIfEdit();
    }

    formInit() {
        this.productForm = this.fb.group({
            id: [this.productData ? undefined : Math.random().toString(36).substring(2, 17)],
            name: [null, Validators.required],
            description: [null],
            price: [null, Validators.min(0)],
            images: [],
            attachment: []
        })
    }

    checkIfEdit() {
        if (this.productData) {
            this.isEditMode = true;
            console.log('PRODUCT',this.productData.product)
            this.productForm.patchValue(this.productData.product);
            this.thumbnailUrl = this.productData.product?.images[0];
            this.attachmentUrl = this.productData.product?.attachment;
            if (this.productData.product.state === 'add' || this.productData.product.state === 'update') {
                console.log(this.productData.product);
                const imagesArray = this.productService.imagesArray$.getValue();
                const element = imagesArray.find(element => element.id === this.productData.product.id);
                console.log('am gasit camera in array', element);
                this.thumbnailFile = element?.featuredImage;
                this.thumbnailUrl = element?.featuredImageUrl;

                const attachArray = this.productService.attachmentArray$.getValue();
                console.log('ARRAY CU ATTACHMENTS', attachArray)
                const attach = attachArray.find(elem => elem.id === this.productData.product.id);
                console.log('am gasit attach in in array', attach);
                this.attachmentFile = attach?.attachment;
                this.attachmentUrl = attach?.attachmentUrl;
            }
        }
    }

    confirm() {
        this.productForm.markAllAsTouched();
        if (this.productForm.valid) {
            const product = {
                ...this.productForm.value,
                images: [
                    this.thumbnailUrl
                ]
            }
            if (this.isEditMode) {
                this.updateProduct(product);
                this.close();
            } else {
                this.addProduct(product);
                this.close();
            }
        }
    }

    updateProduct(product) {
        if (this.resourceService.resourceId$.getValue()) {
            console.log('editez un prod pe edit res');
            //EDIT RESOURCE
            //update a product that was added now
            if (this.productData.product.state === 'add') {
                // Get prod List
                const prodList = this.productService.productsList$.getValue();

                // Find selected room by index
                const selectedProdIndex = prodList.findIndex(prod => prod.id === product.id);

                //the state will be 'add' because this room is going to be added in the end
                product = {
                    ...product,
                    state: 'add'
                }

                if (selectedProdIndex !== -1) {
                    prodList[selectedProdIndex] = product;
                    this.productService.productsList$.next(prodList);
                    const image = {
                        id: this.productForm.value.id,
                        imageFile: this.thumbnailFile,
                        imageUrl: this.thumbnailUrl
                    }
                    this.productService.addImgtoImgList(image);

                    const attachment = {
                        id: this.productForm.value.id,
                        attachmentFile: this.attachmentFile,
                        attachmentUrl: this.attachmentUrl
                    }
                    this.productService.addAttachmentToList(attachment);

                    this.productService.refreshProductList$.next(true);
                } else {
                    console.log('prod not found');
                }
            } else {
                //the prod exists on the resource
                // Get prod List
                const prodList = this.productService.productsList$.getValue();

                // Find selected room by index
                const selectedProdIndex = prodList.findIndex(prod => prod.id === product.id);
                product = {
                    ...product,
                    state: 'update'
                }
                if (selectedProdIndex !== -1) {
                    prodList[selectedProdIndex] = product;
                    this.productService.productsList$.next(prodList);
                    const image = {
                        id: this.productForm.value.id,
                        imageFile: this.thumbnailFile,
                        imageUrl: this.thumbnailUrl
                    }
                    this.productService.addImgtoImgList(image);

                    const attachment = {
                        id: this.productForm.value.id,
                        attachmentFile: this.attachmentFile,
                        attachmentUrl: this.attachmentUrl
                    }
                    this.productService.addAttachmentToList(attachment);

                    this.productService.refreshProductList$.next(true);
                } else {
                    console.log('prod not found');
                }

            }
        } else {
            console.log('editez un prod pe add res');
            //CREATE RESOURCE
            // Get prod List
            const prodList = this.productService.productsList$.getValue();
            // find this ticket in the current create list
            const indexInList = prodList.findIndex(product => product.id === this.productForm.value.id);

            // Check if the room was found and update
            if (indexInList !== -1) {
                prodList[indexInList] = this.productForm.value;
                this.productService.productsList$.next(prodList);
                const image = {
                    id: this.productForm.value.id,
                    imageFile: this.thumbnailFile,
                    imageUrl: this.thumbnailUrl
                }
                this.productService.addImgtoImgList(image);

                const attachment = {
                    id: this.productForm.value.id,
                    attachmentFile: this.attachmentFile,
                    attachmentUrl: this.attachmentUrl
                }
                this.productService.addAttachmentToList(attachment);
            } else {
                console.log('prod not found');
            }
        }
    }

    addProduct(product) {
        if (this.resourceService.resourceId$.getValue()) {
            console.log('adaugare prod pe editare res')
            //EDIT RESOURCE
            product = {
                ...product,
                state: 'add'
            }
            this.productService.addProductToList(product);
            const image = {
                id: this.productForm.value.id,
                imageFile: this.thumbnailFile,
                imageUrl: this.thumbnailUrl
            }
            this.productService.addImgtoImgList(image);

            if (this.attachmentFile) {
                const attachment = {
                    id: this.productForm.value.id,
                    attachmentFile: this.attachmentFile,
                    attachmentUrl: this.attachmentUrl
                }
                this.productService.addAttachmentToList(attachment);
            }
            this.productService.refreshProductList$.next(true);
        } else {
            //CREATE RESOURCE
            console.log('adaugare prod pe adaugare res')
            this.productService.addProductToList({...product,
            state: 'add'});
            if (this.thumbnailFile) {
                const image = {
                    id: this.productForm.value.id,
                    imageFile: this.thumbnailFile,
                    imageUrl: this.thumbnailUrl
                }
                this.productService.addImgtoImgList(image);
            }

            if (this.attachmentFile) {
                const attachment = {
                    id: this.productForm.value.id,
                    attachmentFile: this.attachmentFile,
                    attachmentUrl: this.attachmentUrl
                }
                this.productService.addAttachmentToList(attachment);
            }

            console.log('list attach', this.productService.attachmentArray$.getValue());
            console.log('lista cu prod', this.productService.productsList$.getValue())
        }
    }

    //----------------------------- IMAGES---------------------------
    onThumbnailChange(event) {
        if (event.target.files && event.target.files[0]) {
            this.thumbnailUrl.fileName = event.target.files[0].name;
            this.thumbnailFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.thumbnailUrl.filePath = reader.result;
            reader.readAsDataURL(this.thumbnailFile);
        }
        console.log('thumbNail', this.thumbnailUrl);
        console.log('thumbNail', this.thumbnailFile);
    }

    removeThumbnail() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };
        this.thumbnailFile = undefined;
    }

    //attachments
    deleteAttachment() {
        this.attachmentFile = undefined;
        this.attachmentUrl = {
            fileName: undefined,
            filePath: undefined
        }
    }

    uploadAttachmentFile(event) {
        if (event.target.files && event.target.files[0]) {
            this.attachmentUrl.fileName = event.target.files[0].name;
            this.attachmentFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.attachmentUrl.filePath = reader.result;
            reader.readAsDataURL(this.attachmentFile);

            console.log('thumbNail', this.attachmentUrl);
            console.log('thumbNail', this.attachmentFile);
        }

    }

    close(): void {
        this.dialogRef.close();
    }
}
