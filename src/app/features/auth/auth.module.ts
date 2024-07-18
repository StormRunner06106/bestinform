import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from "./login/login.component";
import {ForgottenPassComponent} from "./forgotten-pass/forgotten-pass.component";
import {RegisterComponent} from "./register/register.component";
import {SharedModule} from "../../shared/shared.module";
import {VimeModule} from "@vime/angular";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import { ProviderRegisterComponent } from './provider-register/provider-register.component';
import {FacebookLoginProvider, SocialAuthServiceConfig, SocialLoginModule} from "angularx-social-login";



@NgModule({
  declarations: [
    LoginComponent,
    ForgottenPassComponent,
    RegisterComponent,
    ProviderRegisterComponent

  ],
  imports: [
    CommonModule,
    SharedModule,
    VimeModule,
    MatIconModule,
    MatDialogModule,
    SocialLoginModule
  ],
  providers: [MatDialogModule,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('142661982083241'),
          },
        ],
      } as SocialAuthServiceConfig,
    }],
})
export class AuthModule { }
