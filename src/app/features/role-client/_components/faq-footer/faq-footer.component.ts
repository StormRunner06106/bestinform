import {Component} from '@angular/core';
import {LocalStorageService} from "../../../../shared/_services/localStorage.service";
import {TranslateService} from "@ngx-translate/core";
import {LanguageStorageService} from "../../../../shared/_services/languageStorage.service";

@Component({
    selector: 'app-faq-footer',
    templateUrl: './faq-footer.component.html',
    styleUrls: ['./faq-footer.component.scss']
})
export class FaqFooterComponent {
    selectedValue = "ro";
    selectedCurrency = "lei";
    public langName = '';
    // currentApplicationVersion = environment.appVersion;

    constructor(private translateService: TranslateService,
                private localStorage: LocalStorageService,
                public languageService:LanguageStorageService
    ) {
        this.selectedValue = this.localStorage.get('langFromStorage');
        if (this.selectedValue) {
            this.translateService.use(this.selectedValue);
        } else {
            this.translateService.use('ro');
        }    }

    public changeLang(lang:string){

        this.localStorage.set('langFromStorage',lang);

        this.selectedValue=lang;
        this.translateService.use(lang);
        this.langName = this.getLangName(lang);

        this.languageService.triggerUserLanguageChanges(lang);
    }


    public getLangName(lang: string) {
        if (lang == 'en') {
            return 'English';
        } else if (lang == 'ro') {
            return 'Romanian';
        } else {
            return 'English';
        }
    }

}
