import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tickets-filter-sidebar',
  standalone: true,
  imports: [CommonModule, SharedModule ],
  templateUrl: './tickets-filter-sidebar.component.html',
  styleUrls: ['./tickets-filter-sidebar.component.scss']
})
export class TicketsFilterSidebarComponent {

  filterForm: FormGroup;

  constructor(private formBuilder:FormBuilder) {

  }

  ngOnInit(): void{
    this.initForm();
  }

  initForm(){
    this.filterForm=this.formBuilder.group({
      mostPopular: [false],
      highestRating: [false],
      lowestRating: [false],
      highPrice: [false],
      lowPrice: [false],
      rate1: [false],
      rate2: [false],
      rate3: [false],
      rate4: [false]
    });
  }

  getFilterData(){
    const filter={
      mostPopular: this.filterForm.controls.mostPopular.value,
      highestRating: this.filterForm.controls.highestRating.value,
      lowestRating: this.filterForm.controls.lowestRating.value,
      highPrice: this.filterForm.controls.highPrice.value,
      lowPrice: this.filterForm.controls.lowPrice.value,
      rate1: this.filterForm.controls.rate1.value,
      rate2: this.filterForm.controls.rate2.value,
      rate3: this.filterForm.controls.rate3.value,
      rate4: this.filterForm.controls.rate4.value
    }

    this.filterForm.setValue(filter);

    console.log('OBIECT FORM:', filter);
  }
  
}
