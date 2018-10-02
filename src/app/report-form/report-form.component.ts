import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../models/User';
import { HttpService } from '../http-service';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {

  formState: string = 'studentSelect';
  selectedStudents: User[] = [];
  showOptions: boolean = true;
  reportMessage: string = ""

  constructor(private http: HttpService, private dialogRef: MatDialogRef<ReportFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.dialogRef.updatePosition({top: '120px'});
    this.selectedStudents.push(this.data['report']);
    this.showOptions = !this.data['report'];
  }

  setFormState(state: string){
    this.formState = state;
    this.showOptions = this.formState==='studentSelect'
  }

  sendReport(){
    let endpoint = 'api/methacton/v1/event_reports/bulk_create';
    let body = {
      'students' : this.selectedStudents.map(user => user.id),
      'message' : this.reportMessage
    }

    this.http.post(endpoint, body).subscribe(data => {
      console.log(data);
      this.dialogRef.close();
    });
  }
}
