import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from 'src/app/shared/_services/tickets.service';

@Component({
  selector: 'app-train-tickets',
  templateUrl: './train-tickets.component.html',
  styleUrls: ['./train-tickets.component.scss']
})
export class TrainTicketsComponent {

  trainTicketForm:FormGroup;

  oneWay=true;
  adultsNumber=0;
  childrenNumber=0;
  minDate = new Date();

    //check travelCLass buttons
    invalidFields:Array<any>=[];
    travelClass:boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ticketService:TicketService
    ) {}

    ngOnInit(): void {
      this.initForm();
    }

    initForm(){
      this.trainTicketForm=this.formBuilder.group({
        departureTrainStation: ['',Validators.required],
        arrivalTrainStation: ['',Validators.required],
        departureDate: ['',[Validators.required, Validators.min]],
        returnDate: [''],
        travelClass: ['',Validators.required],
        passengersAdults: [0, Validators.min(0)], //de verificat sa nu permita numere negative
        passengersChildren: [0, Validators.min(0)],
      });
    }

  //when you change the toggle for round or one way trips
  changeTab(event){
    if(event){
      // this.trainTicketForm.reset();
   

      this.adultsNumber=0;
      this.childrenNumber=0;
      this.trainTicketForm.reset();
      this.trainTicketForm.markAsUntouched();
    }
    this.oneWay= event === 'oneWay' ? true :false;
    
    if(this.oneWay===false){
      this.trainTicketForm.get('returnDate').addValidators(Validators.required);
  } else {
      this.trainTicketForm.get('returnDate').clearValidators();
  }

  }

  //set the number of person
  incrementNumberAdults() {
    
    this.trainTicketForm.patchValue({
      passengersAdults: (this.trainTicketForm.get('passengersAdults').value)+1
    });
  }
    //set the number of person
  decrementNumberAdults() {
    this.trainTicketForm.patchValue({
      passengersAdults: (this.trainTicketForm.get('passengersAdults').value)-1
    });

  }

  //set the number of children
  incrementNumberChildren() {    
    this.trainTicketForm.patchValue({
      passengersChildren: (this.trainTicketForm.get('passengersChildren').value)+1

    });
  }
    //set the number of children
  decrementNumberChildren() {
    this.trainTicketForm.patchValue({
      passengersChildren: (this.trainTicketForm.get('passengersChildren').value)-1
    });
  }

  findInvalidControls(){
    this.invalidFields = [];
    const controls = this.trainTicketForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
          this.invalidFields.push(name);
        }
    }
    this.travelClass=this.invalidFields.includes('travelClass')
    // console.log('INVALIDE', this.invalidFields);
  }

   //submit form
   checkAvilability(){
    const objToSend=this.trainTicketForm.value;
    this.trainTicketForm.markAllAsTouched();

    //set train ticket info and send it to list
    this.ticketService.setTrainFormData(this.trainTicketForm);

    //is form valid
    if(this.trainTicketForm.valid){
      if((this.trainTicketForm.get('passengersChildren').value !== 0) || (this.trainTicketForm.get('passengersAdults').value !== 0)){
        //check type of ticket: Round Trips/ One way
        if(this.oneWay){
          this.trainTicketForm.patchValue(objToSend);
        }else if(!this.oneWay){
          this.trainTicketForm.patchValue(objToSend);
        }
        //go to avilability tickets
      this.router.navigate([`/client/domain/63bfcca765dc3f3863af755c/category/63dbb1a4df393f7372161842/available-train-tickets`]);
      // console.log(objToSend);
      }
      

    }else{
      console.log('formular invalid');
      this.findInvalidControls();
       // Mark all inputs as touched
    }
    // console.log("formular trimis");
    
    // console.log(objToSend);
  }


}
