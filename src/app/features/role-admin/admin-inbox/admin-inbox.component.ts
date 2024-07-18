import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/shared/_models/user.model';
import { UserDataService } from 'src/app/shared/_services/userData.service';

@Component({
  selector: 'app-admin-inbox',
  templateUrl: './admin-inbox.component.html',
  styleUrls: ['./admin-inbox.component.scss']
})
export class AdminInboxComponent {

  private ngUnsubscribe= new Subject<void>();
  currentUserId: string;
  currentUser:User;
  currentUserRole:string;
  isAdmin:boolean;
  isStaff:boolean;

   constructor(
    private userService: UserDataService
  ){}

  ngOnInit(): void{
    this.getCurrentUser();
  }

  getCurrentUser(){
    this.userService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: res=>{
        this.isAdmin=res.roles.includes('ROLE_SUPER_ADMIN') ? true : false;
        this.isStaff=res.roles.includes('ROLE_STAFF') ? true : false;
      }
    });
  }

  ngOnDestroy():void{
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
