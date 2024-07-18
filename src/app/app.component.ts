import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from "@angular/core";
import { Settings, AppSettings } from "./app.settings";
import { Router, NavigationEnd } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";

import {
  NgcCookieConsentService,
  NgcInitializationErrorEvent,
  NgcInitializingEvent,
  NgcNoCookieLawEvent,
  NgcStatusChangeEvent,
} from "ngx-cookieconsent";
import { Subscription } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { LocalStorageService } from "./shared/_services/localStorage.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit {
  cookieValue: any;

  private popupOpenSubscription!: Subscription;
  private popupCloseSubscription!: Subscription;
  private initializingSubscription!: Subscription;
  private initializedSubscription!: Subscription;
  private initializationErrorSubscription!: Subscription;
  private statusChangeSubscription!: Subscription;
  private revokeChoiceSubscription!: Subscription;
  private noCookieLawSubscription!: Subscription;

  public settings: Settings;
  constructor(
    public appSettings: AppSettings,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    public translate: TranslateService,
    private ccService: NgcCookieConsentService,
    private cookieService: CookieService,
    private localStorage: LocalStorageService
  ) {
    this.settings = this.appSettings.settings;
    translate.addLangs(["en", "de", "fr", "ru", "tr", "ro"]);
    translate.setDefaultLang("ro");
    translate.use("ro");

    // this.cookieService.set('Test', 'Hello World');
    // this.cookieValue = this.cookieService.get('Test');

    // console.log("linkul care imi trebuie mie", router.url.length);
  }

  ngOnInit() {
    if (this.localStorage.get("colorMode")) {
      document.documentElement.setAttribute(
        "data-theme",
        this.localStorage.get("colorMode")
      );
    } else {
      this.localStorage.set("colorMode", "light");
      document.documentElement.setAttribute(
        "data-theme",
        this.localStorage.get("colorMode")
      );
    }

    this.translate
      .get([
        "cookie.header",
        "cookie.message",
        "cookie.dismiss",
        "cookie.allow",
        "cookie.deny",
        "cookie.link",
        "cookie.policy",
      ])
      .subscribe((data) => {
        this.ccService.getConfig().content =
          this.ccService.getConfig().content || {};
        // Override default messages with the translated ones
        this.ccService.getConfig().content.header = data["cookie.header"];
        this.ccService.getConfig().content.message = data["cookie.message"];
        this.ccService.getConfig().content.dismiss = data["cookie.dismiss"];
        this.ccService.getConfig().content.allow = data["cookie.allow"];
        this.ccService.getConfig().content.deny = data["cookie.deny"];
        this.ccService.getConfig().content.link = "/content/privacy-policy";
        this.ccService.getConfig().content.policy = data["cookie.policy"];

        this.ccService?.destroy(); // remove previous cookie bar (with default messages)
        this.ccService.init(this.ccService.getConfig()); // update config with translated messages
      });

    // subscribe to cookieconsent observables to react to main events
    this.popupOpenSubscription = this.ccService.popupOpen$.subscribe(() => {
      // you can use this.ccService.getConfig() to do stuff...
    });

    this.popupCloseSubscription = this.ccService.popupClose$.subscribe(() => {
      // you can use this.ccService.getConfig() to do stuff...
    });

    this.initializingSubscription = this.ccService.initializing$.subscribe(
      (event: NgcInitializingEvent) => {
        // the cookieconsent is initilializing... Not yet safe to call methods like `NgcCookieConsentService.hasAnswered()`
        console.log(`initializing: ${JSON.stringify(event)}`);
      }
    );

    this.initializedSubscription = this.ccService.initialized$.subscribe(() => {
      // the cookieconsent has been successfully initialized.
      // It's now safe to use methods on NgcCookieConsentService that require it, like `hasAnswered()` for eg...
      console.log(`initialized: ${JSON.stringify(event)}`);
    });

    this.initializationErrorSubscription =
      this.ccService.initializationError$.subscribe(
        (event: NgcInitializationErrorEvent) => {
          // the cookieconsent has failed to initialize...
          console.log(
            `initializationError: ${JSON.stringify(event.error?.message)}`
          );
        }
      );

    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
        console.log("NgcStatusChangeEvent", event);
        if (event.status === "allow") {
          this.ccService.close(false);
        }
      }
    );

    this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
      () => {
        // you can use this.ccService.getConfig() to do stuff...
      }
    );

    this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
      (event: NgcNoCookieLawEvent) => {
        // you can use this.ccService.getConfig() to do stuff...
      }
    );

    if (this.ccService.hasConsented()) {
      this.ccService.destroy();
    }

    //Redirect to the old hompage...
    this.router.navigate(["/old-homepage"]);
  }

  ngAfterViewInit() {
    //   if (this.router.url.includes('/client')) {
    //     const dfMessenger = document.querySelector('df-messenger');
    //     dfMessenger.addEventListener('df-messenger-ready', () => {
    //       console.log('test df');
    //       // Inject additional parameters to the Dialogflow Messenger
    //       dfMessenger.setAttribute('userId', 'value1');
    //       dfMessenger.setAttribute('userCity', 'value2');
    //     });
    // }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
          }
        });
      }
    });

    document.getElementById("preloader").classList.add("hide");
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // this.sidenav.close();
        this.settings.mainToolbarFixed = false;
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to cookieconsent observables to prevent memory leaks
    this.popupOpenSubscription.unsubscribe();
    this.popupCloseSubscription.unsubscribe();
    this.initializingSubscription.unsubscribe();
    this.initializedSubscription.unsubscribe();
    this.initializationErrorSubscription.unsubscribe();
    this.statusChangeSubscription.unsubscribe();
    this.revokeChoiceSubscription.unsubscribe();
    this.noCookieLawSubscription.unsubscribe();
  }
}
