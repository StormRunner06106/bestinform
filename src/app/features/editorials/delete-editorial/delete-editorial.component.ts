import { Component, OnInit } from '@angular/core';
import { EditorialsService } from '../_services/editorials.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import {Resource} from "../../../shared/_models/resource.model";
import {Editorial} from "../../../shared/_models/editorial.model";
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-delete-editorial',
  templateUrl: './delete-editorial.component.html',
  styleUrls: ['./delete-editorial.component.scss'],
  providers: [NgbActiveModal]
})
export class DeleteEditorialComponent implements OnInit {

  editorialId:string;
  editorialTitle: string;
  editorialAuthors=[];
  user: string;
  number: string;

  constructor(private editorialsService: EditorialsService,
              private activeModal: NgbActiveModal,
              private modalService: ModalService,
              private toastService: ToastService,
              public dialogRef: MatDialogRef<DeleteEditorialComponent>,
              ) { }

  ngOnInit(): void {

    this.editorialId = this.modalService.getElementId();
    this.getEditorial(this.editorialId);
    this.number=this.modalService.getElementInfo();
  }

  getEditorial(editorialId: string){
    this.editorialsService.getEditorialById(editorialId).subscribe((editorialData: Editorial)=>{
      this.editorialTitle=editorialData.title;
      this.editorialAuthors=editorialData.authors;
      this.user=editorialData.username;
    })
  }

  confirmAction(){
        // Store the selected element id
    this.editorialId = this.modalService.getElementId();
    //delete editorial method
    this.editorialsService.deleteEditorialById(this.editorialId).subscribe(()=>{
      this.modalService.triggerUserListChanges(true);
       this.closeModal();

      // Set Message & Response
      this.toastService.showToast('Succes','Editorialul a fost sters cu succes!','success');

      // Trigger Feedback Message
      //this.formMessageService.triggerFeedbackMessage(true);
      //this.isDeleteLoading$.next(false);

    }, ()=>{
      this.toastService.showToast('Eroare','Editorialul nu a fost sters!','error');

    }
    );
  }


  // Close modal
  closeModal() {
  // this.activeModal.close();
  this.dialogRef.close();

}
}


