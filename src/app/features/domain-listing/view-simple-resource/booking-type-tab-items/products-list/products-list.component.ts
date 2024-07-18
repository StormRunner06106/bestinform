import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {BookingTypeItemsService} from "../booking-type-items.service";
import {takeUntil} from "rxjs/operators";
import {Product} from "../../../../../shared/_models/product.model";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-products-list',
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit, OnDestroy {

    products: Product[] = null;

    private ngUnsubscribe = new Subject<void>();

    constructor(private bookingItemsService: BookingTypeItemsService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.getProductList();
    }

    getProductList() {
        this.bookingItemsService.getProductListByResourceId()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.products = [...res];
                }
            });
    }

    selectProduct(product: Product) {
        this.bookingItemsService.setProductState(product);
        void this.router.navigate(['checkout'], {relativeTo: this.route});
    }



    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
