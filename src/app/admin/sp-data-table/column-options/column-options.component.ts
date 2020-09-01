import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import { FormControl, FormGroup } from '@angular/forms';
import {TableService} from '../table.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {StorageService} from '../../../services/storage.service';

@Component({
  selector: 'app-column-options',
  templateUrl: './column-options.component.html',
  styleUrls: ['./column-options.component.scss']
})
export class ColumnOptionsComponent implements OnInit, OnDestroy {

  triggerElementRef: HTMLElement;
  currentPage: string;
  columns: string[];
  formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private dialogRef: MatDialogRef<ColumnOptionsComponent>,
    private tableService: TableService,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.columns = this.data['columns'];
    this.currentPage = this.data['currentPage'];
    const columnsValue = JSON.parse(this.storage.getItem(this.currentPage));
    const groups = {};
    this.columns.forEach(column => {
      groups[column] = new FormControl(columnsValue ? columnsValue[column] : true);
    });
    this.formGroup = new FormGroup(groups);

    this.updateDialogPosition();
  }

  ngOnDestroy() {
    this.storage.setItem(this.currentPage, JSON.stringify(this.formGroup.value));
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 225}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  updateColumn() {
    const filteredColumns = [];
    this.columns.forEach(column => {
      if (this.formGroup.get(column).value) {
        filteredColumns.push(column);
      }
    });
    this.tableService.updateTableColumns$.next(filteredColumns);
  }

  hideAll() {
    this.tableService.updateTableColumns$.next([]);
    this.columns.forEach((column, index) => {
      if (this.formGroup.get(column).value) {
        this.formGroup.get(column).setValue(false);
      }
    });
  }

  showAll() {
    this.tableService.updateTableColumns$.next(this.columns);
    this.columns.forEach((column, index) => {
      if (!this.formGroup.get(column).value) {
        this.formGroup.get(column).setValue(true);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.updateColumn();
  }

}
