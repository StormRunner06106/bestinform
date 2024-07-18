import { Component, OnInit } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-popular-locations',
  templateUrl: './popular-locations.component.html',
  styleUrls: ['./popular-locations.component.scss']
})
export class PopularLocationsComponent implements OnInit {

  constructor(
      private translate:TranslateService
  ) { }

  ngOnInit(): void {
    console.log(this.translate.instant('TOAST.SUCCESS'));
  }

}
