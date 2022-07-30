import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdCardsRoutingModule } from './id-cards-routing.module';
import { IdCardsComponent } from './id-cards.component';
import { AdminSharedModule } from '../shared/admin-shared.module';
import { IdCardEditorComponent } from './id-card-editor/id-card-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackgroundTextComponent } from './background-text/background-text.component';
import { UploadLogoComponent } from './upload-logo/upload-logo.component';
import { IdCardProfilePictureComponent } from './id-card-profile-picture/id-card-profile-picture.component';
import { IdCardIdNumbersComponent } from './id-card-id-numbers/id-card-id-numbers.component';
import { IdCardGradeLevelsComponent } from './id-card-grade-levels/id-card-grade-levels.component';


@NgModule({
  declarations: [IdCardsComponent, IdCardEditorComponent, BackgroundTextComponent, UploadLogoComponent, IdCardProfilePictureComponent, IdCardIdNumbersComponent, IdCardGradeLevelsComponent],
  imports: [
    CommonModule,
    IdCardsRoutingModule,
    AdminSharedModule,
    FormsModule,  
    ReactiveFormsModule 
  ]
})
export class IdCardsModule { }
