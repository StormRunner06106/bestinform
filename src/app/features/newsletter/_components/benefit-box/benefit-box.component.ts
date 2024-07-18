import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-benefit-box',
  templateUrl: './benefit-box.component.html',
  styleUrls: ['./benefit-box.component.scss']
})
export class BenefitBoxComponent implements OnInit{

  @Input() color: number;
  @Input() data: any;
  colorClass: string;

  ngOnInit() {
    if(this.color <4){
      if(this.color%2 === 0){
        this.colorClass ='white';
      }else{
        this.colorClass='blue';
      }
    }else{
      if(this.color%2 === 0){
        this.colorClass ='blue';
      }else{
        this.colorClass='white';
      }
    }

  }
}
