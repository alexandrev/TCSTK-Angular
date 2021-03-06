// Note: This may move to the core library

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoginContext} from '../../models/liveappsdata';
import {LoginPrefill} from '@tibco-tcstk/tc-core-lib';
import {LiveAppsService} from '../../services/live-apps.service';
import { LiveAppsComponent } from '../live-apps-component/live-apps-component.component';

/**
 * Component perform a Login in case there is no valid Session yet.
 *
 * If the user is not logged in the login component will be displayed automatically.
 *
 * ![alt-text](../Login.png "Image")
 */
@Component({
  selector: 'tcla-live-apps-login',
  templateUrl: './live-apps-login.component.html',
  styleUrls: ['./live-apps-login.component.css']
})
export class LiveAppsLoginComponent extends LiveAppsComponent {

  @Output() loginContext: EventEmitter<LoginContext> = new EventEmitter<LoginContext>();
  @Input() loginPrefill: LoginPrefill;

  constructor() {
    super();
  }

  // run when logged in
  handleLoggedIn = (loginInfo) => {
    sessionStorage.setItem('loggedIn', Date.now().toString());

    // emit useful details about the login and session/claims
    this.loginContext.emit(new LoginContext().deserialize(
        {
          authInfo: loginInfo.authInfo,
          accessToken: loginInfo.accessToken
        }));
  }

}
