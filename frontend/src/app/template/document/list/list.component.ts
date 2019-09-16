import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ActionsService } from "../../../actions.service";
import { ApiService } from "../../../api.service";
import { Subscription } from "rxjs";
import { MatSnackBar } from '../../../../../node_modules/@angular/material';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListDocumentTemplateComponent implements OnInit {

  public documents: Array<object> = [];
  public loading: boolean;
  
  private actionSubscription: Subscription;
  private lastId: String;

  constructor(private router: Router, private actions: ActionsService, private api: ApiService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loading = true;
    var self = this;
    this.actionSubscription = this.actions.events.subscribe(action => {
      if (action == "add") {
        self.add();
      } else if (action == "close_details") {
        self.lastId = null;
      } else if (action == "saved" || action == "deleted") {
        self.getDocuments();
      } else if (action.startsWith("show")) {
        this.lastId = action.split("#")[1];
      }
    });
    this.getDocuments();
  }

  isSelected(id: String) {
    return this.lastId == id;
  }

  getDocuments() {
    this.api.getDocumentTemplates().subscribe((data: Array<object>) => {
      this.documents = data;
      this.documents.sort((a: any, b: any) => {
        return (a.alias ? a.alias : a.name).toLowerCase() < (b.alias ? b.alias : b.name).toLowerCase() ? -1 : 1;
      });
      this.loading = false;
    }, (err) => this.loadError(err));
  }

  loadError(msg) {
    console.error("Error while loading document templates", msg);
    this.snackBar.open("Can not load document templates", "Saved", {
      duration: 2000
    });
  }

  add() {
    this.actions.events.emit("open_details");
    this.router.navigate([{ outlets: { primary: ["template-document-list"], details: ["template-document-add"] } }]);
  }

  details(id: String) {
    if (this.lastId == id) {
      this.lastId = null;
      this.actions.events.emit("close_details");
    } else {
      this.actions.events.emit("open_details");
      this.router.navigate([{ outlets: { primary: ["template-document-list"], details: ["template-document-edit", id] } }]);
      this.lastId = id;
    }
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }

}
