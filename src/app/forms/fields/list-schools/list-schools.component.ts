import {Component, EventEmitter, HostListener, Input, Output, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs';
import {FormsService} from '../../../services/forms.service';

declare const window;

@Component({
  selector: 'app-list-schools',
  templateUrl: './list-schools.component.html',
  styleUrls: ['./list-schools.component.scss']
})
export class ListSchoolsComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() startTabIndex: number = -1;
  @Input() autoFocus: boolean = false;
  @Input() showErrors: boolean = false;
  @ViewChildren('locationInput') locationInputs: QueryList<any>;

  @Output() schoolCount = new EventEmitter<number>();

  inputCount: number = 1;
  innerWidth: number;

  // Search Variables
  private placePredictionService;
  private currentPosition;
  backgroundColors: string[] = [];
  ignoreNextUpdate: boolean = false;
  searchInfo: any[] = [];

  constructor(private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private formService: FormsService
  ) {
    this.matIconRegistry.addSvgIcon(
      'minus',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/minus-icon.svg')
    );
  }

  ngOnInit(): void {
    this.addSchool();
    this.innerWidth = window.innerWidth;
  }

  get schools(): FormArray {
    return this.form.controls.schools as FormArray;
  }

  addSchool(): void {
    this.schools.push(
      this.fb.group({
        name: ['', Validators.required],
        population: ['', Validators.required],
        school_digger_id: [null]
      })
    );
    this.searchInfo.push({
      showOptions: false,
      mouseIn: false,
      blockSearch: false,
      searchSchools: new BehaviorSubject(null)
    });
    this.schoolCount.emit(this.searchInfo.length);
  }

  showRemove(): boolean {
    if (this.schools.length == 1) {
      return false;
    }
    return true;
  }

  removeSchool(index): void {
    let data = this.schools.removeAt(index);
    this.searchInfo.splice(index, 1);
    this.schoolCount.emit(this.searchInfo.length);
  }

  textColor(item) {
    if (item.hovered) {
      return '#1F195E';
    } else {
      return '#555558';
    }
  }

  onSearch(search: string, i: number) {
    if (search != undefined && !this.ignoreNextUpdate && search.length >= 4) {
      this.formService.querySchools(search).subscribe((res: any[]) => {
        if (res.length < 1) {
          this.searchInfo[i]['showOptions'] = false;
        } else {
          this.searchInfo[i]['searchSchools'] = res.map(school => {
            return {
              "name": school['schoolName'],
              "address": school['city'] + ', ' + school['state'],
              "school_digger_id": school['schoolid']
            };
          });
          this.searchInfo[i]['showOptions'] = true;
        }
      });
    } else {
      this.searchInfo[i]['showOptions'] = false;
    }
    if (this.ignoreNextUpdate) {
      this.ignoreNextUpdate = false;
    }
    this.schools.at(i).get('school_digger_id').setValue(null);
  }

  chooseSchool(school, i) {
    this.ignoreNextUpdate = true;
    this.searchInfo[i]['showOptions'] = false;
    this.schools.at(i).get('name').setValue(school.name);
    this.schools.at(i).get('school_digger_id').setValue(school.school_digger_id);
  }

  blur(i) {
    if (!this.searchInfo[i]['showOptions']) {
      return;
    }
    this.searchInfo[i]['showOptions'] = this.searchInfo[i]['mouseIn'];
  }

  showSearch(i) {
    return this.searchInfo[i]['showOptions'] && !this.searchInfo[i]['blockSearch'];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}
