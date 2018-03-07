import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';

import { AppComponent} from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { TeacherSearchComponent } from './teacher-search/teacher-search.component';
import { GoogleSigninComponent } from './google-signin/google-signin.component';
import { HallpassFormComponent } from './hallpass-form/hallpass-form.component';
import { PassListComponent } from './pass-list/pass-list.component';
import { MenuChooseComponent } from './menu-choose/menu-choose.component';
import { RouterModule, Routes } from '@angular/router';
import { DataService } from './data-service';
import { HttpService } from './http-service';
import { HallPassComponent } from './hall-pass/hall-pass.component';
import { TemplatePassComponent } from './template-pass/template-pass.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { StudentSearchComponent } from './student-search/student-search.component';
import { AccountComponent } from './account/account.component'; 
//import { HallPass } from './hallpass';

const appRoutes: Routes = [
  { path: '', component: GoogleSigninComponent },
  { path: 'main', component: PassListComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    TeacherSearchComponent,
    GoogleSigninComponent,
    HallpassFormComponent,
    PassListComponent,
    MenuChooseComponent,
    HallPassComponent,
    TemplatePassComponent,
    StudentSearchComponent,
    AccountComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    InfiniteScrollModule,
    RouterModule.forRoot(
      appRoutes
      //,{ enableTracing: true } // <-- debugging purposes only
    ),
    //HallPass,
  ],
  providers: [DataService, HttpService],
  bootstrap: [AppComponent]
})

export class AppModule{
  
}
