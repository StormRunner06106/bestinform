import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Router} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {TicketService} from 'src/app/shared/_services/tickets.service';
import {IPlaneTicket} from '../../available-plane-tickets-list/available-plane-tickets-list.component';

@Component({
    selector: 'app-available-ticket-card',
    templateUrl: './available-ticket-card.component.html',
    styleUrls: ['./available-ticket-card.component.scss'],
})
export class AvailableTicketCardComponent {

    private ngUnsubscribe = new Subject<void>();
    //plane Tickets
    ticketList: Array<IPlaneTicket> = [];
    firstTicket: IPlaneTicket;

    isCarList = false;
    isTrainList = false;
    isPlaneList = false;


    constructor(
        private ticketsService: TicketService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.getTickets();
    }

    getTickets() {
        // console.log('ruta mea',this.router.url.includes('train'));

        if (this.router.url.includes('train')) {
            this.getTrainTicketsList();
            this.isTrainList = true;
        } else if (this.router.url.includes('plane')) {
            this.getPlaneTicketsList();
            this.isPlaneList = true;
        } else if (this.router.url.includes('car')) {
            this.isCarList = true;
            this.getCarList();
        }
    }

    getCarList() {
        console.log('cars');
        this.ticketsService.getCars()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    // console.log('lista masini',res);
                    this.ticketList = res;
                    this.firstTicket = this.ticketList[0];
                }
            })
    }

    getPlaneTicketsList() {

        this.ticketsService.getPlaneTickets()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    // console.log('lista avioane',res);
                    this.ticketList = res;
                    this.firstTicket = this.ticketList[0];
                }
            })
    }

    getTrainTicketsList() {
        this.ticketsService.getTrainTickets()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    // console.log('lista trenuri',res);
                    this.ticketList = res;
                    this.firstTicket = this.ticketList[0];
                }
            })
    }

    goToCheckout(transportId) {
        if (this.isCarList) {
            this.router.navigate(['../available-car-rentals/checkout/' + transportId], {relativeTo: this.route});
        } else if (this.isPlaneList) {
            this.router.navigate(['../available-plane-tickets/checkout/' + transportId], {relativeTo: this.route});
        } else if (this.isTrainList) {
            this.router.navigate(['../available-train-tickets/checkout/' + transportId], {relativeTo: this.route});
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
