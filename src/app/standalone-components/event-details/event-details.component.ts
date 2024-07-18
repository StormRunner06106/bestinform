import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomainListingModule } from 'src/app/features/domain-listing/domain-listing.module';
import { EventInstance } from 'src/app/shared/_models/event-instance.model';
import { EventsNewService } from 'src/app/shared/_services/events-new.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, DomainListingModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, OnDestroy {

  event: EventInstance;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private eventsService: EventsNewService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.eventsService.events.value.length === 0) {
        this.eventsService.getEventsData();
      }
      this.eventsService.events.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(events => {
        this.event = events.find(event => event.id === +params?.id);
        // console.log('this.event', this.event);
        // this.eventsService.getEventTickets('42966');
        // this.eventsService.getEventTickets('13620');
      });
    });
  }

  getEventImage(): string {
    const defaultUrl = 'assets/images/others/events/eventDefaultBackground.png';
    return `url(${this.event?.image?.url ? this.event?.image?.url : defaultUrl})`;
  }

  getDay(): number {
    return moment(this.event?.dateStart).date();
  }

  getMonth(): string {
    return moment(this.event?.dateStart).format('MMMM');
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
