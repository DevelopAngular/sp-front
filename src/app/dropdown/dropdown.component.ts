import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Inject } from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import { School } from '../models/School';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  alignSelf: boolean;
  heading: string = '';
  locations: Location[];
  schools: School[];
  selectedLocation: Location;
  selectedSchool: School;
  _matDialogRef: MatDialogRef<DropdownComponent>;
  triggerElementRef: HTMLElement;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any[], _matDialogRef: MatDialogRef<DropdownComponent>) {
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data['trigger'];
    this.heading = data['heading'];
    this.locations = data['locations'];
    this.schools = data['schools'];
    this.selectedLocation = data['selectedLocation'];
    this.selectedSchool = data['selectedSchool'];
    this.alignSelf = data['alignSelf'];

  }

  ngOnInit() {

    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.width = '350px';
    matDialogConfig.height = '200px';
    console.log('RECT =====>', rect, matDialogConfig);
    matDialogConfig.position = { left: `${rect.left + (rect.width / 2 - parseInt(matDialogConfig.width, 10) / 2 ) }px`, top: `${rect.bottom + 15}px` };
    this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  partOfProfile(school) {

    const roles = [];
      if (school.my_roles.includes('_profile_admin')) {
        roles.push('Administrator');
      }
      if (school.my_roles.includes('_profile_teacher')) {
        roles.push('Teacher');
      }
      if (school.my_roles.includes('_profile_student')) {
        roles.push('Student');
      }

    return roles.join(', ');
  }

  getTextWidth(text: string, fontSize: number){

  }

}
