import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {Router} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import {User} from "../../../shared/_models/user.model";
import { Subject, takeUntil } from 'rxjs';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import { SettingsService } from 'src/app/shared/_services/settings.service';

@Component({
  selector: 'app-view-payment-request',
  templateUrl: './view-payment-request.component.html',
  styleUrls: ['./view-payment-request.component.scss'],
  providers:[NgbActiveModal,DatePipe]

})
export class ViewPaymentRequestComponent {


  providerId:string;
  providerName:string;
  providerAvatar:string;
  providerIBAN:string;

  isStaff:boolean;
  isProvider:boolean;
  isAdmin:boolean;

  currency:string;

  //payment
  paymentRequestId:string
  requestDate:string;
  paymentDate:string;
  paymentBill:{
    fileName: string,
    filePath: string
  };
  paymentReport:{
    fileName: string,
    filePath: string
  };
  amount:number;
  userId:string;
  status:string;

  private ngUnsubscribe = new Subject<void>();


  constructor(
    private userService:UserDataService,
    private providersService:ProvidersService,
    private toastService:ToastService,
    private modalService:ModalService,
    private ngbModal:NgbModal,
    private cdr: ChangeDetectorRef,
    private settingsService:SettingsService
     ) { }

    ngOnInit(): void {
      this.getSettings();
      //this.getCurrentUser();
      this.paymentRequestId = this.modalService.getElementId();

      this.getPaymentData();
      // this.getCurrentUser();


    }

    getUserById(userId){
      this.userService.getUserById(userId).subscribe((userData: User)=>{
        this.providerId=userData.id;
        this.providerName=userData.companyName;
        this.providerIBAN=userData.billingAddress?.iban;
      })
    }

    getSettings(){
      this.settingsService.getCurrentSettings()
      .subscribe((data:any)=>{
        this.currency=data.currency;
      });
    }

    getPaymentData(){
      this.providersService.getPaymentRequestById(this.paymentRequestId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (paymentData:any)=>{
          // this.router.navigate(['/dashboard/providers/balance']);
          console.log("id-ul",this.paymentRequestId);
          this.paymentDate=paymentData.paymentDate;
          this.requestDate=paymentData.requestDate;
          this.paymentBill=paymentData.bill;
          this.paymentReport=paymentData.report;
          this.amount=paymentData.amount;
          this.status=paymentData.status;
          this.userId=paymentData.userId;
  
          this.getUserById(this.userId);
        }
      });
  }

    confirmAction(changeStatus:string){
        this.providersService.changeStatusPaymentRequest(this.paymentRequestId,changeStatus)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next:(data:any)=>{
            // Trigger List Data Changes
            this.modalService.triggerUserListChanges(true);
  
            this.toastService.showToast('Succes','Cerere de plata creata cu succes!','success');
            this.cdr.detectChanges();
            this.closeModal();
          },
          error:()=>{
            this.toastService.showToast('Eroare','Vizualizarea cererii nu poate fi efectuata!','error');

          }
        });
    }

    download(filepath: any, filename: any) {
      FileSaver.saveAs(filepath, filename );
    }


    // Close modal
    closeModal() {
    this.ngbModal.dismissAll();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}
