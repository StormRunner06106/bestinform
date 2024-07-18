import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {AbstractControl, FormControl} from "@angular/forms";
import {Attribute} from "../../_models/attribute.model";

@Component({
    selector: 'app-dynamic-inputs',
    templateUrl: './dynamic-inputs.component.html',
    styleUrls: ['./dynamic-inputs.component.scss']
})
export class DynamicInputsComponent implements OnInit, OnDestroy {
    @Input() control: AbstractControl;
    @Input() inputFormData: Attribute;

    formControl: FormControl;

    private ngUnsubscribe = new Subject<void>();

    ngOnInit(): void {
        this.formControl = this.control as FormControl;
    }

    clearInput() {
        this.control.patchValue('')
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
