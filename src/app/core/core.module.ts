import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResolveAssetPipe} from '../resolve-asset.pipe';
import {MaterialModule} from '../shared/material/material.module';
import {ErrorToastComponent} from '../error-toast/error-toast.component';
import {SchoolToggleBarComponent} from '../school-toggle-bar/school-toggle-bar.component';
import {ToastConnectionComponent} from '../toast-connection/toast-connection.component';
import {CrossPointerEventTargetDirective} from '../cross-pointer-event-target.directive';
import {SignedOutToastComponent} from '../signed-out-toast/signed-out-toast.component';
import {GradientButtonComponent} from '../gradient-button/gradient-button.component';
import {MoovingTilesComponent} from '../mooving-tiles/mooving-tiles.component';
import {CheckUserInputDirective} from './directives/check-user-input.directive';
import {SupportOptionsComponent} from '../support/support-options/support-options.component';
import {ToolTipRendererDirective} from './directives/tool-tip-renderer.directive';
import {SwipeEventDirective} from './directives/swipe-event.directive';
import {PassTileComponent} from '../pass-tile/pass-tile.component';

@NgModule({
  declarations: [
    ResolveAssetPipe,
    ErrorToastComponent,
    SchoolToggleBarComponent,
    ToastConnectionComponent,
    SignedOutToastComponent,
    GradientButtonComponent,
    CrossPointerEventTargetDirective,
    MoovingTilesComponent,
    CheckUserInputDirective,
    SupportOptionsComponent,
    ToolTipRendererDirective,
    SwipeEventDirective,
    PassTileComponent,
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
        CrossPointerEventTargetDirective,
        SignedOutToastComponent,
        GradientButtonComponent,
        MoovingTilesComponent,
        ToolTipRendererDirective,
        CheckUserInputDirective,
        SwipeEventDirective,
        PassTileComponent,
    ]
})
export class CoreModule { }
