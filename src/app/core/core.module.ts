import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ResolveAssetPipe} from '../resolve-asset.pipe';
import {MaterialModule} from '../shared/material/material.module';
import {ErrorToastComponent} from '../error-toast/error-toast.component';
import {SchoolToggleBarComponent} from '../school-toggle-bar/school-toggle-bar.component';
import {ToastConnectionComponent} from '../toast-connection/toast-connection.component';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {ScrollHolderDirective} from '../scroll-holder.directive';
import {CrossPointerEventTargetDirective} from '../cross-pointer-event-target.directive';

@NgModule({
  declarations: [
    ResolveAssetPipe,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    DropdownComponent,
    CrossPointerEventTargetDirective
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
    CrossPointerEventTargetDirective
  ],
  entryComponents: [
    ErrorToastComponent,
    ToastConnectionComponent,
    DropdownComponent,
  ],
})
export class CoreModule { }
