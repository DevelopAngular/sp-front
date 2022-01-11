import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FavoriteFormComponent} from '../favorite-form/favorite-form.component';
import {MainPageComponent} from '../main-page/main-page.component';
import {SettingsComponent} from '../settings/settings.component';
import {SharedModule} from '../shared/shared.module';
import {MainRoutingModule} from './main-routing.module';
import {AnimatedHeaderDirective} from '../core/directives/animated-header.directive';
import {NavbarComponent} from '../navbar/navbar.component';
import {NavButtonComponent} from '../nav-button/nav-button.component';
import {TeacherPinComponent} from '../teacher-pin/teacher-pin.component';
import {AssistantRestrictionComponent} from '../assistant-restriction/assistant-restriction.component';
import {PinInputComponent} from '../teacher-pin/pin-input/pin-input.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MainRoutingModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        SettingsComponent,
        FavoriteFormComponent,
        MainPageComponent,
        AnimatedHeaderDirective,
        NavbarComponent,
        NavButtonComponent,
        TeacherPinComponent,
        AssistantRestrictionComponent,
        PinInputComponent,
    ],
    providers: []
})
export class MainModule {
}
