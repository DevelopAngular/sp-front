import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpService } from '../../../services/http-service';
import * as moment from 'moment';
import { School } from '../../../models/School';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-school-settings',
  templateUrl: './school-settings.component.html',
  styleUrls: ['./school-settings.component.scss']
})
export class SchoolSettingsComponent implements OnInit, OnDestroy {

  form: FormGroup;
  school: {
    name: string,
    launch_date: string
  };

  destroy$ = new Subject();

  constructor(private http: HttpService) { }

  ngOnInit() {
    this.http.currentSchool$
      .pipe(takeUntil(this.destroy$))
      .subscribe(school => {
      this.school = {
        name: school.name,
        launch_date: school.launch_date ? moment(school.launch_date).format('MMMM DD, YYYY') : 'Not launched'
      };
    });
    this.form = new FormGroup({
      schoolName: new FormControl()
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
