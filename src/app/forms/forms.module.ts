import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AgmCoreModule} from '@agm/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

import {SharedModule} from '../shared/shared.module';
import {FormsRoutingModule} from './forms-routing.module';
import {PredemoComponent} from './predemo/predemo.component';
import {QuoteRequestComponent} from './quote-request/quote-request.component';
import {ColoredCheckboxComponent} from './fields/colored-checkbox/colored-checkbox.component';
import {ListSchoolsComponent} from './fields/list-schools/list-schools.component';

const googleMapsParams = {
  apiKey: 'AIzaSyBvPfH-3bQ0O5oHauZXdc2CXfkQnrH8Asg',
  libraries: ['places'],
  language: 'en',
};

@NgModule({
  declarations: [
    PredemoComponent,
    QuoteRequestComponent,
    ColoredCheckboxComponent,
    ListSchoolsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AgmCoreModule.forRoot(googleMapsParams),
    MatAutocompleteModule,
    FormsRoutingModule
  ]
})
export class FormsModule {
}
