import {Component} from "@angular/core";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
    templateUrl: "prebook-confirmation.component.html",
})
export class PrebookConfirmationComponent {

    constructor(private dialogService: DialogService,
                private ref: DynamicDialogRef) {
    }

    public close(value: boolean) {
        this.ref.close(value);
    }
}
