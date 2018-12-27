import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';


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
    @Input() maxLength: number = 100;
    @Input() width: string;
    @Input() rightIcon: string;
    @Input() tooltipText: string;

    @Input() formGroup;
    @Input() controlName;

    @Output() onUpdate = new EventEmitter<string | number>();
    @Output() over = new EventEmitter();
    @Output() leave = new EventEmitter();

    constructor(public dialog: MatDialog) {
    }

    ngOnInit() {
        this.controlName.setValue(this.input_value);
        this.controlName.valueChanges.subscribe(res => {
            this.onUpdate.emit(res);
        });
    }
}
