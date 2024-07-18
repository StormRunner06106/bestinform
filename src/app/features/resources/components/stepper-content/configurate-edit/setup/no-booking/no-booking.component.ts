import {Component} from '@angular/core';
import {StepperService} from "../../../../../_services/stepper.service";

@Component({
    selector: 'app-no-booking',
    templateUrl: './no-booking.component.html',
    styleUrls: ['./no-booking.component.scss']
})
export class NoBookingComponent  {

    roomList: any = []
    resourceId: string
    dataLoaded = false;

    constructor(private stepperService: StepperService) {
    }



    /** Go to next step*/
    nextStep() {
        this.stepperService.nextStep(true)
    }

    /** Go to previous step*/
    prevStep() {
        this.stepperService.prevStep()
    }


}
