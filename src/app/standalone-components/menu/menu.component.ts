import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {User} from "../../shared/_models/user.model";
import {MediaMatcher} from "@angular/cdk/layout";
import {UserDataService} from "../../shared/_services/userData.service";
import {JwtTokenService} from "../../shared/_services/jwtToken.service";
import {Router} from "@angular/router";
import {AuthService} from "../../shared/_services/auth.service";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {DomainsService} from "../../shared/_services/domains.service";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit{
  isOpen = false;

  user: User;
  isAdmin = false;
  isStaff = false;
  isProvider = false;
  name: string;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isResourcesClicked = false;
  isCMSClicked = false;
  isConfigClicked = false;
  isReportsClicked = false;
  isSettingsClicked = false;

  imgPath = "assets/images/others/user.jpg";
  decodedToken: { [p: string]: string };
  isHealthCare: boolean;


  constructor(changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              private userData: UserDataService,
              private tokenService: JwtTokenService,
              private router: Router,
              public authService: AuthService,
              private domainService: DomainsService) {
    this.mobileQuery = media.matchMedia('(max-width:768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.decodedToken = this.tokenService.getDecodedToken();
  }


  ngOnInit(): void {

    this.userData.getCurrentUser().subscribe((res: User) => {
      console.log('user', res);
      this.user = res;
      this.imgPath = res.avatar?.filePath;
      this.name = this.user.firstName + " " + this.user.lastName;
      res.roles.forEach((role: string) => {
        if (role === 'ROLE_SUPER_ADMIN') {
          this.isAdmin = true;
          this.isStaff = false;
          this.isProvider = false;
        } else if (role === 'ROLE_STAFF') {
          this.isAdmin = false;
          this.isStaff = true;
          this.isProvider = false;
        } else if (role === 'ROLE_PROVIDER') {
          this.isAdmin = false;
          this.isStaff = false;
          this.isProvider = true;
          this.domainService.getDomainById(this.user.domain).subscribe((resp: any) => {
            console.log('check domain', resp);
            if(resp.key === 'healthcare' && (this.user.domain === resp.id)) {
              this.isHealthCare = true;
              console.log(' e healthcare');
            }
          })
        }
      })



    })
  }


  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  onResourcesClick() {
    this.isResourcesClicked = !this.isResourcesClicked;
  }

  onCMSClick() {
    this.isCMSClicked = !this.isCMSClicked;
  }

  onConfigClick() {
    this.isConfigClicked = !this.isConfigClicked;
  }


  onReportsClick() {
    this.isReportsClicked = !this.isReportsClicked;
  }

  onSettingsClick() {
    this.isSettingsClicked = !this.isSettingsClicked;
  }
}
