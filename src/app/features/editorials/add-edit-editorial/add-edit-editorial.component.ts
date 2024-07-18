import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AngularEditorConfig} from '@kolkov/angular-editor';
import { forkJoin, of, switchMap } from 'rxjs';
import { ResourcesService } from 'src/app/features/resources/_services/resources.service';
import {EditorialsService} from '../_services/editorials.service';
import {DatePipe} from '@angular/common';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from "@angular/router";
import {Router} from '@angular/router';
import {ToastService} from 'src/app/shared/_services/toast.service';
import {Domains} from 'src/app/shared/_domains';
import {Resource} from "../../../shared/_models/resource.model";
import {User} from "../../../shared/_models/user.model";
import {EditorialCategoryModel} from "../_models/editorialCategories.model";
import {Editorial} from "../../../shared/_models/editorial.model";

@Component({
    selector: 'app-add-edit-editorial',
    templateUrl: './add-edit-editorial.component.html',
    styleUrls: ['./add-edit-editorial.component.scss'],
    providers: [NgbModal, NgbActiveModal, DatePipe, Domains]
})
export class AddEditEditorialComponent implements OnInit {

    //acorderon state
    panelOpenPublish = true;
    panelOpenSEO = true;
    panelOpenImage = true;


    //form
    addEditorialForm: FormGroup;
    formIsLoaded = false;

    //img
    oldCarouselImages: string[] = [];
    oldGridImages: string[] = [];

    imgMessage: string;
    imagePath: string;
    urlfeaturedImg: string | ArrayBuffer = '/assets/images/others/Showcase.jpg';
    arrayOfCarouselImages: any[] = [];
    arrayOfCarouselImagesFiles: File[] = [];
    arrayOfGridImages: any[] = [];
    arrayOfGridImagesFiles: File[] = [];
    arrayOfSingleGridVideos: any[] = []; // Initialize as an empty array
    arrayOfSingleGridVideosFiles: File[] = []; // Initialize as an empty array
    arrayOfMultipleVideos: any[] = []; // Initialize as an empty array
    arrayOfMultipleVideosFiles: File[] = []; // Initialize as an empty array

    videoFileInput: string | ArrayBuffer;

    uploadedImageEvent: Blob
    nameFeaturedImg: Blob;

    feateruedImgFile: File;
    selectedFile = Blob;

    //tags chips
    addedTags: Array<string> = [];

    //category tags
    categoryTags: Array<string> = [];

    // id/slug/data editorial
    editorialId = '';
    editorialSlug = '';
    editEditorialData: Editorial;
    editorialStatus = '';
    slugSuggestion = '';

    isEditMode: boolean;    

    isAdmin:boolean;
    isStaff:boolean;

    editorialSubmitted = false;

    //domains of activity
    domains: Array<object> = this.domainsList.domainsList;

    //categories & subcategories
    categories: Array<EditorialCategoryModel>;
    subcategories: Array<object>;

    categoryDestinationsSelected = false;


    constructor(private editorialForm: FormBuilder,
                private editorialsService: EditorialsService,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private toastService: ToastService,
                private router: Router,
                private datepipe: DatePipe,
                private cdr: ChangeDetectorRef,
                private resourceService: ResourcesService,
                private domainsList: Domains) {
    }

    ngOnInit(): void {
        this.getCurrentUser();
        this.initForm();
        this.getPathSlug();
    }

    initForm() {
        //Form
        this.addEditorialForm = this.editorialForm.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            subcategory: ['', Validators.required],
            shortDescription: [''],
            metaDescription: [''],
            metaTitle: ['', Validators.required],
            tags: [['']],
            categoryTags: [['']],
            content: [''],
            featuredImage: [''],
            slug: ['', Validators.required],
            status: ['Draft'],
            authors: [['']],
            date: [''],
            city: [''],
            country: [''],
            imageGridCaption: [''],
            imageCarouselCaption: [''],
            carouselDescription: [''],
            imageGridDescription: [''],
            singleVideoDescription: [''],
            multipleVideoDescription: [''],
            conclusionTitle: [''],
            conclusionContent: [''],
            carouselTitle: [''],
            gridImagesTitle: [''],
            introductionTitle: [''],
            singleVideoTitle: [''],
            multipleVideoTitle: [''],
            singleImageOrder: ['1'],
            imageGridOrder: ['2'],
            imageCarouselOrder: ['3'],
            singleVideoOrder: ['4'],
            multipleVideosOrder: ['5'],
        });


        this.formIsLoaded = true;
        this.addEditorialForm.get('date').disable();
    }

    getEditorialCategories(){
        this.editorialsService.getEditorialCategories().subscribe((categories:Array<EditorialCategoryModel>)=>{
            this.categories= categories;
            if(this.isEditMode){
                const findCateg = categories.find(categ => categ.name === this.editEditorialData?.category);
                if(findCateg){
                    this.addEditorialForm.get('category').patchValue(findCateg.id);
                    this.getSubcategory(findCateg.id);
                }
                this.categoryDestinationsSelected = findCateg?.id === '64198991f6f1ab5b0e46b61a';
            }
        })
    }

    onCategoryChange(event){
        this.categoryDestinationsSelected = event.value === '64198991f6f1ab5b0e46b61a';
        this.getSubcategory(event.value);
    }

    getSubcategory(categoryId: string){
        this.editorialsService.getEditorialSubcategoriesByCategoryId(categoryId).subscribe((subcategories: Array<object>)=>{
            this.subcategories = subcategories;
        })
    }

//wyziwyg
    htmlContent: string;
    editorConfig: AngularEditorConfig = {
        editable: true,
        height: '300',
        minHeight: '200px',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        enableToolbar: true,
        showToolbar: true,
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Roboto',
        defaultFontSize: '',
        fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
        ],
        customClasses: [
            {
                name: 'Title',
                class: 'format-title'
            },
            {
                name: 'Paragraph',
                class: 'format-paragraph'
            }

        ],
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            ['subscript'],
            ['superscript'],
            ['backgroundColor'],
            ['insertImage'],
            ['insertVideo']
        ]
    };

    //get the editorial slug from url
    getPathSlug() {
        this.route.params.subscribe(params => {
            this.editorialSlug = params['slug'];
            //get editorial by slug
            if (this.editorialSlug !== undefined) {
                this.isEditMode = true;
                this.getEditorialBySlug(this.editorialSlug);
                // this.addEditorialForm.get('slug').disable();
            }else{
                this.getEditorialCategories();
            }
        });
    }

    //add tags
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    addTag(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our tag
        if (value) {
            this.addedTags.push(value);
        }

        // Clear the input value
        event.chipInput.clear();
    }

    addCategoryTag(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our tag
        if (value) {
            this.categoryTags.push(value);
        }

        // Clear the input value
        event.chipInput.clear();
    }

    //remove tag
    remove(tag: string): void {
        const index = this.addedTags.indexOf(tag);

        if (index >= 0) {
            this.addedTags.splice(index, 1);
        }
    }

    removeCategoryTag(tag: string): void {
        const index = this.categoryTags.indexOf(tag);

        if (index >= 0) {
            this.categoryTags.splice(index, 1);
        }
    }

    //create editorial
    addEditorial() {
        this.editorialSubmitted = true;
         // imageGridCaption: [''],
         //    imageCarouselCaption: [''],
         //    carouselDescription: [''],
         //    imageGridDescription: [''],
         //    singleVideoDescription: [''],
         //    multipleVideoDescription: [''],
         //    carouselTitle: [''],
         //    imageGridTitle: [''],
         //    singleVideoTitle: [''],
         //    multipleVideoTitle: [''],
         //    singleImageOrder: ['1'],
         //    imageGridOrder: ['2'],
         //    imageCarouselOrder: ['3'],
         //    singleVideoOrder: ['4'],
         //    multipleVideosOrder: ['5'],
        const editorialObj = {
            title: this.addEditorialForm.value.title,
            category: this.addEditorialForm.value.category,
            subcategory: this.addEditorialForm.value.subcategory,
            shortDescription: this.addEditorialForm.value.shortDescription,
            metaDescription: this.addEditorialForm.value.metaDescription,
            metaTitle: this.addEditorialForm.value.metaTitle,
            tags: this.addedTags,
            content: this.addEditorialForm.value.content,
            featuredImage: '',
            slug: this.addEditorialForm.value.slug,
            status: this.addEditorialForm.value.status,
            authors: [''],
            carouselDescription: this.addEditorialForm.value.carouselDescription,
            carouselOrder: this.addEditorialForm.value.imageCarouselOrder,
            imageGridDescription: this.addEditorialForm.value.imageGridDescription,
            imageGridOrder: this.addEditorialForm.value.imageGridOrder,
            multipleVideosOrder: this.addEditorialForm.value.multipleVideosOrder,
            singleImageOrder: this.addEditorialForm.value.singleImageOrder,
            singleVideoOrder: this.addEditorialForm.value.singleVideoOrder,
            singleVideoLink: '',
            // singleVideoLink: this.arrayOfSingleGridVideos[0],
            // carouselImages: this.arrayOfCarouselImages,
            // gridImages: this.arrayOfGridImages,
            carouselImages: [],
            gridImages: [],
            videosLinks: [],
            singleVideoDescription: this.addEditorialForm.value.singleVideoDescription,
            singleVideoTitle: this.addEditorialForm.value.singleVideoTitle,
            multipleVideoDescription: this.addEditorialForm.value.multipleVideoDescription,
            multipleVideoTitle: this.addEditorialForm.value.multipleVideoTitle,
            conclusionTitle: this.addEditorialForm.value.conclusionTitle,
            conclusionContent: this.addEditorialForm.value.conclusionContent,
            categoryTags: this.categoryTags,
            carouselTitle: this.addEditorialForm.value.carouselTitle,
            introductionTitle: this.addEditorialForm.value.introductionTitle,
            gridImagesTitle: this.addEditorialForm.value.gridImagesTitle,
            location: this.categoryDestinationsSelected ? [this.addEditorialForm.value.city, this.addEditorialForm.value.country] : null,

            // publishedDate: this.datepipe.transform(this.addEditorialForm.value.publishedDate, 'yyyy-MM-dd')
            publishedDate:''
        };

        const uploads = [];
        uploads[0] = this.feateruedImgFile ? this.resourceService.createImagesOnServer([this.feateruedImgFile]) : of([]);
        uploads[1] = this.arrayOfCarouselImagesFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfCarouselImagesFiles) : of([]);
        uploads[2] = this.arrayOfGridImagesFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfGridImagesFiles) : of([]);
        uploads[3] = this.arrayOfSingleGridVideosFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfSingleGridVideosFiles) : of([]);
        uploads[4] = this.arrayOfMultipleVideosFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfMultipleVideosFiles) : of([]);

        forkJoin(uploads).pipe(
            switchMap((uploadedFiles: string[][]) => {
                editorialObj.featuredImage = uploadedFiles[0][0];
                editorialObj.carouselImages = uploadedFiles[1];
                editorialObj.gridImages = uploadedFiles[2];
                editorialObj.singleVideoLink = uploadedFiles[3][0];
                editorialObj.videosLinks = uploadedFiles[4];
                return this.editorialsService.addEditorial(editorialObj);

            })
        ).subscribe((data: { reason: string, success: boolean }) => {

            //show message
            this.toastService.showToast("Succes", "Editorialul a fost adăugat!", "success");
            //navigate to list
            if(this.isAdmin){
                this.router.navigate(['/private/admin/editorials/list']);

            }else if(this.isStaff){
                this.router.navigate(['/private/staff/editorials/list']);
            }else{
                return;
            }
        }, (error) => {
            this.editorialSubmitted = false;
            this.toastService.showToast("Eroare", "A apărut o problemă!", "error");

            // Show specific error feedback message
            if (error.error.reason === 'youAreNotLoggedIn') {
                this.toastService.showToast("Eroare", "Nu sunteti logat!", "error");
            }
        });
    }


    //publish editorial
    publishEditorial() {
        const editorialObj = {
            title: this.addEditorialForm.value.title,
            category: this.addEditorialForm.value.category,
            subcategory: this.addEditorialForm.value.subcategory,
            shortDescription: this.addEditorialForm.value.shortDescription,
            metaDescription: this.addEditorialForm.value.metaDescription,
            metaTitle: this.addEditorialForm.value.metaTitle,
            tags: this.addedTags,
            content: this.addEditorialForm.value.content,
            featuredImage: {fileName: this.nameFeaturedImg, filePath: this.urlfeaturedImg},
            slug: this.addEditorialForm.value.slug,
            status: 'Active',
            authors: [''],
            publishedDate: this.datepipe.transform(this.addEditorialForm.value.publishedDate, 'yyyy-MM-dd'),
        };

        //add new editorial
        this.editorialsService.addEditorial(editorialObj).subscribe((data: { reason: string, success: boolean }) => {

            //upload image by the new id "data.reason"
            this.editorialsService.uploadEditorialImage(data.reason, this.uploadedImageEvent)
            .subscribe((dataAdd) => {
                    console.log(dataAdd);
                }
            ), (error)=>{
                console.log(error);
            };

            //show message
            this.toastService.showToast("Succes", "Editorialul a fost publicat cu succes!", "success");
            //navigate to list
            this.router.navigate(['/dashboard/editorials/list']);

        }, (error) => {
            this.toastService.showToast("Eroare", "A apărut o problemă!", "error");


        });

    }

    getCurrentUser() {
        this.editorialsService.getCurrentUser().subscribe((currentUser: User) => {
            if (currentUser === null) {
                this.toastService.showToast("Eroare", "Nu sunteti logat!", "error");
            }
            if(currentUser.roles.includes('ROLE_SUPER_ADMIN')){
                this.isAdmin=true;
                this.isStaff=false;
            }else if(currentUser.roles.includes('ROLE_STAFF')){
                this.isAdmin=false;
                this.isStaff=true;
            }else{
                return;
            }
        });
    }


    getEditorialBySlug(slug: string) {
        this.addEditorialForm = this.editorialForm.group({
            title: ['', Validators.required],
            category: ['', Validators.required],
            subcategory: ['', Validators.required],
            shortDescription: [''],
            metaDescription: [''],
            metaTitle: ['', Validators.required],
            tags: [['']],
            categoryTags: [['']],
            content: [''],
            featuredImage: [''],
            slug: ['', Validators.required],
            status: ['Draft'],
            authors: [['']],
            date: [''],
            city: [''],
            country: [''],
            imageGridCaption: [''],
            imageCarouselCaption: [''],
            carouselDescription: [''],
            imageGridDescription: [''],
            singleVideoDescription: [''],
            multipleVideoDescription: [''],
            conclusionTitle: [''],
            conclusionContent: [''],
            carouselTitle: [''],
            gridImagesTitle: [''],
            introductionTitle: [''],
            singleVideoTitle: [''],
            multipleVideoTitle: [''],
            singleImageOrder: ['1'],
            imageGridOrder: ['2'],
            imageCarouselOrder: ['3'],
            singleVideoOrder: ['4'],
            multipleVideosOrder: ['5'],
        });
        // const editorialObj = {
        //     title: this.addEditorialForm.value.title,
        //     category: this.addEditorialForm.value.category,
        //     subcategory: this.addEditorialForm.value.subcategory,
        //     shortDescription: this.addEditorialForm.value.shortDescription,
        //     metaDescription: this.addEditorialForm.value.metaDescription,
        //     metaTitle: this.addEditorialForm.value.metaTitle,
        //     tags: this.addedTags,
        //     content: this.addEditorialForm.value.content,
        //     featuredImage: '',
        //     slug: this.addEditorialForm.value.slug,
        //     status: this.addEditorialForm.value.status,
        //     authors: [''],
        //     carouselDescription: this.addEditorialForm.value.carouselDescription,
        //     carouselOrder: this.addEditorialForm.value.imageCarouselOrder,
        //     imageGridDescription: this.addEditorialForm.value.imageGridDescription,
        //     imageGridOrder: this.addEditorialForm.value.imageGridOrder,
        //     multipleVideosOrder: this.addEditorialForm.value.multipleVideosOrder,
        //     singleImageOrder: this.addEditorialForm.value.singleImageOrder,
        //     singleVideoOrder: this.addEditorialForm.value.singleVideoOrder,
        //     singleVideoLink: this.arrayOfSingleGridVideos[0],
        //     carouselImages: this.arrayOfCarouselImages,
        //     gridImages: this.arrayOfGridImages,
        //     videosLinks: [],
        //     singleVideoDescription: this.addEditorialForm.value.singleVideoDescription,
        //     singleVideoTitle: this.addEditorialForm.value.singleVideoTitle,
        //     multipleVideoDescription: this.addEditorialForm.value.multipleVideoDescription,
        //     multipleVideoTitle: this.addEditorialForm.value.multipleVideoTitle,
        //     conclusionTitle: this.addEditorialForm.value.conclusionTitle,
        //     conclusionContent: this.addEditorialForm.value.conclusionContent,
        //     categoryTags: this.categoryTags,
        //     carouselTitle: this.addEditorialForm.value.carouselTitle,
        //     introductionTitle: this.addEditorialForm.value.introductionTitle,
        //     gridImagesTitle: this.addEditorialForm.value.gridImagesTitle,
        //     location: this.categoryDestinationsSelected ? [this.addEditorialForm.value.city, this.addEditorialForm.value.country] : null,
        //
        //     // publishedDate: this.datepipe.transform(this.addEditorialForm.value.publishedDate, 'yyyy-MM-dd')
        //     publishedDate:''
        // };
        this.editorialsService.getEditorialBySlug(slug).subscribe((editorial2Edit: any) => {
            this.editEditorialData = editorial2Edit;
            this.urlfeaturedImg = editorial2Edit?.featuredImage ? editorial2Edit?.featuredImage : '/assets/images/others/Showcase.jpg';
            this.editorialId = editorial2Edit.id;
            this.addEditorialForm.patchValue(editorial2Edit);
            // this.getSubcategory(editorial2Edit.category);
            this.addedTags = editorial2Edit.tags;
            this.categoryTags = editorial2Edit?.categoryTags?.length ? editorial2Edit?.categoryTags : [];
            this.oldCarouselImages = editorial2Edit?.carouselImages?.length ? editorial2Edit?.carouselImages : [];
            this.oldGridImages = editorial2Edit?.gridImages?.length ? editorial2Edit?.gridImages : [];
            this.arrayOfSingleGridVideos = editorial2Edit?.singleVideoLink ? [editorial2Edit?.singleVideoLink] : [];
            this.addEditorialForm.patchValue({
                title: editorial2Edit?.title ? editorial2Edit?.title : '',
                category: editorial2Edit?.category ? editorial2Edit?.category : '',
                subcategory: editorial2Edit?.subcategory ? editorial2Edit?.subcategory : '',
                shortDescription: editorial2Edit?.shortDescription ? editorial2Edit?.shortDescription : '',
                metaDescription: editorial2Edit?.metaDescription ? editorial2Edit?.metaDescription : '',
                metaTitle: editorial2Edit?.metaTitle ? editorial2Edit?.metaTitle : '',
                tags: editorial2Edit?.tags?.length ? editorial2Edit?.tags : [''],
                categoryTags: editorial2Edit?.categoryTags?.length ? editorial2Edit?.categoryTags : [''],
                content: editorial2Edit?.content ? editorial2Edit?.content : '',
                featuredImage: editorial2Edit?.featuredImage ? editorial2Edit?.featuredImage : '',
                slug: editorial2Edit?.slug ? editorial2Edit?.slug : '',
                status: editorial2Edit?.status ? editorial2Edit?.status : 'Draft',
                date: editorial2Edit?.date?.length ? new Date(new Date(editorial2Edit?.date[0], editorial2Edit?.date[1], editorial2Edit?.date[2], editorial2Edit?.date[3], editorial2Edit?.date[4])) : '',
                city: editorial2Edit?.city ? editorial2Edit?.city : '',
                country: editorial2Edit?.country ? editorial2Edit?.country : '',
                imageGridCaption: editorial2Edit?.imageGridCaption ? editorial2Edit?.imageGridCaption : '',
                imageCarouselCaption: editorial2Edit?.imageCarouselCaption ? editorial2Edit?.imageCarouselCaption : '',
                carouselDescription: editorial2Edit?.carouselDescription ? editorial2Edit?.carouselDescription : '',
                imageGridDescription: editorial2Edit?.imageGridDescription ? editorial2Edit?.imageGridDescription : '',
                singleVideoDescription: editorial2Edit?.singleVideoDescription ? editorial2Edit?.singleVideoDescription : '',
                multipleVideoDescription: editorial2Edit?.multipleVideoDescription ? editorial2Edit?.multipleVideoDescription : '',
                conclusionTitle: editorial2Edit?.conclusionTitle ? editorial2Edit?.conclusionTitle : '',
                conclusionContent: editorial2Edit?.conclusionContent ? editorial2Edit?.conclusionContent : '',
                carouselTitle: editorial2Edit?.carouselTitle ? editorial2Edit?.carouselTitle : '',
                gridImagesTitle: editorial2Edit?.gridImagesTitle ? editorial2Edit?.gridImagesTitle : '',
                introductionTitle: editorial2Edit?.introductionTitle ? editorial2Edit?.introductionTitle : '',
                singleVideoTitle: editorial2Edit?.singleVideoTitle ? editorial2Edit?.singleVideoTitle : '',
                multipleVideoTitle: editorial2Edit?.multipleVideoTitle ? editorial2Edit?.multipleVideoTitle : '',
                singleImageOrder: editorial2Edit?.singleImageOrder ? editorial2Edit?.singleImageOrder : '1',
                imageGridOrder: editorial2Edit?.imageGridOrder ? editorial2Edit?.imageGridOrder : '2',
                imageCarouselOrder: editorial2Edit?.imageCarouselOrder ? editorial2Edit?.imageCarouselOrder : '3',
                singleVideoOrder: editorial2Edit?.singleVideoOrder ? editorial2Edit?.singleVideoOrder : '4',
                multipleVideosOrder: editorial2Edit?.multipleVideosOrder ? editorial2Edit?.multipleVideosOrder : '5',
            });
            this.getEditorialCategories();
            // this.urlfeaturedImg = editorial2Edit.featuredImage?.filePath === '' ? this.urlfeaturedImg : editorial2Edit.featuredImage?.filePath;
        });
    }

    updateEditorial() {
        this.editorialSubmitted = true;
        const editorialObj = {
            title: this.addEditorialForm.value.title,
            category: this.addEditorialForm.value.category,
            subcategory: this.addEditorialForm.value.subcategory,
            shortDescription: this.addEditorialForm.value.shortDescription,
            metaDescription: this.addEditorialForm.value.metaDescription,
            metaTitle: this.addEditorialForm.value.metaTitle,
            tags: this.addedTags,
            content: this.addEditorialForm.value.content,
            featuredImage: '',
            slug: this.addEditorialForm.value.slug,
            status: this.addEditorialForm.value.status,
            authors: [''],
            carouselDescription: this.addEditorialForm.value.carouselDescription,
            carouselOrder: this.addEditorialForm.value.imageCarouselOrder,
            imageGridDescription: this.addEditorialForm.value.imageGridDescription,
            imageGridOrder: this.addEditorialForm.value.imageGridOrder,
            multipleVideosOrder: this.addEditorialForm.value.multipleVideosOrder,
            singleImageOrder: this.addEditorialForm.value.singleImageOrder,
            singleVideoOrder: this.addEditorialForm.value.singleVideoOrder,
            singleVideoLink: '',
            // singleVideoLink: this.arrayOfSingleGridVideos[0],
            // carouselImages: this.arrayOfCarouselImages,
            // gridImages: this.arrayOfGridImages,
            carouselImages: [],
            gridImages: [],
            videosLinks: [],
            singleVideoDescription: this.addEditorialForm.value.singleVideoDescription,
            singleVideoTitle: this.addEditorialForm.value.singleVideoTitle,
            multipleVideoDescription: this.addEditorialForm.value.multipleVideoDescription,
            multipleVideoTitle: this.addEditorialForm.value.multipleVideoTitle,
            conclusionTitle: this.addEditorialForm.value.conclusionTitle,
            conclusionContent: this.addEditorialForm.value.conclusionContent,
            categoryTags: this.categoryTags,
            carouselTitle: this.addEditorialForm.value.carouselTitle,
            introductionTitle: this.addEditorialForm.value.introductionTitle,
            gridImagesTitle: this.addEditorialForm.value.gridImagesTitle,
            location: this.categoryDestinationsSelected ? [this.addEditorialForm.value.city, this.addEditorialForm.value.country] : null,

            // publishedDate: this.datepipe.transform(this.addEditorialForm.value.publishedDate, 'yyyy-MM-dd')
            publishedDate:''
        };

        const uploads = [];
        uploads[0] = this.feateruedImgFile ? this.resourceService.createImagesOnServer([this.feateruedImgFile]) : of([]);
        uploads[1] = this.arrayOfCarouselImagesFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfCarouselImagesFiles) : of([]);
        uploads[2] = this.arrayOfGridImagesFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfGridImagesFiles) : of([]);
        uploads[3] = this.arrayOfSingleGridVideosFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfSingleGridVideosFiles) : of([]);
        uploads[4] = this.arrayOfMultipleVideosFiles.length ? this.resourceService.createImagesOnServer(this.arrayOfMultipleVideosFiles) : of([]);

        forkJoin(uploads).pipe(
            switchMap((uploadedFiles: string[][]) => {
                editorialObj.featuredImage = uploadedFiles[0][0] || this.urlfeaturedImg as string;
                editorialObj.carouselImages = uploadedFiles[1]?.length ? [...uploadedFiles[1], ...this.oldCarouselImages] : [...this.oldCarouselImages];
                // editorialObj.gridImages = uploadedFiles[2];
                editorialObj.gridImages = uploadedFiles[2]?.length ? [...uploadedFiles[2], ...this.oldGridImages] : [...this.oldGridImages];
                editorialObj.singleVideoLink = uploadedFiles[3][0] ? uploadedFiles[3][0] : this.arrayOfSingleGridVideos[0];
                editorialObj.videosLinks = uploadedFiles[4];
                return this.editorialsService.updateEditorial(this.editorialId, editorialObj);

            })
        ).subscribe(() => {

            //show message
            this.toastService.showToast("Succes", "Editorialul a fost modificat cu succes!", "success");
            //navigate to list
            if(this.isAdmin){
                this.router.navigate(['/private/admin/editorials/list']);

            }else if(this.isStaff){
                this.router.navigate(['/private/staff/editorials/list']);
            }else{
                return;
            }
        }, (error) => {
            this.editorialSubmitted = false;
            this.toastService.showToast("Eroare", "A apărut o problemă!", "error");

            // Show specific error feedback message
            if (error.error.reason === 'youAreNotLoggedIn') {
                this.toastService.showToast("Eroare", "You're not logged in!", "error");
            }
        });
    }

    //create slug suggestion
    createSlug(title: string) {
        const insertedTitle = title.toLocaleLowerCase();
        this.slugSuggestion = insertedTitle.split(' ').join('-');
        this.addEditorialForm.get("slug").patchValue(this.slugSuggestion);
        this.cdr.detectChanges();
    }

    //update editorial
    // editEditorial(id: string, editorialObj: Resource) {
    //     this.editorialsService.updateEditorial(id, editorialObj).subscribe(() => {
    //         //show message
    //         this.toastService.showToast("Succes", "Editorialul a fost modificat cu succes!", "success");
    //         this.cdr.detectChanges();
    //         // this.router.navigate(['/dashboard/editorials/list'])
    //     }, error => {
    //         this.toastService.showToast("Eroare", "A apărut o problemă!", "error");
    //     });
    // }

    removeImage(index: number, galleryType: string, old = false) {
        if (galleryType === 'carousel') {
            if (old) {
                this.oldCarouselImages.splice(index, 1);
            } else {
                this.arrayOfCarouselImages.splice(index, 1);
                this.arrayOfCarouselImagesFiles.splice(index, 1);
            }
        }

        if (galleryType === 'grid-images') {
            if (old) {
                this.oldGridImages.splice(index, 1);
            } else {
                this.arrayOfGridImages.splice(index, 1);
                this.arrayOfGridImagesFiles.splice(index, 1);
            }
        }
    }

    onMultipleImgChanged(event: any, galleryType: string) {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
            // You can handle each file here, for example, displaying previews
            for (let i = 0; i < files.length; i++) {
                const file: File = files[i];
                // Assuming you want to display a preview of each selected image
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    // Push the result into the arrayOfCarouselImages
                    if (galleryType === 'carousel') {
                        this.arrayOfCarouselImagesFiles.push(file);
                        this.arrayOfCarouselImages.push(e.target.result);
                    }

                    if (galleryType === 'grid-images') {
                        this.arrayOfGridImagesFiles.push(file);
                        this.arrayOfGridImages.push({
                            fileName: file.name,
                            filePath: e.target.result
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }

    onVideoChanged(event: any, type: string) {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file: File = files[i];
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    if (type === 'singlevideo') {
                        this.arrayOfSingleGridVideosFiles = [];
                        this.arrayOfSingleGridVideosFiles.push(file);
                        this.arrayOfSingleGridVideos = [];
                        this.arrayOfSingleGridVideos.push(e.target.result);
                    }
                    if (type === 'multiplevideo') {
                        this.arrayOfMultipleVideosFiles.push(file);
                        this.arrayOfMultipleVideos.push({
                            fileName: file.name,
                            filePath: e.target.result
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }

    removeVideo(index: number, eventType: string) {
        if (eventType === 'singlevideo') {
            this.arrayOfSingleGridVideos.splice(index, 1);
            this.arrayOfSingleGridVideosFiles.splice(index, 1);
        } else {
            this.arrayOfMultipleVideos.splice(index, 1);
            this.arrayOfMultipleVideosFiles.splice(index, 1);
        }
    }

    //change featured image
    onImgChanged($event: any) {
        const files = $event.target.files;
        if (files.length === 0)
            return;
        const maxSize = 2 * 1024 * 1024;
        //read the image
        const reader = new FileReader();
        this.imagePath = files;

        //get image
        if ($event.target.files[0].size < maxSize) {
            this.uploadedImageEvent = $event.target.files[0];
        }else{
            this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
            return;
        }

        //if update editorial
        if (this.editorialSlug) {
            this.editorialsService.uploadEditorialImage(this.editorialId, $event.target.files[0])
            .subscribe(() => {
                reader.readAsDataURL(files[0]);
                this.nameFeaturedImg = files[0].name;
                reader.onload = () => {
                    //new image link
                    this.feateruedImgFile = files[0];
                    this.urlfeaturedImg = reader.result;
                    this.cdr.detectChanges();
                }
            }), (error) => {
                if(error.error.reason === 'fileSizeTooBig'){
                    this.toastService.showToast("Eroare", "Fisierul incărcat este prea mare! Încărcați o imagine mai mica de 2 MB!", "error");
                } else if(error.error.reason === 'wrongExtension'){
                    this.toastService.showToast("Eroare", "Formatul fisierului nu este permis!", "error");

                }else{
                    this.toastService.showToast("Eroare", "A aparut o problemă la încărcarea imaginii!", "error");
                }

            };
        }
        //if add new wditorial
        else {
            reader.readAsDataURL(files[0]);
            this.feateruedImgFile = files[0];
            this.nameFeaturedImg = files[0].name;
            reader.onload = () => {
                //new image link
                this.urlfeaturedImg = reader.result;
                this.cdr.detectChanges();
            }
        }
    }

    // clearTitle(){
    //   this.addEditorialForm.get("title").patchValue('');
    // }
    // clearMetaTitle(){
    //   this.addEditorialForm.get("metaTitle").patchValue('');
    // }
    // clearMetaDescription(){
    //   this.addEditorialForm.get("metaDescription").patchValue('');
    // }
    // clearSlug(){
    //   this.addEditorialForm.get("slug").patchValue('');
    // }

    clearFormControlAddEditorial(formControl) {
        this.addEditorialForm.get(formControl).patchValue(null);
    }


    // Create / Edit
    saveHandler() {
        // Check if the form is valid
        if (this.addEditorialForm.valid) {
            // Check if you have a user ID
            if (this.editorialSlug !== undefined) {
                // Edit user
                this.updateEditorial();
            } else {
                // Create user
                this.addEditorial();
            }
        } else {
            // Mark all inputs as touched
            this.addEditorialForm.markAllAsTouched();
        }
    }


}
