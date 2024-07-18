import * as Stomp from "stompjs";
import * as SockJS from "sockjs-client";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import {environment} from "../../../environments/environment";
@Injectable({
  providedIn: "root",
})
export class WebSocketAPI {
  // webSocketEndPoint = 'https://bestinform.eu/bestinform/our-websocket';
  // topic = 'https://bestinform.eu/user/topic/private-notifications';
  // stompClient: any;
  // responseSubject= new Subject<any>();

  socket = new SockJS(`${environment.api_url}/our-websocket`);
  stompClient = Stomp.over(this.socket);

  subscribe(topic: string, callback: any): void {
    const connected: boolean = this.stompClient.connected;
    if (connected) {
      this.subscribeToTopic(topic, callback);
      return;
    }

    //is stomp client is not connected, connect and subscribe to the topic
    this.stompClient.connect({}, (): any => {
      this.subscribeToTopic(topic, callback);
    });
  }

  private subscribeToTopic(topic: string, callback?: any): void {
    this.stompClient.subscribe(topic, (): any => {
      callback();
    });
  }

  //comp unde folosim, probabil una standalone
  // notificationComponent: NotificationsComponent;
  // constructor(notifComponent: NotificationsComponent){
  //     this.notificationComponent = notifComponent;
  // }

  // _connect() {
  //     console.log("Initialize WebSocket Connection");
  //     // let ws = new SockJS(this.webSocketEndPoint);

  //     // this.stompClient = Stomp.over(ws);
  //     const _this = this;
  //     // let _this: this;
  //     _this.stompClient.connect({}, function (frame) {

  //         _this.stompClient.subscribe("http://localhost/",_this.topic, function (sdkEvent) {
  //             _this.onMessageReceived(sdkEvent);

  //         });
  //         // _this.stompClient.publish(_this.topic, 'Oh herrow');
  //         //_this.stompClient.reconnect_delay = 2000;
  //     }, this.errorCallBack);
  // }

  // _disconnect() {
  //     console.log('din disconect',this.stompClient);
  //     if (this.stompClient !== null) {
  //         this.stompClient.disconnect();
  //     }
  //     console.log("Disconnected");
  // }

  // // on error, schedule a reconnection attempt
  // errorCallBack(error) {
  //     console.log("errorCallBack -> " + error)
  //     setTimeout(() => {
  //         this._connect();
  //     }, 5000);
  // }

  // //send message via webSocket

  // _send(message) {
  //     console.log("calling logout api via web socket");
  //     this.stompClient.send("/private/staff/notifications", {}, JSON.stringify(message));
  // }

  // onMessageReceived(message) {
  //     console.log("Message Recieved from Server :: " + message);
  //     this.notificationComponent.handleMessage(JSON.stringify(message.body));
  // }
}
