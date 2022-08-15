import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import {HallPass} from '../../../models/HallPass';
import { PassCardComponent } from '../../../pass-card/pass-card.component';

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
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ORIGINAL_ENCOUNTER_DATA = this.dialogData.encounte_data;
    this.CLONNED_ENCOUNTER_DATA = this.ORIGINAL_ENCOUNTER_DATA.encounters.map(pass => {
      return {
        ...pass,
        firstStudentPass: HallPass.fromJSON(pass.firstStudentPass),
        secondStudentPass: HallPass.fromJSON(pass.secondStudentPass)
      };
    });
    this.CLONNED_ENCOUNTER_DATA.sort((a,b)=> new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime());
    this.firstUser = this.CLONNED_ENCOUNTER_DATA[0].firstStudentPass.student;
    this.secondUser = this.CLONNED_ENCOUNTER_DATA[0].secondStudentPass.student;
    this.CLONNED_ENCOUNTER_DATA = this.CLONNED_ENCOUNTER_DATA.map((encounter) => {
      encounter.durationOfContact = moment.utc(encounter.durationOfContact*1000).format('mm:ss');
      encounter.encounterDate = moment(encounter.encounterDate).format('MMM DD');
      return encounter
    })
  }

  goToEPGroup(){
    this.page = 2
  }

  openPassCard({pass}){
    pass.start_time = new Date(pass.start_time);
    pass.end_time = new Date(pass.end_time);
    const data = {
      pass: pass,
      fromPast: true,
      forFuture: false,
      forMonitor: false,
      isActive: false,
      forStaff: true,
    };
    const dialogRef = this.dialog.open(PassCardComponent, {
      panelClass: 'search-pass-card-dialog-container',
      backdropClass: 'custom-bd',
      data: data,
    });
  }

  goBack(){
    this.page == 1 ? this.dialogRef.close() : this.page = 1;
  }

}
