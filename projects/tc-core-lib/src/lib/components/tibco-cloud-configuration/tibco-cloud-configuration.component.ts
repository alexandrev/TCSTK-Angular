import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router, Route, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { ToolbarButton } from '../../models/tc-widget-header';
import { TcButtonsHelperService } from '../../services/tc-buttons-helper.service';
import {RouteAction} from '../../models/tc-routing-actions';
import {ConfigurationMenuConfig} from '../../models/tc-configuration-menu-config';

@Component({
  selector: 'tc-tibco-cloud-configuration',
  templateUrl: './tibco-cloud-configuration.component.html',
  styleUrls: ['./tibco-cloud-configuration.component.css']
})
export class TibcoCloudConfigurationComponent implements OnInit {
  @Input() baseRoute: string;
  @Input() configMenuPages: ConfigurationMenuConfig[];
  @Output() routeAction: EventEmitter<RouteAction> = new EventEmitter<RouteAction>();
  configName: string;
  toolbarButtons: ToolbarButton[];

  constructor(private router: Router, private route: ActivatedRoute, private buttonsHelper: TcButtonsHelperService, private location: Location) { }

  private createToolbarButtons = (): ToolbarButton[] => {
    const homeButton = this.buttonsHelper.createButton('close', 'tcs-close-icon', true, 'Close', true, true);
    const buttons = [ homeButton ];
    return buttons;
  }

  public handleSelectionEvent = (id: string) => {
    this.configName = id;
    const url = this.baseRoute + id.toLowerCase().split(' ').join('-');
    this.router.navigate([url]);
  }

  public handleToolbarButtonEvent = (buttonId: string) => {
    if (buttonId === 'close') {
      this.routeAction.emit(new RouteAction('backClicked', null));
    }
  }

  showConfig = (option: string) => {
    this.configName = option;
    console.log('Setting selected: ' + option);
  }

  ngOnInit() {
    this.toolbarButtons = this.createToolbarButtons();
    // this.configName = this.route.component;
  }

}
