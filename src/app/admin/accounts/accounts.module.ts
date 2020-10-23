import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AdminCardButtonComponent } from './admin-card-button/admin-card-button.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { AccountsSyncComponent } from './accounts-sync/accounts-sync.component';
import { IntegrationCardComponent } from './integration-card/integration-card.component';
import { IntegrationsDialogComponent } from './integrations-dialog/integrations-dialog.component';
import { Ggl4SettingsComponent } from './ggl4-settings/ggl4-settings.component';
import { InfoDialogComponent } from './ggl4-settings/info-dialog/info-dialog.component';
import { GSuiteSettingsComponent } from './g-suite-settings/g-suite-settings.component';
import { GSuiteInfoComponent } from './g-suite-settings/g-suite-info/g-suite-info.component';
import { Gg4lSetUpComponent } from './ggl4-settings/gg4l-set-up/gg4l-set-up.component';
import { SyncSettingsComponent } from './sync-settings/sync-settings.component';
import { SyncProviderComponent } from './sync-provider/sync-provider.component';
import { GSuiteSetUpComponent } from './g-suite-settings/g-suite-set-up/g-suite-set-up.component';
import { GSuiteAccountLinkComponent } from './g-suite-settings/g-suite-account-link/g-suite-account-link.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AdminCardButtonComponent,
    AccountsSyncComponent,
    IntegrationCardComponent,
    IntegrationsDialogComponent,
    Ggl4SettingsComponent,
    InfoDialogComponent,
    GSuiteSettingsComponent,
    GSuiteInfoComponent,
    Gg4lSetUpComponent,
    SyncSettingsComponent,
    SyncProviderComponent,
    GSuiteSetUpComponent,
    GSuiteAccountLinkComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    AdminSharedModule,
  ],
  entryComponents: [
    IntegrationsDialogComponent,
    Ggl4SettingsComponent,
    GSuiteSettingsComponent,
    SyncSettingsComponent,
    SyncProviderComponent
  ]
})
export class AccountsModule {
}
