import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDataService} from "./userData.service";

@Injectable({
  providedIn: 'root'
})

export class LanguageStorageService{

    constructor(private userDataService: UserDataService) {
        // You can now use methods and properties of ServiceA within ServiceB
    }

    // Functions For Changes Detection
    private languageChanged = new BehaviorSubject(false);
    languageChangedObs = this.languageChanged.asObservable();

      // Trigger list changes
    triggerUserLanguageChanges(lang: any) {



        console.log('trigger', lang)
        this.userDataService.getCurrentSetting().subscribe((resp: any) => {
            console.log('resp settings', resp);

            if (resp) {
                resp.language = lang;
                this.userDataService.updateCurrentSetting(resp).subscribe((newResp: any) => {
                    console.log('updated settings', resp, newResp);
                    location.reload();
                })
            } else {
                location.reload();
            }

        })

    // // Change the subject value
    // this.languageChanged.next(lang);
  }

}
