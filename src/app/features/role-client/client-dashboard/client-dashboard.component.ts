import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent {
  constructor(private route: ActivatedRoute) {
    console.log('this.route.pathFromRoot', this.route.pathFromRoot);
  }
}
