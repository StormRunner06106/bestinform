import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardHeaderComponent} from '../dashboard-header/dashboard-header.component';
import {Subject, takeUntil, timer} from 'rxjs';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {NotificationsService} from 'src/app/shared/_services/notifications.service';
import {User} from 'src/app/shared/_models/user.model';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {Notification} from "../../shared/_models/notification.model";
import {Router} from "@angular/router";
import {MatPaginatorModule} from "@angular/material/paginator";

@Component({
    selector: 'app-all-notifications',
    standalone: true,
    imports: [CommonModule, DashboardHeaderComponent, MatTooltipModule, MatPaginatorModule],
    templateUrl: './all-notifications.component.html',
    styleUrls: ['./all-notifications.component.scss']
})
export class AllNotificationsComponent implements OnInit, OnDestroy{

    listNotification = [];
    private ngUnsubscribe = new Subject<void>();
    user: User = null;
    isAdmin: boolean;
    isStaff: boolean;
    isProvider: boolean;
    isClient: boolean;

    pageSize = 10;
    pageSizeArray = [10, 25, 50, 100];
    pageNumber = 0;
    totalElements = 0;

    unreadMessagesNumber: number;

    constructor(private userData: UserDataService,
                private router: Router,
                private notificationsService: NotificationsService,
                private cdr: ChangeDetectorRef,
                private toastService: ToastService) {
    }

    ngOnInit(): void {
        this.getCurrentUser();
        // Listen to List Changes
        this.listChanged();
    }

    listChanged() {
        this.notificationsService.listChangedObs.subscribe((data: boolean) => {
            // If the response is true
            if (data) {
                // Get Documents List
                this.getNotificationsList();
                this.cdr.detectChanges();

                this.notificationsService.triggerUserListChanges(false);
            }
        })
    }

    getCurrentUser() {
        this.userData.getCurrentUser().subscribe((res: User) => {
            this.user = {...res};
            timer(0, 60000).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.getNotificationsList());
            if (res.roles.includes('ROLE_CLIENT')) {
                this.isClient = true;
            }
            if (res.roles.includes('ROLE_PROVIDER')) {
                this.isProvider = true;
            }
            res.roles.forEach((role: string) => {
                if (role === 'ROLE_SUPER_ADMIN') {
                    this.isAdmin = true;
                    this.isStaff = false;
                } else if (role === 'ROLE_STAFF') {
                    this.isAdmin = false;
                    this.isStaff = true;
                }
            })

        })
    }

    getNotificationsList() {
        this.unreadMessagesNumber = 0;
        this.notificationsService.listMyNotifications(this.pageNumber, this.pageSize, 'date', 'desc')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: any) => {
                this.listNotification = response.content.map(notification => {
                    return {
                        ...notification,
                        date: new Date(...(notification.date as []))
                    };
                });
                this.totalElements = response.totalElements;

                response.content.forEach(element => {
                    if (element.read === false) {
                        this.unreadMessagesNumber = ++this.unreadMessagesNumber;
                    }
                });
            });
    }

    pageChanged(event) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getNotificationsList();
    }

    markAllAsRead() {
        this.notificationsService.markAllNotificationAsRead()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: any) => {
                this.notificationsService.triggerUserListChanges(true);
                this.toastService.showToast('Succes', 'Mesajele au fost marcate ca citite!', 'success');
            });
    }

    markAsRead(idNotification) {
        this.notificationsService.markNotificationAsRead(idNotification)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: any) => {
                this.notificationsService.triggerUserListChanges(true);
                this.toastService.showToast('Succes', 'Mesaj marcat ca citit!', 'success');
            });
    }

    goToNotificationObject(notification: Notification) {
        if (!notification.objectType || !notification.objectId) return;

        switch (notification.objectType) {
            case "friendRequest": {
                switch (true) {
                    case (this.isClient): {
                        void this.router.navigate(['/client/dashboard/profile'], {queryParams: {tab: 'friends'}});
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
                    case (this.isClient): {
                        void this.router.navigate([`/client/dashboard/inbox/${notification.objectId}`]);
                        break;
                    }

                    case (this.isProvider): {
                        void this.router.navigate([`/private/provider/inbox/${notification.objectId}`]);
                        break;
                    }

                    case (this.isStaff): {
                        void this.router.navigate([`/private/staff/inbox/${notification.objectId}`]);
                        break;
                    }

                    case (this.isAdmin): {
                        void this.router.navigate([`/private/admin/inbox/${notification.objectId}`]);
                        break;
                    }
                }
                break;
            }

            case "reservation": {
                switch (true) {
                    case (this.isClient): {
                        void this.router.navigate([`/client/dashboard/my-booking/view/${notification.objectId}`]);
                        break;
                    }

                    case (this.isProvider): {
                        void this.router.navigate([`/private/provider/reservations/view/${notification.objectId}`]);
                        break;
                    }

                    case (this.isStaff): {
                        void this.router.navigate([`/private/staff/reservations/view/${notification.objectId}`]);
                        break;
                    }

                    case (this.isAdmin): {
                        void this.router.navigate([`/private/admin/reservations/view/${notification.objectId}`]);
                        break;
                    }
                }
                break;
            }

            case "resource": {
                switch (true) {
                    case (this.isClient): {
                        void this.router.navigate([`/client/events/view/${notification.objectSlug}`]);
                        break;
                    }

                    case (this.isProvider): {
                        void this.router.navigate([`/private/provider/resources/edit/${notification.objectId}`]);
                        break;
                    }

                    case (this.isStaff): {
                        void this.router.navigate([`/private/staff/resources/edit/${notification.objectId}`]);
                        break;
                    }

                    case (this.isAdmin): {
                        void this.router.navigate([`/private/admin/resources/edit/${notification.objectId}`]);
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
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
