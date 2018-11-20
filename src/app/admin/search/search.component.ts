import { Component, OnInit } from '@angular/core';
import { Pinnable } from '../../models/Pinnable';
import { ColorProfile } from '../../models/ColorProfile';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  testPinnable1:Pinnable;
  testPinnable2:Pinnable;
  testPinnable3:Pinnable;
  testPinnables:Pinnable[] = [];
  testProfile:ColorProfile;


  hasSearched: boolean = false;

  constructor() { }

  ngOnInit() {
    this.testProfile = new ColorProfile('', 'testing', '#3D56F7,#A957F0', '#A957F0', '', '#A957F0', '');
    this.testPinnable1 = new Pinnable('1', 'Testing1', '', 'https://storage.googleapis.com/courier-static/icons/Bathroom.png', '', null, null, this.testProfile);
    this.testPinnable2 = new Pinnable('2', 'Testing2', '', 'https://storage.googleapis.com/courier-static/icons/Office.png', '', null, null, this.testProfile);
    this.testPinnable3 = new Pinnable('3', 'Testing3', '', 'https://storage.googleapis.com/courier-static/icons/Gym.png', '', null, null, this.testProfile);
    this.testPinnables.push(this.testPinnable1);
    this.testPinnables.push(this.testPinnable2);
    this.testPinnables.push(this.testPinnable3);
  }

}
