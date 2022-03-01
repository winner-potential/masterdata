import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, Subscriber } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogData, SessionExpiredComponent } from './session/session-expired/session-expired.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
    providedIn: 'root'
})
export class AuthentificationService {
    private _waiter: Array<Subscriber<any>> = [];

    constructor(public dialog: MatDialog, private router: Router, private activated: ActivatedRoute, private login: LoginService) {
        const self = this;
        let dialogIsOpen;
        window.setInterval(() => {
            if (dialogIsOpen) {
                return;
            }
            const token = self.token;
            if (token) {
                const helper = new JwtHelperService();
                const isExpired = helper.isTokenExpired(token);
                if (isExpired) {
                    dialogIsOpen = true;
                    const dialogRef = this.dialog.open(SessionExpiredComponent, {
                        width: '350px',
                        data: new DialogData()
                    });

                    dialogRef.afterClosed().subscribe(() => {
                        dialogIsOpen = false;
                        activated.url.subscribe(url => this.login.goTo(url));
                    });
                }
            }
        }, 1000);
    }

    private _token: string;

    get token(): string {
        if (!this._token) {
            this.restoreToken();
        }
        return this._token;
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
                    window.sessionStorage.setItem('token', token);
                }
            }
        }
    }

    private _data: any;

    get data(): Observable<any> {
        return new Observable(observe => {
            if (this._data) {
                observe.next(this._data);
            } else {
                this._waiter.push(observe);
            }
        });
    }

    isAuthentificated() {
        return !!this.token && this._data && this._data.admin;
    }

    logout() {
        this._token = undefined;
        this._data = undefined;
        window.sessionStorage.removeItem('token');
    }

    restoreToken() {
        const token = window.sessionStorage.getItem('token');
        if (token) {
            this.token = token;
        }
    }
}
