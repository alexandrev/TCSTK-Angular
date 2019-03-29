import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ServiceHandlerService} from '../../services/service-handler.service';
import {MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {el} from '@angular/platform-browser/testing/src/browser_util';
import {CaseDetailsDialogComponent} from '../case-details-dialog/case-details-dialog.component';
import {Location} from '@angular/common';

@Component({
  selector: 'tccwm-double-list-for-selection',
  templateUrl: './double-list-for-selection.component.html',
  styleUrls: ['./double-list-for-selection.component.css']
})
export class DoubleListForSelectionComponent implements OnInit {

  @Input() uiAppId;
  @Input() appIds;
  @Input() sandboxId;
  @Input() userName;
  @Input() userId;

  @ViewChild('paginator') paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;

  @ViewChild('selectionPaginator') selectionPaginator: MatPaginator;

  private csvSeparator = ';';



  public objList = [];

  public caseList;

  private serviceHandler: ServiceHandlerService;

  displayedColumns: string[] = ['DemandeID', 'Payeur', 'Numrodedemande', 'Statut', 'View', 'Select'];
  selectionDisplayedColumns: string[] = ['Select', 'DemandeID', 'Decision'];

  private precoStates = ['Attente pièce pour validation', 'Clôture en cours', 'Demande annulée', 'Demande annulée suite à modification', 'Demande clôturée',
                         'Demande refusée',  'Edition en cours - complet', 'en attente de documents post saisie',
                         'Validation des éditions en cours',
                         'Validation en cours - complet', 'Validation en cours - incomplet'];

  public dataSource;
  public selectionDataSource;


  public selectionList = [];

  constructor(serviceHandler: ServiceHandlerService, private dialog: MatDialog, private location: Location) {
    this.serviceHandler = serviceHandler;
  }

  ngOnInit() {
    // TODO remove hard coded stuffs
    const serviceObservable = this.serviceHandler.getCases(this.sandboxId, this.appIds[0], '1', 0, 900);
    serviceObservable.subscribe(result => {
        console.log('CASES : ' + result);

        this.objList = result.caseinfos;
        for (const obj of this.objList) {
          obj.casedataObj = JSON.parse(obj.casedata);
          // Set attribute to root to allow sorting
          obj.DemandeID = obj.casedataObj.DemandeID;
          obj.Payeur =  obj.casedataObj.Payeur;
          obj.Statut = obj.casedataObj.Dossier.Statut;
          obj.Numrodedemande = obj.casedataObj.Dossier.Numrodedemande;
          if (obj.casedataObj.Dossier && this.precoStates.includes(obj.casedataObj.Dossier.Statut) ) {
            obj.casedataObj.preco = true;
          } else {
            obj.casedataObj.preco = false;
          }
        }


        this.dataSource = new MatTableDataSource(this.objList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.selectionDataSource = new MatTableDataSource(this.selectionList);
        this.selectionDataSource.paginator = this.selectionPaginator;


      },
      error => {
        alert('ERROR GETTING CASE');
      });

  }


  private getRealIndex(paginator: MatPaginator, index) {
    return (paginator.pageIndex * paginator.pageSize) + index;
  }


  onAreaListControlChanged(obj, index) {
    // determine selected options
    const realIndex = this.getRealIndex(this.paginator, index);
    this.objList.splice(realIndex, 1);
    this.dataSource._updateChangeSubscription();

    obj.selectedForDecision = true;
    this.selectionList.push(obj);
    this.selectionDataSource._updateChangeSubscription();
  }

  onSelectionListControlChanged(obj, index) {
    // determine selected options
    const realIndex = this.getRealIndex(this.selectionPaginator, index);
    this.selectionList.splice(realIndex, 1);
    this.selectionDataSource._updateChangeSubscription();

    obj.selectedForDecision = false;
    this.objList.unshift(obj);
    this.dataSource._updateChangeSubscription();
  }


  private refreshDataSources() {
    this.dataSource._updateChangeSubscription();
    this.selectionDataSource._updateChangeSubscription();
  }

  unselectAll() {
    for (const obj of this.selectionList) {
      this.objList.unshift(obj);
    }
    // this.objList.concat(this.selectionList);
    this.selectionList.splice(0, this.selectionList.length);

    this.refreshDataSources();

  }


  selectAllPreco() {
    let index = 0;
    const indexToSplice = [];
    let refreshTable = false;
    for (const obj of this.objList) {
      if (obj.casedataObj.preco) {
        this.selectionList.push(obj);
        refreshTable = true;
        indexToSplice.unshift(index);
      }
      index++;
    }
    if (refreshTable) {
      for (const curI of indexToSplice) {
        this.objList.splice(curI, 1);
      }
      this.refreshDataSources();
    }
  }


  selectAll() {
    for (const obj of this.objList) {
      this.selectionList.push(obj);
    }
    this.objList.splice(0, this.objList.length);
    this.refreshDataSources();
  }

  decisionForAll(decisionValue: string) {
    for (const obj of this.selectionList) {
      obj.casedataObj.decision = decisionValue;
    }
    //  this.selectionDataSource._updateChangeSubscription();

  }


  createCsvStringFromSelection() {

    let csvContent = 'Zone 4;Zone 3;Zone 2;' +
      'Montant;Contrat';
    for (const obj of this.selectionList) {
      csvContent = csvContent + '\n';
      const casedataObj = obj.casedataObj;
      const curLine = 'TO MAP' + this.csvSeparator +
        casedataObj.zone3 + this.csvSeparator +
        casedataObj.zone2 + this.csvSeparator +
        casedataObj.Montant + this.csvSeparator +
        casedataObj.Dossier.Numrodedemande;
      csvContent = csvContent + curLine;
    }
    console.log(csvContent);
    return csvContent;
  }

  downloadFile() {
    if (this.selectionList.length === 0) {
      alert('Merci de selectionner des dossiers');
    } else {

      let validDecisions = true;
      for (const obj of this.selectionList) {
        if (!(!!obj.casedataObj.decision)) {
          validDecisions = false;
        }
      }

      if (validDecisions) {
        const data = this.createCsvStringFromSelection();
        const blob = new Blob([data], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);

        window.open(url, '_blank');
      } else {
        alert('Merci de prendre une decision sur tous les  dossiers');
      }


    }


  }

  openCase(obj) {
    window.open(this.location.prepareExternalUrl('starterApp/case/' + this.appIds[0] + '/1/' + obj.caseReference));
    // alert();

    // path: 'case/:appId/:typeId/:caseRef',


    /*const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;



    dialogConfig.data = {
      id: 1,
      description: 'Case Details',
      uiAppId : this.uiAppId,
      appId : this.appIds[0],
      sandboxId : this.sandboxId,
      userName : this.userName,
      userId : this.userId,
      caseRef: obj
    };

    dialogConfig.height = '90%';
    dialogConfig.width = '98%';

    const dialogRef = this.dialog.open(CaseDetailsDialogComponent, dialogConfig);
*/



  }

}