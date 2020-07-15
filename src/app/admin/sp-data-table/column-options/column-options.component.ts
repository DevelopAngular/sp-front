import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';
import {TableService} from '../table.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column-options',
  templateUrl: './column-options.component.html',
  styleUrls: ['./column-options.component.scss']
})
export class ColumnOptionsComponent implements OnInit {

  triggerElementRef: HTMLElement;
  columns: string[];
  formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private dialogRef: MatDialogRef<ColumnOptionsComponent>,
    private tableService: TableService
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.columns = this.data['columns'];
    const groups = {};
    this.columns.forEach(column => {
      groups[column] = new FormControl(true);
    });
    this.formGroup = new FormGroup(groups);

    this.updateDialogPosition();
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 225}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  updateColumn(value, index, column) {
    this.tableService.updateTableHeaders$.next({index, value, column});
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

}
