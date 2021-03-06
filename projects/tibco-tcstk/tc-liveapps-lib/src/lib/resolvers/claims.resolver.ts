import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import {LiveAppsService} from '../services/live-apps.service';
import {Claim} from '@tibco-tcstk/tc-core-lib';
import {map, mergeMap} from 'rxjs/operators';

@Injectable()
export class ClaimsResolver implements Resolve<Observable<Claim>> {

  constructor(public liveapps: LiveAppsService) {}

  resolve(): Observable<Claim> {

    // note claims will be cached at http level
    // logout required to update them anyway

    const claims = this.liveapps.getClaims()
      .pipe(
        map(claim => {
          claim.sandboxes.forEach(sandbox => {
            if (sandbox.type === 'Production') {
              claim.primaryProductionSandbox = sandbox;
            }
          });
          return claim;
        })
      );

    return claims;
  }

}
