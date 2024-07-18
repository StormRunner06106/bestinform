import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Homepage} from "../_models/homepage.model";

@Injectable({
  providedIn: 'root'
})
export class HomepageService {

  constructor(private http: HttpClient) { }

  getHomepageByLanguageAndApp(language: 'en' | 'ro', app: 'web' | 'mobile') {
    return this.http.get('/bestinform/getHomepageByLanguageAndApp?language=' + language + '&app=' + app);
  }

  getHomepageById(homepageId: string) {
    return this.http.get('/bestinform/getHomepageById?homepageId=' + homepageId);
  }

  createHomepage(homepageObject: Homepage) {
    return this.http.post('/bestinform/createHomepage', homepageObject);
  }

  updateHomepage(homepageId: string, homepageObject: Homepage) {
    return this.http.put('/bestinform/updateHomepage?homepageId=' + homepageId, homepageObject);
  }

  uploadHomepageImage(homepageId: string, imageType: 'background' | 'trial', file) {
    return this.http.post('/bestinform/uploadHomepageImage?homepageId=' + homepageId + '&imageType=' + imageType, file);
  }
}
