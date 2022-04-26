import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ExploreRoutingModule} from './explore-routing.module';
import {ExploreComponent} from './explore.component';
import {CoreModule} from '../../core/core.module';
import {PagesDialogComponent} from './pages-dialog/pages-dialog.component';
import {FilterButtonComponent} from './filter-button/filter-button.component';
import {StudentFilterComponent} from './student-filter/student-filter.component';
import {StatusFilterComponent} from './status-filter/status-filter.component';
import {StatusEditorComponent} from './status-editor/status-editor.component';
import {StatusNotifyerService} from './status-notifyer.service';
import {SharedModule} from '../../shared/shared.module';
import {SearchCalendarComponent} from './search-calendar/search-calendar.component';
import {AdminModule} from '../admin.module';
import {AdminSharedModule} from '../shared/admin-shared.module';

@NgModule({
  declarations: [
    ExploreComponent,
    PagesDialogComponent,
    FilterButtonComponent,
    StudentFilterComponent,
    StatusFilterComponent,
    StatusEditorComponent,
    SearchCalendarComponent,
  ],
  imports: [
    CommonModule,
    ExploreRoutingModule,
    CoreModule,
    SharedModule,
    AdminSharedModule,
    AdminModule
  ],
  providers: [StatusNotifyerService],
  entryComponents: [
    PagesDialogComponent,
    StudentFilterComponent,
    SearchCalendarComponent
  ]
})
export class ExploreModule { }
