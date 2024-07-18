import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import { StepperService } from 'src/app/features/resources/_services/stepper.service';
import { Notification } from 'src/app/shared/_models/notification.model';
import { User } from 'src/app/shared/_models/user.model';
import { NotificationsService } from 'src/app/shared/_services/notifications.service';
import { ToastService } from 'src/app/shared/_services/toast.service';
import { UserDataService } from 'src/app/shared/_services/userData.service';
import { SharedModule } from 'src/app/shared/shared.module';
import {UserSettingsComponent} from "../popup-dialog/popup-dialog.component";
import {UserNotificationsComponent} from "../user-notifications/user-notifications.component";
import { Router, } from "@angular/router";
import {AuthService} from "src/app/shared/_services/auth.service";
import { Subscription, timer } from "rxjs";
import { MatIconRegistry } from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: "app-nav-bar",
    templateUrl: "./nav-bar.component.html",
    styleUrls: ["./nav-bar.component.scss"],
    standalone: true,
    imports: [SharedModule]
})
export class NavBarComponent implements OnInit {
    constructor(
        private readonly _registry: MatIconRegistry,
        private readonly _sanitize: DomSanitizer,
        public dialog: MatDialog,
        private router: Router,
        private notificationsService: NotificationsService,
        private toastService: ToastService,
        private stepperService: StepperService,
        private cdr: ChangeDetectorRef,
        private userData: UserDataService,
        private authService: AuthService) {
      this._registry.addSvgIcon('bell', this._sanitize.bypassSecurityTrustResourceUrl('/assets/icons/bell.svg'));
    }

    //change if notification Array has lenght !==0
    hasNotifications = true;
    isClientDomain: boolean = false;
    currentUser;
    userAvatar = '../../../assets/logo-simple.svg';
    subs: Subscription[] = [];

    unreadMessages: number;
    notificationsList: Array<any> = [];

    user: User;
    navLink = '/client';

    name: string;
    isAdmin = false;
    isStaff = false;
    isClient = false;
    isProvider = false;

    imgPath = "assets/images/others/user.jpg";

    ngOnInit(): void {
        this.changeNavBar();
        const sub = this.authService.getCurrentUser().subscribe((user) => {
            this.currentUser = user;
            this.userAvatar = user?.avatar?.filePath === 'https://bestinform.eu/bestinform/defaultProfileImage.png' ? this.userAvatar : user?.avatar?.filePath;
        });
        this.subs.push(sub);
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
            if (res.roles.includes('ROLE_SUPER_ADMIN')) {
                this.navLink = '/private/admin/dashboard';
            } else if (res.roles.includes('ROLE_STAFF')) {
                this.navLink = '/private/staff';
            }  else if (res.roles.includes('ROLE_PROVIDER')) {
                this.navLink = '/private/provider';
            }  else if (res.roles.includes('ROLE_CLIENT')) {
                this.navLink = '/client';
            }
        });
    }

    ngOnDestroy() {
        this.subs.forEach(sub => {
            sub.unsubscribe();
        })
    }

    changeNavBar() {
        const currentUrl = this.router.url;
        return currentUrl.includes("client/domain")
            ? (this.isClientDomain = true)
            : (this.isClientDomain = false);
    }

    openUserSettings(): void {
        console.log('navbar is Client', this.isClient);
        this.dialog.open(UserSettingsComponent, {
            position: {
                top: "52px",
                right: "63px",
            },
            width: "223px",
            height: "auto",
            data: {
                isClient: this.isClient
            }
        });
    }

    openNotifications(): void {
        this.dialog.open(UserNotificationsComponent, {
            position: {
                top: "52px",
                right: "122px",
            },
            width: "240px",
            height: "auto",
        });
    }

    getNotifications() {
        console.log('get notifications');
        this.unreadMessages = 0;
        this.notificationsService
            .listMyNotifications(0, 3, "date", "desc")
            .subscribe((notificationsList: any) => {
                this.notificationsList = notificationsList.content.map(notification => {
                    return {
                        ...notification,
                        date: new Date(...(notification.date as []))
                    };
                });
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
}
