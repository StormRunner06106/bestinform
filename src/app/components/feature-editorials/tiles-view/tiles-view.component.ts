import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {AsyncPipe, JsonPipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tiles-view',
  templateUrl: './tiles-view.component.html',
  styleUrls: ['./tiles-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    JsonPipe,
    NgForOf,
    NgIf,
    NgStyle,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    NgClass
  ],
  standalone: true
})
export class TilesViewComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() editorialsList: any[] = [];
  @Input() categoriesList: any[] = [];
  @Input() totalEditorials: any;
  @Input() amountOfPages: any;
  @Input() isMobile: boolean = false;
  @Input() numberOfElements: any;
  @Input() searchForm: FormGroup;
  @Input() selectedCategory: any = null;
  @Input() pageFiltersSubject: BehaviorSubject<any> = new BehaviorSubject([]);
  @Output() filterEditorialsByCategoryId: EventEmitter<string> = new EventEmitter<string>();
  @Output() changePagination: EventEmitter<string> = new EventEmitter<string>();
  // selectedCategory: any = null;
  currentPage: number = 1; // Default current page

  constructor(private router: Router) {
  }

  get pagesArray() {
    return new Array(this.amountOfPages).fill(0).map((_, index) => index + 1);
  }

  ngOnInit() {
    console.log('this.editorialsList', this.editorialsList);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('this.editorialsListtt', this.editorialsList);
  }

  ngAfterViewInit() {
    console.log('this.editorialsListt', this.editorialsList);
  }

  public selectCategory(category: any) {
    this.filterEditorialsByCategoryId.emit(category.id);
    this.pageFiltersSubject.next({ category: category.id, page: this.currentPage });
  }

  public selectPage(page: any): void {
    if (page === 'first') {
      this.currentPage = 1;
      this.changePagination.emit('1');
    } else if (page === 'last') {
      this.currentPage = this.amountOfPages;
      this.changePagination.emit(this.amountOfPages);
    } else {
      this.currentPage = page;
    }
    this.changePagination.emit(page);
    this.pageFiltersSubject.next({ category: this.selectedCategory.id, page: this.currentPage });
  }

  public redirectById(editorial): void {
    this.router.navigate([`/client/dashboard/editorials/${editorial.slug}`])
  }
}
