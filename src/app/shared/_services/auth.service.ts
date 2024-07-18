import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "./localStorage.service";
import { BehaviorSubject, catchError, Observable, of, tap } from "rxjs";
import { Router } from "@angular/router";
import { User } from "../_models/user.model";
import { map } from "rxjs/operators";
import { SocialAuthService } from "angularx-social-login";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly JWT_TOKEN = "token";
  private readonly REFRESH_TOKEN = "refreshToken";
  private loggedUser: string;
  private user: User;

  constructor(
    public http: HttpClient,
    public localStorage: LocalStorageService,
    private router: Router
  ) {}

  // Functions For User Changes Detection
  private userChanged = new BehaviorSubject(false);
  userChangedObs = this.userChanged.asObservable();

  // Trigger
  triggerUserChanges(message: boolean) {
    // Change the subject value
    this.userChanged.next(message);
  }

  // Functions 2FA auth
  private twoFA = new BehaviorSubject(false);
  twoFAObs = this.twoFA.asObservable();

  // Trigger
  trigger2FA(message: boolean) {
    // Change the subject value
    this.twoFA.next(message);
  }

  login(data): Observable<boolean> {
    return this.http.post("/bestinform/login", data).pipe(
      tap((tokens: any) => this.doLoginUser(data.email, tokens)),
      map((res) => {
        console.log("login service", res);
        return res;
      })
      // ,
      // catchError(() => {
      //     // console.log('error login service', error.error.reason)
      //     return of(false);
      // })
    );
  }

  login2FA(authenticationCode) {
    return this.http
      .post("/bestinform/login2FA?authenticationCode=" + authenticationCode, {})
      .pipe(
        tap((tokens: any) => this.doLoginUser(authenticationCode, tokens)),
        map((res) => {
          console.log("2fa login service", res);
          return res;
        }),
        catchError((error) => {
          console.log("2fa error login service", error);
          return of(false);
        })
      );
  }

  sendAuthenticationCode(dataObj: object) {
    return this.http.post("/bestinform/sendAuthenticationCode", dataObj);
  }

  sendUserInvalidSessionEmail(email: string) {
    return this.http.get(
      "/bestinform/sendUserInvalidSessionEmail?email=" + email
    );
  }

  private doLoginUser(username?: string, tokens?) {
    console.log("do login service", tokens);
    this.loggedUser = username;
    this.storeTokens(tokens);
  }

  private storeTokens(tokens) {
    console.log("store tokens", tokens);
    this.localStorage.set(this.JWT_TOKEN, tokens.token);
    this.localStorage.set(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  logout() {
    this.loggedUser = null;
    // this.router.navigate(["/home"]);
    console.log("logout");
    // window.location.href = 'http://bestinform/bestinform/logout';
    this.http.post("/bestinform/logoutUser", {}).subscribe((resp: any) => {
      console.log("m-am delogat", resp);
      this.removeTokens();
      this.localStorage.remove("colorMode");
      this.localStorage.set("langFromStorage", "ro");
    });
  }

  private removeTokens() {
    this.localStorage.remove(this.JWT_TOKEN);
    this.localStorage.remove(this.REFRESH_TOKEN);
    this.router.navigate(["/"]);
  }

  refreshToken() {
    return this.http
      .post(
        "/bestinform/refreshToken?refreshToken=" + this.getRefreshToken(),
        {}
      )
      .pipe(
        tap((tokens) => {
          this.storeTokens(tokens);
        }),
        catchError((error) => {
          console.log("error refresh token");
          this.logout();
          return of(false);
        })
      );
  }

  private getRefreshToken() {
    return this.localStorage.get(this.REFRESH_TOKEN);
  }

  getJWTToken() {
    // console.log('token', this.localStorage.get(this.JWT_TOKEN));
    // console.log('token 2', Object.entries(localStorage));
    return this.localStorage.get(this.JWT_TOKEN);
  }

  isLoggedIn() {
    return !!this.getJWTToken();
  }

  register(user: object) {
    return this.http.post("/bestinform/registerUser", user);
  }

  sendRegistrationEmail(id: string) {
    return this.http.get("/bestinform/sendRegistrationEmail?userId=" + id);
  }

  sendResetUserPassword(email: string) {
    return this.http.get("/bestinform/sendResetUserPassword?email=" + email);
  }

  resetPassword(password: object) {
    return this.http.post("/bestinform/resetNewPassword", password);
  }

  getCurrentUser() {
    return this.http.get<User>("/bestinform/getCurrentUser");
  }

  loginWithFacebook(role?: string, email?: string, token?: string) {
    return this.http
      .post("/bestinform/loginWithFacebook?role=client", { accessToken: token })
      .pipe(
        tap((tokens: any) => this.doLoginUser(email, tokens)),
        map((res) => {
          console.log("login service social", res);
          return res;
        })
      );
  }
}
