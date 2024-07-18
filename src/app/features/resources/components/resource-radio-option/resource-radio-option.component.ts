import {AfterViewInit, ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({
    selector: 'app-resource-radio-option',
    templateUrl: './resource-radio-option.component.html',
    styleUrls: ['./resource-radio-option.component.scss']
})
export class ResourceRadioOptionComponent implements AfterViewInit {

    @Input() iconPath: string;
    @Input() optionName: string;
    @Input() optionId: string;
    @Input() initialValue: any;
    @Input() disabled: boolean;


    constructor(private cd: ChangeDetectorRef) {

    }

    ngAfterViewInit() {
        this.cd.detectChanges();
    }

}
