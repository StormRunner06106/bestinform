import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {Router} from "@angular/router";
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/shared/_models/user.model';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { ModalService } from 'src/app/shared/_services/modals.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { ToastComponent } from 'src/app/theme/components/toast/toast.component';

@Component({
  selector: 'app-admin-conversation-item-card',
  templateUrl: './admin-conversation-item-card.component.html',
  styleUrls: ['./admin-conversation-item-card.component.scss']
})
export class AdminConversationItemCardComponent {
   @Input() categoryConversation:string;
   @ViewChild(MatPaginator) paginator: MatPaginator;


  private ngUnsubscribe=new Subject<void>;
  currentUser:string;
  myActiveConversationsList:Array<any>=[];
  unassignedConversationsList:Array<any>=[];
  myClosedConversationsList:Array<any>=[];
  allConversationsList:Array<any>=[];
  testallConversationsList:Array<any>=[];


  joinedStaffUserName:string;
  arrayAllElements:Array<any>=[];

  isStaff:boolean;
  isAdmin:boolean;
  alreadyJoined:boolean;

   // Mat Table - pagination, sorting, filtering
   pageItems=[15,50,100];
   page = 0;
   sorting = "date";
   dir = 'desc';
   pageSize= 15;

  totalMyConversation: number;
  totalUnassignedConversation: number;
  totalMyClosedConversations: number;
  allConversations: number;


  constructor(
    private userServices:UserDataService,
    private conversationsServices:MessagesConversationsService,
    private toastService: ToastService,
    private modalService:ModalService,
    private cdr: ChangeDetectorRef,
    private router: Router
    ){}

  ngOnInit(){
    this.getCurrentUser();
    this.listChanges()
  }

  getCurrentUser(){
    this.userServices.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (currentUser:User)=>{
        this.currentUser=currentUser.id;

        this.isAdmin=currentUser.roles.includes('ROLE_SUPER_ADMIN') ? true : false;
        this.isStaff=currentUser.roles.includes('ROLE_STAFF') ? true : false;
        //LISTE
        this.getList();
     }
    });
  }

  getList(){
    if(this.categoryConversation === 'myConversations'){
      this.listMyConversation();
    }else if(this.categoryConversation === 'unassignedConversations'){
      this.listUnassignedConversation();
    }else if(this.categoryConversation === 'myClosedConversations'){
      this.listClosedConversation();
    }else if(this.categoryConversation === 'allConversations'){
      this.listAllConversation();
    }else{
      return;
    }
  }

  // Page Changer
  pageChanged(event: object) {
    this.page = event["pageIndex"];
    this.pageSize = event["pageSize"];

    // Get All Documents List
    this.getList();
  }

  // Listen to data changes and refresh the user list
  listChanges() {
    this.modalService.listChangedObs.subscribe((data: boolean) => {

        console.log('schimbaree');

        // If the response is true
        if (data) {
            // Get Documents List
            this.updatedList();

            // Reset Obs Trigger
            this.modalService.triggerUserListChanges(false);
        }
    })
}

  updatedList(){
      this.listMyConversation();
      this.listUnassignedConversation();
      this.listClosedConversation();
      this.listAllConversation();
  }

  joinConversation(idConversation, userId){
    this.conversationsServices.addUserToConversation(idConversation, userId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: res=>{
        console.log('join conv: ', userId, idConversation, res);
        //navigate to conversation
        this.router.navigate(['/private/admin/inbox/'+idConversation]);

        this.modalService.triggerUserListChanges(true);
        this.toastService.showToast( "Succes", "V-ati alaturat conversatiei cu succes!", "success");
        this.cdr.detectChanges();
        this.listChanges()
      }
    });
  }

  leaveConversation(idConversation){
    this.conversationsServices.leaveConversation(idConversation)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: res=>{
        this.modalService.triggerUserListChanges(true);
        this.toastService.showToast( "Succes", "Ati parasit conversatia!", "success");
        this.cdr.detectChanges();
        this.listChanges()
      }
    });
  }

  //get my conversation
  listMyConversation(){
    const filter={
      onlyMine: true,
      active: true
    }

    this.conversationsServices.listBestinformConversationFiltered(this.page, this.pageSize, this.sorting, this.dir,filter)
    // .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (convList:any) =>{
        this.myActiveConversationsList=convList.content;
        this.totalMyConversation=convList.totalElements;
        console.log('CONVERSATIILE MELE ACTIVE',convList);
      }
    });
  }

  //get unassigned conversation
  listUnassignedConversation(){
    const filter={
      onlyMine: false,
      active: true
    }

    this.conversationsServices.listBestinformConversationFiltered(this.page, this.pageSize, this.sorting, this.dir,filter)
    // .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (convList:any) =>{
        this.unassignedConversationsList=convList.content;
        this.totalUnassignedConversation=convList.totalElements;

        console.log('CONVERSATIILE NEATRIBUITE',this.unassignedConversationsList);
      }
    });
  }

   //get unassigned conversation
   listClosedConversation(){
    const filter={
      onlyMine: true,
      active: false
    }

    this.conversationsServices.listBestinformConversationFiltered(this.page, this.pageSize, this.sorting, this.dir,filter)
    // .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (convList:any) =>{
        this.myClosedConversationsList=convList.content;
        this.totalMyClosedConversations=convList.totalElements;

        console.log('CONVERSATIILE MELE INCHISE',this.myClosedConversationsList);
      }
    });
  }

   //get unassigned conversation
   listAllConversation(){
    const filter={
      onlyMine: null,
      active: null
    }

    this.conversationsServices.listBestinformConversationFiltered(this.page, this.pageSize, this.sorting, this.dir,filter)
    // .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (convList:any) =>{
        this.allConversationsList=convList.content;
        this.allConversations=convList.totalElements;

        console.log('TOATE CONVERSATIILE',this.allConversationsList);
        // this.allConversationsList.forEach(conversation => {
        //   const found= conversation.participants.find(({ userId }) => userId === this.currentUser);
        //   console.log('found',this.currentUser, found);      
        // });
      }
    });
  }

  alreadyJoiedCheck(conversation):boolean{
    const found= conversation.participants.find(({ userId }) => userId === this.currentUser);
    return (found === undefined? false :true);
  }


    ngOnDestroy():void{
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
}
