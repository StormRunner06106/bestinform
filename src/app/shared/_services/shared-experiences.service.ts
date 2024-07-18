import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SharedExperience} from "../_models/shared-experience.model";
import {share} from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class SharedExperiencesService{

    constructor(private http: HttpClient) {
    }

    listSharedExperiencesFiltered(page: number, size: number, sort?: string, dir?: string, filters?: object) {
        return this.http.post('/bestinform/listSharedExperienceFiltered?page=' + page + '&size=' + size + '&sort=' + sort + '&dir=' + dir, filters);
    }

    getSharedExperienceById(sharedExperienceId: string){
        return this.http.get('/bestinform/getSharedExperienceById?sharedExperienceId='+ sharedExperienceId);
    }

    getSharedExperienceBySlug(sharedExperienceSlug: string){
        return this.http.get('/bestinform/getSharedExperienceBySlug?slug=' + sharedExperienceSlug);
    }

    createSharedExperience(sharedExperience: SharedExperience){
        return this.http.post('/bestinform/addSharedExperience', sharedExperience);
    }

    updateSharedExperience(sharedExperienceId: string, sharedExperience: SharedExperience){
        return this.http.put('/bestinform/updateSharedExperience?sharedExperienceId='+ sharedExperienceId, sharedExperience);
    }

    requestToJoinSharedExperience(sharedExperienceId: string){
        return this.http.post('/bestinform/askToJoinSharedExperience?sharedExperienceId=' + sharedExperienceId, {});
    }

    respondToRequest(sharedExperienceId: string, guestUserId: string, accepted: boolean){
        return this.http.post('/bestinform/acceptRequestToJoinSharedExperience?sharedExperienceId='+sharedExperienceId + '&guestUserId='+guestUserId + '&acceptRequest='+accepted,{});
    }

    deleteParticipantFromExperience(sharedExperienceId: string, participantId: string){
        return this.http.delete('/bestinform/deleteParticipantFromSharedExperience?sharedExperienceId='+sharedExperienceId+'&participantId='+participantId);
    }

    leaveSharedExperience(sharedExperienceId: string){
        return this.http.post('/bestinform/leaveSharedExperience?sharedExperienceId='+ sharedExperienceId, {});
    }

    deleteSharedExperience(sharedExperienceId: string){
        return this.http.delete('/bestinform/deleteSharedExperience?sharedExperienceId='+ sharedExperienceId);
    }
}