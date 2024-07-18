import { Injectable } from '@angular/core';

@Injectable()
export class SessionStorageService {

    set(key: string, value: string) {
        sessionStorage.setItem(key, value);
    }


    get(key: string) {
        return sessionStorage.getItem(key) ? sessionStorage.getItem(key) : null;
    }

    remove(key: string) {
        sessionStorage.removeItem(key);
    }
}
