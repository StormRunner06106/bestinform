import { Component, Input } from '@angular/core';
import { EventData } from 'src/app/shared/_models/event.model';

@Component({
  selector: 'app-event-card-list',
  templateUrl: './event-card-list.component.html',
  styleUrls: ['./event-card-list.component.scss']
})
export class EventCardListComponent {
  @Input() title: string = '';
  @Input() events: EventData[];

}
