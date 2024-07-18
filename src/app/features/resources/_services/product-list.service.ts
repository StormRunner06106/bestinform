import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class ProductListService {
    refreshProductList$ = new BehaviorSubject(false);
    productsList$ = new BehaviorSubject([]);

    deleteProdList$ = new BehaviorSubject([]);

    imagesArray$ = new BehaviorSubject([]);
    attachmentArray$ = new BehaviorSubject([]);

    constructor(private http: HttpClient) {
    }

    /** Listeners */



    refreshProductListData() {
        return this.refreshProductList$.asObservable();
    }

    productListData() {
        return this.productsList$.asObservable()
    }

    /** Custom Functions */
    addProductToList(product) {
        this.productsList$.next(this.productsList$.getValue().concat(product))
    }

    addProductToDeleteList(product) {
        this.deleteProdList$.next(this.deleteProdList$.getValue().concat(product))
    }

    addImgtoImgList(img) {
        this.imagesArray$.next(this.imagesArray$.getValue().concat(img))
    }

    addAttachmentToList(attach) {
        this.attachmentArray$.next(this.attachmentArray$.getValue().concat(attach))
    }


    //------------------REQUESTS------------------

    createProduct(resourceId: string, product) {
        return this.http.post('/bestinform/createProduct?resourceId=' + resourceId, product);
    }

    getProductsByResourceId(resourceId: string) {
        return this.http.get('/bestinform/getProductListByResourceId?resourceId=' + resourceId);
    }

    updateProduct(productId: string, product) {
        return this.http.put('/bestinform/updateProduct?productId=' + productId, product);
    }

    deleteProduct(productId: string) {
        return this.http.delete('/bestinform/deleteProduct?productId=' + productId);
    }

    uploadImageForProduct(productId: string, image) {
        return this.http.post('/bestinform/uploadProductImages?productId=' + productId, image);
    }

    uploadAttachmentForProduct(productId: string, file) {
        return this.http.post('/bestinform/uploadProductAttachment?productId=' + productId, file);
    }
}
