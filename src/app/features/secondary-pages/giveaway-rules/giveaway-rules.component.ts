import { Component, OnInit, OnDestroy } from "@angular/core";
import { PagesService } from "../_services/pages.service";
import { Subscription } from "rxjs";
import {TranslateService} from "@ngx-translate/core";

interface PageResponse {
  id: string;
  name: string;
  content: string;
}

@Component({
  selector: "app-giveaway-rules",
  templateUrl: "./giveaway-rules.component.html",
  styleUrls: ["./giveaway-rules.component.scss"],
})
export class GiveawayRulesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  content: string | null = null;
  isLoading: boolean;
  public ro = true;

  constructor(private pagesService: PagesService,
              private translateService: TranslateService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.pagesService.listSecondaryPages().subscribe({
        next: (resp: PageResponse[]) => {
          const giveawayRules = resp.find(
            (page) => page.name === "Privacy Policy"
          );
          if (giveawayRules) {
            this.subscriptions.add(
              this.pagesService
                .getSecondaryPageById(giveawayRules.id)
                .subscribe({
                  next: (page: PageResponse) => {
                    this.content = page.content;
                    this.isLoading = false;
                  },
                  error: (error) => {
                    console.error("Error fetching giveaway rules:", error);
                    this.isLoading = false;
                  },
                })
            );
          } else {
            console.error("Giveaway rules page not found");
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error("Error fetching pages:", error);
          this.isLoading = false;
        },
      })
    );
    this.translateService.onLangChange.subscribe((res) => {
        this.ro = (res && res.lang === 'ro');
    })
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
