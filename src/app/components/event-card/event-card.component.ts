import { Component, Input, OnInit} from '@angular/core';
import moment from 'moment';
import { EventAccess, EventColor, EventData} from 'src/app/shared/_models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit{

  @Input() event: EventData;
  
  data: {
    day: string;
    month: string;
  }

  EventColor = EventColor;
  EventAccess = EventAccess;

  icon: string;

  ngOnInit(): void {
    moment.locale('ro')
    this.data = {
      day: moment(new Date(this.event?.cardText?.date)).format('DD'),
      month: moment(new Date(this.event?.cardText?.date)).format('MMMM')
    }
    this.icon = `../../../assets/images/others/events/events/${this.event.type}.svg`;
  }
}
