import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

interface Option {
  label: string;
  icon: string;
  description: string;
  textColor: string;
  backgroundColor: string;
  confirmButton: boolean;
  action: string;
}

@Component({
  selector: 'app-settings-description-popup',
  templateUrl: './settings-description-popup.component.html',
  styleUrls: ['./settings-description-popup.component.scss']
})
export class SettingsDescriptionPopupComponent implements OnInit {

  triggerElementRef: HTMLElement;
  settings: Option[];
  hoverOption: Option;
  showConfirmButton: boolean;

  constructor(
    public dialogRef: MatDialogRef<SettingsDescriptionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.triggerElementRef = this.data['trigger'];
    this.settings = this.data['settings'];
    this.updatePosition();
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 230}px`, top: `${rect.bottom + 15}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  selectedOption(option: Option) {
    if (option.confirmButton) {
      this.showConfirmButton = true;
    } else {
      this.dialogRef.close(option.action);
    }
  }

}
