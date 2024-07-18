import {ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatCardModule} from "@angular/material/card";
import {Subject} from "rxjs";
import {DomainsService} from "../../shared/_services/domains.service";
import {Domain} from "../../shared/_models/domain.model";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../shared/_services/toast.service";
import {Router} from "@angular/router";
import {TranslateModule, TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-domains-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, TranslateModule, MatDialogModule],
  templateUrl: './domains-selector.component.html',
  styleUrls: ['./domains-selector.component.scss']
})
export class DomainsSelectorComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  listOfDomains: Domain[];
  currentLanguage: string;

  constructor(
      private dialog: MatDialog,
      private domainsService: DomainsService,
      private toastService: ToastService,
      private router: Router,
      private translate: TranslateService,
      private cdr: ChangeDetectorRef,
      ) { }

  ngOnInit(): void {
      this.domainsService.getListOfDomains()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: res => {
            this.listOfDomains = res;
          },
          error: () => {
            this.toastService.showToast(
                this.translate.instant("TOAST.ERROR"),
                this.translate.instant("TOAST.SERVER-ERROR"),
                "error");
          }
        });
  }

  openDomainsModal(modal: TemplateRef<any>) {
    this.currentLanguage = this.translate.currentLang;
    this.dialog.open(modal, {width: "100%", maxWidth: 1400, maxHeight: "80vh", height: "auto"});
  }

  onClickGoToDomain(domainId: string) {

    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([`/client/domain/${domainId}`]);
  });

    // this.router.navigate([`/client/domain/${domainId}`]);
    // this.domainsService.triggerDomainChanges(true);
    // this.cdr.detectChanges();
    this.dialog.closeAll();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
    
}
