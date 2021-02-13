import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormsService} from '../../services/forms.service';

declare const gtag: Function;

@Component({
  selector: 'app-quote-request',
  templateUrl: './quote-request.component.html',
  styleUrls: ['./quote-request.component.scss']
})
export class QuoteRequestComponent implements OnInit {

  quoteRequestForm: FormGroup;
  hdyhau: FormArray;
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private formService: FormsService) {
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
  }

  confirm(): void {
    if (!this.quoteRequestForm.valid) {
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
      gtag('event', 'quote-request-complete', {});
    });
  }

}

