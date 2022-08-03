import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-encounter-detection-dialog',
  templateUrl: './encounter-detection-dialog.component.html',
  styleUrls: ['./encounter-detection-dialog.component.scss']
})
export class EncounterDetectionDialogComponent implements OnInit {

  ORIGINAL_ENCOUNTER_DATA: any = {};
  CLONNED_ENCOUNTER_DATA: any = {};
  page: number = 1;
  firstUser: any;
  secondUser: any;

  constructor(
    public dialogRef: MatDialogRef<EncounterDetectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void {
    this.ORIGINAL_ENCOUNTER_DATA = this.dialogData.encounte_data;
    this.CLONNED_ENCOUNTER_DATA = JSON.parse(JSON.stringify(this.ORIGINAL_ENCOUNTER_DATA.encounters))
    this.firstUser = this.CLONNED_ENCOUNTER_DATA[0].firstStudentPass.student;
    this.secondUser = this.CLONNED_ENCOUNTER_DATA[0].secondStudentPass.student
    this.CLONNED_ENCOUNTER_DATA = this.CLONNED_ENCOUNTER_DATA.map((encounter) => {
      encounter.durationOfContact = moment.utc(encounter.durationOfContact*1000).format('mm:ss');
      encounter.encounterDate = moment(encounter.encounterDate).format('MMM DD');
      return encounter
    })
  }

  goToEPGroup(){
    this.page = 2
  }

  goBack(){
    this.page == 1 ? this.dialogRef.close() : this.page = 1;
  }

}
