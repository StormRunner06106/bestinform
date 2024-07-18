import {BrowserModule} from "@angular/platform-browser";
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule,} from "@angular/common/http";

import {NgProgressModule} from "ngx-progressbar";
import {NgProgressHttpModule} from "ngx-progressbar/http";
import {EmbedVideo} from "ngx-embed-video";
import {InputFileConfig, InputFileModule} from "ngx-input-file";
import {environment} from "src/environments/environment";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {OverlayContainer} from "@angular/cdk/overlay";
import {CustomOverlayContainer} from "./theme/utils/custom-overlay-container";

import {GoogleMapsModule} from "@angular/google-maps";

//primeng
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {AutoCompleteModule} from "primeng/autocomplete";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {InputNumberModule} from "primeng/inputnumber";
import {SelectButtonModule} from "primeng/selectbutton";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {MenubarModule} from "primeng/menubar";
import {CarouselModule} from "primeng/carousel";
import {ScrollerModule} from 'primeng/scroller';


import {AppRoutingModule} from "./app.routing";
import {SharedModule} from "./shared/shared.module";
import {AppComponent} from "./app.component";
import {AppSettings} from "./app.settings";
import {GiveawayModule} from "./features/giveaway/giveaway.module";

import {MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule,} from "@angular/material/core";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";

import {NotFoundComponent} from "./features/not-found/not-found.component";
import {LangComponent} from "./theme/components/lang/lang.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {UniversalAppInterceptor} from "./shared/_services/universalAppInterceptor.service";
import {LocalStorageService} from "./shared/_services/localStorage.service";
import {SessionStorageService} from "./shared/_services/sessionStorage.service";
import {JwtTokenService} from "./shared/_services/jwtToken.service";

import {VimeModule} from "@vime/angular";
import {ToastComponent} from "./theme/components/toast/toast.component";
import {ToasterComponent} from "./theme/components/toaster/toaster.component";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatCardModule} from "@angular/material/card";
import {UserSettingsComponent} from "./components/popup-dialog/popup-dialog.component";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {MatIconModule} from "@angular/material/icon";
import {RouterModule} from "@angular/router";
import {MatDialogModule} from "@angular/material/dialog";
import {NgxQRCodeModule} from "@techiediaries/ngx-qrcode";
import {WebSocketAPI} from "./shared/_services/web-socket.service";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";

import {NgcCookieConsentConfig, NgcCookieConsentModule} from "ngx-cookieconsent";
import {UserNotificationsComponent} from "./components/user-notifications/user-notifications.component";
// import { ServiceWorkerModule } from '@angular/service-worker';
import {LazyLoadImageModule} from "ng-lazyload-image";
import {CookieService} from "ngx-cookie-service";
import {MatSelectCountryModule} from "@angular-material-extensions/select-country";
import {FooterNewComponent} from "./components/footer/footer.component";
import {CommonModule} from "@angular/common";
import {SliderModule} from "primeng/slider";


// import { ServiceWorkerModule } from '@angular/service-worker';

const config: InputFileConfig = {
  fileAccept: "*",
};

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: "localhost", // or 'your.domain.com' // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
  },
  palette: {
    popup: {
      background: "#24398A",
    },
    button: {
      background: "#FFCC29",
    },
  },
  theme: "edgeless",
  type: "opt-out",
  elements: {
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message">{{message}} 
    <a aria-label="learn more about our terms of service" tabindex="2" class="cc-link" href="/content/privacy-policy" target="_blank" rel="noopener">Află mai multe</a>    </span>
    `,
  },
};

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient,
    environment.url + "/assets/i18n/",
    ".json"
  );
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    LangComponent,
    ToastComponent,
    ToasterComponent,
    UserSettingsComponent,
    UserNotificationsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    EmbedVideo.forRoot(),
    NgProgressModule,
    NgProgressHttpModule,
    InputFileModule.forRoot(config),
    AppRoutingModule,
    SharedModule,
    NgbModule,
    VimeModule,
    MatNativeDateModule,
    MatRippleModule,
    GiveawayModule,
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectCountryModule.forRoot("en"),
    AngularEditorModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    BrowserAnimationsModule,
    NgxQRCodeModule,
    NgxMatMomentModule,
    LazyLoadImageModule,
    MatCardModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    GoogleMapsModule,
    SelectButtonModule,
    OverlayPanelModule,
    MenubarModule,
    CarouselModule,
    FooterNewComponent,
    ScrollerModule,
  ],
  providers: [
    AppSettings,
    WebSocketAPI,
    { provide: OverlayContainer, useClass: CustomOverlayContainer },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UniversalAppInterceptor,
      multi: true,
    },
    { provide: LocalStorageService, useClass: LocalStorageService },
    { provide: SessionStorageService, useClass: SessionStorageService },
    { provide: JwtTokenService, useClass: JwtTokenService },
    { provide: MAT_DATE_LOCALE, useValue: "ro-RO" },
    CookieService,
  ],
  exports: [TranslateModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
