import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Category} from "../../shared/_models/category.model";
import {TranslateService} from "@ngx-translate/core";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ResourceType} from "../../shared/_models/resource-type.model";

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent implements OnInit, OnDestroy {
  @Input() imgPath: string;
  @Input() nameEn: string;
  @Input() nameRo: string;
  @Input() height: number;
  @Input() selected = false;
  currentLanguage: string;

  private ngUnsubscribe = new Subject<void>();

  constructor(private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.currentLanguage = this.translate.currentLang;
    this.translate.onLangChange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: res => {
            this.currentLanguage = res.lang;
          }
        });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
