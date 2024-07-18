import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { DatePipe } from '@angular/common';
import {User} from "../../../shared/_models/user.model";
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from 'src/app/shared/_services/settings.service';



@Component({
  selector: 'app-payment-request',
  templateUrl: './payment-request.component.html',
  styleUrls: ['./payment-request.component.scss'],
  providers:[NgbActiveModal, DatePipe, NgbModal]
})
export class PaymentRequestComponent {

  providerId:string;
  providerName:string;
  providerAvatar:string;
  providerIBAN:string;
  dateRequest:Date;
  providerMoneyToRecive:number;
  currency:string;

  isAdmin:boolean;
  isStaff:boolean;
  isProvider:boolean;

  private ngUnsubscribe = new Subject<void>();


  constructor(
    private providersService: ProvidersService,
    private userService: UserDataService,
    private cdr: ChangeDetectorRef,
    private ngbModal:NgbModal,
    private modalService: ModalService,
    private toastService: ToastService,
    private settingsService:SettingsService
   ) { }

    ngOnInit(): void {
      //this.providerId = this.modalService.getElementId();
      this.getSettings();
      this.getCurrentUser();
      console.log("ID PROVIDER CURENT",this.providerId);
  }

  getCurrentUser(){
    this.userService.getCurrentUser().subscribe((userData: User)=>{
      this.isAdmin=userData.roles.includes('ROLE_SUPER_ADMIN') ? true : false;
      this.isStaff=userData.roles.includes('ROLE_STAFF') ? true : false;
      this.isProvider=userData.roles.includes('ROLE_STAFF') ? true : false;


      this.providerId=userData.id;
      this.providerName=userData.companyName;
      this.providerIBAN=userData.billingAddress.iban;
      this.providerMoneyToRecive=(userData.earnedMoney == null || userData.earnedMoney?.moneyToReceive == 0) ? 0 : userData.earnedMoney?.moneyToReceive;
      this.dateRequest=new Date();
     })
  }

  getSettings(){
    this.settingsService.getCurrentSettings()
    .subscribe((data:any)=>{
      this.currency=data.currency;
    });
  }

  confirmAction(){
    const obj={
      name: this.providerName,
      amount: this.providerMoneyToRecive,
      iban:  this.providerIBAN,
      status: 'new'
    }

    //create new payment request
    this.providersService.createPaymentRequest(obj)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: ()=>{
              // Set Message & Response
      this.toastService.showToast('Succes','Cerere de plata creata cu succes!','success');
      this.cdr.detectChanges();
      this.modalService.triggerUserListChanges(true);

      this.closeModal();
      },
      error: ()=>{
        this.toastService.showToast('Eroare','Cererea de plata a esuat!','error');
      }
    });
      
      // Trigger Feedback Message
      //this.formMessageService.triggerFeedbackMessage(true);
      //this.isDeleteLoading$.next(false);
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
