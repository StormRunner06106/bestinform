import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-bf-chips',
    templateUrl: './bf-chips.component.html',
    styleUrls: ['./bf-chips.component.scss']
})
export class BfChipsComponent {

    @Input() name: string
    @Input() icon: { fileName: string, filePath: string }
}
