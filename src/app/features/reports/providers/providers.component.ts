import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ReportsService } from "../_services/reports.service";
import fileSaver from "file-saver";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {environment} from "../../../../environments/environment";

@Component({
  selector: "app-providers",
  templateUrl: "./providers.component.html",
  styleUrls: ["./providers.component.scss"],
})
export class ProvidersComponent implements OnInit {
  constructor(
    private reportsService: ReportsService,
    private sanitizer: DomSanitizer
  ) {}

  urlSafe: SafeResourceUrl;

  ngOnInit() {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${environment.api_url}/jasperserver/rest_v2/reports/reports/ProviderSalesReportMonthly.html`
    );
  }
}
