import {Component, OnDestroy, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router }  from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { User } from 'src/app/shared/_models/user.model';
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-cancel-reservation-modal',
  templateUrl: './cancel-reservation-modal.component.html',
  styleUrls: ['./cancel-reservation-modal.component.scss']
})
export class CancelReservationModalComponent implements OnInit, OnDestroy{

  reservationId:string;
  private ngUnsubscribe = new Subject<void>();
  userData:User;
  userRole:string;

  reason = new FormControl('', [Validators.required, Validators.minLength(20), this.noWhitespaceValidator]);

  constructor(
    private userService: UserDataService,
    private reservationService: ReservationsService,
    private activeModal: NgbActiveModal,
    private modalService: ModalService,
    private toastService: ToastService,
    private router:Router,
    private route:ActivatedRoute) { }

ngOnInit(): void {
  this.reservationId = this.modalService.getElementId();
  this.getCurrentUser();
}
//no white space validator
noWhitespaceValidator(control) {
  const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'whitespace': true };
}

//get current user role, for redirect after close modal"
getCurrentUser(){
  this.userService.getCurrentUser()
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe({
    next: (res:User) => {
      this.userData=res;
      this.userData.roles.forEach(role => {
        this.userRole=role;
      });
    }
  });
}

 getReservationById(id){
    //resourceId used for reservation list(queryParams), after cancel-reservation
  this.reservationService.getReservationById(id)
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe({
    next: (res:any)=>{
      //go to confirmation page after cancel the reservation
      if(this.userRole ==='ROLE_STAFF'){
        this.router.navigate(['/private/staff/reservations/cancelled-reservation/'+res.resourceId]);
      }else if(this.userRole ==='ROLE_SUPER_ADMIN'){
        this.router.navigate(['/private/admin/reservations/cancelled-reservation/'+res.resourceId])
      }else if(this.userRole ==='ROLE_PROVIDER'){
        this.router.navigate(['/private/provider/reservations/cancelled-reservation/'+res.resourceId])
      }else{
        this.router.navigate(['/client/dashboard/my-bookings'])
      }
    }}
  );
  }

   cancelReservation(reservationId){
  // this.reservationId = this.modalService.getElementId();

  const reasonVal=this.reason.value;

  this.reservationService.changeReservationStatus('canceled', reservationId, reasonVal)
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe({
    next: res =>{
      console.log('asta dupa ce am cancelat rezervarea',res);
      this.modalService.triggerUserListChanges(true);
      this.toastService.showToast('Succes','Rezervare anulata cu succes!','success');
      
       this.closeModal();
    },
    error:(err)=>{
      console.log('eroarea dupa ce am cancelat rezervarea',err);

      this.toastService.showToast('Eroare','A aparut o problema!','error');

    }
  });
}

confirmCancellation(){
    this.reason.markAsTouched();
    if (this.reason.invalid) return;

    //  this.cancelReservation(this.reservationId);
    //  this.getReservationById(this.reservationId);

    this.reservationService.changeReservationStatus('canceled', this.reservationId, this.reason.value).pipe(
      switchMap(() => this.reservationService.getReservationById(this.reservationId))
    ).subscribe((res:any) => {
      console.log(res);
      this.toastService.showToast('Succes','Rezervare anulata cu succes!','success');

      // Code to execute after both cancelReservation and getReservationById are done
      if(this.userRole ==='ROLE_STAFF'){
        this.router.navigate(['/private/staff/reservations/cancelled-reservation/'+res.resourceId]);
      }else if(this.userRole ==='ROLE_SUPER_ADMIN'){
        this.router.navigate(['/private/admin/reservations/cancelled-reservation/'+res.resourceId])
      }else if(this.userRole ==='ROLE_PROVIDER'){
        this.router.navigate(['/private/provider/reservations/cancelled-reservation/'+res.resourceId])
      }else{
        this.router.navigate(['/client/dashboard/my-bookings'])
      }
      // this.closeModal();
    });
    
  
  
  this.closeModal();

  // //resourceId used for reservation list(queryParams), after cancel-reservation
  // this.reservationService.getReservationById(this.reservationId)
  // .pipe(takeUntil(this.ngUnsubscribe))
  // .subscribe({
  //   next: (res:any)=>{
  //     //go to confirmation page after cancel the reservation
  //     if(this.userRole ==='ROLE_STAFF'){
  //       this.router.navigate(['/private/staff/reservations/cancelled-reservation/'+res.resourceId]);
  //     }else if(this.userRole ==='ROLE_SUPER_ADMIN'){
  //       this.router.navigate(['/private/admin/reservations/cancelled-reservation/'+res.resourceId])
  //     }else if(this.userRole ==='ROLE_PROVIDER'){
  //       this.router.navigate(['/private/provider/reservations/cancelled-reservation/'+res.resourceId])
  //     }else{
  //       this.router.navigate(['/client/dashboard/my-bookings'])
  //       return; 
  //     }
  //   }}
  // );
  
  console.log("confirmed cancellation");

}


// Close modal
closeModal() {
this.activeModal.close();
}

ngOnDestroy(): void {
  this.ngUnsubscribe.next();
  this.ngUnsubscribe.complete();
}

}
