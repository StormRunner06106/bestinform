import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RentalBookingService} from "../../../../../../_services/rental-booking.service";
import {FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ResourcesService} from "../../../../../../_services/resources.service";
import {distinctUntilChanged, Observable, Subject, takeUntil} from "rxjs";
import {BookingPolicies} from "../../../../../../../../shared/_models/itinerary.model";

@Component({
    selector: 'app-add-edit-room-modal',
    templateUrl: './add-edit-room-modal.component.html',
    styleUrls: ['./add-edit-room-modal.component.scss']
})
export class AddEditRoomModalComponent implements OnInit, OnDestroy {
    formSubmitClicked = false;

    // images url and files
    thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    thumbnailFile: Blob;
    galleryUrls = [];
    galleryFiles = [];
    galleryUrlsUpdate = [];

    $fileObservables: Observable<object>[] = [];


    selectOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    activeFacilitiesByCategory = [];
    selectedThumbsNail: Blob;
    selectedThumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };
    selectedGalleryImages = [];
    selectedGalleryImagesUrl = [];


    formRoom: any = new FormGroup({
        id: new FormControl(this.room ? undefined : Math.random().toString(36).substring(2, 17)),
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        roomSize: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
        bathrooms: new FormControl(0, Validators.compose([Validators.required, Validators.min(0)])),
        maximumAdultPeople: new FormControl(0, Validators.required),
        maximumChildren: new FormControl(0, Validators.required),
        minimumStay: new FormControl(1, Validators.compose([Validators.required, Validators.min(1)])),
        itemsForBooking: new FormArray([
            // new FormGroup(
            //     {
            //     itemNumber: new FormControl('', Validators.required)
            // }
            // ),
        ], Validators.required),
        bedType: new FormArray([
            new FormGroup({
                type: new FormControl('Twin Bed', Validators.required),
                quantity: new FormControl(0, Validators.required)
            }),
            new FormGroup({
                type: new FormControl('Queen Bed', Validators.required),
                quantity: new FormControl(0, Validators.required)
            }),
            new FormGroup({
                type: new FormControl('King Bed', Validators.required),
                quantity: new FormControl(0, Validators.required)
            }),
            new FormGroup({
                type: new FormControl('Double Bed', Validators.required),
                quantity: new FormControl(0, Validators.required)
            }),
            new FormGroup({
                type: new FormControl('Single Bed', Validators.required),
                quantity: new FormControl(0, Validators.required)
            })
        ]),
        price: new FormGroup({
            regularPrice: new FormControl(0, [Validators.required, Validators.pattern('^[1-9]\\d*$'), Validators.maxLength(6)]),
            weekendPrice: new FormControl(0, [Validators.required, Validators.pattern('^[1-9]\\d*$'), Validators.maxLength(6)]),
        }),
        benefits: new FormControl(undefined),
        featuredImage: new FormControl(undefined),
        images: new FormControl(undefined),
        bookingPolicies: new FormGroup({
            depositRequiredPercentage: new FormControl(0, [Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')]),
            depositRequiredAmount: new FormControl(0, [Validators.required, Validators.pattern('^[1-9]\\d*$')]),
            depositRequired: new FormControl(false),
            advancePartialPayment: new FormControl(false),
            advancePartialPaymentPercentage: new FormControl(0, [Validators.required, Validators.pattern('^(?:[1-9][0-9]?|100)$')]),
            advanceFullPayment: new FormControl(false)
        }, this.requireCheckboxesToBeCheckedValidator(1)),
        changePolicies: new FormGroup({
            nonRefundable: new FormControl(false),
            modifiable: new FormControl(false),
            freeCancellation: new FormGroup({
                freeCancellation: new FormControl(false),
                deadlineDays: new FormControl(0, Validators.pattern('^[1-9]\\d*$'))
            })
        },  { validators: this.customChangePolicyValidation })

    })

    changePolicyEdit(event: any, type: string) {
        if (event.checked && type === 'nonRefundable') {
            this.formRoom.get('changePolicies').get('freeCancellation.freeCancellation').setValue(false);
            this.formRoom.get('changePolicies').get('freeCancellation.deadlineDays').setValue(0);
            this.formRoom.get('changePolicies').get('freeCancellation.deadlineDays').disable();
        } else if (event.checked && type === 'freeCancellation') {
            this.formRoom.get('changePolicies').get('nonRefundable').setValue(false);
            this.formRoom.get('changePolicies').get('freeCancellation.deadlineDays').enable();
            this.formRoom.get('changePolicies').get('freeCancellation.deadlineDays').setValue(0);
        }

        if (!event.checked && type === 'nonRefundable') {
            this.formRoom.get('changePolicies').get('nonRefundable').setValue(false);
        } else if (!event.checked && type === 'freeCancellation') {
            this.formRoom.get('changePolicies').get('freeCancellation.freeCancellation').setValue(false);
        }
    }

    bookingPolicyEdit(event: any, type: string) {
        if (event && type === 'depositRequired') {
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.enable();
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.enable();

            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);

            this.formRoom.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.formRoom.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage').disable();
        }

        if (event && type === 'advanceFullPayment') {
            this.formRoom.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.disable();

            this.formRoom.get('bookingPolicies').get('advancePartialPayment')?.setValue(false);
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage')?.disable();
        }

        if (event && type === 'advancePartialPayment') {

            this.formRoom.get('bookingPolicies').get('advanceFullPayment')?.setValue(false);

            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage')?.enable();
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage')?.setValue(0);

            this.formRoom.get('bookingPolicies').get('depositRequired')?.setValue(false);
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount')?.disable();
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.setValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage')?.disable();
        }

        }

    customChangePolicyValidation(group: FormGroup): { [key: string]: any } | null {
        const freeCancellation = group.get('freeCancellation.freeCancellation')?.value;
        const deadlineDays = group.get('freeCancellation.deadlineDays')?.value;
        const nonRefundable = group.get('nonRefundable')?.value;


        if ((!nonRefundable && !freeCancellation) || (freeCancellation && deadlineDays === 0)) {
            return { invalidPolicy: true };
        }

        return null;
    }

    // le folosim la booking policies value changes, ca sa vedem care a fost optiunea selectata anterior
    selectedBookingType: string;
    previousBookingType: string;
    private ngUnsubscribe = new Subject<void>();

    constructor(public dialogRef: MatDialogRef<AddEditRoomModalComponent>,
                private roomService: RentalBookingService,
                private resourceService: ResourcesService,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public room: { roomData }) {


    }

    ngOnInit() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };
        this.thumbnailFile = undefined;
        this.galleryUrls = [];
        this.galleryFiles = [];

        this.facilitiesByCategory()

        if (this.room) {
            console.log('CAMERA', this.room.roomData);
            this.formRoom.patchValue(this.room.roomData);
            if (this.resourceService.resourceId$.getValue()) {
                console.log('suntem pe edit');
                this.thumbnailUrl = this.room.roomData.featuredImage;
                this.galleryUrls = this.room.roomData.images;
                if (this.room.roomData.state === 'add' || this.room.roomData.state === 'update') {
                    const imagesArray = this.roomService.imagesArray$.getValue();
                    console.log(imagesArray);
                    const element = imagesArray.find(element => element.id === this.room.roomData.id);
                    console.log('am gasit camera in array', element);
                    this.thumbnailFile = element.featuredImage;
                    this.thumbnailUrl = element.featuredImageUrl;
                    this.galleryFiles = element.gallery;
                    this.galleryUrls = element.galleryUrl;
                }

                if(this.room.roomData.changePolicies?.freeCancellation.freeCancellation){
                    this.formRoom.get('changePolicies.nonRefundable').setValue(false);
                    this.formRoom.get('changePolicies.freeCancellation.freeCancellation').setValue(true);
                    this.formRoom.get('changePolicies.freeCancellation.deadlineDays').enable();
                    this.formRoom.get('changePolicies.freeCancellation.deadlineDays').setValue(this.room.roomData.changePolicies?.freeCancellation.deadlineDays);
                }

                if(this.room.roomData.changePolicies?.nonRefundable){
                    this.formRoom.get('changePolicies.nonRefundable').setValue(true);
                    this.formRoom.get('changePolicies.freeCancellation.freeCancellation').setValue(false);
                    this.formRoom.get('changePolicies.freeCancellation.deadlineDays').disable();
                }


                if (this.room.roomData.bookingPolicies?.advanceFullPayment) {
                    this.previousBookingType = 'advanceFullPayment';
                    this.selectedBookingType = 'advanceFullPayment';
                    this.bookingPolicyEdit(true, 'advanceFullPayment');
                }

                if(this.room.roomData.bookingPolicies?.depositRequiredPercentage > 0){
                    this.formRoom.get('bookingPolicies.depositRequired').patchValue(true);
                    this.formRoom.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                    this.previousBookingType = 'depositRequired';
                    this.selectedBookingType = 'depositRequired';
                    this.checkDepositType('percentage');
                }

                if(this.room.roomData.bookingPolicies?.depositRequiredAmount > 0){
                    this.formRoom.get('bookingPolicies.depositRequired').patchValue(true);
                    this.formRoom.get('bookingPolicies.advancePartialPaymentPercentage').disable();
                    this.previousBookingType = 'depositRequired';
                    this.selectedBookingType = 'depositRequired';
                    this.checkDepositType('amount');
                }

                if(this.room.roomData.bookingPolicies?.advancePartialPaymentPercentage > 0){
                    this.formRoom.get('bookingPolicies.advancePartialPayment').patchValue(true);
                    this.formRoom.get('bookingPolicies.depositRequiredAmount').disable();
                    this.formRoom.get('bookingPolicies.depositRequiredPercentage').disable();
                    this.previousBookingType = 'advancePartialPayment';
                    this.selectedBookingType = 'advancePartialPayment';
                }

            } else {
                const imagesArray = this.roomService.imagesArray$.getValue();
                const element = imagesArray.find(element => element.id === this.room.roomData.id);
                console.log('am gasit camera in array', element);
                this.thumbnailFile = element.featuredImage;
                this.thumbnailUrl = element.featuredImageUrl;
                this.galleryFiles = element.gallery;
                this.galleryUrls = element.galleryUrl;
            }


            this.room.roomData.itemsForBooking.forEach(room => {
                this.getItemsForBooking().push(
                    this.fb.group({
                        itemNumber: [room.itemNumber, Validators.required]
                    })
                )
            })
            // this.selectedThumbnailUrl = this.room.roomData.featuredImage
            // this.selectedGalleryImagesUrl = this.room.roomData.images === null ? [] : this.room.roomData.images
        }

        this.bookingPoliciesValueChanges();
    }

    requireCheckboxesToBeCheckedValidator(minRequired: number): ValidatorFn {
        return function validate(formGroup: FormGroup) {
            let checked = false; // Use a boolean flag to track if at least one checkbox is checked

            Object.keys(formGroup.controls).forEach(key => {
                const control = formGroup.controls[key];

                if (control.value === true) {
                    checked = true; // Set the flag to true if any checkbox is checked
                    return; // Exit the loop early, as we only need one checkbox checked
                }
            });

            if (!checked) {
                return {
                    requireCheckboxesToBeChecked: true,
                };
            }

            return null;
        };
    }

    bookingPoliciesValueChanges() {
        console.log('TEST')

        const bookingPolicies = this.formRoom.get('bookingPolicies') as FormGroup;
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


    submitRoom() {

        console.log(this.formRoom);
        this.formSubmitClicked = true;

        // Mark all inputs as touched
        this.formRoom.markAllAsTouched()

        // Check form validation
        if (this.formRoom.invalid) {
            return
        }


        // Create benefits layout for back-end specification
        const benefits = [];
        this.activeFacilitiesByCategory.forEach(category => {
            category.tabAttributes.forEach(attribute => {
                if (this.formRoom.value[attribute.name]) {
                    benefits.push({
                        attributeId: attribute.id,
                        attributeValue: this.formRoom.value[attribute.name]
                    });
                }
            });
        });


        // Deconstruction Form Data
        const formDataObject = {
            ...this.formRoom.value,
            benefits: benefits,
            changePolicies: {
                ...this.formRoom.get('changePolicies').value,
                freeCancellation: {
                    ...this.formRoom.get('changePolicies.freeCancellation').value,
                    deadlineDays: Number(this.formRoom.get('changePolicies.freeCancellation.deadlineDays').value)
                }
            }
        }

        console.log('OBJECT AICI', formDataObject)


        // Check if you are on edit
        if (this.room) {
            this.updateRoom(formDataObject)
        } else {
            this.createRoom(formDataObject)
        }
    }

    /** Create Room */
    createRoom(formDataObject) {

        // TODO Add this create on final step and add the rooms with the new request addRooms
        //check if you are on edit resource
        if (this.resourceService.resourceId$.getValue()) {
            //add state field to the object, so you know what to do with this room in the end
            formDataObject = {
                ...formDataObject,
                state: 'add'
            }
            // this.roomService.roomList$.next(this.roomService.roomList$.getValue().concat(room));
            const image = {
                id: this.formRoom.value.id,
                featuredImage: this.thumbnailFile,
                featuredImageUrl: this.thumbnailUrl,
                gallery: this.galleryFiles,
                galleryUrl: this.galleryUrls
            }

            this.roomService.addImgToImagesArray(image);
            console.log('service img', this.roomService.imagesArray$.getValue());

            this.roomService.addRoomToList(formDataObject);
            console.log('room', this.roomService.roomList$.getValue());
            this.roomService.refreshRoomList$.next(true);
            this.close();
        } else {
            //add room on add resource
            // Add new room to the list
            this.roomService.addRoomToList(formDataObject);
            const image = {
                id: this.formRoom.value.id,
                featuredImage: this.thumbnailFile,
                featuredImageUrl: this.thumbnailUrl,
                gallery: this.galleryFiles,
                galleryUrl: this.galleryUrls
            }

            this.roomService.addImgToImagesArray(image);
            console.log('service img', this.roomService.imagesArray$.getValue());


            // Close Modal
            this.close()
        }

    }

    freeCancellationCheck(event) {
        if (!event.checked) {
            this.formRoom.get('changePolicies').get('freeCancellation.deadlineDays').patchValue(0);
        }
    }

    depositCheck(event) {
        if (!event.checked) {
            this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
            this.formRoom.get('bookingPolicies').get('depositRequiredAmount').patchValue(0);
        }
    }

    advancePaymentCheck(event) {
        if (!event.checked) {
            this.formRoom.get('bookingPolicies').get('advancePartialPaymentPercentage').patchValue(0);
        }
    }

    checkDepositType(type) {
        if (this.formRoom.get('bookingPolicies').get('depositRequired').value) {
            if (type === 'percentage') {
                if (this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').value > 0) {
                    this.formRoom.get('bookingPolicies').get('depositRequiredAmount').patchValue(0);
                    this.formRoom.get('bookingPolicies').get('depositRequiredAmount').disable();
                } else if (this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').value === 0 || !this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.formRoom.get('bookingPolicies').get('depositRequiredAmount').enable();
                }
            } else if (type === 'amount') {
                if (this.formRoom.get('bookingPolicies').get('depositRequiredAmount').value > 0) {
                    this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').patchValue(0);
                    this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').disable();
                } else if (this.formRoom.get('bookingPolicies').get('depositRequiredAmount').value === 0 || !this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').value) {
                    this.formRoom.get('bookingPolicies').get('depositRequiredPercentage').enable();
                }
            }
        }

    }


    /** Update Room */
    updateRoom(formDataObject) {


        if (this.resourceService.resourceId$.getValue()) {
            //check if the room was added now
            if (this.room.roomData.state === 'add') {
                // Get Room List
                const roomList = this.roomService.roomList$.getValue()

                // Find selected room by index
                const selectedRoomIndex = roomList.findIndex(room => room.id === formDataObject.id);

                //the state will be 'add' because this room is going to be added in the end
                formDataObject = {
                    ...formDataObject,
                    state: 'add'
                }

                // Check if the room was found and update
                if (selectedRoomIndex !== -1) {
                    roomList[selectedRoomIndex] = formDataObject;
                    this.roomService.roomList$.next(roomList);
                    console.log(this.roomService.roomList$.getValue());
                    this.roomService.refreshRoomList$.next(true);
                    const image = {
                        id: this.formRoom.value.id,
                        featuredImage: this.thumbnailFile,
                        featuredImageUrl: this.thumbnailUrl,
                        gallery: this.galleryFiles,
                        galleryUrl: this.galleryUrls
                    }


                    const imgArray = this.roomService.imagesArray$.getValue();
                    const imgArrayIndex = imgArray.findIndex(arr => arr.id === formDataObject.id);
                    if (imgArrayIndex !== -1) {
                        imgArray[imgArrayIndex] = image;
                        this.roomService.imagesArray$.next(imgArray);
                    } else {
                        this.roomService.addImgToImagesArray(image);
                    }

                    console.log('service img', this.roomService.imagesArray$.getValue());
                    this.close();
                } else {
                    console.log('Room not found');
                }
            } else {
                //the room was not added now, so you need to change the state to 'update'

                // Get Room List
                const roomList = this.roomService.roomList$.getValue()

                // Find selected room by index
                const selectedRoomIndex = roomList.findIndex(room => room.id === formDataObject.id);

                const urlsArray = formDataObject.images;
                console.log('urls array', urlsArray);

                if (urlsArray) {
                    const notUpload = urlsArray.filter(img => img.state !== 'upload');
                    console.log('fara upload', notUpload);

                    formDataObject = {
                        ...formDataObject,
                        images: notUpload,
                        state: 'update'
                    }
                } else {
                    formDataObject = {
                        ...formDataObject,
                        state: 'update'
                    }
                }


                console.log('OBJ TO SEND', formDataObject);

                // Check if the room was found and update
                if (selectedRoomIndex !== -1) {
                    roomList[selectedRoomIndex] = formDataObject;
                    this.roomService.roomList$.next(roomList);
                    console.log(this.roomService.roomList$.getValue());
                    this.roomService.refreshRoomList$.next(true);

                    const image = {
                        id: this.formRoom.value.id,
                        featuredImage: this.thumbnailFile,
                        featuredImageUrl: this.thumbnailUrl,
                        gallery: this.galleryFiles,
                        galleryUrl: this.galleryUrls
                    }


                    const imgArray = this.roomService.imagesArray$.getValue();
                    const imgArrayIndex = imgArray.findIndex(arr => arr.id === formDataObject.id);
                    if (imgArrayIndex !== -1) {
                        imgArray[imgArrayIndex] = image;
                        this.roomService.imagesArray$.next(imgArray);
                        console.log('value', this.roomService.imagesArray$.getValue());
                    } else {
                        this.roomService.addImgToImagesArray(image);
                        console.log('value', this.roomService.imagesArray$.getValue());
                    }
                    // this.roomService.addImgToImagesArray(image);
                    console.log('service img', this.roomService.imagesArray$.getValue());

                    this.close();
                } else {
                    console.log('Room not found');
                }
            }

        } else {
            //update room on add resource
            // Get Room List
            const roomList = this.roomService.roomList$.getValue()

            // Find selected room by index
            const selectedRoomIndex = roomList.findIndex(room => room.id === formDataObject.id);

            // Check if the room was found and update
            if (selectedRoomIndex !== -1) {
                roomList[selectedRoomIndex] = formDataObject;
                this.roomService.roomList$.next(roomList);
            } else {
                console.log('Room not found');
            }

            // Close Modal
            this.close()
        }

    }


    /** Create Dynamic Form */
    createDynamicForm(formSection) {
        // Loop through from Sections
        for (const section of formSection) {
            // Loop through section attributes
            for (const inputField of section.tabAttributes) {
                // Create form inputs
                this.formRoom.addControl(inputField.name, new FormControl(inputField.attributeValue ? inputField.attributeValue : 'false'));
            }
        }
    }

    //----------------Room Section-------------//
    /** Add A Room */
    addRoom() {
        this.addRoomToForm()
    }

    /** Remove A Room */
    removeRoom() {

        if (this.getItemsForBooking().length === 1) {
            return
        }

        this.removeLastRoomAdded()
    }

    /** Access The Room Form Array Values */
    getItemsForBooking() {
        return this.formRoom.get('itemsForBooking') as FormArray;
    }

    /** Create New From Group For A Room */
    createNewRoom() {
        return new FormGroup({
            itemNumber: new FormControl('', Validators.required)
        })
    }

    /** Add New Room To Form */
    addRoomToForm() {
        this.getItemsForBooking().push(this.createNewRoom());
    }

    /** Remove Last Room Added From Form */
    removeLastRoomAdded() {
        this.getItemsForBooking().removeAt(-1);
    }

    //----------------Bed Type Section-------------//
    /** Add A Room Type */
    addBedType(index) {
        this.getBedTypeArray().at(index).get('quantity').patchValue(this.getBedTypeArray().at(index).get('quantity').value + 1)
    }

    /** Remove A Room Type */
    removeBedType(index) {

        if (this.getBedTypeArray().at(index).get('quantity').value === 0) {
            return
        }

        this.getBedTypeArray().at(index).get('quantity').patchValue(this.getBedTypeArray().at(index).get('quantity').value - 1)
    }

    /** Access The Bet Type Form Array Values */
    getBedTypeArray() {
        return this.formRoom.get('bedType') as FormArray;
    }

    //----------------Facilities-------------//
    /** Filter and create benefits from active facilities */
    facilitiesByCategory() {
        this.resourceService.facilitiesByCategory$.subscribe({
            next: facilities => {


                // Store only the active facility
                this.activeFacilitiesByCategory = facilities.map((item) => {
                    const tabAttributes = item.tabAttributes.filter((attribute) => {
                        return this.resourceService.facilitiesForm$.getValue().value[attribute.name] === "true";
                    });
                    return {
                        categoryZone: item.categoryZone,
                        tabAttributes: [...tabAttributes]
                    };
                });


                // EDIT Mode - Update facilities values
                if (this.room) {
                    this.activeFacilitiesByCategory = this.activeFacilitiesByCategory.map(category => {
                        const tabAttributes = category.tabAttributes.map(tabAttribute => {
                            const matchingAttribute = this.room.roomData.benefits.find(attribute => attribute.attributeId === tabAttribute.id);
                            return {
                                ...tabAttribute,
                                attributeValue: matchingAttribute ? matchingAttribute.attributeValue : null
                            };
                        });
                        return {
                            ...category,
                            tabAttributes
                        };
                    });
                }


                this.createDynamicForm(this.activeFacilitiesByCategory)

            }
        })
    }


    //----------------Photos-------------//
    /** Preview Thumbnail */
    previewThumbs(event) {
        const file = (event.target as HTMLInputElement).files[0];

        this.selectedThumbsNail = (event.target as HTMLInputElement).files[0];

        // File Preview
        const reader = new FileReader();

        reader.onload = () => {
            this.selectedThumbnailUrl.filePath = reader.result as string;
        }
        reader.readAsDataURL(file)

        // Reset selected input
        event.target.value = null
    }

    /** Clear Thumbnail */
    clearThumb() {
        this.selectedThumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        }
        this.selectedThumbsNail = undefined
    }

    /** Preview Gallery */
    previewGallery(event) {

        if (event.target.files && event.target.files[0]) {
            this.selectedGalleryImages = event.target.files
            const filesAmount = event.target.files.length;

            // Preview Images
            for (let i = 0; i < filesAmount; i++) {
                const reader = new FileReader();

                reader.onload = (event) => {
                    this.selectedGalleryImagesUrl.push({
                        fileName: undefined,
                        filePath: event.target.result
                    });
                }

                reader.readAsDataURL(event.target.files[i]);
            }

            // Reset selected input
            event.target.value = null

        }


    }

    /** Clear Gallery list */
    clearGalleryImg(index) {
        this.selectedGalleryImagesUrl.splice(index, 1)
    }

    //----------------Modal-------------//
    /** Close Dialog */
    close(): void {
        this.dialogRef.close();
    }


    //----------------------------- IMAGES---------------------------
    onThumbnailChange(event) {
        if (event.target.files && event.target.files[0]) {
            this.thumbnailUrl.fileName = event.target.files[0].name;
            this.thumbnailFile = event.target.files[0];

            const reader = new FileReader();
            reader.onload = () => this.thumbnailUrl.filePath = reader.result;
            reader.readAsDataURL(this.thumbnailFile);
        }
        console.log('thumbNail', this.thumbnailUrl);
        console.log('thumbNail', this.thumbnailFile);
    }

    removeThumbnail() {
        this.thumbnailUrl = {
            fileName: undefined,
            filePath: undefined
        };
        this.thumbnailFile = undefined;
        this.room.roomData.featuredImage = {
            fileName: null,
            filePath: null
        };
        this.formRoom.get('featuredImage').patchValue({
            fileName: null,
            filePath: null
        });
    }

    onImageChange(event, inputRef: HTMLInputElement) {
        if (this.galleryUrls === null) {
            this.galleryUrls = [];
        }
        if (this.resourceService.resourceId$.getValue()) {
            console.log('edit resursa');
            if (event.target.files && event.target.files[0]) {
                const arrayLength = event.target.files.length;
                const filesArrayLength = this.galleryFiles.length;
                //if the room was already added and gallery has images
                if (this.galleryUrls.length > 0) {
                    const newUrlLength = this.galleryUrls.length;
                    for (let i = 0; i < arrayLength; i++) {
                        this.galleryUrls.push({
                            fileName: event.target.files[i].name,
                            filePath: undefined,
                            state: 'upload'
                        });
                        this.galleryFiles.push({
                            file: event.target.files[i],
                            state: 'upload'
                        });


                        const reader = new FileReader();
                        reader.onload = () => {
                            this.galleryUrls[newUrlLength + i].filePath = reader.result;
                            inputRef.value = null;

                        };
                        // reader.readAsDataURL(this.galleryFiles[this.galleryFiles.length - 1]);
                        reader.readAsDataURL(this.galleryFiles[filesArrayLength + i].file);
                    }
                } else {
                    //if the gallery is empty
                    for (let i = 0; i < arrayLength; i++) {
                        this.galleryUrls.push({
                            fileName: event.target.files[i].name,
                            filePath: undefined,
                            state: 'upload'
                        });
                        this.galleryFiles.push({
                            file: event.target.files[i],
                            state: 'upload'
                        });


                        const reader = new FileReader();
                        reader.onload = () => {
                            this.galleryUrls[i].filePath = reader.result;
                            inputRef.value = null;

                        };
                        // reader.readAsDataURL(this.galleryFiles[this.galleryFiles.length - 1]);
                        reader.readAsDataURL(this.galleryFiles[i].file);
                    }
                }

            }
        } else {
            console.log('add resursa');
            if (event.target.files && event.target.files[0]) {
                const arrayLength = event.target.files.length;
                //if the room was already added and gallery has images
                if (this.galleryUrls.length > 0) {
                    const newUrlLength = this.galleryUrls.length;
                    for (let i = 0; i < arrayLength; i++) {
                        this.galleryUrls.push({
                            fileName: event.target.files[i].name,
                            filePath: undefined
                        });
                        this.galleryFiles.push(event.target.files[i]);


                        const reader = new FileReader();
                        reader.onload = () => {
                            this.galleryUrls[newUrlLength + i].filePath = reader.result;
                            inputRef.value = null;

                        };
                        reader.readAsDataURL(this.galleryFiles[this.galleryFiles.length - 1]);
                    }
                } else {
                    //if the gallery is empty
                    for (let i = 0; i < arrayLength; i++) {
                        this.galleryUrls.push({
                            fileName: event.target.files[i].name,
                            filePath: undefined
                        });
                        this.galleryFiles.push(event.target.files[i]);


                        const reader = new FileReader();
                        reader.onload = () => {
                            this.galleryUrls[i].filePath = reader.result;
                            inputRef.value = null;

                        };
                        // reader.readAsDataURL(this.galleryFiles[this.galleryFiles.length - 1]);
                        reader.readAsDataURL(this.galleryFiles[i]);
                    }
                }


            }
        }
    }

    removeImage(index: number) {

        console.log('urls dupa remove', this.galleryUrls);

        if (this.resourceService.resourceId$.getValue() && this.room.roomData.images.length > 0) {
            this.room.roomData.images.splice(index, 1);
        } else {

            this.galleryUrls.splice(index, 1);
            this.galleryFiles.splice(index, 1);
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
