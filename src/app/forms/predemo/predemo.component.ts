import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';

declare const window;

@Component({
  selector: 'app-predemo',
  templateUrl: './predemo.component.html',
  styleUrls: ['./predemo.component.scss']
})
export class PredemoComponent implements OnInit {

  meetingId: string;
  assignedTo: string;
  startTime: Date;
  timeZone: string;

  predemoForm: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.predemoForm = this.fb.group({
      schools: this.fb.array([]),
      hdyhau: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.meetingId = params['meetingid'];
      this.assignedTo = params['assigned_to'];
      this.startTime = new Date(params['event_start_time']);
      this.timeZone = params['time_zone'];
    });
    //http://localhost:4200/forms/predemo?meetingid=434314234&assigned_to=Michael%20C&event_start_time=2021-02-08T12%3A00%3A00-08%3A00&time_zone=EST
    window.appLoaded();
  }

  confirmDemo(): void {
    console.log(this.predemoForm.getRawValue());
  }

}
