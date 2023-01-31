import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KioskModeRoutingModule } from './kiosk-mode-routing.module';
import { KioskModeComponent } from './kiosk-mode.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { KioskModeDialogComponent } from './kiosk-mode-dialog/kiosk-mode-dialog.component';
import { KioskSettingsComponent } from './kiosk-settings/kiosk-settings.component';

@NgModule({
	declarations: [KioskModeComponent, KioskModeDialogComponent, KioskSettingsComponent],
	imports: [CommonModule, KioskModeRoutingModule, SharedModule, FormsModule],
})
export class KioskModeModule {}
