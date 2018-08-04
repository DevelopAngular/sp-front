import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Inject } from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';

@Component({
  selector: 'app-teacher-dropdown',
  templateUrl: './teacher-dropdown.component.html',
  styleUrls: ['./teacher-dropdown.component.scss']
})
export class TeacherDropdownComponent implements OnInit {

  choices: Location[];

  _matDialogRef: MatDialogRef<TeacherDropdownComponent>;
  triggerElementRef: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any[], _matDialogRef: MatDialogRef<TeacherDropdownComponent>) {
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data['trigger'];
    this.choices = data['choices'];
  }

  ngOnInit() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left - 50}px`, top: `${rect.bottom + 15}px` };
    matDialogConfig.width = '350px';
    matDialogConfig.height = '200px';
    this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  getTextWidth(text: string, fontSize: number){

  }

}
