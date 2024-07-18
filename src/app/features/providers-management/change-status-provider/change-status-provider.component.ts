import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { ProvidersService } from 'src/app/shared/_services/providers.service';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-change-status-provider',
  templateUrl: './change-status-provider.component.html',
  styleUrls: ['./change-status-provider.component.scss']
})
export class ChangeStatusProviderComponent {

  providerId:string;

  constructor(
    private modalService: ModalService,
    private providersService: ProvidersService,
    private toastService: ToastService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ChangeStatusProviderComponent>
   ) { }

 // Change status form
 changeProviderStatusForm: FormGroup = new FormGroup({
   status : new FormControl (this.modalService.getElementInfo(), [Validators.required]),
});

changeProviderStatus(){
  //get editorial id
  this.providerId=this.modalService.getElementId();

  //change status
  this.providersService.changeUserStatus(this.providerId, this.changeProviderStatusForm.value.status).subscribe((data:any)=>{
    this.modalService.triggerUserListChanges(true);

    console.log(data);

    // Trigger List Data Changes
    this.modalService.triggerUserListChanges(true);

    // Set Message & Response

    this.toastService.showToast( "Succes", "Statusul a fost schimbat cu succes!", "success");

    console.log("status schimbat " + this.providerId);
    // Close Modal
    // this.closeModal();
    this.dialogRef.close();


  });
}

// // Close Modal
// closeModal() {
//   this.ngbModal.dismissAll();
// }

}
