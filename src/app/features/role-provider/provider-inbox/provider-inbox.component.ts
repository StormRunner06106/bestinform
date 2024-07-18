import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/shared/_models/user.model';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import {MessagesConversationsService} from "../../../shared/_services/messages-conversations.service";
import {ActivatedRoute, Router} from "@angular/router";
import {relative} from "@angular/compiler-cli";

@Component({
  selector: 'app-provider-inbox',
  templateUrl: './provider-inbox.component.html',
  styleUrls: ['./provider-inbox.component.scss']
})
export class ProviderInboxComponent {

  private ngUnsubscribe = new Subject<void>();
  currentUserId:string;
  loading = false;

  constructor(
    private userService:UserDataService,
    private messagesService: MessagesConversationsService,
    private router: Router,
    private route: ActivatedRoute
  ){
  }

  ngOnInit():void{
    this.getCurrentUser();
  }


  initSupport() {
    this.loading = true;
    this.messagesService.createConversation('bestinformSupport', 'Bestinform Support - Provider - ' + new Date().toLocaleDateString('ro')).subscribe((resp: any) => {
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

  getCurrentUser(){
    this.userService.getCurrentUser()
    // .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (user:User)=>{
        this.currentUserId=user.id;
        console.log(user);
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
