import {Component, Input, OnDestroy, OnInit, SecurityContext} from '@angular/core';
import {Subject} from 'rxjs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {map, take, takeUntil} from 'rxjs/operators';
import {LiveAppsService} from '../../services/live-apps.service';
import {Location} from '@angular/common';
import {LiveAppsComponent} from '../live-apps-component/live-apps-component.component';

@Component({
  selector: 'tcla-live-apps-state-icon',
  templateUrl: './live-apps-state-icon.component.html',
  styleUrls: ['./live-apps-state-icon.component.css']
})
export class LiveAppsStateIconComponent extends LiveAppsComponent implements OnInit {
  @Input() id: string;
  @Input() iconPath: string;
  @Input() color: string;
  @Input() iconHostURL: string;

  public iconSVG: SafeHtml;
  public svgcontents: string = undefined;

  constructor(private sanitizer: DomSanitizer, private http: HttpClient, private liveapps: LiveAppsService, private location: Location) {
    super();
  }

  public refillSVG = function(fill) {
    const updatedsvg = this.svgcontents.replace('fill="<DYNAMICFILL>"', 'fill="' + fill + '"');
    const newval = this.sanitizer.bypassSecurityTrustHtml(updatedsvg);
    this.iconSVG = newval;
  };

  public refresh = (icon, fill) => {
    let url: string;
    if (icon) {
      url = '/' + icon;
    } else {
      // use generic icon
      this.location.prepareExternalUrl('/assets/icons/ic-generic-state.svg');
    }
    this.liveapps.getIconSVGText(url)
      .pipe(
        take(1),
        takeUntil(this._destroyed$),
        map(val => {
            this.svgcontents = val;
            val = val.toString().replace('fill="<DYNAMICFILL>"', 'fill="' + fill + '"');
            const newval = this.sanitizer.bypassSecurityTrustHtml(val);
            return newval;
          }
        )
      )
      .subscribe(val => {
          this.iconSVG = val;
        }
        , error => {
          console.log('Unable to retrieve icon: ' + error.errorMsg);
        }
      );
  }

  ngOnInit() {
    this.refresh(this.iconPath, this.color);
  }

}
