import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormsService} from '../../services/forms.service';

@Component({
  selector: 'app-add-school',
  templateUrl: './add-school.component.html',
  styleUrls: ['./add-school.component.scss']
})
export class AddSchoolComponent implements OnInit {

  submitted: boolean = false;
  showErrors: boolean = false;

  schoolForm: FormGroup;
  addressGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formService: FormsService
  ) { }

  ngOnInit(): void {
    this.addressGroup = this.fb.group({
      'road': [''],
      'city': [''],
      'state': [''],
      'zip': [''],
    })
    this.schoolForm = this.fb.group({
      'name': [null, Validators.required],
      'schoolDiggerId': [null],
      'address': this.addressGroup,
      'contact': [null],
    })
  }

  setSchoolDiggerId(schoolDiggerId) {
    this.schoolForm.get('schoolDiggerId').setValue(schoolDiggerId);
  }

  setAddress(address) {
    if (address === null) {
      return;
    }
    this.schoolForm.get('address').setValue(address);
  }

  submit() {
    if (!this.schoolForm.valid || !this.addressGroup.valid) {
      this.showErrors = true;
      return;
    }

    this.submitted = true;
    this.formService.addSchool(this.schoolForm.getRawValue()).subscribe(res => {
      console.log(res);
    });
  }

}
