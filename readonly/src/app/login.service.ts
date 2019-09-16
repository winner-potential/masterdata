import { Injectable } from '@angular/core';
import { UrlSegment } from '@angular/router';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  public goTo(segments: Array<UrlSegment>) {
    var base = document.getElementsByTagName('base')[0]
    var basePath: string;
    if(base) {
      basePath = base.getAttribute('href')
    }
    var origin = basePath.startsWith('http') ? basePath : (document.location.origin + basePath);
    segments.forEach(seg => {
      if(!origin.endsWith('/'))
        origin += '/'
      origin += seg.toString()
    })
    var loginOrigin = (window as any).login || environment.login;
    loginOrigin = loginOrigin.startsWith('http') ? loginOrigin : (document.location.origin + loginOrigin);
    var target = new URL(loginOrigin);
    if(target.searchParams) {
      target.searchParams.set('origin', origin);
      window.location.href = target.toString();
    } else {
      window.location.href = loginOrigin + "?origin=" + origin;
    }
  }
}
