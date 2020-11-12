import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PassesRoutingModule} from './passes-routing.module';
import {PassesComponent} from './passes.component';
import {SharedModule} from '../shared/shared.module';
import {NotificationTurnOnBtnComponent} from '../notification-turn-on-btn/notification-turn-on-btn.component';
import {InlineRequestCardComponent} from '../inline-request-card/inline-request-card.component';
import {InlinePassCardComponent} from '../inline-pass-card/inline-pass-card.component';
import {SwiperModule} from 'ngx-swiper-wrapper';

@NgModule({
  declarations: [
    PassesComponent,
    NotificationTurnOnBtnComponent,
    InlineRequestCardComponent,
    InlinePassCardComponent,
  ],
    imports: [
        CommonModule,
        PassesRoutingModule,
        SharedModule,
        SwiperModule
    ]
})
export class PassesModule { }
