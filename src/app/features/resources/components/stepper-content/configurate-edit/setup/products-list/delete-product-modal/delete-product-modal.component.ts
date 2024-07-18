import {Component, Inject, OnInit} from '@angular/core';
import {ProductListService} from "../../../../../../_services/product-list.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ResourcesService} from "../../../../../../_services/resources.service";

@Component({
    selector: 'app-delete-product-modal',
    templateUrl: './delete-product-modal.component.html',
    styleUrls: ['./delete-product-modal.component.scss']
})
export class DeleteProductModalComponent implements OnInit {

    currentProd: any;

    constructor(private productService: ProductListService,
                private resourceService: ResourcesService,
                public dialogRef: MatDialogRef<DeleteProductModalComponent>,
                @Inject(MAT_DIALOG_DATA) public productData: { product: any, index: number }) {
    }

    ngOnInit() {
        this.currentProd = this.productData.product;
    }

    close(): void {
        this.dialogRef.close();
    }

    deleteProduct() {
        if (this.resourceService.resourceId$.getValue()) {
            console.log('sunt pe edit res si vreau sa sterg');
            //EDIT RESOURCE
            //delete a product just added
            if (this.productData.product.state === 'add') {
                const prodList = this.productService.productsList$.getValue()

                // Exclude the room by id
                const filteredProd = prodList.filter(prod => prod.id !== this.productData.product.id);

                // Check if a room was deleted and update the array
                if (filteredProd.length !== prodList.length) {
                    this.productService.productsList$.next(filteredProd);
                    this.productService.refreshProductList$.next(true);
                    this.close();
                } else {
                    console.log(`prod not found`);

                }
            }else{
                //move the prod to delete array

                const prodList = this.productService.productsList$.getValue()

                // Exclude the room by id
                const filteredProds = prodList.filter(prod => prod.id !== this.productData.product.id);

                // Check if a room was deleted and update the array
                if (filteredProds.length !== prodList.length) {
                    this.productService.productsList$.next(filteredProds);
                    this.productService.addProductToDeleteList(this.productData.product);
                    console.log('DELETE ARRAY', this.productService.deleteProdList$.getValue());
                    this.productService.refreshProductList$.next(true);
                    this.close();
                }
            }
        } else {
            console.log('sunt pe add res si vreau sa sterg');
            //ADD RESOURCE
            // Get products list
            const prodList = this.productService.productsList$.getValue()

            // Exclude the ticket by id
            const filteredProducts = prodList.filter(product => product.id !== this.productData.product.id);

            // Check if a room was deleted and update the array
            if (filteredProducts.length !== prodList.length) {
                this.productService.productsList$.next(filteredProducts);
            } else {
                console.log(`Prod not found`);
            }
        }
    }

}
