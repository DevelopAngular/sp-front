import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ResolveAssetPipe} from '../resolve-asset.pipe';
import {MaterialModule} from '../shared/material/material.module';
import {ErrorToastComponent} from '../error-toast/error-toast.component';
import {SchoolToggleBarComponent} from '../school-toggle-bar/school-toggle-bar.component';
import {ToastConnectionComponent} from '../toast-connection/toast-connection.component';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {CrossPointerEventTargetDirective} from '../cross-pointer-event-target.directive';
import {SignedOutToastComponent} from '../signed-out-toast/signed-out-toast.component';
import {GradientButtonComponent} from '../gradient-button/gradient-button.component';
import { MoovingTilesComponent } from './mooving-tiles/mooving-tiles.component';

@NgModule({
  declarations: [
    ResolveAssetPipe,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    DropdownComponent,
    SignedOutToastComponent,
    GradientButtonComponent,
    CrossPointerEventTargetDirective,
    MoovingTilesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  exports: [
    ResolveAssetPipe,
    MaterialModule,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    DropdownComponent,
    CrossPointerEventTargetDirective,
    SignedOutToastComponent,
    GradientButtonComponent,
    MoovingTilesComponent
  ],
  entryComponents: [
    ErrorToastComponent,
    ToastConnectionComponent,
    DropdownComponent,
    SignedOutToastComponent
  ],
})
export class CoreModule { }
