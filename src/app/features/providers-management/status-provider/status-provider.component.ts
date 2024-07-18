import {Component, Input, OnInit} from '@angular/core';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import {BehaviorSubject, Subscription} from "rxjs";
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { StaffService } from 'src/app/shared/_services/staff.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-status-provider',
  templateUrl: './status-provider.component.html',
  styleUrls: ['./status-provider.component.scss'],
  providers: [NgbActiveModal]
})

export class StatusProviderComponent implements OnInit {

  providerId:string;
  providerName:string;
  providerEmail:string;
  providerAvatar:string;

  isProvider:boolean;
  isStaff:boolean;
  isAdmin:boolean;

  @Input() actionType:string;


  constructor(
    private providersService: ProvidersService,
    private userService: UserDataService,
    private activeModal: NgbActiveModal,
    private modalService: ModalService,
    private toastService: ToastService,
    private router:Router
  ){}

  ngOnInit(): void {
    this.providerId = this.modalService.getElementId();
    this.getUserById(this.providerId);
  }

  getCurrentUser(){
    this.userService.getCurrentUser().subscribe((response: any) => {
      if (response.roles.includes('ROLE_PROVIDER')) {
          this.isProvider = true;
      }

      if (response.roles.includes('ROLE_STAFF')) {
          this.isStaff = true;
      }

      if (response.roles.includes('ROLE_SUPER_ADMIN')) {
          this.isAdmin = true;
      }
  })
  }

  getUserById(providerId:any){
    this.userService.getUserById(providerId).subscribe((userData:any)=>{
      console.log(userData);
      this.providerId=userData.id;
      this.providerName=userData.companyName;
      this.providerEmail=userData.email;
      this.providerAvatar=userData.avatar !== null ? userData.avatar.filePath : '../../../../../assets/images/others/user.jpg';
    })
  }

  confirmAction(){
    // Store the selected element id
    this.providerId = this.modalService.getElementId();


    //block provider
    this.userService.changeUserStatus(this.providerId , this.actionType).subscribe((response:any)=>{
      console.log(response);
      // this.router.navigate(['/dashboard/providers/list']);

      this.modalService.triggerUserListChanges(true);

      // Set Message & Response
      this.toastService.showToast('Succes','Statusul providerului a fost schimbat cu success!','success');
      this.closeModal();

      if (this.isStaff) {
        this.router.navigate(['/private/staff/manage-providers/active']);
      }else if (this.isAdmin) {
        this.router.navigate(['/private/admin/manage-providers/active']);
      }else{
        return;
      }

      // Trigger Feedback Message
      //this.formMessageService.triggerFeedbackMessage(true);
      //this.isDeleteLoading$.next(false);

      // this.closeModal();
    }, error=>{
      console.log(error);
      this.toastService.showToast('Eroare','Statusul providerului NU a fost schimbat!','error');
    });

}

    // Close modal
    closeModal() {
      this.activeModal.dismiss();
    }
}


