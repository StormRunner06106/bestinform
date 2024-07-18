import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EventTicketService} from "../../_services/event-ticket.service";
import {Subject, takeUntil} from "rxjs";
import {BookingPolicies} from "../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-add-edit-event-ticket',
    templateUrl: './add-edit-event-ticket.component.html',
    styleUrls: ['./add-edit-event-ticket.component.scss']
})
export class AddEditEventTicketComponent implements OnInit, OnDestroy {

    ticketForm: FormGroup;
    isEditMode = false;

    // le folosim la booking policies value changes, ca sa vedem care a fost optiunea selectata anterior
    selectedBookingType: string;
    previousBookingType: string;
    private ngUnsubscribe = new Subject<void>();

    constructor(private fb: FormBuilder,
                private ticketService: EventTicketService,
                public dialogRef: MatDialogRef<AddEditEventTicketComponent>,
                @Inject(MAT_DIALOG_DATA) public ticketData: { ticket }) {
    }

    ngOnInit() {
        console.log('ticket data', this.ticketData)
        this.formInit();
        this.checkIfEdit();
        console.log(this.ticketService.eventId$.getValue());
        this.bookingPoliciesValueChanges();
    }

    bookingPoliciesValueChanges() {
        const bookingPolicies = this.ticketForm.get('bookingPolicies') as FormGroup;
        bookingPolicies.valueChanges
            .pipe(
                // distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                takeUntil(this.ngUnsubscribe)
            ).subscribe( (newValues: BookingPolicies & {advancePartialPayment: boolean; depositRequired: boolean}) => {
            for (const bookingType in newValues) {
                if (newValues[bookingType] === true) {
                    if (!this.previousBookingType) {
                        this.previousBookingType = bookingType;
                        this.selectedBookingType = bookingType;
                    } else if(bookingType !== this.selectedBookingType){
                        this.previousBookingType = this.selectedBookingType;
                        this.selectedBookingType = bookingType;
                        break;
                    }
                }

            }

            if (this.previousBookingType && this.selectedBookingType && (this.previousBookingType !== this.selectedBookingType)) {
                bookingPolicies.get(this.previousBookingType).patchValue(false, {emitEvent: false});
                if (this.previousBookingType === 'depositRequired') {
                    if (bookingPolicies.get('depositRequiredPercentage').disabled) {
                        bookingPolicies.get('depositRequiredAmount').patchValue(0, {emitEvent: false});
                    }
                    if (bookingPolicies.get('depositRequiredAmount').disabled) {
                        bookingPolicies.get('depositRequiredPercentage').patchValue(0, {emitEvent: false});
                    }
                }

                if (this.previousBookingType === 'advancePartialPayment') {
                    bookingPolicies.get('advancePartialPaymentPercentage').patchValue(0, {emitEvent: false});
                }
            }
        });
    }

    formInit() {
        this.ticketForm = this.fb.group({
            id: [this.ticketData ? undefined : Math.random().toString(36).substring(2, 17)],
            name: [null, Validators.required],
            regularPrice: [null, Validators.required],
            // weekendPrice: [null, Validators.required],
            // hasSeat: [false],
            // ticketsForBooking: this.fb.array([]),
            limit: [true],
            ticketsLimit: [null, Validators.min(0)],
            bookingPolicies: this.fb.group({
                depositRequired: false,
                advancePartialPayment: false,
                advanceFullPayment: false,
                depositRequiredPercentage: [0, Validators.compose([Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')])],
                depositRequiredAmount: [0, Validators.compose([Validators.required, Validators.pattern('^[1-9]\\d*$')])],
                advancePartialPaymentPercentage: [0, Validators.compose([Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')])],
            }, {
                validators: this.requireCheckboxesToBeCheckedValidator()
            })
        })

    }

    requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
        return function validate (formGroup: FormGroup) {
            let checked = 0;
            console.log('se apeleaza 2', formGroup);
            Object.keys(formGroup.controls).forEach(key => {
                const control = formGroup.controls[key];

                if (control.value === true) {
                    checked ++;
                }
            });

            if (checked < minRequired) {
                return {
                    requireCheckboxesToBeChecked: true,
                };
            }

            return null;
        };
    }

    checkIfEdit(){
        if(this.ticketData){
            this.isEditMode = true;
            this.ticketForm.patchValue(this.ticketData.ticket);
            if (this.ticketData.ticket.bookingPolicies?.advanceFullPayment) {
                this.previousBookingType = 'advanceFullPayment';
                this.selectedBookingType = 'advanceFullPayment';
                this.bookingPolicyEdit(true, 'advanceFullPayment');
            }


            if(this.ticketData.ticket.bookingPolicies?.depositRequiredPercentage > 0){
                this.ticketForm.get('bookingPolicies.depositRequired').patchValue(true);
                this.ticketForm.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                this.previousBookingType = 'depositRequired';
                this.selectedBookingType = 'depositRequired';
                this.checkDepositType('percentage');
            }

            if(this.ticketData.ticket.bookingPolicies?.depositRequiredAmount > 0){
                this.ticketForm.get('bookingPolicies.depositRequired').patchValue(true);
                this.ticketForm.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                this.previousBookingType = 'depositRequired';
                this.selectedBookingType = 'depositRequired';
                this.checkDepositType('amount');
            }

            if(this.ticketData.ticket.bookingPolicies?.advancePartialPaymentPercentage > 0){
                this.ticketForm.get('bookingPolicies.advancePartialPayment').patchValue(true);
                this.ticketForm.get('bookingPolicies.depositRequiredAmount').disable();
                this.ticketForm.get('bookingPolicies.depositRequiredPercentage').disable();
                this.previousBookingType = 'advancePartialPayment';
                this.selectedBookingType = 'advancePartialPayment';
            }
        }else{
            this.isEditMode = false;
        }
    }

    confirm(){
        this.ticketForm.markAllAsTouched();
        if(this.ticketForm.valid){
            const ticket = {...this.ticketForm.value,
            limit: this.ticketForm.value?.ticketsLimit > 0 ? true : false }
            if(this.isEditMode){
                this.updateTicket(ticket);
            }else{
                this.createTicket(ticket)
            }
        }
    }

    createTicket(ticket){

        if(this.ticketService.eventId$.getValue()){
            //EDIT EVENT
            ticket = {
                ...ticket,
                state: 'add'
            }
            this.ticketService.addTicketToList(ticket);
            this.ticketService.refreshTicketList$.next(true);
            console.log(this.ticketService.ticketsList$.getValue());
            this.close();
        }else{
            //ADD EVENT
            this.ticketService.addTicketToList(ticket);
            this.close();
            console.log(this.ticketService.ticketsList$.getValue());
        }
    }

    updateTicket(ticket){
        if(this.ticketService.eventId$.getValue()){
            //EDIT EVENT
            if(this.ticketData.ticket.state === 'add'){
                // Get tickets List
                const ticketList = this.ticketService.ticketsList$.getValue()

                // Find selected ticket by index
                const selectedIndex = ticketList.findIndex(obj => obj.id === ticket.id);

                ticket={
                    ...ticket,
                    state: 'add'
                }
                // Check if the ticket was found and update
                if (selectedIndex !== -1) {
                    ticketList[selectedIndex] = ticket;
                    this.ticketService.ticketsList$.next(ticketList);
                } else {
                    console.log('ticket not found');
                }

                // Close Modal
                this.close()
            }else{
                // Get tickets List
                const ticketList = this.ticketService.ticketsList$.getValue()

                // Find selected ticket by index
                const selectedIndex = ticketList.findIndex(obj => obj.id === ticket.id);

                ticket={
                    ...ticket,
                    state: 'update'
                }
                // Check if the ticket was found and update
                if (selectedIndex !== -1) {
                    ticketList[selectedIndex] = ticket;
                    this.ticketService.ticketsList$.next(ticketList);
                } else {
                    console.log('ticket not found');
                }

                // Close Modal
                this.close()
            }
        }else{
            //ADD EVENT
            // Get tickets List
            const ticketList = this.ticketService.ticketsList$.getValue()

            // Find selected ticket by index
            const selectedIndex = ticketList.findIndex(obj => obj.id === ticket.id);

            // Check if the ticket was found and update
            if (selectedIndex !== -1) {
                ticketList[selectedIndex] = ticket;
                this.ticketService.ticketsList$.next(ticketList);
            } else {
                console.log('ticket not found');
            }

            // Close Modal
            this.close()
        }
    }


    bookingPolicyEdit(event: any, type: string) {
        if (event && type === 'depositRequired') {
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.enable();
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.enable();

            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);

            this.ticketForm.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.ticketForm.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage').disable();
        }

        if (event && type === 'advanceFullPayment') {
            this.ticketForm.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.disable();

            this.ticketForm.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.disable();
        }

        if (event && type === 'advancePartialPayment') {

            this.ticketForm.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.enable();
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);

            this.ticketForm.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.disable();
        }

    }

    checkDepositType(type) {
        if (this.ticketForm.get('bookingPolicies').get('depositRequired').value) {
            if (type === 'percentage') {
                if (this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').value > 0) {
                    this.ticketForm.get('bookingPolicies').get('depositRequiredAmount').patchValue(0);
                    this.ticketForm.get('bookingPolicies').get('depositRequiredAmount').disable();
                } else if (this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').value === 0 || !this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.ticketForm.get('bookingPolicies').get('depositRequiredAmount').enable();
                }
            } else if (type === 'amount') {
                if (this.ticketForm.get('bookingPolicies').get('depositRequiredAmount').value > 0) {
                    this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
                    this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').disable();
                } else if (this.ticketForm.get('bookingPolicies').get('depositRequiredAmount').value === 0 || !this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').enable();
                }
            }
        }

    }

    depositCheck(event){
        console.log('depozit check', event)
        if(!event.checked){
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
        }
    }

    advancePaymentCheck(event){
        if(!event.checked){
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage').patchValue(0);
        }
    }

    close(){
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
