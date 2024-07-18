import {Component, OnInit} from '@angular/core';
import {UserDataService} from "../../../shared/_services/userData.service";
import {User} from "../../../shared/_models/user.model";
import {SystemSetting} from "../../../shared/_models/system-setting.model";
import {SystemSettingsService} from "../../../shared/_services/system-settings.service";
import {ResourcesService} from "../../../shared/_services/resources.service";

@Component({
  selector: 'app-provider-dashboard',
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit{

  user: User;

  constructor(private userData: UserDataService,
              private systemService: SystemSettingsService,
              private resourcesService: ResourcesService) {
  }

  categoryEventsId: string;
  resourcesList = [];

  ngOnInit() {
    this.userData.getCurrentUser().subscribe((res: User) => {
      this.user = res;
      this.getSettings();
    })
  }

  getSettings() {
    this.systemService.getSystemSetting().subscribe({
      next: (settings: SystemSetting) => {
        this.categoryEventsId = settings.eventCategoryId;
        const filters = {
          userId: this.user.id,
          excludedCategories: [this.categoryEventsId]
        }
        this.resourcesService.listResourceFiltered(0, 1, 'date', 'desc', filters).subscribe((resp: any) => {
          this.resourcesList = resp.content;
        })
      }
    })
  }

}
