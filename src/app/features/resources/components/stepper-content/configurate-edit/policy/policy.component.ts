import {Component} from '@angular/core';
import {StepperService} from "../../../../_services/stepper.service";

@Component({
    selector: 'app-policy',
    templateUrl: './policy.component.html',
    styleUrls: ['./policy.component.scss']
})
export class PolicyComponent {


    constructor(private stepperService: StepperService) {

    }


    /** Go to next step*/
    nextStep() {

        // // Mark as touched
        // this.form.markAllAsTouched()
        //
        // // Check form validation
        // if (this.form.invalid) {
        //     return
        // }

        // Go the next step
        this.stepperService.nextStep()

    }

    /** Go to previous step*/
    prevStep() {
        this.stepperService.prevStep()
    }
}
