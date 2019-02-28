import {Deserializable} from 'tc-core-lib';
import {CaseAttribute, CaseTypesList, Process} from './liveappsdata';

export class LaProcessSelection {
  // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
  constructor(public type: string,
              public appSchema: CaseTypesList,
              public caseIdAttribute: CaseAttribute,
              public process: Process,
              public ref: string,
              public caseReference: string
  ) {
  }
}

