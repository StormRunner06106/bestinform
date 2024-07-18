import { Component, Input } from '@angular/core';
import { AiData } from 'src/app/shared/_models/ai.model';

@Component({
  selector: 'app-ai-card',
  templateUrl: './ai-card.component.html',
  styleUrls: ['./ai-card.component.scss']
})
export class AiCardComponent  {

  @Input() event: AiData;

}
