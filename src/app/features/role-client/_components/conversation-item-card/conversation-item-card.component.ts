import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, take, takeUntil } from 'rxjs';
import { SharedExperience } from 'src/app/shared/_models/shared-experience.model';
import { User } from 'src/app/shared/_models/user.model';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { SharedExperiencesService } from 'src/app/shared/_services/shared-experiences.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-conversation-item-card',
  templateUrl: './conversation-item-card.component.html',
  styleUrls: ['./conversation-item-card.component.scss']
})
export class ConversationItemCardComponent {
  @Input() category:string;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  conversationArray: Array<any>=[];
  // conversationBestinformArray: Array<any>=[];

  //current User
  userId:string

  //the user in conversation you are with
  conversationUserId:string
  conversationUser: User;
  conversationUserArray: Array<any>=[];

  //shared exp id for featured img
  sharedExperienceId:string;
  sharedExperienceImgPath:string;

  private ngUnsubscribe = new Subject<void>();

  // Mat Table - pagination, sorting, filtering
  pageItems=[15,50,100];
  page = 0;
  sorting = "date";
  dir = 'desc';
  pageSize= 15;
  totalReservationConversations: number;
  totalSharedExperiencesConversations: number;
  totalBestinformConversations: number;
  totalPrivateConversations: number;

  constructor(
    private conversationsService: MessagesConversationsService,
    private usersService:UserDataService,
    private sharedExperiencesService: SharedExperiencesService,

  ){}

  ngOnInit():void {
    this.getCurrentUser();
  }


  getCurrentUser(){
    this.usersService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:User)=>{
        this.userId=res.id;
        if(this.category === 'reservation'){
          this.getReservationListConversation();
        }else if(this.category === 'sharedExperience'){
          this.getSharedExperiencesListConversation();
        }else if(this.category === 'bestinformSupport'){

          this.getListBestinformConversations();
        }else{
          this.getListPrivateConversation();
        }
      }
    });
  }

  //get the data of the other conversation participant to display in conversations list
  getUserById(idUser){
    this.usersService.getUserById(idUser)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:User)=>{
        this.conversationUser=res;
      }
    })
  }

  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Documents List
    if(this.category === 'reservation'){
      this.getReservationListConversation();
    }else if(this.category === 'sharedExperience'){
      this.getSharedExperiencesListConversation();
    }else if(this.category === 'bestinformSupport'){
      this.getListBestinformConversations();
    }else{
      this.getListPrivateConversation();
    }
  }

  //get the data of shared experience
  getSharedExperienceById(id){
    this.sharedExperiencesService.getSharedExperienceById(id)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{

        this.sharedExperienceImgPath=res?.featuredImage?.filePath;
      }
    })
  }


  //list conversation reservation category
  getReservationListConversation(){
    this.conversationsService.listConversationFiltered(this.category, this.page, this.pageSize, this.sorting, this.dir)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.conversationArray=res.content;
        this.totalReservationConversations=res.totalElements;
      }
    })
  }

  //shared experiences
  getSharedExperiencesListConversation(){
    this.conversationsService.listConversationFiltered(this.category, this.page, this.pageSize, this.sorting, this.dir)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.conversationArray=res.content;
        this.totalSharedExperiencesConversations=res.totalElements;

        //get shared exp id, for featured img
        this.conversationArray.forEach(element => {
          this.sharedExperienceId=element.sharedExperienceId;
          this.getSharedExperienceById(this.sharedExperienceId);
        });

      }
    })
  }

  //listBestinformConversationFilteres
  getListBestinformConversations(){
    this.conversationsService.listConversationFiltered(this.category, this.page, this.pageSize, this.sorting, this.dir)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.conversationArray=res.content;
        this.totalBestinformConversations=res.totalElements;
      }
    })
  }

  //listBestinformConversationFilteres
  getListPrivateConversation(){
    this.conversationsService.listConversationFiltered(this.category, 0, -1, 'date', 'desc')
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.conversationArray=res.content;
        this.totalPrivateConversations=res.totalElements;
      }
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }



}
