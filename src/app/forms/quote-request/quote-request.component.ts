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
  height: string;
  topShadow: boolean = false;
  bottomShadow: boolean = false;
  mobile: boolean;

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
    this.mobile = window.innerWidth < 560;
  }

  ngAfterViewInit() {
    this.height = `${this.mainForm.nativeElement.offsetHeight}px`;
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
    if (2 <= count) {
      this.bottomShadow = true;
      this.renderer2.setStyle(this.mainForm.nativeElement, "height", this.height);
    } else {
      this.topShadow = false;
      this.bottomShadow = false;
    }
    this.schoolCount = count;
  }

  getButtonWidth() {
    if (!this.mobile) {
      return '542px';
    } else {
      return '279px';
    }
  }

}

