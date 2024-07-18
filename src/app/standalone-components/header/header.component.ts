import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { User } from "../../shared/_models/user.model";
import { MediaMatcher } from "@angular/cdk/layout";
import { UserDataService } from "../../shared/_services/userData.service";
import { JwtTokenService } from "../../shared/_services/jwtToken.service";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/_services/auth.service";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { DomainsSelectorComponent } from "../domains-selector/domains-selector.component";
import { NotificationsService } from "src/app/shared/_services/notifications.service";
import { ToastService } from "src/app/shared/_services/toast.service";
import { SystemSettingsService } from "../../shared/_services/system-settings.service";
import { Notification } from "../../shared/_models/notification.model";
import { timer } from "rxjs";
import { StepperService } from "src/app/features/resources/_services/stepper.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, SharedModule, DomainsSelectorComponent],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isOpen = false;

  user: User;
  isAdmin = false;
  isStaff = false;
  isClient = false;
  isProvider = false;
  name: string;
  notificationsList: Array<any> = [];

  unreadMessages: number;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isResourcesClicked = false;
  isCMSClicked = false;

  imgPath = "assets/images/others/user.jpg";
  decodedToken: { [p: string]: string };

  mode: string;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private userData: UserDataService,
    private tokenService: JwtTokenService,
    private router: Router,
    public authService: AuthService,
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private appSettings: SystemSettingsService,
    private stepperService: StepperService
  ) {
    this.mobileQuery = media.matchMedia("(max-width:768px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.decodedToken = this.tokenService.getDecodedToken();
  }

  ngOnInit(): void {
    this.getSettings();

    this.userData.getCurrentUser().subscribe((res: User) => {
      console.log(res);
      this.user = res;
      this.imgPath = res.avatar?.filePath;
      this.name = this.user.firstName + " " + this.user.lastName;

      timer(0, 60000).subscribe(() => this.getNotifications());
      this.listChanged();
      // console.log('numeee', this.name);
      if (res.roles.includes("ROLE_CLIENT")) {
        this.isClient = true;
      }
      if (res.roles.includes("ROLE_PROVIDER")) {
        this.isProvider = true;
      }
      res.roles.forEach((role: string) => {
        if (role === "ROLE_SUPER_ADMIN") {
          this.isAdmin = true;
          this.isStaff = false;
        } else if (role === "ROLE_STAFF") {
          this.isAdmin = false;
          this.isStaff = true;
        }
      });
    });
  }

  getSettings() {
    this.appSettings.getSystemSetting().subscribe((resp: any) => {
      console.log("setari", resp);
      this.mode = resp.mode;
    });
  }

  listChanged() {
    this.notificationsService.listChangedObs.subscribe((data: boolean) => {
      // If the response is true
      if (data) {
        // Get Documents List
        this.getNotifications();
        this.cdr.detectChanges();

        this.notificationsService.triggerUserListChanges(false);
      }
    });
  }

  getNotifications() {
    this.unreadMessages = 0;
    this.notificationsService
      .listMyNotifications(0, 3, "date", "desc")
      .subscribe((notificationsList: any) => {
        this.notificationsList = notificationsList.content;
        notificationsList.content.forEach((element) => {
          if (element.read === false) {
            this.unreadMessages = ++this.unreadMessages;
          }
        });
      });
  }

  markAllNotificationAsRead() {
    this.notificationsService
      .markAllNotificationAsRead()
      .subscribe((response: any) => {
        console.log("markAllNotificationAsRead", response);
        this.unreadMessages = 0;
        this.notificationsService.triggerUserListChanges(true);
        this.toastService.showToast(
          "Succes",
          "Mesajele au fost marcate ca citite!",
          "success"
        );
      });
  }

  markNotificationAsRead(notificationId: string) {
    this.notificationsService
      .markNotificationAsRead(notificationId)
      .subscribe((response: any) => {
        console.log("markNotificationAsRead", response);
        this.notificationsService.triggerUserListChanges(true);
        this.toastService.showToast(
          "Succes",
          "Mesaj marcat ca citit!",
          "success"
        );
      });
  }

  onResourcesClick() {
    this.isResourcesClicked = !this.isResourcesClicked;
  }

  onCMSClick() {
    this.isCMSClicked = !this.isCMSClicked;
  }

  goToNotificationObject(notification: Notification) {
    if (!notification.objectType || !notification.objectId) return;

    switch (notification.objectType) {
      case "friendRequest": {
        switch (true) {
          case this.isClient: {
            void this.router.navigate(["/client/dashboard/profile"], {
              queryParams: { tab: "friends" },
            });
            break;
          }

          /*case (this.isProvider): {
                        void this.router.navigate([]);
                        break;
                    }*/

          /*case (this.isStaff): {
                        void this.router.navigate([]);
                        break;
                    }*/

          /*case (this.isAdmin): {
                        void this.router.navigate([]);
                        break;
                    }*/
        }
        break;
      }

      case "message": {
        switch (true) {
          case this.isClient: {
            void this.router.navigate([
              `/client/dashboard/inbox/${notification.objectId}`,
            ]);
            break;
          }

          case this.isProvider: {
            void this.router.navigate([
              `/private/provider/inbox/${notification.objectId}`,
            ]);
            break;
          }

          case this.isStaff: {
            void this.router.navigate([
              `/private/staff/inbox/${notification.objectId}`,
            ]);
            break;
          }

          case this.isAdmin: {
            void this.router.navigate([
              `/private/admin/inbox/${notification.objectId}`,
            ]);
            break;
          }
        }
        break;
      }

      case "reservation": {
        switch (true) {
          case this.isClient: {
            void this.router.navigate([
              `/client/dashboard/my-booking/view/${notification.objectId}`,
            ]);
            break;
          }

          case this.isProvider: {
            void this.router.navigate([
              `/private/provider/reservations/view/${notification.objectId}`,
            ]);
            break;
          }

          case this.isStaff: {
            void this.router.navigate([
              `/private/staff/reservations/view/${notification.objectId}`,
            ]);
            break;
          }

          case this.isAdmin: {
            void this.router.navigate([
              `/private/admin/reservations/view/${notification.objectId}`,
            ]);
            break;
          }
        }
        break;
      }

      case "resource": {
        switch (true) {
          case this.isClient: {
            void this.router.navigate([
              `/client/events/view/${notification.objectSlug}`,
            ]);
            break;
          }

          case this.isProvider: {
            void this.router.navigate([
              `/private/provider/resources/edit/${notification.objectId}`,
            ]);
            this.stepperService.step$.next(0);
            break;
          }

          case this.isStaff: {
            void this.router.navigate([
              `/private/staff/resources/edit/${notification.objectId}`,
            ]);
            this.stepperService.step$.next(0);
            break;
          }

          case this.isAdmin: {
            void this.router.navigate([
              `/private/admin/resources/edit/${notification.objectId}`,]);
                        this.stepperService.step$.next(0);
                        break;
                    }
                }
                break;
            }

            case 'sharedExperience': {
                void this.router.navigate(['/client/domain/63bfcca765dc3f3863af755c/shared-experiences/view/', notification.objectSlug]);
                break;
            }

        }
    }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
