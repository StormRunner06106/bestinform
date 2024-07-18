import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { ModalService } from 'src/app/shared/_services/modals.service';
import {User} from "../../../../shared/_models/user.model";
import {StaffService} from "../../../../shared/_services/staff.service";
import {ToastService} from "../../../../shared/_services/toast.service";

@Component({
  selector: 'app-staff-card',
  templateUrl: './staff-card.component.html',
  styleUrls: ['./staff-card.component.scss']
})
export class StaffCardComponent implements OnInit {

  @Input() user: User;
  @Input() index: number;

  @Output() accountDeleted = new EventEmitter();
  @Output() accountDeactivated= new EventEmitter();
  @Output() accountActivated= new EventEmitter();

  name: string;
  email: string;
  imgUrl: string;

  constructor(
    private modalService: NgbModal,
    private staffService: StaffService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private modalCustomService:ModalService,

    ) { }

  ngOnInit(): void {
    console.log(this.user);
    if (!this.name && !this.email && !this.imgUrl) {
      this.name = 'Jonah West';
      this.email = 'johnwest@gmail.com';
      this.imgUrl = 'assets/images/avatars/avatar-3.png';
    }
  }

  openModal(templateRef) {
    this.modalService.open(templateRef, {centered: true});
  }

  deleteStaffAccount() {
    this.staffService.deleteUser(this.user.id.toString()).subscribe( (res: { reason: string, success: boolean }) => {
      console.log(res);

      if (res.success) {
        this.modalCustomService.triggerUserListChanges(true);
        this.toastService.showToast('Succes', 'Utilizatorul a fost sters', 'success');

        this.cdr.detectChanges();

        this.modalService.dismissAll();
        this.accountDeleted.emit();
      }
    });
  }

  deactivateStaffAccount(){
    this.staffService.changeActiveStatus(this.user.id.toString(), false).subscribe( (res: {reason: string, success: boolean})=>{
      console.log(res);
      if (res.success) {
        // this.toastService.showToast('Succes', 'Utilizatorul a fost dezactivat', 'success');
        this.modalCustomService.triggerUserListChanges(true);
         this.toastService.showToast( "Succes", "Providerul a fost dezactivat!", "success");

         this.cdr.detectChanges();
         this.modalService.dismissAll();
        this.accountDeactivated.emit();
      }
    }

    );
  }

  activateStaffAccount(){
    this.staffService.changeActiveStatus(this.user.id.toString(), true).subscribe( (res: {reason: string, success: boolean})=>{
          console.log(res);
          if (res.success) {
            // this.toastService.showToast('Succes', 'Utilizatorul a fost dezactivat', 'success');
            this.modalCustomService.triggerUserListChanges(true);
            this.toastService.showToast( "Succes", "Providerul a fost activat!", "success");

            this.cdr.detectChanges();
            this.modalService.dismissAll();
            this.accountActivated.emit();
          }
        }

    );
  }

}
