import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PredemoComponent} from '../forms/predemo/predemo.component';
import {AuthGuardCallbackComponent} from './auth-guard-callback/auth-guard-callback.component';

// https://smartpass.app/app/forms/predemo
// https://smartpass.app/app/weblinks/reports
// https://smartpass.app/app/weblinks/encounters
// https://smartpass.app/app/weblinks/create
// https://smartpass.app/app/weblinks/pass?id=20977
// https://smartpass.app/app/weblinks/request?id=2482

const routes: Routes = [
  {
    path: 'reports', component: AuthGuardCallbackComponent, data: {
      url: ['admin', 'explore'],
      pass_through: {
        open_on_load: {dialog: 'admin/explore/report_search'},
      },
    }
  },
  {
    path: 'encounters', component: AuthGuardCallbackComponent, data: {
      url: ['admin', 'accounts'],
      pass_through_query_params: {'encounter-prevention': 'empty'},
    }
  },
  {
    path: 'pass', component: AuthGuardCallbackComponent, data: {
      url: ['main', 'passes'],
      pass_through: {
        open_on_load: {dialog: 'main/passes/open_pass'},
      },
    }
  },
  {
    path: 'request', component: AuthGuardCallbackComponent, data: {
      url: ['main', 'passes'],
      pass_through: {
        open_on_load: {dialog: 'main/passes/open_request'},
      },
    }
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeblinksRoutingModule {
}
