import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';

@Component({
  selector: 'app-provider-conversation-item-card',
  templateUrl: './provider-conversation-item-card.component.html',
  styleUrls: ['./provider-conversation-item-card.component.scss']
})
export class ProviderConversationItemCardComponent {

  @Input() category:string;
  @Input() currentUser:string;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  listConversation:Array<any>=[];
  listBestinformConversation:Array<any>=[];

  listParticipants:Array<any>=[];

  // Mat Table - pagination, sorting, filtering
  pageItems=[15,50,100];
  page = 0;
  sorting = "date";
  dir = 'desc';
  pageSize= 15;
  totalConversations:number
  totalBestinformConversations:number;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private conversationsService: MessagesConversationsService,
    private usersService: UserDataService
  ){
  }

  ngOnInit():void{
    this.getConversationList();
  }

  getConversationList(){

    this.conversationsService.listConversationFiltered(this.category, this.page, this.pageSize, this.sorting, this.dir)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (listConv:any) =>{
        if(this.category === 'reservation'){
          this.listConversation=listConv.content;
          this.totalConversations=listConv.totalElements;
        }else if(this.category === 'bestinformSupport'){
          this.listBestinformConversation=listConv.content;
          this.totalBestinformConversations=listConv.totalElements;
        }else{
          return;
        }
      }
    });
  }

    // Page Changer
    pageChanged(event: object) {
      this.page = event["pageIndex"];
      this.pageSize = event["pageSize"];
  
      // Get All Documents List
      this.getConversationList();
    }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
}
