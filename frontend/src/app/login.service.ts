import { Injectable } from '@angular/core';
import { UrlSegment } from '@angular/router';

import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor() { }

    public goTo(segments: Array<UrlSegment>) {
        const base = document.getElementsByTagName('base')[0];
        let basePath: string;
        if (base) {
            basePath = base.getAttribute('href');
        }
        let origin = basePath.startsWith('http') ? basePath : (document.location.origin + basePath);
        segments.forEach(seg => {
            if (!origin.endsWith('/')) {
                origin += '/';
            }
            origin += seg.toString();
        });
        let loginOrigin = (window as any).login || environment.login;
        loginOrigin = loginOrigin.startsWith('http') ? loginOrigin : (document.location.origin + loginOrigin);
        const target = new URL(loginOrigin);
        if (target.searchParams) {
            target.searchParams.set('origin', origin);
            window.location.href = target.toString();
        } else {
            window.location.href = loginOrigin + '?origin=' + origin;
        }
    }
}
