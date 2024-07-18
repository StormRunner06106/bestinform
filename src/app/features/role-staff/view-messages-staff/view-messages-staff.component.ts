import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { User } from 'src/app/shared/_models/user.model';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { DatePipe } from '@angular/common';
import { ToastService } from 'src/app/shared/_services/toast.service';

@Component({
  selector: 'app-view-messages-staff',
  templateUrl: './view-messages-staff.component.html',
  styleUrls: ['./view-messages-staff.component.scss'],
  providers: [DatePipe]
})
export class ViewMessagesStaffComponent {

  private ngUnsubscribe= new Subject<void>();
  conversationId:string;
  currentConversation:any;
  
  //check if the staff has already joined conversation
  hideJoinButton:boolean;

  // user info: photo, name for header
  convParticipantID:string;
  convParticipantData:User;

  sharedExperienceData:any;

  //if user id !== current use, get info for header
  currentUserId:string;

  reservationData:Reservation;

  openedInfo=false;

  constructor(
    private conversationsService: MessagesConversationsService,
    private usersService: UserDataService,
    private activatedRoute:ActivatedRoute,
    private reservationService:ReservationsService,
    private toastService:ToastService
    ){}

    ngOnInit():void{
      //get current user
      this.getCurrentUser();
    }

    getCurrentUser(){
      // console.log('hello');
      this.usersService.getCurrentUser()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (user:User) =>{
          this.getConversationId();
          this.currentUserId=user.id;
        }
      });
    }


    getConversationId(){
      //get conversation id from route
      this.activatedRoute.params.subscribe(params => {
        this.conversationId = params['idConversation'];
        if(this.conversationId){
          console.log('din get conversation by id');
          this.getConversationById(this.conversationId);
        }        
      });
    }

    //get data for conv info from header
    getUserById(id){
      if(id!== this.currentUserId){
        this.usersService.getUserById(id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (user:User) =>{
            this.convParticipantData=user;

            console.log('Pariticipant: ', this.convParticipantData);
            // this.convParticipantID=user.id;
          }
        });
      }
    }

    getConversationById(id){
      this.conversationsService.getConversationById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res:any)=>{
          this.currentConversation=res;
          

          console.log("currentConversation",this.currentConversation);
          //reservation
          if(res.participants.length === 2){
            res.participants.forEach(idUserParticipant => {
              console.log('cati sunt in conversatie? ar trebui 2', idUserParticipant);
              if(idUserParticipant.userId === this.currentUserId){
                this.hideJoinButton=true;
                return;
              }
              // this.convParticipantID=(idUserParticipant === this.currentUserId ? 'nimic' : idUserParticipant);
              if (idUserParticipant.userId !== this.currentUserId) {
                this.convParticipantID = idUserParticipant.userId;
                return;
              }
          });
          
          this.getUserById(this.convParticipantID);
          // this.getReservationById(res.id);
          }else{
            res.participants.forEach(idUserParticipant => {
              console.log('cati sunt in conversatie?', idUserParticipant);
              // this.convParticipantID=(idUserParticipant === this.currentUserId ? 'nimic' : idUserParticipant);
              if (idUserParticipant.userId !== this.currentUserId) {
                this.convParticipantID = idUserParticipant.userId;
                this.hideJoinButton=true;
                return;
              }
          });
          this.getUserById(this.convParticipantID);
          }
          
        }
      });
    }

    joinConversation(idConversation, userId){
      this.conversationsService.addUserToConversation(idConversation, userId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: res=>{
          console.log('join conv: ', userId, idConversation, res);
          
          // this.modalService.triggerUserListChanges(true);
          this.toastService.showToast( "Succes", "V-ati alaturat conversatiei cu succes!", "success");
          // this.cdr.detectChanges();
          // this.listChanges()
        },
        error: err=>{
          if(err.reason === 'notAllowed'){
            this.toastService.showToast( "Eroare", "Pentru a trimite mesaj, alaturati-va conversatiei!", "error");
          }else if(err.reason === 'invalidId'){
            this.toastService.showToast( "Eroare", "A aparul o problema!", "error");
            console.log(err);
          }else {
            console.log(err);
          }
        }
      });
    }
  
    leaveConversation(idConversation){
      this.conversationsService.leaveConversation(idConversation)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: res=>{
          // this.modalService.triggerUserListChanges(true);
          this.toastService.showToast( "Succes", "Ati parasit conversatia!", "success");
          // this.cdr.detectChanges();
          // this.listChanges()
        },
        error: err=>{
          if(err.reason === 'notInConversation'){
            this.toastService.showToast( "Eroare", "Nu v-ati alaturat conversatiei!", "error");
          }else{
            this.toastService.showToast( "Eroare", "Ups! A aparut o eroare!", "error");

          }
          console.log(err);
        }
      });
    }

     //show reservation info button
     displayInfo(){
      this.openedInfo = !this.openedInfo;
      console.log("openedInfo a fost accesat", this.openedInfo );
    }


    ngOnDestroy():void{
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
}
