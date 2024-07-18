import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Editorial} from "../../shared/_models/editorial.model";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-editorial-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './editorial-card.component.html',
  styleUrls: ['./editorial-card.component.scss']
})
export class EditorialCardComponent {
  @Input() editorial: Editorial;

  notFoundImg = "https://static.onecms.io/wp-content/uploads/sites/47/2020/12/18/cross-eyed-cat-2000.jpg";


}
