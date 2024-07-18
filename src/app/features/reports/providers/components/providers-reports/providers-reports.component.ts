import { Component } from "@angular/core";
import { ReportsService } from "../../../_services/reports.service";
import { UserDataService } from "../../../../../shared/_services/userData.service";
import { DatePipe } from "@angular/common";
import { DomainsService } from "../../../../../shared/_services/domains.service";
import { Domains } from "../../../../../shared/_domains";
import { Domain } from "../../../../../shared/_models/domain.model";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: "app-providers-reports",
  templateUrl: "./providers-reports.component.html",
  styleUrls: ["./providers-reports.component.scss"],
  providers: [DatePipe],
})
export class ProvidersReportsComponent {
  constructor(
    private reportsService: ReportsService,
    private domainsService: DomainsService,
    public datepipe: DatePipe
  ) {}

  providerName: string;

  filterProvider: string;
  filterEndDate = "";
  filterStartDate = "";
  filterTime = "Daily";
  filterReportType = "all-sales";
  filterDomain = "";
  filterDomainName = "";
  domainsList = [];

  urlSafe;
  baseUrl = environment.api_url;

  urlToDownload: string;

  actualFilter = {
    filterEndDate: this.filterEndDate,
    filterStartDate: this.filterStartDate,
    filterTime: "Daily",
    filterType: "all-sales",
    filterDomain: this.filterDomain,
    filterDomainName: "",
  };

  timePeriods = [
    { value: "Daily", viewValue: "Daily" },
    { value: "Monthly", viewValue: "Monthly" },
    { value: "Annually", viewValue: "Annually" },
  ];

  reportTypes = [
    { value: "all-sales", viewValue: "Toate vânzările" },
    {
      value: "top-10-best-sales",
      viewValue: "Top 10 provideri - Resurse consumate",
    },
    {
      value: "top-10-less-sales",
      viewValue: "Top 10 provideri - Resurse neconsumate",
    },
  ];

  ngOnInit() {
    this.domainsService.getListOfDomains().subscribe((resp: any) => {
      console.log("domenii", resp);
      this.domainsList = resp.map((sourceObject) => ({
        itemId: sourceObject.id,
        itemName: sourceObject.nameRo,
      }));
      // this.filterDomain = this.domainsList[0].itemId
    });

    this.applyFilter();
  }

  applyFilter() {
    if (this.filterReportType === "all-sales") {
      this.filterStartDate = "";
      this.filterEndDate = "";
      this.filterDomain = "";
      this.filterDomainName = "";
    }

    this.actualFilter = {
      filterEndDate: this.filterEndDate,
      filterStartDate: this.filterStartDate,
      filterTime: this.filterTime,
      filterType: this.filterReportType,
      filterDomain: this.filterDomain,
      filterDomainName: "",
    };

    this.actualFilter.filterDomainName = this.domainsList.find(
      (item) => item.itemId === this.actualFilter.filterDomain
    )?.itemName;

    console.log("actual filter", this.actualFilter);

    if (this.actualFilter.filterType === "all-sales") {
      console.log("test 0");
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ProviderSalesReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/ProviderSalesReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (
      this.actualFilter.filterType === "top-10-best-sales" &&
      this.actualFilter.filterStartDate === "" &&
      this.actualFilter.filterDomain === ""
    ) {
      console.log("test 1");
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopDomainSaleReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopDomainSaleReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (
      this.actualFilter.filterType === "top-10-less-sales" &&
      this.actualFilter.filterStartDate === "" &&
      this.actualFilter.filterDomain === ""
    ) {
      console.log("test 2");
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/LeastDomainSaleReport" +
        this.actualFilter.filterTime +
        ".html";
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/LeastDomainSaleReport" +
        this.actualFilter.filterTime +
        ".pdf";
    } else if (
      this.actualFilter.filterType === "top-10-best-sales" &&
      this.actualFilter.filterStartDate !== "" &&
      this.actualFilter.filterDomain !== ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopDomainSaleReport" +
        this.actualFilter.filterTime +
        "Param.html?" +
        "domain=" +
        this.actualFilter.filterDomain +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/TopDomainSaleReport" +
        this.actualFilter.filterTime +
        "Param.pdf?" +
        "domain=" +
        this.actualFilter.filterDomain +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
    } else if (
      this.actualFilter.filterType === "top-10-less-sales" &&
      this.actualFilter.filterStartDate !== "" &&
      this.actualFilter.filterDomain !== ""
    ) {
      this.urlSafe =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/LeastDomainSaleReport" +
        this.actualFilter.filterTime +
        "Param.html?" +
        "domain=" +
        this.actualFilter.filterDomain +
        "&startDate=" +
        this.datepipe.transform(
          this.actualFilter.filterStartDate,
          "yyyy-MM-dd"
        ) +
        "&endDate=" +
        this.datepipe.transform(this.actualFilter.filterEndDate, "yyyy-MM-dd");
      this.urlToDownload =
        this.baseUrl +
        "/jasperserver/rest_v2/reports/reports/LeastDomainSaleReport" +
        this.actualFilter.filterTime +
        "Param.pdf?" +
        "domain=" +
        this.actualFilter.filterDomain +
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
    this.filterEndDate = "";
    this.filterStartDate = "";
    this.filterTime = "Daily";
    this.filterReportType = "all-sales";
    this.filterDomain = "";
    this.filterDomainName = "";
    this.applyFilter();
  }
}
