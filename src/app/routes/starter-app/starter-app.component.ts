import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LiveAppsService} from 'tc-liveapps-lib';

@Component({
  selector: 'laapp-starter-app',
  templateUrl: './starter-app.component.html',
  styleUrls: ['./starter-app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StarterAppComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // this.router.navigate(['/starterApp/home'], {});
  }

}