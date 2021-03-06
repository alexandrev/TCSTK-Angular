import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralConfig } from '../../models/tc-general-config';
import { TcGeneralConfigService } from '../../services/tc-general-config.service';
import { Claim } from '../../models/tc-login';
import { MatSnackBar } from '@angular/material';


/**
 * Manages general settings for Config page
 *
 * ![alt-text](../tibco-cloud-settings-general.png "Image")
 *
 *@example <tc-tibco-cloud-settings-general></tc-tibco-cloud-settings-general>
 */
@Component({
    selector: 'tc-tibco-cloud-settings-general',
    templateUrl: './tibco-cloud-settings-general.component.html',
    styleUrls: ['./tibco-cloud-settings-general.component.css']
})
export class TibcoCloudSettingsGeneralComponent implements OnInit {

    public applicationTitle: string;
    public roles;
    public displayName: boolean;
    public documentationURL: string;
    public panelOpenState = false;
    public generalConfig: GeneralConfig;
    public sandboxId: number;
    public claims: Claim;

    constructor(protected route: ActivatedRoute, protected generalConfigService: TcGeneralConfigService, protected snackBar: MatSnackBar) { }

    ngOnInit() {
      this.generalConfig = this.route.snapshot.data.generalConfigHolder;
      this.claims = this.route.snapshot.data.claims;
      this.sandboxId = Number(this.claims.primaryProductionSandbox.id).valueOf();

        this.applicationTitle = this.generalConfig.applicationTitle;
        // this.roles = this.generalConfig.roles;
        this.displayName = this.generalConfig.displayName;
        this.documentationURL = this.generalConfig.documentationUrl;
    }

    protected getRoute(): ActivatedRoute {
      return this.route;
    }

    public runSaveFunction = () => {
      this.generalConfigService.updateGeneralConfig(this.sandboxId, this.generalConfig.uiAppId, this.generalConfig, this.generalConfig.id).subscribe(
          result => {
              this.snackBar.open('General configuration saved', 'OK', {
                  duration: 3000
              });
          },
          error => {
              this.snackBar.open('Error saving general configuration saved', 'OK', {
                  duration: 3000
              });
          }
      );
    }

}
