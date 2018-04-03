import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-pass-filter',
  templateUrl: './pass-filter.component.html',
  styleUrls: ['./pass-filter.component.css']
})
export class PassFilterComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PassFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(){
    console.log('Dialog open and received data: ' + this.data);
    console.log(this.data);
  }

}
