import {Component, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import {TranslateService} from "@ngx-translate/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {LocalStorageService} from "../../shared/_services/localStorage.service";
import {LanguageStorageService} from "../../shared/_services/languageStorage.service";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{

  selectedValue = "ro";
  public langName = '';
  langShort: string;
  currentApplicationVersion = environment.appVersion;

  constructor(public translateService: TranslateService,
              public localStorage:LocalStorageService,
              public languageService:LanguageStorageService) {
    this.selectedValue = this.localStorage.get('langFromStorage');
    if (this.selectedValue) {
      this.translateService.use(this.selectedValue);
    } else {
      this.translateService.use('ro');
    }
  }

  ngOnInit() {
    this.langShort=this.localStorage.get('langFromStorage');
  }

  public changeLang(lang:string) {

    this.localStorage.set('langFromStorage', lang);

    this.selectedValue = lang;
    this.translateService.use(lang);
    this.langName = this.getLangName(lang);

    this.languageService.triggerUserLanguageChanges(lang);

  }


  public getLangName(lang:string){
    if(lang == 'en'){
      return 'English';
    }
    else if(lang == 'ro'){
      return 'Romanian';
    }
    else{
      return 'English';
    }
  }
}
