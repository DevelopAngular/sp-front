import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-model-filter',
  templateUrl: './model-filter.component.html',
  styleUrls: ['./model-filter.component.scss']
})
export class ModelFilterComponent implements OnInit {

  triggerElementRef: HTMLElement;
  settings: {title: string, icon: string, action: string}[];

  constructor(
    public dialogRef: MatDialogRef<ModelFilterComponent>,
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

}
