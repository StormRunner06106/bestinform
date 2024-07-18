import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WebSocketAPI } from "src/app/shared/_services/web-socket.service";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { NotificationsService } from "src/app/shared/_services/notifications.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-notifications-component",
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: "./notifications-component.component.html",
  styleUrls: ["./notifications-component.component.scss"],
  providers: [WebSocketAPI],
})
export class NotificationsComponent {
  webSocketAPI: WebSocketAPI;
  greeting: any;
  name: string;

  // topic = 'https://bestinform.eu/user/topic/private-notifications';
  topic = "/topic/private-notifications";

  listNotification = [];

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient,
    private stompService: WebSocketAPI
  ) {
    this.getNotifications();
  }

  ngOnInit(): void {
    this.stompService.subscribe(this.topic, (): any => {
      this.getNotifications();
    });
  }

  getNotifications() {
    this.notificationsService
      .listMyNotifications(0, 10, "desc", "date")
      .subscribe((notificationsList: any) => {
        this.listNotification = notificationsList.content;
        console.log(notificationsList.content);
      });
  }

  // connect(){
  //   this.webSocketAPI._connect();
  // }

  // disconnect(){
  //   this.webSocketAPI._disconnect();
  // }

  // sendMessage(){
  //   this.webSocketAPI._send(this.name);
  // }

  // handleMessage(message){
  //   this.greeting = message;
  // }
}
