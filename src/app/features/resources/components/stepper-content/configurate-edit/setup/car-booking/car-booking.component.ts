import { Component } from '@angular/core';
import {StepperService} from "../../../../../_services/stepper.service";

@Component({
  selector: 'app-car-booking',
  templateUrl: './car-booking.component.html',
  styleUrls: ['./car-booking.component.scss']
})
export class CarBookingComponent {
  roomList: any = []
  resourceId: string
  dataLoaded = false;

  constructor(private stepperService: StepperService) {
  }



  /** Go to next step*/
  nextStep() {
    this.stepperService.nextStep()
  }

  /** Go to previous step*/
  prevStep() {
    this.stepperService.prevStep()
  }

}
