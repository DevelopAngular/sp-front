import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {XlsxGeneratorService} from '../../xlsx-generator.service';
import {omit} from 'lodash';

@Component({
  selector: 'app-generated-table-dialog',
  templateUrl: './generated-table-dialog.component.html',
  styleUrls: ['./generated-table-dialog.component.scss']
})
export class GeneratedTableDialogComponent implements OnInit {

  triggerElementRef: HTMLElement;
  headerText: string;
  subtitleText: string;

  selectedRows: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<GeneratedTableDialogComponent>,
    public xlsx: XlsxGeneratorService
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.headerText = this.data['header'];
    this.subtitleText = this.data['subtitle'];
    this.selectedRows = this.data['selected']
    this.updateDialogPosition();
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 370}px`, top: `${rect.bottom - 170}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  generateCSV() {
    const exceptPass = this.selectedRows.map(row => {
      return omit(row, ['Pass']);
    });
    this.xlsx.generate(exceptPass);
  }

}
