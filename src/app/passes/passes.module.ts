import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PassesRoutingModule} from './passes-routing.module';
import {PassesComponent} from './passes.component';
import {SharedModule} from '../shared/shared.module';
import {NotificationTurnOnBtnComponent} from '../notification-turn-on-btn/notification-turn-on-btn.component';
import {InlineRequestCardComponent} from '../inline-request-card/inline-request-card.component';
import {InlinePassCardComponent} from '../inline-pass-card/inline-pass-card.component';
import {StartPassNotificationComponent} from './start-pass-notification/start-pass-notification.component';

@NgModule({
  declarations: [
    PassesComponent,
    NotificationTurnOnBtnComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
    StartPassNotificationComponent
  ],
  imports: [
    CommonModule,
    PassesRoutingModule,
    SharedModule
  ]
})
export class PassesModule { }
