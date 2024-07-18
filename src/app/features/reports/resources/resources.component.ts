import {Component, OnInit} from '@angular/core';
import {DatePipe} from "@angular/common";
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  providers: [DatePipe]
})
export class ResourcesComponent implements OnInit{

  constructor(private userService: UserDataService,
              private route: ActivatedRoute) {
  }



  providerId: string;
  providerName: string;
  userRole: string;

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      console.log('params', params);
      if (params?.providerId) {
        console.log('avem provider');
        this.providerId = params?.providerId;
        this.userRole = 'staff';
      } else {
        this.userService.getCurrentUser().subscribe((resp: User) => {
          if (resp.roles.includes('ROLE_PROVIDER')) {
            this.userRole = 'provider';
          } else if (resp.roles.includes('ROLE_SUPER_ADMIN') || resp.roles.includes('ROLE_STAFF')) {
            this.userRole = 'staff';
          }
        })
        console.log('nu avem provider', this.providerId, this.userRole);
      }
    })

  }

  }
