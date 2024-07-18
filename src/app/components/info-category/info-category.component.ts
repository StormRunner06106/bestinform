import { Component, Input } from '@angular/core';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: "app-info-category",
  templateUrl: "./info-category.component.html",
  styleUrls: ["./info-category.component.scss"],
})
export class InfoCategoryComponent {

  constructor(
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
        'airplane-icon',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/airplane.svg')
    );

    this.matIconRegistry.addSvgIcon(
        'nearBy',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/nearBy.svg')
    );

    this.matIconRegistry.addSvgIcon(
        'locations',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/locations.svg')
    );

    this.matIconRegistry.addSvgIcon(
        'bus',
        this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/images/others/bus.svg')
    );
  }


  @Input() infoCategories: string;
  @Input() selected: string;
  @Input() shortInfo: boolean = false;

}
