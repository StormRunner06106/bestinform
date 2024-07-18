import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { DomainListingModule } from 'src/app/features/domain-listing/domain-listing.module';
import { EventsNewService } from 'src/app/shared/_services/events-new.service';

@Component({
    selector: 'app-events-tickets',
    standalone: true,
    imports: [CommonModule, DomainListingModule, RouterOutlet, AccordionModule],
    templateUrl: './events-tickets.component.html',
    styleUrls: ['./events-tickets.component.scss']
})
export class EventsTicketsComponent {
    currentTicket = 'ticket1';
    stepSelected = 1;
    titles = ['Selectati Reprezentatia'];
    titleText;

    constructor(private route: ActivatedRoute, private eventsService: EventsNewService) {
    }

    nextStep(): void {
        this.stepSelected += 1;
    }
}
