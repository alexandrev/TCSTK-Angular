import {Component, Input, OnDestroy, OnInit, SecurityContext} from '@angular/core';
import {Subject} from 'rxjs';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {map, take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-live-apps-state-icon',
  templateUrl: './live-apps-state-icon.component.html',
  styleUrls: ['./live-apps-state-icon.component.css']
})
export class LiveAppsStateIconComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() iconPath: string;
  @Input() color: string;
  @Input() iconHostURL: string;

  private iconSVG: SafeHtml;
  private svgcontents: string = undefined;

  // use the _destroyed$/takeUntil pattern to avoid memory leaks if a response was never received
  private _destroyed$ = new Subject();

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) { }

  public refillSVG = function(fill) {
    const updatedsvg = this.svgcontents.replace('fill="<DYNAMICFILL>"', 'fill="' + fill + '"');
    const newval = this.sanitizer.bypassSecurityTrustHtml(updatedsvg);
    this.iconSVG = newval;
  };

  public refresh = (icon, fill) => {
    let url: string;
    if (icon) {
      url = icon;
    } else {
      // use generic icon
      url = 'assets/icons/ic-generic-state.svg';
    }

    const headers = new HttpHeaders().set('cacheResponse', 'true');
    this.http.get(url, {responseType: 'text', headers: headers } )
      .pipe(
        take(1),
        takeUntil(this._destroyed$),
        map(val => {
            this.svgcontents = val.toString();
            val = val.toString().replace('fill="<DYNAMICFILL>"', 'fill="' + fill + '"');
            const newval = this.sanitizer.bypassSecurityTrustHtml(val);
            return newval;
          }
        )
      )
      .subscribe(val => {
          this.iconSVG = val;
        }
        , error => { console.log('Unable to retrieve icon: ' + error.errorMsg); }
      );
}

  ngOnInit() {
    this.refresh(this.iconPath, this.color);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

}