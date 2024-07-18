import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { User } from '../_models/user.model';
import { Subject, takeUntil } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class RoleCheckService {

    private isAdmin:boolean;
    private isStaff:boolean;
    private isProvider:boolean;
    private isClient:boolean;
    
    private ngUnsubscribe = new Subject<void>();


    constructor(private http: HttpClient) { }
  
    getCurrentUser(){
        return this.http.get<User>("/bestinform/getCurrentUser");
    }

    setRole(){
        this.getCurrentUser()
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