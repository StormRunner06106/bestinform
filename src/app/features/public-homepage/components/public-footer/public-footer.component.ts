import {ChangeDetectorRef, Component} from '@angular/core';
import {ToastService} from "../../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "../../../../shared/_services/localStorage.service";
import {LanguageStorageService} from "../../../../shared/_services/languageStorage.service";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
  selector: 'app-public-footer',
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.scss']
})
export class PublicFooterComponent {
  nr = 1;

  selectedValue = "ro";
  public langName = '';
  langShort:string;
  public isDesktop = true;


  constructor(private toastService: ToastService,
              public translateService: TranslateService,
              public localStorage:LocalStorageService,
              public cdr: ChangeDetectorRef,
              public deviceDetectorService: DeviceDetectorService,
              public languageService:LanguageStorageService) {

    this.selectedValue = this.localStorage.get('langFromStorage');
    this.isDesktop = this.deviceDetectorService.isDesktop();
    if(this.translateService.currentLang && this.translateService.currentLang === 'ro') {
      this.translateService.use('ro');
    } else {
      this.translateService.use('en');
    }
  }

  showToast(type) {
    this.toastService.showToast('titlu', this.nr.toString(), type);
    this.nr++;
  }

  public changeLang(lang:string){

    // console.log("Asta este langshort", this.langShort);
    // this.langShort=this.langShort ? this.langShort : 'ro';

    //this.languageService.languageChangedObs.subscribe((data: boolean)=>{
    //this.langShort=lang ? lang : 'ro';
    this.localStorage.set('langFromStorage',lang);

    this.selectedValue=lang;
    this.translateService.use(lang);
    this.langName = this.getLangName(lang);

    this.languageService.triggerUserLanguageChanges(lang);
    // this.languageService.triggerUserLanguageChanges(false);
    //this.cdr.detectChanges();

    //})


    // this.cdr.detectChanges();
    // this.cdr.detectChanges();
    // console.log(this.langName);
    // console.log(lang);
  }

  public getLangName(lang:string){
    if(lang == 'en'){
      this.langShort=lang;
      return 'English';
    }
    else if(lang == 'ro'){
      this.langShort=lang;
      return 'Romanian';
    }
    else{
      this.langShort='ro';
      return 'Romanian';
    }
  }
}
