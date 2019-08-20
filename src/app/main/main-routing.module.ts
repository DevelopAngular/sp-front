import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HallMonitorComponent } from '../hall-monitor/hall-monitor.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { MyRoomComponent } from '../my-room/my-room.component';
import { PassesComponent } from '../passes/passes.component';
import { SettingsComponent } from '../settings/settings.component';
import {AuthenticatedGuard} from '../guards/authenticated.guard';
import {NotKioskModeGuard} from '../not-kiosk-mode.guard';
import {IsAdminGuard} from '../guards/is-admin.guard';
import {KioskModeComponent} from '../kiosk-mode/kiosk-mode.component';

const routes: Routes = [
  {
    path: '', component: MainPageComponent, children: [
      {path: '', redirectTo: 'passes', pathMatch: 'full'},
      {path: 'passes', component: PassesComponent, canActivate: [NotKioskModeGuard]},
      {path: 'hallmonitor', component: HallMonitorComponent, canActivate: [NotKioskModeGuard]},
      {path: 'myroom', component: MyRoomComponent, canActivate: [NotKioskModeGuard]},
      {path: 'kioskMode', component: KioskModeComponent},
      {path: 'settings', component: SettingsComponent },
    ]
  },
  // {path: 'intro', component: IntroComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
