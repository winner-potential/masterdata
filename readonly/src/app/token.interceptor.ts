import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpInterceptor, HttpResponse } from "@angular/common/http";

import { AuthentificationService } from "./authentification.service";
import { tap } from "../../node_modules/rxjs/operators";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthentificationService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    req = req.clone({
      setHeaders: {
        "X-Access-Token": this.auth.token
      }
    });
    return next.handle(req).pipe(tap(ev => {
      if(ev instanceof HttpResponse) {
        var res = ev as HttpResponse<any>;
        var token = res.headers.get("X-Access-Token");
        if(token) {
          this.auth.token = token;
        }
      }
    }));
  }
}
