import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SettingsService } from "./settings.service";

@Injectable({
  providedIn: "root",
})
export class SmartBillService {
  userEmail = "bestinform.eu@yahoo.com";
  userToken = "002|99f836f3345e942bb685edeb6b149355";

  // userEmail: string;
  // userToken: string;
  httpHeaderOptions: any;
  getHttpOptions: any;
  settingsData: any;

  constructor(
    private http: HttpClient,
    private settingService: SettingsService
  ) {
    // this.settingService.getSettings().subscribe((settingsData: any) => {
    //
    //     this.settingsData = settingsData;
    //     this.userEmail = settingsData.smartBillEmail;
    //     this.userToken = settingsData.smartBillToken;
    //
    //     this.httpHeaderOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'authorization': 'Basic ' + btoa(this.userEmail + ":" + this.userToken)
    //         })
    //     };
    //
    //     this.getHttpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/xml',
    //             'Accept': 'application/xml, application/octet-stream',
    //             'authorization': 'Basic ' + btoa(this.userEmail + ":" + this.userToken),
    //             'Content-Disposition': 'attachment'
    //         })
    //     }
    // })

    this.httpHeaderOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: "Basic " + btoa(this.userEmail + ":" + this.userToken),
      }),
    };

    this.getHttpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/xml",
        Accept: "application/xml, application/octet-stream",
        authorization: "Basic " + btoa(this.userEmail + ":" + this.userToken),
        "Content-Disposition": "attachment",
      }),
    };
  }

  // createInvoice(invoiceData: any) {
  //     return this.http.post('https://ws.smartbill.ro/SBORO/api/invoice', invoiceData, this.httpHeaderOptions);
  // }
  //
  // createProformaInvoice(proformaData: any) {
  //     return this.http.post('https://ws.smartbill.ro/SBORO/api/estimate', proformaData, this.httpHeaderOptions);
  // }
  //
  // sendInvoiceEmail(invoiceEmail: any) {
  //     return this.http.post('https://ws.smartbill.ro/SBORO/api/document/send', invoiceEmail, this.httpHeaderOptions);
  // }

  downloadFile(seriesName: string, seriesNumber: string): any {
    return this.http.get(
      "https://ws.smartbill.ro/SBORO/api/invoice/pdf?cif=RO28554014&seriesname=" +
        seriesName +
        "&number=" +
        seriesNumber,
      {
        headers: this.getHttpOptions.headers,
        responseType: "blob",
      }
    );
  }

  viewBill(billObject: any) {
    return this.http.post('/bestinform/viewBill', billObject, { responseType: 'blob' });
  }

}
