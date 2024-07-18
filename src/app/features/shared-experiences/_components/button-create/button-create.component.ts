import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {User} from "../../../../shared/_models/user.model";

@Component({
    selector: 'app-button-create',
    templateUrl: './button-create.component.html',
    styleUrls: ['./button-create.component.scss']
})
export class ButtonCreateComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();
    user: User;

    constructor(private userService: UserDataService) {
    }

    ngOnInit() {
        this.getCurrentUser();
    }

    getCurrentUser() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                    next: (currentUser: User) => {
                    this.user = currentUser;
                    }
                }
            )
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
