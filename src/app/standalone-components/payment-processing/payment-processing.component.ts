import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from "@angular/common";
import { StripePaymentComponent } from 'src/app/standalone-components/stripe-payment/stripe-payment.component';
import { SharedModule } from "../../shared/shared.module";

@Component({
    selector: 'app-payment-processing',
    standalone: true,
    imports: [CommonModule, SharedModule, StripePaymentComponent],
    templateUrl: './payment-processing.component.html',
    styleUrls: ['./payment-processing.component.scss']
})
export class PaymentProcessingComponent implements OnInit {
    sessionId: string;

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(queryParams => {
            this.sessionId = queryParams?.sessionid;
        });
    }

}
