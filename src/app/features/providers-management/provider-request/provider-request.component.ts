import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {MatDialogRef} from "@angular/material/dialog";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-provider-request',
  templateUrl: './provider-request.component.html',
  styleUrls: ['./provider-request.component.scss']})
export class ProviderRequestComponent implements OnInit {

  constructor(
    private userService:UserDataService,
    private providersService:ProvidersService,
    private toastService:ToastService,
    private modalService:ModalService,
    private translate:TranslateService,
    public dialogRef: MatDialogRef<ProviderRequestComponent>,
    private cdr: ChangeDetectorRef
     ) { }

     providerId: string;
     name:string;
     cui:string;
     email:string;
     telephone:string;
     dateRequest:string;

     private ngUnsubscribe = new Subject<void>();

    
  ngOnInit(): void {
    //get editorial id
    this.providerId=this.modalService.getElementId();
    this.getProviderData(this.providerId);
  }

  formReason: FormGroup = new FormGroup({
    reason: new FormControl(''),
  });

  getProviderData(providerId: string){
    this.userService.getUserById(providerId).subscribe((providerData: object)=>{
      console.log(providerData);
      console.log(this.providerId);
      this.name=providerData["companyName"];
       this.cui=providerData["cui"];
      this.email=providerData["email"];
      this.telephone=providerData["telephone"];
      this.dateRequest=providerData["registrationDate"];
    });
  }

  sendProviderApprovedEmail(userId, status){
    this.providersService.sendProviderApprovedEmail(userId,status)
        .subscribe((res:any)=>{  
          console.log("de la mail",res);
          if(status==='active'){
            this.toastService.showToast( "Info", "Providerul va primi un email pentru a fi anunțat in legatură cu activarea contului!", "info");

          }else if(status==='refused'){
            this.toastService.showToast( "Info", "Providerul va primi un email pentru a fi anunțat in legatură cu neaprobarea contului!", "info");

          }else{
            return;
          }
        }, (error)=>{
          console.log(error);
          this.toastService.showToast( "Eroare", "A apărut o problemă!", "error");

        })
  }

  approveRequest(){
    this.providerId=this.modalService.getElementId();

    this.providersService.changeUserStatus(this.providerId,'active').subscribe(()=>{
      // Trigger List Data Changes
      this.modalService.triggerUserListChanges(true);
      this.sendProviderApprovedEmail(this.providerId, 'active');
      this.toastService.showToast( "Succes", "Ați activat providerul!", "success");

      this.cdr.detectChanges();
      this.dialogRef.close();
    }, error=>{
      if (error.error.reason === 'notAllowed') {
        this.toastService.showToast( "Eroare", "Aveasta operațiune nu vă este permisă!", "error");
      } else if (error.error.reason === 'invalidCurrentUserOrTargetId ') {
        this.toastService.showToast( "Eroare", "Nu sunteți logat!", "error");
      } else {
        this.toastService.showToast( "Eroare", "A apărut o problemă!", "error");
        console.log(error);
      }
    });

  }

  declineRequest(){
    //get editorial id
    this.providerId=this.modalService.getElementId();

    this.providersService.changeUserStatus(this.providerId,'refused').subscribe(()=>{
      this.modalService.triggerUserListChanges(true);
      this.sendProviderApprovedEmail(this.providerId, 'refused');

      this.toastService.showToast( "Succes", "Providerul a fost respins!", "success");

      this.cdr.detectChanges();
      this.dialogRef.close();
    }, error => {
      if (error.error.reason === 'notAllowed') {
        this.toastService.showToast( "Eroare", "Aveasta operațiune nu vă este permisă!", "error");
      } else if (error.error.reason === 'invalidCurrentUserOrTargetId ') {
        this.toastService.showToast( "Eroare", "Nu sunteți logat!", "error");
      } else {
        this.toastService.showToast( "Eroare", "A apărut o problemă!", "error");
        console.log(error);
      }

    });
  }

  closeModal(){
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

}
