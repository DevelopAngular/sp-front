import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ResolveAssetPipe} from '../resolve-asset.pipe';
import {MaterialModule} from '../shared/material/material.module';
import {ErrorToastComponent} from '../error-toast/error-toast.component';
import {SchoolToggleBarComponent} from '../school-toggle-bar/school-toggle-bar.component';
import {ToastConnectionComponent} from '../toast-connection/toast-connection.component';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {ScrollHolderDirective} from '../scroll-holder.directive';
import {NoAccountComponent} from '../no-account/no-account.component';

@NgModule({
  declarations: [
    ResolveAssetPipe,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    DropdownComponent,
    NoAccountComponent
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
    NoAccountComponent
  ],
  entryComponents: [
    ErrorToastComponent,
    ToastConnectionComponent,
    DropdownComponent,
    NoAccountComponent
  ],
})
export class CoreModule { }
