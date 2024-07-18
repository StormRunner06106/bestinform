import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Notification } from "src/app/utils/types";

@Component({
  selector: "app-user-notifications",
  templateUrl: "./user-notifications.component.html",
  styleUrls: ["./user-notifications.component.scss"],
})
export class UserNotificationsComponent {
  constructor(public dialogRef: MatDialogRef<UserNotificationsComponent>) {}
  closeModal() {
    this.dialogRef.close();
  }

  notifications: Notification[] = [
    {
      title: "Rezervare Confirmata",
      date: "acum 2 min",
      isNew: true,
    },
    {
      title: "Rezervare Confirmata",
      date: "acum 2 min",
      isNew: true,
    },
    {
      title: "Alt tip de Notificare",
      date: "acum 1 zi",
      isNew: false,
    },
    {
      title: "Alt tip de Notificare",
      date: "acum 2 saptamani",
      isNew: false,
    },
  ];
}
