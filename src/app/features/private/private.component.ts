import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent {

  constructor(private router: Router) {
  }

  showMenu= true;

  ngOnInit(){

    if(this.router.url.includes('/editorials/view')){
      this.showMenu=false;
    }

  }


}
