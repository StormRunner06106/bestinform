import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

@Injectable()
export class ModalMediaService {

    private selectedImageMedia = new BehaviorSubject([]);
    currentImagesArray = this.selectedImageMedia.asObservable();

    private selectedFileMedia = new BehaviorSubject([]);
    currentFilesArray = this.selectedFileMedia.asObservable();

    private serviceImages = [];
    private serviceFiles = [];

    constructor() {}

    changeImageArray(message: any) {
        this.selectedImageMedia.next(message);
    }

    changeFileArray(message: any) {
        this.selectedFileMedia.next(message);
    }

    sendImagesToService(images: [{fileName?: string, filePath?: string}]) {
        this.serviceImages = [...images];
    }

    getImagesFromService() {
        return [...this.serviceImages];
    }

    sendFilesToService(files: []) {
        this.serviceFiles = [...files];
    }

    getFilesFromService() {
        return [...this.serviceFiles];
    }

}
