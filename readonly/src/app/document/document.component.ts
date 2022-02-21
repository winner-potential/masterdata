import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionsService } from "../actions.service";
import { BehaviorSubject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

export class DocumentAttributeGroup {
  constructor(public attributes: Array<any>, public name: string) {}
}

@Component({
  selector: "app-document",
  templateUrl: "./document.component.html",
  styleUrls: ["./document.component.css"]
})
export class DocumentComponent implements OnInit {
  public name: String;
  public description: String;
  public groups: Array<DocumentAttributeGroup> = [];
  public metrics: Array<object> = [];
  public images: Array<String> = [];
  public id: String;
  public document: BehaviorSubject<any>;
  public pointer: number = 0;

  public loading: boolean;

  private templates: Map<String, object> = new Map<String, object>();

  constructor(private active: ActivatedRoute, private api: ApiService, private actions: ActionsService, public snackBar: MatSnackBar, private router: Router) {}

  ngOnInit() {
    this.document = new BehaviorSubject<any>(undefined);
    this.active.params.subscribe(value => {
      this.loading = true;
      this.metrics.length = 0;
      this.groups.length = 0;
      this.images.length = 0;
      this.id = value.id;
      window.setTimeout(() => this.actions.events.emit("show#" + value.id), 0);
      this.api.getDocumentTemplates().subscribe(
        (temps: Array<object>) => {
          temps.forEach((t: any) => {
            this.templates.set(t._id, t);
          });
          this.api.getDocument(this.id).subscribe(
            (document: any) => {
              this.load(document);
              this.loading = false;
            },
            err => this.loadError(err)
          );
        },
        err => this.loadError(err)
      );
    });
  }

  handleMetricClick(node) {
    console.log(node);
    this.router.navigate([{ outlets: { primary: ["add-to-plotter", node.type, node._id], details: null } }]);
  }

  loadError(msg) {
    console.error("Error while loading document", msg);
    this.snackBar.open("Can not load document", "Error", {
      duration: 2000
    });
  }

  handleImageClicked() {
    this.pointer++;
  }

  getDocument(id) {
    return this.api.getDocument(id);
  }

  goTo(id) {
    console.log(id);
    this.router.navigate([{ outlets: { details: ["document-show", id] } }]);
  }

  load(document: any) {
    this.images = [];
    this.pointer = 0;
    this.name = document.name;
    this.description = document.description;
    //this.attributes = document.attributes;
    this.document.next(document);

    var values: Map<String, String> = new Map<String, String>();
    document.attributes.forEach(attr => values.set(attr.name, attr.value));

    var groups: Map<String, DocumentAttributeGroup> = new Map<String, DocumentAttributeGroup>();
    var def: DocumentAttributeGroup = new DocumentAttributeGroup([], undefined);
    this.groups.push(def);
    var handled: Set<String> = new Set<String>();
    var current: any = this.templates.get(document.template);
    var sep: string = undefined;
    while (current) {
      (current.attributes || []).forEach(attr => {
        if (!handled.has(attr.name)) {
          var group = sep ? groups.get(sep) : def;
          handled.add(attr.name);
          if (attr.type.toLowerCase() != "separator" && attr.type.toLowerCase() != "image") {
            if(values.has(attr.name)) {
              group.attributes.push({
                name: attr.name,
                type: attr.type.toLowerCase(),
                value: values.get(attr.name)
              });
            }
          }
          if (attr.type.toLowerCase() == "separator") {
            groups.set(attr.name, new DocumentAttributeGroup([], attr.name));
            this.groups.push(groups.get(attr.name));
          }
          if (attr.type.toLowerCase() == "image") {
            this.images.push(this.api.getImagePath(document._id, attr.name));
          }
        }
        if (attr.type.toLowerCase() == "separator") {
          sep = attr.name;
        }
      });
      current = this.templates.get(current.extends);
    }
  }
}
