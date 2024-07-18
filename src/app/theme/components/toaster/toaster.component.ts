import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ToastService} from "../../../shared/_services/toast.service";

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent implements OnInit {

  currentToasts: Array<object> = [];


  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscribeToToasts();
  }

  subscribeToToasts() {
    this.toastService.toastEvents.subscribe((toasts: object) => {
      const currentToast = {
        type: toasts["type"],
        title: toasts["title"],
        message: toasts["message"],
        hidden: toasts["hidden"]
      };
      this.currentToasts.push(currentToast);

      // if (this.currentToasts[this.currentToasts.length - 1]["type"] === 'success' && this.currentToasts.some((toast: object) => toast["type"] === 'error')) {
      //   this.currentToasts.splice(0, this.currentToasts.length - 1);
      // }

      setTimeout(() => {
        this.dispose(this.currentToasts.indexOf(currentToast));
      }, 5000);

      this.cdr.detectChanges();
    });
  }

  dispose(index: number) {
    if (index < this.currentToasts.length) {
      this.currentToasts.splice(index, 1);
    }
    this.cdr.detectChanges();
  }

}
