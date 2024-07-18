import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

    set(key: string, value: string) {
        localStorage.setItem(key, value);
    }


    get(key: string) {
        return localStorage.getItem(key) ? localStorage.getItem(key) : null;
    }

    remove(key: string) {
        localStorage.removeItem(key);
    }
}
