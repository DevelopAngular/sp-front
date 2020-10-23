import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatProgressBarModule,
  MatGridListModule,
  MatDialogModule,
  MatIconModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatCardModule,
  MatCheckboxModule,
  MatTableModule,
  MatProgressSpinnerModule,
  MatDividerModule,
  MatTooltipModule,
  MatListModule,
  MatSidenavModule, MatSortModule,
} from '@angular/material';

import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatListModule,
    MatCheckboxModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSidenavModule,
    MatSortModule,
    DragDropModule
  ],
  exports: [
    MatProgressBarModule,
    MatTooltipModule,
    MatListModule,
    MatCheckboxModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSidenavModule,
    MatSortModule,
    DragDropModule
  ]
})
export class MaterialModule { }
