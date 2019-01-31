import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LaProcessSelection, ProcessId} from '../../models/liveappsdata';

@Component({
  selector: 'tcla-live-apps-actions',
  templateUrl: './live-apps-actions.component.html',
  styleUrls: ['./live-apps-actions.component.css']
})
export class LiveAppsActionsComponent implements OnInit {
  @Input() caseRef: string;
  @Input() caseState: string;
  @Input() sandboxId: number;
  @Input() applicationId: string;
  @Input() typeId: string;
  @Output() caseActioned: EventEmitter<ProcessId> = new EventEmitter<ProcessId>();

  selectedAction: LaProcessSelection;

  // action clicked
  handleActionCompleted = (result: ProcessId) => {
    this.caseActioned.emit(result);
  }

  handleActionClicked = (action) => {
    this.selectedAction = action;
  }

  constructor() { }

  ngOnInit() {
  }

}
