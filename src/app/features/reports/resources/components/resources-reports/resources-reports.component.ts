import { Component, Input } from "@angular/core";
import { ReportsService } from "../../../_services/reports.service";
import { UserDataService } from "../../../../../shared/_services/userData.service";
import { DatePipe } from "@angular/common";
import { User } from "../../../../../shared/_models/user.model";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: "app-resources-reports",
  templateUrl: "./resources-reports.component.html",
  styleUrls: ["./resources-reports.component.scss"],
  providers: [DatePipe],
})
export class ResourcesReportsComponent {
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
  filterReportType = "all-resources";
  urlSafe;
  baseUrl = environment.api_url;

  urlToDownload: string;

  actualFilter = {
    filterEndDate: this.filterEndDate,
    filterStartDate: this.filterStartDate,
    filterTime: "Daily",
    filterType: "all-sales",
  };

  timePeriods = [
    { value: "Daily", viewValue: "Daily" },
    { value: "Monthly", viewValue: "Monthly" },
    { value: "Annually", viewValue: "Annually" },
  ];

  reportTypes = [
    { value: "all-resources", viewValue: "Toate resursele" },
    { value: "domain-sales", viewValue: "Toate domeniile" },
    { value: "top-10-resources", viewValue: "Top 10 resurse consumate" },
  ];

  ngOnInit() {
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterReportType !== "top-10-resources") {
      this.filterStartDate = "";
      this.filterEndDate = "";
    }

    this.actualFilter = {
      filterEndDate: this.filterEndDate,
      filterStartDate: this.filterStartDate,
      filterTime: this.filterTime,
      filterType: this.filterReportType,
    };

    console.log("actual filter", this.actualFilter);

    if (this.actualFilter.filterType === "all-resources") {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ResourceSalesReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ResourceSalesReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (this.actualFilter.filterType === "domain-sales") {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/DomainSalesReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/DomainSalesReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (
      this.actualFilter.filterType === "top-10-resources" &&
      this.actualFilter.filterStartDate === ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopResourceTypeSalesReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopResourceTypeSalesReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (
      this.actualFilter.filterType === "top-10-resources" &&
      this.actualFilter.filterStartDate !== ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopResourceTypeSalesReport" +
        this.actualFilter.filterTime +
        "Param.html?startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopResourceTypeSalesReport" +
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
    this.filterReportType = "top-10-resources";
    this.applyFilter();
  }
}
