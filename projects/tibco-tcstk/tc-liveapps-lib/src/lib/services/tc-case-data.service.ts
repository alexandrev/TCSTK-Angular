import { Injectable } from '@angular/core';
import {forkJoin, Observable, of, zip} from 'rxjs';
import {CaseInfo, CaseType, JsonSchema} from '../models/liveappsdata';
import {LiveAppsService} from './live-apps.service';
import {HttpClient} from '@angular/common/http';
import {CaseInfoWithSchema, PurgeResult} from '../models/tc-case-data';
import {map, mergeMap, tap} from 'rxjs/operators';
import {TcCaseCardConfigService} from './tc-case-card-config.service';
import {LaProcessSelection} from '../models/tc-case-processes';
import {TC_API_KEY, TC_BASE_URL} from '@tibco-tcstk/tc-core-lib';

@Injectable({
  providedIn: 'root'
})
export class TcCaseDataService {

  constructor(private http: HttpClient, private liveAppsService: LiveAppsService, private caseCardConfigService: TcCaseCardConfigService) { }

  public getMainCaseTypeFromSchema(typeId: string, process: LaProcessSelection): CaseType {
    let requestedType: CaseType;
    process.appSchema.casetypes.forEach((cType) => {
      if (cType.id === typeId) {
        requestedType = cType;
      }
    });
    return requestedType;
  }

  public getCaseState(caseRef: string, sandboxId: number): Observable<string> {
    let url = TC_BASE_URL + '/case/v1/cases/' + caseRef + '/' + '?$sandbox=' + sandboxId + '&$select=s';
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    return this.http.get(url, { withCredentials: true })
      .pipe(
        tap( val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map(caseinfo => {
          const caseinf = new CaseInfo().deserialize(caseinfo);
          const state: string = caseinf.summaryObj.state;
          return state;
        })
      );
  }


  public purgeAllCases(applicationId: string, typeId: string, sandboxId: number): Observable<PurgeResult> {
    let url = TC_BASE_URL + '/case/v1/cases/?$sandbox=1930&$filter=applicationId eq 2550 and typeId eq 1 and purgeable eq TRUE';
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    return this.http.delete(url, { withCredentials: true })
      .pipe(
        tap( val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map(result => {
          return new PurgeResult().deserialize(result);
        })
      );
  }




  public getCaseWithSchema(
    caseRef: string, sandboxId: number, appId: string, typeId: string, uiAppId: string): Observable<CaseInfoWithSchema> {
    let url = TC_BASE_URL + '/case/v1/cases/' + caseRef + '/' + '?$sandbox=' + sandboxId + '&$select=uc, m, s';
    if (TC_API_KEY) {
      url = url + '&' + TC_API_KEY;
    }
    // Make the two required API calls

    const caseSchema = this.liveAppsService.getCaseTypeSchema(sandboxId, appId, 100).pipe(
      tap(val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
      map(typesList => {
        // get schema for case type
        let requestedType: CaseType;
        typesList.casetypes.forEach((cType) => {
          if (cType.id === typeId) {
            requestedType = cType;
          }
        });
        return requestedType;
      })
    );

    const caseData = this.http.get(url, { withCredentials: true })
      .pipe(
        tap(val => sessionStorage.setItem('tcsTimestamp', Date.now().toString())),
        map(caseinfo => {
          const caseinf = new CaseInfo().deserialize(caseinfo);
          this.caseCardConfigService.parseCaseInfo(
            caseinf,
            sandboxId,
            caseinf.metadata.applicationId,
            caseinf.metadata.typeId,
            uiAppId
          );
          return caseinf;
        })
      );

    // Combine the results of both calls into a single response
    const test1 = zip(caseSchema, caseData).pipe(
      map(caseInfoArray => {
        return new CaseInfoWithSchema().deserialize({ caseInfo: caseInfoArray[1], caseSchema: caseInfoArray[0].jsonSchema, applicationName: caseInfoArray[0].applicationName, applicationInternalName: caseInfoArray[0].applicationInternalName, name: caseInfoArray[0].name });
      })
    );
    return test1;
  }
}
