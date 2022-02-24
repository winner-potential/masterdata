import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    api = (window as any).api || environment.api;

    constructor(private httpClient: HttpClient) {
    }

    login(username: String, password: String) {
        return this.httpClient.post(`${this.api}api/v1.0/authentificate/`, {
            username: username,
            password: password
        });
    }
}
