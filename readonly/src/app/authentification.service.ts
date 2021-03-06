import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable, Subscriber } from "rxjs";
import { MatDialog } from "../../node_modules/@angular/material";
import { Router, ActivatedRoute } from "../../node_modules/@angular/router";
import { LoginService } from "./login.service";
import { SessionExpiredComponent, DialogData } from "./session/session-expired/session-expired.component";

@Injectable({
  providedIn: "root"
})
export class AuthentificationService {
  private _token: string;
  private _data: any;

  private _waiter: Array<Subscriber<any>> = [];

  constructor(public dialog: MatDialog, private router: Router, private activated: ActivatedRoute, private login: LoginService) {
    var self = this;
    var dialogIsOpen;
    window.setInterval(() => {
      if (dialogIsOpen) {
        return;
      }
      var token = self.token;
      if (token) {
        const helper = new JwtHelperService();
        const isExpired = helper.isTokenExpired(token);
        if (isExpired) {
          dialogIsOpen = true;
          const dialogRef = this.dialog.open(SessionExpiredComponent, {
            width: "350px",
            data: new DialogData()
          });

          dialogRef.afterClosed().subscribe(result => {
            dialogIsOpen = false;
            activated.url.subscribe(url => this.login.goTo(url));
          });
        }
      }
    }, 1000);
    this.restoreToken();
  }

  isAuthentificated() {
    return !!this.token;
  }

  logout() {
    this._token = undefined;
    this._data = undefined;
    window.sessionStorage.removeItem("token");
  }

  get token(): string {
    if (!this._token) {
      this.restoreToken();
    }
    return this._token;
  }

  restoreToken() {
    var token = window.sessionStorage.getItem("token");
    if (token) {
      this.token = token;
    }
  }

  get data(): Observable<any> {
    return new Observable(observe => {
      if (this._data) {
        observe.next(this._data);
      } else {
        this._waiter.push(observe);
      }
    });
  }

  set token(token: string) {
    if (token) {
      const helper = new JwtHelperService();
      const isExpired = helper.isTokenExpired(token);
      if (!isExpired) {
        const decodedToken = helper.decodeToken(token);
        if (decodedToken) {
          this._token = token;
          this._data = decodedToken;
          this._waiter.forEach(waiter => {
            waiter.next(this._data);
          });
          this._waiter.length = 0;
          window.sessionStorage.setItem("token", token);
        }
      }
    }
  }
}
