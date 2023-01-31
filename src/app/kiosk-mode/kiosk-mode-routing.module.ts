import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KioskSettingsGuard } from '../guards/kiosk-settings.guard';
import { NotKioskModeGuard } from '../not-kiosk-mode.guard';
import { KioskModeComponent } from './kiosk-mode.component';
import { KioskSettingsComponent } from './kiosk-settings/kiosk-settings.component';

const routes: Routes = [
	{ path: '', component: KioskModeComponent },
	{ path: 'settings', component: KioskSettingsComponent, canActivate: [NotKioskModeGuard, KioskSettingsGuard] },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class KioskModeRoutingModule {}
