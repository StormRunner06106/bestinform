import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {BookingTimeslotsService} from "../../../../../../_services/booking-timeslots.service";
import * as moment from "moment";
import {Subject, takeUntil} from "rxjs";
import {BookingPolicies} from "../../../../../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-add-edit-service',
    templateUrl: './add-edit-service.component.html',
    styleUrls: ['./add-edit-service.component.scss']
})
export class AddEditServiceComponent implements OnInit, OnDestroy {

    serviceForm: FormGroup;
    isEditMode = false;
    tabIndex = 0;

    days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // le folosim la booking policies value changes, ca sa vedem care a fost optiunea selectata anterior
    selectedBookingType: string;
    previousBookingType: string;
    private ngUnsubscribe = new Subject<void>();

    constructor(private fb: FormBuilder,
                private resourceService: ResourcesService,
                private timeslotService: BookingTimeslotsService,
                public dialogRef: MatDialogRef<AddEditServiceComponent>,
                @Inject(MAT_DIALOG_DATA) public serviceData: { service }) {
    }

    // serviceForm = new FormGroup({
    //     id: new FormControl(this.serviceData ? undefined : Math.random().toString(36).substring(2, 17)) ,
    //     name: new FormControl(null, Validators.required),
    //     description: new FormControl(null),
    //     price: new FormControl(null, Validators.min(0)),
    //     slotItems: new FormArray([])
    // })

    ngOnInit() {
        this.formInit();
        this.checkIfEdit();
        this.bookingPoliciesValueChanges();
    }

    bookingPoliciesValueChanges() {
        const bookingPolicies = this.serviceForm.get('bookingPolicies') as FormGroup;
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
        this.serviceForm = this.fb.group({
            id: [this.serviceData ? undefined : Math.random().toString(36).substring(2, 17)],
            name: [null, Validators.required],
            description: [null],
            price: [null, Validators.min(0)],
            totalItemsNumber: 1,
            slotItems: this.fb.array([]),
            bookingPolicies: this.fb.group({
                depositRequired: false,
                advancePartialPayment: false,
                advanceFullPayment: false,
                depositRequiredPercentage: [0, Validators.compose([Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')])],
                depositRequiredAmount: [0, Validators.compose([Validators.required, Validators.pattern('^[1-9]\\d*$')])],
                advancePartialPaymentPercentage: [0, Validators.compose([Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')])],
            }, {
                validators: this.requireCheckboxesToBeCheckedValidator()
            }),
        })
    }

    requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
        // console.log('se apeleaza');
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

    get slotItems() {
        return this.serviceForm.get('slotItems') as FormArray;
    }

    newDayTab(day: string): FormGroup {
        return this.fb.group({
            day: day,
            slots: this.fb.array([])
        })
    }

    addDayTab(day: string) {
        this.slotItems.push(this.newDayTab(day));
    }

    removeDayTab(tabIndex: number) {
        this.slotItems.removeAt(tabIndex);
    }


    initConfigTabs() {
        this.days.forEach((item: string) => {
            this.addDayTab(item);
        })
    }

    //slots array
    slots(index): FormArray {
        return this.slotItems.at(index)?.get('slots') as FormArray;
    }


    newSlot(): FormGroup {
        return this.fb.group({
            startHour: moment('00:00', 'HH:mm'),
            endHour: moment('00:00', 'HH:mm')
        }, {
            validators: this.checkTimeSlots
        })
    }

    addSlot(index) {
        this.slots(index).push(this.newSlot());
    }

    addSlotOnUpdate(index, value) {
        this.slotItems.at(index)?.get('slots').value.push(value);
    }

    removeSlot(index, childIndex: number) {
        this.slots(index).removeAt(childIndex);
    }


    checkIfEdit() {
        if (this.serviceData) {
            this.isEditMode = true;
            this.serviceForm.patchValue(this.serviceData.service);

            if (this.serviceData.service.slotItems) {
                this.serviceData.service.slotItems.forEach((slotItem, index) => {
                    this.slotItems.push(
                        this.fb.group({
                            day: slotItem.day,
                            slots: this.fb.array([])
                        })
                    )

                    // console.log('slots', slotItem.slots);
                    slotItem.slots.forEach(slot => {
                        // this.addSlot(index);
                        const startTime = moment(slot.startHour, 'HH:mm');
                        const endTime = moment(slot.endHour, 'HH:mm');
                        this.slots(index).push(this.fb.group({
                            startHour: startTime,
                            endHour: endTime
                        }))
                    })

                    // this.slots(index).patchValue(slotItem.slots);
                })
            }

            if (this.serviceData.service.bookingPolicies?.advanceFullPayment) {
                this.previousBookingType = 'advanceFullPayment';
                this.selectedBookingType = 'advanceFullPayment';
                this.bookingPolicyEdit(true, 'advanceFullPayment');
            }


            if(this.serviceData.service.bookingPolicies?.depositRequiredPercentage > 0){
                this.serviceForm.get('bookingPolicies.depositRequired').patchValue(true);
                this.serviceForm.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                this.previousBookingType = 'depositRequired';
                this.selectedBookingType = 'depositRequired';
                this.checkDepositType('percentage');
            }

            if(this.serviceData.service.bookingPolicies?.depositRequiredAmount > 0){
                this.serviceForm.get('bookingPolicies.depositRequired').patchValue(true);
                this.serviceForm.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                this.previousBookingType = 'depositRequired';
                this.selectedBookingType = 'depositRequired';
                this.checkDepositType('amount');
            }

            if(this.serviceData.service.bookingPolicies?.advancePartialPaymentPercentage > 0){
                this.serviceForm.get('bookingPolicies.advancePartialPayment').patchValue(true);
                this.serviceForm.get('bookingPolicies.depositRequiredAmount').disable();
                this.serviceForm.get('bookingPolicies.depositRequiredPercentage').disable();
                this.previousBookingType = 'advancePartialPayment';
                this.selectedBookingType = 'advancePartialPayment';
            }

            console.log('form', this.serviceForm.value)
        } else {
            this.isEditMode = false;
            this.initConfigTabs();
        }
    }

    sendTimeSlots() {

        this.serviceForm.value.slotItems.forEach((slotItem, index) => {

            slotItem.slots.forEach((slot, childIndex: number) => {
                console.log('TO SEND', slot)
                const startTime = slot.startHour.format('HH:mm');
                const endTime = slot.endHour.format('HH:mm');
                this.slots(index).value[childIndex] = {startHour: startTime, endHour: endTime};

            })
            // this.timetable(index).patchValue(timetableItem.timetable);
            // console.log('form TO SEND', this.serviceForm.value);
        })

    }

    checkTimeSlots(control: AbstractControl): ValidatorFn {
        const startTime = control.get('startHour');
        const endTime = control.get('endHour');
        if (moment(startTime.value).format('HH:mm') >= moment(endTime.value).format('HH:mm')) {
            // console.log('nu e bine');
            endTime.setErrors({invalidTime: true});
        }

        return;
    }


    confirm() {
        this.serviceForm.markAllAsTouched();
        console.log('form', this.serviceForm);
        if (this.serviceForm.valid) {
            this.sendTimeSlots();
            this.close();
            const service = this.serviceForm.value;
            if (this.isEditMode) {
                this.updateService(service);
            } else {
                this.createService(service);
            }
        }
    }

    updateService(service) {
        if (this.resourceService.resourceId$.getValue()) {
            //EDIT RESOURCE
            console.log('EDITARE RESURSA');
            //update a product that was added now
            if (this.serviceData.service.state === 'add') {
                // Get prod List
                const serviceList = this.timeslotService.serviceList$.getValue();

                // Find selected room by index
                const selectedIndex = serviceList.findIndex(prod => prod.id === service.id);

                //the state will be 'add' because this room is going to be added in the end
                service = {
                    ...service,
                    state: 'add'
                }

                if (selectedIndex !== -1) {
                    serviceList[selectedIndex] = service;
                    this.timeslotService.serviceList$.next(serviceList);
                    this.timeslotService.refreshServiceList$.next(true);
                } else {
                    console.log('prod not found');
                }
            } else {
                //the prod exists on the resource
                // Get prod List
                const serviceList = this.timeslotService.serviceList$.getValue();

                // Find selected room by index
                const selectedIndex = serviceList.findIndex(prod => prod.id === service.id);
                service = {
                    ...service,
                    state: 'update'
                }
                if (selectedIndex !== -1) {
                    serviceList[selectedIndex] = service;
                    this.timeslotService.serviceList$.next(serviceList);
                    this.timeslotService.refreshServiceList$.next(true);
                } else {
                    console.log('prod not found');
                }

            }
        } else {
            //ADD RESOURCE
            console.log('ADD RESURSA');
            // Get prod List
            const serviceList = this.timeslotService.serviceList$.getValue();
            // find this ticket in the current create list
            const indexInList = serviceList.findIndex(service => service.id === this.serviceForm.value.id);

            // Check if the room was found and update
            if (indexInList !== -1) {
                serviceList[indexInList] = this.serviceForm.value;
                this.timeslotService.serviceList$.next(serviceList);
            } else {
                console.log('prod not found');
            }
        }
    }

    createService(service) {
        if (this.resourceService.resourceId$.getValue()) {
            //EDIT RESOURCE
            console.log('EDITARE RESURSA');
            service = {
                ...service,
                state: 'add'
            }
            this.timeslotService.addServiceToList(service);
            this.timeslotService.refreshServiceList$.next(true);
        } else {
            //ADD RESOURCE
            console.log('ADD RESURSA');
            this.timeslotService.addServiceToList(service);
            this.timeslotService.refreshServiceList$.next(true);
        }
    }

    depositCheck(event) {
        if (!event.checked) {
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').patchValue(0);

        }
    }

    checkDepositType(type) {
        if (this.serviceForm.get('bookingPolicies').get('depositRequired').value) {
            if (type === 'percentage') {
                if (this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').value > 0) {
                    this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').patchValue(0);
                    this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').disable();
                } else if (this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').value === 0 || !this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').enable();
                }
            } else if (type === 'amount') {
                if (this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').value > 0) {
                    this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
                    this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').disable();
                } else if (this.serviceForm.get('bookingPolicies').get('depositRequiredAmount').value === 0 || !this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage').enable();
                }
            }
        }
    }

    bookingPolicyEdit(event: any, type: string) {
        if (event && type === 'depositRequired') {
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.enable();
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.enable();

            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);

            this.serviceForm.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.serviceForm.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage').disable();
        }

        if (event && type === 'advanceFullPayment') {
            this.serviceForm.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.disable();

            this.serviceForm.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.disable();
        }

        if (event && type === 'advancePartialPayment') {

            this.serviceForm.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.enable();
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);

            this.serviceForm.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.serviceForm.get('bookingPolicies').get('depositRequiredPercentage')?.disable();
        }

    }

    advancePaymentCheck(event) {
        if (!event.checked) {
            this.serviceForm.get('bookingPolicies').get('advancePartialPaymentPercentage').patchValue(0);
        }
    }

    close() {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
