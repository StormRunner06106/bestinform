import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/shared/_models/user.model';
import { UserDataService } from 'src/app/shared/_services/userData.service';

@Component({
  selector: 'app-cancelled-reservation',
  templateUrl: './cancelled-reservation.component.html',
  styleUrls: ['./cancelled-reservation.component.scss']
})
export class CancelledReservationComponent {

  private ngUnsubscribe = new Subject<void>();
  userRole:string;
  userData:User;
  resourceId:string;

  constructor(private userService:UserDataService,
    private route:ActivatedRoute){
  }

  ngOnInit(): void {
    this.getResourceId();
    this.getCurrentUser();
  }
  
  //resourceId used for reservation list(queryParams), after cancel-reservation
  getResourceId(){
    this.route.params.subscribe(params => {
        this.resourceId = params['resourceId'];
        console.log('id-ul resursei pe care trebuie sa mergem',this.resourceId);
    });
  }

  getCurrentUser(){
    this.userService.getCurrentUser()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:User) => {
        this.userData=res;
        this.userData.roles.forEach(role => {
          this.userRole=role;
        });
        console.log('USER',this.userData);
        console.log('ROL',this.userRole);

      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
