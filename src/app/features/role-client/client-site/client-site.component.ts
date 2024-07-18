import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client-site',
  templateUrl: './client-site.component.html',
  styleUrls: ['./client-site.component.scss']
})
export class ClientSiteComponent {
  isHomepage = false;
  constructor(private router: Router) {
    this.isHomepage = window.location.pathname.endsWith('63bfcca765dc3f3863af755c');
    this.router.events.subscribe(() => {
      this.isHomepage = window.location.pathname.endsWith('63bfcca765dc3f3863af755c');
    });
  }
}
