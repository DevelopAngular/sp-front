import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {TeacherSearchComponent} from './teacher-search/teacher-search.component';
import {GoogleSigninComponent} from './google-signin/google-signin.component';
import {HallpassFormComponent} from './hallpass-form/hallpass-form.component';
import {PassListComponent} from './pass-list/pass-list.component';
import {MenuChooseComponent} from './menu-choose/menu-choose.component';
import {RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
  { path: '', component: GoogleSigninComponent },
  { path: 'choose', component: MenuChooseComponent },
  { path: 'form', component: HallpassFormComponent },
  { path: 'list', component: PassListComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    TeacherSearchComponent,
    GoogleSigninComponent,
    HallpassFormComponent,
    PassListComponent,
    MenuChooseComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    //BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    RouterModule.forRoot(
      appRoutes//,
      //{ enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule{
  
}
