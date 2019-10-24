import {Component, OnInit, Input, Output, EventEmitter, ElementRef, Inject, HostListener, ViewChild, OnChanges} from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { School } from '../models/School';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {User} from '../models/User';
import {UserService} from '../services/user.service';
import {RepresentedUser} from '../navbar/navbar.component';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  options: HTMLElement;
  @ViewChild('optionsWrapper') set content(content: ElementRef<HTMLElement>) {
    this.options = content.nativeElement;
    this.options.scrollTop = this.scrollPosition;
  }

  user: User;
  heading: string = '';
  locations: Location[];
  schools: School[];
  teachers: RepresentedUser[];
  selectedLocation: Location;
  selectedSchool: School;
  selectedTeacher: RepresentedUser;
  _matDialogRef: MatDialogRef<DropdownComponent>;
  triggerElementRef: HTMLElement;
  scrollPosition: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    _matDialogRef: MatDialogRef<DropdownComponent>,
    public  darkTheme: DarkThemeSwitch,
    private userService: UserService
  ) {
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data['trigger'];
    this.heading = data['heading'];
    this.locations = data['locations'];
    this.schools = data['schools'];
    this.teachers = data['teachers'];
    this.selectedLocation = data['selectedLocation'];
    this.selectedSchool = data['selectedSchool'];
    this.selectedTeacher = data['selectedTeacher'];
    this.user = data['user'];
    this.scrollPosition = data['scrollPosition'];

  }

  ngOnInit() {

    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.width = this.teachers ? '305px' : '350px';
    matDialogConfig.height = this.teachers ? '180px' : '215px';
    matDialogConfig.position = { left: `${rect.left + (rect.width / 2 - parseInt(matDialogConfig.width, 10) / 2 ) }px`, top: `${rect.bottom + 15}px` };
    this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
    this._matDialogRef.backdropClick().subscribe(() => {
      this._matDialogRef.close(this.selectedTeacher);
    });
  }

  closeDropdown(location) {
    // this.scrollPosition = this.scrollableArea()
    this.scrollPosition = this.options.scrollTop;

    // debugger
    const dataAfterClosing = {
      selectedRoom: location,
      scrollPosition: this.scrollPosition
    }
    this._matDialogRef.close(dataAfterClosing);
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
}
