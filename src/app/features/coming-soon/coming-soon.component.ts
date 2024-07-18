import {AfterViewInit, Component} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements AfterViewInit {

  title='Coming soon';
  photoPath='./assets/images/others/header-img.png';
  description='Live to explore.';

  constructor(public router:Router) { }

  ngAfterViewInit(){
    document.getElementById('preloader').classList.add('hide');
  }
}
