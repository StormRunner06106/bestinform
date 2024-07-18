import { Component } from '@angular/core';
import {StepperService} from "../../../../../_services/stepper.service";

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.scss']
})
export class ApplyJobComponent {
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
