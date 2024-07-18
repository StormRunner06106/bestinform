import { Component } from '@angular/core';
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.scss']
})
export class StaffDashboardComponent {
  isAdmin=false;
  isStaff=false;
  user: User;
  constructor(private userService:UserDataService) { }

  ngOnInit(): void {
    this.currentUser();
  }

  currentUser(){
    this.userService.getCurrentUser().subscribe((user:User)=>{
      console.log(user);
      this.user=user;
      if(user.roles.includes('ROLE_STAFF')){
        this.isStaff=true;
        this.isAdmin=false;
      }else if(user.roles.includes('ROLE_SUPER_ADMIN')){
        this.isStaff=false;
        this.isAdmin=true;
      }else{
        this.isStaff=false;
        this.isAdmin=false;
      }

    })
  }
}
