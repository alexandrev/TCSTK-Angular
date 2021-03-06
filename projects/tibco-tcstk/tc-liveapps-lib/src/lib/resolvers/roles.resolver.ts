import { Injectable } from '@angular/core';
import {Resolve, Router} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {LiveAppsService} from '../services/live-apps.service';
import {Claim, GeneralConfigResolver, RoleAttribute, TcGeneralConfigService, TcSharedStateService} from '@tibco-tcstk/tc-core-lib';
import {flatMap, map, mergeMap, switchMap} from 'rxjs/operators';
import {Group, Groups, Roles} from '../models/tc-groups-data';
import {HttpClient} from '@angular/common/http';
import {TcCaseCardConfigService} from '../services/tc-case-card-config.service';
import {Location} from '@angular/common';
import {ClaimsResolver} from './claims.resolver';
import {group} from '@angular/animations';

@Injectable()
export class RolesResolver implements Resolve<Observable<Roles>> {

  constructor(private sharedStateService: TcSharedStateService, private generalConfigService: TcGeneralConfigService, private http: HttpClient, private liveapps: LiveAppsService, private location: Location, private router: Router) {
  }

  resolve(): Observable<Roles> {

    // we will need the general config to understand the roles definition
    const generalConfigResolver = new GeneralConfigResolver(this.sharedStateService, this.generalConfigService, this.http, this.location, this.router);

    // aim is to return an object that only contains roles where the user is a member of the matching group

    const claimResolver$ = new ClaimsResolver(this.liveapps).resolve().pipe(
      flatMap(claiminfo => {
          const sandboxId = claiminfo.primaryProductionSandbox.id;
          generalConfigResolver.setSandbox(Number(sandboxId));
          const generalConfig$ = generalConfigResolver.resolve();
          const groups$ = this.liveapps.getGroupMemberships(+claiminfo.primaryProductionSandbox.id, claiminfo.id, 1000, true);
          return forkJoin(generalConfig$, groups$).pipe(
            map(([configData, groupData]) => {
              return this.createRoles(groupData.groups, configData.roles);
            }));
        }
      )
    );

    return claimResolver$;
  }

  private createRoles = (groups: Group[], roles: RoleAttribute[]): Roles => {
    const calcRoles: RoleAttribute[] = [];
    roles.forEach(role => {
      const targetGroup = groups.find(grp => {
        return (grp.name === role.group);
      }
      )
      if (targetGroup) {
        calcRoles.push(role);
      }
    })
    return new Roles().deserialize(new Roles().deserialize( { roles: calcRoles } ));
  }
}
