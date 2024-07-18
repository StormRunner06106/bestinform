import {Component, OnInit} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";

enum LangOptions {
  RO,
  EN
}

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss']
})
export class FeedbackPageComponent implements OnInit{

  pageLang: LangOptions;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
    this.location.subscribe((event) => {
      // Check if the user is trying to navigate back
      if (event && event.type === 'popstate') {
        window.location.reload();
      }
    });
  }

  text = {
    successMsg : ['Felicitări! Solicitarea ta de înscriere a fost trimisă cu succes!', 'Congratulations! Your registration request has been successfully submitted!'],
    button: ['Înapoi spre site', 'Back to the site']
  }

  ngOnInit() {
    const currentRoute = this.route.snapshot.url.join('/');
    if (currentRoute.includes('ro')) {
      this.pageLang = LangOptions.RO;
    } else if (currentRoute.includes('en')) {
      this.pageLang = LangOptions.EN;
    } else {
      void this.router.navigate(['/parteneri/success/ro']);
    }
  }

  goToPartnerHP() {
    // this.router.navigate(['/parteneri/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en')]);
    window.location.href = '/parteneri/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en');
  }
}
