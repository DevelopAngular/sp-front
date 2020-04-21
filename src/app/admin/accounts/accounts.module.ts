import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AdminCardButtonComponent } from './admin-card-button/admin-card-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { AccountsSyncComponent } from './accounts-sync/accounts-sync.component';
import { SyncSettingsComponent } from './sync-settings/sync-settings.component';
import { SyncProviderComponent } from './sync-provider/sync-provider.component';
import { AccountsHeaderComponent } from './accounts-header/accounts-header.component';
import { TabButtonComponent } from './accounts-header/tab-button/tab-button.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AdminCardButtonComponent,
    AccountsSyncComponent,
    SyncSettingsComponent,
    SyncProviderComponent,
    AccountsHeaderComponent,
    TabButtonComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    AdminSharedModule,
  ],
  entryComponents: [
    SyncSettingsComponent,
    SyncProviderComponent
  ]
})
export class AccountsModule {
}
