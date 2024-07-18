import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})
export class NewsletterComponent implements OnInit{

  lang: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    console.log(route.snapshot);
  }

  ngOnInit() {
    console.log('init');
    const currentRoute = this.route.snapshot.url.join('/');

    if (currentRoute.includes('ro')) {
      this.lang = 'ro';
      console.log('Route contains the string');
    } else if (currentRoute.includes('en')) {
      this.lang = 'en';
      console.log('Route does not contain the string');
    } else {
      this.router.navigate(['/newsletter-old/en']);
    }
  }


}
