import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

declare const window;

@Component({
  selector: 'app-quote-request',
  templateUrl: './quote-request.component.html',
  styleUrls: ['./quote-request.component.scss']
})
export class QuoteRequestComponent implements OnInit {

  quoteRequestForm: FormGroup;
  hdyhau: FormArray;
  submitted: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    window.appLoaded(2000);

    this.quoteRequestForm = this.fb.group({
      name: '',
      position: '',
      email: '',
      phone: '',
      schools: this.fb.array([])
    });
  }

  confirm(): void {
    this.submitted = true;
    console.log(this.quoteRequestForm.getRawValue())
  }

}

