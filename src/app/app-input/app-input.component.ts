import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
//import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { HallDateTimePickerComponent } from '../hall-date-time-picker/hall-date-time-picker.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Util } from '../../Util';


@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit {

    @Input() input_type: string = "text";
    @Input() input_class: string;
    @Input() input_value: string | number;
    @Input() input_label: string;
    @Input() placeholder: string = '';

    @Input() formGroup;
    @Input() controlName;

    @Output() onUpdate = new EventEmitter<string | number>();

    constructor(public dialog: MatDialog) {
    }

    ngOnInit() {
        this.controlName.setValue(this.input_value);
        this.controlName.valueChanges.subscribe(res => {
            this.onUpdate.emit(res);
        });
    }
}
