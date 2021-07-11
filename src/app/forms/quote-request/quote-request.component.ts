import {Component, ElementRef, HostListener, OnInit, ViewChild, Renderer2} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormsService} from '../../services/forms.service';
import {GoogleAnalyticsService} from '../../services/google-analytics.service';

declare const gtag: Function;

@Component({
  selector: 'app-quote-request',
  templateUrl: './quote-request.component.html',
  styleUrls: ['./quote-request.component.scss']
})
export class QuoteRequestComponent implements OnInit {

  @ViewChild('mainForm') mainForm: ElementRef;

  quoteRequestForm: FormGroup;
  hdyhau: FormArray;
  submitted: boolean = false;
  showErrors: boolean = false;
  heightSet: boolean = false;
  topShadow: boolean = false;
  bottomShadow: boolean = false;

  schoolCount: number = 1;

  constructor(
    private fb: FormBuilder,
    private formService: FormsService,
    private googleAnalytics: GoogleAnalyticsService,
    private renderer2: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.quoteRequestForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('[0-9 \\-()]{10,20}')]],
      schools: this.fb.array([])
    });
    this.hdyhau = this.fb.array([]);
    this.submitted = this.getCookie('form-complete') == 'true';
  }

  ngAfterViewInit() {
    let height = `${this.mainForm.nativeElement.offsetHeight}px`;
    this.renderer2.setStyle(this.mainForm.nativeElement, "height", height);
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 10) {
      this.topShadow = true;
      this.bottomShadow = false;
    } else if (event.target.scrollTop <= 10) {
      this.bottomShadow = true;
      this.topShadow = false;
    } else {
      this.topShadow = true;
      this.bottomShadow = true;
    }
  }

  confirm(): void {
    if (!this.quoteRequestForm.valid) {
      this.showErrors = true;
      return;
    }
    this.submitted = true;
    this.setCookie('form-complete', true, 'smartpass.app');
    let formData = this.quoteRequestForm.getRawValue();

    this.formService.saveQuoteRequest(
      formData['name'], formData['position'],
      formData['email'], formData['phone'],
      formData['schools']).subscribe(res => {
      let recordId = res['recordId'];
      this.hdyhau.valueChanges.subscribe(data => {
        this.formService.saveHdyhau(recordId, data)
          .subscribe(res => {
            console.log(res);
          });
      });
      this.googleAnalytics.emitEvent('quote_request_submit', {});
    });
  }

  schoolCountChange(count) {
    if (2 <= count)
      this.bottomShadow = true;
    else {
      this.topShadow = false;
      this.bottomShadow = false;
    }
    this.schoolCount = count;
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

