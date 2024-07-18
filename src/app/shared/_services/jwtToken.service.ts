import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable()
export class JwtTokenService{
    private jwtToken: string;
    private decodedToken: { [p: string]: string; };

    setToken(token: string) {
        if (token) {
            this.jwtToken = token;
        }
    }

    decodeToken() {
        if (this.jwtToken) {
            this.decodedToken = jwt_decode(this.jwtToken);
        }
    }

    getExpiryTime() {
        this.decodeToken();
        return this.decodedToken ? this.decodedToken["exp"] : null;
    }

    isTokenExpired(): boolean {
        const expiryTime: string = this.getExpiryTime();
        if (expiryTime) {
            return ((1000 * +expiryTime) - (new Date()).getTime()) < 5000;
        } else {
            return false;
        }

    }

    getDecodedToken() {
        this.jwtToken = localStorage.getItem('token');

        if (this.jwtToken) {
            this.decodeToken();
            return this.decodedToken;
        }

        return null;
    }


}
