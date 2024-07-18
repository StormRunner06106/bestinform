import { Component } from '@angular/core';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-card-mobile',
  templateUrl: './event-card-mobile.component.html',
  styleUrls: ['./event-card-mobile.component.scss']
})
export class EventCardMobileComponent extends EventCardComponent {}

