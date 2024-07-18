import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-footer-new",
  standalone: true,
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterNewComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    console.log("x");
  }
}
