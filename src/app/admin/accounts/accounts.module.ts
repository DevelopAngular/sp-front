import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AccountsRoutingModule} from './accounts-routing.module';
import {AccountsComponent} from './accounts.component';
import {AdminCardButtonComponent} from './admin-card-button/admin-card-button.component';
import {AdminSharedModule} from '../shared/admin-shared.module';
import {AccountsSyncComponent} from './accounts-sync/accounts-sync.component';
import {IntegrationCardComponent} from './integration-card/integration-card.component';
import {IntegrationsDialogComponent} from './integrations-dialog/integrations-dialog.component';
import {Ggl4SettingsComponent} from './integrations-dialog/ggl4-settings/ggl4-settings.component';
import {InfoDialogComponent} from './integrations-dialog/ggl4-settings/info-dialog/info-dialog.component';
import {GSuiteSettingsComponent} from './g-suite-settings/g-suite-settings.component';
import {GSuiteInfoComponent} from './g-suite-settings/g-suite-info/g-suite-info.component';
import {Gg4lSetUpComponent} from './integrations-dialog/ggl4-settings/gg4l-set-up/gg4l-set-up.component';
import {SyncSettingsComponent} from './sync-settings/sync-settings.component';
import {SyncProviderComponent} from './sync-provider/sync-provider.component';
import {GSuiteSetUpComponent} from './g-suite-settings/g-suite-set-up/g-suite-set-up.component';
import {GSuiteAccountLinkComponent} from './g-suite-settings/g-suite-account-link/g-suite-account-link.component';
import {AccountsHeaderComponent} from './accounts-header/accounts-header.component';
import {TabButtonComponent} from './accounts-header/tab-button/tab-button.component';
import {AddAccountPopupComponent} from './add-account-popup/add-account-popup.component';
import {BulkAddComponent} from './bulk-add/bulk-add.component';
import {AddRolePopupComponent} from './select-role/add-role-popup/add-role-popup.component';
import {PermissionsDialogComponent} from '../accounts-role/permissions-dialog/permissions-dialog.component';
import {ProfilePictureComponent} from './profile-picture/profile-picture.component';
import {GSuiteConnectComponent} from './g-suite-settings/g-suite-connect/g-suite-connect.component';

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
    AccountsSyncComponent,
    AccountsHeaderComponent,
    TabButtonComponent,
    AddAccountPopupComponent,
    BulkAddComponent,
    AddRolePopupComponent,
    PermissionsDialogComponent,
    ProfilePictureComponent,
    GSuiteConnectComponent
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    AdminSharedModule
  ]
})
export class AccountsModule {
}
