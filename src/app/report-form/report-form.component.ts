import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../models/User';
import { HttpService } from '../services/http-service';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {

  formState: string = 'studentSelect';
  selectedStudents: User[] = [];
  showOptions: boolean = true;
  reportMessage: string = '';

  constructor(private http: HttpService,
              private apiService: ApiService,
              private dialogRef: MatDialogRef<ReportFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.dialogRef.updatePosition({top: '120px'});
     if (this.data) {
       this.selectedStudents.push(this.data['report']);
         this.showOptions = !this.data['report'];
     }
  }

  setFormState(state: string) {
    this.formState = state;
    this.showOptions = this.formState === 'studentSelect';
  }

  sendReport() {
    const body = {
      'students' : this.selectedStudents.map(user => user.id),
      'message' : this.reportMessage
    };

    this.apiService.sendReport(body).subscribe(data => {
      console.log(data);
      this.dialogRef.close(data);
    });
  }
}
