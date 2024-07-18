import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {JwtTokenService} from "./jwtToken.service";

@Injectable({
  providedIn: 'root'
})
export class UserRolesGuard implements CanActivate {

  constructor(private tokenService: JwtTokenService,
              private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const allowedRoles = route.data.allowedRoles;

    const decodedToken: object = this.tokenService.getDecodedToken();

    if (decodedToken) {
      if (!this.tokenService.isTokenExpired()) {
        if (decodedToken["roles"].some(role => allowedRoles.includes(role.authority))) {
          return true;
        } else {
          if(decodedToken["roles"].some(role => role.authority==='ROLE_STAFF')){
            return this.router.navigate(['/private/staff']);
          }else{
            return this.router.navigate(['/']);
          }

        }
      } else {
        return this.router.navigate(['/']);
      }
    } else {
      return this.router.navigate(['/']);
    }

  }

}
