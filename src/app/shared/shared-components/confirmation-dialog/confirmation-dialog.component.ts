import {Component, Inject, TemplateRef} from '@angular/core';

import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface ConfirmationTemplates {
  body: TemplateRef<HTMLElement>;
  buttons: {
    confirmText: string;
    denyText: string
  };
  templateData: Record<string, any>;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  $implicit: Record<string, any>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationTemplates) {
    this.$implicit = this.data.templateData;
  }
}
