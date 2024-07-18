import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-launch-landing',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './launch-landing.component.html',
    styleUrls: ['./launch-landing.component.scss']
})
export class LaunchLandingComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();

    days: number;
    hours: number;
    minutes: number;
    seconds: number;

    finished: boolean;
    started: boolean;

    ngOnInit() {
        this.startCountdown();
    }

    startCountdown(): void {
        const countdownDate = new Date("June 8, 2024 00:00:00").getTime();
        interval(1000).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;
            if (distance < 0) {
                this.finished = true;
                return;
            }
            this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
            this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
            this.started = true;
        });

    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
