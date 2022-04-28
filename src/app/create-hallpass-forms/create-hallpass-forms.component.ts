import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-create-hallpass-forms',
  templateUrl: './create-hallpass-forms.component.html',
  styleUrls: ['./create-hallpass-forms.component.scss']
})
export class CreateHallpassFormsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    console.log(this.data);
  }

}
