import {Component, OnInit} from '@angular/core';
import {UserDataService} from "../../shared/_services/userData.service";

@Component({
  selector: 'app-public-old-homepage',
  templateUrl: './public-homepage.component.html',
  styleUrls: ['./public-homepage.component.scss']
})
export class PublicHomepageComponent implements OnInit{

  userConnected: boolean;
  redirectUrl: string;

  constructor(private usersService: UserDataService) {
  }

  ngOnInit() {
    this.getCurrentUser();

  }

  getCurrentUser() {
    this.usersService.getCurrentUser().subscribe((resp: any) => {
      console.log('user ph:', resp)
      this.userConnected = true;
      if (resp.roles.includes('ROLE_CLIENT')) {
        this.redirectUrl = '/client/domain'
      } else if (resp.roles.includes('ROLE_PROVIDER')) {
        this.redirectUrl = '/private/provider/dashboard'
      } else if (resp.roles.includes('ROLE_STAFF')) {
        this.redirectUrl = '/private/staff/dashboard'
      } else if (resp.roles.includes('ROLE_SUPER_ADMIN')){
        this.redirectUrl = '/private/admin/dashboard'
      }
    }, error => {
      this.userConnected = false;
    })
  }

}
