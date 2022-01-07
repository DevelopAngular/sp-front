import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {AddSchoolPopupComponent} from '../add-school-popup/add-school-popup.component';
import {FormsService} from '../../../services/forms.service';

@Component({
  selector: 'app-school-autocomplete',
  templateUrl: './school-autocomplete.component.html',
  styleUrls: ['./school-autocomplete.component.scss']
})
export class SchoolAutocompleteComponent {

  @Input() inputLabel: string;
  @Input() width: string = '300px';
  @Input() tabIndex: number;
  // renamed because it gives an error otherwise
  @Input() fGroup: FormGroup;
  @Input() fControl: FormControl;

  @Input() forceError: boolean;
  @Input() useLargeFormWhenNotFound: boolean;

  @Output() name = new EventEmitter<string>();
  @Output() schoolDiggerId = new EventEmitter<string>();
  @Output() address = new EventEmitter<any>();

  showOptions: boolean = false;
  mouseIn: boolean = false;
  blockSearch: boolean = false;
  searchSchools;

  @ViewChild('searchAutocomplete') searchAutocomplete;
  currentPosition;
  backgroundColors: string[] = [];
  ignoreNextUpdate: boolean = false;
  notFoundHover: boolean = false;

  constructor(
    private formService: FormsService,
    private matDialog: MatDialog
  ) {
  }

  onSearch(search: string) {
    if (search != undefined && !this.ignoreNextUpdate && search.length >= 4) {
      this.formService.querySchools(search).subscribe((res: any[]) => {
        this.searchSchools = res.map(school => {
          return {
            'name': school['schoolName'],
            'address': school['city'] + ', ' + school['state'],
            'addressFull': {
              'road': school['schoolName'],
              'city': school['city'],
              'state': school['state'],
              'zip': school['zip'],
            },
            'schoolDiggerId': school['schoolid']
          };
        });
        this.showOptions = true;
      });
    } else {
      this.showOptions = false;
    }
    if (this.ignoreNextUpdate) {
      this.ignoreNextUpdate = false;
    }
    this.schoolDiggerId.emit(null);
    this.address.emit(null);
  }

  chooseSchool(school) {
    this.ignoreNextUpdate = true;
    this.showOptions = false;

    this.fControl.setValue(school.name);

    this.name.emit(school.name);
    this.schoolDiggerId.emit(school.schoolDiggerId);
    this.address.emit(school.addressFull);
  }

  mobileChooseSchool(a, school) {
    this.backgroundColors[a] = '#FFFFFF';
    this.chooseSchool(school);
  }

  blur() {
    if (!this.showOptions) {
      return;
    }
    this.showOptions = this.mouseIn;
  }

  showSearch() {
    return this.showOptions && !this.blockSearch;
  }

  getSearchPosition(i) {
    // [style.top.px]="getSearchPosition()"
    if (this.searchAutocomplete) {
      return this.searchAutocomplete.nativeElement.getBoudingClientRect().y + 40;
    }
    return 0;
  }

  textColor(item) {
    if (item.hovered) {
      return '#1F195E';
    } else {
      return '#555558';
    }
  }

  popup(data) {
    let addSchoolPopup = this.matDialog.open(AddSchoolPopupComponent, {
      panelClass: 'add-school-popup-container',
      backdropClass: 'white-backdrop',
      disableClose: true,
      data: {name: data},
    });
    addSchoolPopup.componentInstance.askForSchoolName = this.useLargeFormWhenNotFound;
    this.showOptions = false;
  }

}
