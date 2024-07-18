import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class PublicHomepageService {

    baseApiContentUrl = "/bestinform/uploadHomepageImage";
    // baseApiBackgroundUrl = "/bestinform/uploadBackgroundImage";
  constructor(private http: HttpClient) {
  }

  updateHomepage(hp: object) {
    return this.http.put('/bestinform/updateHomepage', hp);
  }

  createHomepage(hp: object) {
    return this.http.post('/bestinform/createHomepage', hp);
  }

  getHomepageByLanguageAndApp(language: string, app:string) {
    return this.http.get('/bestinform/getHomepageByLanguageAndApp?language=' + language + '&app=' +app);
  }

  getHomepageById(homepageId : string) {
    return this.http.get('/bestinform/getHomepageById?homepageId=' + homepageId);
  }

   // Returns an observable
   uploadHomepageImage(homepageId: string, imageType:string, file: string | Blob): Observable<any> {

    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append("file", file);

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseApiContentUrl + '?homepageId=' + homepageId + '?homepageId=imageType=' + imageType, formData)

  }


   // Returns an observable
//    uploadBackgroundImage(homepageId: string, file: any): Observable<any> {

//     // Create form data
//     const formData = new FormData();

//     // Store form name as "file" with file data
//     formData.append("file", file);

//     // Make http post request over api
//     // with formData as req
//     return this.http.post(this.baseApiBackgroundUrl + '?homepageId=' + homepageId, formData)
//   }

    activateUserViaCode(registrationCode: string, dataObj: any) {
        return this.http.post('/bestinform/activateUserViaCode?registrationCode=' + registrationCode,
            dataObj);
    }

    sendRegistrationEmail(email: string) {
        return this.http.post('/bestinform/resendRegistrationCode',
            email);
    }


}
