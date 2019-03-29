import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SpotfireCustomization } from '@tibco/spotfire-wrapper/lib/spotfire-customization';
import { McSpotfireWrapperComponent } from 'tc-spotfire-lib';
import { PdProcessDiscoveryService } from '../../services/pd-process-discovery.service';
import { ToolbarButton, TcButtonsHelperService } from 'tc-core-lib';
import { MatButtonToggleChange, MatDialog } from '@angular/material';
import { CaseType, LiveAppsCreatorDialogComponent, CaseCreatorSelectionContext } from 'tc-liveapps-lib';
import { Datasource, ChangeDatasourceSelectionContext } from '../../models/tc-process-discovery';
import { ProcesDiscoveryChangeDatasourceDialogComponent } from '../proces-discovery-change-datasource-dialog/proces-discovery-change-datasource-dialog.component';

@Component({
  selector: 'tcpd-pd-process-mining',
  templateUrl: './pd-process-mining.component.html',
  styleUrls: ['./pd-process-mining.component.css']
})
export class PdProcessMiningComponent implements OnInit {

    @ViewChild(McSpotfireWrapperComponent) spotfireWrapperComponent: McSpotfireWrapperComponent;

    // Widget configuration
    public title: string;
    public viewButtons: ToolbarButton[];
    public toolbarButtons: ToolbarButton[];
    public sandboxId: number;

    // Spotfire configuration
    public spotfireServer: string;
    public analysisPath: string;
    public allowedPages : string[];
    public activePage: string;
    public configuration;
    public markingOn;
    public parameters: string;
    public appIds: string[];

    public currentDatasource: Datasource;
    private datasourceAppId: string;     // AppId for the app which contains the datasources
    private newDatasource: Datasource;
    
    constructor(
        private router: Router, 
        private route: ActivatedRoute, 
        private processDiscovery: PdProcessDiscoveryService,
        protected buttonsHelper: TcButtonsHelperService,
        private dialog: MatDialog

    ) { 
        router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
    }

    ngOnInit() {
        // const datasourceId = this.route.snapshot.params['datasourceId'];
        this.sandboxId = this.route.snapshot.data.claims.primaryProductionSandbox.id;
        this.appIds = this.route.snapshot.data.laConfigHolder.liveAppsConfig.applicationIds;
        const uiAppId = this.route.snapshot.data.laConfigHolder.generalConfig.uiAppId;
        this.datasourceAppId = this.route.snapshot.data.processDiscoverConfigHolder.datasourceAppId;

        this.viewButtons = this.createViewButtons();
        this.toolbarButtons = this.createToolbarButtons();

        // Spotfire general configuration 
        const spotfireConfig = this.route.snapshot.data.spotfireConfigHolder;
        this.spotfireServer = spotfireConfig.spotfireServer;
        this.analysisPath = spotfireConfig.analysisPath;
        this.activePage = spotfireConfig.activePageForHome;
        this.allowedPages = spotfireConfig.allowedPages;

        const value = false;
        this.configuration = {
            "showAbout": value,
            "showAnalysisInformationTool": value,
            "showAuthor": value,
            "showClose": value,
            "showCustomizableHeader": value,
            "showDodPanel": value,
            "showExportFile": value,
            "showExportVisualization": value,
            "showFilterPanel": value,
            "showHelp": value,
            "showLogout": value,
            "showPageNavigation": value,
            "showAnalysisInfo": value,
            "showReloadAnalysis": value,
            "showStatusBar": value,
            "showToolBar": value,
            "showUndoRedo": value
        } as SpotfireCustomization;
        this.markingOn = '*';

        this.processDiscovery.getJezDatasource(this.sandboxId, uiAppId).subscribe(
            datasource => {
                this.currentDatasource = datasource;
                this.refresh(false);
            },
            error => {
                if (error === 'Not datasource defined'){
                    console.log('There is no datasource');
                    this.title = '';
                    this.openDialog(this.currentDatasource);
                }
            })
    }

    refresh = (refresOption:boolean): void => {
        this.title = 'Datasource: ' + this.currentDatasource.description;
        this.parameters='AnalysisId = "' + this.currentDatasource.datasourceId + '";';
    }
    
    protected createToolbarButtons = (): ToolbarButton[] => {
        const changeDatasourceButton = this.buttonsHelper.createButton('changedatasource', 'tcs-config-icon', true, 'Change datasource', true, true);
        const configButton = this.buttonsHelper.createButton('config', 'tcs-capabilities', true, 'Config', true, true);
        const buttons = [configButton, changeDatasourceButton];
        return buttons;
    }

    // This is the default method. If we add more buttons, we'll need to overwrite.
    handleToolbarButtonEvent = (buttonId: string) => {
        if (buttonId === 'config') {
            this.router.navigate(['/starterApp/configuration/']);
        }
        if (buttonId === 'changedatasource'){
            this.openDialog(this.currentDatasource);
        }
    }

    protected createViewButtons = (): ToolbarButton[] => {
        const processMiningView = this.buttonsHelper.createButton('process-mining-view', '', true, 'Process Mining View', true, true);
        const caseView = this.buttonsHelper.createButton('case-view', '', true, 'Case View', true, true);
        const buttons = [processMiningView, caseView];
        return buttons;
    }

    public handleViewButtonEvent = (event: MatButtonToggleChange) => {
        this.router.navigate(['/starterApp/pd/case-view']);
    }

    public tabChange = ($event: any): void => {
        this.spotfireWrapperComponent.openPage(this.allowedPages[$event.index]);
    }

    public handleCreatorAppSelection = (application: CaseType): void => {
        const EXAMPLE_INITIAL_DATA = {
            DiscoverCompliance: {
                ShortDescription: this.selectedVariant,
                Context: {
                    ContextType: 'Case',
                    ContextID: this.selectedVariantID,
                    DataSourceName: this.currentDatasource.description
                }
            }

        };
        this.openCreatorDialog(application, EXAMPLE_INITIAL_DATA, this.sandboxId);    
    }

    openCreatorDialog = (application: CaseType, initialData, sandboxId) => {
        const dialogRef = this.dialog.open(LiveAppsCreatorDialogComponent, {
            width: '60%',
            height: '80%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'tcs-style-dialog',
            data: new CaseCreatorSelectionContext(application, initialData, sandboxId)
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log(result);
                this.router.navigate(['/starterApp/case/' + result.appId + '/' + result.typeId + '/' + result.caseRef], {});
            }
        });
    }

    selectedVariant = '';
    selectedVariantID = '';

    public marking(data) {
        var mName = 'Cases';

        if (data[mName] != null) {
            if (data[mName]['newCases'] != null) {
                if (data[mName]['newCases']['case_id'] != null) {
                    console.log('Selected CaseID: ', data[mName]['newCases']['case_id']);
                    this.selectedVariantID = data[mName]['newCases']['case_id'].toString();
                    this.selectedVariant = 'Compliance case at ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
                    this.processDiscovery.sendMessage(this.selectedVariant, this.selectedVariantID);
                }
            }
        }
//         if (data['Variant'] != null) {
//             if (data['Variant']['uncompliantVariants'] != null) {
//                 if (data['Variant']['uncompliantVariants']['variant_id'] != null) {
//                     console.log('Selected Uncompliand Variant IDs: ', data['Variant']['uncompliantVariants']['variant_id']);
// //                    this.uncompliantVariantID = data['Variant']['uncompliantVariants']['variant_id'].toString();
//                     this.processDiscovery.sendMessage('Variant case at ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), data['Variant']['uncompliantVariants']['variant_id'].toString());
//                 }
//             }
//         }   
     }

    openDialog = (currentDatasource: Datasource): void => {
        const dialogRef = this.dialog.open(ProcesDiscoveryChangeDatasourceDialogComponent, {
            width: '50%',
            height: '40%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: 'tcs-style-dialog',
            data: new ChangeDatasourceSelectionContext(currentDatasource, this.sandboxId, this.datasourceAppId)
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log("Cerrando el cuadro de dialogo", result);
                if (!this.currentDatasource || this.currentDatasource.caseRef != result.caseRef){
                    this.currentDatasource = result;
                    this.refresh(true);
                    this.processDiscovery.setCurrentDatasource(result).subscribe();                    
                }
                // this.router.navigate(['/starterApp/case/' + result.appId + '/' + result.typeId + '/' + result.caseRef], {});
            }
        });
    }

}
