import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-attributes',
  templateUrl: './dynamic-attributes.component.html',
  styleUrls: ['./dynamic-attributes.component.scss']
})
export class DynamicAttributesComponent implements OnInit{
  @Input() control: any;
  @Input() inputFormData: any;

  constructor() {
  }

  ngOnInit() {
    // console.log(this.control);
    console.log(this.control.name);
  }

  changeValue(event: any) {
    let checked = event.target.checked;
    this.control.setValue(checked ? 'true' : 'false');
  }
}
