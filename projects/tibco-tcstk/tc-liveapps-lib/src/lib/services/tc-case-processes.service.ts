import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  CaseAction,
  CaseActionsList,
  CaseCreator,
  CaseCreatorsList,
  CaseType,
  CaseTypesList,
  JsonSchema,
  Process
} from '../models/liveappsdata';
import {LaProcessSelection} from '../models/tc-case-processes';
import {LiveAppsService} from './live-apps.service';
import {Observable, throwError} from 'rxjs';
import {flatMap, map, tap} from 'rxjs/operators';
import {TcCaseDataService} from './tc-case-data.service';
import {TC_API_KEY, TC_BASE_URL} from '@tibco-tcstk/tc-core-lib';

@Injectable({
  providedIn: 'root'
})
export class TcCaseProcessesService {

  constructor(private http: HttpClient, private liveAppsService: LiveAppsService, private caseDataService: TcCaseDataService) { }

  //  This service gets the case state then uses that and the caseRef to get the available actions.
  public getCaseActionsForCaseRef(caseRef: string, sandboxId: number, appId: string, typeId: string): Observable<CaseActionsList> {
    const caseState$ = this.caseDataService.getCaseState(caseRef, sandboxId);
    const caseActions$ = caseState$.pipe(
      flatMap(caseState => {
        return this.getCaseActions(caseRef, sandboxId, appId, typeId, caseState);
      })
    );
    return caseActions$;
  }


// todo: Note this is not a public API - update when Public API available
  public getCaseActions(caseRef: string, sandboxId: number, appId: string, typeId: string, caseState: string): Observable<CaseActionsList> {
    // https://eu.liveapps.cloud.tibco.com/pageflow/caseActions?$sandbox=31&
    // $filter=applicationId%20eq%201742%20and%20caseType%20eq%201%20and%20caseState%20eq%20Responded%20and%20caseRef%20eq%20150491
    let url = TC_BASE_URL + '/pageflow/v1/caseActions?$sandbox=' + sandboxId
      + '&$filter=applicationId eq ' + appId
      + ' and caseType eq ' + typeId
      + ' and caseState eq ' + caseState
      + ' and caseRef eq ' + caseRef;
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    return this.http.get(url, { withCredentials: true })
      .pipe(
        tap( val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map(caseactions => {
          const caList = new CaseActionsList().deserialize(caseactions);
          // non public API returns action Id as number, switch to string to match other APIs
          caList.actions.forEach(action => {
            if (typeof action.id === 'number') {
              action.id = String(action.id);
            }
          })
          return caList;
        })
      );
    }

  // todo: Note this is not a public API - update when Public API available
  public getCaseCreators(sandboxId: number, appId: string, typeId: string): Observable<CaseCreatorsList> {
    let url = TC_BASE_URL + '/pageflow/v1/caseCreators?$sandbox=' + sandboxId
      + '&$filter=applicationId eq ' + appId
      + ' and caseType eq ' + typeId
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    return this.http.get(url, { withCredentials: true })
      .pipe(
        tap( val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map(casecreators => {
          const ccList = new CaseCreatorsList().deserialize(casecreators);
          // non public API returns creator Id as number, switch to string to match other APIs
          ccList.creators.forEach(creator => {
            if (typeof creator.id === 'number') {
              creator.id = String(creator.id);
            }
          })
          return ccList;
        })
      );
  }

  public getProcess(sandboxId: number, appId: string, typeId: string, processName: string, processType: string): Observable<Process> {
    let url = TC_BASE_URL + '/case/v1/types?$sandbox=' + sandboxId;
    url = url + '&$filter=applicationId eq ' + appId;
    url = url + '&$select=b,c,ac';
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    return this.http.get(url, { withCredentials: true })
      .pipe(
        tap( val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map((casetypes: CaseType[]) => {
          if (casetypes && casetypes.length > 0) {
            const ctype = casetypes.filter(casetype => {
              return casetype.id === '1';
            });
            if (ctype.length > 0) {
              const matches = ctype[0][processType + 's'].filter((process: Process) => {
                return process.name === processName;
              });
              if (matches && matches.length > 0) {
                // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
                matches[0].formTag = casetypes[0].applicationName + '.' + casetypes[0].applicationInternalName + '.' + processType + '.' + matches[0].name;
                return matches[0];
              }
            } else {
              throwError('Unable to find process schema for processName: ' + processName);
            }
          } else {
            throwError('Unable to find casetype for appId: ' + appId);
          }
        }
      )
      );
  }

  private getCaseIDAttributeName = (caseType: CaseType) => {
    let caseIdAttrib: any;
    caseType.attributes.forEach((attribute) => {
      if (attribute.isIdentifier) {
        caseIdAttrib = attribute;
      }
    });
    return caseIdAttrib;
  }

  // this is a helper function that given a case type 'schema' for the whole application will create an LaProcessSelection object
  // containing both the appSchema and particular details for this action
  // this object is required to submit the process later.
  private createLaProcessSelection = (
    schema: CaseTypesList,
    appId: string,
    typeId: string,
    action: CaseAction,
    creator: CaseCreator,
    caseRef: string): LaProcessSelection => {
      let processSelection: LaProcessSelection;
      schema.casetypes.forEach((casetype) => {
          // the schema will contain definitions for both the 'case' and any defined types in that case.
          // We want the schema for this 'case'.
          if (casetype.applicationId === appId && casetype.id === typeId) {
            // if ( casetype.jsonSchema !== undefined) {
              if (action) {
                const caseActionList = casetype.actions ? casetype.actions : [];
                // now find the selected action
                caseActionList.forEach((actionDef) => {
                  if (action.id === actionDef.id) {
                    if (!actionDef.jsonSchema) {
                      // create blank form schema
                      actionDef.jsonSchema = new JsonSchema();
                      actionDef.jsonSchema.type = 'object';
                      actionDef.jsonSchema.properties = [];
                    }
                    processSelection = new LaProcessSelection(
                      'action', schema, this.getCaseIDAttributeName(casetype), actionDef,
                      // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
                      (casetype.applicationName + '.' + casetype.applicationInternalName + '.' + 'action' + '.' + actionDef.name),
                      caseRef
                    );
                  }
                });
                if (!processSelection) {
                  // no schema for this process
                  const process: Process = new Process().deserialize({ jsonSchema: { $schema: 'NOSCHEMA' }, name: action.name, id: action.id });
                  processSelection = new LaProcessSelection(
                    'action', schema, this.getCaseIDAttributeName(casetype), process,
                    // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
                    (casetype.applicationName + '.' + casetype.applicationInternalName + '.' + 'action' + '.' + action.name),
                    caseRef
                  );
                }
              } else if (creator) {
                const caseCreatorList = casetype.creators ? casetype.creators : [];
                // now find the selected action
                caseCreatorList.forEach((creatorDef) => {
                  if (creator.id === creatorDef.id) {
                    if (!creatorDef.jsonSchema) {
                      // create blank form schema
                      creatorDef.jsonSchema = new JsonSchema();
                      creatorDef.jsonSchema.type = 'object';
                      creatorDef.jsonSchema.properties = [];
                    }
                    processSelection = new LaProcessSelection(
                      'creator', schema, this.getCaseIDAttributeName(casetype), creatorDef,
                      // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
                      (casetype.applicationName + '.' + casetype.applicationInternalName + '.' + 'creator' + '.' + creatorDef.name),
                      null
                    );
                  }
                });
                if (!processSelection) {
                  // no schema for this process
                  const process: Process = new Process().deserialize({ jsonSchema: { $schema: 'NOSCHEMA' }, name: creator.name, id: creator.id });
                  processSelection = new LaProcessSelection(
                    'creator', schema, this.getCaseIDAttributeName(casetype), process,
                    // Format of ref is <applicationName>.<applicationInternalName>.<processType>.<processName>
                    (casetype.applicationName + '.' + casetype.applicationInternalName + '.' + 'creator' + '.' + creator.name),
                    null
                  );
                }
              }
            }
          // }
        }
      );
      return processSelection;
  }

    public getProcessDetails(
      caseRef: string,
      appId: string,
      typeId: string,
      sandboxId: number,
      action: CaseAction,
      creator: CaseCreator,
      top: number): Observable<LaProcessSelection> {
        return this.liveAppsService.getCaseTypeSchema(sandboxId, appId, top).pipe(
          map(schema => {
            return this.createLaProcessSelection(schema, appId, typeId, action ? action : null, creator ? creator : null, caseRef);
            }
          )
        );
    }

    public caseDataFormUpdate(
      caseRef: string,
      appId: string,
      typeId: string,
      sandboxId: number,
      updateActionLabel: string,
      data: any
    ): Observable<any> {

    // get the creator details
      const creators$ = this.getCaseActionsForCaseRef(caseRef, sandboxId, appId, typeId);
      return creators$.pipe(
        flatMap((actions: CaseActionsList) => {
          const updateAction = actions.actions.find(act => {
            return act.label === updateActionLabel;
          });
          if (updateAction) {
            return this.liveAppsService.runProcess(sandboxId, appId, updateAction.id, caseRef, data);
          } else {
            console.error('No update action found with label:', updateActionLabel)
            throwError('No update action found with label: ' + updateActionLabel);
          }
        })
      );
    }
}
