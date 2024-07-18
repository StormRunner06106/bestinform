import {Component, OnDestroy, OnInit} from '@angular/core';
import {StepperService} from "../../../../../_services/stepper.service";
import {AddEditTicketComponent} from "../ticket-booking/add-edit-ticket/add-edit-ticket.component";
import {MatDialog} from "@angular/material/dialog";
import {AddEditProductComponent} from "./add-edit-product/add-edit-product.component";
import {DeleteTicketComponent} from "../ticket-booking/delete-ticket/delete-ticket.component";
import {ResourcesService} from "../../../../../_services/resources.service";
import {ProductListService} from "../../../../../_services/product-list.service";
import {DeleteProductModalComponent} from "./delete-product-modal/delete-product-modal.component";
import {FormGroup} from "@angular/forms";
import {BehaviorSubject, forkJoin, Observable, Subscription} from "rxjs";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {UserDataService} from "../../../../../../../shared/_services/userData.service";
import {RentalBookingService} from "../../../../../_services/rental-booking.service";
import {TicketsBookingService} from "../../../../../_services/tickets-booking.service";
import {TimepickerService} from "../../../../../_services/timepicker.service";
import {BookingTimeslotsService} from "../../../../../_services/booking-timeslots.service";
import {ToastService} from "../../../../../../../shared/_services/toast.service";
import {CreateResourceService} from "../../../../../../../shared/_services/createResource.service";
import {SystemSettingsService} from "../../../../../../../shared/_services/system-settings.service";
import {MenuService} from "../../../../../_services/menu.service";
import {CulturalBookingService} from "../../../../../_services/cultural-booking.service";

@Component({
    selector: 'app-products-list',
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit, OnDestroy {

    dataLoaded = false;
    productList = [];

    //for save resource
    isAdmin: boolean;
    isProvider: boolean;
    isStaff: boolean;

    resourceId: string;
    roomsArray: any;
    currentBookingType: string;

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isSubmitLoading: boolean;
    private unsubscribe: Subscription[] = [];

    $fileObservables: Observable<object>[] = [];
    private routeSub: any;

    constructor(public dialog: MatDialog,
                private stepperService: StepperService,
                private resourceService: ResourcesService,
                private productService: ProductListService, private userService: UserDataService,
                private route: ActivatedRoute,
                private router: Router,
                private roomService: RentalBookingService,
                private ticketService: TicketsBookingService,
                private timepickerService: TimepickerService,
                private timeslotService: BookingTimeslotsService,
                private toastService: ToastService,
                private createResourceService: CreateResourceService,
                private systemSettings: SystemSettingsService,
                private menuService: MenuService,
                private culturalBookingService: CulturalBookingService) {
        const loadingSubscr = this.isSubmitLoading$
            .asObservable()
            .subscribe((res) => (this.isSubmitLoading = res));
        this.unsubscribe.push(loadingSubscr);
    }

    ngOnInit() {
        this.resourceId = this.resourceService.resourceId$.getValue();

        if (this.resourceId) {
            this.productService.getProductsByResourceId(this.resourceId)
                .subscribe({
                    next: (productList: any) => {
                        if (this.productService.productsList$.getValue().length === 0) {
                            this.productService.productsList$.next(productList);
                            this.productList = productList;
                        } else {
                            this.productList = this.productService.productsList$.getValue();
                        }
                    }
                })
        }

        this.productService.refreshProductListData().subscribe({
            next: () => {
                if (this.resourceId) {
                    this.productList = this.productService.productsList$.getValue();
                } else {
                    this.productService.productListData().subscribe({
                        next: productList => {
                            this.productList = productList;
                        }
                    })
                }
            }
        })

        //for save resource
        if (this.resourceService.resourceId$.getValue()) {
            this.resourceId = this.resourceService.resourceId$.getValue();
        }

        this.currentBookingType = this.resourceService.resourceTemplateData$.getValue().bookingType;

        this.userService.getCurrentUser().subscribe((response: any) => {
            if (response.roles.includes('ROLE_PROVIDER')) {
                this.isProvider = true;
            }

            if (response.roles.includes('ROLE_STAFF')) {
                this.isStaff = true;
            }

            if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                this.isAdmin = true;
            }
        });

        /*this.routeSub = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                // save your data
                console.log('AM PLECAT PA PA');
                this.clearFields();
            }
        });*/


        console.log('LIST', this.productService.productsList$.getValue())
    }

    openAddModal() {
        this.dialog.open(AddEditProductComponent, {
            width: '1500px',
            height: '750px',
            disableClose: true,
            data: undefined
        });
    }

    openEditModal(product) {
        this.dialog.open(AddEditProductComponent, {
            width: '1500px',
            height: '750px',
            disableClose: true,
            data: {
                product: product
            }
        });
    }

    openDeleteModal(product, index) {
        this.dialog.open(DeleteProductModalComponent, {
            width: '720px',
            height: '400px',
            disableClose: true,
            data: {
                product: product,
                index: index
            }
        });
    }


    /** Go to next step*/
    nextStep() {
        this.stepperService.nextStep(true)
    }

    /** Go to previous step*/
    prevStep() {
        this.stepperService.prevStep()
    }

    //for save resource
    clearFields() {
        // this.stepperService.step$.next(undefined);
        this.stepperService.stepperStage$.next(undefined);

        this.resourceService.resourceId$.next(undefined);
        this.resourceService.resourceTemplateData$.next(undefined);
        this.resourceService.resourceTemplateType$.next(undefined);
        this.resourceService.attributesFromResourceTemplate$.next(undefined);
        this.resourceService.generalInformationForm$.next(new FormGroup({}));
        this.resourceService.facilitiesForm$.next(new FormGroup({}));
        this.resourceService.filesForm$.next(new FormGroup({}));
        this.resourceService.facilitiesByCategory$.next([]);
        this.resourceService.resourceData.next({
            featuredImage: undefined,
            images: [],
            videos: [],
            restaurant: undefined
        });
        this.resourceService.accommodationPolicy$.next(undefined);
        this.roomService.refreshRoomList$.next(false);
        this.roomService.roomList$.next([]);
        this.roomService.imagesArray$.next([]);
        this.resourceService.travelId$.next(undefined);

        this.ticketService.updateArray$.next([]);
        this.ticketService.refreshUpdateArray$.next(false);
        this.ticketService.createArray$.next([]);
        this.ticketService.refreshCreateArray$.next(false);
        this.ticketService.ticketsList$.next([]);
        this.ticketService.refreshTicketList$.next(false);
        this.ticketService.deleteArray$.next([]);

        this.culturalBookingService.culturalRoom$.next(null);

        this.timepickerService.timepickerList$.next([]);
        this.timepickerService.timetableList$.next([]);
        this.timepickerService.timepickerId$.next(undefined);
        this.timepickerService.timePicker$.next(undefined);
        this.timepickerService.changePolicies$.next(undefined);
        this.timepickerService.bookingPolicies$.next(undefined);

        this.resourceService.externalUrl$.next(undefined);

        this.productService.productsList$.next([]);
        this.productService.refreshProductList$.next(false);
        this.productService.deleteProdList$.next([]);

        this.timeslotService.serviceList$.next([]);
        this.timeslotService.refreshServiceList$.next(false);

        this.createResourceService.providerData$.next(undefined);

        this.resourceService.setupListener$.next(undefined);
        this.resourceService.generalInfoListener$.next(undefined);
        this.resourceService.policyRentalListener$.next(undefined);
        this.resourceService.policyMenuListener$.next(undefined);
        this.resourceService.policyListener$.next(undefined);
        this.resourceService.settingsTripsItineraries$.next([]);
        this.resourceService.tripsItinerariesObject$.next({});

        this.menuService.refreshMenuList$.next(false);
        this.menuService.menuList$.next([]);
        this.menuService.menuId$.next(undefined);
    }


    saveResource() {
        this.isSubmitLoading = true;
        this.roomsArray = this.roomService.roomList$.getValue();

        const combineForms: any = new FormGroup({
            ...this.resourceService.generalInformationForm$.getValue().controls,
            ...this.resourceService.facilitiesForm$.getValue().controls,
            ...this.resourceService.filesForm$.getValue().controls
        })

        console.log('FILES FORM', this.resourceService.filesForm$.getValue())

        console.log('Form-uri combinate', combineForms.value)
        console.log('Atribute', this.resourceService.attributesFromResourceTemplate$.getValue())
        console.log('Form-uri combinate 2', this.resourceService.resourceTemplateData$.getValue());
        console.log('Form-uri combinate 3', this.resourceService.resourceTemplateType$.getValue());


        // Empty array
        const formData = [];

        // Sort form inputs by tabName
        for (const control in combineForms.controls) {
            this.resourceService.attributesFromResourceTemplate$.getValue().forEach((section) => {
                section.tabAttributes.forEach(attribute => {
                    if (attribute.name === control) {
                        if (attribute.valueType === 'multiple-select') {
                            console.log('ATTR SENT', attribute, combineForms.get(control).value)
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: Array.isArray(combineForms.get(control).value) ? combineForms.get(control).value.join() : combineForms.get(control).value,
                                attributeIconPath: attribute.icon.filePath
                            });
                        } else {
                            formData.push({
                                tabName: section.tabName,
                                attributeName: control,
                                attributeId: attribute.id,
                                attributeValue: combineForms.get(control).value,
                                attributeIconPath: attribute.icon.filePath
                            });
                        }

                    }
                });
            });
        }

        console.log('FORM DATA', formData);
        const attributes = formData.reduce((acc, item) => {
            const index = acc.findIndex(x => x.tabName === item.tabName);
            if (index !== -1) {
                acc[index].tabAttributes.push({
                    attributeId: item.attributeId,
                    attributeValue: item.attributeValue
                });
            } else {
                acc.push({
                    tabName: item.tabName,
                    tabAttributes: [{
                        attributeId: item.attributeId,
                        attributeValue: item.attributeValue
                    }]
                });
            }
            return acc;
        }, []);

        console.log('sa ne uitam aici', this.resourceService.resourceTemplateData$.getValue());

        // Formatted Form Object
        const formObject = {
            title: combineForms.value.title,
            description: combineForms.value.description,
            address: combineForms.value.address,
            country: combineForms.value.country,
            city: combineForms.value.city,
            slug: this.resourceService.resourceId$.getValue() ? '' : combineForms.value.title,
            featuredImage: combineForms.value.thumbnail,
            images: this.resourceService.resourceData.getValue().images,
            videos: this.resourceService.resourceData.getValue().videos !== null ? this.resourceService.resourceData.getValue().videos : [],
            geographicalCoordinates: {
                latitude: combineForms.value.latitude,
                longitude: combineForms.value.longitude
            },
            attributes: attributes,
            categoryId: this.resourceService.resourceTemplateType$.getValue().categoryId,
            domain: this.resourceService.resourceTemplateType$.getValue().domain,
            resourceTypeId: this.resourceService.resourceTemplateType$.getValue().resourceTypeId,
            bookingType: this.resourceService.resourceTemplateData$.getValue().bookingType,
            timetable: this.timepickerService.timetableList$.getValue().length > 0 ? this.timepickerService.timetableList$.getValue() : (!this.resourceService.resourceTemplateData$.getValue().timetable ? [] : this.resourceService.resourceTemplateData$.getValue().timetable),
            policy: this.resourceService.accommodationPolicy$.getValue() ? (Object.keys(this.resourceService.accommodationPolicy$.getValue()).length === 0 ? this.resourceService.resourceTemplateData$.getValue().policy : {accommodationPolicy: this.resourceService.accommodationPolicy$.getValue()}) : this.resourceService.resourceTemplateData$.getValue().policy,
            externalUrl: this.resourceService.externalUrl$.getValue(),
            sharedExperience: combineForms.value.sharedExperience,
            forItinerary: combineForms.value.forItinerary
        }


        console.log('FORM OBJ', formObject);

        if (this.resourceService.resourceId$.getValue()) {
            this.updateResource(formObject, combineForms);
            //added for policies check on menu
            // if (this.currentBookingType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
            //     if ((this.timepickerService.changePolicies$.getValue().nonRefundable ||
            //             this.timepickerService.changePolicies$.getValue().modifiable ||
            //             (this.timepickerService.changePolicies$.getValue().freeCancellation.freeCancellation &&
            //                 this.timepickerService.changePolicies$.getValue().freeCancellation.deadlineDays > 0)) &&
            //         (this.timepickerService.bookingPolicies$.getValue().depositRequired && this.timepickerService.bookingPolicies$.getValue().depositRequiredAmount > 0) ) {
            //         this.updateResource(formObject, combineForms);
            //     } else {
            //         this.toastService.showToast('Eroare', 'Nu ai completat politicile de modificare și rezervare!', 'error');
            //         this.isSubmitLoading$.next(false);
            //     }
            //     //if not menu, everything works like before
            // } else {
            //     this.updateResource(formObject, combineForms);
            // }

        }
    }

    updateResource(formObject: object, combineForms: any) {
        this.resourceService.updateResource(this.resourceService.resourceId$.getValue(), formObject).subscribe({
            next: (data: any) => {
                console.log(data);
                // console.log('IMAGINE', combineForms.value.thumbnail);
                // console.log('IMAGINE', this.resourceService.resourceData.getValue().featuredImage);
                // console.log('cond', combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)
                if (combineForms.value.thumbnail && (combineForms.value.thumbnail !== this.resourceService.resourceData.getValue().featuredImage)) {
                    const thumbnailData = new FormData();
                    thumbnailData.append('file', combineForms.value.thumbnail);
                    this.$fileObservables.push(this.resourceService.uploadResourceImage(this.resourceService.resourceId$.getValue(), thumbnailData));
                }

                if (combineForms.value.images?.length > 0) {
                    const newImages = combineForms.value.images.filter(x => this.resourceService.resourceData.getValue().images.indexOf(x) === -1);
                    console.log('Diferenta arrays', newImages);

                    if (newImages.length > 0) {
                        const imagesData = new FormData();
                        newImages.forEach(galleryFile => {
                            imagesData.append('files', galleryFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'image', imagesData));
                    }
                }


                if (combineForms.value.videos?.length > 0) {
                    const newVideos = combineForms.value.videos.filter(x => this.resourceService.resourceData.getValue().videos.indexOf(x) === -1);
                    console.log('Diferenta arrays', newVideos);


                    if (newVideos.length > 0) {
                        const videosData = new FormData();
                        newVideos.forEach(videoFile => {
                            videosData.append('files', videoFile);
                        });
                        this.$fileObservables.push(this.resourceService.uploadDocAttachements(this.resourceService.resourceId$.getValue(), 'video', videosData));
                    }
                }

                if (data.success) {


                    if (this.ticketService.createArray$.getValue().length > 0) {
                        // Create new tickets
                        this.$fileObservables.push(this.ticketService.createTickets(this.resourceId, this.ticketService.createArray$.getValue()));
                        // this.ticketService.createTickets(this.currentResourceId, this.ticketService.createArray$.getValue()).subscribe({
                        //     next: (tickets: { success: boolean, reason: string }) => {
                        //         if (tickets.success) {
                        //             // console.log('SE ADAUGA TICKETELE PUSE PE UPDATE', tickets);
                        //             this.ticketService.createArray$.next([]);
                        //             console.log(this.ticketService.createArray$.getValue());
                        //         }
                        //     }
                        // })
                    } else {
                        console.log('n-am in create');
                    }


                    if (this.ticketService.updateArray$.getValue().length > 0) {
                        console.log('am in update');
                        //Update tickets
                        const updateArray = this.ticketService.updateArray$.getValue();
                        updateArray.forEach(ticket => {
                            this.$fileObservables.push(this.ticketService.updateTicket(ticket.id, ticket));
                            // this.ticketService.updateTicket(ticket.id, ticket).subscribe({
                            //     next: (tickets: { success: boolean, reason: string }) => {
                            //         if (tickets.success) {
                            //             // console.log('SE FACE UPDATE LA TICKETS PE UPDATE', tickets);
                            //             this.ticketService.updateArray$.next([]);
                            //         }
                            //     }
                            // })
                        })
                    } else {
                        console.log('n-am in update');
                    }


                    if (this.ticketService.deleteArray$.getValue().length > 0) {
                        //Delete tickets
                        const deleteArray = this.ticketService.deleteArray$.getValue();
                        deleteArray.forEach(ticket => {
                            // console.log('ticket de sters', ticket)
                            this.$fileObservables.push(this.ticketService.deleteTicket(ticket.id));
                            // this.ticketService.deleteTicket(ticket.id).subscribe({
                            //     next: (tickets: { success: boolean, reason: string }) => {
                            //         if (tickets.success) {
                            //             console.log('SE FACE DELETE LA TICKETS PE UPDATE', tickets);
                            //             this.ticketService.deleteArray$.next([]);
                            //         }
                            //     },
                            //     error: err => {
                            //         console.log(err);
                            //     }
                            //
                            // })
                        })

                    }

                    if (this.productService.productsList$.getValue().length > 0) {
                        const prodArray = this.productService.productsList$.getValue();
                        prodArray.forEach(product => {
                            if (product.state === 'add') {
                                this.productService.createProduct(this.resourceId, product).subscribe({
                                    next: (respAdd: { success: boolean, reason: string }) => {
                                        if (respAdd) {
                                            const imagArray = this.productService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (product.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                    if (imageObj.imageFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('images', imageObj.imageFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }, error: (error) => {
                                                                if (error.error.reason === 'fileSizeTooBig') {
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if (error.error.reason === 'wrongExtension') {
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                } else {
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.productService.imagesArray$.next([]);
                                                }
                                            })

                                            const attachArray = this.productService.attachmentArray$.getValue();
                                            attachArray.forEach(attach => {
                                                console.log('ATTACHMENT', attach)
                                                if (product.id === attach.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                    if (attach.attachmentFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', attach.attachmentFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadAttachmentForProduct(respAdd.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('attachment uploadat', thumb);
                                                            },error: (error)=>{
                                                                if(error.error.reason === 'fileSizeTooBig'){
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if(error.error.reason === 'wrongExtension'){
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                }else{
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }


                                                        })
                                                    }

                                                    this.productService.attachmentArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else if (product.state === 'update') {
                                this.productService.updateProduct(product.id, product).subscribe({
                                    next: (respUpdate: { success: boolean, reason: string }) => {
                                        console.log('update prod', respUpdate);
                                        if (respUpdate) {
                                            const imagArray = this.productService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (product.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                    if (imageObj.imageFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('images', imageObj.imageFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadImageForProduct(product.id, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }, error: (error) => {
                                                                if (error.error.reason === 'fileSizeTooBig') {
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if (error.error.reason === 'wrongExtension') {
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                } else {
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                                }
                                                            }
                                                        })
                                                    }

                                                    this.productService.imagesArray$.next([]);
                                                }
                                            })

                                            const attachArray = this.productService.attachmentArray$.getValue();
                                            attachArray.forEach(attach => {
                                                console.log('ATTACHMENT', attach)
                                                if (product.id === attach.id) {
                                                    console.log('imaginea cu id-ul ' + product.id + ' va avea astea', attach);
                                                    if (attach.attachmentFile !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', attach.attachmentFile);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.productService.uploadAttachmentForProduct(product.id, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('attachment uploadat', thumb);
                                                            },error: (error)=>{
                                                                if(error.error.reason === 'fileSizeTooBig'){
                                                                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                                } else if(error.error.reason === 'wrongExtension'){
                                                                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                                }else{
                                                                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea atasamentului!", "error");
                                                                }
                                                            }


                                                        })
                                                    }

                                                    this.productService.attachmentArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }

                    //product list
                    if (this.productService.deleteProdList$.getValue().length > 0) {
                        const deleteProdArray = this.productService.deleteProdList$.getValue();
                        deleteProdArray.forEach(product => {
                            this.productService.deleteProduct(product.id).subscribe({
                                next: (respAdd: { success: boolean, reason: string }) => {
                                    if (respAdd) {
                                        const imagArray = this.productService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (product.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + product.id + ' va avea astea', imageObj);
                                                if (imageObj.imageFile !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('images', imageObj.imageFile);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                    this.productService.uploadImageForProduct(respAdd.reason, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        }, error: (error) => {
                                                            if (error.error.reason === 'fileSizeTooBig') {
                                                                this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                                                            } else if (error.error.reason === 'wrongExtension') {
                                                                this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");
                                                            } else {
                                                                this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                                                            }
                                                        }
                                                    })
                                                }

                                                this.productService.imagesArray$.next([]);
                                            }
                                        })


                                    }
                                }
                            });
                        })
                    }


                    //service time slot
                    if (this.timeslotService.serviceList$.getValue().length > 0) {
                        const serviceArray = this.timeslotService.serviceList$.getValue();
                        serviceArray.forEach(service => {
                            if (service.state === 'add') {
                                this.$fileObservables.push(this.timeslotService.createService(this.resourceId, service))
                            } else if (service.state === 'update') {
                                this.$fileObservables.push(this.timeslotService.updateServiceByServiceId(service.id, service));
                            }
                        })
                    }

                    if (this.timeslotService.deleteServiceList$.getValue().length > 0) {
                        const deleteServArray = this.timeslotService.deleteServiceList$.getValue();
                        deleteServArray.forEach(service => {
                            this.$fileObservables.push(this.timeslotService.deleteService(service.id));
                        })
                    }

                    //rental-booking
                    if (this.roomsArray.length > 0) {
                        this.roomsArray.forEach(room => {
                            if (room.state === 'add') {
                                this.roomService.createRoom(this.resourceService.resourceId$.getValue(), room).subscribe({
                                    next: (resp: { success: boolean, reason: string }) => {
                                        // console.log('adaugare camera pe edit resursa', resp);
                                        if (resp.success) {
                                            const imagArray = this.roomService.imagesArray$.getValue();
                                            console.log('array', imagArray);
                                            imagArray.forEach(imageObj => {
                                                if (room.id === imageObj.id) {
                                                    console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                    if (imageObj.featuredImage !== undefined) {
                                                        const thumbnailData = new FormData();
                                                        thumbnailData.append('file', imageObj.featuredImage);
                                                        console.log('thumb data', thumbnailData);

                                                        // this.$fileObservables.push( this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData));
                                                        this.roomService.uploadRoomThumbnail(resp.reason, thumbnailData).subscribe({
                                                            next: thumb => {
                                                                console.log('thumbnail uploadat', thumb);
                                                            }
                                                        })
                                                    }

                                                    if (imageObj.gallery.length > 0) {
                                                        const imagesData = new FormData();
                                                        imageObj.gallery.forEach(galleryFile => {
                                                            if (galleryFile.state === 'upload') {
                                                                imagesData.append('images', galleryFile.file);
                                                            }

                                                        });

                                                        // this.$fileObservables.push(this.roomService.uploadRoomGallery(resp.reason, imagesData));
                                                        this.roomService.uploadRoomGallery(resp.reason, imagesData).subscribe({
                                                            next: gallery => {
                                                                console.log('galerie uploadata', gallery);
                                                            }
                                                        })
                                                    }

                                                    this.roomService.imagesArray$.next([]);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else if (room.state === 'update') {

                                this.roomService.updateRoom(room.id, room).subscribe({
                                    next: (resp: { success: boolean, reason: string }) => {
                                        // console.log('editare camera pe edit resursa', resp);
                                        const imagArray = this.roomService.imagesArray$.getValue();
                                        console.log('array', imagArray);
                                        imagArray.forEach(imageObj => {
                                            if (room.id === imageObj.id) {
                                                console.log('imaginea cu id-ul ' + room.id + ' va avea astea', imageObj);
                                                if (imageObj.featuredImage !== undefined) {
                                                    const thumbnailData = new FormData();
                                                    thumbnailData.append('file', imageObj.featuredImage);
                                                    console.log('thumb data', thumbnailData);

                                                    // this.$fileObservables.push(this.roomService.uploadRoomThumbnail(room.id, thumbnailData));
                                                    this.roomService.uploadRoomThumbnail(room.id, thumbnailData).subscribe({
                                                        next: thumb => {
                                                            console.log('thumbnail uploadat', thumb);
                                                        }
                                                    })
                                                }

                                                if (imageObj.gallery.length > 0) {
                                                    console.log('inainte de gall', imageObj.gallery);
                                                    const imagesData = new FormData();
                                                    imageObj.gallery.forEach(galleryFile => {
                                                        if (galleryFile.state === 'upload') {
                                                            imagesData.append('images', galleryFile.file);
                                                        }

                                                    });

                                                    // this.$fileObservables.push( this.roomService.uploadRoomGallery(room.id, imagesData));
                                                    this.roomService.uploadRoomGallery(room.id, imagesData).subscribe({
                                                        next: gallery => {
                                                            console.log('galerie uploadata', gallery);
                                                        }
                                                    })
                                                }

                                                this.roomService.imagesArray$.next([]);
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }

                    if (this.roomService.deleteArray$.getValue().length > 0) {
                        const deleteRooms = this.roomService.deleteArray$.getValue();
                        deleteRooms.forEach(room => {
                            this.$fileObservables.push(this.roomService.deleteRoom(room.id));
                            // this.roomService.deleteRoom(room.id).subscribe({
                            //     next: (resp: { success: boolean, reason: string }) => {
                            //         console.log('stergere camera', resp);
                            //         if (resp.success) {
                            //             this.roomService.deleteArray$.next([]);
                            //         }
                            //     }
                            // })
                        })
                    }

                    // cultural booking
                    if (this.currentBookingType === 'culturalBooking' && this.culturalBookingService.culturalRoom$.getValue()) {
                        const modifiedCulturalRoom = this.culturalBookingService.culturalRoom$.getValue();
                        this.$fileObservables.push(this.culturalBookingService.updateCulturalRoom(modifiedCulturalRoom.id, modifiedCulturalRoom));
                    }

                    //menu-booking
                    if (this.currentBookingType === 'menu' && this.timepickerService.timepickerId$.getValue()) {
                        console.log('TIMEPICKER', this.timepickerService.timePicker$.getValue());
                        const timePicker = {
                            timetables: this.timepickerService.getFreeEntry() ? [] : this.timepickerService.timePicker$.getValue().timetables,
                            changePolicies: this.timepickerService.changePolicies$.getValue(),
                            bookingPolicies: this.timepickerService.bookingPolicies$.getValue(),
                            ignoreAvailability: this.timepickerService.getFreeEntry()
                        }
                        console.log('TIMEPICKER', this.timepickerService.timePicker$.getValue());

                        this.$fileObservables.push(this.timepickerService.updateTimepicker(this.timepickerService.timepickerId$.getValue(), timePicker));

                        console.log('TIME PICKER ON', timePicker)

                        //to check
                        // if(this.timepickerService.timepickerId$.getValue()){
                        //     this.$fileObservables.push(this.timepickerService.updateTimepicker(this.timepickerService.timepickerId$.getValue(), this.timepickerService.timePicker$.getValue()));
                        //
                        // }else{
                        //     this.$fileObservables.push(this.timepickerService.createTimepicker(this.resourceId, this.timepickerService.timePicker$.getValue()));
                        // }


                    }

                    //menu
                    if (this.currentBookingType === 'menu') {
                        console.log('menuList', this.menuService.menuList$.getValue());
                        console.log('menu id', this.resourceService.resourceTemplateData$.getValue().menuId);
                        console.log('menu id', this.menuService.menuId$.getValue());
                        if (this.menuService.menuId$.getValue() && this.menuService.menuList$.getValue().length > 0) {

                            this.$fileObservables.push(this.menuService.updateMenu(this.menuService.menuId$.getValue(), this.menuService.menuList$.getValue()));
                        } else {
                            if (this.menuService.menuList$.getValue().length > 0) {
                                this.$fileObservables.push(this.menuService.createMenu(this.resourceId, this.menuService.menuList$.getValue()));
                            }
                        }

                    }


                }

                if (this.$fileObservables.length > 0) {
                    forkJoin(...this.$fileObservables).subscribe((forkRes: any) => {
                        this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                        setTimeout(() => {
                            if (this.isProvider) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                            } else if (this.isStaff) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                            } else if (this.isAdmin) {
                                this.isSubmitLoading$.next(false);
                                this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                            }
                        }, 3000);
                    });
                } else {
                    this.toastService.showToast('succes', 'Resursa a fost actualizată cu succes', 'success');
                    setTimeout(() => {
                        if (this.isProvider) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/provider/resources/my-list'], {state: {submit: true}});
                        } else if (this.isStaff) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/staff/resources/list'], {state: {submit: true}});
                        } else if (this.isAdmin) {
                            this.isSubmitLoading$.next(false);
                            this.router.navigate(['/private/admin/resources/list'], {state: {submit: true}});
                        }
                    }, 3000);
                }

            },
            error: (error) => {
                this.toastService.showToast('Eroare', 'A aparut o problema tehnica!', 'error');
                this.isSubmitLoading$.next(false);
                console.log(error)
            }
        })

    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe();
    }

}
