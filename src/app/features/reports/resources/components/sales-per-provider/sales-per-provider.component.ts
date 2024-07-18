import { Component, Input, OnInit } from "@angular/core";

import { DatePipe } from "@angular/common";
import { ReportsService } from "../../../_services/reports.service";
import { UserDataService } from "../../../../../shared/_services/userData.service";
import { User } from "../../../../../shared/_models/user.model";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: "app-sales-per-provider",
  templateUrl: "./sales-per-provider.component.html",
  styleUrls: ["./sales-per-provider.component.scss"],
  providers: [DatePipe],
})
export class SalesPerProviderComponent implements OnInit {
  constructor(
    private reportsService: ReportsService,
    private userService: UserDataService,
    public datepipe: DatePipe
  ) {}

  @Input() providerId?: string;
  @Input() userRole: string;

  providerName: string;

  filterProvider: string;
  filterEndDate = new Date();
  filterStartDate = new Date(
    new Date().setDate(this.filterEndDate.getDate() - 30)
  );
  filterTime = "Daily";
  filterReportType = "all-sales";
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
    { value: "all-sales", viewValue: "Toate vanzarile" },
    { value: "all-resources", viewValue: "Toate resursele" },
    { value: "domain-sales", viewValue: "Toate domeniile" },
  ];

  ngOnInit() {
    if (this.userRole === "staff") {
      this.userService.getUserById(this.providerId).subscribe((resp: User) => {
        console.log("avem provider 2", resp);
        this.providerName = resp.companyName;
        this.applyFilter();
      });
    } else if (this.userRole === "provider") {
      console.log("sunt provider 3");
      this.userService.getCurrentUser().subscribe((resp: User) => {
        this.providerId = resp.id;
        this.providerName = resp.companyName;
        this.applyFilter();
      });
    }
  }

  applyFilter() {
    this.actualFilter = {
      filterEndDate: this.filterEndDate,
      filterStartDate: this.filterStartDate,
      filterTime: this.filterTime,
      filterType: this.filterReportType,
    };

    console.log("actual filter", this.actualFilter);

    if (this.actualFilter.filterType === "all-sales") {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ProviderSalesReport" +
        this.actualFilter.filterTime +
        "Param.html?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      console.log(this.urlSafe);
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ProviderSalesReport" +
        this.actualFilter.filterTime +
        "Param.pdf?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
    } else if (this.actualFilter.filterType === "all-resources") {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ResourceSalesReport" +
        this.actualFilter.filterTime +
        "Param.html?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ResourceSalesReport" +
        this.actualFilter.filterTime +
        "Param.pdf?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
    } else if (this.actualFilter.filterType === "domain-sales") {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/DomainSalesReport" +
        this.actualFilter.filterTime +
        "Param.html?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/DomainSalesReport" +
        this.actualFilter.filterTime +
        "Param.pdf?providerId=" +
        this.providerId +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
    }
  }

  clearFields() {
    this.filterEndDate = new Date();
    this.filterStartDate = new Date(
      new Date().setDate(this.filterEndDate.getDate() - 30)
    );
    this.filterTime = "Daily";
    this.filterReportType = "all-sales";
    this.applyFilter();
  }
}
