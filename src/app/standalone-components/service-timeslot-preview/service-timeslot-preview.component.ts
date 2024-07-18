import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-timeslot-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-timeslot-preview.component.html',
  styleUrls: ['./service-timeslot-preview.component.scss']
})
export class ServiceTimeslotPreviewComponent {
  @Input() serviceData: any;
  @Input() list: boolean;


}
