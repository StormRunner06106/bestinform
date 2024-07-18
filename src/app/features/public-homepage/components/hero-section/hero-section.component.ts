import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AppSettings, Settings} from "../../../../app.settings";
import {DomSanitizer} from "@angular/platform-browser";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LoginComponent} from "../../../auth/login/login.component";
import {MatDialog} from "@angular/material/dialog";
import {RegisterComponent} from "../../../auth/register/register.component";

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, OnChanges{
  @Input() backgroundImage;
  @Input() title;
  @Input() buttonText;
  @Input() desc;
  @Input() fullscreen = false;

  @Input() redirectUrl: string;
  @Input() userConnected: boolean;

  public bgImage;
  public settings: Settings;

  constructor(public appSettings: AppSettings,
              private sanitizer: DomSanitizer,
              public modalService: MatDialog) {
    this.settings = this.appSettings.settings;
    console.log(this.settings);
    console.log('user connected 2', this.userConnected)

    setTimeout(() => {
      this.settings.headerBgImage = true;
    });
  }

  ngOnInit() {
    if (this.backgroundImage) {
      this.bgImage = this.sanitizer.bypassSecurityTrustStyle('url(' + this.backgroundImage + ')');
    }

    console.log('user connected 1', this.userConnected)
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
  }

  openAuthModal() {
    this.modalService.open(RegisterComponent, {width: "100%", maxWidth: 1000, height: "90%", data: {
        role: 'ROLE_CLIENT'
      } })
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.settings.headerBgImage = false;
      this.settings.contentOffsetToTop = false;
    });
  }
}
