import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {JwtTokenService} from "./jwtToken.service";

@Injectable({
    providedIn: 'root'
})
export class UserStatusGuard implements CanActivate {

    constructor(private tokenService: JwtTokenService,
                private router: Router) {
    }

    canActivate(
        route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const allowedStatuses = route.data.allowedStatuses;

        const decodedToken: object = this.tokenService.getDecodedToken();

        if (decodedToken) {
            // console.log('decoded token 2', decodedToken);
            if (!this.tokenService.isTokenExpired()) {
                if (allowedStatuses.includes(decodedToken["approvedStatus"])) {
                    return true;
                } else {
                    return this.router.navigate(['/']);
                }
            } else {
                return this.router.navigate(['/']);
            }
        } else {
            return this.router.navigate(['/']);
        }

    }

}
