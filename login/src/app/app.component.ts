import { Component } from '@angular/core';
import { ApiService } from "./api.service";
import { ActivatedRoute } from "@angular/router";

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public username: String;
  public password: String;
  public error: String;
  public saving: Boolean;

  private origin: string;

  constructor(private api: ApiService, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.origin = params.origin;
    })
  }

  login() {
    this.saving = true;
    this.error = undefined;
    this.api.login(this.username, this.password).subscribe((res:any) => {
      let origin = new URL(decodeURIComponent(this.origin));
      if(origin.searchParams) {
        origin.searchParams.set('token', res.token);
        window.location.href = origin.toString();
      } else {
        window.location.href = decodeURIComponent(this.origin) + "?token=" + res.token;
      }
    }, error => {
      this.error = "Authentification failed"
      this.saving = false
    })
  }

}
