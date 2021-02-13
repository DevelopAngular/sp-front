import {Component, HostListener, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs';
import {MapsAPILoader} from '@agm/core';

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
  @ViewChildren('locationInput') locationInputs: QueryList<any>;

  inputCount: number = 1;
  innerWidth: number;

  // Search Variables
  private placePredictionService;
  private currentPosition;
  backgroundColors: string[] = [];
  query = new BehaviorSubject<[any[], number]>(null);
  ignoreNextUpdate: boolean = false;
  searchInfo: any[] = [];

  constructor(private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private mapsApi: MapsAPILoader,
  ) {
    this.matIconRegistry.addSvgIcon(
      'minus',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/minus-icon.svg')
    );
  }

  ngOnInit(): void {
    this.addSchool();
    this.innerWidth = window.innerWidth;

    this.mapsApi.load().then((resource) => {
      this.currentPosition = new window.google.maps.LatLng({
        lat: 40.730610,
        lng: -73.935242
      });
      this.placePredictionService = new window.google.maps.places.AutocompleteService();
    });

    this.query
      .subscribe(
        (results) => {
          if (results !== null) {
            this.searchInfo[results[1]]['searchSchools'].next(results[0]);
            this.searchInfo[results[1]]['showOptions'] = true;
          }
        });
  }

  get schools(): FormArray {
    return this.form.controls.schools as FormArray;
  }

  addSchool(): void {
    this.schools.push(
      this.fb.group({
        name: ['', Validators.required],
        population: ['', Validators.required],
      })
    );
    this.searchInfo.push({
      showOptions: false,
      mouseIn: false,
      blockSearch: false,
      searchSchools: new BehaviorSubject(null)
    });
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
      this.placePredictionService.getPlacePredictions({
        location: this.currentPosition,
        input: search,
        radius: 100000,
        types: ['establishment']
      }, (predictions, status) => {
        this.query.next([predictions ? predictions : [], i]);
      });
    } else {
      this.query.next(null);
      this.searchInfo[i]['showOptions'] = false;
    }
    if (this.ignoreNextUpdate) {
      this.ignoreNextUpdate = false;
    }
  }

  chooseSchool(school, i) {
    this.ignoreNextUpdate = true;
    this.searchInfo[i]['showOptions'] = false;
    this.schools.at(i).get('name').setValue(school.terms[0].value);
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
