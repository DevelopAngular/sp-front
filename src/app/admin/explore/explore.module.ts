import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExploreRoutingModule } from './explore-routing.module';
import { ExploreComponent } from './explore.component';
import { CoreModule } from '../../core/core.module';
import { PagesDialogComponent } from './pages-dialog/pages-dialog.component';

@NgModule({
  declarations: [
    ExploreComponent,
    PagesDialogComponent
  ],
  imports: [
    CommonModule,
    ExploreRoutingModule,
    CoreModule
  ],
  entryComponents: [PagesDialogComponent]
})
export class ExploreModule { }
