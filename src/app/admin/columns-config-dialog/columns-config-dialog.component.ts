import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {StorageService} from '../../services/storage.service';
import {TABLE_RELOADING_TRIGGER} from '../accounts-role/accounts-role.component';


@Component({
  selector: 'app-columns-config-dialog',
  templateUrl: './columns-config-dialog.component.html',
  styleUrls: ['./columns-config-dialog.component.scss']
})
export class ColumnsConfigDialogComponent implements OnInit {

  _matDialogRef: MatDialogRef<ColumnsConfigDialogComponent>;
  triggerElementRef: HTMLElement;

  header: string;
  options: any[];
  formGroup: FormGroup;
  roleHeaders;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    _matDialogRef: MatDialogRef<ColumnsConfigDialogComponent>,
    private storage: StorageService
  ) {
    this.roleHeaders = data['tableHeaders'];
    this._matDialogRef = _matDialogRef;
    const roleColumns = this.data['role'] + '_columns';

    const controls = {};

    let tableHeaders = this.data['form'];

    for (const key in tableHeaders) {
      controls[key] = new FormControl(tableHeaders[key].value);
      controls[key].valueChanges.subscribe((val) => {
        tableHeaders[key].value = val;
        const header = this.roleHeaders[tableHeaders[key].label];
        this.storage.setItem(roleColumns, JSON.stringify(tableHeaders));
        setTimeout(() => {
          TABLE_RELOADING_TRIGGER.next({header, tableHeaders: this.roleHeaders});
        }, 100);
      });
    }
    this.formGroup = new FormGroup(controls);
    this.options = Object.keys(tableHeaders);

  }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.updatePosition();

    // this.formGroup.valueChanges.subscribe((value) => {
    //   console.log(value);
    //   const roleColumns = this.data['role'] + '_columns'
    //   const roleColumnsValue = {};
    //   this.storage.setItem(roleColumns, JSON.stringify(value));
    //   setTimeout(() => {
    //     TABLE_RELOADING_TRIGGER.next(true);
    //   }, 100);
    //   // const headers = this.storage.getItem(`${this.role}_columns`);
    //
    // });
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    // console.log( rect, this.triggerElementRef);

    matDialogConfig.position = { left: `${rect.left + rect.width - 225}px`, top: `${rect.bottom + 20}px` };
    // console.log(matDialogConfig.position);

    matDialogConfig.width = '245px';
    this._matDialogRef.updateSize(matDialogConfig.width, 'auto');
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }
}
