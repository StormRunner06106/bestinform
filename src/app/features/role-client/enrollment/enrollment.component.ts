import {Component, OnInit} from '@angular/core';
import {EnrollStepperService} from "./_services/enroll-stepper.service";
import {ActivatedRoute, RouterModule} from "@angular/router";

@Component({
    selector: 'app-enrollment',
    templateUrl: './enrollment.component.html',
    styleUrls: ['./enrollment.component.scss']
})
export class EnrollmentComponent implements OnInit {

    step: number;

    constructor(private stepperService: EnrollStepperService,
                private router: RouterModule,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe({
            next: queryParam => {
                if (queryParam.payment === 'success') {
                    console.log('e succes');
                    this.stepperService.step$.next(4);
                    this.step = 4;
                } else {
                    this.stepperService.getStep().subscribe({
                        next: step => {
                            console.log('ENROLLMENT', step);
                            this.step = step;
                        }
                    })

                }
            }
        })
    }

}
