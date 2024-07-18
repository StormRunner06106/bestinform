import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-car-rentals',
    templateUrl: './car-rentals.component.html',
    styleUrls: ['./car-rentals.component.scss']
})
export class CarRentalsComponent implements OnInit {

    rentalForm: FormGroup;
    minDate = new Date();

    constructor(private fb: FormBuilder,
                private router: Router,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.formInit();
    }

    formInit() {
        this.rentalForm = this.fb.group({
            pickUpLocation: ['', Validators.required],
            dropOffLocation: ['', Validators.required],
            pickUpDate: ['', Validators.required],
            dropOffDate: ['', Validators.required]
        })
    }

    checkAvailability() {
        this.rentalForm.markAllAsTouched();
        if (this.rentalForm.valid) {
            console.log('valid')
            this.router.navigate(['../available-car-rentals'], {relativeTo: this.route});
        } else {
            console.log(this.rentalForm)
            return;
        }
    }
}