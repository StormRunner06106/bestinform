import { Component, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
import { TranslateService } from "@ngx-translate/core";

enum Language {
  English = "en",
  Romanian = "ro",
}

@Component({
  selector: "app-secondary-pages",
  templateUrl: "./secondary-pages.component.html",
  styleUrls: ["./secondary-pages.component.scss"],
})
export class SecondaryPagesComponent implements OnInit {
  selectedValue: Language = Language.Romanian;
  langName: string;
  currentApplicationVersion = environment.appVersion;

  private readonly languageNames = {
    [Language.English]: "English",
    [Language.Romanian]: "Romanian",
  };

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.langName = this.getLangName(this.selectedValue);
  }

  changeLang(lang: Language): void {
    this.translateService.use(lang);
    this.langName = this.getLangName(lang);
  }

  private getLangName(lang: Language): string {
    return this.languageNames[lang] || "English";
  }
}
