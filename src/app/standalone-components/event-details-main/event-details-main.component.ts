import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MainSearchComponent } from 'src/app/components/main-search/main-search.component';
import { DomainListingModule } from 'src/app/features/domain-listing/domain-listing.module';
import { EventInstance } from 'src/app/shared/_models/event-instance.model';
import { EventsNewService } from 'src/app/shared/_services/events-new.service';
import { mapsOptions } from 'src/app/shared/maps-options';

@Component({
  selector: 'app-event-details-main',
  standalone: true,
  imports: [CommonModule, DomainListingModule, RouterOutlet, AccordionModule, GoogleMap, MapMarker, MatIconModule],
  templateUrl: './event-details-main.component.html',
  styleUrls: ['./event-details-main.component.scss']
})

export class EventDetailsMainComponent implements OnInit, OnDestroy {
  iterateNumber = Array(16).fill(4);
  event: EventInstance;
  markerPosition = {
    lat: 44.4325,
    lng: 26.1039,
    label: 'Hz',
    activeIcon: true
  };
  center: google.maps.LatLngLiteral = {
    lat: 44.4268,
    lng: 26.1025,
  };
  googlemapOptions = mapsOptions;

  images = ['https://bestinform.eu/files/resources/restaurants/d5d7e8ce-1137-42e2-be1e-676d538d3a0eg.jpeg', 'https://bestinform.eu/files/resources/restaurants/f70c7b81-2010-4d64-9a51-14b87847ef2eg.jpeg', 'https://bestinform.eu/files/resources/restaurants/080c989e-f171-4f2d-b2ba-e730a319e110g.jpeg', 'https://bestinform.eu/files/resources/restaurants/645ba041-e9e6-4bee-9d21-3fd2384b3e91g.jpeg', 'https://bestinform.eu/files/resources/restaurants/f1821555-1405-43d5-93e8-1d64beeebcacg.jpeg', 'https://bestinform.eu/files/resources/restaurants/afcb905d-6873-4e12-8bae-ab6d4e9c9896g.jpeg', 'https://bestinform.eu/files/resources/restaurants/17f11e48-225f-46d0-924e-917868fe7ee2g.jpeg', 'https://bestinform.eu/files/resources/restaurants/1951aa91-8931-45a2-a6aa-62f5cc7e9481g.jpeg', 'https://bestinform.eu/files/resources/restaurants/75b752b6-d65e-4a71-85a8-af93400cd54bg.jpeg', 'https://bestinform.eu/files/resources/restaurants/a5a3fd73-ea0a-41c7-8122-0ec75ae05397g.jpeg'];

  private ngUnsubscribe$ = new Subject<void>();

  constructor(private router: Router, private eventsService: EventsNewService, private route: ActivatedRoute, public modal: MatDialog) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.eventsService.events.value.length === 0) {
        this.eventsService.getEventsData();
      }
      this.eventsService.events.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(events => {
        this.event = events.find(event => event.id === +params?.id);
        this.markerPosition = {
          ...this.markerPosition,
          lat: this.event?.venue?.latitude || 44.4325,
          lng: this.event?.venue?.longitude || 26.1039
        };
        this.center = {
          lat: this.event?.venue?.latitude || 44.4325,
          lng: this.event?.venue?.longitude || 26.1039
        };
        console.log('center', this.center);
        console.log('event', this.event);
        console.log('eventss', events);
      });
    });
  }

  navigateToTickets(): void {
    this.router.navigate(["/client/event/tickets"], {queryParamsHandling: "preserve"});
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  openModal(tpl: TemplateRef<any>): void {
    this.modal.open(tpl);
  }

  closeModal(): void {
    this.modal.closeAll();
  }
}
