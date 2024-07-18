import {Component, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { EditorialsService } from '../_services/editorials.service';
import {MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-change-editorial-status',
  templateUrl: './change-editorial-status.component.html',
  styleUrls: ['./change-editorial-status.component.scss'],
  providers:[NgbActiveModal]
})
export class ChangeEditorialStatusComponent implements OnInit{

  constructor(private modalService: ModalService,
              private editorialsService: EditorialsService,
              private toastService: ToastService,
              public dialogRef: MatDialogRef<ChangeEditorialStatusComponent>,
              private translate: TranslateService) { }

  editorialId:string;
  status: string;

  // Change status form
  // changeEditorialStatusForm: FormGroup = new FormGroup({
  //   status: new FormControl('', [Validators.required])
  // });
  changeEditorialStatusForm: FormGroup;

  ngOnInit() {
    console.log(this.modalService.getElementInfo());
    this.changeEditorialStatusForm = new FormGroup({
      status : new FormControl (this.modalService.getElementInfo(), [Validators.required]),
    });
  }


  changeEditorialStatus(){
    //get editorial id
    this.editorialId=this.modalService.getElementId();

    //change status
    this.editorialsService.changeEditorialStatus(this.editorialId, this.changeEditorialStatusForm.value.status).subscribe(()=>{
      this.modalService.triggerUserListChanges(true);

      // Set Message & Response

      this.toastService.showToast( "Succes", "Statusul a fost schimbat cu succes!", "success");

      // Close Modal
      this.dialogRef.close();

    }, () =>{
      this.toastService.showToast( "Eroare", "Statusul nu a fost schimbat!", "error");

    });

  }

  closeModal(){
    this.dialogRef.close();
  }

}
