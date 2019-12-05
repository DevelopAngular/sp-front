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
import {NextReleaseComponent} from '../next-release/next-release.component';

@NgModule({
  declarations: [
    ResolveAssetPipe,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    DropdownComponent,
    CrossPointerEventTargetDirective,
    NextReleaseComponent
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
    NextReleaseComponent

  ],
  entryComponents: [
    ErrorToastComponent,
    ToastConnectionComponent,
    DropdownComponent,
    NextReleaseComponent
  ],
})
export class CoreModule { }
