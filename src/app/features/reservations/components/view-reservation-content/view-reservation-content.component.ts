import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject, takeUntil} from 'rxjs';
import {Reservation} from 'src/app/shared/_models/reservation.model';
import {Resource} from 'src/app/shared/_models/resource.model';
import {User} from 'src/app/shared/_models/user.model';
import {ModalService} from 'src/app/shared/_services/modals.service';
import {ReservationsService} from 'src/app/shared/_services/reservations.service';
import {ResourcesService} from 'src/app/shared/_services/resources.service';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {CancelReservationModalComponent} from '../../cancel-reservation-modal/cancel-reservation-modal.component';
import {NgxQrcodeErrorCorrectionLevels} from '@techiediaries/ngx-qrcode';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {
    EditReservationModalComponent
} from "../../../../standalone-components/edit-reservation-modal/edit-reservation-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {SmartBillService} from "../../../../shared/_services/smartbill.service";
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-view-reservation-content',
    templateUrl: './view-reservation-content.component.html',
    styleUrls: ['./view-reservation-content.component.scss'],
})
export class ViewReservationContentComponent implements OnInit, OnDestroy {
    @Input() reservationId: string;

    correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
    // value = 'https://www.techiediaries.com/';

    //qr-code
    reservationLink: string;

    defaultImagePath = "./../../../../assets/images/others/banner-default-min.jpg";

    reservation: any;
    isFlight = false;
    // pt rental booking
    reservationIsModifiable = true;

    //client Data
    clientId: string;
    client: User;

    //the role of logged in user
    userRole: any;

    //check reservation provider
    userId: string;
    providerId?: string
    provider: User;

    //resource data
    resourceId: string;
    resource: Resource;
    status = 'Pending';
    // reservationId:string;
    isDisabled: boolean;

    //conversation id for chat
    conversationId: string;

    public featuredImage: string = "";
    //qr code
    title = 'app';
    elementType = 'url';
    value = 'o valoare random';
    private ngUnsubscribe = new Subject<void>();

    // Mat Table - Filter Forms
    messageToSend: FormControl = new FormControl('');

    flightTickets: [];



    constructor(
        private ngbModalService: NgbModal,
        private modalService: ModalService,
        private userService: UserDataService,
        private resourcesServices: ResourcesService,
        private reservationsService: ReservationsService,
        private router: Router,
        private toastService: ToastService,
        private matDialog: MatDialog,
        private smartBillService: SmartBillService,
        private cdr: ChangeDetectorRef,

    ) {
    }

    ngOnInit(): void {
        console.log('reservation id recieved', this.reservationId)
        this.getData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('reservationId' in changes) {
            console.log('Reservation ID changed in child component:', this.reservationId);
            this.getData();
        }
    }

    formatReservationTime(timeArray: any): Date {
        if (timeArray && Array.isArray(timeArray) && timeArray.length === 7) {
            // Create a Date object from the array components
            return new Date(timeArray[0], timeArray[1] - 1, timeArray[2], timeArray[3], timeArray[4], timeArray[5], timeArray[6]);
        }
        return null;
    }

    initQrCode() {
        this.value = this.reservationLink;
    }

    downloadBill() {
        const billData = {"number": this.reservation.bill.number, "series": this.reservation.bill.series}
        console.log(billData)
        this.smartBillService.viewBill(billData).subscribe((data: Blob) => {

        const downloadURL = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = "Factura "+ billData.series + billData.number + ".pdf";
        link.click();

        });

    }

    changeValidityStatus(status, reservationId) {
        // console.log("schimba statusul", status, reservationId);
        this.reservationsService.changeValidityStatus(status, reservationId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    console.log(res);
                    this.toastService.showToast("Succes", "Statusul valabilitatii a fost schimbat!", "success");
                    this.getData();
                    this.modalService.triggerUserListChanges(true);
                }, error(err) {
                    this.toastService.showToast("Eroare", "Statusul valabilitatii a fost schimbat!", "error");
                    console.log('EROARE', err);
                },
            });
    }

    rateExperience(reservationId, rate) {
        this.resourcesServices.addReviewToResource(reservationId, rate).subscribe((res: any) => {
            console.log(res, rate);

            this.isDisabled = true;

        })
    }


  sendEmail(){
    const message=this.messageToSend.value !== '' ? this.messageToSend.value : null;
    console.log('mesajul trimis: ',message);
    this.reservationsService.sendClientEmail(this.reservationId, message)
    .subscribe((data: any)=>{
        console.log(data);
        this.messageToSend.patchValue('');
        this.toastService.showToast('Success', 'Mesajul a fost trimis clientului prin email', 'success');
    })
  }

    // get the role of user
    getData() {
        this.userService.getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.userRole = res.roles;
                    this.userId = res.id;
                    if(this.router.url.includes('view-flight')){
                        this.getFlightOrderById(this.reservationId);
                    }else{
                        this.getReservationById(this.reservationId);

                    }
                }

            });
    }

    getFlightOrderById(flightOrderId: string){

        this.reservationsService.getFlightOrderById(flightOrderId).subscribe({
            next: (flightOrder: any) => {
                this.reservation = {...flightOrder};
                this.isFlight = true;
                this.flightTickets = flightOrder.tickets;
                this.getClientById(flightOrder.userId);
                this.cdr.detectChanges();
            }
        })

    }

    getReservationById(id) {
        this.reservationsService.getReservationById(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: Reservation) => {
                    console.log(res)
                    this.featuredImage = `${res['featuredImage'].filePath}/${res['featuredImage'].fileName}`
                    this.reservation = {...res};

                    // verificam daca exista macar o camera cu modifiable false, ca sa nu afisam butonul de edit
                    if (this.reservation.bookingType === 'rentalBooking'
                        && this.reservation?.rentalBooking?.items?.some(item => !item?.changePolicies || item?.changePolicies?.modifiable === false)) {
                        this.reservationIsModifiable = false;
                    }
                    if (this.reservation.bookingType === 'menu' && (!this.reservation?.reservationTimePicker?.changePolicies || this.reservation?.reservationTimePicker?.changePolicies?.modifiable === false)) {
                        this.reservationIsModifiable = false;
                    }

                    console.log('REZERVAREA', this.reservation);
                    this.providerId = res.providerId;

                    if (this.userRole.includes('ROLE_PROVIDER')) {
                        if (this.userId !== this.providerId) {
                            this.router.navigate(['/private/provider/reservations/my-list']);
                        }
                    }

                    this.reservationLink = this.reservation.reservationLink;
                    this.isDisabled = this.reservation.recommended !== null;
                    this.clientId = res.userId;
                    this.conversationId = this.reservation.conversationId;
                    this.reservationLink = this.reservation?.reservationLink;
                    this.initQrCode();


                    this.getClientById(this.clientId);
                    this.getProviderName(this.providerId);

                    this.resourceId = res.resourceId;
                    this.getResourceById(this.resourceId);
                    this.cdr.detectChanges();
                }
            });
    }

    getClientById(id) {
        this.userService.getUserById(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.client = res;
                    console.log('CLIENT', this.client);
                }
            });
    }

    getProviderName(id) {
        this.userService.getUserById(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.provider = res;
                }
            });
    }

    getResourceById(id) {
        this.resourcesServices.getResourceById(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: User) => {
                    this.resource = res;
                    console.log('RESURSA', this.resource);
                }
            });
    }

    cancelReservationModal(elementId: string) {
        console.log("Modal apelat:", elementId);

        this.ngbModalService.open(CancelReservationModalComponent, {centered: true});
        this.modalService.setElementId(elementId);

        if (this.userRole.includes('ROLE_CLIENT')) {
            this.modalService.triggerUserListChanges(true);
        }

    }

    openEditReservationModal() {
        const modalRef = this.matDialog.open(EditReservationModalComponent, {height: '90%'});
        modalRef.componentInstance.reservation = this.reservation;
        modalRef.componentInstance.resource = this.resource;
        modalRef.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((modifiedReservation: Reservation) => {
                this.getReservationById(this.reservationId);
            });
    }



    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}
