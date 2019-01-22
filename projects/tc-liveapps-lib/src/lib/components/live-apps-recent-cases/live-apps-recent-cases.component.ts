import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LiveAppsService} from '../../services/live-apps.service';
import {Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import {CaseList} from '../../models/liveappsdata';

@Component({
  selector: 'tcla-live-apps-recent-cases',
  templateUrl: './live-apps-recent-cases.component.html',
  styleUrls: ['./live-apps-recent-cases.component.css']
})
export class LiveAppsRecentCasesComponent implements OnInit, OnDestroy {
  @Input() sandboxId: number;
  @Input() uiAppId: string;
  @Output() clickCase = new EventEmitter;

  // use the _destroyed$/takeUntil pattern to avoid memory leaks if a response was never received
  private _destroyed$ = new Subject();

  public recentCases: string[];
  public errorMessage: string;

  public clickCaseAction = (caseReference) => {
    this.clickCase.emit(caseReference);
  }

  public refresh = () => {
    this.recentCases = [];
    this.liveapps.getRecentCases(this.uiAppId, this.sandboxId)
      .pipe(
        take(1),
        takeUntil(this._destroyed$),
        map(recentCases => {
          this.recentCases = recentCases.caseRefs || [];
        })
      ).subscribe(
      null, error => { this.errorMessage = 'Error retrieving recent cases: ' + error.error.errorMsg; });
  }

  public clearRecentCases = () => {
    // -1 will clear recent cases
    this.liveapps.setRecentCase('-1', this.uiAppId, this.sandboxId);
    this.recentCases = [];
  }

  constructor(private liveapps: LiveAppsService) { }

  ngOnInit() {
    this.refresh();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

}