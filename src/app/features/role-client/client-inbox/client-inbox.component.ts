import { Component } from '@angular/core';
import { pipe, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/shared/_models/user.model';
import { MessagesConversationsService } from 'src/app/shared/_services/messages-conversations.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-client-inbox',
  templateUrl: './client-inbox.component.html',
  styleUrls: ['./client-inbox.component.scss']
})
export class ClientInboxComponent {

  private ngUnsubscribe = new Subject<void>();

  clientId:string;
  category:string;
  roleUser:string;
  loading = false;

  constructor(
    private usersService:UserDataService,
    private conversationsService: MessagesConversationsService,
    private messagesService: MessagesConversationsService,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit():void {
    this.getCurrentUser();
  }

  getCurrentUser(){
    this.usersService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:User)=>{
        this.clientId=res.id;
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initSupport() {
    this.loading = true;
    this.messagesService.createConversation('bestinformSupport', 'Bestinform Support - Client - ' + new Date().toLocaleDateString('ro')).subscribe((resp: any) => {
          console.log('resp conv', resp);
          this.loading = false;
          this.router.navigate([resp.reason], { relativeTo: this.route }); // Replace with your redirect route
        },
        (error) => {
          // Handle error if needed
          this.loading = false;
        }
    )
  }

}
