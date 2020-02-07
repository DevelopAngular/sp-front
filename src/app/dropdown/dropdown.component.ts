import {
  Component,
  OnInit,
  ElementRef,
  Inject,
  ViewChild,
  Renderer2, ViewChildren, QueryList
} from '@angular/core';
import { Location } from '../models/Location';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { School } from '../models/School';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {User} from '../models/User';
import {RepresentedUser} from '../navbar/navbar.component';
import {fromEvent} from 'rxjs';

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

  @ViewChildren('schoolList') schoolList: QueryList<School>;

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
    private renderer: Renderer2
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

  changeColor(hovered, elem, pressed?: boolean) {
      if (hovered) {
        if (pressed) {
          this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? 'rgba(226, 231, 244, .2)' : '#E2E7F4');
        } else {
          this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? 'rgba(226, 231, 244, .2)' : '#ECF1FF');
        }
      } else {
        this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? '#0F171E' : 'white');
      }
  }

  search(value) {
  }

  closeDropdown(location) {
    this.scrollPosition = this.options.scrollTop;

    const dataAfterClosing = {
      selectedRoom: location,
      scrollPosition: this.scrollPosition
    };
    this._matDialogRef.close(dataAfterClosing);
  }
}
