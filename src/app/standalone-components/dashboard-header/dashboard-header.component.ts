import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  isCallUsed = false;
  isExtraCallUsed = false;
  isBackCallUsed=false;


  @Input() pageTitleOne: string;
  @Input() routeTitleOne: string;

  @Input() pageSubTitleOne: string;

  @Input() pageTitleTwo: string;
  @Input() routeTitleTwo: string;

  @Input() pageTitleThree: string;
  @Input() routeTitleThree: string;

  @Input() buttonBackRoute: string;

  @Input() buttonAddRoute: string;

  @Input() buttonCallName: string;
  @Output() buttonCall = new EventEmitter<void>();

  @Input() buttonExtraName: string;
  @Output() buttonExtraCall = new EventEmitter<void>();

  @Input() buttonBackName: string;
  @Output() buttonBackCall = new EventEmitter<void>();

  @Input() buttonSaveDisabled = false;

  constructor(private location: Location, private router: Router, private r: ActivatedRoute) {}

  handleCall() {
    this.buttonCall.emit();
  }

  handleExtraCall() {
    this.buttonExtraCall.emit();
  }

  handleBackCall() {
    this.buttonBackCall.emit();
  }

  navigateToPreviousPage(): void {
    if (this.buttonBackRoute !== 'default') {
      this.router.navigate([this.buttonBackRoute], { relativeTo: this.r });
    } else {
      this.location.back();
    }
  }


  ngOnInit() {
    this.isBackCallUsed = this.buttonBackCall.observed;
    this.isCallUsed = this.buttonCall.observed;
    this.isExtraCallUsed = this.buttonExtraCall.observed;
  }


}
