import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from "../../../api.service";
import { ActionsService } from "../../../actions.service";
import { MatSnackBar, MatDialog } from "@angular/material";
import { ReallyDeleteComponent, ReallyDeleteData } from "src/app/really-delete/really-delete.component";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailMetricTemplateComponent implements OnInit {
  public id: String = "";
  public name: String = "";
  public description: String = "";
  public alias: String = "";
  public isPublic : Boolean = false;
  public unit: String = "";
  public newTag: String = "";
  public tags: Array<object> = [];
  public tagsAvailable: Array<object> = [];

  public saving: boolean;
  public loading: boolean;
  
  private tagsData: Map<string, any> = new Map<string, any>();

  constructor(private active: ActivatedRoute, private api: ApiService, private router: Router, private actions: ActionsService, public snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() {
    this.active.params.subscribe(value => {
      this.clear();
      this.id = value.id;
      this.loading = true;
      window.setTimeout(() => this.actions.events.emit("show#" + value.id), 0)
      this.api.getTagTemplates().subscribe((tags: Array<object>) => {
        tags.forEach((element:any) => {
          this.tagsData.set(element._id, element);
        });
        this.updateAvailableTags();
        if (this.id) {
          this.loadDetails(value.id);
        } else {
          this.loading = false;
        }
      }, (err) => this.loadError(err));
    });
  }

  loadError(msg) {
    console.error("Error while loading metric templates", msg);
    this.snackBar.open("Can not load metric templates", "Error", {
      duration: 2000
    });
  }

  handleNewTag(id:string) {
    this.tags.push(this.tagsData.get(id));
    this.newTag = undefined;
    this.updateAvailableTags();
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.updateAvailableTags();
  }

  updateAvailableTags() {
    this.tagsAvailable.length = 0;
    var available: Map<string, any> = new Map<string, any>();

    // Clone all available tags
    this.tagsData.forEach((element:any, key: string) => {
      available.set(key, element);
    });

    // Drop already selected tags
    this.tags.forEach((element:any) => {
      if(available.has(element._id)) {
        available.delete(element._id);
      }
    });

    // Assign remaining tags to available list
    available.forEach((element:any) => {
      this.tagsAvailable.push(element);
    });
  }

  delete() {
    if(!this.id) {
      return
    }


    const dialogRef = this.dialog.open(ReallyDeleteComponent, {
      width: '350px',
      data: new ReallyDeleteData("Delete Document", "Do you really want to delete the metric template " + this.name + "?")
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result.doIt) {
        return;
      }
      this.api.deleteMetricTemplate(this.id).subscribe(data => {
        this.saving = false;
        this.actions.events.emit("close_details");
        this.actions.events.emit("deleted");
        this.snackBar.open("Metric " + this.name, "Deleted", {
          duration: 2000
        });
        this.clear();
      }, error => {
        console.error("Error while deleting", error);
        this.saving = false;
        this.snackBar.open("Error while deleting " + this.name, "Error", {
          duration: 2000
        });
      });
    });
  }

  save() {
    if(!this.name) {
      return;
    }
    this.saving = true;

    let tags : Array<String> = [];
    this.tags.forEach((element:any) => {
      tags.push(element._id);
    });

    if (this.id) {
      this.api.updateMetricTemplate(this.id, this.name, this.description, this.unit, tags, this.alias, this. isPublic).subscribe(data => {
        this.saving = false;
        this.actions.events.emit("close_details");
        this.actions.events.emit("saved");
        this.snackBar.open("Metric Template " + this.name, "Updated", {
          duration: 2000
        });
        this.router.navigate([{ outlets: { primary: ["template-metric-list"], details: null } }]);
        this.clear();
      }, error => {
        console.error("Error while saving", error)
        this.saving = false;
        this.snackBar.open("Error while saving", "Error", {
          duration: 2000
        });
      });
    } else {
      this.api.addMetricTemplate(this.name, this.description, this.unit, tags, this.alias, this. isPublic).subscribe(data => {
        this.saving = false;
        this.actions.events.emit("close_details");
        this.actions.events.emit("saved");
        this.snackBar.open("Metric Template " + this.name, "Saved", {
          duration: 2000
        });
        this.router.navigate([{ outlets: { primary: ["template-metric-list"], details: null } }]);
        this.clear();
      }, error => {
        console.error("Error while saving", error)
        this.saving = false;
        this.snackBar.open("Error while saving", "Error", {
          duration: 2000
        });
      });
    }
  }

  loadDetails(id: String) {
    this.api.getMetricTemplate(id).subscribe((data: any) => {
      this.name = data.name;
      this.description = data.description;
      this.unit = data.unit;
      this.tags.length = 0;
      this.isPublic = data.public;
      this.alias = data.alias;

      // Get map of available tags
      let used : Map<String,boolean> = new Map<String,boolean>();
      // Add known and unknown tags (keep them, in case of problems)
      // and drop duplicates
      (data.tags || []).forEach((element:any) => {
        if(!used.has(element)) {
          used.set(element, true);
          if(this.tagsData.has(element)) {
            this.tags.push(this.tagsData.get(element));
          } else {
            this.tags.push({
              _id: element,
              name: element
            })
          }
        }
      })
      this.updateAvailableTags();
      this.loading = false;
    }, (err) => this.loadError(err));
  }

  clear() {
    this.id = "";
    this.name = "";
    this.description = "";
    this.alias = "";
    this.unit = "";
    this.isPublic = false;
    this.tags.length = 0;
  }

}
