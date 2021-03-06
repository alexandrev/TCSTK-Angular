import {Deserializable} from '@tibco-tcstk/tc-core-lib';
import {CaseTypeStatesList} from './liveappsdata';
import {AuditEventAttribute, AuditEventList} from './tc-case-audit';

export class StateAuditEvent implements Deserializable {
  caseState: AuditEventAttribute;
  type: AuditEventAttribute;
  phaseLabel: AuditEventAttribute;
  previousPhaseLabel: AuditEventAttribute;
  messageId: AuditEventAttribute;
  principalName: AuditEventAttribute;
  creationTime: AuditEventAttribute;
  isTerminal: boolean;
  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class StateAuditEventList implements Deserializable {
  auditEvents: StateAuditEvent[];
  deserialize(input: any) {
    this.auditEvents = [];
    Object.assign(this.auditEvents, input);
    return this;
  }
}

export class StateTrackerData implements Deserializable {
  possibleStates: CaseTypeStatesList;
  currentState: string;
  phase: string;
  caseAudit: StateAuditEvent[];
  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class TrackerState implements Deserializable {
  name: string;
  label: string;
  phase: string;
  previousPhase: string;
  isTerminal: boolean;
  status: string;
  user: string;
  changed: string;
  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}

export class StateTracker implements Deserializable {
  states: TrackerState[];
  valid: boolean;
  deserialize(input: any) {
    this.states = [];
    Object.assign(this.states, input);
    return this;
  }
}
