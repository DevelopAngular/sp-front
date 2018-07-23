import { Component, OnInit } from '@angular/core';
import { User } from '../NewModels';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {

  formState: string = 'studentSelect';
  selectedStudents: User[] = [];
  showOptions: boolean = true;
  reportMessage: string = "I caught them in the hallway without a pass."

  constructor() { }

  ngOnInit() {

  }

  setFormState(state: string){
    this.formState = state;
    this.showOptions = this.formState==='studentSelect'
  }

  sendReport(){
    console.log('Sending report');
  }
}
