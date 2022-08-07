import {AfterViewInit, Component, Inject, TemplateRef, ViewChild} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material/dialog';

export interface ConfirmationTemplates {
  headerText: string;
  body: TemplateRef<HTMLElement>;
  buttons?: {
    confirmText: string;
    denyText: string
  };
  templateData: Record<string, any>;
  icon?: {
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
export class ConfirmationDialogComponent implements AfterViewInit {
  @ViewChild('default') templateDefault: TemplateRef<HTMLElement>;
  templateData: Record<string, any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationTemplates) {
    // default buttons's text
    if (!this.data?.buttons) {
      this.data.buttons = {
        confirmText: 'Ok',
        denyText: 'Cancel',
      };
    }
    this.templateData = this.data.templateData;
  }

  ngAfterViewInit() {
    if (this.data.body === null) {
      this.data.body = this.templateDefault;
    }
  }
}
