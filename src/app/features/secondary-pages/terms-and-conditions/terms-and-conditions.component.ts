import {Component, OnInit} from '@angular/core';
import {PagesService} from "../_services/pages.service";

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit{
  constructor(private pagesService: PagesService){}

  content: any;

  ngOnInit() {
    this.pagesService.listSecondaryPages().subscribe((resp: any) => {
      console.log('Lista pagini secundare');
      console.log(resp);
      const privacyPolicyId = resp.find(obj => {
        return obj.name === 'Privacy Policy';
      }).id;
      this.pagesService.getSecondaryPageById(privacyPolicyId).subscribe((page: any) => {
        this.content = page.content;
        console.log(this.content);
      })
    })
  }
}
