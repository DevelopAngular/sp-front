import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParentRoutingModule } from './parent-routing.module';
import { ParentPageComponent } from './parent-page/parent-page.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParentInviteCodeDialogComponent } from './parent-invite-code-dialog/parent-invite-code-dialog.component';


@NgModule({
  declarations: [ParentPageComponent, ParentInviteCodeDialogComponent],
  imports: [
    CommonModule,
    ParentRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ParentModule { }
