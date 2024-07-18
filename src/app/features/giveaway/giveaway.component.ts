import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-giveaway',
  templateUrl: './giveaway.component.html',
  styleUrls: ['./giveaway.component.scss']
})
export class GiveawayComponent implements OnInit {

  lang: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const currentRoute = this.route.snapshot.url.join('/');

    // Determine language based on the URL
    if (currentRoute.includes('ro')) {
      this.lang = 'ro';
    } else if (currentRoute.includes('en')) {
      this.lang = 'en';
    } else {
      // Redirect to a default route if the language is not specified
      this.router.navigate(['/giveaway/en']);
    }
  }
}
