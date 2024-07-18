import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CVService {

    experienceList$ = new BehaviorSubject([]);
    refreshExperienceList$ = new BehaviorSubject(false);

    educationList$ = new BehaviorSubject([]);
    refreshEducationList$ = new BehaviorSubject(false);

    certificationList$ = new BehaviorSubject([]);
    refreshCertificationList$ = new BehaviorSubject(false);


    refreshExperienceListData() {
        return this.refreshExperienceList$.asObservable();
    }

    experienceListData() {
        return this.experienceList$.asObservable()
    }

    addExperienceToList(experience) {
        this.experienceList$.next(this.experienceList$.getValue().concat(experience));
    }

    refreshEducationListData() {
        return this.refreshEducationList$.asObservable();
    }

    addEducationToList(education) {
        this.educationList$.next(this.educationList$.getValue().concat(education));
    }

    refreshCertificationListData() {
        return this.refreshCertificationList$.asObservable();
    }

    addCertificationToList(certification) {
        this.certificationList$.next(this.certificationList$.getValue().concat(certification));
    }


    constructor(private http: HttpClient) {
    }

    getCurrentUserCV() {
        return this.http.get('/bestinform/getCurrentUserCV');
    }

    getCvByUserId(userId: string) {
        return this.http.get('/bestinform/getCVByUserId?userId=' + userId);
    }

    updateCurrentUserCV(userCv) {
        return this.http.put('/bestinform/updateCurrentUserCV', userCv);
    }

    createCv(userCv){
        return this.http.post('/bestinform/createCV', userCv);
    }

    deleteCvAvatar() {
        return this.http.put('/bestinform/deleteCvAvatar', {});
    }

    uploadCVAvatar(file: object) {
        return this.http.post('/bestinform/uploadCvAvatar', file);
    }

    uploadCVFile(file: object) {
        return this.http.post('/bestinform/uploadUserCv', file);
    }


    applyToJob(resourceId: string) {
        return this.http.post('/bestinform/createJobApplication?resourceId=' + resourceId, {});
    }

}