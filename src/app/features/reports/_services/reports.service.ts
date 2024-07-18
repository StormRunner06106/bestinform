import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReportsService {
  // fara port aici
  private url = `${environment.api_url}/jasperserver/rest_v2/login`;

  private options = {
    headers: new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    ),
  };

  constructor(private http: HttpClient) {}

  loginJasper(
    username: string,
    password: string
  ): Observable<HttpResponse<any>> {
    const formData = new URLSearchParams();
    formData.set("j_username", username);
    formData.set("j_password", password);

    return this.http
      .post<any>(this.url, formData.toString(), {
        ...this.options,
        observe: "response",
      })
      .pipe(
        // Use the tap operator to process the response
        tap((response) => {
          // Check if the response contains a 'Set-Cookie' header
          if (response.headers.has("Set-Cookie")) {
            console.log("headers jasper", response.headers);
            console.log("cookie jasper", response.headers.get("Set-Cookie"));

            // Get the value of the 'Set-Cookie' header
            const cookieValue = response.headers.get("Set-Cookie");

            // Save the cookie value to local storage
            localStorage.setItem("JasperID", cookieValue);
          }
        })
      );
  }
}
