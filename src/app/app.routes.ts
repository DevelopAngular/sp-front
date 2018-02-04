import { Routes } from '@angular/router';

import {GoogleSigninComponent} from './google-signin/google-signin.component';
import {HallpassFormComponent} from './hallpass-form/hallpass-form.component';
import {PassListComponent} from './pass-list/pass-list.component';
import {MenuChooseComponent} from './menu-choose/menu-choose.component';

export const routes: Routes = [
  { path: '', component: GoogleSigninComponent },
  { path: 'choose', component: MenuChooseComponent },
  { path: 'form', component: HallpassFormComponent },
  { path: 'list', component: PassListComponent }
];


