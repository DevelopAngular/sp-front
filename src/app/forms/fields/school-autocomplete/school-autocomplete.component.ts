import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {FormsService} from '../../../services/forms.service';

@Component({
  selector: 'app-school-autocomplete',
  templateUrl: './school-autocomplete.component.html',
  styleUrls: ['./school-autocomplete.component.scss']
})
export class SchoolAutocompleteComponent implements OnInit {

  @Input() inputLabel: string;
  @Input() width: string = '300px';
  @Input() tabIndex: number;
  @Input() formGroup: FormGroup;
  @Input() formControl: FormControl;
  @Input() forceError: boolean;

  @Output() name = new EventEmitter<string>();
  @Output() schoolDiggerId = new EventEmitter<string>();
  @Output() address = new EventEmitter<any>();

  showOptions: boolean = false;
  mouseIn: boolean = false;
  blockSearch: boolean = false;
  searchSchools;

  private placePredictionService;
  private currentPosition;
  backgroundColors: string[] = [];
  ignoreNextUpdate: boolean = false;

  constructor(private formService: FormsService) { }

  ngOnInit(): void {
  }

  onSearch(search: string) {
    if (search != undefined && !this.ignoreNextUpdate && search.length >= 4) {
      this.formService.querySchools(search).subscribe((res: any[]) => {
        if (res.length < 1) {
          this.showOptions = false;
        } else {
          this.searchSchools = res.map(school => {
            return {
              "name": school['schoolName'],
              "address": school["city"] + ", " + school["state"],
              "addressFull": {
                "road": school["schoolName"],
                "city": school["city"],
                "state": school["state"],
                "zip": school["zip"],
              },
              "schoolDiggerId": school['schoolid']
            };
          });
          this.showOptions = true;
        }
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

    this.name.emit(school.name);
    this.schoolDiggerId.emit(school.schoolDiggerId);
    this.address.emit(school.addressFull);
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

  textColor(item) {
    if (item.hovered) {
      return '#1F195E';
    } else {
      return '#555558';
    }
  }

}
