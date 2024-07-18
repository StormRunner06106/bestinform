import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class SettingsService {



  constructor(private http: HttpClient) { }

  getCurrentSettings(){
    return this.http.get('/bestinform/getCurrentSetting');
}


}
