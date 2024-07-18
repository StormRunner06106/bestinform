import { Component, Input } from '@angular/core';
import { PlaceData } from 'src/app/shared/_models/place.model';

@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss'],
})
export class PlaceCardComponent {
  @Input() place: PlaceData;

}
