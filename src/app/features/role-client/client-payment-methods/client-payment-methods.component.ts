import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {User} from "../../../shared/_models/user.model";
import {ToastService} from "../../../shared/_services/toast.service";
import {BehaviorSubject, Observable, of, Subject, switchMap, tap, timer} from "rxjs";
import {City} from "../../../shared/_models/city.model";
import {map, take} from "rxjs/operators";
import {CurrentSubscription} from "../../../shared/_models/current-subscription.model";
import fileSaver from "file-saver";
import {SmartBillService} from "../../../shared/_services/smartbill.service";

@Component({
    selector: 'app-client-payment-methods',
    templateUrl: './client-payment-methods.component.html',
    styleUrls: ['./client-payment-methods.component.scss']
})
export class ClientPaymentMethodsComponent implements OnInit {

    paymentDataForm: FormGroup;

    //billing address data
    billingAddress: object;
    dataLoaded: boolean;
    userInfo: User;

    countries$: Observable<string[]>;
    cities$: Observable<City[]>;

    currentSubscription$: Observable<CurrentSubscription>;
    subscriptionUpdater$ = new BehaviorSubject<void>(null);

    purchasedSubscriptions$: Observable<CurrentSubscription[]>;
    currentDate: string;

    constructor(private formBuilder: FormBuilder,
                private userService: UserDataService,
                private smartBillService: SmartBillService,
                private toastService: ToastService) {
    }

    ngOnInit(): void {
        this.currentDate = new Date().toLocaleDateString();
        this.initForm();
        this.getCountriesList();
        this.getCurrentUser();
        this.getCurrentSubscription();
    }

    initForm() {
        this.paymentDataForm = this.formBuilder.group({
            address: ['', Validators.required],
            country: ['', Validators.required],
            city: ['', Validators.required],
            postcode: [''],
        });
    }

    getCountriesList() {
        this.countries$ = this.userService.getAllCountries();
    }

    getCitiesByCountry(country: string) {
        if (!country) {
            this.cities$ = of(null);
            return;
        }

        this.cities$ = this.userService.listCityFiltered(0, -1, {country: country})
            .pipe(map(res => res.content));
    }

    getCurrentUser() {
        //get user data
        this.userService.getCurrentUser().subscribe((userData: User) => {
            this.userInfo = userData;
            this.paymentDataForm.patchValue(userData.billingAddress);
            this.getCitiesByCountry(userData?.billingAddress?.country);
            this.getAllPurchasedSubscriptions();
            this.dataLoaded = true;
        });
    }

    getCurrentSubscription() {
        this.currentSubscription$ = this.subscriptionUpdater$
            .pipe(
                switchMap(() => {
                    return this.userService.getCurrentPurchasedSubscription()
                        .pipe(map(res => {
                            if (!res) {
                                const newSub: CurrentSubscription = {
                                    status: 'new'
                                }
                                return newSub;
                            }
                            return res;
                        }));
                })
            )
    }

    getAllPurchasedSubscriptions() {
        this.purchasedSubscriptions$ = this.userService.listPurchasedSubscriptionsFiltered(0, -1, 'purchasedDate', 'desc', {userId: this.userInfo.id})
            .pipe(map(res => res.content));
    }

    updateUser() {
        if (this.paymentDataForm.valid) {
            this.userInfo.billingAddress = this.paymentDataForm.value;
            this.userService.updateCurrentUser(this.userInfo).subscribe((resp: any) => {
                console.log(resp);
                this.toastService.showToast("Succes", "Informații actualizate cu succes!", "success")
            }, error => {
                this.toastService.showToast("Eroare", "A aparut o problema!", "error")
            })
        } else {
            this.toastService.showToast("Eroare", "Completați toate câmpurile obligatorii!", "error");
        }
    }

    toStripe() {
        this.userService.executeRecurringPayments().subscribe({
            next: (resp: { reason: string, success: boolean }) => {
                if (resp.success) {
                    window.location.href = resp.reason;
                }
            }

        })
    }

    cancelSubscription(subId: string) {
        this.userService.cancelSubscription(subId).pipe(take(1)).subscribe({
            next: res => {
                if (res.success) {
                    this.toastService.showToast("Succes", "Auto renew anulat cu succes!", "success");

                    timer(1500).pipe(take(1)).subscribe({
                        next: () => {
                            this.subscriptionUpdater$.next();
                        }
                    });
                }
            },

            error: () => {
                this.toastService.showToast("Eroare", "A aparut o problema!", "error");
            }
        });
    }

    downloadBill(series: string, number: string) {
        if (!series || !number) {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
            return;
        }

        this.smartBillService.downloadFile(series, number).subscribe((file: any) => {
            const fileName = 'Factura-Rezervare.pdf';
            const blob = new Blob([file], {type: 'text/json; charset=utf-8'});
            fileSaver.saveAs(blob, fileName);

        }, () => {
            this.toastService.showToast('Eroare', 'Eroare de la server', 'error');
        });
    }

    makeAutoRenewTrue(subId: string) {
        this.userService.makeAutoRenewTrue(subId).subscribe({
            next: (response: { reason: string, success: boolean }) => {
                if (response.reason) {
                    this.toastService.showToast('Success', 'Subscription was renewed!', "success");

                    timer(1500).pipe(take(1)).subscribe({
                        next: () => {
                            this.subscriptionUpdater$.next();
                        }
                    });
                }
            }, error: (err) => {
                if(err.error.reason === 'invalidId'){
                    this.toastService.showToast('Error', "Subscription can not be renewed!", "error");
                }else if(err.error.reason === 'tokenExpired' || err.error.reason === 'tokenExpired'){
                    this.toastService.showToast('Error', "You need to be logged in to complete this action!", "error");
                }
            }
        })
    }

    protected readonly console = console;
}
