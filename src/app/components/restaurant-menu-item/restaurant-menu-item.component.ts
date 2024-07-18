import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-restaurant-menu-item',
  templateUrl: './restaurant-menu-item.component.html',
  styleUrls: ['./restaurant-menu-item.component.scss']
})
export class RestaurantMenuItemComponent {

  @Input() price;
  @Input() name;
  @Input() ingredients;
  @Input() image;
  @Input() currency;

}
