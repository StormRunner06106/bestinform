import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoleCheckService } from 'src/app/shared/_services/role-check.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-recently-reservation-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './recently-reservation-card.component.html',
  styleUrls: ['./recently-reservation-card.component.scss'],
  providers: [DecimalPipe]
})
export class RecentlyReservationCardComponent {
  @Input() recentTransactionList: any;
  @Input() currency: string;

  private ngUnsubscribe = new Subject<void>();
  
   isAdmin:boolean;
   isStaff:boolean;
   isProvider:boolean;
   isClient:boolean;


  constructor(private route: ActivatedRoute,
    private userDataService:UserDataService
    ){}

    ngOnInit(){
    
      this.getUserRole();
      console.log('aici lista de tranzacrtii', this.recentTransactionList);

    }

    getUserRole(){
      this.userDataService.getCurrentUser()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe( res => {
          
          if(res.roles.includes('ROLE_SUPER_ADMIN')){
              this.isAdmin=true;
          }else if(res.roles.includes('ROLE_STAFF')){
              this.isStaff=true;
          }else if(res.roles.includes('ROLE_PROVIDER')){
              this.isProvider=true;
          }else if(res.roles.includes('ROLE_CLIENT')){
              this.isClient=true;
          }
  })
    }

    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  
  }