import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  //get payment request by id
  getProductById(productId){
    return this.http.get('/bestinform/getProductById?productId='+ productId);
  }
}
