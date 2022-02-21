import { Component, Inject } from "@angular/core";
import { ApiService } from "./api.service";
import { ActivatedRoute } from "@angular/router";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";

  constructor(private api: ApiService, private activatedRoute: ActivatedRoute, @Inject(DOCUMENT) document: any) {

  }
}
