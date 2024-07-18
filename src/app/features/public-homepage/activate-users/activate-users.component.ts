import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {PublicHomepageService} from "../services/public-homepage.service";
import {ToastService} from "../../../shared/_services/toast.service";

@Component({
    selector: 'app-activate-users',
    templateUrl: './activate-users.component.html',
    styleUrls: ['./activate-users.component.scss']
})

export class ActivateUsersComponent implements OnInit{

    constructor(private route: ActivatedRoute,
                private homeService: PublicHomepageService,
                private router: Router,
                private toastService: ToastService) {
    }

    inactiveCode:boolean;
    emailParam: string;

    ngOnInit() {
        this.route.queryParams
            .subscribe(params => {
                    console.log(params);
                    this.emailParam = params.email;
                    if (params.email && params.registrationcode) {
                        this.homeService.activateUserViaCode(params.registrationcode, params.email).subscribe((resp: any) => {
                                console.log('resp req 1', resp);
                                if (resp.success === true) {
                                    this.toastService.showToast("Succes","Contul tău a fost activat! Vei fi redirectionat imediat.","success");
                                    setTimeout(() => {
                                        this.router.navigate(['/']);
                                    }, 3000);
                                } else {
                                    this.toastService.showToast("Eroare","Contul tău NU a fost activat! Te rugăm să ne contactezi.","error");
                                    setTimeout(() => {
                                        this.router.navigate(['/']);
                                    }, 3000);
                                }
                            },
                            error => {
                                console.log('error', error.error.message)
                                if (error.error.reason === 'invalidCode') {
                                    this.inactiveCode = true;
                                    this.toastService.showToast("Eroare", "Link-ul de activare nu mai este valabil. Te rugăm să soliciti unul nou.", "error");
                                } else {
                                    if (error.error.reason === 'alreadyActivated') {
                                        this.toastService.showToast("Succes", "Contul tău a fost deja activat! Vei fi redirectionat imediat.", "success");
                                        setTimeout(() => {
                                            this.router.navigate(['/']);
                                        }, 3000);
                                    } else {
                                        this.toastService.showToast("Eroare", "Contul tău NU a fost activat! Te rugăm să ne contactezi.", "error");
                                        setTimeout(() => {
                                            this.router.navigate(['/']);
                                        }, 3000);
                                    }
                                }
                            }
                        )
                    } else {
                        this.router.navigate(['/']);

                    }
                }
            );
    }

    resendLink() {
        this.homeService.sendRegistrationEmail(this.emailParam).subscribe((resp: any) => {
            console.log('resp link', resp);
            this.toastService.showToast("Succes","Verifica mailul! Un link nou a fost trimis.","success");
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 3000);
        }, error =>  {
            this.toastService.showToast("Eroare", "Email-ul nu a putut fi trimis! Te rugăm să ne contactezi.", "error");
        })
    }
}
