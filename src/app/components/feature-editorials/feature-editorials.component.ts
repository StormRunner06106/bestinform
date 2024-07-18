import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeatureEditorialsService } from './shared/feature-editorials.service';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { auditTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import {TilesViewComponent} from "./tiles-view/tiles-view.component";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

export const defaultPageSize: number = 9;

@Component({
  selector: 'app-feature-editorials',
  templateUrl: './feature-editorials.component.html',
  styleUrls: ['./feature-editorials.component.scss'],
  providers: [FeatureEditorialsService],
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    TilesViewComponent
  ],
  standalone: true
})

export class FeatureEditorialsComponent implements OnInit {
  private categoriesSubject = new BehaviorSubject<any[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private editorialsListSubject = new BehaviorSubject<any[]>([]);
  public editorialsList$ = this.editorialsListSubject.asObservable();

  currentCategorySubject = new BehaviorSubject<string | null>(null);

  private totalEditorialsItemsSubject = new BehaviorSubject<number>(0);
  public totalEditorials$ = this.totalEditorialsItemsSubject.asObservable();

  private amountOfPagesSubject = new BehaviorSubject<number>(0);
  public amountOfPages$ = this.amountOfPagesSubject.asObservable();

  private numberOfElementsSubject = new BehaviorSubject<number>(0);
  public numberOfElements$ = this.numberOfElementsSubject.asObservable();

  public pageFiltersSubject = new BehaviorSubject<{ category: string | null, page: number }>({ category: null, page: 1 });

  public searchForm: FormGroup;

  constructor(private editorialSrvc: FeatureEditorialsService, private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit() {
    this.generateSearchForm();
    this.getEditorialsData();

    this.searchForm.valueChanges.pipe(
        distinctUntilChanged(),
        auditTime(600),
        switchMap(items => {
          const payload = {
            title: items.editorialsSearchControl,
            name: this.currentCategorySubject.value
          };
          return this.getEditorialsWithParams(0, defaultPageSize, 'date', 'desc', payload);
        }),
        tap(data => {
          this.remapCategories(this.categoriesSubject.value, data?.content);
          this.updatePageInfo(data);
        }),
    ).subscribe();
  }

  isMobile(): boolean {
    return window.innerWidth < 980;
  }

  private generateSearchForm(): void {
    this.searchForm = this.fb.group({
      editorialsSearchControl: ['']
    });
  }

  public filterEditorialsByCategoryId(categoryId: string): void {
    this.currentCategorySubject.next(categoryId || null);
    const payload = {
      category: categoryId || null,
      name: this.searchForm.controls.editorialsSearchControl.value
    };
    this.getEditorialsWithParams(0, defaultPageSize, 'date', 'desc', payload).subscribe(data => {
      this.remapCategories(this.categoriesSubject.value, data?.content);
      this.updatePageInfo(data);
    });
  }

  public getEditorialsWithParams(page: number, size: number, sort: string, dir: string, filterParams: any): Observable<any> {
    return this.editorialSrvc.listEditorialFiltered(page, size, sort, dir, filterParams);
  }

  private getEditorialsData(): void {
    const filterParams = {};
    if (this.route.snapshot.queryParams.category) {
      filterParams
    }
    this.editorialSrvc.getEditorialsCategories().pipe(
        switchMap(categories => {
          return zip(of(categories), this.editorialSrvc.listEditorialFiltered(0, defaultPageSize, 'date', 'desc', {category: this.route.snapshot.queryParams.category}))
        }),
        tap(([categories, editorialsList]) => {
          this.updatePageInfo(editorialsList);
          categories.unshift({ name: 'Toate', value: null });
          this.categoriesSubject.next(categories);
          this.remapCategories(categories, editorialsList['content']);
          this.currentCategorySubject.next(categories.find(category => category.id === this.route.snapshot.queryParams.category));
        })
    ).subscribe();
  }

  public changePagination(pageNumber: any): void {
    const payload = {
      name: this.searchForm.controls.editorialsSearchControl?.value,
      category: this.pageFiltersSubject.value.category
    };
    this.getEditorialsWithParams(pageNumber - 1, defaultPageSize, 'date', 'desc', payload).subscribe(data => {
      this.remapCategories(this.categoriesSubject.value, data?.content);
      this.updatePageInfo(data);
    });
  }

  private remapCategories(categories: any[], editorialsList: any[]): void {
    const listOfEditorials: any[] = editorialsList.map(item => {
      const category = categories.find(value => item.category === value.id);
      if (category) {
        item.categoryName = category.name;
      }
      return item;
    });
    this.editorialsListSubject.next(listOfEditorials);
  }

  private updatePageInfo(editorialsList: any): void {
    this.totalEditorialsItemsSubject.next(editorialsList.totalElements);
    this.amountOfPagesSubject.next(editorialsList.totalPages);
    this.numberOfElementsSubject.next(editorialsList.numberOfElements);
  }
}
