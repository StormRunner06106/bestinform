import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { AuthService } from "./auth.service";
import { BehaviorSubject, catchError, finalize, throwError } from "rxjs";
import { ToastService } from "./toast.service";
import { Route, Router } from "@angular/router";
import { filter, switchMap, take } from "rxjs/operators";
import { ReportsService } from "../../features/reports/_services/reports.service";
import {environment} from "../../../environments/environment";

@Injectable()
export class UniversalAppInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private reportsService: ReportsService,
    private router: Router
  ) {}

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // console.log('INTERCEPTEZ', req);
    if (req.url.startsWith("/bestinform")) {
      if (
        !req.url.startsWith("/bestinform/login") &&
        !req.url.startsWith("/bestinform/registerUser") &&
        !req.url.startsWith("/bestinform/sendRegistrationEmail") &&
        !req.url.startsWith("/bestinform/sendResetUserPassword?email=") &&
        !req.url.startsWith("/bestinform/resetNewPassword") &&
        !req.url.startsWith("/bestinform/getHomepageByLanguageAndApp") &&
        !req.url.startsWith("/bestinform/listEditorialFiltered") &&
        !req.url.startsWith("/bestinform/listResourceTemplateFiltered") &&
        !req.url.startsWith("/bestinform/getAttributeById") &&
        !req.url.startsWith("/bestinform/getAttributeMaxOrderByCategoryId") &&
        !req.url.startsWith("/bestinform/listAttributesFiltered") &&
        !req.url.startsWith("/bestinform/sendAuthenticationCode")
        // !req.url.startsWith("/bestinform/sendProviderApprovedEmail?userId")
      ) {
        // console.log('trebuie pus token');
        if (this.authService.getJWTToken()) {
          // console.log('iau token');
          req = this.addToken(req, this.authService.getJWTToken());
        } else {
          req = req.clone({
            url: `${environment.api_url}` + req.url,
          });
        }
      } else {
        console.log("NU AM TOKEN");
        req = req.clone({
          url: `${environment.api_url}` + req.url,
        });
      }
    }

    return next.handle(req).pipe(
      catchError((error) => {
        console.log("EROAREEE", error);
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          error.error.reason === "tokenExpired"
        ) {
          return this.handleTokenExpiredError(req, next);
        } else if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          error.error.reason === "notLoggedIn"
        ) {
          console.log("NOT LOGGED IN");
          // this.toastService.showToast('Eroare', 'Sesiunea ta a expirat! Te rugam sa te loghezi din nou.', 'error');
          this.router.navigate(["/old-homepage"]); // Redirect to homepage
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    // console.log('adaug token');
    return request.clone({
      url: `${environment.api_url}` + request.url,

      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handleTokenExpiredError(
    request: HttpRequest<any>,
    next: HttpHandler
  ) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          console.log("REFRESH TOKEN 1", token);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.token);
          this.reportsService
            .loginJasper("jasperadmin", "jasperadmin")
            .subscribe((resp) => {
              console.log("resp jasper");
              console.log(resp);
            });
          return next.handle(this.addToken(request, token.token));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          // console.log('REFRESH TOKEN 2', jwt);
          return next.handle(this.addToken(request, jwt));
        })
      );
    }
  }
}
