import { Component, OnInit } from "@angular/core";
import { ReportsService } from "../../../_services/reports.service";
import { UserDataService } from "../../../../../shared/_services/userData.service";
import { DatePipe } from "@angular/common";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: "app-clients-reports",
  templateUrl: "./clients-reports.component.html",
  styleUrls: ["./clients-reports.component.scss"],
  providers: [DatePipe],
})
export class ClientsReportsComponent implements OnInit {
  constructor(
    private reportsService: ReportsService,
    private userService: UserDataService,
    public datepipe: DatePipe
  ) {}

  providerName: string;

  filterProvider: string;
  filterEndDate = "";
  filterStartDate = "";
  filterTime = "Daily";
  filterReportType = "cancel-clients";
  urlSafe;
  baseUrl = environment.api_url;

  urlToDownload: string;

  actualFilter = {
    filterEndDate: this.filterEndDate,
    filterStartDate: this.filterStartDate,
    filterTime: "Daily",
    filterType: "cancel-clients",
  };

  timePeriods = [
    { value: "Daily", viewValue: "Daily" },
    { value: "Monthly", viewValue: "Monthly" },
    { value: "Annually", viewValue: "Annually" },
  ];

  reportTypes = [{ value: "cancel-clients", viewValue: "Anulări clienți" }];

  ngOnInit() {
    this.applyFilter();
  }

  applyFilter() {
    this.actualFilter = {
      filterEndDate: this.filterEndDate,
      filterStartDate: this.filterStartDate,
      filterTime: this.filterTime,
      filterType: this.filterReportType,
    };

    console.log("actual filter", this.actualFilter);

    if (
      this.actualFilter.filterType === "cancel-clients" &&
      this.actualFilter.filterStartDate === ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/CanceledSaleReport" +
        this.actualFilter.filterTime +
        ".html";
      // this.baseUrl + this.actualFilter.filterTime + '.html';
      this.urlToDownload =
        // this.baseUrl + '/jasperserver/rest_v2/reports/reports/CanceledSaleReport' + this.actualFilter.filterTime + '.pdf';
        this.baseUrl + this.actualFilter.filterTime + ".pdf";
    } else if (
      this.actualFilter.filterType === "cancel-clients" &&
      this.actualFilter.filterStartDate !== ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/CanceledSaleReport" +
        this.actualFilter.filterTime +
        "Param.html?startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      // this.baseUrl + this.actualFilter.filterTime + 'Param.html?startDate='
      // +  this.datepipe.transform(this.actualFilter.filterStartDate, 'yyyy-MM-dd')
      // + '&endDate=' + this.datepipe.transform(this.actualFilter.filterEndDate, 'yyyy-MM-dd');
      this.urlToDownload =
        // this.baseUrl + '/jasperserver/rest_v2/reports/reports/CanceledSaleReport' + this.actualFilter.filterTime + 'Param.pdf?startDate='
        // +  this.datepipe.transform(this.actualFilter.filterStartDate, 'yyyy-MM-dd')
        // + '&endDate=' + this.datepipe.transform(this.actualFilter.filterEndDate, 'yyyy-MM-dd');
        this.baseUrl +
        this.actualFilter.filterTime +
        "Param.pdf?startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
    }
  }

  clearFields() {
    this.filterEndDate = "";
    this.filterStartDate = "";
    this.filterTime = "Daily";
    this.filterReportType = "cancel-clients";
    this.applyFilter();
  }
}
