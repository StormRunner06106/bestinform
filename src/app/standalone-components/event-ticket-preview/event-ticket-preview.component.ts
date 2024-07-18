import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-ticket-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-ticket-preview.component.html',
  styleUrls: ['./event-ticket-preview.component.scss']
})
export class EventTicketPreviewComponent {
  @Input() ticketData: any;
}
