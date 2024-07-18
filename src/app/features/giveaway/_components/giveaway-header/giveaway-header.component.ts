// header.component.ts
import { Component, Input } from '@angular/core';
import { NavigationItem } from "../../../../shared/_models/navigation-item.model";


@Component({
    selector: 'app-giveaway-header',
    templateUrl: './giveaway-header.component.html',
    styleUrls: ['./giveaway-header.component.scss']
  })
  export class GiveawayHeaderComponent {
    @Input() giveawayName: string;
    @Input() navigationItems: NavigationItem[];


  
    // The constructor remains the same, include it here if you have dependencies
  }