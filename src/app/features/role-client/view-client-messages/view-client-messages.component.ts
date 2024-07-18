import { Component } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {ActivatedRoute, Router} from "@angular/router";
import { DatePipe } from '@angular/common';
import { User } from 'src/app/shared/_models/user.model';
import { SharedExperiencesService } from 'src/app/shared/_services/shared-experiences.service';
import { Reservation } from 'src/app/shared/_models/reservation.model';
import { ReservationsService } from 'src/app/shared/_services/reservations.service';
import { CancelReservationModalComponent } from '../../reservations/cancel-reservation-modal/cancel-reservation-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from 'src/app/shared/_services/modals.service';

@Component({
  selector: 'app-view-client-messages',
  templateUrl: './view-client-messages.component.html',
  styleUrls: ['./view-client-messages.component.scss'],
  providers: [DatePipe]
})
export class ViewClientMessagesComponent {

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
      private reservationService:ReservationsService,
      private ngbModalService: NgbModal,
        private modalService: ModalService,
        private router:Router,

      ){}

      ngOnInit():void{
        //get current user
        this.getCurrentUser();
        this.getConversationId();

        //  this.getConversationId();
      }

      getConversationId(){
        //get conversation id from route
        this.activatedRoute.params.subscribe(params => {
          this.conversationId = params['idConversation'];
          if(this.conversationId){
            this.getConversationById(this.conversationId);
          }
          console.log('id-ul conversatiei', this.conversationId);
        });
      }

      //get id to compare the others chat participants 
      getCurrentUser(){
        this.usersService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (user:User) =>{
            this.currentUserId=user.id;
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
              if(user !== null){
                this.convParticipantData=user;
              
              }
              
              // this.convParticipantID=user.id;
              console.log('USERUL LUAT PENTRU DETALIILE DIN HEADER', this.convParticipantData);
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

            //reservation
            if(res.participants.length === 2){
              res.participants.forEach(idUserParticipant => {
                // this.convParticipantID=(idUserParticipant === this.currentUserId ? 'nimic' : idUserParticipant);
                if (idUserParticipant.userId !== this.currentUserId) {
                  this.convParticipantID = idUserParticipant.userId;
                  console.log('id-ul din conversatie lalala', this.convParticipantID);
                }
            });
            this.getUserById(this.convParticipantID);
            this.getReservationById(res.reservationId);
            console.log('id rezervare: ', res);
            }

            //if conversation is shared experience
            if(this.currentConversation.sharedExperienceId !== null){
              this.getSharedExperienceById(this.currentConversation.sharedExperienceId);
            }

            // console.log('conv participant id',this.convParticipantID);
            // console.log('current user id',this.currentUserId);

          }
        });
      }

      getSharedExperienceById(idExp){
        this.sharedExperiencesService.getSharedExperienceById(idExp)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: exp=>{
            this.sharedExperienceData=exp;
            // console.log('exp luata dupa id',this.sharedExperienceData);
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
              console.log('REZERVARE',this.reservationData);
              // this.getUserById(res.userId);
            }
          });
      }

      cancelReservationModal(elementId: string) {
        console.log("Modal apelat:", elementId);

        this.ngbModalService.open(CancelReservationModalComponent, {centered: true});
        this.modalService.setElementId(elementId);
        // this.router.navigate(['/client/dashboard/my-bookings'])

          // this.modalService.triggerUserListChanges(true);
      
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
