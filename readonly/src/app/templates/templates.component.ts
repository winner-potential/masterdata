import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { ApiService } from "../api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-templates",
  templateUrl: "./templates.component.html",
  styleUrls: ["./templates.component.css"]
})
export class TemplatesComponent implements OnInit {
  /**
   * The number of colums in the md-grid-list directive.
   */
  public cols: Observable<number>;
  public templates: Array<object> = [];
  public counts: Map<string, number> = new Map<string, number>();
  public loading: boolean;

  constructor(private api: ApiService, private breakpointObserver: BreakpointObserver, private router: Router) {}

  ngOnInit() {
    const grid = new Map([[Breakpoints.XSmall, 1], [Breakpoints.Small, 2], [Breakpoints.Medium, 2], [Breakpoints.Large, 3], [Breakpoints.XLarge, 3]]);
    this.loading = true;
    this.cols = new Observable(observer => {
      let start: number;
      grid.forEach((cols, mqAlias) => {
        if (this.breakpointObserver.isMatched(mqAlias)) {
          start = cols;
        }
        this.breakpointObserver.observe(mqAlias).subscribe(res => {
          if (res.matches) observer.next(grid.get(mqAlias));
        });
        observer.next(start);
      });
    });

    this.templates.length = 0;
    this.api.getDocuments().subscribe((docs: Array<object>) => {
      docs.forEach((doc:any) => {
        this.counts.set(doc.template, (this.counts.get(doc.template) || 0) + 1);
      })
      this.api.getDocumentTemplates().subscribe((temps: Array<object>) => {
        temps.forEach((element: any) => {
          if (element.public) this.templates.push(element);
        });
        this.loading = false;
      });
    });
  }

  goto(id: string) {
    this.router.navigate([{ outlets: { primary: ["document-list-filtered", id], details: null } }]);
  }
}
