import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MediaService} from "../../_services/media.service";
import {ModalMediaService} from "../../_services/modalmedia.service";
import {NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ToastService} from "../../_services/toast.service";

@Component({
    selector: 'app-choose-media',
    templateUrl: './choose-media.component.html',
    styleUrls: ['./choose-media.component.scss']
})
export class ChooseMediaComponent implements OnInit, OnDestroy {

    @Input() category: string;
    @Input() multipleSelect: boolean;
    @Input() modalRef: NgbModalRef;
    @Input() for: string;

    // information about filters and pagination
    paginationInfo: any;

    pageNumber: number;
    pageSize: number;
    pageSizeArray = [24, 36, 72, 96];
    dir = 'desc';
    sort = 'date';

    mediaForm: FormGroup;
    mediaList: any;
    selectedImages: any = [];
    selectedFilesArray: any = [];

    selectedFiles = [];
    mediaId: string;

    private ngUnsubscribe = new Subject<void>();

    constructor(private fb: FormBuilder,
                private mediaService: MediaService,
                private modalMediaService: ModalMediaService,
                private toastService: ToastService) {
    }

    ngOnInit() {
        this.listenForSelectedMedia();
        this.pageSize = 24;
        this.pageNumber = 1;

        this.formInit();
        this.getMedia();
    }

    listenForSelectedMedia() {
        if (!this.multipleSelect) return;

        this.modalMediaService.currentImagesArray
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.selectedImages = [...res];
                }
            });

        this.modalMediaService.currentFilesArray
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: res => {
                    this.selectedFilesArray = [...res];
                }
            });
    }


    formInit() {
        this.mediaForm = this.fb.group({
            name: [null],
            category: this.category
        })
    }

    getMedia() {
        this.pageNumber = 1;
        const filterObj = {
            category: this.mediaForm.value.category ? this.mediaForm.value.category : null,
            name: this.mediaForm.value.name ? this.mediaForm.value.name : null
        }

        this.mediaService.listMediaFiltered(this.pageNumber - 1, this.pageSize, this.sort, this.dir, filterObj).subscribe((mediaList: any) => {
            console.log(mediaList);
            this.mediaList = mediaList.content;
            this.paginationInfo = mediaList;
        })
    }

    pageChange(event) {
        this.pageNumber = event.pageIndex + 1;
        this.pageSize = event.pageSize;

        const filterObj = {
            category: this.mediaForm.value.category ? this.mediaForm.value.category : null,
            name: this.mediaForm.value.name ? this.mediaForm.value.name : null
        }

        this.mediaService.listMediaFiltered(this.pageNumber - 1, this.pageSize, this.sort, this.dir, filterObj).subscribe((mediaList: any) => {
            console.log(mediaList);
            this.mediaList = mediaList.content;
            this.paginationInfo = mediaList;
        })
    }

    checkForSelection(media) {
        // console.log('check', media);
        if (media.category === 'image') {
            // console.log('case 1', this.selectedImages.some((image: any) => image.filePath === media.path))
            return this.selectedImages.some((image: any) => image.filePath === media.path);
        } else {
            // console.log('case 2', this.selectedFilesArray.some((file: any) => file.filePath === media.path))
            return this.selectedFilesArray.some((file: any) => file.filePath === media.path);
        }
    }

    onSelectMedia(event: any, media: any) {
        console.log(media)

        const selectedMedia = {filePath: media.path, fileName: media.name};

        if (!this.multipleSelect) {
            if (event.target.checked) {
                this.selectedImages = [];
                this.selectedImages.push({for: this.for, selectedMedia: selectedMedia});
                this.modalMediaService.changeImageArray(this.selectedImages);
                console.log(selectedMedia);
            }
        } else {
            if (event.target.checked) {
                if (media.category === 'image') {
                    this.selectedImages.push(selectedMedia);
                    this.modalMediaService.changeImageArray(this.selectedImages);
                } else {
                    this.selectedFilesArray.push(selectedMedia);
                    this.modalMediaService.changeFileArray(this.selectedFilesArray);
                }

            } else {
                if (media.category === 'image') {
                    if (this.selectedImages.findIndex((x: any) => x.fileName === selectedMedia.fileName) !== -1) {
                        this.selectedImages.splice(this.selectedImages.findIndex((x: any) => x.fileName === selectedMedia.fileName), 1);
                        this.modalMediaService.changeImageArray(this.selectedImages);
                    }
                } else {
                    if (this.selectedFilesArray.findIndex((x: any) => x.fileName === selectedMedia.fileName) !== -1) {
                        this.selectedFilesArray.splice(this.selectedFilesArray.findIndex((x: any) => x.fileName === selectedMedia.fileName), 1);
                        this.modalMediaService.changeFileArray(this.selectedFilesArray);
                    }
                }
            }
        }
    }

    onImgChange(event: any) {
        this.selectedFiles = event.target.files;
        // this.cdr.detectChanges();
        this.addMedia();
    }

    addMedia() {
        if (this.selectedFiles.length > 0) {
            this.mediaService.addMedia().subscribe((resp: any) => {
                this.mediaId = resp.reason;
                this.uploadImage(this.mediaId);
            })
        }
    }

    uploadImage(solutionId: string) {
        if (this.selectedFiles.length > 0) {
            const formData: FormData = new FormData();
            for (let i = 0; i < this.selectedFiles.length; i++) {
                formData.append('file', this.selectedFiles[i])
            }
            this.mediaService.uploadMedia(solutionId, formData)
                .subscribe(res => {
                    this.getMedia();
                }, error => {
                    console.log('nu s-a trimis', error);
                    if(error.error.reason === 'fileSizeTooBig') {
                        this.toastService.showToast('Error', 'Fișierul încărcat este prea mare. Trebuie să aibă maxim 2MB.', "error");
                    } else {
                        this.toastService.showToast('Error', 'Fișierul NU a fost încărcat!', "error");
                    }
                });
        }
    }

    ngOnDestroy(): void {
        // daca suntem pe single select, golim arrayul din serviciu
        if (!this.multipleSelect) {
            this.modalMediaService.changeImageArray([]);
            this.modalMediaService.changeFileArray([]);
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
