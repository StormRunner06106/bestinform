import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {Reservation} from 'src/app/shared/_models/reservation.model';
import {Resource} from 'src/app/shared/_models/resource.model';
import {User} from 'src/app/shared/_models/user.model';
import {ReservationsService} from 'src/app/shared/_services/reservations.service';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {Router} from '@angular/router';


@Component({
    selector: 'app-view-reservation',
    templateUrl: './view-reservation.component.html',
    styleUrls: ['./view-reservation.component.scss']
})
export class ViewReservationComponent implements OnInit {
    userRole = [];
    backProviderRoute: any;

    public downloadAsPDF() {
        const DATA: any = document.getElementById('htmlData');
        html2canvas(DATA, {scale: 2}).then((canvas) => {
            const fileWidth = 208;
            const fileHeight = (canvas.height * fileWidth) / canvas.width;
            const FILEURI = canvas.toDataURL('image/png');
            const PDF = new jsPDF('p', 'mm', 'a4');
            const position = 5;
            PDF.addImage(FILEURI, 'PNG', 5, position, fileWidth - 7, fileHeight);
            PDF.save('Rezervare-Bestinform-' + this.reservation.reservationNumber + '.pdf');
        });
    }


    //reservation id
    reservationId: string;
    reservation: Reservation;

    //client Data
    clientId: string;
    clientData: User;

    //resource data
    resourceId: string;
    resourceData: Resource;
    defaultImagePath = "./../../../../assets/images/others/banner-default-min.jpg";
    status = 'Pending';
    isFlight = false;


    constructor(
        private route: ActivatedRoute,
        private reservationService: ReservationsService,
        private userService: UserDataService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            console.log(params);
            console.log('Parametru nou', params.id);
            if (this.router.url.includes('view-flight')) {
                this.reservationService.getFlightOrderById(params.id).subscribe({
                    next: (flightOrder: any) => {
                        console.log('FLIGHT ORDER', flightOrder);
                        this.reservation = flightOrder;
                        this.isFlight = true;
                        this.userService.getCurrentUser().subscribe((user: User) => {
                            this.userRole = user.roles;
                        })
                    }
                })
            } else {
                this.reservationService.getReservationById(params.id).subscribe((res: Reservation) => {
                    console.log('Rezervare', res);
                    this.reservation = res;
                    console.log(res)
                    this.userService.getCurrentUser().subscribe((user: User) => {
                        console.log('User', user);
                        this.userRole = user.roles;
                        this.isFlight = false;
                        if (this.reservation.providerId === user.id && this.reservation.markedAsRead === false) {
                            console.log('Sunt provider si e resursa mea');
                            this.reservationService.markReservationAsRead(true, this.reservation.id).subscribe((resp: any) => {
                                console.log('Marcat citit', resp);
                            })
                        }
                    })
                })
            }


        });


    }

    navigateBack(role) {
        if (role === 'admin') {
            this.router.navigate(this.isFlight ? ['/private/admin/reservations/flight-list'] : ['/private/admin/reservations/list'], {
                queryParams: {resourceid: this.reservation.resourceId}
            })
        } else if (role === 'staff') {
            this.router.navigate(this.isFlight ? ['/private/staff/reservations/flight-list'] : ['/private/staff/reservations/list'], {
                queryParams: {resourceid: this.reservation.resourceId}
            })
        } else if (role === 'provider') {
            this.router.navigate(['/private/provider/reservations/list'], {
                queryParams: {resourceid: this.reservation.resourceId}
            })
        }
    }

}
