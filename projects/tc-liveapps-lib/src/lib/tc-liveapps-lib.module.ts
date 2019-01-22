import { NgModule } from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {
  MatButtonModule,
  MatCardModule, MatCheckboxModule, MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule, MatMenuModule, MatOptionModule,
  MatSelectModule, MatTooltipModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ColorPickerModule} from 'ngx-color-picker';
import {CachingInterceptor} from './interceptors/caching-interceptor';
import {RequestCacheService} from './services/request-cache.service';
import {TibcoCloudNavbarComponent} from './components/tibco-cloud-navbar/tibco-cloud-navbar.component';
import {TibcoCloudLoginComponent} from './components/tibco-cloud-login/tibco-cloud-login.component';
import {
  TibcoCloudMultipleSubscriptionComponent
} from './components/tibco-cloud-multiple-subscription/tibco-cloud-multiple-subscription.component';
import {LiveAppsCaseSearchComponent} from './components/live-apps-case-search/live-apps-case-search.component';
import {LiveAppsCaseListComponent} from './components/live-apps-case-list/live-apps-case-list.component';
import {LiveAppsCaseSummaryComponent} from './components/live-apps-case-summary/live-apps-case-summary.component';
import {LiveAppsStateIconComponent} from './components/live-apps-state-icon/live-apps-state-icon.component';
import {LiveAppsSandboxComponent} from './components/live-apps-sandbox/live-apps-sandbox.component';
import {LiveAppsApplicationsComponent} from './components/live-apps-applications/live-apps-applications.component';
import {LiveAppsNotesComponent} from './components/live-apps-notes/live-apps-notes.component';
import {
  LiveAppsDocumentsComponent,
  LiveAppsDocumentUploadDialogComponent
} from './components/live-apps-documents/live-apps-documents.component';
import {LiveAppsCaseStateConfigComponent} from './components/live-apps-case-state-config/live-apps-case-state-config.component';
import {ReversePipe} from './pipes/reverse.pipe';
import {LiveAppsCaseStatesComponent} from './components/live-apps-case-states/live-apps-case-states.component';
import {
  LiveAppsApplicationConfigurationComponent,
  LiveAppsStateIconUploadDialogComponent
} from './components/live-apps-application-configuration/live-apps-application-configuration.component';
import {DurationSincePipe} from './pipes/duration-since.pipe';
import {HighlightPipe} from './pipes/highlight.pipe';
import {OrderByDatePipe} from './pipes/order-by-date.pipe';
import {LiveAppsCaseSchemaListComponent} from './components/live-apps-case-schema-list/live-apps-case-schema-list.component';
import {LiveAppsFavoriteCasesComponent} from './components/live-apps-favorite-cases/live-apps-favorite-cases.component';
import {LiveAppsCaseAuditComponent} from './components/live-apps-case-audit/live-apps-case-audit.component';
import {LiveAppsCaseDataComponent} from './components/live-apps-case-data/live-apps-case-data.component';
import {LiveAppsCaseActionsComponent} from './components/live-apps-case-actions/live-apps-case-actions.component';
import {LiveAppsRecentCasesComponent} from './components/live-apps-recent-cases/live-apps-recent-cases.component';
import {LiveAppsCaseStateAuditComponent} from './components/live-apps-case-state-audit/live-apps-case-state-audit.component';
import {LiveAppsNotesEditorComponent} from './components/live-apps-notes-editor/live-apps-notes-editor.component';
import {EllipsisPipe} from './pipes/ellipsis.pipe';
import {LiveAppsService} from './services/live-apps.service';
import { LiveAppsLoginComponent } from './components/live-apps-login/live-apps-login.component';
import { LiveAppsSearchWidgetComponent } from './components/live-apps-search-widget/live-apps-search-widget.component';
import { LiveAppsComponentComponent } from './components/live-apps-component/live-apps-component.component';
import {SpotfireWrapperComponent} from './components/spotfire-wrapper/spotfire-wrapper.component';


@NgModule({
  declarations: [
    LiveAppsLoginComponent,
    TibcoCloudLoginComponent,
    TibcoCloudNavbarComponent,
    TibcoCloudMultipleSubscriptionComponent,
    LiveAppsSandboxComponent,
    LiveAppsApplicationsComponent,
    LiveAppsCaseSchemaListComponent,
    LiveAppsCaseDataComponent,
    LiveAppsCaseStatesComponent,
    LiveAppsCaseActionsComponent,
    LiveAppsCaseAuditComponent,
    LiveAppsCaseStateAuditComponent,
    LiveAppsRecentCasesComponent,
    LiveAppsFavoriteCasesComponent,
    LiveAppsDocumentsComponent,
    LiveAppsNotesComponent,
    DurationSincePipe,
    ReversePipe,
    LiveAppsNotesEditorComponent,
    LiveAppsDocumentUploadDialogComponent,
    OrderByDatePipe,
    LiveAppsCaseSummaryComponent,
    EllipsisPipe,
    LiveAppsStateIconComponent,
    LiveAppsCaseStateConfigComponent,
    LiveAppsApplicationConfigurationComponent,
    LiveAppsStateIconUploadDialogComponent,
    LiveAppsCaseListComponent,
    HighlightPipe,
    LiveAppsCaseSearchComponent,
    LiveAppsSearchWidgetComponent,
    LiveAppsComponentComponent,
    SpotfireWrapperComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    MatTooltipModule,
    FormsModule,
    FlexLayoutModule,
    ColorPickerModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    LiveAppsLoginComponent,
    TibcoCloudLoginComponent,
    TibcoCloudNavbarComponent,
    TibcoCloudMultipleSubscriptionComponent,
    LiveAppsSandboxComponent,
    LiveAppsApplicationsComponent,
    LiveAppsCaseSchemaListComponent,
    LiveAppsCaseDataComponent,
    LiveAppsCaseStatesComponent,
    LiveAppsCaseActionsComponent,
    LiveAppsCaseAuditComponent,
    LiveAppsCaseStateAuditComponent,
    LiveAppsRecentCasesComponent,
    LiveAppsFavoriteCasesComponent,
    LiveAppsDocumentsComponent,
    LiveAppsNotesComponent,
    DurationSincePipe,
    ReversePipe,
    LiveAppsNotesEditorComponent,
    LiveAppsDocumentUploadDialogComponent,
    OrderByDatePipe,
    LiveAppsCaseSummaryComponent,
    EllipsisPipe,
    LiveAppsStateIconComponent,
    LiveAppsCaseStateConfigComponent,
    LiveAppsApplicationConfigurationComponent,
    LiveAppsStateIconUploadDialogComponent,
    LiveAppsCaseListComponent,
    HighlightPipe,
    LiveAppsCaseSearchComponent,
    LiveAppsSearchWidgetComponent,
    LiveAppsComponentComponent,
    SpotfireWrapperComponent
  ],
  providers: [
    RequestCacheService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true }
  ]
})
export class TcLiveappsLibModule { }