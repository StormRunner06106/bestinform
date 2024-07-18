import {Component, OnInit} from '@angular/core';
import {AttributesService} from "../../_services/attributes.service";
import {User} from "../../../../../shared/_models/user.model";
import {Router} from "@angular/router";
import {UserLocationService} from "../../../../../shared/_services/user-location.service";

@Component({
    selector: 'app-finish-enrollment',
    templateUrl: './finish-enrollment.component.html',
    styleUrls: ['./finish-enrollment.component.scss']
})
export class FinishEnrollmentComponent implements OnInit {

    currentUser: User;

    constructor(private enrollService: AttributesService,
                private router: Router,
                private userLocationService: UserLocationService) {
    }

    ngOnInit() {
        this.getCurrentUser();
        this.userLocationService.checkUserCoordinates();
    }

    getCurrentUser() {
        this.enrollService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
            }
        })
    }

    finish() {
        this.router.navigate(['/client']).then(() => {
            console.log('after login promise');
            this.userLocationService.checkUserCoordinates();
        });
    }

    startTrial() {
        this.enrollService.executeRecurringPayments().subscribe({
            next: (resp: { reason: string, success: boolean }) => {
                if (resp.success) {
                    window.location.href = resp.reason;
                }
            }
        })
    }

}
