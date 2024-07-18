import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

  export class ProvidersService {



    constructor(private http: HttpClient) { }

    listProvidersFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
      return this.http.post('/bestinform/listUsersFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    changeActiveStatus(targetUserId:string, accept :boolean){
      return this.http.put("/bestinform/changeActiveStatus?targetUserId=" + targetUserId + "&accept=" + accept, {});
    }

    changeUserStatus(userId :string, approvedStatus:string){
      return this.http.put("/bestinform/changeUserStatus?userId="+userId+'&approvedStatus='+approvedStatus, {});
    }

    //list transaction
    listReservationFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
      return this.http.post('/bestinform/listReservationFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    //Payment request

    //get payment request by id
    getPaymentRequestById(paymentRequestId){
      return this.http.get('/bestinform/getPaymentRequestById?paymentRequestId='+ paymentRequestId);
    }

    //payment request
    createPaymentRequest(filters?: object) {
      return this.http.post('/bestinform/createPaymentRequest' , filters);
    }

    //list of payment request
    listPaymentRequestFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
      return this.http.post('/bestinform/listPaymentRequestFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    //change status
    changeStatusPaymentRequest(paymentRequestId:string, status :string){
      return this.http.put("/bestinform/changeStatusPaymentRequest?paymentRequestId="+ paymentRequestId + '&status=' + status, {});
    }

    //send email to announce the provider if accepted or not
      sendProviderApprovedEmail(userId:string, status:string){
        return this.http.get("/bestinform/sendProviderApprovedEmail?userId="+userId+ '&status='+status);
    }    

  }
