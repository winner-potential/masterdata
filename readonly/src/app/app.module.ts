import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavigationComponent } from "./navigation/navigation.component";
import { LayoutModule } from "@angular/cdk/layout";

import { RouterModule, Routes } from "@angular/router";

import { PlotlyModule } from 'angular-plotly.js';

import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatNativeDateModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTreeModule } from "@angular/material/tree";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DocumentsComponent } from "./documents/documents.component";
import { ApiService } from "./api.service";
import { DocumentComponent } from "./document/document.component";
import { Observable } from "rxjs";
import { CacheInterceptor } from "./cache.interceptor";
import { TokenInterceptor } from "./token.interceptor";
import { GuardService } from './guard.service';
import { LogoutComponent } from './logout/logout.component';
import { TreeComponent } from './metric/tree/tree.component';
import { SessionExpiredComponent } from './session/session-expired/session-expired.component';
import { TemplatesComponent } from './templates/templates.component';
import { PlotterComponent } from './plotter/plotter.component';

var searchDocument = function(api: ApiService, search: string, params: any) {
  return new Observable(observer => {
    var type = params.type;
    api.getDocumentTemplates().subscribe((templates: Array<object>) => {
      var temps = {};
      templates.forEach((t: any) => (temps[t._id] = t));
      api.findDocuments(search).subscribe((data: Array<object>) => {
        var res: Array<object> = [];
        data.forEach((d: any) => {
          if (temps[d.template].public) {
            if (!type || d.template == type) {
              res.push(d);
            }
          }
        });
        observer.next(res);
      }, observer.error);
    });
  });
};

var documentSearch = {
  list: ["document-list"],
  details: ["document-show"],
  find: searchDocument
};

var filteredDocumentSearch = {
  list: ["document-list-filtered", ":type"],
  details: ["document-show"],
  find: searchDocument
};

const appRoutes: Routes = [
  {
    path: "add-to-plotter/:type/:id",
    component: PlotterComponent,
    canActivate: [GuardService], 
    data: {
      title: "Plotter"
    }
  },
  {
    path: "plotter",
    component: PlotterComponent,
    canActivate: [GuardService], 
    data: {
      title: "Plotter"
    }
  },
  {
    path: "document-list",
    component: DocumentsComponent,
    canActivate: [GuardService], 
    data: {
      title: "Documents",
      search: documentSearch
    }
  },
  {
    path: "logout",
    component: LogoutComponent
  },
  {
    path: "document-show/:id",
    component: DocumentComponent,
    canActivate: [GuardService], 
    outlet: "details"
  },
  {
    path: "document-list/:search",
    component: DocumentsComponent,
    canActivate: [GuardService], 
    data: {
      title: "Documents",
      search: documentSearch
    }
  },
  {
    path: "document-list-filtered/:type/:search",
    component: DocumentsComponent,
    canActivate: [GuardService], 
    data: {
      title: "Documents",
      actions: [],
      search: filteredDocumentSearch
    }
  },
  {
    path: "document-list-filtered/:type",
    component: DocumentsComponent,
    canActivate: [GuardService], 
    data: {
      title: "Documents",
      actions: [],
      search: filteredDocumentSearch
    }
  },
  {
    path: "templates",
    component: TemplatesComponent,
    canActivate: [GuardService], 
    data: {
      title: "Documents",
      actions: []
    }
  },
  { path: '**', redirectTo: 'templates' }
];

@NgModule({
  declarations: [AppComponent, NavigationComponent, DocumentsComponent, DocumentComponent, LogoutComponent, TreeComponent, SessionExpiredComponent, TemplatesComponent, PlotterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    FormsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    HttpClientModule,
    PlotlyModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  entryComponents: [SessionExpiredComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
