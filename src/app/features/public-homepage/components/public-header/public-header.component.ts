import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AppService} from "../../../../app.service";
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../../../shared/_services/auth.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import Map from "ol/Map";
import {LoginComponent} from "../../../auth/login/login.component";
import View from "ol/View";
import {fromLonLat} from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {AppSettings} from "../../../../app.settings";
import {UserDataService} from "../../../../shared/_services/userData.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss']
})
export class PublicHeaderComponent {
  @Output() menuIconClick: EventEmitter<any> = new EventEmitter<any>();
  constructor(public appService:AppService,
              public modalService: MatDialog,
              private authService: AuthService,
              private ngbModalService: NgbModal,
              public settings:AppSettings,
              private deviceDetectorService: DeviceDetectorService,
              public translateService: TranslateService,
              private usersService: UserDataService) { }

  map: Map;

  @Input() redirectUrl: string;
  @Input() userConnected: boolean;

  public isDekstop = true;
  public languages = [
    {
      name: "RO",
      icon: "assets/images/flags/ro_lang.svg"
    },
    {
      name: "EN",
      icon: "assets/images/flags/en_lang.svg"
    }
    ];
  public selectedLanguage = this.languages[0];

  ngOnInit() {
    this.isDekstop = this.deviceDetectorService.isDesktop();
    this.authService.userChangedObs.subscribe(() => {
      this.modalService.closeAll();
    })

  }


  public sidenavToggle(){
    this.menuIconClick.emit();
  }


  openAuthModal() {
    this.modalService.open(LoginComponent, {width: "100%", maxWidth: 1000, height: "90%"})
  }

  openNgbModal(templateRef) {
    this.ngbModalService.open(templateRef, {centered: true, fullscreen: true});

    // open layers map init
    this.map = new Map({
      view: new View({
        center: fromLonLat([28.0197559, 45.4462889]),
        zoom: 12,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'ol-map'
    });
  }

  changeLanguage() {
    this.translateService.use(this.selectedLanguage.name.toLowerCase());
  }
}
