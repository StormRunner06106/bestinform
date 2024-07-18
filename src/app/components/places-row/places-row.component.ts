import { Component, Input } from '@angular/core';
import { PlaceData } from 'src/app/shared/_models/place.model';

@Component({
  selector: 'app-places-row',
  templateUrl: './places-row.component.html',
  styleUrls: ['./places-row.component.scss'],
})
export class PlacesRowComponent {
@Input() title: string = '';
@Input() places: PlaceData[]
}
