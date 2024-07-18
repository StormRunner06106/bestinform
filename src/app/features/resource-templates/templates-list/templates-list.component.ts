import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormControl} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {ToastService} from "../../../shared/_services/toast.service";
import {TemplatesService} from "../../../shared/_services/templates.service";
import {forkJoin, Observable} from 'rxjs';
import {Template} from "../_models/template.model";
import {UserDataService} from "../../../shared/_services/userData.service";

@Component({
    selector: 'app-templates-list',
    templateUrl: './templates-list.component.html',
    styleUrls: ['./templates-list.component.scss']
})
export class TemplatesListComponent implements OnInit {

    // Mat Table - Filter Forms
    searchFilter: FormControl = new FormControl('');

    displayedColumns: string[] = ['title', 'resType', 'actions'];
    dataSource = [];
    myDataSource = [];
    paginationInfo: object;

    listOfObservables$: Observable<any>[];
    loaded: boolean;

    categoryName: string;
    resTypeName: string;

    // initial filter numbers
    pageNumber: number;
    pageSize: number;
    pageSizeArray = [ 10, 25, 100];
    sorting = 'name';
    dir = 'desc';

    templateList: Array<object>;

    userData: object;

    constructor(private modalService: NgbModal,
                private toastService: ToastService,
                private templateService: TemplatesService,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private userDataService: UserDataService) {
    }

    ngOnInit(): void {
        this.pageNumber = 1;
        this.pageSize = 10;

        this.loadTemplates();
        this.cdr.detectChanges();


    }

    openModal(templateRef, userId: string) {
        this.userDataService.getUserById(userId).subscribe(data => {
            this.userData = data;
            console.log('user', data);
        })
        this.modalService.open(templateRef, {centered: true});
    }

    searchTemplate() {
        this.loadTemplates();
    }

    deleteTemplates(id) {
        this.templateService.deleteTemplate(id).subscribe((res: { success: true, reason?: string }) => {
                console.log('DEL', res);
                if (res.success) {
                    this.toastService.showToast(this.translate.instant("TOAST.SUCCESS"), this.translate.instant("TOAST.TEMPLATE.DELETE-SUCCESS"), "success");
                }
                this.modalService.dismissAll();
                this.loadTemplates();
            },
            (error: any) => {
                console.log('EROARE', error);
               if(error.error.reason){
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), 'Șablonul nu poate fi șters dacă a fost atribuit unei resurse existente.', "error");

               }else{
                this.toastService.showToast(this.translate.instant("TOAST.ERROR"), this.translate.instant("TOAST.TEMPLATE.DELETE-ERROR"), "error");

               }
                this.modalService.dismissAll();
            })

    }

    private objectCache: { [id: number]: any[] } = {};
    templates: any;
    totalElements: number;

    // Define a function to get the object name from the cache or fetch it from the API

    private async getObjectNames(ids: string[]): Promise<string[]> {
        const names: string[] = [];
        console.log('IDS GIVEN', ids);
        for (const id of ids) {
            if (this.objectCache[id]) {
                // If the object is already in the cache, add its name to the array
                names.push(this.objectCache[id].nameRo);
            } else {
                // If the object is not in the cache, fetch it from the API
                const response = await this.templateService.getResourceTypeById(id).toPromise();
                console.log('OBJECT RESPONSE', response)
                const object = response as any;
                console.log('OBJECT', object);
                // Store the object in the cache
                if (object !== null) {
                    this.objectCache[id] = object;
                    // Add the object's name to the array
                    names.push(object.nameRo);
                    console.log('NAMES', names);
                }
            }

        }
        return names;
    }

    public async loadTemplates() {
        const response = await this.templateService.listResourceTemplateFiltered(this.pageNumber - 1, this.pageSize, this.sorting, this.dir, {name: this.searchFilter.value}).toPromise();
        const data = response as any;
        for (const template of data.content) {
            console.log('TEMPLATE', template)
            // Get the object names and join them into a single string
            if (template.resourceTypeIds?.length > 0) {
                console.log('avem resourceTypesIds')
                const objectNames = await this.getObjectNames(template.resourceTypeIds);
                template.objectNames = objectNames.join(', ');
            }

        }
        this.templates = data.content;
        this.totalElements = data.totalElements;
        console.log('TEMPLATEURI', this.templates)
    }


    pageChanged(event) {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadTemplates();
    }

    clearFilter(){
        this.searchFilter.patchValue('');
        this.searchTemplate();
    }

}


