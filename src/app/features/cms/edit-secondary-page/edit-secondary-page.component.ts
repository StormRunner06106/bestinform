import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ItinerariesService} from "../../itineraries/_services/itineraries.service";
import {TranslateService} from "@ngx-translate/core";
import {ToastService} from "../../../shared/_services/toast.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalMediaService} from "../../../shared/_services/modalmedia.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LocationService} from "../../../shared/_services/location.service";
import {ResourcesService} from "../../resources/_services/resources.service";
import {of, Subject, switchMap} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {PagesService} from "../pages.service";
import {AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
  selector: 'app-edit-secondary-page',
  templateUrl: './edit-secondary-page.component.html',
  styleUrls: ['./edit-secondary-page.component.scss']
})
export class EditSecondaryPageComponent implements OnInit{

  pageForm: FormGroup;
  pageData: any;
  private ngUnsubscribe = new Subject<void>();

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
      ['backgroundColor']
    ]
  };



  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private pagesService: PagesService) {
  }

  ngOnInit() {
    console.log('init');
    this.initForm();
    this.listenToRoute();
  }

  initForm() {
    this.pageForm = this.fb.group({
      name: [null, Validators.required],
      slug: [null, Validators.required],
      content: [null, Validators.required]
    });
  }

  listenToRoute() {
    this.route.paramMap
        .pipe(
            switchMap(route => {
              if (route.has('page')) {
                console.log('avem param');
                return this.pagesService.getSecondaryPageById(route.get('page'));
              }
              return of(null);
            }),
            takeUntil(this.ngUnsubscribe)
        )
        .subscribe({
          next: res => {
            if (!res) return;

            this.pageData = res;
            this.pageForm.patchValue(this.pageData);
          },
          error: () => {
            // this.toastService.showToast(
            //     this.translate.instant("TOAST.ERROR"),
            //     this.translate.instant("TOAST.BOOKING.NOT_FOUND"),
            //     "error");
          }
        });
  }



  savePage() {
    console.log('save page');
    this.pagesService.updateSecondaryPage(this.pageData.id, this.pageForm.value).subscribe((resp: any) => {
      console.log('test', resp);
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


}
