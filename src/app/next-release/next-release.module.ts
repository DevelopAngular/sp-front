import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NextReleaseComponent} from './next-release.component';
import {CoreModule} from '../core/core.module';

@NgModule({
  declarations: [
    NextReleaseComponent
  ],
  entryComponents: [
    NextReleaseComponent
  ],
  imports: [
    CommonModule,
    CoreModule
  ],
  exports: [
    NextReleaseComponent
  ]
})
export class NextReleaseModule { }
