/**
 * @ngdoc component
 * @name liveAppsApplicationsComponent
 *
 * @description
 * `<tcla-live-apps-applications>` is a component providing the ability to list and select an application.
 *
 * @param {function callback} selection Notify parent that an application has been selected.
 *
 * @usage
 *
 *
 *
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LiveAppsService} from '../../services/live-apps.service';
import {CaseInfo, CaseType, CaseTypesList} from '../../models/liveappsdata';
import {map, take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LiveAppsComponent} from '../live-apps-component/live-apps-component.component';

@Component({
  selector: 'tcla-live-apps-applications',
  templateUrl: './live-apps-applications.component.html',
  styleUrls: ['./live-apps-applications.component.css']
})

export class LiveAppsApplicationsComponent extends LiveAppsComponent implements OnInit {
  @Input() sandboxId: number;
  @Input() appIds: string[];
  @Input() selectFirstApp: boolean;
  @Input() selectedApp: CaseType = this.selectedApp ? this.selectedApp : new CaseType();
  @Output() selection: EventEmitter<CaseType> = new EventEmitter<CaseType>();

  applications: CaseTypesList = new CaseTypesList();
  // selectedApp: CaseType = new CaseType();
  errorMessage: string;

  constructor(protected liveapps: LiveAppsService) {
    super();
  }

  changeAppSelection = (appSelected: CaseType) => {
    this.selectedApp = this.applications.casetypes.find((casetype) => {
      return casetype.applicationId === appSelected.applicationId;
    });
  }

  selectApplication = (selectionEvent) => {
    this.selectedApp = selectionEvent.source.value;
    this.selection.emit(selectionEvent.source.value);
  }

  public refresh = (bypassCache: boolean) => {
    this.liveapps.getApplications(this.sandboxId, this.appIds, 100, bypassCache)
      .pipe(
        take(1),
        takeUntil(this._destroyed$),
        map(applicationList => {
          this.applications = applicationList;
          if (this.selectedApp.applicationId) {
            this.selectedApp = applicationList.casetypes.find((casetype) => {
              return casetype.applicationId === this.selectedApp.applicationId;
            });
            // this.selection.emit(this.selectedApp);
          } else
          // select first as default
            if (applicationList.casetypes.length > 0 && this.selectFirstApp) {
              this.selectedApp = applicationList.casetypes[0];
              this.selection.emit(applicationList.casetypes[0]);
          }
        })
      )
      .subscribe(null, error => { this.errorMessage = 'Error retrieving applications: ' + error.error.errorMsg; });
  }

  ngOnInit(): void {
    this.refresh(false);
  }

}
