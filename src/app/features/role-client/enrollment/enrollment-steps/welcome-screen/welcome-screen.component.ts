import { Component } from '@angular/core';
import {EnrollStepperService} from "../../_services/enroll-stepper.service";
import { AttributesService } from '../../_services/attributes.service';

@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss']
})
export class WelcomeScreenComponent {

  constructor(private stepperService: EnrollStepperService,
    private attributesService: AttributesService) {
  }

  nextStep() {
    this.stepperService.nextStep();
  }
  // ngOnInit(){
  //    console.log('atributele trimise',this.attributesService.preferences$);
  // }
}
