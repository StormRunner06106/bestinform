import { Component, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "src/app/shared/_services/auth.service";

@Component({
  selector: "app-popup-dialog",
  templateUrl: "./popup-dialog.component.html",
  styleUrls: ["./popup-dialog.component.scss"],
})
export class UserSettingsComponent {

  // @Input() isClient: boolean;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsComponent>,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    console.log('here or not?', this.data?.isClient);
  }
  closeModal() {
    console.log('isClient', this.data?.isClient);
    this.dialogRef.close();
  }
}
