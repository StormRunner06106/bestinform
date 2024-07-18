import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { User } from "../../../shared/_models/user.model";
import { UserDataService } from "../../../shared/_services/userData.service";
import { ToastService } from "../../../shared/_services/toast.service";
import { AuthService } from "../../../shared/_services/auth.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: "app-delete-client",
  templateUrl: "./delete-client.component.html",
  styleUrls: ["./delete-client.component.scss"],
})
export class DeleteClientComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User>;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private userDataService: UserDataService,
    private toastService: ToastService,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserData();
  }

  getCurrentUserData() {
    this.currentUser$ =
      this.userDataService.getCurrentUser() as Observable<User>;
  }

  deleteAccount(userId: string) {
    this.userDataService
      .deleteUser(userId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastService.showToast(
              this.translate.instant("TOAST.SUCCESS"),
              this.translate.instant("TOAST.SERVER-ERROR"),
              "success"
            );
            /*const a = document.createElement('a');
              a.style.display = 'none';
              a.href = "/bestinform/logout";
              a.click();*/
            this.authService.logout();
            window.location.href =
              `${environment.api_url}/logout`;
          } else {
            this.toastService.showToast(
              this.translate.instant("TOAST.ERROR"),
              this.translate.instant("TOAST.SERVER-ERROR"),
              "error"
            );
          }
        },

        error: (error: any) => {
          this.toastService.showToast(
            this.translate.instant("TOAST.ERROR"),
            this.translate.instant("TOAST.SERVER-ERROR"),
            "error"
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
