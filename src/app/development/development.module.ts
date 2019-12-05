import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DevelopmentComponent} from './development.component';
import {CoreModule} from '../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {SignOutComponent} from '../sign-out/sign-out.component';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {path: '', component: DevelopmentComponent }
];

@NgModule({
  declarations: [
    DevelopmentComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DevelopmentModule { }
