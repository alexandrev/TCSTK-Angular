import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { TcSpotfireConfigService } from '../services/tc-spotfire-config.service';
import { SpotfireConfig } from '../models/tc-spotfire-config';
import { Location } from '@angular/common';
import { TcSharedStateService, UiAppIdConfig } from '@tibco-tcstk/tc-core-lib';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';

@Injectable()
export class SpotfireConfigResolver implements Resolve<Observable<SpotfireConfig>> {

    DEFAULT_CONFIG_URL = 'assets/config/spotfireAppConfig.json'
    APP_ID_URL = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/config/uiAppId.json');

    private sandboxId: number;
    public defaultSpotfireConfig: SpotfireConfig;
    private uiAppId: string;

    constructor(
        private tcSharedState: TcSharedStateService,
        private spotfireConfigService: TcSpotfireConfigService,
        private http: HttpClient,
        private location: Location
    ) {}

    public setSandbox = (sandboxId: number) => {
        this.sandboxId = sandboxId;
    }

    // can be used to load defaultSpotfireConfig from a JSON config
    private getDefaultSpotfireConfig = () => {
        return this.http.get(TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, this.DEFAULT_CONFIG_URL), { withCredentials: true });
    }

    // loads uiAppId from json file in assets (appId.json)
    private getAppId = (): Observable<UiAppIdConfig> => {
        const headers = new HttpHeaders().set('cacheResponse', 'true');
        return this.http.get(this.APP_ID_URL, { headers: headers, withCredentials: true }).pipe(
        map(uiAppId => {
            const uiAppIdConfig = new UiAppIdConfig().deserialize(uiAppId);
            this.uiAppId = uiAppIdConfig.uiAppId;
            return uiAppIdConfig;
            }
        )
        );
    }

    resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<SpotfireConfig> {
        const spotfireConfig = this.getAppId().pipe(
            switchMap(uiAppId => this.spotfireConfigService.getSpotfireConfig(uiAppId.uiAppId, false, false)
            .pipe(
                mergeMap(
                    spotfireConfig => {
                        if (spotfireConfig === undefined) {
                            return this.getDefaultSpotfireConfig().pipe(
                                flatMap(config => {
                                this.defaultSpotfireConfig = new SpotfireConfig().deserialize(config);
                                this.defaultSpotfireConfig.uiAppId = this.uiAppId;
                                return this.spotfireConfigService.createSpotfireConfig(this.sandboxId, this.defaultSpotfireConfig.uiAppId, this.defaultSpotfireConfig)
                                    .pipe(
                                    map(
                                        result => {
                                        const newSpotfireConfig = this.defaultSpotfireConfig;
                                        newSpotfireConfig.id = result;
                                        this.spotfireConfigService.updateSpotfireConfig(this.sandboxId, newSpotfireConfig.uiAppId, newSpotfireConfig, result).
                                        subscribe(
                                            // trigger a read to flush the cache since we changed it
                                            updatedConf => {
                                                this.spotfireConfigService.getSpotfireConfig(this.uiAppId, true, true).subscribe();
                                            }
                                        );
                                        return newSpotfireConfig;
                                        })
                                    );
                                })
                            );
                        } else {
                            return of(spotfireConfig);
                        }
                    }
                )
            )
            )
        )
        return spotfireConfig;
    }

}
