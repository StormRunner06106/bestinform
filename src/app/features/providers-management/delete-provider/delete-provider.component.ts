import { Component, OnInit } from '@angular/core';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { StaffService } from 'src/app/shared/_services/staff.service';
import {Router} from "@angular/router";
import {User} from "../../../shared/_models/user.model";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-provider',
  templateUrl: './delete-provider.component.html',
  styleUrls: ['./delete-provider.component.scss']
})
export class DeleteProviderComponent implements OnInit {

  providerId:string;
  providerName:string;
  providerEmail:string;
  providerAvatar:string;

  isProvider:boolean;
  isAdmin:boolean;
  isStaff:boolean;

  constructor(
    private providersService: ProvidersService,
    private staffService:StaffService,
    private userService: UserDataService,
    private modalService: ModalService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<DeleteProviderComponent>,
    private router:Router) { }

  ngOnInit(): void {
    this.getCurrentUser();
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

  getUserById(providerId: string){
    this.userService.getUserById(providerId).subscribe((userData: User)=>{
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

    //delete editorial method
    this.staffService.deleteUser(this.providerId).subscribe(()=>{
      if(this.isStaff){
        this.router.navigate(['/private/staff/manage-providers/active']);
      }
      if(this.isAdmin){
        this.router.navigate(['/private/admin/manage-providers/active']);

      }


      this.modalService.triggerUserListChanges(true);


      // Set Message & Response
      this.toastService.showToast('Succes','Providerul a fost sters cu succes!','success');




      // Trigger Feedback Message
      //this.formMessageService.triggerFeedbackMessage(true);
      //this.isDeleteLoading$.next(false);

          this.dialogRef.close();
    }, error=>{
      console.log(error);
      this.toastService.showToast('Eroare','Providerul nu a fost sters!','error');
    }
    );
  }

}






