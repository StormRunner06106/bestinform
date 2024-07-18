import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { City } from 'src/app/shared/_models/city.model';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CityRecommendation } from 'src/app/shared/_models/city-recommendation.model';
import { Subject, takeUntil } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ResourceFilterService } from 'src/app/shared/_services/resource-filter.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-deny-location',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatLegacyFormFieldModule, MatLegacyInputModule, TranslateModule, MatDialogModule],
  templateUrl: './deny-location.component.html',
  styleUrls: ['./deny-location.component.scss']
})
export class DenyLocationComponent {
  // @Input() detectedCity: City;
  @Input() hasCity: City;


  filterForm: FormGroup;

  recommendedCities: CityRecommendation[] = null;
  cityToSearch: string = null;
  displayChooseLocation=false;

  private ngUnsubscribe = new Subject<void>();

  constructor(public modal: NgbActiveModal,
              private resourceFilterService: ResourceFilterService,
              private fb: FormBuilder,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
      console.log('hasCity',this.hasCity);
      this.filterForm = this.fb.group({
          // location: [this.hasCity.name],
          // geographicalCoordinates: [this.hasCity.geographicalCoordinates],
          // country: [this.hasCity.country]
          location: [''],
          geographicalCoordinates: [''],
          country: ['']
      });
  }

  searchForCities() {
      if (!this.cityToSearch || this.cityToSearch?.length < 3) {
          this.recommendedCities = null;
          return;
      }

      this.resourceFilterService.getAllCitiesRecommended(this.cityToSearch)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
              if (!res) return;

              this.recommendedCities = [...res];
          });
  }

  updateFormValue(formControlName: string, value: unknown) {
      this.filterForm.get(formControlName).patchValue(value);
  }

  openModal(templateRef) {
      this.dialog.open(templateRef, {panelClass: 'custom-modal'});
      this.modal.close();
  }

  ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }
}
