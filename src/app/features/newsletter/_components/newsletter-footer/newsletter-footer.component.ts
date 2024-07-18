import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-newsletter-footer',
  templateUrl: './newsletter-footer.component.html',
  styleUrls: ['./newsletter-footer.component.scss']
})
export class NewsletterFooterComponent {
  @Input() pageLang: string;

}
