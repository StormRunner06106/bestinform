import {Component, OnInit} from '@angular/core';
import {AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import * as RandExp from "randexp";
import {Observable, Subject, takeUntil} from 'rxjs';
import {ModalService} from 'src/app/shared/_services/modals.service';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {UserDataService} from 'src/app/shared/_services/userData.service';
import {StaffService} from 'src/app/shared/_services/staff.service';
import {ProvidersService} from 'src/app/shared/_services/providers.service';
import {TranslateService} from '@ngx-translate/core';
import {Domains} from 'src/app/shared/_domains';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DeleteProviderComponent} from '../delete-provider/delete-provider.component';
import {ConfirmPasswordValidator} from 'src/app/shared/_services/confirmPassword.validator';
import {StatusProviderComponent} from '../status-provider/status-provider.component';
import {User} from "../../../shared/_models/user.model";
import {Domain} from "../../../shared/_models/domain.model";
import {ResourcesService} from "../../../shared/_services/resources.service";
import {LocationService} from "../../../shared/_services/location.service";

@Component({
    selector: 'app-edit-provider',
    templateUrl: './add-edit-provider.component.html',
    styleUrls: ['./add-edit-provider.component.scss'],
    providers: [Domains]
})
export class AddEditProviderComponent implements OnInit {
    private ngUnsubscribe =new Subject<void>();

    //form
    addEditForm: FormGroup;
    //current provider id
    providerId: string;
    //new created provider id
    newProviderId: string;
    //current provider data
    providerData: object;
    //approve provider request state
    activeUser: boolean;
    //set user state
    chActiveUser: boolean;
    //object sent for approving providers request
    approveStatusObj: { reason: string, approvedStatus: boolean };

    //form data loaded
    dataLoaded: boolean;

    //save the contract into an object
    contractObject:{
        fileName: string,
        filePath: string
    };
    //object sent for update provider by staff/admin
    updateProviderObject:any;
    //object sent for update current user
    updateCurrentUserObject:any;

    //check if is edit or add mode
    isEditMode: boolean;
    //password visibility
    showPassword = false;

    //messages
    updateSuccessMsg: Observable<string>;
    updateErrorMsg: Observable<string>;

    addSuccessMsg: Observable<string>;
    addErrorMsg: Observable<string>;

    uploadContractSuccessMsg: Observable<string>;
    uploadContractErrorMsg: Observable<string>;

    resetPasswordSuccessMsg: Observable<string>;
    resetPasswordErrorMsg: Observable<string>;
    resetPasswordCriteriaErrorMsg: Observable<string>;

    emailErrorMsg: Observable<string>;
    emailExistErrorMsg: Observable<string>;

    generalErrorMsg: Observable<string>;

    // images url and files
    thumbnailUrl = {
        fileName: undefined,
        filePath: undefined
    };

    countries = [];
    cities = [];
    contractTitle: string | undefined | null;

    $fileObservables: Observable<any>[] = [];

    domains: Array<Domain>;
    showActions = false;
    isCurrentUser = false;

    //roles
    isAdmin:boolean;
    isStaff:boolean;
    isProvider:boolean;

    activeStatus = false;
    approvedStatus: object;

    constructor(
        private fb: FormBuilder,
        private toastService: ToastService,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserDataService,
        private modalService: ModalService,
        private staffService: StaffService,
        private providerService: ProvidersService,
        private translate: TranslateService,
        private domainsList: Domains,
        private ngbModal: NgbModal,
        private domainsService: ResourcesService,
        private locationService: LocationService
    ) {
    }

    //areas of activity
    // domains = this.domainsList.domains;

    ngOnInit() {
        this.getCountries();
        //get the role to allow or not some fields (percentage)
        this.getUserRole();
        // TO DO - de verificat ruta daca are id, daca are populam pagina cu informatii luate din getProviderById, daca nu - din getCurrentUser

        if (this.router.url.includes('profile')) {
            console.log('providerul se editeaza pe el');
            this.isEditMode = true;
            this.isCurrentUser = true;
            this.getCurrentUser();
        } else if (this.router.url.includes('add')) {
            console.log('providerul este adaugat');
            this.isEditMode = false;
            this.showActions = true;
        } else {
            console.log('providerul este editat de cineva');
            this.isEditMode = true;
            this.showActions = true;
            this.route.params.subscribe(params => {
                if (params['id']) {
                    this.providerId = params['id'];
                    this.getUserById(this.providerId);
                }
            });
        }


        // this.translateItems();

        this.initFormGroup();
        this.getDomains();
    }

    getCountries() {

        this.locationService.getAllCountries().subscribe({
            next: (countries: []) => {
                this.countries = countries;
            }
        })
    }


    getCities(event) {

        const country = {
            country: event.value ? event.value : event
        }
        this.locationService.getCityFilter(0, -1, null, null, country).subscribe({
            next: (cities: any) => {
                console.log(cities);
                this.cities = cities.content;
            }
        })
    }

    getUserRole(){
        this.userService.getCurrentUser().subscribe((response: any) => {
            this.isAdmin=response.roles.includes('ROLE_SUPER_ADMIN');
            this.isStaff=response.roles.includes('ROLE_STAFF');
            this.isProvider=response.roles.includes('ROLE_PROVIDER');

        });
    }

    getDomains() {
        this.domainsService.getListOfDomains().subscribe((listOfDomains: Array<Domain>) => {
            console.log('list of dom', listOfDomains);
            this.domains = listOfDomains;
        })
    }

    initFormGroup() {
        this.addEditForm = this.fb.group({
                companyName: ['', [Validators.required]],
                cui: [''],
                telephone: ['', Validators.compose([Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)])],
                email: ['', [Validators.required, Validators.email]],
                firstName: ['', [Validators.required]],
                lastName: ['', [Validators.required]],
                gender: [''],
                birthdate: [''],
                billingAddress: this.fb.group({
                    city: [''],
                    iban: [''],
                    address: [''],
                    country: [''],
                    bankName: [''],
                    name: ['', [Validators.required]],
                }),
                    roles: [['ROLE_PROVIDER']],
                domain: [''],
                password: [''],
                checkPassword: [''],
                approvedStatus: [null, [Validators.required]],
                activeStatus: false,
                // percentageCommission: [0, [Validators.pattern('^[0-9]*$')]]
            },
            {
              validator: this.checkPassword
            }as AbstractControlOptions
        );
    }

    checkPassword(control: AbstractControl): ValidatorFn {
        const password = control.get('password');
        const nameRegexp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        const numbers = /[1234567890]/;
        const upper = /[A-Z]/;
        const lower = /[a-z]/;
        const whiteSpace = /[" "]/;

        // let errorsObject = {};


        //Password required
        // if (password.value === null || password.value === '') {
        //     password.setErrors({required: true});
        // }

        //Min length password
        if (password.value && password.value.length < 8) {
            password.setErrors({passMin: true});
            // errorsObject = {...errorsObject, passMin: true};
        }

        //Max length password
        if (password.value?.length > 16) {
            password.setErrors({passMax: true});
            // errorsObject = {...errorsObject, passMax: true};
        }

        //At least a special character
        if (password.value && !nameRegexp.test(password.value)) {
            password.setErrors({specialCharacter: true})
            // errorsObject = {...errorsObject, specialCharacter: true};
        }

        //At least a digit
        if (password.value && !numbers.test(password.value)) {
            password.setErrors({number: true})
            // errorsObject = {...errorsObject, number: true};
        }

        //At least an upper case
        if (password.value && !upper.test(password.value)) {
            password.setErrors({upper: true})
            // errorsObject = {...errorsObject, upper: true};
        }

        //At least a lower case
        if (password.value && !lower.test(password.value)) {
            password.setErrors({lower: true})
            // errorsObject = {...errorsObject, lower: true};
        }

        //No whitespaces
        if (password.value && whiteSpace.test(password.value)) {
            password.setErrors({whiteSpace: true})
        }

        return;
    }



    save() {
        this.addEditForm.markAllAsTouched();

        if (this.addEditForm.valid) {
            console.log('datele trimise lalala', this.addEditForm.value);

            if (this.isCurrentUser) {
                this.updateCurrentUser();
            } else if (this.isEditMode) {
                this.updateProvider();
            } else {
                this.addEditForm.get('password').addValidators(Validators.required);
                this.addEditForm.get('checkPassword').addValidators(Validators.required);
                this.addEditForm.get('password').updateValueAndValidity();
                this.addEditForm.get('checkPassword').updateValueAndValidity();
                this.addEditForm.markAllAsTouched();

                if (this.addEditForm.valid) {
                    this.addProvider();
                } else {
                    // TO DO - de pus notificare ca mai sunt campuri de completat
                    return;
                }
            }
        } else {
            console.log('nu e valid');
            // TO DO - de pus notificare ca mai sunt campuri de completat
        }
    }

    getUserById(idProvider) {
        this.userService.getUserById(idProvider).subscribe((userData: User) => {
            console.log('user data', userData)
            this.contractTitle = userData?.contract === null ? 'Contractul nu a fost adaugat.' : userData?.contract?.fileName;

            this.providerData = userData;

            this.addEditForm.patchValue(userData);
            this.getCities(userData.billingAddress.country);
            console.log("form init get user", this.addEditForm.value)

            this.dataLoaded = true;
        });
    }

    getCurrentUser() {
        this.userService.getCurrentUser().subscribe((userData: any) => {
            this.contractTitle = userData.contract === null ? 'Contractul nu a fost adaugat.' : userData.contract.fileName;

            this.providerData = userData;
            this.providerId = userData.id;
            this.addEditForm.patchValue(userData);
            this.getCities(userData.billingAddress.country);

            console.log('init current user form', userData)
            this.dataLoaded = true;
        });
    }



    activateUser(event: string) {
        console.log('Status user', event);

        this.activeStatus = event === 'approved';
        if (this.activeStatus) {
            this.approvedStatus = {
                reason: 'Providerul a fost acceptat în momentul adăugării de către staff-ul Bestinform.',
                approvedStatus: true
            };
        } else {
            this.approvedStatus = null;
        }

    }

    onUploadContract($event: any) {
        console.log('contractul inainte de a aplea metoda de incarcare',this.contractTitle);
        this.userService.uploadUserContract(this.providerId, $event.target.files[0]).subscribe(() => {
            this.contractTitle = $event.target.files[0].name;
            // this.toastService.showToast( "Succes", this.uploadContractSuccessMsg, "success");

            console.log('contractul dupa incarcare', $event.target.files[0]);
            this.toastService.showToast("Success", this.translate.instant("PROVIDER.MESSAGE.UPLOAD_CONTRACT_SUCCESS"), "success")
        });

    }

    updateProvider() {
        console.log('FORM ADD updateProvider', this.addEditForm.value);

        this.userService.getUserById(this.providerId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: (userData: User) => {
        //the last contract that was uploaded
            if (userData.contract !== null){
                this.contractObject={
                    fileName:userData.contract.fileName,
                    filePath: userData.contract.filePath
                }

            }
            //the last contract that was uploaded
            this.updateProviderObject={...this.addEditForm.value, contract: this.contractObject}
            console.log('obiect trimis la editare',this.updateProviderObject);
           //update user
            this.userService.updateUser(this.providerId, this.updateProviderObject).subscribe(() => {
                this.modalService.triggerUserListChanges(true);
                this.toastService.showToast("Succes", this.translate.instant("PROVIDER.MESSAGE.UPDATE_SUCCESS"), "success");
                this.router.navigate(['../../active'], {relativeTo: this.route});
            });
        }})

        // const updateProvider={...this.addEditForm.value, contract: this.contractObject}
        // console.log('obiectul pe care il trimitem pentru modificat',updateProvider);
        // this.userService.updateUser(this.providerId, this.updateProviderObject).subscribe(() => {
        //     this.modalService.triggerUserListChanges(true);
        //     this.toastService.showToast("Succes", this.translate.instant("PROVIDER.MESSAGE.UPDATE_SUCCESS"), "success");
        //     this.router.navigate(['../../active'], {relativeTo: this.route});
        // });
    }

    updateCurrentUser() {
        // console.log('FORM current user', this.addEditForm.value);
        // console.log('FORM ADD updateCurrentUser', this.addEditForm.value);

        this.userService.getCurrentUser()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
            next: (user:User)=>{
                //the last contract that was uploaded
                if(user.contract !== null){
                    this.contractObject={
                        fileName: user.contract.fileName,
                        filePath: user.contract.filePath
                    }
                }
                //create the object to send for update user
                this.updateCurrentUserObject={...this.addEditForm.value, contract: this.contractObject}
                //update user
                this.userService.updateCurrentUser(this.updateCurrentUserObject).subscribe((response:any) => {
                    console.log(response);
                    this.toastService.showToast("Succes", this.translate.instant("PROVIDER.MESSAGE.UPDATE_SUCCESS"), "success");
                    this.router.navigate(['../view'], {relativeTo: this.route});
                })
            }
        });
    }

    addProvider() {
        // console.log('FORM ADD', this.addEditForm.value);
        this.userService.addUser(this.addEditForm.value).subscribe((response: { reason: string, success: boolean }) => {
            this.newProviderId = response.reason;
            this.toastService.showToast("Succes", this.translate.instant('User-ul a fost adaugat.'), "success");

            if(this.activeStatus) {
                this.providerService.changeActiveStatus(this.newProviderId, this.activeStatus).subscribe((responseActive: { reason: string, success: boolean }) => {
                    console.log('User activat', responseActive);
                    this.toastService.showToast("Succes", this.translate.instant('User-ul a fost activat.'), "success");

                    this.providerService.changeUserStatus(this.newProviderId, 'active').subscribe(() => {
                        console.log("id-ul de schimbare status" + response.reason + "approve statusul " + this.activeUser);
                        this.toastService.showToast("Succes", this.translate.instant('User-ul a fost aprobat.'), "success");

                    });
                });
            } else {
                this.userService.sendRegistrationEmail(this.newProviderId).subscribe((resp: any) => {
                    console.log('resp',resp);
                    this.toastService.showToast("Succes", this.translate.instant('Mail-ul pentru activare a fost trimis.'), "success");
                }, error => {
                    this.toastService.showToast("Eroare", this.translate.instant('Mail-ul pentru activare NU a fost trimis.'), "error");
                })
            }
            this.modalService.triggerUserListChanges(true);
            this.toastService.showToast("Succes", this.translate.instant('PROVIDER.MESSAGE.ADD_SUCCESS'), "success");
            this.router.navigate(['../active'], {relativeTo: this.route});
        }, (error) => {
            // Show specific error feedback message
            if (error.error.reason === 'emailNotValid') {
                this.toastService.showToast("Eroare", this.translate.instant('PROVIDER.MESSAGE.EMAIL_ERROR'), "error");
            } else if (error.error.reason === 'invalidPassword') {
                this.toastService.showToast("Eroare", "Parola nu este valida!", "error");
            } else if (error.error.reason === 'emailExists') {
                this.toastService.showToast("Eroare", this.translate.instant('PROVIDER.MESSAGE.EMAIL_EXIST'), "error");
            } else {
                this.toastService.showToast("Eroare", this.translate.instant('PROVIDER.MESSAGE.ERROR_MSG'), "error");
            }
        });
    }

    //password
    generatePassword() {
        const randexp = new RandExp(/^(.\d{1})(.[a-z]\d{1})(.[A-Z]\d{1})(.[@$!%*?&]\d{1})(?=.[a-zA-Z]).{0,1}$/).gen();
        console.log(randexp);
        let generatedPassword = randexp;
        while (generatedPassword.indexOf(' ') !== -1) {
            // console.log(randexp.indexOf(' '));
            generatedPassword = generatedPassword.slice(0, generatedPassword.indexOf(' ')) + generatedPassword.slice(generatedPassword.indexOf(' ') + 1);
        }
        while (generatedPassword.indexOf('"') !== -1) {
            generatedPassword = generatedPassword.slice(0, generatedPassword.indexOf('"')) + generatedPassword.slice(generatedPassword.indexOf('"') + 1);
        }
        console.log(generatedPassword);
        this.addEditForm.get('password').patchValue(generatedPassword);
        this.addEditForm.get('checkPassword').patchValue(generatedPassword);

    }

    resetPassword() {
        this.addEditForm.get('password').markAsTouched();

        if (this.addEditForm.get('password').valid) {
            console.log(this.providerData["id"].toString(), this.addEditForm.get('password').value);
            this.staffService.changeUserPassword(this.providerData["id"].toString(), this.addEditForm.get('password').value).subscribe((res: { success: boolean, reason: string }) => {
                if (res.success) {
                    this.toastService.showToast('Succes', this.translate.instant('PROVIDER.MESSAGE.RESET_PASSWORD_SUCCESS'), 'success');
                } else {
                    this.toastService.showToast('Eroare', this.translate.instant('PROVIDER.MESSAGE.RESET_PASSWORD_ERROR'), 'error');
                }
            });
        } else {
            this.toastService.showToast('Eroare', this.translate.instant('PROVIDER.MESSAGE.RESET_PASSWORD_CRITERIA_ERROR'), 'error');
        }
    }

    // Modal - request doc
    deleteProvider(elementId: string) {
        this.ngbModal.open(DeleteProviderComponent, {centered: true});
        this.modalService.setElementId(elementId);
    }

    // Modal - blocare
    blockProvider(elementId: string) {
        const modalRef = this.ngbModal.open(StatusProviderComponent, {centered: true});
        modalRef.componentInstance.actionType = 'inactive';
        this.modalService.setElementId(elementId);
    }

    //gallery

    //clear fields by x icon
    clearName() {
        this.addEditForm.get("name").patchValue('');
    }

    clearCompanyName() {
        this.addEditForm.get("companyName").patchValue('');
    }

    clearLastName() {
        this.addEditForm.get("lastName").patchValue('');
    }

    clearAddress() {
        this.addEditForm.get("address").patchValue('');
    }

    clearIBAN() {
        this.addEditForm.get("iban").patchValue('');
    }

    clearBank() {
        this.addEditForm.get("bankName").patchValue('');
    }

    //de modificat numele cand revenim
    clearChannelEmail() {
        this.addEditForm.get("channelEmail").patchValue('');
    }

    //de modificat numele cand revenim
    clearToken() {
        this.addEditForm.get("token").patchValue('');
    }

    //de modificat numele cand revenim

    clearSignature() {
        this.addEditForm.get("signature").patchValue('');
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
      }

}
