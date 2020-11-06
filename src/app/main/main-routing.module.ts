import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainPageComponent} from '../main-page/main-page.component';
import {SettingsComponent} from '../settings/settings.component';
import {NotKioskModeGuard} from '../not-kiosk-mode.guard';

const routes: Routes = [
  {
    path: '', component: MainPageComponent,
    children: [
      {path: '', redirectTo: 'passes', pathMatch: 'full'},
      {path: 'passes', loadChildren: () => import('app/passes/passes.module').then(m => m.PassesModule), canActivate: [NotKioskModeGuard]},
      {path: 'hallmonitor', loadChildren: () => import('app/hall-monitor/hall-monitor.module').then(m => m.HallMonitorModule), canActivate: [NotKioskModeGuard]},
      {path: 'myroom', loadChildren: () => import('app/my-room/my-room.module').then(m => m.MyRoomModule), canActivate: [NotKioskModeGuard]},
      {path: 'kioskMode', loadChildren: () => import('app/kiosk-mode/kiosk-mode.module').then(m => m.KioskModeModule)},
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
