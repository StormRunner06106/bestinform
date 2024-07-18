import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ticket-filter-plus-sidebar',
  standalone: true,
  imports: [CommonModule,SharedModule],
  templateUrl: './ticket-filter-plus-sidebar.component.html',
  styleUrls: ['./ticket-filter-plus-sidebar.component.scss']
})
export class TicketFilterPlusSidebarComponent {

  filterForm: FormGroup;

  constructor(private formBuilder:FormBuilder) {

  }

  ngOnInit(): void{
    this.initForm();
  }

  initForm(){
    this.filterForm=this.formBuilder.group({
      italian: [false],
      indian: [false],
      lebanese: [false],
      asian: [false],
      mediteraneean: [false],
      price1: [false],
      price2: [false],
      price3: [false],
      price4: [false],
      price5: [false],
      karaoke: [false],
      dj: [false],
      liveMusic: [false],
      standUp: [false],
      freeParking: [false],
      inner: [false],
      outer: [false]
    });
  }

  getFilterData(){
    const filter={
      italian: this.filterForm.controls.italian.value,
      indian: this.filterForm.controls.indian.value,
      lebanese: this.filterForm.controls.lebanese.value,
      asian: this.filterForm.controls.asian.value,
      mediteraneean: this.filterForm.controls.mediteraneean.value,
      price1: this.filterForm.controls.price1.value,
      price2: this.filterForm.controls.price2.value,
      price3: this.filterForm.controls.price3.value,
      price4: this.filterForm.controls.price4.value,
      price5: this.filterForm.controls.price5.value,
      karaoke: this.filterForm.controls.karaoke.value,
      dj: this.filterForm.controls.dj.value,
      liveMusic: this.filterForm.controls.liveMusic.value,
      standUp: this.filterForm.controls.standUp.value,
      freeParking: this.filterForm.controls.freeParking.value,
      inner: this.filterForm.controls.inner.value,
      outer: this.filterForm.controls.outer.value
    }

    this.filterForm.setValue(filter);

    console.log('OBIECT FORM:', filter);
  }

}
