import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material';
import { GradientButtonComponent } from '../gradient-button/gradient-button.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ResolveAssetPipe } from '../resolve-asset.pipe';
import { SmartpassLogoComponent } from '../smartpass-logo/smartpass-logo.component';
import { DisplayCardComponent } from '../display-card/display-card.component';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MatProgressBarModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,  
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    NavButtonComponent,
    DisplayCardComponent,
    DateTimePickerComponent
  ],
  exports: [
    GradientButtonComponent,
    ResolveAssetPipe,
    SmartpassLogoComponent,
    NavbarComponent,
    DisplayCardComponent,
    DateTimePickerComponent
  ],
})
export class SharedModule {
}