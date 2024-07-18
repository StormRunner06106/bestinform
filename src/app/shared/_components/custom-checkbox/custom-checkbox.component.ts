import {Component, Input} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-custom-checkbox',
  templateUrl: './custom-checkbox.component.html',
  styleUrls: ['./custom-checkbox.component.scss']
})
export class CustomCheckboxComponent {

  @Input() control: FormControl;
  @Input() name: string;

  changeValue(event: any) {
    const checked = event.target.checked;
    this.control.setValue(checked ? 'true' : 'false');
  }

}
