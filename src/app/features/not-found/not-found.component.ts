import {AfterViewInit, Component} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements AfterViewInit {

  constructor(public router:Router) { }

  public goHome(): void {
    this.router.navigate(['/']);
  }

  ngAfterViewInit(){
    document.getElementById('preloader').classList.add('hide');
  }

}
