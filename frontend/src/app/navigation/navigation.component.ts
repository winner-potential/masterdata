import { Component, ViewChild } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Router, NavigationStart, NavigationEnd, ActivationStart } from "@angular/router";
import { ActionsService } from "../actions.service";
import { AuthentificationService } from "../authentification.service";

const mapping = {
  add: "add",
  cancel: "cancel",
  submit: "check"
};

@Component({
  selector: "masterdata-navigation",
  templateUrl: "./navigation.component.html",
  styleUrls: ["./navigation.component.css"]
})
export class NavigationComponent {
  public title: String;
  public fab: Object;
  public details: boolean;

  private path: string;
  private hasDetails: boolean;

  @ViewChild("detailsDrawer", { static: true }) detailsDrawer;

  isNavigation$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge]).pipe(map(result => result.matches));
  isDetails$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Medium,Breakpoints.Large, Breakpoints.XLarge]).pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private actionsService: ActionsService, private auth: AuthentificationService) {}

  ngOnInit() {
    let firstRun = true;
    let self = this;
    this.actionsService.events.subscribe(action => {
      if (action == "open_details") {
        this.detailsDrawer.open();
        this.details = true;
      }
      if (action == "close_details") {
        this.detailsDrawer.close();
        this.details = false;
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.hasDetails = false;
        if (this.details) {
          this.detailsDrawer.open();
        } else {
          this.detailsDrawer.close();
        }
      } else if (event instanceof ActivationStart) {
        if (event.snapshot.outlet == "primary") {
          this.title = event.snapshot.data.title;
          this.path = event.snapshot.routeConfig.path;
          this.fab = null;
          if (event.snapshot.data.fab) {
            this.fab = {
              type: mapping[event.snapshot.data.fab] || event.snapshot.data.fab,
              callback: function() {
                self.actionsService.events.emit(event.snapshot.data.fab);
              }
            };
          }
        } else if (event.snapshot.outlet == "details") {
          this.hasDetails = true;
          if (firstRun) {
            this.actionsService.events.emit("open_details");
          }
        }
      } else if (event instanceof NavigationEnd) {
        if(!this.hasDetails) {
          this.actionsService.events.emit("close_details");
        }
        firstRun = false;
      }
    });
  }

  viewerLink(): string {
    return (window as any).readonly ? (window as any).readonly + "?token=" + this.auth.token : undefined;
  }

  isSelected(path:string) {
    return this.path == path;
  }

  closeDetails() {
    this.actionsService.events.emit("close_details");
  }
}
