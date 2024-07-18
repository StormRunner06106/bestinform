import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { User } from 'src/app/shared/_models/user.model';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { SharedExperiencesService } from 'src/app/shared/_services/shared-experiences.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
@Component({
  selector: 'app-view-provider-messages',
  templateUrl: './view-provider-messages.component.html',
  styleUrls: ['./view-provider-messages.component.scss'],
  providers:[DatePipe]
})
export class ViewProviderMessagesComponent {
  private ngUnsubscribe= new Subject<void>();
  conversationId:string;
  currentConversation:any;

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
    private sharedExperiencesService: SharedExperiencesService,
    private reservationService:ReservationsService
    ){}

    ngOnInit():void{
      //get current user
      this.getCurrentUser();
    }

    //get id to compare the others chat participants 
    getCurrentUser(){
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
          console.log(this.currentConversation);
          //reservation
          if(res.participants.length === 2){
            res.participants.forEach(idUserParticipant => {
              // this.convParticipantID=(idUserParticipant === this.currentUserId ? 'nimic' : idUserParticipant);
              if (idUserParticipant.userId !== this.currentUserId) {
                this.convParticipantID = idUserParticipant.userId;
                return;
              }
          });
          this.getUserById(this.convParticipantID);
          this.getReservationById(res.id);
          }

        }
      });
    }

    //get reservation for info
    getReservationById(idReservation){
      this.reservationService.getReservationById(idReservation)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res:Reservation)=>{
          this.reservationData=res;
          // this.getUserById(res.userId);
        }
      });
  }

    //show reservation info button
    displayInfo(){
      this.openedInfo = !this.openedInfo;
    }


    ngOnDestroy():void{
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
}
