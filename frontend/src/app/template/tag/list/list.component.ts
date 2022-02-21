import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActionsService } from "../../../actions.service";
import { ApiService } from "../../../api.service";
import { Subscription } from "rxjs";
import { MatSnackBar } from "../../../../../node_modules/@angular/material";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.css"]
})
export class ListTagTemplateComponent implements OnInit {
  public tags: Array<object> = [];
  public loading: boolean;
  
  private actionSubscription: Subscription;
  private lastId: String;

  constructor(private router: Router, private actions: ActionsService, private api: ApiService, public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loading = true;
    let self = this;
    this.actionSubscription = this.actions.events.subscribe(action => {
      if (action == "add") {
        self.add();
      } else if (action == "close_details") {
        self.lastId = null;
      } else if (action == "saved" || action == "deleted") {
        self.getTags();
      } else if (action.startsWith("show")) {
        this.lastId = action.split("#")[1];
      }
    });
    this.getTags();
  }

  loadError(msg) {
    console.error("Error while loading tag templates", msg);
    this.snackBar.open("Can not load tag templates", "Saved", {
      duration: 2000
    });
  }

  isSelected(id: String) {
    return this.lastId == id;
  }

  getTags() {
    this.api.getTagTemplates().subscribe((data: Array<object>) => {
      this.tags = data;
      this.tags.sort((a: any, b: any) => {
        return (a.alias ? a.alias : a.name).toLowerCase() < (b.alias ? b.alias : b.name).toLowerCase() ? -1 : 1;
      });
      this.loading = false;
    }, (err) => this.loadError(err));
  }

  add() {
    this.actions.events.emit("open_details");
    this.router.navigate([{ outlets: { primary: ["template-tag-list"], details: ["template-tag-add"] } }]);
  }

  details(id: String) {
    if (this.lastId == id) {
      this.lastId = null;
      this.actions.events.emit("close_details");
    } else {
      this.actions.events.emit("open_details");
      this.router.navigate([{ outlets: { primary: ["template-tag-list"], details: ["template-tag-edit", id] } }]);
      this.lastId = id;
    }
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
}
