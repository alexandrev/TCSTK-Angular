// this resolver wraps claims and appConfig resolvers because we need claims to get and set AppConfig to default values.
// we actually cache the claims call using a HTTP interceptor to avoid making multiple REST calls
// note: claims only changes on logout/login so no point making lots of calls to claims

import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {GeneralConfigResolver, UiAppConfig, GeneralConfig, TcGeneralConfigService} from '@tibco-tcstk/tc-core-lib';
import {flatMap, map, mergeMap} from 'rxjs/operators';
import {TcSharedStateService} from '@tibco-tcstk/tc-core-lib';
import {Claim} from '@tibco-tcstk/tc-core-lib';
import {ClaimsResolver} from './claims.resolver';
import {LiveAppsService} from '../services/live-apps.service';
import {HttpClient} from '@angular/common/http';
import {TcDocumentService} from '../services/tc-document.service';
import {LiveAppsConfig, LiveAppsConfigHolder} from '../models/tc-liveapps-config';
import {LiveAppsConfigResolver} from './liveapps-config.resolver';
import {TcLiveAppsConfigService} from '../services/tc-live-apps-config.service';
import {TcCaseCardConfigService} from '../services/tc-case-card-config.service';
import {Location} from '@angular/common';

@Injectable()
export class LaConfigResolver implements Resolve<Observable<LiveAppsConfigHolder>> {

  constructor(private sharedStateService: TcSharedStateService, private generalConfigService: TcGeneralConfigService, private liveAppsConfigService: TcLiveAppsConfigService, private documentService: TcDocumentService, private http: HttpClient, private liveAppsService: LiveAppsService, private caseCardConfigService: TcCaseCardConfigService, private location: Location, private router: Router) {}

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<LiveAppsConfigHolder> {
    // we will return a holder object that contains both general config and live apps config

    const generalConfigResolver = new GeneralConfigResolver(this.sharedStateService, this.generalConfigService, this.http, this.location, this.router);
    const liveAppsConfigResolver = new LiveAppsConfigResolver(this.sharedStateService, this.liveAppsConfigService, this.caseCardConfigService, this.http, this.location);

    const claimResolver$ = new ClaimsResolver(this.liveAppsService).resolve().pipe(
      flatMap(value => {
          const sandboxId = value.primaryProductionSandbox.id;
          generalConfigResolver.setSandbox(Number(sandboxId));
          liveAppsConfigResolver.setSandbox(Number(sandboxId));

          const generalConfig$ = generalConfigResolver.resolve();
          const liveAppsConfig$ = liveAppsConfigResolver.resolve(routeSnapshot);
          const forkJoinArray = [generalConfig$, liveAppsConfig$];
          return forkJoin(forkJoinArray).pipe(
            map(resultArr => {
              return new LiveAppsConfigHolder().deserialize({ generalConfig: resultArr[0], liveAppsConfig: resultArr[1] });
            }));
        }
        )
    );

    const resolveResp$ = claimResolver$.pipe(
      flatMap(liveAppsConfigHolder => {
        const topOrgFolder$ = this.documentService.initOrgFolder(liveAppsConfigHolder.generalConfig.uiAppId);
        const iconsFolder$ = this.documentService.initOrgFolder(liveAppsConfigHolder.generalConfig.uiAppId + '_Icons');
        const docsFolder$ = this.documentService.initOrgFolder(liveAppsConfigHolder.generalConfig.uiAppId + '_Docs');
        const forkJoinArray = [topOrgFolder$, iconsFolder$, docsFolder$];
        return forkJoin(forkJoinArray).pipe(
          map(
            resultArr => {
              return liveAppsConfigHolder;
            }
          )
        );
      })
    )

    return resolveResp$;
  }

}
