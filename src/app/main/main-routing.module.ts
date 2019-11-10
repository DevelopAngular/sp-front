import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '../main-page/main-page.component';
import { SettingsComponent } from '../settings/settings.component';
import { NotKioskModeGuard } from '../not-kiosk-mode.guard';

const routes: Routes = [
  {
    path: '', component: MainPageComponent,
    children: [
      {path: '', redirectTo: 'passes', pathMatch: 'full'},
      {path: 'passes', loadChildren: 'app/passes/passes.module#PassesModule', canActivate: [NotKioskModeGuard]},
      {path: 'hallmonitor', loadChildren: 'app/hall-monitor/hall-monitor.module#HallMonitorModule', canActivate: [NotKioskModeGuard]},
      {path: 'myroom', loadChildren: 'app/my-room/my-room.module#MyRoomModule', canActivate: [NotKioskModeGuard]},
      {path: 'kioskMode', loadChildren: 'app/kiosk-mode/kiosk-mode.module#KioskModeModule'},
      {path: 'settings', component: SettingsComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
