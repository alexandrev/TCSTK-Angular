import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UiAppConfig} from 'tc-core-lib';
import {Claim} from 'tc-liveapps-lib';

@Component({
  selector: 'laapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private appConfig: UiAppConfig;
  private claims: Claim;
  private sandboxId: number;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.appConfig = this.route.snapshot.data.appConfig;
    this.claims = this.route.snapshot.data.claims;
    this.sandboxId = this.route.snapshot.data.claims.primaryProductionSandbox.id;
  }

}