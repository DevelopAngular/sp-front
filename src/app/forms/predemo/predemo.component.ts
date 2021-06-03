import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {FormsService} from '../../services/forms.service';

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
  submitted: boolean = false;

  completedSchools = true;
  completedHdyhau = true;

  predemoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private formService: FormsService
  ) {
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

      this.formService.getPredemoComplete(this.meetingId).subscribe(res => {
        this.completedSchools = res['schools'];
        this.completedHdyhau = res['hdyhau'];
        if (this.completedSchools) {
          this.predemoForm.removeControl('schools');
        }
        if (this.completedHdyhau) {
          this.predemoForm.removeControl('hdyhau');
        }
      });
    });

  }

  confirmDemo(): void {
    if (!this.predemoForm.valid) {
      return;
    }
    let formData = this.predemoForm.getRawValue();
    this.formService.savePredemoForm(
      this.meetingId,
      formData
    ).subscribe(res => {
      console.log(res);
    });
    this.submitted = true;
  }

}
