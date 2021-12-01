import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormsService} from '../../../services/forms.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-school-popup',
  templateUrl: './add-school-popup.component.html',
  styleUrls: ['./add-school-popup.component.scss']
})
export class AddSchoolPopupComponent implements OnInit {

  @Input() askForSchoolName: boolean;

  submitted: boolean = false;
  showErrors: boolean = false;

  schoolForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private dialogRef: MatDialogRef<AddSchoolPopupComponent>,
    private fb: FormBuilder,
    private formService: FormsService
  ) {
  }

  ngOnInit(): void {
    console.log(this.data);
    this.schoolForm = this.fb.group({
      name: [this.data['name'], Validators.required],
      road: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern('[0-9]{5}')]],
      country: ['', [Validators.required, Validators.pattern('[A-Z]{2,3}')]],
    });
  }

  isValid() {
    return this.schoolForm.valid;
  }

  submit() {
    if (!this.isValid()) {
      this.showErrors = true;
    } else {
      this.submitted = true;

      let originalData = this.schoolForm.getRawValue();
      let data = {
        name: originalData['name'],
        school_digger_id: null,
        address: {
          road: originalData['road'],
          city: originalData['city'],
          state: originalData['state'],
          zip: originalData['zip'],
        },
        contact: null,
      };

      this.formService.addSchool(data).subscribe(res => {
        console.log(res);
      });
      this.dialogRef.close();
    }
  }

}
