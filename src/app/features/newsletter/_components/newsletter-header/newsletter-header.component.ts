import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-newsletter-header',
  templateUrl: './newsletter-header.component.html',
  styleUrls: ['./newsletter-header.component.scss']
})
export class NewsletterHeaderComponent {

  @Input() pageLang: string;

  constructor(private router: Router) {
  }

  changeRoute(pageLang: string) {
    console.log('route changed', pageLang);
    this.router.navigate(['/newsletter/'+ pageLang]);
  }
}
