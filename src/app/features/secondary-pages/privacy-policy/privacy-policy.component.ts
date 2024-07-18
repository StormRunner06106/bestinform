import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ReservationsService} from "../../../shared/_services/reservations.service";
import {PagesService} from "../_services/pages.service";

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit{
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
