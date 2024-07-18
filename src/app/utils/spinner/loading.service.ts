import { EventEmitter, Injectable } from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {LoadingComponent} from "./loading.component";

@Injectable({
    providedIn: "root"
})
export class LoadingService {

    private dialogRef;
    private loading = false;

    constructor(private dialog: MatDialog) {
    }

    public showLoading(message?: string) {
        this.loading = true;
        if (this.dialogRef) {
            this.dialogRef.close();
            this.dialogRef = undefined;
        }
        this.dialogRef = this.dialog.open(LoadingComponent, {
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            data: {
                message: message
            }
        });
    }
    public hideLoading() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.loading = false;
    }

    public isLoading() {
        return this.loading;
    }
}
