import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSliderModule} from "@angular/material/slider";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {FlightsFilteredBody, FlightsFilters, PlaneFlightsStore} from "../../_services/plane-flights.store";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {BehaviorSubject, debounceTime, Observable, Subject, tap} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {AccordionModule} from 'primeng/accordion';
import {CheckboxModule} from 'primeng/checkbox';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatRadioModule} from "@angular/material/radio";
import {LoadingService} from "../../../../../utils/spinner/loading.service";
import {MatCheckboxModule} from '@angular/material/checkbox';


@Component({
  selector: 'app-plane-filters',
  standalone: true,
  imports: [CommonModule, MatSliderModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, AccordionModule, CheckboxModule, MatExpansionModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './plane-filters.component.html',
  styleUrls: ['./plane-filters.component.scss']
})
export class PlaneFiltersComponent  {

  @Input() loading: boolean;
  @Input() airlines: string[];
  @Input() flightsChanged: BehaviorSubject<any>;

  filters = this.fb.group({
    layover: [],
    maxDuration: [],
    price: [],
    airlines: [],
    turDepartureHour: [null],
    turArrivalHour: [null],
    returnDepartureHour: [null],
    returnArrivalHour: [null],
    turIataCode: [null],
    returnIataCode: [null]
  });

  slidersData = {
    current: "",
    minPrice: 0,
    maxPrice: 0,
    minDuration: 0,
    maxDuration: 0,
    duration: 0
  }
  currency = "";

  // departureAirports$: Observable<CityWithAirports[]> = this.planeFlightsStore.departureAirports$.pipe(
  //     tap(airports => {
  //       if (airports[0].airports.length === 1) {
  //         this.filters.controls.turIataCode.disable({emitEvent: false});
  //       }
  //     })
  // );
  // arrivalAirports$: Observable<CityWithAirports[]> = this.planeFlightsStore.arrivalAirports$.pipe(
  //     tap(airports => {
  //       if (airports[0].airports.length === 1) {
  //         this.filters.controls.returnIataCode.disable({emitEvent: false});
  //       }
  //     })
  // );

  flightsFilters$: Observable<FlightsFilters> = this.planeFlightsStore.getFlightsFilters().pipe(
      tap(filghtsFilters => {
        this.filters.patchValue({
          turIataCode: filghtsFilters.originLocationCode,
          returnIataCode: filghtsFilters.destinationLocationCode
        }, {emitEvent: false});
      })
  );

  private onDestroy$ = new Subject<void>();
  private blockChanges = false;
  block: boolean = false;


  constructor(private planeFlightsStore: PlaneFlightsStore,
              private loadingService: LoadingService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.filters.valueChanges
        .pipe(debounceTime(500), takeUntil(this.onDestroy$))
        .subscribe(() => {
          if (!this.blockChanges) this.changeFilters();
        });
    this.flightsChanged.subscribe((res) => {
      this.blockChanges = true;
      if (res && res.price) {
        // @ts-ignore
        this.filters.get("price").setValue(res.maxPrice);
        this.filters.get("price").setValidators([Validators.min(res.minPrice), Validators.max(res.maxPrice)]);
        this.filters.get("maxDuration").setValue(this.slidersData.maxDuration ? this.slidersData.maxDuration : res.maxDuration);
        this.filters.get("maxDuration").setValidators([Validators.min(res.minDuration), Validators.max(this.slidersData.maxDuration ? this.slidersData.maxDuration : res.maxDuration)]);
        this.currency = res.currency;
        this.slidersData = {
          current: res.currency,
          minPrice: res.minPrice,
          maxPrice: res.maxPrice,
          minDuration: !this.slidersData.minDuration ? res.minDuration : this.slidersData.minDuration,
          maxDuration: !this.slidersData.maxDuration ? res.maxDuration : this.slidersData.maxDuration,
          duration: res.maxDuration
        }
      }
      setTimeout(() => {
        this.blockChanges = false;
      }, 500)
    });
  }

  changeFilters() {
    const value = this.filters.value;
    value.price = null;
    const newFilters: FlightsFilteredBody['dto'] = {
      ...this.filters.value,
      maxDuration: this.filters.value.maxDuration * 60,
      airlines: this.filters.value.airlines?.length ? this.filters.value.airlines : null
    }
    this.planeFlightsStore.changeFilters(newFilters);
  }

  setFilters(filterValue: boolean, controlName: string, filterName: string ){
    const control = this.filters.get(controlName);
    if (filterValue) {
      control.setValue(filterName === 'null' ? null : filterName);
    }
    else {
      control.setValue(null);
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
