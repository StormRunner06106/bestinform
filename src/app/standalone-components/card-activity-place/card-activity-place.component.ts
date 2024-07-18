import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Resource} from "../../shared/_models/resource.model";
import {Subject, takeUntil} from "rxjs";
import {ResourcesService} from "../../shared/_services/resources.service";
import {ResourceType} from "../../shared/_models/resource-type.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-card-activity-place',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-activity-place.component.html',
  styleUrls: ['./card-activity-place.component.scss']
})
export class CardActivityPlaceComponent implements OnInit, OnDestroy{

  @Input() resource: Resource;

  private ngUnsubscribe = new Subject<void>();

  resType: ResourceType;
  currentLanguage: string;

  constructor(private resourceService: ResourcesService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.getResTypeName();
    this.checkLanguage();
  }

  checkLanguage() {
    this.currentLanguage = this.translate.currentLang;
    this.translate.onLangChange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: res => {
            this.currentLanguage = res.lang;
          }
        });
  }

  getResTypeName(){
    this.resourceService.getResourceTypeById(this.resource?.resourceTypeId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next:(resType: ResourceType)=>{
            this.resType = resType;
          }
        })
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
