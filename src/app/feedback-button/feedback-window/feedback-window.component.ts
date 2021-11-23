import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-window',
  templateUrl: './feedback-window.component.html',
  styleUrls: ['./feedback-window.component.scss']
})
export class FeedbackWindowComponent implements OnInit {

  target: HTMLElement;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FeedbackWindowComponent>
  ) { }

  ngOnInit(): void {
    this.target = this.data['target'];
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.target.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 230}px`, top: `${rect.bottom + 15}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
