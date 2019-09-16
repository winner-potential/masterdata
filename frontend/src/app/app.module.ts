import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import {SortablejsModule} from "angular-sortablejs";

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
  MatTreeModule,
} from '@angular/material';
import { HttpClientModule, HTTP_INTERCEPTORS } from  '@angular/common/http';

import { RouterModule, Routes } from '@angular/router';
import { ListTagTemplateComponent } from './template/tag/list/list.component';
import { DetailTagTemplateComponent } from './template/tag/detail/detail.component';
import { ListMetricTemplateComponent } from './template/metric/list/list.component';
import { DetailMetricTemplateComponent } from './template/metric/detail/detail.component';
import { ListDocumentTemplateComponent } from './template/document/list/list.component';
import { DetailDocumentTemplateComponent } from './template/document/detail/detail.component';
import { ListDocumentComponent } from './documents/list/list.component';
import { DetailDocumentComponent, DetailDocumentMetricDialogComponent } from './documents/detail/detail.component';
import { AttributeTypeValidatorDirective } from './template/document/directive/attribute-type-validation-check'
import { GuardService } from './guard.service';
import { TokenInterceptor } from './token.interceptor';
import { LogoutComponent } from './logout/logout.component';
import { FileInputComponent } from './file-input/file-input.component';
import { AttributeComponent } from './template/document/detail/attribute/attribute.component';
import { MetricComponent } from './documents/detail/metric/metric.component';
import { TagComponent } from './documents/detail/tag/tag.component';
import { DocumentAttributeComponent } from './documents/detail/attribute/attribute.component';
import { MetricRelationComponent } from './documents/detail/metric-relation/metric-relation.component';
import { SessionExpiredComponent } from './session/session-expired/session-expired.component';
import { AttributeValidatorDirective } from './documents/detail/attribute/validator.directive';
import { DocumentInputComponent } from './document-input/document-input.component';
import { SelectionValidatorDirective } from './document-input/selection-validator.directive';
import { DocumentTreeComponent } from './documents/document-tree/document-tree.component';
import { DocumentTemplateTreeComponent } from './template/document/document-template-tree/document-template-tree.component';
import { ReallyDeleteComponent } from './really-delete/really-delete.component';

const appRoutes: Routes = [
  { 
    path: 'document-list', 
    component: ListDocumentComponent, 
    canActivate: [GuardService], 
    data: {title: 'Documents', actions: [], fab: 'add'}
  }, { 
    path: 'document-edit/:id', 
    component: DetailDocumentComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'document-add', 
    component: DetailDocumentComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-tag-list', 
    component: ListTagTemplateComponent, 
    canActivate: [GuardService], 
    data: {title: 'Tag Templates', actions: [], fab: 'add'}
  }, { 
    path: 'template-tag-edit/:id', 
    component: DetailTagTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-tag-add', 
    component: DetailTagTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-metric-list', 
    component: ListMetricTemplateComponent, 
    canActivate: [GuardService], 
    data: {title: 'Metric Templates', actions: [], fab: 'add'}
  }, { 
    path: 'template-metric-edit/:id', 
    component: DetailMetricTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-metric-add', 
    component: DetailMetricTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-document-list', 
    component: ListDocumentTemplateComponent, 
    canActivate: [GuardService], 
    data: {title: 'Document Templates', actions: [], fab: 'add'}
  }, { 
    path: 'template-document-edit/:id', 
    component: DetailDocumentTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'template-document-add', 
    component: DetailDocumentTemplateComponent,
    canActivate: [GuardService], 
    outlet: 'details'
  }, { 
    path: 'logout', 
    component: LogoutComponent
  },
  { path: '**', redirectTo: 'document-list' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    ListTagTemplateComponent,
    DetailTagTemplateComponent,
    ListMetricTemplateComponent,
    DetailMetricTemplateComponent,
    ListDocumentTemplateComponent,
    DetailDocumentTemplateComponent,
    ListDocumentComponent,
    DetailDocumentComponent,
    LogoutComponent,
    FileInputComponent,
    AttributeComponent,
    DocumentAttributeComponent,
    AttributeTypeValidatorDirective,
    MetricComponent,
    TagComponent,
    DetailDocumentMetricDialogComponent,
    MetricRelationComponent,
    SessionExpiredComponent,
    AttributeValidatorDirective,
    DocumentInputComponent,
    SelectionValidatorDirective,
    DocumentTreeComponent,
    DocumentTemplateTreeComponent,
    ReallyDeleteComponent
  ],
  entryComponents: [DetailDocumentMetricDialogComponent, SessionExpiredComponent, ReallyDeleteComponent],
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
    MatStepperModule,
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
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
