import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

import {SharedModule} from '../shared/shared.module';
import {FormsRoutingModule} from './forms-routing.module';

import {PredemoComponent} from './predemo/predemo.component';
import {QuoteRequestComponent} from './quote-request/quote-request.component';
import {AddSchoolComponent} from './add-school/add-school.component';

import {ColoredCheckboxComponent} from './fields/colored-checkbox/colored-checkbox.component';
import {ListSchoolsComponent} from './fields/list-schools/list-schools.component';
import {SchoolAutocompleteComponent} from './fields/school-autocomplete/school-autocomplete.component';
import {AddSchoolPopupComponent} from './fields/add-school-popup/add-school-popup.component';

import _refiner from 'refiner-js';

@NgModule({
  declarations: [
    PredemoComponent,
    QuoteRequestComponent,
    AddSchoolComponent,
    ColoredCheckboxComponent,
    ListSchoolsComponent,
    SchoolAutocompleteComponent,
    AddSchoolPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatAutocompleteModule,
    FormsRoutingModule
  ]
})
export class FormsModule {
  constructor() {
    _refiner('stopPinging');
    _refiner('resetUser');
  }
}
