import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../../../shared/_services/toast.service";
import {UserDataService} from "../../../shared/_services/userData.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private toastService: ToastService,
              public userService: UserDataService) { }

  form: FormGroup = this.fb.group({
      language: [null, Validators.required],
      distanceUnitMeasure: [null, Validators.required],
      temperatureUnitMeasure: [null, Validators.required],
      currency: [null, Validators.required],
      enablePushNotifications: [false, Validators.required],
      enableLocation: [false, Validators.required],
      enableSharedResource: [false, Validators.required],
      acceptTermsAndConditions: [false, Validators.requiredTrue],
      colorMode: [null, Validators.required],
      twoFactorAuthentication:[false, Validators.required]
      });

  getCurrentSettings() {
      this.userService.getCurrentSetting().subscribe((resp: any) => {
          console.log('setari', resp);
          this.form.patchValue(resp);
      })
  }

  ngOnInit() {
      this.getCurrentSettings();
  }

  submit() {
      if(this.form.valid) {
          this.userService.updateCurrentSetting(this.form.value).subscribe((resp: any) => {
              console.log('TRimis setari');
              console.log(resp);
              if (resp.success) {
                  this.toastService.showToast('Succes', 'Setările au fost modificate!', 'success');
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
