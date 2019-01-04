import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-select-profile',
  templateUrl: './select-profile.component.html',
  styleUrls: ['./select-profile.component.scss']
})
export class SelectProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('SELCT PROFILE =====>');
  }

}
