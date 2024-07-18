import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastService} from "../../shared/_services/toast.service";
import {UserDataService} from "../../shared/_services/userData.service";
// import {MatFormFieldModule} from "@angular/material/form-field";
import {CommonModule} from "@angular/common";
import {MatOption, MatOptionModule} from "@angular/material/core";
// import {MatSelectModule} from "@angular/material/select";
// import {MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {DashboardHeaderComponent} from "../dashboard-header/dashboard-header.component";
import {LocalStorageService} from "../../shared/_services/localStorage.service";
import {TranslateModule} from "@ngx-translate/core";


@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, CommonModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatSlideToggleModule, DashboardHeaderComponent, TranslateModule]
})
export class UserSettingsComponent implements OnInit {
  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private toastService: ToastService,
              public userService: UserDataService,
              private localStorage: LocalStorageService) { }

  currentUser: any;

  form: FormGroup = this.fb.group({
    language: [null, Validators.required],
    distanceUnitMeasure: [null, Validators.required],
    temperatureUnitMeasure: [null, Validators.required],
    currency: [null, Validators.required],
    enablePushNotifications: [null],
    // enableLocation: [null],
    enableSharedResource: [null, Validators.required],
    // acceptTermsAndConditions: [null, Validators.requiredTrue],
    // twoFactorAuthentication:[null],
    colorMode: [null]
  });

  getCurrentSettings() {
    this.userService.getCurrentSetting().subscribe((resp: any) => {
      console.log('setari', resp);
      this.form.patchValue(resp);
    })
  }

  getCurrentUser() {
    this.userService.getCurrentUser().subscribe((res: any) => {
      console.log('user', res);
      this.currentUser = res;
      this.getCurrentSettings();
    })
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  submit() {
    if(this.form.valid) {
      this.userService.updateCurrentSetting(this.form.value).subscribe((resp: any) => {
        console.log('TRimis setari');
        console.log(resp);
        if (resp.success) {
          this.toastService.showToast('Succes', 'Setările au fost modificate! Site-ul se va actualiza cu noile setări.', 'success');
          this.localStorage.set('langFromStorage', this.form.value.language);
          this.localStorage.set('colorMode', this.form.value.colorMode);
          setTimeout(() => {
            location.reload();
          }, 3000);
        } else {
          this.toastService.showToast('Eroare', 'Eroare de la server!', 'error');
        }
      }, () => {
        this.toastService.showToast('Eroare', 'Eroare de la server!', 'error');
      })
    } else {
      this.toastService.showToast('Eroare', 'Trebuie să completați toate câmpurile obligatorii și să acceptați termenii și condițiile', 'error');
    }

  }

}
