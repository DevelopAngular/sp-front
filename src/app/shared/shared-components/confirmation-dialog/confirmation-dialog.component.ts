import {Component, EventEmitter, Inject, Input, Output, TemplateRef} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

export interface ConfirmationTemplates {
  headerText: string;
  body: TemplateRef<HTMLElement>;
  buttons: {
    confirmText: string;
    denyText: string
  };
  templateData: Record<string, any>;
  icon: {
    name: string;
    background: string;
  };
}

export const RecommendedDialogConfig: MatDialogConfig = {
  panelClass: 'overlay-dialog',
  backdropClass: 'custom-backdrop',
  closeOnNavigation: true,
};

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  templateData: Record<string, any>;

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationTemplates) {

    this.templateData = this.data.templateData;
  }
}
