import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NgIf} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";

@Component({
    selector: "app-bst-loading",
    standalone: true,
    templateUrl: "./loading.component.html",
    imports: [
        NgIf,
        SharedModule
    ],
    styleUrls: ["./loading.component.scss"]
})
export class LoadingComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string },
                public dialogRef: MatDialogRef<LoadingComponent>) {

    }

}
