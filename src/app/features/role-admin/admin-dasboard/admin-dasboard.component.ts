import { Component } from '@angular/core';
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";

@Component({
  selector: 'app-admin-dasboard',
  templateUrl: './admin-dasboard.component.html',
  styleUrls: ['./admin-dasboard.component.scss']
})
export class AdminDasboardComponent {
  isAdmin=false;
  isStaff=false;
  constructor(private userService:UserDataService) { }

  ngOnInit(): void {
    this.currentUser();
  }

  currentUser(){
    this.userService.getCurrentUser().subscribe((user:User)=>{
      console.log(user);
      if(user.roles[0]==='ROLE_STAFF'){
        this.isStaff=true;
        this.isAdmin=false;
      }else if(user.roles[0]==='ROLE_SUPER_ADMIN'){
        this.isStaff=false;
        this.isAdmin=true;
      }else{
        this.isStaff=false;
        this.isAdmin=false;
      }

    })
  }
}
