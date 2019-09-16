import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavigationComponent } from "./navigation/navigation.component";
import { LayoutModule } from "@angular/cdk/layout";

import { RouterModule, Routes } from "@angular/router";

import { PlotlyModule } from 'angular-plotly.js';

import {
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
  MatTreeModule
} from "@angular/material";
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
