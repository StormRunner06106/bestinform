import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TicketsBookingService} from "../../../../../../_services/tickets-booking.service";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {BookingPolicies} from "../../../../../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-add-edit-ticket',
    templateUrl: './add-edit-ticket.component.html',
    styleUrls: ['./add-edit-ticket.component.scss']
})
export class AddEditTicketComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();

    // le folosim la booking policies value changes, ca sa vedem care a fost optiunea selectata anterior
    selectedBookingType: string;
    previousBookingType: string;

    ticketForm: FormGroup;
    displayLimit = false;
    displaySeats = false;
    isEditTicketMode = false;

    ticketList: any;

    constructor(private fb: FormBuilder,
                private ticketsBookingService: TicketsBookingService,
                private resourceService: ResourcesService,
                public dialogRef: MatDialogRef<AddEditTicketComponent>,
                @Inject(MAT_DIALOG_DATA) public ticketData: { ticket }) {
    }

    ngOnInit() {
        this.ticketFormInit();
        this.checkIfEdit();
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

    ticketFormInit() {
        this.ticketForm = this.fb.group({
            id: [this.ticketData ? undefined : Math.random().toString(36).substring(2, 17)],
            name: [null, Validators.required],
            description: null,
            regularPrice: [null, Validators.compose([Validators.required, Validators.pattern("^[1-9]\\d*$")])],
            weekendPrice: [null, Validators.compose([Validators.required, Validators.pattern("^[1-9]\\d*$")])],
            hasSeat: [false],
            ticketsForBooking: this.fb.array([]),
            limit: [false],
            ticketsLimit: [null, Validators.compose([Validators.min(0),Validators.pattern("[0-9]*") ])],
            bookingPolicies: this.fb.group({
                depositRequired:false,
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
            console.log('full payment');
            this.ticketForm.get('bookingPolicies').get('depositRequired')?.setValue(false);
            // this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            // this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage')?.disable();

            this.ticketForm.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            // this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
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

    requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
        console.log('se apeleaza');
        return function validate (formGroup: FormGroup) {
            let checked = 0;
            // console.log('se apeleaza 2');

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

    checkIfEdit() {
        if (this.ticketData) {
            this.isEditTicketMode = true;
            this.ticketForm.patchValue(this.ticketData.ticket);
            if (this.ticketData.ticket.hasSeat === true) {

                if(this.ticketData.ticket.ticketsForBooking){
                    this.ticketData.ticket.ticketsForBooking.forEach(ticket =>{
                        this.ticketsForBooking().push(
                            this.fb.group({
                                ticketNumber: [ticket.ticketNumber, Validators.required],
                                seatNumber: [ticket.seatNumber, Validators.required]
                            })
                        )
                    })
                }
                this.displaySeats = true;
            }

            if (this.ticketData.ticket?.limit === true) {
                this.displayLimit = true;

            }

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
        }
    }

    // form array
    ticketsForBooking(): FormArray {
        return this.ticketForm.get('ticketsForBooking') as FormArray;
    }

    newTicket(): FormGroup {
        return this.fb.group({
            ticketNumber: [null, Validators.required],
            seatNumber: [null, Validators.required]
        });
    }

    addTicket() {
        if (this.displayLimit && this.displaySeats) {
            if (this.ticketsForBooking().length < this.ticketForm.value.ticketsLimit) {
                this.ticketsForBooking().push(this.newTicket());
            } else {
                console.log('peste limita');
            }
        } else if (this.displaySeats && !this.displayLimit) {
            this.ticketsForBooking().push(this.newTicket());
        } else {
            console.log('nu se paote');
        }


    }

    removeTicket() {
        if (this.ticketsForBooking().length < 1) {
            return
        }
        this.ticketsForBooking().removeAt(-1);
    }

    limitChecking(event) {
        console.log(event);
        if (event.checked) {
            this.displayLimit = true;
            // if(this.ticketsForBooking().length > this.ticketForm.value.ticketsLimit){
            //     this.removeTicket();
            // }
        } else {
            this.displayLimit = false;
            // this.ticketForm.get('ticketsLimit').disable();
            this.ticketForm.get('ticketsLimit').patchValue(0);
        }
    }

    seatChecking(event) {
        console.log(event);
        if (event.checked) {
            this.displaySeats = true;
        } else {
            this.displaySeats = false;
            // this.ticketForm.get('ticketsLimit').disable();
            this.ticketForm.get('ticketsLimit').patchValue(null);
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    confirm() {
        this.ticketForm.markAllAsTouched();
        if (this.ticketForm.valid) {
            if (this.isEditTicketMode) {
                this.updateTicket();
                this.dialogRef.close();
            } else {
                this.createTicket();
                this.dialogRef.close();
            }
        }else{
            console.log('formular invalid', this.ticketForm.value);
            console.log('formular invalid 2', this.ticketForm);
        }
    }

    createTicket() {
        if (this.resourceService.resourceId$.getValue()) {
            this.ticketsBookingService.addTicketToCreateArrayEdit(this.ticketForm.value);
            console.log('CREATE NEW TICKET', this.ticketsBookingService.createArray$.getValue());
            this.ticketsBookingService.refreshCreateArray$.next(true);
        } else {
            this.ticketsBookingService.addTicketToList(this.ticketForm.value);
        }

    }

    updateTicket() {
        this.ticketList = [];

        //check if you are on edit resource
        if (this.resourceService.resourceId$.getValue()) {
            console.log('lista', this.ticketsBookingService.ticketsList$.getValue());

            //we get the initial array
            const initList = this.ticketsBookingService.ticketsList$.getValue();
            //find this ticket in the initial array
            const indexInInitList = initList.findIndex(ticket => ticket.id === this.ticketForm.value.id);

            //we get the createArray to be able to check for the ticket if it was added now
            const createList = this.ticketsBookingService.createArray$.getValue();
            // find this ticket in the current create list
            const indexInCreateList = createList.findIndex(ticket => ticket.id === this.ticketForm.value.id);

            //we get the updateArray to be able to check for this ticket, in case it was a ticket from backend updated now
            const updateList = this.ticketsBookingService.updateArray$.getValue();
            // find this ticket in the current create list
            const indexInUpdateList = updateList.findIndex(ticket => ticket.id === this.ticketForm.value.id);


            if (indexInInitList !== -1) {
                //if the ticket was found in the initial list, it is moved to updateArray
                console.log('case 1', this.ticketsBookingService.ticketsList$.getValue())
                this.ticketsBookingService.addTicketToUpdateArray(this.ticketForm.value);
                const filteredInitList = initList.filter(ticket => ticket.id !== this.ticketForm.value.id);
                console.log('filter 1', filteredInitList)
                this.ticketsBookingService.ticketsList$.next(filteredInitList);
                console.log('case 1 after', this.ticketsBookingService.ticketsList$.getValue())
                this.ticketsBookingService.refreshTicketList$.next(true);
                this.ticketsBookingService.refreshUpdateArray$.next(true);

            }else if (indexInCreateList !== -1) {
                //if the ticket was found in the create list, it is updated here
                createList[indexInCreateList] = this.ticketForm.value;
                this.ticketsBookingService.createArray$.next(createList);
            } else if (indexInUpdateList !== -1) {
                //if the ticket was found in the update list, it is updated here
                updateList[indexInUpdateList] = this.ticketForm.value;
                this.ticketsBookingService.updateArray$.next(updateList);
            } else {
                console.log('ticket not found');
            }
        } else {
            //CREATE RESOURCE
            // Get ticket List
            const ticketList = this.ticketsBookingService.ticketsList$.getValue();
            // find this ticket in the current create list
            const indexInList = ticketList.findIndex(ticket => ticket.id === this.ticketForm.value.id);

            // Check if the room was found and update
            if (indexInList !== -1) {
                ticketList[indexInList] = this.ticketForm.value;
                this.ticketsBookingService.ticketsList$.next(ticketList);
            } else {
                console.log('ticket not found');
            }
        }

    }

    depositCheck(event){
        if(!event.checked){
            this.ticketForm.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
        }
    }

    advancePaymentCheck(event){
        if(!event.checked){
            this.ticketForm.get('bookingPolicies').get('advancePartialPaymentPercentage').patchValue(0);
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



    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
