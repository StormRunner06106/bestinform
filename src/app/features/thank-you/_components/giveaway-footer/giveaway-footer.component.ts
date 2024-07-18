import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// Import additional modules, services, etc., as needed

@Component({
  selector: 'app-giveaway-footer',
  templateUrl: './giveaway-footer.component.html',
  styleUrls: ['./giveaway-footer.component.scss']
})
export class GiveawayFooterComponent {
  selectedValue: string;
  // Properties for any dynamic data
  // Example: selectedLanguage = 'en';

  
  constructor(
    private translateService: TranslateService,
    // other services can be injected here
  ) {
    this.selectedValue = this.translateService.currentLang;
  }

  changeLang(lang: string) {
    this.selectedValue = lang;
    this.translateService.use(lang);
  }

  // Methods for any functionality
  // Example: changeLanguage(lang: string) { this.selectedLanguage = lang; }
}
