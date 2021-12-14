import {Component, OnInit, Renderer2} from '@angular/core';
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
  formTitle: string;
  submitted: boolean = false;
  showErrors: boolean = false;

  completedSchools = true;
  completedHdyhau = true;

  predemoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private formService: FormsService,
    private renderer2: Renderer2
  ) {
    this.predemoForm = this.fb.group({
      schools: this.fb.array([]),
      hdyhau: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.meetingId = params.meetingid;
      this.formTitle = params.formTitle;
      this.formService.getPredemoComplete(this.meetingId).subscribe(res => {
        this.completedSchools = res['schools'];
        this.completedHdyhau = res['hdyhau'];
        if (this.completedSchools) {
          this.predemoForm.removeControl('schools');
          this.submitted = true;
        }
        if (this.completedHdyhau) {
          this.predemoForm.removeControl('hdyhau');
        }
      });
    });
    this.submitted = this.getCookie('form-complete') == 'true';

    let globalContainer = document.getElementsByClassName('global-container')[0];
    this.renderer2.setStyle(globalContainer, 'height', 'unset');
  }

  confirmDemo(): void {
    if (!this.predemoForm.valid) {
      this.showErrors = true;
      return;
    }
    let formData = this.predemoForm.getRawValue();
    this.formService.savePredemoForm(
      this.meetingId,
      formData
    ).subscribe(res => {
      console.log(res);
      this.setCookie('form-complete', true, 'smartpass.app');
    });
    this.submitted = true;
  }

  getCookie(name) {
    let cookieValues = document.cookie.split(';').map(
      cookie => {
        cookie = cookie.replace(/^\s+/g, '');
        if (cookie.indexOf(name + '=') == 0)
          return cookie.substring(name.length + 1, cookie.length);
        return undefined;
      }
    ).filter(cookieValue => {
      return cookieValue !== undefined;
    });

    if (cookieValues.length != 0)
      return cookieValues[0];
    return undefined;
  }

  setCookie(name, value, path) {
    let date = new Date();
    date.setTime(date.getTime() + 31 * 24 * 60 * 60 * 1000);
    let expires = `expires=${date.toUTCString()}`;
    let cpath = path ? `; path=${path}` : '';
    document.cookie = `${name}=${value}; ${expires}${cpath}`;
  }

}
