import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../../shared/_services/auth.service";
import {LocalStorageService} from "../../../shared/_services/localStorage.service";
import {JwtTokenService} from "../../../shared/_services/jwtToken.service";
import {ForgottenPassComponent} from "../forgotten-pass/forgotten-pass.component";
import {ToastService} from "../../../shared/_services/toast.service";
import {TranslateService} from "@ngx-translate/core";
import {RegisterComponent} from "../register/register.component";
import {User} from "../../../shared/_models/user.model";
import {ReportsService} from "../../reports/_services/reports.service";
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {UserLocationService} from "../../../shared/_services/user-location.service";
import {BehaviorSubject, catchError, Subject, Subscription, takeUntil} from 'rxjs';
import {FacebookLoginProvider, SocialAuthService, SocialUser} from "angularx-social-login";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject<void>();

    public loginForm: FormGroup;
    public hide = true;
    token: string;

    twoFA:boolean;

    isFacebookLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isFacebookLoading: boolean;
    private unsubscribe: Subscription[] = [];


    isLoginLoading: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private localStorage: LocalStorageService,
        private decode: JwtTokenService,
        private modalService: MatDialog,
        private toastService: ToastService,
        private translate: TranslateService,
        private jasperService: ReportsService,
        private userLocationService: UserLocationService,
        private socialAuthService: SocialAuthService
        // @Inject(MAT_DIALOG_DATA) public role: any,

    ) {
        console.log('social login 1', this.isLoggedin);
        const loadingSubscr = this.isFacebookLoading$
            .asObservable()
            .subscribe((res) => (this.isFacebookLoading = res));
        this.unsubscribe.push(loadingSubscr);

    }
    socialUser!: SocialUser;
    isLoggedin?: boolean = undefined;

    ngOnInit(): void {
        this.formInit();

        this.socialAuthService.authState.subscribe((user) => {
            this.socialUser = user;
            this.isLoggedin = user != null;
            console.log('social login 2', this.socialUser);

            this.authService.loginWithFacebook('client', this.socialUser.email, this.socialUser.authToken).subscribe((resp => {
                console.log('login fb 1', resp);

                    this.toastService.showToast("Succes","Te-ai logat folosind FACEBOOK! Vei fi redirectionat imediat.","success");

                    this.authService.triggerUserChanges(true);
                    this.authService.getCurrentUser().subscribe((response: User) => {
                            console.log(response);
                            this.isFacebookLoading$.next(false);

                            if (response.userSetting?.colorMode) {
                                this.localStorage.set('colorMode', response.userSetting?.colorMode);
                            } else {
                                this.localStorage.set('colorMode', 'light');
                            }

                            if (response.userSetting?.language) {
                                this.localStorage.set('langFromStorage', response.userSetting?.language)
                            } else {
                                this.localStorage.set('langFromStorage', 'ro')
                            }


                            if (response.roles.includes('ROLE_PROVIDER')) {
                                this.router.navigate(['/private/provider']);
                            }  else if (response.roles.includes('ROLE_CLIENT')) {
                                if(!response.enrollment){
                                    this.router.navigate(['/client/enroll'])
                                }else{
                                    this.router.navigate(['/client']).then(() => {
                                        console.log('after login promise');
                                        this.userLocationService.checkUserCoordinates();
                                    });
                                }
                            }
                            this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.LOGIN.SUCCESS"),"success");
                        },
                        () => {

                            this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.INVALID-CREDENTIALS"),"error");
                        })
                    console.log('eroare', resp);
            }),error => {
                this.isFacebookLoading$.next(false);

                if (error.error.reason === 'emailExists') {
                    this.toastService.showToast("Error","Exista deja un cont asociat email-ului de la contul de Facebook.","error");
                } else if(error.error.reason==="notApproved") {
                    this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Autentificarea este momentan închisă!","error");
                } else {
                    this.toastService.showToast("Error","Conectarea cu Facebook nu a functionat.","error");
                }
            })
            // this.localStorage.set('token', user.authToken);
            // // this.localStorage.set('refreshToken', res.refreshToken);
            // this.authService.triggerUserChanges(true);

        });
    }

    formInit() {
        this.loginForm = this.formBuilder.group(
            {
                email: ['', Validators.compose([Validators.required, Validators.email])],
                password: ['', Validators.compose([Validators.required])],
                twoFA: [''],
            }
        );
    }

    loginWithFacebook(): void {
        this.isFacebookLoading$.next(true);
        this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then(r => {
            console.log('response fb', r);
        }, error => {
            this.isFacebookLoading$.next(false);
            console.log('eroare fb login', error);
            this.toastService.showToast("Error","Conectarea cu Facebook nu a functionat. Eroare primita: " + error,"error");

        });
    }

    sendAuthCode(){
        const dataObj={
            email: this.loginForm.value.email,
            password: encodeURI(this.loginForm.value.password),
            mobile: false
        }

        console.log('send auth code', dataObj);

        this.authService.sendAuthenticationCode(dataObj)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res:any)=>{
                    console.log(res);
                    this.twoFA = true;
                    this.toastService.showToast("Succes","Codul pentru autentificarea in doi pasi a fost trimis pe contul dvs. de email!","success");
                    this.isLoginLoading = false;
                },
                error: (error)=>{
                    this.twoFA = false;
                    this.toastService.showToast("Error","Codul pentru 2FA NU a fost trimis. Mai încearcă o dată!","error");
                    console.log(error);
                    this.isLoginLoading = false;
                }
            });
    }

    sendUserInvalidSessionEmail(){
        //   this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"O alta sesiune este deja activă! A fost trimis un mail pentru dezactivarea acesteia!","error");
        console.log("inainte sa se trimita emailul");

        this.authService.sendUserInvalidSessionEmail(this.loginForm.get('email').value)
        .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res:any)=>{
                    console.log("succes?", res);
                    console.log("s-a trimis emailul la" , this.loginForm.get('email').value);
                    this.toastService.showToast('Warning!',"O alta sesiune este deja activă! A fost trimis un mail pentru dezactivarea acesteia!","warning");
                    this.router.navigate(['/']);
                    this.closeModal();
                }
            })
    }

    twoFALogin(){
        console.log(this.loginForm.value);
        const authCode= this.loginForm.get('twoFA').value;
        this.isLoginLoading = true;


        this.authService.login2FA(authCode)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {

                    console.log('RES 2FA:', res)

                    if (res.success === true) {
                        this.authService.triggerUserChanges(true);
                        console.log('ne-am auth cu doi factori',res);

                        this.authService.getCurrentUser().subscribe((response: User) => {
                                console.log(response);
                                this.isLoginLoading = false;
                                if (response.userSetting?.colorMode) {
                                    this.localStorage.set('colorMode', response.userSetting?.colorMode);
                                } else {
                                    this.localStorage.set('colorMode', 'light');
                                }

                                if (response.userSetting?.language) {
                                    this.localStorage.set('langFromStorage', response.userSetting?.language)
                                } else {
                                    this.localStorage.set('langFromStorage', 'ro')
                                }

                                if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                                    this.router.navigate(['/private/admin/dashboard']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response:any) => {
                                        console.log('login jasper 1', response);
                                    })
                                } else if (response.roles.includes('ROLE_STAFF')) {
                                    console.log('e staff');
                                    this.router.navigate(['/private/staff']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response) => {
                                        console.log('login jasper 2', response);
                                    })
                                }  else if (response.roles.includes('ROLE_PROVIDER')) {
                                    this.router.navigate(['/private/provider']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response) => {
                                        console.log('login jasper 2', response);
                                    })
                                }  else if (response.roles.includes('ROLE_CLIENT')) {
                                    if(!response.enrollment){
                                        this.router.navigate(['/client/enroll'])
                                    }else{
                                        this.router.navigate(['/client']).then(() => {
                                            console.log('after login promise');
                                            this.userLocationService.checkUserCoordinates();
                                        });
                                    }

                                }
                                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.LOGIN.SUCCESS"),"success");
                            }
                            ,
                            () => {
                                this.isLoginLoading = false;

                                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.INVALID-CREDENTIALS"),"error");
                            }
                            )
                    } else if(res === false) {
                        this.isLoginLoading = false;

                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Codul nu există sau a expirat! Mai încearcă o dată!","error");
                            this.twoFA = false;
                            this.loginForm.get('twoFA').setValue('');
                    }
                },
                error: (error)=>{
                    this.isLoginLoading = false;

                    console.log('EROARE AFISATA 2FA:',error.error.reason);
                    if(error.error.reason==="accountBlocked"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.ACCOUNT-BLOCKED"),"error");
                    }else if(error.error.reason==="inactive" || error.error.reason==="archived"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Contul dvs. a fost dezactivat sau arhivat. Luati legatura cu administratorul site-ului!","error");
                    } else {
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"A apărut o problemă tehnica!","error");
                    }
                }
            })
    }


    onLoginClick() {
        console.log(this.loginForm.value);

        this.isLoginLoading = true;

        this.authService.login(this.loginForm.value)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (res: any) => {
                    if(res.reason === '2FA'){
                        //to show or hide 2fa form field
                        //  this.twoFAActive();
                        this.sendAuthCode();
                    }else{
                        // this.localStorage.set('token', res.token);
                        // this.localStorage.set('refreshToken', res.refreshToken);
                        this.authService.triggerUserChanges(true);
                        this.authService.getCurrentUser().subscribe((response: User) => {
                                console.log(response);
                                this.isLoginLoading = false;
                                if (response.userSetting?.colorMode) {
                                    this.localStorage.set('colorMode', response.userSetting?.colorMode);
                                } else {
                                    this.localStorage.set('colorMode', 'light');
                                }

                                if (response.userSetting?.language) {
                                    this.localStorage.set('langFromStorage', response.userSetting?.language)
                                } else {
                                    this.localStorage.set('langFromStorage', 'ro')
                                }


                                if (response.roles.includes('ROLE_SUPER_ADMIN')) {
                                    this.router.navigate(['/private/admin/dashboard']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response:any) => {
                                        console.log('login jasper 3', response);
                                    })
                                } else if (response.roles.includes('ROLE_STAFF')) {
                                    console.log('e staff');
                                    this.router.navigate(['/private/staff']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response) => {
                                        console.log('login jasper 4', response);
                                    })
                                }  else if (response.roles.includes('ROLE_PROVIDER')) {
                                    this.router.navigate(['/private/provider']);
                                    this.jasperService.loginJasper('jasperadmin', 'jasperadmin').subscribe((response) => {
                                        console.log('login jasper 2', response);
                                    })
                                }  else if (response.roles.includes('ROLE_CLIENT')) {
                                    if(!response.enrollment){
                                        this.router.navigate(['/client/enroll'])
                                    }else{
                                        this.router.navigate(['/client']).then(() => {
                                            console.log('after login promise');
                                            this.userLocationService.checkUserCoordinates();
                                        });
                                    }

                                }
                                this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"),this.translate.instant("TOAST.LOGIN.SUCCESS"),"success");
                            }
                            ,(err) => {
                                this.isLoginLoading = false;
                                console.log('eroarea mea',err)
                                this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.INVALID-CREDENTIALS"),"error");
                            })
                    }

                },
                error: (error)=>{
                    console.log('error login 1', error);
                    this.isLoginLoading = false;
                    if(error.error.reason==="invalidCredentials"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.INVALID-CREDENTIALS"),"error");
                    }else if(error.error.reason==="notActive"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.NOT-ACTIVE"),"error");
                    }else if(error.error.reason==="accountBlocked"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),this.translate.instant("TOAST.LOGIN.ACCOUNT-BLOCKED"),"error");
                    }else if(error.error.reason==="inactive" || error.error.reason==="archived"){
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Contul dvs. a fost dezactivat sau arhivat. Luati legatura cu administratorul site-ului!","error");
                    }else if(error.error.reason==="alreadyLoggedIn"){
                        this.sendUserInvalidSessionEmail();
                    } else if(error.error.reason==="notApproved") {
                        this.toastService.showToast(this.translate.instant("TOAST.ERROR"),"Autentificarea este momentan închisă!","error");
                    }

                }
            })
    }

    openForgotPwd() {
        console.log('open forgot pwd')
        this.modalService.open(ForgottenPassComponent, {width: "100%", maxWidth: 1000, height: "90%"})
    }
    openRegister() {
        console.log('open register')
        this.modalService.open(RegisterComponent, {width: "100%", maxWidth: 1000, height: "90%", data: {
                role: 'ROLE_CLIENT'
            } })
    }

    closeModal(){
        this.modalService.closeAll();
    }


    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


}
