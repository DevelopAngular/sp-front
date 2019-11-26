import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpService } from '../../../services/http-service';
import { Observable } from 'rxjs';
import { School } from '../../../models/School';

@Component({
  selector: 'app-school-settings',
  templateUrl: './school-settings.component.html',
  styleUrls: ['./school-settings.component.scss']
})
export class SchoolSettingsComponent implements OnInit {

  form: FormGroup;
  school$: Observable<School>;

  constructor(private http: HttpService) { }

  ngOnInit() {
    this.school$ = this.http.currentSchool$;
    this.form = new FormGroup({
      schoolName: new FormControl()
    });
  }

}
