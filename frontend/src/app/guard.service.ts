import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { AuthentificationService } from "./authentification.service";
import { LoginService } from "./login.service";

@Injectable({
  providedIn: "root"
})
export class GuardService implements CanActivate {
  constructor(private auth: AuthentificationService, private login: LoginService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    if (route.queryParams.token) {
      this.auth.token = route.queryParams.token;
    }
    if (!this.auth.isAuthentificated()) {
      this.login.goTo(route.url);
      return false;
    }
    return true;
  }
}
