import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../../../shared/_models/user.model";
import {Resource} from "../../../../shared/_models/resource.model";
import {OwlOptions} from "ngx-owl-carousel-o";
import { ResourcesService } from 'src/app/shared/_services/resources.service';
import { Subject, takeUntil } from 'rxjs';
import { Category } from 'src/app/shared/_models/category.model';
import { Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-events-carousel',
  templateUrl: './events-carousel.component.html',
  styleUrls: ['./events-carousel.component.scss']
})
export class EventsCarouselComponent implements OnInit, OnDestroy {

  @Input() currentUser: User;
  @Input() eventsList: Resource[];
  @Input() categoryId: string;
  @Output() resourceTypeEvent = new EventEmitter<string>();

  isDragging: boolean;
  private ngUnsubscribe = new Subject<void>();

  categoryList: Category[] =[];
  currentLanguage: string;

  constructor(    
    private resourceServices: ResourcesService,
    private translate: TranslateService,
    ){}

  // carousel config
  customOptions: OwlOptions = {
    loop: false,
    autoplay: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    center: false,
    margin: 24,
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 3
      },
      768: {
        items: 3
      },
      992: {
        items: 4
      },
      1200: {
        items: 5
      }
    }
  }

  ngOnInit(): void {
    this.checkLanguage();
    this.getResourceTypeByCategory();
    console.log('lista evenimente: ',this.eventsList);
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

  getResourceTypeByCategory(){
    this.resourceServices.getAllResourceTypesByResourceCategory(this.categoryId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe({
      next: (res:any)=>{
        this.categoryList=res;
    }
    });
  }

  sendCategoryType(value: string) {
    this.resourceTypeEvent.emit(value);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
