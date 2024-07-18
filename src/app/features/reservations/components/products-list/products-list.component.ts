import { Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { ProductsService } from 'src/app/shared/_services/products.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent {
  @Input() reservation: Reservation;

  productList:any;
  productData:any;
  products=[];

  private ngUnsubscribe = new Subject<void>();

  constructor(private productService: ProductsService){

  }

  ngOnInit(): void {
    this.getProductsData();
    console.log('id rezervare',this.reservation);
    // this.reservation?.productsList.products.forEach(idProduct => {
    //   console.log('hello',idProduct);
    // });
  }

  getProductsData(){
    this.productList=this.reservation?.productsList;
    console.log("produse", this.productList);

    this.reservation?.productsList.products.forEach(idProduct => {

      console.log('id produs', idProduct)

      this.productService.getProductById(idProduct)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res:any)=>{
          this.productData=res;
          this.productData.attachment = this.reservation?.productsList.attachment
          this.products.push(this.productData);
        }
      });
    });
  }

  getProductById(idProduct){
    this.productService.getProductById(idProduct)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.productData=res;


      }
    });
  }

  downloadProduct(product){
    const link = document.createElement('a');
    const attach = product.attachment;
    link.href = attach?.filePath;
    link.download = attach?.fileName;
    link.target = '_blank';
    link.click();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

}
