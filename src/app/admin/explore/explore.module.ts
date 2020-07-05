import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExploreRoutingModule } from './explore-routing.module';
import { ExploreComponent } from './explore.component';
import { CoreModule } from '../../core/core.module';
import { PagesDialogComponent } from './pages-dialog/pages-dialog.component';
import { FilterButtonComponent } from './filter-button/filter-button.component';
import { StudentFilterComponent } from './student-filter/student-filter.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchCalendarComponent } from './search-calendar/search-calendar.component';

@NgModule({
  declarations: [
    ExploreComponent,
    PagesDialogComponent,
    FilterButtonComponent,
    StudentFilterComponent,
    SearchCalendarComponent
  ],
  imports: [
    CommonModule,
    ExploreRoutingModule,
    CoreModule,
    SharedModule
  ],
  entryComponents: [
    PagesDialogComponent,
    StudentFilterComponent,
    SearchCalendarComponent
  ]
})
export class ExploreModule { }
