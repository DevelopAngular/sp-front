import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FormsService} from '../../services/forms.service';

@Component({
  selector: 'app-add-school',
  templateUrl: './add-school.component.html',
  styleUrls: ['./add-school.component.scss']
})
export class AddSchoolComponent implements OnInit {

  submitted: boolean = false;

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
      'name': [null],
      'schoolDiggerId': [null],
      'address': this.addressGroup,
      'contact': [null],
    })
  }

  setName(name) {
    this.schoolForm.get('name').setValue(name);
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
    this.submitted = true;
    console.log(this.schoolForm.getRawValue());
    this.formService.addSchool(this.schoolForm.getRawValue()).subscribe(res => {
      console.log(res);
    });
  }

}
